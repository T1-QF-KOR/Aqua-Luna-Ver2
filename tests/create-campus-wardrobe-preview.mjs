// Disposable in-memory fixtures: actual game scenes, never real player saves.
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url), C = { structuredClone }; C.window = C; vm.createContext(C);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
for (const [,path] of html.matchAll(/<script defer src="([^"]+)">/g)) if (!path.endsWith('/game.js')) vm.runInContext(await fs.readFile(new URL(path, root), 'utf8'), C);
const fixtures = {};
for (const item of C.AquaEconomy.clothes) {
  const s = C.AquaState.initial('미리보기', '물고기'), id = item.person;
  Object.assign(s, { date: item.outfit === 'coat' ? '2026-12-05' : '2026-06-06', slot: 1, met: [id], bond: { nari: 50, daeun: 45, seojin: 45 } });
  s.giftClothes[id] = item.outfit;
  C.AquaRelationships.migrate(s);
  const outing = { person: id, destination: 'river', variant: 0, bonus: 0, date: s.date };
  const data = C.AquaOutings.build(s, outing);
  s.scene = { id: `date-${id}-river`, title: data.title, background: data.background, queue: data.lines,
    index: 0, after: 'date', outing, wardrobe: { [id]: C.AquaWardrobe.pick(s, id, { outing }) } };
  if (!C.AquaState.restore(s)) throw new Error(`Invalid preview ${item.id}`);
  fixtures[`${id}-${item.outfit}`] = s;
}
const bootstrap = `/* QA only: no access to the player's persistent saves. */
const wardrobeFixtures = ${JSON.stringify(fixtures)};
const fixture = wardrobeFixtures[new URLSearchParams(location.search).get('outfit')] || wardrobeFixtures['nari-casual'];
const wardrobeMemory = new Map([['aqua-luna-campus-v2', JSON.stringify(fixture)], ['aqua-luna-campus-v2-prefs', JSON.stringify({reduced:true,textSpeed:0})]]);
Object.defineProperty(window, 'localStorage', { value: { getItem:key=>wardrobeMemory.get(key)??null, setItem:(key,value)=>wardrobeMemory.set(key,value) } });
`;
await fs.writeFile(new URL('qa/campus-v2/wardrobe-preview.js', root), bootstrap);
await fs.writeFile(new URL('qa/campus-v2/wardrobe-preview.html', root), html.replace('<head>', '<head><base href="../../"><script src="qa/campus-v2/wardrobe-preview.js"></script>'));
console.log('Created qa/campus-v2/wardrobe-preview.html?outfit=<person>-<outfit>');
