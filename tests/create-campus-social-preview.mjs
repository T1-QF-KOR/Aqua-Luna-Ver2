// Browser QA only: a disposable in-memory save, isolated from player localStorage.
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url), context = { structuredClone }; context.window = context; vm.createContext(context);
for (const name of ['world', 'encounters', 'wardrobe', 'radio', 'social', 'outings', 'state']) vm.runInContext(await fs.readFile(new URL(`src/campus-v2/${name}.js`, root), 'utf8'), context);
const state = context.AquaState.initial('미리보기', '물고기');
Object.assign(state, { date: '2026-04-03', slot: 1, met: ['nari', 'daeun', 'seojin'], bond: { nari: 30, daeun: 30, seojin: 40 },
  seen: ['intro', 'prologue', 'entrance', 'daeunMeet', 'fair', 'seojinMeet', 'firstRadio', 'nariShake', 'nariVolume', 'daeunFirst', 'daeunPhoto', 'seojinPlaylist', 'seojinCup'],
  knowledge: 20, sensitivity: 20, fitness: 15 });
state.social.inventory.picks = 1;
for (let seed = 0; seed < 10000; seed++) {
  state.encounters.seed = seed;
  const plan = context.AquaEncounters.resolve(state);
  if (plan.locations.nari === 'roof' && plan.locations.daeun === 'river' && plan.locations.seojin === 'cafe') break;
}
const bootstrap = `/* Disposable browser QA; real player storage is never read or written. */\nconst qaMemory = new Map(${JSON.stringify([
  ['aqua-luna-campus-v2', JSON.stringify(state)], ['aqua-luna-campus-v2-prefs', JSON.stringify({ reduced: true, textSpeed: 0, showBond: true })]
])});\nObject.defineProperty(window, 'localStorage', { value: { getItem: key => qaMemory.get(key) ?? null, setItem: (key, value) => qaMemory.set(key, value) } });\n`;
await fs.writeFile(new URL('qa/campus-v2/social-preview.js', root), bootstrap);
const html = (await fs.readFile(new URL('campus.html', root), 'utf8')).replace('<head>', '<head><base href="../../"><script src="qa/campus-v2/social-preview.js"></script>')
  .replace('</body>', '<div style="position:fixed;bottom:4px;right:8px;z-index:50;font:10px sans-serif;color:#abc;pointer-events:none">QA 미리보기 · 임시 메모리 저장</div></body>');
await fs.writeFile(new URL('qa/campus-v2/social-preview.html', root), html);
console.log('Created isolated browser preview: qa/campus-v2/social-preview.html');
