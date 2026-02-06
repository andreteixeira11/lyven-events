/**
 * Load env file from project root before any code that reads process.env (e.g. db/index.ts).
 * Must be imported first in server.ts.
 * Works when run via tsx from backend/ or via node backend/dist/server.js from project root.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Try cwd, cwd/.., __dirname, __dirname/.., __dirname/../.. so we find .env from any run context
const candidates = [
  process.cwd(),
  join(process.cwd(), '..'),
  typeof __dirname !== 'undefined' ? __dirname : process.cwd(),
  typeof __dirname !== 'undefined' ? join(__dirname, '..') : process.cwd(),
  typeof __dirname !== 'undefined' ? join(__dirname, '..', '..') : process.cwd(),
];
let projectRoot = candidates[0];
for (const root of candidates) {
  const p = join(root, '.env');
  if (existsSync(p) || existsSync(join(root, 'env'))) {
    projectRoot = root;
    break;
  }
}
for (const name of ['.env', 'env']) {
  const p = join(projectRoot, name);
  if (existsSync(p)) {
    try {
      const content = readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eq = trimmed.indexOf('=');
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
            if (key && !process.env[key]) process.env[key] = value;
          }
        }
      }
      break;
    } catch (_) {}
  }
}
