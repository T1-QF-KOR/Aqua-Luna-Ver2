// The production holiday transactions, broadcast records and relationship state.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),C={structuredClone};C.window=C;vm.createContext(C);
const html=await fs.readFile(new URL('campus.html',root),'utf8');
for(const [,path] of html.matchAll(/<script defer src="([^"]+)">/g))if(!path.endsWith('/game.js'))vm.runInContext(await fs.readFile(new URL(path,root),'utf8'),C);
const H=C.AquaHolidays,L=C.AquaRomance,R=C.AquaRadio,State=C.AquaState,Story=C.AquaStory;
const base=()=>{const s=State.initial();Object.assign(s,{date:'2026-12-24',slot:3,met:['nari','daeun','seojin'],bond:{nari:72,daeun:20,seojin:20},knowledge:40,fitness:40,sensitivity:40});s.radio.anonymous=25;C.AquaRelationships.migrate(s);return s;};
const restore=s=>{const r=State.restore(JSON.parse(JSON.stringify(s)));assert.ok(r,'Holiday state must restore');return r;};
const offer=(s,id,answer)=>{H.apply(s,{action:'offer',person:id});return H.apply(s,{action:'invite',person:id,answer});};
const meet=s=>{H.morning(s);assert.ok(H.apply(s,{action:'meetNari'}).length);};
const checks=[],test=(name,run)=>{run();checks.push(name);console.log('PASS '+name);};
test('Old saves migrate without inventing Christmas appointments and malformed invitations are rejected',()=>{
 const s=base();s.version=6;delete s.holidays;const r=restore(s);assert.equal(r.version,7);assert.deepEqual(Object.keys(r.holidays.invites),[]);
 const bad=base();bad.met=[];bad.holidays.invites.nari={status:'accepted',date:'2026-12-21',rewarded:true};assert.equal(State.restore(bad),null);
 const broken=base();broken.holidays.nariMemory='관객 한 명';broken.cards=null;assert.equal(State.restore(broken),null);
});
test('Invitation replies preserve real commitments, never farm rewards, and can be revised remotely',()=>{
 const s=base();s.date='2026-12-21';s.bond.daeun=s.bond.seojin=60;
 offer(s,'daeun','accept');const bond=s.bond.daeun;H.apply(s,{action:'invite',person:'daeun',answer:'accept'});assert.equal(s.bond.daeun,bond);
 H.apply(s,{action:'invite',person:'daeun',answer:'consider'});H.apply(s,{action:'invite',person:'daeun',answer:'accept'});assert.equal(s.bond.daeun,bond);
 const replies=offer(s,'seojin','switch');assert.equal(s.holidays.invites.daeun.status,'declined');assert.equal(s.holidays.invites.seojin.status,'accepted');assert.ok(replies.some(line=>line.speaker==='다은 · 메시지'));
 assert.ok(H.buildInvite(s,'seojin',true).lines.every(line=>!line.cast?.length));restore(s);
});
test('Unanswered invitations cost affection once on the deadline and are no longer a promise',()=>{
 const s=base();s.date='2026-12-21';offer(s,'nari','consider');const before=s.bond.nari;s.date='2026-12-24';H.morning(s);H.morning(s);
 assert.equal(s.bond.nari,before-3);assert.equal(s.holidays.invites.nari.status,'missed');assert.equal(H.nariMayTalk(s),false);restore(s);
});
test('Only memories actually owned and protected words already kept can change Nari’s decision',()=>{
 let s=base();s.bond.nari=66;s.cards=['관객 한 명'];s.flags.keptAnonymousWords=2;meet(s);
 H.apply(s,{action:'recall',card:'관객 한 명'});assert.equal(s.bond.nari,69);s=restore(s);
 H.apply(s,{action:'recall',card:'관객 한 명'});assert.equal(s.bond.nari,69);
 H.apply(s,{action:'nariAnswer',answer:'first'});assert.equal(s.bond.nari,71);assert.ok(L.isLover(s,'nari'));assert.equal(s.flags.firstSaidLove,true);assert.equal(s.flags.nariIdentityShared,true);
 const after=JSON.stringify(s);assert.equal(H.apply(s,{action:'nariAnswer',answer:'first'}).length,0);assert.equal(JSON.stringify(s),after);restore(s);
 const absent=base();meet(absent);const value=absent.bond.nari;H.apply(absent,{action:'recall',card:'두 장의 종이'});assert.equal(absent.bond.nari,value);assert.equal(absent.holidays.nariMemory,null);
});
test('Nari remembers when the player pressed or peeked instead of inventing patience',()=>{
 for(const flags of [{knowsLuna:true,boothPeeked:true},{knowsLuna:true,questionedRadio:true},{knowsLuna:true}]) {
  const s=base();Object.assign(s.flags,flags);meet(s);
  const lines=H.apply(s,{action:'nariAnswer',answer:'first'}).map(line=>line.text||'').join(' ');
  assert.ok(!lines.includes('말할 때까지 기다렸구나'));
  assert.equal(lines.includes('그때 일, 나도 기억해'),!!(flags.boothPeeked||flags.questionedRadio));
  assert.equal(lines.includes('오늘은 내가 직접 말하고 싶었어'),!flags.boothPeeked&&!flags.questionedRadio);
 }
});
test('Other unresolved hearts make Nari withdraw while friend and deferred answers remain distinct',()=>{
 const rival=base();rival.bond.seojin=60;meet(rival);H.apply(rival,{action:'nariAnswer',answer:'first'});assert.equal(rival.holidays.nariOutcome,'withdrawn');assert.equal(rival.romance.status.nari,'friend');restore(rival);
 const friend=base();meet(friend);H.apply(friend,{action:'nariAnswer',answer:'friend'});assert.equal(friend.holidays.nariOutcome,'player-friend');assert.equal(L.lovers(friend).length,0);restore(friend);
 const deferred=base();deferred.date='2026-11-25';L.answer(deferred,'seojin','pending');deferred.date='2026-12-18';L.answer(deferred,'daeun','pending');deferred.date='2026-12-24';meet(deferred);
 H.apply(deferred,{action:'nariAnswer',answer:'defer'});assert.equal(deferred.holidays.nariReplyDate,'2027-02-14');assert.equal(deferred.romance.status.nari,'pending');assert.equal(H.mandatory(deferred,1),null);restore(deferred);
});
test('Nari’s own request to wait has no player-delay penalty and resolves on New Year’s Day',()=>{
 for(const accepted of [true,false]){
  let s=base();s.bond.nari=60;meet(s);H.apply(s,{action:'nariAnswer',answer:'first'});assert.equal(s.holidays.nariOutcome,'pending');assert.equal(s.holidays.nariReplyDate,'2027-01-01');
  s=restore(s);s.date='2026-12-25';assert.equal(L.repeatingFactor(s,'nari'),1);s.date='2027-01-01';if(accepted)s.bond.nari=72;
  assert.equal(H.mandatory(s,1),'nariNewYear');H.apply(s,{action:'newYearAnswer'});assert.equal(s.romance.status.nari,accepted?'lover':'friend');
  assert.equal(H.mandatory(s,1),null);restore(s);
 }
});
test('An exclusive partner and Nari’s night appointment require separate, honest decisions',()=>{
 for(const answer of ['keep','end','evade']){
  const s=base();s.date='2026-11-25';s.bond.seojin=80;L.answer(s,'seojin','accept');s.date='2026-12-21';offer(s,'nari','accept');s.date='2026-12-24';H.morning(s);
  assert.equal(H.mandatory(s,1),'holidayPromiseConflict');H.apply(s,{action:'conflict',answer});assert.equal(H.mandatory(s,1),null);
  assert.equal(s.romance.status.nari,'unresolved');
  if(answer==='keep'){assert.ok(L.isLover(s,'seojin'));assert.equal(s.holidays.invites.nari.status,'declined');assert.equal(H.nariMayTalk(s),false);}
  if(answer==='end'){assert.equal(s.romance.status.seojin,'friend');assert.equal(H.nariMayTalk(s),true);assert.equal(L.isLover(s,'nari'),false);}
  if(answer==='evade'){assert.equal(s.flags.equivocated,true);assert.equal(s.romance.clashes.length,1);}
  restore(s);
 }
});
test('Every existing lover must agree to the group Christmas; Nari remains a proposal until January’s consent',()=>{
 const s=base();s.date='2026-11-25';s.bond.seojin=s.bond.daeun=85;L.answer(s,'seojin','accept');s.date='2026-12-18';L.answer(s,'daeun','disclose');s.date='2026-12-19';L.agree(s);
 s.date='2026-12-21';offer(s,'daeun','group');assert.equal(H.invitedGroup(s),false);offer(s,'seojin','group');offer(s,'nari','group');assert.equal(H.invitedGroup(s),true);
 s.date='2026-12-24';meet(s);const lines=H.apply(s,{action:'nariAnswer',answer:'first'});
 assert.equal(s.romance.status.nari,'proposed');assert.equal(s.romance.talk.date,'2027-01-02');assert.equal(s.romance.talk.slot,1);
 assert.ok(lines.find(line=>line.text.includes('아까 그 방송')).cast.every(id=>id==='nari'));restore(s);
 s.date='2027-01-02';assert.ok(L.agree(s));assert.equal(L.lovers(s).length,3);restore(s);
});
test('A hidden relationship reaches Christmas’s real clash without requiring a fabricated witness',()=>{
 const s=base();s.date='2026-11-25';s.bond.seojin=s.bond.daeun=85;L.answer(s,'seojin','accept');s.date='2026-12-18';L.answer(s,'daeun','hide');s.date='2026-12-24';H.morning(s);
 assert.ok(s.romance.clashDue);const data=H.buildDay(s);assert.equal(data.time,2);assert.ok(data.lines[0].text.includes('서로에게 처음 알게'));
 L.settleClash(s,'seojin');H.morning(s);assert.equal(s.romance.clashDue,null);assert.equal(s.romance.clashes.length,1);restore(s);
});
test('The Christmas broadcast freezes shared history at airtime and replay never includes a second confession',()=>{
 const s=base();s.seen.push('nariSummer','nariClass');const episode=C.AquaWorld.episodeOn(s.date);R.air(s);const before=R.build(s,episode).lines.slice(1).map(line=>line.text);
 meet(s);H.apply(s,{action:'nariAnswer',answer:'first'});s.flags.nariHeardMelody=true;s.seen=[];
 const replay=R.build(s,episode,true);assert.deepEqual(replay.lines.slice(1).map(line=>line.text),before);assert.ok(replay.lines.every(line=>!line.choice&&!line.effect&&!line.cast?.length));
 const unknown=State.initial();unknown.date='2026-12-24';const noHero=H.buildNight(unknown);assert.ok(noHero.lines.every(line=>!line.cast?.length&&!line.choice));
});
test('All invitation scenes are reachable through actual seeded itineraries and keep unmet people hidden',()=>{
 for(const target of H.rules){const s=base();s.date=target.from;s.slot=1;s.bond={nari:60,daeun:60,seojin:60};let found=false;
  for(let day=0;day<17&&!found;day++){s.date=C.AquaWorld.addDays(target.from,day);for(const slot of [1,2]){s.slot=slot;for(let seed=0;seed<60&&!found;seed++){s.encounters={seed};found=C.AquaEncounters.resolve(s).scenes[target.place]===target.id;}if(found)break;}}
  assert.ok(found,target.id);assert.ok(Story.build(target.id,s).lines.some(line=>line.choice));
 }
});
await fs.writeFile(new URL('qa/campus-v2/holiday-results.json',root),JSON.stringify({passed:true,checks,scope:'Production holiday decisions, save restore, seeded invitation encounters and broadcast provenance; runtime and browser layout are separate checks.'},null,2)+'\n');
console.log(`${checks.length}/${checks.length} passed`);
