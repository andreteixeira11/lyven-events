import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { initDatabase } from "./db/init";
import { seedDatabase } from "./db/seed";
import { seedNormalUser } from "./db/seed-normal-user";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Load env file from project root (env or .env) so RESEND_API_KEY etc. are available
const projectRoot = join(__dirname, "..");
for (const name of [".env", "env"]) {
  const p = join(projectRoot, name);
  if (existsSync(p)) {
    try {
      const content = readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eq = trimmed.indexOf("=");
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
            if (key && !process.env[key]) process.env[key] = value;
          }
        }
      }
      break;
    } catch (_) {}
  }
}

console.log('🚀 Initializing backend server...');

initDatabase().then(() => {
  console.log('✅ Database initialized successfully');
}).catch((err) => {
  console.error('❌ Database initialization failed:', err);
});

const app = new Hono();

app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error('❌ tRPC error on', path, ':', error);
    },
  })
);

app.get("/", (c) => {
  console.log('🏠 Root endpoint accessed');
  return c.json({ status: "ok", message: "API is running", timestamp: new Date().toISOString() });
});

app.get("/api", (c) => {
  console.log('📡 /api endpoint accessed');
  return c.json({ status: "ok", message: "API endpoint is working", timestamp: new Date().toISOString() });
});

app.get("/api/health", async (c) => {
  console.log('💚 Health check accessed');
  
  let dbStatus = "unknown";
  let dbError: string | null = null;
  
  try {
    const { db, users } = await import('./db/index');
    const result = await db.select().from(users).limit(1);
    dbStatus = "connected";
    console.log('✅ Database connection successful, users found:', result.length);
  } catch (error) {
    dbStatus = "error";
    dbError = error instanceof Error ? error.message : String(error);
    console.error('❌ Database connection failed:', error);
  }
  
  const response = { 
    status: dbStatus === "connected" ? "ok" : "degraded", 
    message: dbStatus === "connected" ? "Backend is running" : "Backend is running but database has issues",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      error: dbError
    },
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/health",
      test: "/api/test-login"
    }
  };
  
  console.log('💚 Sending health response:', JSON.stringify(response));
  
  return c.json(response);
});

app.get("/health", (c) => {
  console.log('💚 Health check accessed (alt route)');
  return c.json({ 
    status: "ok", 
    message: "Backend is running",
    timestamp: new Date().toISOString() 
  });
});

app.post("/api/test-login", async (c) => {
  console.log('🧪 [TEST] Rota de teste de login chamada');
  try {
    const body = await c.req.json();
    console.log('🧪 [TEST] Body recebido:', body);
    return c.json({ 
      status: "ok", 
      message: "Test endpoint working",
      received: body 
    });
  } catch (error) {
    console.error('❌ [TEST] Erro:', error);
    return c.json({ error: 'Failed to parse body' }, 400);
  }
});

app.post("/api/migrate", async (c) => {
  console.log('📋 Migration endpoint accessed');
  try {
    const { createClient } = await import('@libsql/client');
    
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
      throw new Error('Missing Turso credentials');
    }

    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        user_type TEXT NOT NULL CHECK(user_type IN ('normal', 'promoter', 'admin')),
        phone TEXT,
        interests TEXT NOT NULL,
        location_latitude REAL,
        location_longitude REAL,
        location_city TEXT,
        location_region TEXT,
        preferences_notifications INTEGER NOT NULL DEFAULT 1,
        preferences_language TEXT NOT NULL DEFAULT 'pt' CHECK(preferences_language IN ('pt', 'en')),
        preferences_price_min REAL NOT NULL DEFAULT 0,
        preferences_price_max REAL NOT NULL DEFAULT 1000,
        preferences_event_types TEXT NOT NULL,
        favorite_events TEXT NOT NULL DEFAULT '[]',
        event_history TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_onboarding_complete INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS promoters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL,
        verified INTEGER NOT NULL DEFAULT 0,
        followers_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS promoter_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        company_name TEXT NOT NULL,
        description TEXT NOT NULL,
        website TEXT,
        instagram_handle TEXT,
        facebook_handle TEXT,
        twitter_handle TEXT,
        is_approved INTEGER NOT NULL DEFAULT 0,
        approval_date TEXT,
        events_created TEXT NOT NULL DEFAULT '[]',
        followers TEXT NOT NULL DEFAULT '[]',
        rating REAL NOT NULL DEFAULT 0,
        total_events INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS promoter_auth (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        artists TEXT NOT NULL,
        venue_name TEXT NOT NULL,
        venue_address TEXT NOT NULL,
        venue_city TEXT NOT NULL,
        venue_capacity INTEGER NOT NULL,
        date TEXT NOT NULL,
        end_date TEXT,
        image TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('music', 'theater', 'comedy', 'dance', 'festival', 'other')),
        ticket_types TEXT NOT NULL,
        is_sold_out INTEGER NOT NULL DEFAULT 0,
        is_featured INTEGER NOT NULL DEFAULT 0,
        duration INTEGER,
        promoter_id TEXT NOT NULL REFERENCES promoters(id),
        tags TEXT NOT NULL,
        instagram_link TEXT,
        facebook_link TEXT,
        twitter_link TEXT,
        website_link TEXT,
        latitude REAL,
        longitude REAL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('draft', 'pending', 'published', 'cancelled', 'completed')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES events(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        ticket_type_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        qr_code TEXT NOT NULL,
        is_used INTEGER NOT NULL DEFAULT 0,
        validated_at TEXT,
        validated_by TEXT,
        purchase_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        valid_until TEXT NOT NULL,
        added_to_calendar INTEGER DEFAULT 0,
        reminder_set INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS advertisements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        target_url TEXT,
        type TEXT NOT NULL CHECK(type IN ('banner', 'card', 'sponsored_event')),
        position TEXT NOT NULL CHECK(position IN ('home_top', 'home_middle', 'search_results', 'event_detail')),
        is_active INTEGER NOT NULL DEFAULT 1,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        impressions INTEGER NOT NULL DEFAULT 0,
        clicks INTEGER NOT NULL DEFAULT 0,
        budget REAL NOT NULL,
        target_audience_interests TEXT,
        target_audience_age_min INTEGER,
        target_audience_age_max INTEGER,
        target_audience_location TEXT,
        promoter_id TEXT REFERENCES promoters(id),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS following (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        promoter_id TEXT REFERENCES promoters(id),
        artist_id TEXT,
        friend_id TEXT REFERENCES users(id),
        followed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS event_statistics (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES events(id),
        total_tickets_sold INTEGER NOT NULL DEFAULT 0,
        total_revenue REAL NOT NULL DEFAULT 0,
        ticket_type_stats TEXT NOT NULL DEFAULT '[]',
        daily_sales TEXT NOT NULL DEFAULT '[]',
        last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS push_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        token TEXT NOT NULL,
        platform TEXT NOT NULL CHECK(platform IN ('ios', 'android', 'web')),
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_used TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL CHECK(type IN ('event_approved', 'ad_approved', 'ticket_sold', 'event_reminder', 'follower', 'system', 'new_promoter_event')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS verification_codes (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        is_used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL CHECK(type IN ('bank_transfer', 'mbway', 'paypal', 'stripe')),
        is_primary INTEGER NOT NULL DEFAULT 0,
        account_holder_name TEXT,
        bank_name TEXT,
        iban TEXT,
        swift TEXT,
        phone_number TEXT,
        email TEXT,
        account_id TEXT,
        is_verified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
      CREATE INDEX IF NOT EXISTS idx_events_city ON events(venue_city);
      CREATE INDEX IF NOT EXISTS idx_events_promoter ON events(promoter_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_qr ON tickets(qr_code);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
    `);

    console.log('✅ Database tables created successfully on Turso!');
    return c.text('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.post("/api/seed", async (c) => {
  console.log('🌱 Seed endpoint accessed');
  try {
    await seedDatabase();
    console.log('✅ Database seeded successfully');
    return c.text('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.post("/seed-normal-user", async (c) => {
  console.log('🌱 Seed normal user endpoint accessed');
  try {
    await seedNormalUser();
    console.log('✅ Normal user seeded successfully');
    return c.json({ success: true, message: 'Normal user created successfully!' });
  } catch (error) {
    console.error('❌ Seed normal user error:', error);
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.get("/.well-known/apple-app-site-association", (c) => {
  console.log('🍎 Apple App Site Association requested');
  const aasa = {
    applinks: {
      apps: [],
      details: [
        {
          appID: "TEAM_ID.app.lyven",
          paths: ["/event/*"]
        }
      ]
    }
  };
  c.header('Content-Type', 'application/json');
  c.header('Access-Control-Allow-Origin', '*');
  return c.json(aasa);
});

app.get("/.well-known/assetlinks.json", (c) => {
  console.log('🤖 Android Asset Links requested');
  const assetlinks = [{
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "app.lyven",
      sha256_cert_fingerprints: [
        "SHA256_FINGERPRINT_AQUI"
      ]
    }
  }];
  c.header('Content-Type', 'application/json');
  c.header('Access-Control-Allow-Origin', '*');
  return c.json(assetlinks);
});

app.get("/event/:id", async (c) => {
  console.log('🎫 Event page accessed:', c.req.param('id'));
  try {
    const eventId = c.req.param('id');
    const { db, events } = await import('./db/index');
    const { eq } = await import('drizzle-orm');
    
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) {
      return c.html('<h1>Evento não encontrado</h1>');
    }

    let htmlTemplate = readFileSync(join(__dirname, 'views', 'event-page.html'), 'utf-8');
    
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('pt-PT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const ticketTypes = JSON.parse(event.ticketTypes);
    const minPrice = Math.min(...ticketTypes.map((t: any) => t.price));
    const maxPrice = Math.max(...ticketTypes.map((t: any) => t.price));
    const priceRange = minPrice === maxPrice ? `${minPrice}€` : `${minPrice}€ - ${maxPrice}€`;

    htmlTemplate = htmlTemplate.replace(/{{EVENT_ID}}/g, event.id);
    htmlTemplate = htmlTemplate.replace(/{{EVENT_TITLE}}/g, event.title);
    htmlTemplate = htmlTemplate.replace(/{{EVENT_DESCRIPTION}}/g, event.description || 'Descobre este incrível evento!');
    htmlTemplate = htmlTemplate.replace(/{{EVENT_IMAGE}}/g, event.image || '');
    htmlTemplate = htmlTemplate.replace(/{{EVENT_DATE}}/g, formattedDate);
    htmlTemplate = htmlTemplate.replace(/{{EVENT_VENUE}}/g, `${event.venueName}, ${event.venueCity}`);
    htmlTemplate = htmlTemplate.replace(/{{EVENT_PRICE}}/g, priceRange);

    return c.html(htmlTemplate);
  } catch (error) {
    console.error('❌ Event page error:', error);
    return c.html('<h1>Erro ao carregar evento</h1>');
  }
});

app.post("/api/stripe/webhook", async (c) => {
  console.log('💳 Stripe webhook received');
  try {
    const { getStripe, getStripeWebhookSecret } = await import('./lib/stripe');
    const stripe = getStripe();
    const webhookSecret = getStripeWebhookSecret();
    
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');
    
    if (!signature) {
      console.error('❌ Missing Stripe signature');
      return c.json({ error: 'Missing signature' }, 400);
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return c.json({ error: 'Invalid signature' }, 400);
    }

    console.log('✅ Stripe event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('🎉 Payment completed for session:', session.id);
        console.log('📦 Session metadata:', session.metadata);
        
        const { eventId, ticketTypeId, userId, quantity, pricePerTicket } = session.metadata || {};
        
        if (eventId && ticketTypeId && userId && quantity) {
          const { db, tickets, events } = await import('./db/index');
          const { eq } = await import('drizzle-orm');
          const { sendNotification } = await import('./lib/send-notification');
          
          const ticketId = `tkt-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          const qrCode = `${ticketId}-${session.payment_intent}`;
          
          const event = await db.query.events.findFirst({
            where: eq(events.id, eventId),
          });
          
          const validUntil = event ? event.date : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          
          await db.insert(tickets).values({
            id: ticketId,
            eventId,
            userId,
            ticketTypeId,
            quantity: parseInt(quantity),
            price: session.amount_total ? session.amount_total / 100 : parseFloat(pricePerTicket || '0') * parseInt(quantity),
            qrCode,
            isUsed: false,
            validUntil,
          });
          
          console.log('✅ Ticket created:', ticketId);
          
          await sendNotification({
            userId,
            type: 'ticket_sold',
            title: 'Compra Confirmada! 🎫',
            message: `O seu bilhete para "${event?.title || 'Evento'}" foi confirmado!`,
            data: { ticketId, eventId },
          });
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('💰 Payment intent succeeded:', paymentIntent.id);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('❌ Payment failed:', paymentIntent.id);
        break;
      }
      
      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Webhook error' }, 500);
  }
});

app.onError((err, c) => {
  console.error('❌ Backend error:', err);
  console.error('❌ Stack:', err.stack);
  return c.json({ 
    error: err.message, 
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  }, 500);
});

export default app;

// When run directly (e.g. bun run backend/hono.ts), start the server on port 3000
declare const Bun: { serve: (opts: { port: number; fetch: typeof app.fetch }) => void } | undefined;
if (typeof Bun !== 'undefined' && (import.meta as any).main) {
  (Bun as any).serve({ port: 3000, fetch: app.fetch });
  console.log('✅ Backend running at http://localhost:3000');
}
