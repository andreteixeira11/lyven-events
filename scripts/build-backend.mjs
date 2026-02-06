/**
 * Bundle the backend into a single Node.js script so we can run it with plain Node
 * (no tsx), avoiding the react-native/TransformError when tsx loads the project.
 * Run from project root: node scripts/build-backend.mjs
 */
import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'backend', 'dist');

await esbuild.build({
  entryPoints: [path.join(projectRoot, 'backend', 'server.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: path.join(outDir, 'server.js'),
  sourcemap: true,
  // Resolve @/ to project root (backend tsconfig has baseUrl ".." and paths "@/*": ["./*"])
  alias: {
    '@': projectRoot,
  },
  // Don't bundle node_modules; require() them at runtime (run from project root)
  packages: 'external',
  // Avoid pulling in React Native / Expo
  external: ['react-native', 'react-native/*', 'expo', 'expo/*'],
  target: 'node18',
}).catch(() => process.exit(1));

console.log('✅ Backend built to backend/dist/server.js');
