// Dialogue selection, knowledge boundaries and persistence with production modules.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url), context = { structuredClone }; context.window = context; vm.createContext(context);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
for (const [, path] of html.matchAll(/<script defer src="([^"]+)"><\/script>/g)) {
  if (!path.endsWith('/game.js')) vm.runInContext(await fs.readFile(new URL(path, root), 'utf8'), context, { filename: path });
}
const { AquaWorld: W, AquaState: State, AquaDialogue: D } = context;
const json = value => JSON.stringify(value), checks = [];
function test(name, fn) { fn(); checks.push(name); console.log(`PASS ${name}`); }
test('Recent event lines require actual recent records and survive preview without consumption', () => {
 for(const id of Object.keys(W.people)) {
  assert.ok(Object.values(D.recentLines[id]).flat().length>=10);
  const state=State.initial();state.date='2026-05-01';state.met=[id];
  state.social.album.push({person:id,date:'2026-04-30'});
  for(let n=0;n<8;n++){const line=D.peekTalk(state,id,0);D.commit(state,line.key);}
  const line=D.peekTalk(state,id,0);assert.ok(line.key.startsWith(`recent:${id}:date:`));
  assert.equal(D.peekTalk(state,id,0).key,line.key);
  state.social.album=[];assert.ok(!D.peekTalk(state,id,0).key.startsWith('recent:'));
 }
});
test('Each heroine has distinct options for every topic and relationship stage', () => {
  for (const id of Object.keys(W.people)) for (let topic = 0; topic < 6; topic++) for (const level of [0, 1, 2]) {
    const state = State.initial(); state.met = [id]; state.bond[id] = level === 0 ? 0 : level === 1 ? (id === 'nari' ? 25 : 15) : (id === 'nari' ? 45 : 35);
    const before = json(state), first = D.peekTalk(state, id, topic);
    assert.equal(json(state), before, 'Browsing a topic does not consume dialogue');
    D.commit(state, first.key); state.date = W.addDays(state.date, 1);
    const second = D.peekTalk(state, id, topic); assert.notEqual(first.text, second.text);
    D.commit(state, second.key); state.date = W.addDays(state.date, 1);
    const seen = [first.text, second.text];
    for (let i=0;i<6;i++) { const next=D.peekTalk(state,id,topic); assert.ok(!seen.includes(next.text)); seen.push(next.text); D.commit(state,next.key); state.date=W.addDays(state.date,1); }
    assert.equal(D.peekTalk(state,id,topic).text,first.text,'After exhausting the pool, reuse the oldest');
  }
});
test('The displayed greeting stays stable in the same encounter and a witness reaction survives reload', () => {
  const state = State.initial(); state.date = '2026-04-03'; state.slot = 1; state.met = ['daeun'];
  const first = D.greeting(state, 'daeun', 'river');
  assert.equal(D.greeting(state, 'daeun', 'river'), first);
  const restored = State.restore(JSON.parse(json(state))); assert.ok(restored);
  assert.equal(D.greeting(restored, 'daeun', 'river'), first);
  restored.date = W.addDays(restored.date, 1); restored.social.witnessGreeting.daeun = true;
  const witnessed = D.greeting(restored, 'daeun', 'river'); assert.ok(witnessed.includes('재밌었냐'));
  assert.equal(D.greeting(restored, 'daeun', 'river'), witnessed);
});
test('Conversation records survive old-save migration and reject invalid dates', () => {
  const old = State.initial(); old.version = 3; delete old.dialogue;
  let state = State.restore(old); assert.ok(state); assert.deepEqual(Object.keys(state.dialogue.recent), []);
  const line = D.peekTalk(state, 'nari', 0); D.commit(state, line.key);
  state = State.restore(JSON.parse(json(state))); assert.equal(state.dialogue.recent[line.key], state.date);
  state.dialogue.recent[line.key] = 'not-a-date'; assert.equal(State.restore(state), null);
});
test('Version 3 relationship progress migrates without awarding new rewards', () => {
  const old = State.initial(); old.version = 3; old.met = ['daeun']; old.seen = ['daeunFirst']; old.bond.daeun = 20;
  delete old.relationships; delete old.dialogue;
  const restored = State.restore(old); assert.ok(restored);
  assert.ok(restored.relationships.unlocked.includes('daeunFirst'));
  assert.equal(restored.bond.daeun, 20); assert.equal(restored.relationships.rewards.length, 0);
});
test('Relationship gate deadlines retain existing summer story availability', () => {
  const rules = context.AquaStory.rules;
  assert.equal(rules.find(rule => rule.id === 'nariDemo').to, '2026-08-26');
  assert.equal(rules.find(rule => rule.id === 'seojinRain').to, '2026-07-31');
});
test('Nari’s autumn answer acknowledges a difficult topic instead of continuing her spring dream dialogue', () => {
  const state = State.initial(); state.date = '2026-09-01'; state.met = ['nari']; state.bond.nari = 25;
  assert.ok(D.peekTalk(state, 'nari', 5).text.includes('얘기'));
});
test('Everyday lines do not claim a melody or a walk was shared before it happened', () => {
  const state = State.initial(); state.date = '2026-04-08'; state.met = ['nari', 'daeun', 'seojin']; state.bond = { nari: 30, daeun: 20, seojin: 20 };
  const nari = D.peekTalk(state, 'nari', 0); assert.ok(!nari.text.includes('네 악보는 멀리서도'));
  const seojin = D.peekTalk(state, 'seojin', 1); assert.ok(!seojin.text.includes('네가 고른 곡, 끝까지'));
  D.commit(state, seojin.key); const second = D.peekTalk(state, 'seojin', 1); assert.ok(second.text);
});
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
await fs.writeFile(new URL('qa/campus-v2/dialogue-results.json', root), JSON.stringify({ date, passed: true, checks, scope: 'Dialogue selection and save contracts; not a full browser or story playthrough.' }, null, 2) + '\n');
console.log(`${checks.length}/${checks.length} passed`);
