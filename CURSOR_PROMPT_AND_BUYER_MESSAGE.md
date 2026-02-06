# Copy-paste: Cursor prompt (to fix errors) + Message for buyer

Use the sections below as needed.

---

## 1. Prompt to give Cursor (to fix the errors)

Copy everything below the line and paste it into Cursor when you want it to fix these errors:

```
When opening the Lyven app (e.g. after scanning the QR code) we see two errors:

1) Runtime error: "An unknown error occurred while installing React Native DevTools" — Details: `/home/user/rork-app/node_modules/@react-native/debugger-shell/bin/react-native-debugger: error while loading shared libraries: libnspr4.so: cannot open shared object file: No such file or directory`. This happens in the dev environment (Linux). The app may crash or not load.

2) On the login screen we see "Backend não acessível" (backend not accessible). The backend URL shown is e.g. https://dev-07mpjpnu098wcqwfiffs1.rorktest.dev or http://localhost:3000. Users (buyers) see this when the app cannot reach the API.

Please:
- For error 1: Make React Native DevTools optional or document how to fix (e.g. install libnss3/libnspr4 on Linux, or disable DevTools so the app still runs).
- For error 2: Ensure the login screen shows a clear "Tentar novamente" (Try again) button that re-checks the backend, and a short user-facing message telling the buyer what to do (wait and retry, or contact support). Keep developer instructions (npm run start:all, .env IP) available but secondary.
- Add or update a short troubleshooting doc (what the team must do first, what the buyer should do) so we can send instructions to the buyer.
```

---

## 2. Message to send to the buyer

Copy the text below and send it to the buyer (e.g. by email or chat):

---

**If the app shows "Serviço temporariamente indisponível" or "Backend não acessível":**

1. Tap the **"Tentar novamente"** button on the screen.
2. If it still doesn’t work, wait 1–2 minutes and open the app again (or scan the QR code again).
3. If the problem continues, contact us [organizer/support] — we’ll check that our servers are running and fix any issues.

We’re sorry for the inconvenience.

---

**Se a app mostrar "Serviço temporariamente indisponível" ou "Backend não acessível":**

1. Toque no botão **"Tentar novamente"** no ecrã.
2. Se ainda não funcionar, espere 1–2 minutos e abra a app de novo (ou digitalize o código QR outra vez).
3. Se o problema continuar, contacte-nos [organizador/suporte] — vamos confirmar que os nossos servidores estão ligados e resolver o que for preciso.

Pedimos desculpa pelo incómodo.

---
