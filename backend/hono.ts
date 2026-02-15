import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { Resend } from "resend";

const app = new Hono();

const verificationStore = new Map<string, { code: string; name: string; password: string; expiresAt: number }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

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

let dbReady = false;
let dbError: string | null = null;
let bootPromise: Promise<void> | null = null;

function startBoot() {
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    try {
      console.log("[boot] Initializing database...");
      const { ensureDbLoaded } = await import("./db/index");
      await ensureDbLoaded();
      console.log("[boot] DB adapter loaded");

      const { initDatabase } = await import("./db/init");
      await initDatabase();
      dbReady = true;
      console.log("[boot] Database ready");
    } catch (err: any) {
      dbError = err?.message ?? String(err);
      console.error("[boot] Database init failed:", dbError);
      dbReady = true;
    }
  })();
  return bootPromise;
}

startBoot();

const trpcHandler = trpcServer({
  router: appRouter,
  createContext,
  onError({ error, path }) {
    console.error("[trpc] Error on", path, ":", error?.message);
  },
});

app.use("/trpc/*", async (c, next) => {
  if (!dbReady && bootPromise) {
    console.log("[trpc] Waiting for database boot...");
    await bootPromise;
  }
  if (dbError) {
    console.warn("[trpc] DB had error but proceeding:", dbError);
  }
  await next();
});

app.use("/trpc/*", trpcHandler);

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

app.post("/send-verification-code", async (c) => {
  try {
    const body = await c.req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return c.json({ success: false, error: "Email, nome e palavra-passe são obrigatórios." }, 400);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Lyven <onboarding@resend.dev>";

    if (!apiKey) {
      console.error("[send-code] RESEND_API_KEY not configured");
      return c.json({ success: false, error: "Serviço de email não configurado. Contacte o suporte." }, 500);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    verificationStore.set(email.toLowerCase(), { code, name, password, expiresAt });

    console.log(`[send-code] Generated code for ${email}: ${code}`);

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Código de Verificação - Lyven",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366F1; margin: 0;">Lyven</h1>
          </div>
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; text-align: center;">
            <h2 style="color: #333; margin-top: 0;">Código de Verificação</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              Olá ${name}, bem-vindo(a) ao Lyven! Use o código abaixo para verificar o seu email:
            </p>
            <div style="background-color: #fff; border: 2px solid #6366F1; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #6366F1; letter-spacing: 5px;">${code}</span>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">Este código é válido por 5 minutos.</p>
          </div>
          <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
            <p>Se não solicitou este código, pode ignorar este email.</p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error("[send-code] Resend error:", result.error);
      return c.json({ success: false, error: result.error.message || "Falha ao enviar email." }, 500);
    }

    console.log("[send-code] Email sent successfully. Id:", result.data?.id);
    return c.json({ success: true, message: "Código enviado para o seu email." });
  } catch (err: any) {
    console.error("[send-code] Error:", err);
    return c.json({ success: false, error: err?.message || "Erro ao enviar código." }, 500);
  }
});

app.post("/verify-code", async (c) => {
  try {
    const body = await c.req.json();
    const { email, code } = body;

    if (!email || !code) {
      return c.json({ success: false, error: "Email e código são obrigatórios." }, 400);
    }

    const record = verificationStore.get(email.toLowerCase());

    if (!record) {
      console.log("[verify-code] No record found for:", email);
      return c.json({ success: false, error: "Código inválido ou expirado. Solicite um novo código." }, 400);
    }

    if (Date.now() > record.expiresAt) {
      console.log("[verify-code] Code expired for:", email);
      verificationStore.delete(email.toLowerCase());
      return c.json({ success: false, error: "Código expirado. Solicite um novo código." }, 400);
    }

    if (record.code !== code) {
      console.log("[verify-code] Invalid code for:", email, "expected:", record.code, "got:", code);
      return c.json({ success: false, error: "Código inválido. Tente novamente." }, 400);
    }

    verificationStore.delete(email.toLowerCase());
    console.log("[verify-code] Code verified successfully for:", email);

    return c.json({
      success: true,
      verified: true,
      userData: { email: record.name ? email : email, name: record.name, password: record.password },
    });
  } catch (err: any) {
    console.error("[verify-code] Error:", err);
    return c.json({ success: false, error: err?.message || "Erro ao verificar código." }, 500);
  }
});

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
