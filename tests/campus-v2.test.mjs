// Pure gameplay contract tests. Browser layout and input are verified separately.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const context = { structuredClone, console };
context.window = context;
vm.createContext(context);
for (const file of ['world', 'encounters', 'wardrobe', 'radio', 'social', 'outings', 'state', 'scenes', 'semester']) {
  vm.runInContext(await fs.readFile(new URL(`src/campus-v2/${file}.js`, root), 'utf8'), context, { filename: `${file}.js` });
}
const { AquaWorld: W, AquaRadio: R, AquaState: State, AquaStory: Story, AquaSocial: S } = context;
const checks = [];
function test(name, fn) { fn(); checks.push(name); console.log(`PASS ${name}`); }
const fresh = () => { const state = State.initial('테스트', '물고기'); state.encounters.seed = 0; return state; };
const json = value => JSON.stringify(value);
function locate(s, expected, scenes = {}) {
  for (let seed = 0; seed < 10000; seed++) {
    s.encounters.seed = seed;
    const plan = context.AquaEncounters.resolve(s);
    if (Object.entries(expected).every(([id, place]) => plan.locations[id] === place) && Object.entries(scenes).every(([place, id]) => plan.scenes[place] === id)) return;
  }
  assert.fail('No itinerary satisfies the test scenario');
}

test('Academic calendar uses authored dates, holidays, vacations, and UTC-safe arithmetic', () => {
  assert.equal(W.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(W.hasClass('2026-03-03'), true);
  for (const date of ['2026-03-02', '2026-05-05', '2026-05-25', '2026-06-03', '2026-06-20', '2026-09-24', '2026-12-19']) assert.equal(W.hasClass(date), false, date);
  assert.equal(W.hasClass('2026-09-01'), true);
  assert.equal(W.term('2026-08-31'), '여름방학');
  assert.equal(W.calendarMonth(2027, 2).length, 28);
  assert.equal(W.validDate('2026-02-30'), false);
});
test('Thirty broadcasts preserve exact regular and special dates, including holiday Thursday', () => {
  assert.equal(W.broadcasts.length, 30);
  assert.equal(new Set(W.broadcasts.map(e => e.date)).size, 30);
  assert.equal(W.broadcasts.filter(e => e.special).length, 2);
  assert.equal(W.broadcasts.filter(e => e.date >= '2026-04-02' && e.date <= '2026-06-18').length, 12);
  assert.ok(W.broadcasts.every(e => W.weekday(e.date) === 4));
  assert.equal(W.episodeOn('2026-09-24').number, 16);
  assert.equal(W.episodeOn('2026-07-02'), null);
  assert.equal(W.episodeOn('2027-02-25').special, true);
});
test('Map never leaks an unknown heroine or the concealed Thursday broadcaster', () => {
  const s = fresh(); s.date = '2026-04-09'; s.slot = 2;
  assert.equal(W.presentAt(s, 'radio').length, 0);
  s.met = ['nari', 'daeun', 'seojin'];
  for (const place of ['class', 'library', 'dining', 'cafe', 'club', 'studio', 'radio', 'roof', 'river', 'concert']) assert.ok(!W.presentAt(s, place).includes('nari'));
  s.date = '2026-04-08';
  assert.equal(json(W.scheduledAt(s, 'cafe')), json(['nari', 'seojin']));
  const locations = ['class', 'library', 'dining', 'cafe', 'club', 'studio', 'radio', 'roof', 'river', 'concert'];
  assert.ok(locations.filter(place => W.presentAt(s, place).includes('nari')).length <= 1);
  s.date = '2026-05-25'; s.slot = 1;
  assert.equal(W.presentAt(s, 'roof').length, 0);
});
test('Daily talk respects heroine multipliers, integer minimum, scene caps, and existing progress', () => {
  const s = fresh();
  W.recurringBond(s, 'nari', 4); assert.equal(s.bond.nari, 2);
  W.recurringBond(s, 'nari', 1); assert.equal(s.bond.nari, 3);
  for (let i = 0; i < 50; i++) W.recurringBond(s, 'nari', 4);
  assert.equal(s.bond.nari, 15);
  s.seen.push('nariVolume'); W.recurringBond(s, 'nari', 4);
  assert.equal(s.bond.nari, 17);
  s.bond.nari = 30; W.recurringBond(s, 'nari', 4); assert.equal(s.bond.nari, 30);
  W.recurringBond(s, 'seojin', 4); assert.equal(s.bond.seojin, 3);
});
test('Drafts, canceling, and unscheduled weeks do not submit a letter or change anonymous affection', () => {
  const s = fresh(); s.date = '2026-03-04'; s.slot = 3;
  const before = json(s);
  const draft = R.draftFor(s, '고민', 'honest');
  assert.equal(json(s), before);
  assert.equal(R.send(s, draft).ok, false);
  assert.equal(s.letters.length, 0); assert.equal(s.radio.anonymous, 0);
  s.date = '2026-07-06'; assert.ok(R.letterReason(s).includes('방학'));
});
test('A sent letter freezes its actual subject, alias, and text; one per week', () => {
  const s = fresh(); s.date = '2026-04-06'; s.slot = 3; s.met = ['nari', 'daeun']; s.bond.daeun = 20;
  const draft = R.draftFor(s, '신경 쓰이는 사람', 'honest');
  assert.equal(draft.target, 'daeun'); assert.ok(draft.text.includes('단톡방'));
  assert.equal(R.send(s, draft).ok, true); assert.equal(s.radio.anonymous, 4);
  assert.equal(R.send(s, draft).ok, false);
  s.bond.nari = 50; s.nickname = '다른별명';
  assert.equal(s.letters[0].alias, '물고기'); assert.equal(s.letters[0].target, 'daeun');
});
test('Broadcast reading occurs independently from player listening and settles rival reaction exactly once', () => {
  const s = fresh(); s.date = '2026-04-06'; s.slot = 3; s.met = ['daeun']; s.bond.nari = 10;
  R.send(s, R.draftFor(s, '신경 쓰이는 사람', 'honest'));
  assert.equal(s.letters[0].read, false); assert.equal(R.markHeard(s, s.letters[0].id), false);
  s.date = '2026-04-09'; R.air(s);
  assert.equal(s.letters[0].read, true); assert.equal(s.letters[0].heard, false);
  assert.equal(s.bond.nari, 9); assert.equal(s.radio.anonymous, 6);
  const after = json(s); R.air(s); assert.equal(json(s), after);
  assert.equal(R.markHeard(s, s.letters[0].id), true);
  assert.equal(R.markHeard(s, s.letters[0].id), false);
  assert.equal(s.letters[0].heardAt, '2026-04-09');
});
test('Partial listening, finishing, repeated finishing, and replay produce distinct idempotent records', () => {
  const s = fresh(); s.date = '2026-04-09'; s.slot = 3;
  const ep = W.episodeOn(s.date), scene = R.build(s, ep);
  assert.equal(s.radio.listened.length, 0);
  assert.equal(scene.lines.some(l => l.cast?.length), false);
  R.finish(s, ep.id); R.finish(s, ep.id); assert.equal(s.radio.listened.length, 1);
  const after = json(s), replay = R.build(s, ep, true);
  assert.equal(json(s), after);
  assert.equal(replay.lines.some(l => l.effect || l.choice?.some(o => o.effect)), false);
});
test('Hiatus emits a rerun without reading letters, counting a new broadcast, or granting clues', () => {
  const s = fresh(); s.date = '2026-04-13'; s.slot = 3;
  R.send(s, R.draftFor(s, '今日', 'plain')); // Invalid topic is rejected.
  assert.equal(s.letters.length, 0);
  R.send(s, R.draftFor(s, '고민', 'plain'));
  s.radio.hiatusUntil = '2026-04-30'; s.date = '2026-04-16';
  const ep = W.episodeOn(s.date), scene = R.build(s, ep);
  assert.equal(scene.rerun, true); assert.equal(s.letters[0].read, false);
  R.finish(s, ep.id); assert.equal(s.radio.listened.length, 0);
  assert.equal(R.isHiatus(s, W.episodeOn('2026-11-19')), false);
});
test('Anonymous heroine letters are recognized only from actual prior knowledge', () => {
  const s = fresh(); s.date = '2026-05-14'; s.slot = 3;
  const ep = W.episodeOn(s.date);
  assert.equal(R.build(s, ep).lines.some(l => l.effect?.flag === 'recognizedSeojinLetter'), false);
  s.seen.push('seojinPlaylist');
  assert.equal(R.build(s, ep).lines.some(l => l.effect?.flag === 'recognizedSeojinLetter'), true);
  s.date = '2026-06-11'; s.met = ['daeun']; s.bond.daeun = 14;
  assert.equal(R.build(s, W.episodeOn(s.date)).lines.some(l => l.effect?.flag === 'recognizedDaeunLetter'), false);
  s.bond.daeun = 15;
  assert.equal(R.build(s, W.episodeOn(s.date)).lines.some(l => l.effect?.flag === 'recognizedDaeunLetter'), true);
});
test('Story priority, dates, broadcast gates, and knowledge-dependent choices follow the GDD', () => {
  const s = fresh(); s.date = '2026-03-24'; s.slot = 2; s.met = ['nari', 'daeun']; s.bond.nari = 10; s.seen = ['fair'];
  assert.equal(Story.eligible(s, 'club')[0].id, 'crossDrum');
  s.date = '2026-04-06';
  assert.equal(Story.eligible(s, 'club').some(r => r.id === 'nariHabit'), false);
  s.radio.listened.push('radio-2026-04-02');
  assert.equal(Story.eligible(s, 'club').some(r => r.id === 'nariHabit'), true);
  const lyrics = Story.build('nariLyrics', s).lines.find(l => l.choice).choice;
  assert.equal(lyrics.length, 2); assert.equal(Story.allowed(s, lyrics[0].requires), false);
  s.knowledge = 15; s.flags.knowsPick = true;
  assert.equal(Story.build('nariLyrics', s).lines.find(l => l.choice).choice.length, 3);
  assert.equal(Story.allowed(s, lyrics[0].requires), true);
  s.date = '2026-07-01'; assert.equal(Story.available(s, 'dining').length, 0);
});
test('Fair fallback is a real meeting and festival never invents a message from an unknown heroine', () => {
  const s = fresh();
  const fair = Story.build('fair', s);
  assert.ok(fair.lines.some(l => l.choice?.some(o => o.effect?.meet === 'nari')));
  const festival = Story.build('festival', s);
  assert.equal(festival.lines.find(l => l.choice).choice.some(o => o.label.includes('서진')), false);
  s.met = ['seojin'];
  assert.equal(Story.build('festival', s).lines.find(l => l.choice).choice.some(o => o.label.includes('서진')), true);
});
test('Rainy work scene includes the third heroine only at her actual Wednesday evening location', () => {
  const s = fresh(); s.date = '2026-05-27'; s.slot = 2; s.met = ['nari', 'daeun', 'seojin']; s.bond.daeun = 15; s.bond.seojin = 15;
  locate(s, { nari: 'cafe' }, { cafe: 'crossRain' });
  assert.equal(Story.available(s, 'cafe')[0].id, 'crossRain');
  let scene = Story.build('crossRain', s);
  assert.ok(scene.lines.some(l => l.cast?.length === 3));
  assert.equal(scene.lines.find(l => l.choice).choice[2].effect.bond.nari, 1);
  s.slot = 1; scene = Story.build('crossRain', s);
  assert.equal(scene.lines.some(l => l.cast?.includes('nari')), false);
  assert.equal(scene.lines.find(l => l.choice).choice[2].effect.bond.nari, undefined);
  s.date = '2026-05-28'; assert.equal(Story.available(s, 'cafe').some(r => r.id === 'crossRain'), false);
});
test('Save restore preserves in-progress branches, charged costs, pending wages, and once-only effects', () => {
  const s = fresh(); s.date = '2026-03-11'; s.money = 150000; s.energy = 73;
  s.scene = { id: 'seojinMeet', after: 'activity', queue: Story.build('seojinMeet', s).lines,
    index: 2, applied: [1], logged: [0, 1, 2], pendingReward: { money: 32000 } };
  const restored = State.restore(JSON.parse(json(s)));
  assert.ok(restored); assert.equal(restored.money, 150000); assert.equal(restored.energy, 73);
  assert.equal(restored.scene.pendingReward.money, 32000); assert.equal(json(restored.scene.applied), '[1]');
  s.date = '2026-02-30'; assert.equal(State.restore(s), null);
  s.date = '2026-03-11'; s.scene.index = 999; assert.equal(State.restore(s), null);
});
test('First-build checkpoint migrates into continued play without pretending the story ended', () => {
  const s = fresh(); s.version = 1; s.date = '2026-04-02'; s.slot = 3; s.completed = true; s.flags.firstRadio = true;
  const state = State.restore(s); assert.ok(state); assert.equal(state.completed, false);
  assert.equal(state.radio.listened.includes('radio-2026-04-02'), true);
});
test('Gift transactions enforce money, inventory, actual meetings, seven days and birthday multipliers', () => {
  const s = fresh(); s.date = '2026-04-03'; s.slot = 1; s.met = ['nari', 'daeun', 'seojin'];
  locate(s, { nari: 'roof' });
  assert.equal(S.buy(s, 'picks').ok, true); assert.equal(s.money, 142000); assert.equal(s.social.inventory.picks, 1);
  assert.equal(S.give(s, 'nari', 'picks', 'river').ok, false); assert.equal(s.social.inventory.picks, 1);
  assert.equal(S.give(s, 'nari', 'picks', 'roof').ok, true); assert.equal(s.bond.nari, 3); assert.equal(s.social.inventory.picks, 0);
  S.buy(s, 'picks'); assert.equal(S.give(s, 'nari', 'picks', 'roof').ok, false);
  s.date = '2026-04-10'; locate(s, { nari: 'roof' }); assert.equal(S.give(s, 'nari', 'picks', 'roof').ok, true);
  s.date = '2026-07-28'; locate(s, { daeun: 'dining' }); S.buy(s, 'macarons');
  assert.equal(S.give(s, 'daeun', 'macarons', 'dining').birthday, true); assert.equal(s.bond.daeun, 12);
  assert.equal(s.social.knownBirthdays.daeun, true); assert.equal(s.social.knownBirthdays.nari, undefined);
  s.date = '2026-08-19'; s.bond.seojin = 10; locate(s, { seojin: 'cafe' }); S.buy(s, 'coffee'); const before = s.bond.seojin;
  assert.equal(S.give(s, 'seojin', 'coffee', 'cafe').gain, -3); assert.equal(s.bond.seojin, Math.max(0, before - 3));
  s.money = 1; assert.equal(S.buy(s, 'coffee').ok, false); assert.equal(s.money, 1);
});
test('Dates guard commitments and resources, rotate conversations, and settle an album entry only once', () => {
  const s = fresh(); s.date = '2026-04-03'; s.slot = 1; s.met = ['daeun']; s.bond.daeun = 18; locate(s, { daeun: 'river' });
  assert.equal(S.invite(s, 'daeun', 'concert', 'river', true).ok, false); assert.equal(s.money, 150000); assert.equal(s.energy, 100);
  const { outing } = S.invite(s, 'daeun', 'concert', 'river'); assert.equal(s.money, 126000); assert.equal(s.energy, 85);
  assert.equal(s.social.album.length, 0); assert.equal(outing.variant, 0);
  const data = context.AquaOutings.build(s, outing); assert.equal(data.lines.find(l => l.choice).choice.length, 2);
  outing.bonus = 4; outing.memory = '함께 보낸 오후'; assert.equal(S.finishDate(s, outing), true);
  assert.equal(s.social.album.length, 1); assert.equal(s.bond.daeun, 20, 'Recurring scene cap still applies');
  assert.equal(S.finishDate(s, outing), false); assert.equal(s.social.album.length, 1);
  s.date = '2026-04-10'; locate(s, { daeun: 'river' }); assert.equal(S.invite(s, 'daeun', 'concert', 'river').outing.variant, 1);
  s.slot = 2; assert.equal(S.invite(s, 'daeun', 'river', 'river').ok, false);
});
test('Nari refuses karaoke on two distinct invitations and Room 3 requires the actual river revelation', () => {
  const s = fresh(); s.met = ['nari']; s.bond.nari = 50; s.slot = 1; s.date = '2026-09-04'; locate(s, { nari: 'roof' });
  assert.equal(S.invite(s, 'nari', 'karaoke', 'roof').refused, true);
  assert.equal(S.invite(s, 'nari', 'karaoke', 'roof').refused, true); assert.equal(s.social.karaokeInvites.length, 1);
  s.date = '2026-09-07'; locate(s, { nari: 'roof' }); S.invite(s, 'nari', 'karaoke', 'roof'); assert.equal(s.social.karaokeInvites.length, 2);
  s.date = '2026-09-11'; locate(s, { nari: 'roof' }); assert.equal(S.invite(s, 'nari', 'karaoke', 'roof').refused, true); assert.equal(s.money, 150000);
  s.seen.push('nariVoice'); const result = S.invite(s, 'nari', 'karaoke', 'roof');
  assert.equal(result.ok, true); assert.equal(result.outing.routeId, 'nariRoom');
  const data = context.AquaOutings.build(s, result.outing); assert.equal(data.title, '3번 방');
  assert.equal(data.lines.find(l => l.choice).choice[0].effect.card, '3번 방');
});
test('Jealousy is observer-specific, once daily, first awareness only below 55, and Nari speaks through the radio', () => {
  const s = fresh(); s.met = ['nari', 'daeun', 'seojin']; s.bond = { nari: 36, daeun: 60, seojin: 20 }; s.date = '2026-04-08';
  let lines = S.attention(s, 'seojin', ['nari', 'daeun']);
  assert.equal(s.bond.nari, 39); assert.equal(s.flags.nariAware, true); assert.equal(s.bond.daeun, 57);
  assert.ok(!lines.some(l => l.speaker === '나리')); assert.ok(s.social.nariRadioPending);
  S.attention(s, 'seojin', ['nari', 'daeun']); assert.equal(s.bond.nari, 39); assert.equal(s.bond.daeun, 57);
  s.date = '2026-04-09'; const episode = W.episodeOn(s.date); R.air(s);
  assert.equal(s.social.nariRadioPending, null);
  const radio = R.build(s, episode); assert.ok(radio.lines.some(l => l.text.includes('저랑 상관없는')));
  const snapshot = json(s); R.build(s, episode, true); assert.equal(json(s), snapshot);
  s.date = '2026-04-10'; S.attention(s, 'seojin', ['nari']); assert.equal(s.bond.nari, 37);
  S.finishDate(s, { person: 'nari', destination: 'roof', date: s.date, variant: 0, bonus: 2 }); assert.equal(s.social.jealousy.nari.upset, false);
});
test('Social save validation restores old saves with empty bags and rejects broken inventory and unfinished-date metadata', () => {
  const old = fresh(); delete old.social; assert.ok(State.restore(old).social.inventory);
  const s = fresh(); s.social.inventory.flower = -1; assert.equal(State.restore(s), null);
  s.social.inventory.flower = 2; assert.equal(State.restore(s).social.inventory.flower, 2);
  s.social.jealousy.nari = 'broken'; assert.equal(State.restore(s), null); delete s.social.jealousy.nari;
  s.social.knownBirthdays.nari = 'true'; assert.equal(State.restore(s), null); delete s.social.knownBirthdays.nari;
  s.scene = { id: 'date-daeun-river', after: 'date', index: 0, queue: [{ text: '산책 중' }], outing: { person: 'daeun', destination: 'river', date: s.date, variant: 0, bonus: 4 } };
  assert.equal(State.restore(s), null, 'A pending date must be in its paid afternoon slot');
  s.slot = 1; assert.ok(State.restore(s));
});
test('A seeded itinerary survives reload and repeated visits, never places one heroine in two places, and conceals Thursday', () => {
  const s = fresh(); s.date = '2026-04-08'; s.slot = 2; s.met = ['nari', 'daeun', 'seojin']; s.bond = { nari: 20, daeun: 20, seojin: 20 };
  const before = json(s), first = json(context.AquaEncounters.resolve(s));
  for (let i = 0; i < 10; i++) assert.equal(json(context.AquaEncounters.resolve(s)), first);
  assert.equal(json(s), before); assert.equal(json(context.AquaEncounters.resolve(State.restore(JSON.parse(before)))), first);
  const places = ['class', 'library', 'dining', 'cafe', 'club', 'studio', 'radio', 'roof', 'river', 'concert'];
  for (let seed = 0; seed < 160; seed++) {
    s.encounters.seed = seed;
    for (const id of s.met) assert.ok(places.filter(place => W.presentAt(s, place).includes(id)).length <= 1);
    s.date = '2026-04-09'; assert.ok(!places.some(place => W.presentAt(s, place).includes('nari'))); s.date = '2026-04-08';
  }
});
test('Encounter probabilities reflect shifts, absences and exams rather than guaranteed daily attendance', () => {
  const counts = { shift: 0, off: 0, examLibrary: 0, ordinaryLibrary: 0 }, E = context.AquaEncounters;
  for (let seed = 0; seed < 1200; seed++) {
    const s = fresh(); s.encounters.seed = seed; s.slot = 1; s.met = ['nari', 'daeun', 'seojin'];
    s.date = '2026-04-03'; if (E.isAt(s, 'seojin', 'cafe')) counts.shift++;
    s.date = '2026-04-06'; if (E.isAt(s, 'seojin', 'cafe')) counts.off++;
    s.date = '2026-04-22'; if (E.isAt(s, 'nari', 'library')) counts.examLibrary++;
    s.date = '2026-03-25'; if (E.isAt(s, 'nari', 'library')) counts.ordinaryLibrary++;
  }
  assert.ok(counts.shift > 850 && counts.shift < 1150, json(counts));
  assert.ok(counts.off < 150, json(counts)); assert.ok(counts.examLibrary > counts.ordinaryLibrary + 100, json(counts));
});
test('Older saves receive a stable itinerary seed and malformed seeds are rejected', () => {
  const s = fresh(); delete s.encounters;
  assert.equal(State.restore(s).encounters.seed, State.restore(s).encounters.seed);
  s.encounters = { seed: -1 }; assert.equal(State.restore(s), null);
  s.encounters.seed = '42'; assert.equal(State.restore(s), null);
});
test('Free conversations and gifts cannot teleport people by unlocking a new route in the same time slot', () => {
  const s = fresh(); s.date = '2026-04-03'; s.slot = 1; s.met = ['nari', 'daeun', 'seojin'];
  locate(s, { nari: 'roof' }); context.AquaEncounters.ensurePlan(s);
  const before = json(context.AquaEncounters.resolve(s)); s.bond.nari = 70; s.radio.listened.push('radio-2026-04-02');
  assert.equal(json(context.AquaEncounters.resolve(s)), before);
  assert.equal(json(context.AquaEncounters.resolve(State.restore(JSON.parse(json(s))))), before);
  s.slot = 2; context.AquaEncounters.ensurePlan(s); assert.equal(s.encounters.plan.key, '2026-04-03:2');
});
test('Clothes follow performance, rehearsal, dates and seasons while retaining an explicit scene selection', () => {
  const s = fresh(), C = context.AquaWardrobe;
  assert.equal(C.pick(s, 'nari', { id: 'entrance' }), 'stage');
  assert.equal(C.pick(s, 'nari', { id: 'date-nari-concert', outing: {} }), 'campus');
  assert.equal(C.pick(s, 'daeun', { returnPlace: 'club' }), 'rehearsal');
  assert.equal(C.pick(s, 'daeun', { returnPlace: 'river' }), 'campus');
  assert.equal(C.pick(s, 'seojin', { background: 'cafe' }), 'work');
  assert.equal(C.pick(s, 'seojin', { background: 'cafe', outing: {} }), 'offduty');
  s.date = '2026-06-08'; assert.equal(C.pick(s, 'seojin', { outing: {} }), 'summer');
  assert.ok(C.source(s, 'nari', { wardrobe: { nari: 'stage' } }).endsWith('nari-stage-v2.png'));
});
for (const rule of Story.rules) assert.ok(context.AQUA_SCENES[rule.id], rule.id);
for (const file of ['game', 'world', 'encounters', 'wardrobe', 'radio', 'social', 'outings', 'state', 'scenes', 'semester']) new vm.Script(await fs.readFile(new URL(`src/campus-v2/${file}.js`, root), 'utf8'));
const runDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const report = { date: runDate, passed: true, checks, scope: 'Pure calendar, radio lifecycle, relationship rules, story conditions, and save contracts. Does not certify visual layout or full-game completion.' };
await fs.mkdir(new URL('qa/campus-v2/', root), { recursive: true });
await fs.writeFile(new URL('qa/campus-v2/core-results.json', root), JSON.stringify(report, null, 2) + '\n');
console.log(`${checks.length}/${checks.length} passed`);
