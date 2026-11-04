// The mood table is keyed by exact line text, so an edited line silently loses
// its face. Every key must still appear in the authored sources.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const context = {}; context.window = context; vm.createContext(context);
vm.runInContext(await fs.readFile(new URL('src/campus-v2/moods.js', root), 'utf8'), context);
const files = (await fs.readdir(new URL('src/campus-v2/', root))).filter(f => f.endsWith('.js') && f !== 'moods.js');
const sources = (await Promise.all(files.map(f => fs.readFile(new URL(`src/campus-v2/${f}`, root), 'utf8')))).join('\n');
const { moods, of } = context.AquaMoods;
assert.deepEqual(Object.keys(moods).sort(), ['blush', 'sad', 'smile', 'surprised']);
const seen = new Set();
for (const [mood, lines] of Object.entries(moods)) for (const text of lines) {
  assert.ok(!seen.has(text), `Duplicate mood key: ${text}`); seen.add(text);
  const literal = text.replace(/\n/g, '\\n');
  assert.ok(sources.includes(literal) || sources.includes(literal.replace(/'/g, "\\'")), `Stale ${mood} line: ${text}`);
}
assert.equal(of({ text: [...seen][0], expr: 'neutral' }), 'neutral', 'An authored expr wins over the table');
assert.equal(of({ text: '표에 없는 대사' }), null);
vm.runInContext(await fs.readFile(new URL('src/campus-v2/wardrobe.js', root), 'utf8'), context);
const { catalog, expressions } = context.AquaWardrobe;
let faces = 0;
for (const [person, outfits] of Object.entries(expressions)) for (const [outfit, files] of Object.entries(outfits)) {
  assert.ok(catalog[person]?.[outfit], `Expression set for unknown outfit ${person}/${outfit}`);
  for (const file of Object.values(files)) { await fs.access(new URL(`assets/heroines/${file}`, root)); faces++; }
}
console.log(`PASS ${seen.size} mood lines still match their authored text; ${faces} expression images exist for known outfits`);
