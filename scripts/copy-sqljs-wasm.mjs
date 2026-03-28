import fs from 'node:fs';
import path from 'node:path';

const source = path.join(
  process.cwd(),
  'node_modules',
  'sql.js',
  'dist',
  'sql-wasm.wasm',
);

const targetDir = path.join(process.cwd(), 'public');
const target = path.join(targetDir, 'sql-wasm.wasm');

if (!fs.existsSync(source)) {
  throw new Error(`sql.js wasm not found: ${source}`);
}

const sourceStat = fs.statSync(source);
if (!sourceStat.isFile()) {
  throw new Error(`Expected file but got non-file: ${source}`);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(source, target);

console.log(`sql-wasm.wasm copied to public/: ${target}`);
