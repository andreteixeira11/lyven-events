import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

/* =====================================================
   CORS (PRODUÇÃO SEGURA)
===================================================== */

const allowedOrigins = [
  "http://localhost:3000",
  "https://teu-dominio.com",
];

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "";
      return allowedOrigins.includes(origin) ? origin : "";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* =====================================================
   HEALTH
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
   STATUS
===================================================== */

let trpcReady = false;
let trpcError: string | null = null;
let dbReady = false;

/* =====================================================
   BOOT - tRPC
===================================================== */

(async () => {
  try {
    console.log("[boot] Loading tRPC...");

    const { trpcServer } = await import("@hono/trpc-server");
    const { appRouter } = await import("./trpc/app-router");
    const { createContext } = await import("./trpc/create-context");

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

    trpcReady = true;
    console.log("[boot] tRPC ready");
  } catch (err: any) {
    trpcError = err?.message ?? String(err);
    console.error("[boot] tRPC failed:", err);
  }
})();

/* =====================================================
   BOOT - DATABASE
===================================================== */

(async () => {
  try {
    console.log("[boot] Initializing database...");
    const { initDatabase } = await import("./db/init");
    await initDatabase();
    dbReady = true;
    console.log("[boot] Database ready");
  } catch (err) {
    console.error("[boot] Database init failed:", err);
  }
})();

app.get("/status", (c) =>
  c.json({
    status: "ok",
    trpcReady,
    trpcError,
    dbReady,
    timestamp: new Date().toISOString(),
  })
);

/* =====================================================
   PROTEÇÃO DE ROTAS ADMIN
===================================================== */

function requireAdmin(c: any) {
  const key = c.req.header("x-admin-key");
  if (key !== process.env.ADMIN_SECRET) {
    return false;
  }
  return true;
}

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
    } catch (err) {
      return c.json({ error: "Invalid signature" }, 400);
    }

    if (event.type === "checkout.session.completed") {
      console.log("✅ Stripe payment completed");
      // Mantém aqui tua lógica
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
