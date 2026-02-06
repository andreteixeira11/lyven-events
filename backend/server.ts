/**
 * Start the backend API with Node.js (no Bun required).
 * Run: npx tsx backend/server.ts  or  npm run start:backend
 */
import './load-env'; // must run first so TURSO_* etc. are set before db/index.ts loads
import { serve } from '@hono/node-server';
import app from './hono';

const PORT = Number(process.env.PORT) || 3000;

serve(
  { fetch: app.fetch, port: PORT },
  (info) => {
    console.log('✅ Backend running at http://localhost:' + info.port);
  }
);
