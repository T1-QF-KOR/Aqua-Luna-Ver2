// Follow purchased clothes through gifting, a date, persistence and rendered assets.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url), C = { structuredClone }; C.window = C; vm.createContext(C);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
for (const [,path] of html.matchAll(/<script defer src="([^"]+)">/g)) if (!path.endsWith('/game.js')) vm.runInContext(await fs.readFile(new URL(path, root), 'utf8'), C, { filename: path });
const { AquaWorld: W, AquaState: State, AquaSocial: Social, AquaWardrobe: Wardrobe, AquaEconomy: Economy } = C;
const checked = [], digests = new Set();
for (const item of Economy.clothes) {
  const s = State.initial(), id = item.person;
  Object.assign(s, { date: item.outfit === 'coat' ? '2026-12-05' : '2026-06-06', slot: 1, money: 250000, met: [id] });
  s.bond[id] = id === 'nari' ? 45 : 35;
  C.AquaRelationships.migrate(s);
  s.encounters.plan = { key: `${s.date}:1`, locations: { nari: null, daeun: null, seojin: null, [id]: 'river' }, scenes: {} };
  const before = Wardrobe.pick(s, id, { outing: { person: id } });
  assert.ok(Social.buy(s, item.id).ok);
  assert.equal(Wardrobe.pick(s, id, { outing: { person: id } }), before, 'Buying alone does not equip another person');
  assert.ok(Social.give(s, id, item.id, 'river').ok);
  assert.equal(s.social.inventory[item.id], 0);
  const dated = Social.invite(s, id, 'river', 'river'); assert.ok(dated.ok);
  const data = C.AquaOutings.build(s, dated.outing);
  assert.ok(data.lines.some(line => line.text?.includes(item.name)), `${item.id}: narrative acknowledges the actual clothes`);
  const scene = { id: `date-${id}-river`, title: data.title, background: data.background,
    queue: data.lines, index: 0, after: 'date', outing: dated.outing, wardrobe: { [id]: Wardrobe.pick(s, id, { outing: dated.outing }) } };
  s.scene = scene;
  const restored = State.restore(JSON.parse(JSON.stringify(s))); assert.ok(restored, `${item.id}: date save restores`);
  assert.equal(restored.giftClothes[id], item.outfit);
  const path = Wardrobe.source(restored, id, restored.scene);
  assert.equal(path, `assets/heroines/${id}-${item.outfit}-v3.png`);
  for (const expression of ['neutral','smile','happy','shy','sad','surprised','jealous','stage']) {
    const rendered = Wardrobe.source(restored, id, restored.scene, expression);
    assert.ok((await fs.stat(new URL(rendered, root))).size > 0, `Missing rendered image: ${rendered}`);
    assert.equal(rendered, path, 'Unavailable expressions retain the actual selected outfit');
  }
  const image = await fs.readFile(new URL(path, root));
  assert.equal(image.subarray(1,4).toString(), 'PNG'); assert.equal(image.readUInt32BE(16), 1024); assert.equal(image.readUInt32BE(20), 1536); assert.equal(image[25], 6, 'RGBA PNG');
  const digest = createHash('sha256').update(image).digest('hex'); assert.ok(!digests.has(digest), 'Each garment has its own illustration'); digests.add(digest);
  checked.push(item.id);
}
for (const [person,outfit,date] of [['seojin','coat','2026-07-10'], ['daeun','quarter-bermuda','2026-12-10']]) {
  const s = State.initial(); s.date = date; s.bond[person] = 60; s.giftClothes[person] = outfit;
  const outing = { person, destination: 'river', variant: 0 };
  assert.notEqual(Wardrobe.pick(s, person, { outing }), outfit, 'Seasonally unsuitable gift stays in the wardrobe');
  const data = C.AquaOutings.build(s, outing);
  const item = Economy.clothes.find(item => item.person === person && item.outfit === outfit);
  assert.ok(!data.lines.some(line => line.text?.includes(item.name)), 'Narration never claims a different outfit from the image');
}
const older = State.initial(); older.giftClothes.nari = 'unavailable-outfit';
assert.equal(Wardrobe.source(older, 'nari', { outing: { person: 'nari' }, wardrobe: { nari: 'unavailable-outfit' } }), 'assets/heroines/nari-campus-v2.png');
await fs.writeFile(new URL('qa/campus-v2/wardrobe-results.json', root), JSON.stringify({ passed: true, date: '2026-10-29', clothes: checked, distinctImages: digests.size, scope: 'Purchase, gift, date narration, save restore, seasonal selection, PNG headers and all expression source paths. Visual identity is reviewed separately.' }, null, 2) + '\n');
console.log(`PASS ${checked.length} gifted outfits: purchase, date, reload, valid images, seasonal exclusions`);
