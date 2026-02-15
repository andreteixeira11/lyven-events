import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

/* =====================================================
   CORS (APP MOBILE - PUBLICADA NAS STORES)
   Mobile não precisa restrição de origin
===================================================== */

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

/* =====================================================
   HEALTH CHECKS
===================================================== */

app.get("/", (c) =>
  c.json({
    status: "ok",
    message: "API is running",
    timestamp: new Date().toISOString(),
  })
);

app.get("/health", (c) =>
  c.json({
    status: "ok",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  })
);

/* =====================================================
   STATUS FLAGS
===================================================== */

let dbReady = false;
let dbError: string | null = null;
let bootPromise: Promise<void> | null = null;

/* =====================================================
   BOOT - DATABASE INIT
===================================================== */

bootPromise = (async () => {
  try {
    console.log("[boot] Initializing database...");
    const { initDatabase } = await import("./db/init");
    await initDatabase();
    dbReady = true;
    console.log("[boot] Database ready");
  } catch (err: any) {
    dbError = err?.message ?? String(err);
    console.error("[boot] Database init failed:", err);
  }
})();

/* =====================================================
   tRPC HANDLER (registered synchronously)
===================================================== */

import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

app.use("/trpc/*", async (c, next) => {
  if (!dbReady && bootPromise) {
    console.log("[trpc] Waiting for database boot to complete...");
    await bootPromise;
  }
  if (!dbReady) {
    console.error("[trpc] Database not ready:", dbError);
  }
  await next();
});

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error("[trpc] Error on", path, ":", error?.message);
    },
  })
);

/* =====================================================
   STATUS ENDPOINT
===================================================== */

app.get("/status", (c) =>
  c.json({
    status: "ok",
    trpcReady: true,
    dbReady,
    dbError,
    timestamp: new Date().toISOString(),
  })
);

/* =====================================================
   ADMIN PROTECTION (para seed)
===================================================== */

function requireAdmin(c: any) {
  const key = c.req.header("x-admin-key");
  return key && key === process.env.ADMIN_SECRET;
}

/* =====================================================
   TEST ENDPOINT
===================================================== */

app.post("/test-login", async (c) => {
  try {
    const body = await c.req.json();
    return c.json({
      status: "ok",
      message: "Test endpoint working",
      received: body,
    });
  } catch {
    return c.json({ error: "Failed to parse body" }, 400);
  }
});

/* =====================================================
   SEED (PROTEGIDO)
===================================================== */

app.post("/seed", async (c) => {
  if (!requireAdmin(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { seedDatabase } = await import("./db/seed");
    await seedDatabase();
    return c.text("Database seeded successfully!");
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
});

/* =====================================================
   STRIPE WEBHOOK
===================================================== */

app.post("/stripe/webhook", async (c) => {
  try {
    const { getStripe, getStripeWebhookSecret } = await import("./lib/stripe");

    const stripe = getStripe();
    const webhookSecret = getStripeWebhookSecret();

    const body = await c.req.text(); // IMPORTANTE: raw body
    const signature = c.req.header("stripe-signature");

    if (!signature) {
      return c.json({ error: "Missing signature" }, 400);
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch {
      return c.json({ error: "Invalid signature" }, 400);
    }

    if (event.type === "checkout.session.completed") {
      console.log("✅ Stripe payment completed");
      // Mantém aqui tua lógica de tickets
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook]", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Webhook error" },
      500
    );
  }
});

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.onError((err, c) => {
  console.error("[error]", err?.message);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
