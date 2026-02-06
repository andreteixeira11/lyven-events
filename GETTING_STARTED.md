# Lyven – Step-by-step getting started

Use this guide to run the Lyven app on your machine (browser or phone) with the backend (API) working.

---

## Prerequisites

- **Node.js** 18+ (and npm)
- **Git** (if cloning)
- A **Supabase** or **Turso** account (for the backend database)

---

## Step 1: Open the project folder

```powershell
cd C:\Users\DELL\Desktop\rork-lyven-main
```

(Or clone first: `git clone https://github.com/andreteixeira11/rork-lyven.git` then `cd rork-lyven`.)

---

## Step 2: Install dependencies

```powershell
npm install
```

If you see peer dependency warnings, you can use:

```powershell
npm install --legacy-peer-deps
```

---

## Step 3: Configure environment (`.env`)

Copy the example file and edit it:

```powershell
copy env.example .env
```

Then open `.env` and set at least one of the two options below.

### Option A – Use Supabase as the backend (recommended if you have Supabase)

1. In **Supabase Dashboard** → your project → **Project Settings** → **Database**.
2. Under **Connection string**, choose **URI**.
3. Copy the URI. It looks like:
   ```text
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your **database password** (the one you set when creating the project).
5. In `.env`, add or set:
   ```env
   SUPABASE_DATABASE_URL=postgresql://postgres.fmjgrewkknqvxqwkouqj:YOUR_DB_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   ```
6. Ensure the Lyven tables exist in Supabase (run `supabase/migrations/00001_lyven_schema.sql` in the Supabase SQL Editor if you haven’t already).

### Option B – Use Turso as the backend

1. Create a database at [Turso](https://turso.tech) and get the URL and auth token.
2. In `.env`, set:
   ```env
   TURSO_DATABASE_URL=libsql://your-database-name.turso.io
   TURSO_AUTH_TOKEN=your-auth-token-here
   ```
3. Run migrations (see `TURSO_SETUP.md` or `backend/db/migrate.ts`).

### Required for the app (both options)

- **Backend URL for the app** (so login works):
  ```env
  EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
  ```
  On a **phone (Expo Go)** on the same Wi‑Fi, use your PC’s IP instead of `localhost`, e.g.:
  ```env
  EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.5:3000
  ```

- **Resend** (for email verification codes):
  ```env
  RESEND_API_KEY=re_your_api_key_here
  RESEND_FROM_EMAIL=Lyven <noreply@yourdomain.com>
  ```
  (Use a verified domain in Resend, or leave `RESEND_FROM_EMAIL` unset for testing.)

---

## Step 4: Start the backend (API)

The app needs the backend running so that login and data work.

**Option 1 – Backend only (one terminal):**

```powershell
npm run start:backend
```

Wait until you see the server listening (e.g. on port 3000).

**Option 2 – Backend + frontend together (one terminal):**

```powershell
npm run start:all
```

This starts the backend and Expo; follow the terminal prompts to open the app.

---

## Step 5: Start the frontend (if not using `start:all`)

Open a **second terminal** in the same project folder.

**In the browser:**

```powershell
npm run start-expo-web
```

When Metro is ready, press **`w`** to open the app in the browser.

**On your phone (Expo Go):**

```powershell
npm run start-expo-lan
```

Then open **Expo Go** on your phone and scan the QR code (phone and PC must be on the same Wi‑Fi).

---

## Step 6: Check that it works

1. Open the app (browser or Expo Go).
2. If you see “Backend não acessível” or “No connection”, the app can’t reach the API. Check:
   - Backend is running (`npm run start:backend` in another terminal).
   - `.env` has `EXPO_PUBLIC_RORK_API_BASE_URL` set correctly (use your PC’s IP if testing on phone).
3. Try **Create account** or **Login** (with Resend configured, you should receive a verification code by email).

---

## Quick reference

| Goal                    | Command                    |
|-------------------------|----------------------------|
| Install deps            | `npm install`              |
| Backend only            | `npm run start:backend`    |
| Frontend only (web)     | `npm run start-expo-web`   |
| Frontend (phone/LAN)    | `npm run start-expo-lan`   |
| Backend + frontend      | `npm run start:all`        |

---

## Optional: Supabase RLS (Row Level Security)

If you use Supabase and want RLS policies so that authenticated users only see their own rows:

1. Open **Supabase Dashboard** → **SQL Editor**.
2. Paste and run the contents of **`supabase/RLS_POLICIES_FULL.sql`**.

See **`SUPABASE_AS_BACKEND.md`** for more on using Supabase as the backend database.
