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
  const oldName = { 'clothes-nari-casual': '큰 후드 · 와이드 팬츠', 'clothes-nari-utility-cargo': '카키 야상 · 카고 팬츠',
    'clothes-nari-suede-mini': '갈색 재킷 · 미니스커트 · 부츠', 'clothes-nari-mini-pleats': '버건디 니트 · 플리츠 미니',
    'clothes-seojin-shirt':'하늘색 셔츠 · 검정 슬랙스', 'clothes-seojin-knit':'크림 니트 · 검정 바지', 'clothes-seojin-coat':'남색 롱코트 · 회색 목도리' }[item.id];
  if (oldName) s.scene.queue[0].text = `${id==='seojin'?'서진이':'나리가'} 내가 선물한 ${oldName} 차림으로 나왔다.`;
  const restored = State.restore(JSON.parse(JSON.stringify(s))); assert.ok(restored, `${item.id}: date save restores`);
  if (oldName) { assert.ok(restored.scene.queue[0].text.includes(item.name)); assert.ok(!restored.scene.queue[0].text.includes(oldName)); }
  assert.equal(restored.giftClothes[id], item.outfit);
  const path = Wardrobe.source(restored, id, restored.scene);
  const redesign = { 'nari-casual': 'nari-cardigan-v6.png', 'nari-utility-cargo': 'nari-pinafore-v6.png',
    'nari-suede-mini': 'nari-slate-jacket-v6.png', 'nari-mini-pleats': 'nari-lavender-knit-v6.png',
    'seojin-shirt':'seojin-blazer-v5.png','seojin-knit':'seojin-asymmetric-knit-v5.png','seojin-coat':'seojin-city-coat-v5.png',
    'daeun-denim-mini':'daeun-denim-mini-v7.png','daeun-layered-denim':'daeun-layered-denim-v7.png','daeun-quarter-bermuda':'daeun-quarter-bermuda-v7.png' };
  assert.equal(path, `assets/heroines/${redesign[`${id}-${item.outfit}`] || `${id}-${item.outfit}-v3.png`}`);
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
const winterDaeun = State.initial(); winterDaeun.date = '2026-12-18';
const campusDaeun = State.initial(); campusDaeun.date = '2026-03-10';
assert.equal(Wardrobe.source(campusDaeun, 'daeun', { id: 'daeunMeet' }, 'happy'), 'assets/heroines/daeun-campus-happy-v8.png');
assert.equal(Wardrobe.source(campusDaeun, 'daeun', { id: 'daeunMeet' }, 'sad'), 'assets/heroines/daeun-campus-sad-v8.png');
assert.equal(Wardrobe.source(campusDaeun, 'daeun', { id: 'daeunMeet' }, 'jealous'), 'assets/heroines/daeun-campus-v7.png', 'A face without art keeps the base sprite');
assert.equal(Wardrobe.source(campusDaeun, 'daeun', { id: 'fair' }, 'happy'), 'assets/heroines/daeun-rehearsal-v7.png');
assert.ok(C.AQUA_SCENES.daeunMeet.lines.some(line => line.speaker === '다은' && line.expr === 'happy'));
const smileImage = await fs.readFile(new URL('assets/heroines/daeun-campus-happy-v8.png', root));
assert.equal(smileImage.readUInt32BE(16), 1024); assert.equal(smileImage.readUInt32BE(20), 1536); assert.equal(smileImage[25], 6, 'Expression is an RGBA PNG');
assert.equal(Wardrobe.pick(winterDaeun, 'daeun', { id: 'daeunConfess' }), 'winter', 'Confession sprite matches its coat and CG');
assert.equal(Wardrobe.pick(winterDaeun, 'daeun', { returnPlace: 'river' }), 'winter', 'Winter outings have warm clothes');
assert.equal(Wardrobe.pick(winterDaeun, 'daeun', { returnPlace: 'club' }), 'rehearsal', 'Indoor band practice keeps rehearsal clothes');
assert.equal(Wardrobe.source(older, 'nari', { outing: { person: 'nari' }, wardrobe: { nari: 'unavailable-outfit' } }), 'assets/heroines/nari-campus-v6.png');
assert.ok(Economy.clothes.find(item => item.id === 'clothes-nari-casual').name.includes('라벤더'));
assert.ok(Economy.clothes.find(item => item.id === 'clothes-nari-utility-cargo').name.includes('뷔스티에'));
assert.ok(Economy.clothes.find(item => item.id === 'clothes-nari-suede-mini').name.includes('슬레이트'));
assert.ok(Economy.clothes.find(item => item.id === 'clothes-nari-mini-pleats').name.includes('라벤더 그레이'));
await fs.writeFile(new URL('qa/campus-v2/wardrobe-results.json', root), JSON.stringify({ passed: true, date: '2026-10-30', clothes: checked, distinctImages: digests.size, scope: 'Purchase, gift, date narration, save restore, seasonal selection, PNG headers and all expression source paths, including the two user-requested Nari redesigns. Visual identity is reviewed separately.' }, null, 2) + '\n');
console.log(`PASS ${checked.length} gifted outfits: purchase, date, reload, valid images, seasonal exclusions`);
