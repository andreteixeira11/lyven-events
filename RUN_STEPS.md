# Step-by-step: Run the LYVEN project

Use a terminal in the project folder: `C:\Users\DELL\Desktop\rork-lyven-main`

---

## Step 1: Open the project folder (if not already there)

```powershell
cd C:\Users\DELL\Desktop\rork-lyven-main
```

---

## Step 2: Install dependencies (first time or after pull)

```powershell
npm install
```

If you see peer dependency errors, use:

```powershell
npm install --legacy-peer-deps
```

---

## Step 3: Run the app

### Option A – In the browser (simplest)

```powershell
npm run start-expo-web
```

When Metro is ready, press **`w`** in the terminal to open the app in the browser, or open the URL shown (e.g. http://localhost:8081).

---

### Option B – On your phone (Expo Go)

1. Start with LAN (same Wi‑Fi as your PC):

   ```powershell
   npm run start-expo-lan
   ```

2. When the QR code appears, open **Expo Go** on your phone and scan it.
3. If the QR doesn’t work, in the terminal press **`s`** to switch to LAN, or type the URL shown (e.g. `exp://192.168.x.x:8081`) manually in Expo Go.

---

### Option C – If port 8081 is in use

```powershell
npm run start-expo-web-port
```

Then press **`w`** to open in the browser.

---

## Step 4: Backend (API) – **fix “No connection” when logging in**

The app talks to a **backend API**. If the backend is not reachable, login shows **“No internet connection”** (really: “cannot reach the server”).

**Option A – One command (backend + frontend in one terminal)**  
Run backend and Expo together so you don’t need two terminals:

```powershell
npm run start:all
```

This builds the backend, starts it on http://localhost:3000, and starts Expo. Use one terminal only.

**Option B – Backend only (then start Expo yourself)**  
From the project folder:

```powershell
npm run start:backend
```

Then in another terminal run `npm run start-expo` or `npm run start-expo-web`. The backend is built to `backend/dist/server.js` and run with Node (no tsx), so it avoids the previous TransformError.

**Option C – Use Rork (runs backend + frontend)**  
Try starting the app with Rork so the backend is running:

```powershell
npm run start
```

Then open the URL it shows (or press **w** for web). If Rork runs both backend and frontend, login should work.

**Option D – Use Rork hosted backend only**  
- Leave `EXPO_PUBLIC_RORK_API_BASE_URL` unset in `.env`. The app uses the default Rork URL.
- Make sure that Rork project/backend is running and the URL is correct.

**Option E – Run the backend locally (legacy / second terminal)**

1. In your **`.env`** file (project root) add (for browser/Expo web use `localhost`; for phone use your PC’s IP):

   ```text
   EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
   ```

   For phone (Expo Go) on the same Wi‑Fi, use your PC IP instead of `localhost`, e.g.:

   ```text
   EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.10:3000
   ```

2. Run the backend (in a **second terminal** in the project folder):

   - If you have **Bun**:  
     `bun run backend/hono.ts`  
     (or use your project’s backend start command if different.)
   - If the backend is started by **Rork**, run:  
     `npm run start`  
     (that may start both backend and frontend; then open the app URL it shows.)

3. **Restart the Expo app** (stop and run `npm run start-expo-web` or `start-expo-lan` again) so it picks up `.env` and can reach the backend.

---

## Quick reference

| Goal              | Command                    |
|-------------------|----------------------------|
| Web app           | `npm run start-expo-web`   |
| Phone (Expo Go)   | `npm run start-expo-lan`   |
| Different port    | `npm run start-expo-port`  |
| Clear cache start | `npm run start-expo-clear` |
