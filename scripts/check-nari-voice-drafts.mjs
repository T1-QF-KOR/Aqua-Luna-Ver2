// Check authored static lines and default radio paths against the review drafts.
// This does not prove dynamic paths, voice IDs, acting direction, or recordings.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const context = { structuredClone };
context.window = context;
vm.createContext(context);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
for (const [, path] of html.matchAll(/<script defer src="([^"]+)">/g)) {
  if (!path.endsWith('/game.js')) vm.runInContext(await fs.readFile(new URL(path, root), 'utf8'), context, { filename: path });
}
const directory = new URL('GDD/시나리오/', root);
const filenames = (await fs.readdir(directory)).filter(name => /^1[0-4]_.*녹음대본_작업본\.md$/.test(name) || name === '09_한나리_현행_녹음대본_작업본.md');
assert.equal(filenames.length, 6, 'Expected six review documents');
const drafts = (await Promise.all(filenames.map(name => fs.readFile(new URL(name, directory), 'utf8')))).join('\n');
// Only explicit recorded dialogue counts, never a matching quote in narration,
// a choice label, an acting note, or an unrelated speaker's dialogue.
const voiceLines = { nari: new Set(), luna: new Set() };
for (const line of drafts.split('\n')) {
  const match = line.match(/^\s*- \*\*([^*]+)\*\*(?:\s*\[조건: [^\]]*\])?: (.+)$/);
  if (!match) continue;
  if (/나리|^일상\s+\d+/.test(match[1])) voiceLines.nari.add(match[2]);
  else if (/루나/.test(match[1])) voiceLines.luna.add(match[2]);
}
const missing = [];
let checked = 0;
function walk(lines, origin, speakers) {
  for (const line of lines || []) {
    if (speakers.includes(line.speaker) && typeof line.text === 'string') {
      checked++;
      const voice = line.speaker === '루나' ? 'luna' : 'nari';
      if (!voiceLines[voice].has(line.text)) missing.push(`${origin}: missing explicit ${line.speaker} voice cue: ${line.text}`);
    }
    for (const option of line.choice || []) walk(option.lines, origin, speakers);
  }
}
for (const [id, scene] of Object.entries(context.AQUA_SCENES)) {
  walk(scene.lines, `scene ${id}`, ['나리', '나리 · 무대 위']);
}
for (const episode of context.AquaWorld.broadcasts) {
  const state = context.AquaState.initial();
  state.date = episode.date;
  state.slot = 3;
  walk(context.AquaRadio.build(state, episode).lines, `radio ${episode.number}`, ['루나']);
}
// Exercise the fixed replies around a player-supplied letter separately from
// its variable alias/body, which cannot be represented by one recorded line.
{
  const episode = context.AquaWorld.broadcasts.find(item => item.number === 2);
  const cases = [
    { target: 'daeun', topic: '신경 쓰이는 사람', expected: '…좋네요. 공지 올리는 사람한테 답장, 꼭 해 주세요.' },
    { target: 'seojin', topic: '신경 쓰이는 사람', expected: '…누군가의 취향을 기억해 주는 일. 그 사람도 알면 좋겠네요.' },
    { target: null, topic: '고민', expected: '바뀌는 사이가 전부 멀어지는 사이는 아닐 거예요. 보내고 싶은 말 하나는 남겨 두세요.' },
    { target: null, topic: '오늘 있었던 일', expected: '오늘의 이야기를 여기까지 보내 주셔서 고마워요. 제가 잘 받았어요.' }
  ];
  for (const sample of cases) {
    const state = context.AquaState.initial();
    state.date = episode.date;
    const letter = { id: 'test-letter', date: episode.date, week: context.AquaWorld.weekKey(episode.date),
      alias: '검수별명', text: '검수용 사연 본문', read: false, ...sample };
    state.letters.push(letter);
    const lines = context.AquaRadio.build(state, episode).lines;
    assert.ok(lines.some(line => line.speaker === '루나' && line.text === sample.expected), `letter reply missing for ${sample.topic}/${sample.target}`);
    assert.ok(lines.some(line => line.text === `${letter.alias} 님이 보내 주셨어요.`), 'variable alias cue missing');
    assert.ok(lines.some(line => line.text === letter.text), 'variable letter body missing');
    walk(lines.filter(line => line.text !== `${letter.alias} 님이 보내 주셨어요.` && line.text !== letter.text),
      `radio letter ${sample.topic}/${sample.target}`, ['루나']);
  }
}
// The following authored variants replace or augment ordinary episode lines.
for (const variant of [
  { number: 13, configure: s => s.seen.push('nariSummer'), expected: '여름에 처음으로 무대 아닌 데서 노래했어요. 관객이 한 명이었는데, 그게 제일 떨렸어요.' },
  { number: 18, configure: s => { s.flags.nariHeardMelody = true; }, expected: '♪ …아. 마이크 켜져 있었네요.' },
  { number: 2, configure: (s, episode) => { s.social.nariDistanceWeek = context.AquaWorld.weekKey(episode.date); }, expected: '요즘 연락 안 하는 사람 있으세요? 먼저 해 보세요. 저는 못 하지만.' },
  { number: 2, configure: s => { s.social.nariRadioPending = { witness: true }; }, expected: '오늘은 같이 온 사람들이 눈에 띄더라고요. …저랑 상관없는 일인데요.' },
  { number: 2, configure: s => { s.social.nariRadioPending = { witness: false }; }, expected: '요즘 누가 누구랑 웃고 있는 걸 봤어요. 저랑 상관없는 일인데요.' },
  { number: 2, configure: (s, episode) => { s.radio.hiatusUntil = episode.date; }, expected: '잠깐 쉬어 가는 주에도, 여러분의 하루는 잘 끝났으면 좋겠어요.' }
]) {
  const episode = context.AquaWorld.broadcasts.find(item => item.number === variant.number);
  const state = context.AquaState.initial(); state.date = episode.date;
  variant.configure(state, episode);
  const lines = context.AquaRadio.build(state, episode).lines;
  assert.ok(lines.some(line => line.speaker === '루나' && line.text === variant.expected), `radio variant not generated: ${variant.expected}`);
  walk(lines, `radio variant ${variant.number}`, ['루나']);
}
// The recording-night broadcast is generated by a separate builder. Check both
// first listen and replay, including the live-note choice when a letter exists.
for (const replay of [false, true]) {
  for (const hasLetter of [false, true]) {
    const state = context.AquaState.initial();
    state.date = '2026-11-19';
    if (hasLetter) state.letters.push({});
    const episode = { id: 'radio-2026-11-19' };
    walk(context.AquaWinter.recording(state, episode, replay).lines,
      `recording night replay=${replay} letter=${hasLetter}`, ['루나']);
  }
}
// Generate representative relationship states through the same production builders
// and transactions used by the game; this is still not exhaustive path coverage.
const H = context.AquaHolidays, L = context.AquaRomance;
function holidayState() {
  const s = context.AquaState.initial();
  Object.assign(s, { date: '2026-12-24', slot: 3, met: ['nari', 'daeun', 'seojin'],
    bond: { nari: 72, daeun: 20, seojin: 20 }, knowledge: 40, fitness: 40, sensitivity: 40 });
  s.radio.anonymous = 25;
  return s;
}
function checkHoliday(lines, origin) { walk(lines, origin, ['나리']); }
function spokenLines(lines, target = new Set()) {
  for (const line of lines || []) {
    if (['나리', '나리 · 무대 위'].includes(line.speaker) && typeof line.text === 'string') target.add(line.text);
    for (const option of line.choice || []) spokenLines(option.lines, target);
  }
  return target;
}
const pilotHolidayLines = new Set();
for (const answer of ['accept', 'decline', 'consider']) {
  const s = holidayState();
  H.apply(s, { action: 'offer', person: 'nari' });
  checkHoliday(H.buildInvite(s, 'nari').lines, 'Christmas invitation');
  checkHoliday(H.apply(s, { action: 'invite', person: 'nari', answer }), `invitation ${answer}`);
}
for (const answer of ['first', 'friend', 'defer']) {
  const s = holidayState();
  if (answer === 'defer') { L.answer(s, 'daeun', 'pending'); L.answer(s, 'seojin', 'pending'); }
  checkHoliday(H.apply(s, { action: 'meetNari' }), 'Christmas meeting');
  checkHoliday(H.apply(s, { action: 'listenNari' }), 'Christmas confession');
  checkHoliday(H.apply(s, { action: 'nariAnswer', answer }), `Christmas answer ${answer}`);
}
for (const config of [{}, { knowsLuna: true }, { knowsLuna: true, boothPeeked: true }, { bond: 60 }]) {
  const s = holidayState();
  if (config.bond) s.bond.nari = config.bond;
  else Object.assign(s.flags, config);
  spokenLines(H.apply(s, { action: 'meetNari' }), pilotHolidayLines);
  spokenLines(H.apply(s, { action: 'listenNari' }), pilotHolidayLines);
  spokenLines(H.apply(s, { action: 'nariAnswer', answer: 'first' }), pilotHolidayLines);
}
{
  const s = holidayState(); H.apply(s, { action: 'meetNari' });
  spokenLines(H.apply(s, { action: 'nariAnswer', answer: 'friend' }), pilotHolidayLines);
}
for (const card of H.personalCards) {
  const s = holidayState(); s.cards = [card];
  H.apply(s, { action: 'meetNari' });
  checkHoliday(H.apply(s, { action: 'recall', card }), `Christmas memory ${card}`);
}
for (const flags of [{ knowsLuna: true, boothPeeked: true }, { knowsLuna: true, questionedRadio: true }, { knowsLuna: true }]) {
  const s = holidayState(); Object.assign(s.flags, flags);
  H.apply(s, { action: 'meetNari' });
  checkHoliday(H.apply(s, { action: 'nariAnswer', answer: 'first' }), 'Christmas identity history');
}
for (const answer of ['accept', 'pending', 'friend']) {
  const s = holidayState(); L.answer(s, 'nari', answer); s.date = '2027-02-14';
  checkHoliday(context.AquaWinter.buildValentine(s).lines, `Valentine ${answer}`);
}
// Both group options are absent in the single-person relationship examples.
{
  const s = holidayState(); s.date = '2027-02-14';
  const romance = L.ensure(s);
  romance.mode = 'open'; romance.status.nari = 'lover'; romance.status.daeun = 'lover';
  const lines = context.AquaWinter.buildValentine(s).lines;
  assert.ok(spokenLines(lines).has('다 같이 나눠 먹을 만큼 가져왔어. 네가 먼저 하나 골라.'), 'open relationship option was not generated');
  checkHoliday(lines, 'Valentine open relationship');
}
{
  const s = holidayState(); s.date = '2027-02-14';
  Object.assign(s.bond, { nari: 60, daeun: 75, seojin: 75 });
  const romance = L.ensure(s);
  Object.assign(romance.status, { nari: 'pending', daeun: 'pending', seojin: 'pending' });
  const lines = context.AquaWinter.buildValentine(s).lines;
  assert.ok(spokenLines(lines).has('함께 이야기하는 건 괜찮아. 그게 기다리기로 한 대답은 아니야.'), 'shared discussion option was not generated');
  checkHoliday(lines, 'Valentine shared discussion');
}
for (const ending of ['nari-true', 'nari-love', 'nari-friend']) {
  for (const flags of [{}, { originalLyrics: true, autumnFestivalSeen: true },
    { frontRowKept: true }, { nariSummerEncore: true }, { nariDecisionTrusted: true }]) {
    const s = holidayState(); s.date = '2027-02-26'; Object.assign(s.flags, flags);
    checkHoliday(context.AquaEndings.build(s, ending).lines, `ending ${ending}`);
  }
  const heard = holidayState(); heard.date = '2027-02-26';
  heard.radio.listened.push('radio-2027-02-25');
  checkHoliday(context.AquaEndings.build(heard, ending).lines, `ending ${ending} after broadcast`);
}
const pilotSpecs = [
  { file: '15_한나리_녹음_1차_파일럿.md', expected: 22, pick: number =>
    number <= 5 ? 'entrance' : number <= 9 ? 'nariClass' : number <= 12 ? 'nariRoof' : number <= 17 ? 'nariShake' : 'nariVolume' },
  { file: '16_한나리_녹음_2차_감정장면.md', expected: 26, pick: number =>
    number <= 6 ? 'nariFright' : number <= 17 ? 'nariFight' : 'holiday' }
];
const pilotRows = new Map();
for (const spec of pilotSpecs) {
  const document = await fs.readFile(new URL(spec.file, directory), 'utf8');
  const rows = [...document.matchAll(/^\| ([PQ])(\d+)([A-Z]?) \| [^|]* \| (.*?) \|$/gm)];
  assert.equal(rows.length, spec.expected, `${spec.file}: missing or extra pilot rows`);
  const ids = new Set();
  for (const [, prefix, digits, suffix, text] of rows) {
    const id = prefix + digits + suffix;
    assert.ok(!ids.has(id), `${spec.file}: duplicate ${id}`); ids.add(id);
    if (prefix === 'P') pilotRows.set(id, text);
    const scene = spec.pick(Number(digits));
    const actual = scene === 'holiday' ? pilotHolidayLines : spokenLines(context.AQUA_SCENES[scene].lines);
    if (!actual.has(text)) missing.push(`${spec.file} ${id}: no exact line in ${scene}: ${text}`);
  }
}
const radioPilot = await fs.readFile(new URL('18_루나_녹음_3차_방송파일럿.md', directory), 'utf8');
const radioRows = [...radioPilot.matchAll(/^\| (R\d+) \| [^|]* \| (.*?) \|$/gm)];
assert.equal(radioRows.length, 12, 'broadcast pilot should contain 12 takes including two contexts for R001');
for (const [, id, text] of radioRows) {
  assert.ok(voiceLines.luna.has(text), `${id}: broadcast pilot differs from radio review draft`);
}
const pilotManifest = JSON.parse(await fs.readFile(new URL('한나리_녹음_파일럿_연결표.json', directory), 'utf8'));
assert.equal(pilotManifest.status, 'draft');
assert.equal(pilotManifest.entries.length, pilotRows.size);
const voiceIds = new Set(), pilotIds = new Set();
for (const entry of pilotManifest.entries) {
  assert.ok(!voiceIds.has(entry.plannedVoiceId), `duplicate planned ID ${entry.plannedVoiceId}`);
  assert.ok(!pilotIds.has(entry.pilotId), `duplicate pilot ID ${entry.pilotId}`);
  voiceIds.add(entry.plannedVoiceId); pilotIds.add(entry.pilotId);
  assert.equal(entry.text, pilotRows.get(entry.pilotId), `${entry.pilotId}: manuscript mismatch`);
  assert.equal(entry.audioFile, null, `${entry.pilotId}: a planned recording must not claim an audio file`);
  const scene = context.AQUA_SCENES[entry.scene];
  assert.ok(scene, `${entry.pilotId}: scene not found`);
  const line = entry.sourcePointer.split('/').slice(1).reduce((value, part) => value?.[part], scene);
  assert.equal(line?.text, entry.text, `${entry.pilotId}: scene path no longer points to this line`);
  assert.equal(line?.speaker, entry.speaker, `${entry.pilotId}: speaker mismatch`);
}
if (missing.length) {
  console.error(missing.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS ${checked} scene, radio and sampled relationship lines appear in the voice review drafts.`);
  console.log('PASS 48 pilot lines exactly match their assigned scene or sampled holiday outcomes.');
  console.log(`PASS ${radioRows.length} broadcast pilot rows match the radio review draft.`);
  console.log(`PASS ${pilotManifest.entries.length} provisional recording mappings point to their exact production lines.`);
  console.log('Not exhaustive: other dynamic branches and speaker attribution within prose require separate review.');
}
