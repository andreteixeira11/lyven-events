# How to run the app so login works (no “No connection”)

You need **two things** running: the **backend (API)** and the **app (Expo)**.  
Your **`.env`** file is set so the app calls the backend at **http://localhost:3000**.

---

## Step 1: Start the backend (first terminal)

In the project folder:

```powershell
cd C:\Users\DELL\Desktop\rork-lyven-main
npm run start:backend
```

Leave this running. You should see: **Backend running at http://localhost:3000**.

*(Uses Node.js + tsx – no Bun needed. First run may install tsx.)*

---

## Step 2: Start the app (second terminal)

Open a **new** terminal in the same folder:

```powershell
cd C:\Users\DELL\Desktop\rork-lyven-main
npm run start-expo-web
```

When Metro is ready, press **w** to open in the browser.

---

## Step 3: Try login

Go to the login screen, enter your details, and tap **To enter**.  
The app will call **http://localhost:3000** (from your `.env`). If the backend is running, login should work.

---

## If port 8081 is already in use (Expo)

When starting the app, if you see **“Port 8081 is being used”**:

- Choose **No** when asked “Use port null instead?” (so Expo picks another port, e.g. 8082), **or**
- Run the app on a different port:  
  `npm run start-expo-web-port`  
  then press **w** for web.

## If you prefer Rork (one command)

Use Rork to run both backend and app:

```powershell
npm run start
```

Then open the URL it shows (or press **w** for web). You can then comment out **EXPO_PUBLIC_RORK_API_BASE_URL** in **`.env`** so the app uses the default Rork backend URL.
