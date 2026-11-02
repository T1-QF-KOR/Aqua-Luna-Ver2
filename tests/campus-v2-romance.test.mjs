// Relationship decisions use the real transaction, save, date and greeting modules.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url), C = { structuredClone }; C.window = C; vm.createContext(C);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
for (const [, path] of html.matchAll(/<script defer src="([^"]+)">/g)) if (!path.endsWith('/game.js')) vm.runInContext(await fs.readFile(new URL(path, root), 'utf8'), C);
const L = C.AquaRomance, S = C.AquaSocial, W = C.AquaWorld, State = C.AquaState;
const base = () => {
  const s = State.initial(); s.date = '2026-11-25'; s.slot = 2; s.met = ['nari','daeun','seojin']; s.bond = { nari: 85, daeun: 85, seojin: 85 };
  C.AquaRelationships.migrate(s); return s;
};
const restored = s => { const result = State.restore(JSON.parse(JSON.stringify(s))); assert.ok(result, 'Must restore the actual relationship state'); return result; };
const second = (bond = 85, answer = 'disclose') => {
  const s = base(); assert.ok(L.answer(s,'seojin','accept')); s.date = '2026-12-18'; s.bond.seojin = bond;
  assert.ok(L.answer(s,'daeun',answer)); return s;
};
const checks = [], test = (name, run) => { run(); checks.push(name); console.log('PASS ' + name); };
test('Version 5 saves migrate without inventing lovers; invalid agreements and dates are rejected', () => {
  const old = base(); old.version = 5; delete old.romance;
  const next = restored(old); assert.equal(next.version,7); assert.equal(L.lovers(next).length,0); assert.equal(next.bond.nari,85);
  const bad = base(); bad.romance.status.seojin='lover'; bad.romance.since.seojin='2026-12-18'; assert.equal(State.restore(bad),null);
  const only = base(); L.answer(only,'seojin','accept'); only.romance.mode='open'; assert.equal(State.restore(only),null);
  const phantom = base(); phantom.romance.status.daeun='proposed'; phantom.romance.since.daeun=phantom.date; assert.equal(State.restore(phantom),null);
});
test('Affection never overrides a friend answer, and a pending answer halves recurring gains for fourteen days', () => {
  const friend = base(); L.answer(friend,'seojin','friend'); assert.equal(L.answer(friend,'seojin','accept'),false);
  assert.equal(W.bondStage(friend,'seojin'),'친구로 대답한 사이'); assert.equal(L.lovers(friend).length,0); restored(friend);
  const s = base(); L.answer(s,'seojin','pending'); s.date='2026-11-26'; assert.equal(L.repeatingFactor(s,'seojin'),.5);
  s.date='2026-12-09'; assert.equal(L.repeatingFactor(s,'seojin'),.5); s.date='2026-12-10'; assert.equal(L.repeatingFactor(s,'seojin'),1);
  assert.equal(L.ensure(restored(s)).status.seojin,'pending'); assert.equal(L.canConfess(s,'seojin'),false);
});
test('A second disclosure remains a proposal until the actual group conversation grants consent', () => {
  let s = second(); assert.equal(L.isLover(s,'daeun'),false); assert.equal(L.ensure(s).status.daeun,'proposed');
  s=restored(s); s.date='2026-12-19'; s.slot=2; assert.equal(L.mandatory(s,2),'romanceTalk'); assert.equal(L.consentLevel(s),'yes');
  assert.equal(L.buildTalk(s).lines.at(-1).choice.length,3); assert.ok(L.agree(s)); assert.equal(L.ensure(s).mode,'open');
  assert.equal(L.lovers(s).length,2); assert.equal(L.ensure(s).since.seojin,'2026-11-25'); assert.equal(L.agree(s),false); restored(s);
});
test('Conditional consent counts two completed dates once each and waits for an explicit review', () => {
  let s = second(65); s.date='2026-12-19'; assert.equal(L.consentLevel(s),'trial'); assert.ok(L.beginTrial(s));
  assert.equal(L.isLover(s,'daeun'),false); assert.equal(L.repeatingFactor(s,'seojin'),.5);
  for (const date of ['2026-12-20','2026-12-22']) {
    s.date=date; s.slot=1; const outing={person:'seojin',destination:'river',date,variant:0,bonus:0};
    assert.equal(S.finishDate(s,outing),true); assert.equal(S.finishDate(s,outing),false); s=restored(s);
  }
  assert.equal(L.ensure(s).trial.counts.seojin,2); assert.ok(L.trialReady(s)); assert.equal(L.mandatory(s,2),'romanceReview');
  assert.equal(L.isLover(s,'daeun'),false); assert.ok(L.finishTrial(s)); assert.equal(L.ensure(s).mode,'open'); assert.ok(L.isLover(s,'daeun')); restored(s);
});
test('A missed trial deadline offers a real decision instead of silently approving the new relationship', () => {
  const s = second(65); s.date='2026-12-19'; L.beginTrial(s); s.date='2027-01-03';
  assert.equal(L.mandatory(s,2),'romanceReview'); assert.equal(L.finishTrial(s),false);
  assert.equal(L.buildReview(s).lines.at(-1).choice.length,2); assert.ok(L.chooseOnly(s,'seojin'));
  assert.equal(L.ensure(s).status.daeun,'friend'); assert.equal(L.ensure(s).mode,'single'); restored(s);
});
test('A refused agreement cannot be forced by an affection value or a scene choice', () => {
  const s = second(80); s.social.jealousy.seojin={date:s.date,aware:true,upset:true}; s.date='2026-12-19';
  assert.equal(L.consentLevel(s),'no'); assert.equal(L.agree(s),false); assert.equal(L.beginTrial(s),false);
  assert.equal(L.buildTalk(s).lines.at(-1).choice.length,2); L.chooseOnly(s,'daeun');
  assert.equal(L.ensure(s).status.seojin,'friend'); assert.equal(s.bond.seojin,65); assert.ok(L.ensure(s).wounds.includes('seojin')); restored(s);
});
test('Hidden relationships can be disclosed; only a real lover witnessing a date schedules a clash', () => {
  const s = second(85,'hide'); assert.equal(L.ensure(s).mode,'hidden');
  L.witness(s,'daeun',['nari']); assert.equal(L.ensure(s).clashDue,null);
  S.attention(s,'daeun',['seojin'],true); assert.equal(L.mandatory(s,3),'romanceClash');
  const before={...s.bond}; assert.ok(L.settleClash(s,'seojin'));
  assert.equal(s.bond.seojin,before.seojin-10); assert.equal(s.bond.daeun,before.daeun-20);
  assert.equal(L.ensure(s).clashes.length,1); assert.equal(L.ensure(s).status.daeun,'friend'); assert.equal(L.settleClash(s,'seojin'),false); restored(s);
  const disclosed=second(85,'hide'); assert.ok(L.disclose(disclosed)); assert.equal(L.ensure(disclosed).talk.fromHidden,true);
  assert.equal(L.disclose(disclosed),false); restored(disclosed);
});
test('Being honest after a clash uses the higher consent threshold and never treats an apology as consent', () => {
  const s = second(99,'hide'); s.bond.daeun=99; S.attention(s,'daeun',['seojin'],true);
  assert.ok(L.settleClash(s,'honest')); assert.ok(L.ensure(s).talk); assert.equal(L.ensure(s).mode,'hidden');
  s.date='2026-12-19'; assert.equal(L.consentLevel(s),'yes'); assert.ok(L.agree(s)); assert.equal(L.ensure(s).mode,'open'); restored(s);
  const evaded=second(85,'hide'); L.witness(evaded,'daeun',['seojin']); L.settleClash(evaded,'evade'); assert.equal(evaded.flags.equivocated,true); restored(evaded);
});
test('Lovers have a seven-day absence boundary, while ordinary friends retain fourteen days', () => {
  const s=base(); L.answer(s,'seojin','accept'); s.social.lastMet.seojin=s.social.lastMet.daeun='2026-11-25'; s.date='2026-12-07';
  C.AquaRelationships.monday(s); assert.equal(s.bond.seojin,83); assert.equal(s.bond.daeun,85);
  s.slot=1;
  assert.ok(C.AquaDialogue.greeting(s,'seojin','cafe').includes('오랜만'));
  s.slot=2; assert.ok(C.AquaDialogue.greeting(s,'seojin','cafe').includes('먼저 보고 싶었어'));
});
await fs.writeFile(new URL('qa/campus-v2/romance-results.json',root),JSON.stringify({passed:true,checks,scope:'Production relationship, migration, social date, witness and greeting modules; browser layout checked separately.'},null,2)+'\n');
console.log(`${checks.length}/${checks.length} passed`);
