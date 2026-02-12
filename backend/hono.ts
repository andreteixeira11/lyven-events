import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.get("/", (c) => c.json({ status: "ok", message: "API is running", timestamp: new Date().toISOString() }));
app.get("/health", (c) => c.json({ status: "ok", message: "Backend is running", timestamp: new Date().toISOString() }));
app.get("/health", (c) => c.json({ status: "ok", message: "Backend is running", timestamp: new Date().toISOString() }));

let trpcReady = false;
let trpcError: string | null = null;
let dbReady = false;

(async () => {
  try {
    console.log("[boot] Loading tRPC...");
    const { trpcServer } = await import("@hono/trpc-server");
    const { appRouter } = await import("./trpc/app-router");
    const { createContext } = await import("./trpc/create-context");

    app.use("/trpc/*", trpcServer({
      endpoint: "/api/trpc",
      router: appRouter,
      createContext,
      onError({ error, path }: { error: any; path: string | undefined }) {
        console.error("[trpc] Error on", path, ":", error?.message || error);
      },
    }));
    trpcReady = true;
    console.log("[boot] tRPC ready");
  } catch (err: any) {
    trpcError = err?.message ?? String(err);
    console.error("[boot] tRPC failed:", err);
  }
})();

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

app.get("/status", (c) => c.json({ status: "ok", trpcReady, trpcError, dbReady, timestamp: new Date().toISOString() }));

app.post("/test-login", async (c) => {
  try {
    const body = await c.req.json();
    return c.json({ status: "ok", message: "Test endpoint working", received: body });
  } catch (error) {
    return c.json({ error: "Failed to parse body" }, 400);
  }
});

app.post("/seed", async (c) => {
  try {
    const { seedDatabase } = await import("./db/seed");
    await seedDatabase();
    return c.text("Database seeded successfully!");
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.post("/seed-normal-user", async (c) => {
  try {
    const { seedNormalUser } = await import("./db/seed-normal-user");
    await seedNormalUser();
    return c.json({ success: true, message: "Normal user created successfully!" });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.get("/.well-known/apple-app-site-association", (c) => {
  c.header("Content-Type", "application/json");
  return c.json({ applinks: { apps: [], details: [{ appID: "TEAM_ID.app.lyven", paths: ["/event/*"] }] } });
});

app.get("/.well-known/assetlinks.json", (c) => {
  c.header("Content-Type", "application/json");
  return c.json([{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: "app.lyven", sha256_cert_fingerprints: ["SHA256_FINGERPRINT_AQUI"] } }]);
});

app.get("/event/:id", async (c) => {
  try {
    const eventId = c.req.param("id");
    const { db, events } = await import("./db/index");
    const { eq } = await import("drizzle-orm");
    if (!db) return c.html("<h1>Database not available</h1>");
    const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
    if (!event) return c.html("<h1>Evento não encontrado</h1>");
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString("pt-PT", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const ticketTypes = JSON.parse(event.ticketTypes);
    const prices = ticketTypes.map((t: any) => t.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = minPrice === maxPrice ? `${minPrice}€` : `${minPrice}€ - ${maxPrice}€`;
    return c.html(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${event.title}</title></head><body><h1>${event.title}</h1><p>${formattedDate}</p><p>${event.venueName}, ${event.venueCity}</p><p>${priceRange}</p><p>${event.description || ""}</p></body></html>`);
  } catch (error) {
    console.error("[event-page]", error);
    return c.html("<h1>Erro ao carregar evento</h1>");
  }
});

app.post("/stripe/webhook", async (c) => {
  try {
    const { getStripe, getStripeWebhookSecret } = await import("./lib/stripe");
    const stripe = getStripe();
    const webhookSecret = getStripeWebhookSecret();
    const body = await c.req.text();
    const signature = c.req.header("stripe-signature");
    if (!signature) return c.json({ error: "Missing signature" }, 400);
    let event;
    try { event = stripe.webhooks.constructEvent(body, signature, webhookSecret); } catch (err) { return c.json({ error: "Invalid signature" }, 400); }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { eventId, ticketTypeId, userId, quantity, pricePerTicket } = session.metadata || {};
      if (eventId && ticketTypeId && userId && quantity) {
        const { db, tickets, events: eventsTable } = await import("./db/index");
        const { eq } = await import("drizzle-orm");
        const { sendNotification } = await import("./lib/send-notification");
        const ticketId = `tkt-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const qrCode = `${ticketId}-${session.payment_intent}`;
        const ev = await db.query.events.findFirst({ where: eq(eventsTable.id, eventId) });
        const validUntil = ev ? ev.date : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        await db.insert(tickets).values({ id: ticketId, eventId, userId, ticketTypeId, quantity: parseInt(quantity), price: session.amount_total ? session.amount_total / 100 : parseFloat(pricePerTicket || "0") * parseInt(quantity), qrCode, isUsed: false, validUntil });
        await sendNotification({ userId, type: "ticket_sold", title: "Compra Confirmada! 🎫", message: `O seu bilhete para "${ev?.title || "Evento"}" foi confirmado!`, data: { ticketId, eventId } });
      }
    }
    return c.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook]", error);
    return c.json({ error: error instanceof Error ? error.message : "Webhook error" }, 500);
  }
});

app.onError((err, c) => {
  console.error("[error]", err?.message);
  return c.json({ error: err.message }, 500);
});

export default app;
