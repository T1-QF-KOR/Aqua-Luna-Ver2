// Compare a Windows submission candidate with the current runtime sources.
// This verifies packaging, not actual Windows/WebView2 execution.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const candidate = path.resolve(process.argv[2] || path.join(root, 'output/AquaLuna-Windows-candidate-2026-11-04-v14'));
const game = path.join(candidate, 'game');
const collections = ['src/campus-v2', 'assets/campus-v2', 'assets/heroines', 'assets/environment', 'assets/fonts', 'assets/ui', 'assets/audio'];

async function files(base, relative = '') {
  const entries = await readdir(path.join(base, relative), { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const name = path.join(relative, entry.name);
    if (entry.isDirectory()) results.push(...await files(base, name));
    else if (entry.isFile()) results.push(name);
    else throw new Error(`Unsupported non-file entry: ${name}`);
  }
  return results;
}
async function digest(filename) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest('hex');
}

const errors = [];
try {
  const exe = await readFile(path.join(candidate, 'AquaLuna.exe'));
  const offset = exe.length >= 64 ? exe.readUInt32LE(0x3c) : exe.length;
  if (exe.toString('ascii', 0, 2) !== 'MZ' || offset + 6 > exe.length ||
      exe.toString('binary', offset, offset + 4) !== 'PE\0\0' || exe.readUInt16LE(offset + 4) !== 0x8664)
    errors.push('AquaLuna.exe is not a Windows x64 PE executable');
} catch (error) { errors.push(`Executable unavailable: ${error.message}`); }

const expected = ['index.html'];
for (const collection of collections) {
  try { expected.push(...(await files(root, collection))); }
  catch (error) { errors.push(`Source collection unavailable: ${collection}: ${error.message}`); }
}
for (const relative of expected) {
  const source = path.join(root, relative), packed = path.join(game, relative);
  try {
    if (!(await stat(packed)).isFile() || await digest(source) !== await digest(packed)) errors.push(`Missing or stale: ${relative}`);
  } catch { errors.push(`Missing or unreadable: ${relative}`); }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS Windows x64 executable header and ${expected.length} runtime files match the current project.`);
  console.log('Not verified: actual Windows startup, WebView2, audio, UI, save/load, and offline use.');
}
