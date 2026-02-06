# "Cannot reach the server" when logging in – fix

The app is trying to call the backend API and the request is failing. Do these steps **in order**.

---

## 1. Start the backend (must be running first)

Open a terminal and run:

```powershell
cd C:\Users\DELL\Desktop\rork-lyven-main
npm run start:backend
```

**Leave this terminal open.** You must see:

```text
✅ Backend running at http://localhost:3000
```

If you don’t see that, the backend is not running and login will fail.

---

## 2. Check your `.env` file

In the project root (same folder as `package.json`) you must have a file named **`.env`** with:

```text
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
```

No spaces around `=`. No quotes around the URL.

---

## 3. Restart the Expo app so it loads `.env`

Expo reads `.env` only when the dev server **starts**. If you added or changed `.env` after starting Expo, you must restart it.

1. In the terminal where Expo is running, press **Ctrl+C** to stop it.
2. Start it again:

   ```powershell
   npm run start-expo-web
   ```

   Or, to clear cache and force reload of env:

   ```powershell
   npx expo start --web --clear
   ```

3. When Metro is ready, press **w** to open in the browser.

---

## 4. Test the backend in the browser

Before trying login again, open in your browser:

**http://localhost:3000**

You should see something like:

```json
{"status":"ok","message":"API is running","timestamp":"..."}
```

If that page doesn’t load, the backend is not running or not reachable. Go back to step 1.

---

## 5. Try login again

With the backend running and Expo restarted (and, if needed, cache cleared), try logging in again.

---

## What the app is using

When you get “Cannot reach the server”, the message now shows which URL the app is using, for example:

- `Backend: http://localhost:3000` → app is configured for local backend. Make sure step 1 and 4 are OK.
- `Backend: https://rork.app/...` → app is **not** using your `.env`. Do step 2 and 3 again (restart Expo, maybe with `--clear`).
