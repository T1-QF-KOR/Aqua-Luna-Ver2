// Real entrypoint modules: encounter reachability, privacy, and conditional narrative.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url), C = { structuredClone }; C.window = C; vm.createContext(C);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
for (const [, path] of html.matchAll(/<script defer src="([^"]+)">/g)) if (!path.endsWith('/game.js')) vm.runInContext(await fs.readFile(new URL(path, root), 'utf8'), C);
const W = C.AquaWorld, Story = C.AquaStory, Autumn = C.AquaAutumn;
const state = () => {
  const s = C.AquaState.initial(); s.met = ['nari', 'daeun', 'seojin']; s.bond = { nari: 60, daeun: 60, seojin: 60 };
  s.knowledge = s.fitness = s.sensitivity = 30; s.club = 'radio';
  s.seen = Object.keys(C.AQUA_SCENES); s.flags = { questionedRadio: true, daeunJoinedBand: true, knowsOffer: true };
  C.AquaRelationships.migrate(s); return s;
};
const reached = [];
for (const target of Autumn.rules) {
  const s = state(); s.seen = s.seen.filter(id => id !== target.id);
  let found = false;
  for (let date = target.from; date <= target.to && !found; date = W.addDays(date, 1)) {
    s.date = date;
    for (const slot of target.slot === undefined ? [1, 2] : [target.slot]) {
      s.slot = slot;
      for (let seed = 0; seed < 50 && !found; seed++) {
        s.encounters = { seed };
        const plan = C.AquaEncounters.resolve(s);
        if (plan.scenes[target.place] !== target.id) continue;
        found = true; assert.ok(Story.available(s, target.place).some(rule => rule.id === target.id));
        assert.ok(C.AquaState.restore(JSON.parse(JSON.stringify(s))), `${target.id}: restorable`);
        for (const id of W.routeOwners[target.id]) assert.equal(plan.locations[id], target.place);
      }
      if (found) break;
    }
  }
  assert.ok(found, `${target.id} cannot occur through the actual itinerary`); reached.push(target.id);
}
for (const id of Object.keys(Autumn.scenes)) {
  const s = state(); s.date = '2026-10-20';
  const data = Story.build(id, s);
  const walk = lines => { for (const line of lines) {
    assert.ok(line.text || line.choice, `${id}: empty line`);
    if (line.choice) { assert.ok(line.choice.length, `${id}: empty choice`); for (const choice of line.choice) walk(choice.lines || []); }
  } };
  walk(data.lines);
}
const hidden = state(); hidden.met = []; hidden.flags = {}; hidden.date = '2026-10-28';
const unknownFestival = Story.build('autumnFestival', hidden);
assert.equal(unknownFestival.lines.find(line => line.choice).choice.length, 1);
assert.ok(!unknownFestival.lines.some(line => line.text?.includes('서진이 객석')));
for (const disclosed of ['questionedRadio', 'boothPeeked']) {
  const s = state(); s.flags = { [disclosed]: true };
  const lines = Story.build('nariAngry', s).lines;
  assert.equal(lines.some(line => line.text?.includes('그날 강변')), disclosed === 'questionedRadio');
  assert.equal(lines.some(line => line.text?.includes('부스 커튼.')), disclosed === 'boothPeeked');
}
for (const gate of C.AquaRelationships.gates) assert.ok(Story.rules.find(rule => rule.id === gate.id).to >= '2027-02-24');
assert.ok(Story.rules.find(rule => rule.id === 'crossRain').to >= '2027-02-24', 'The umbrella gate must retain its prerequisite');
// Extra autumn radio writing must be present in the shipped broadcast builder.
for (const episode of W.broadcasts.slice(12, 21)) {
  const s = state(); s.date = episode.date; s.slot = 3;
  const data = C.AquaRadio.build(s, episode);
  assert.ok(data.lines.filter(line => line.speaker === '루나').length >= 7, `Short broadcast ${episode.number}`);
}
await fs.writeFile(new URL('qa/campus-v2/autumn-results.json', root), JSON.stringify({ passed: true, reachableEncounters: reached,
  authoredScenes: Object.keys(Autumn.scenes), scope: 'Production modules, seeded itinerary and conditional story compilation. Runtime flows are checked separately; no browser layout claim.' }, null, 2) + '\n');
console.log(`PASS ${reached.length} reachable autumn encounters, ${Object.keys(Autumn.scenes).length} scenes, conditional knowledge, gate prerequisites and nine broadcasts`);
