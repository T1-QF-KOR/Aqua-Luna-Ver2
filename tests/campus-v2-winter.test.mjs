import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url), C={structuredClone};C.window=C;vm.createContext(C);
const html=await fs.readFile(new URL('campus.html',root),'utf8');
for(const [,path] of html.matchAll(/<script defer src="([^"]+)">/g))if(!path.endsWith('/game.js'))vm.runInContext(await fs.readFile(new URL(path,root),'utf8'),C);
const W=C.AquaWorld,L=C.AquaRomance,Story=C.AquaStory,State=C.AquaState;
const reached=[];
for(const target of C.AquaWinter.rules){
 const s=State.initial();s.met=['nari','daeun','seojin'];s.bond={nari:70,daeun:80,seojin:80};s.knowledge=s.fitness=s.sensitivity=40;
 s.seen=Object.keys(C.AQUA_SCENES).filter(id=>id!==target.id);s.flags={knowsOffer:true};C.AquaRelationships.migrate(s);
 const id=target.id.startsWith('daeun')?'daeun':'seojin';
 if(target.lover){s.date=id==='daeun'?'2026-12-18':'2026-11-25';L.answer(s,id,'accept');}
 else if(target.romance||target.id==='daeunAfterAnswer'){s.date=id==='daeun'?'2026-12-18':'2026-11-25';L.answer(s,id,target.romance?.[id]||'friend');}
 let found=false;
 for(let date=target.from;date<=target.to&&!found;date=W.addDays(date,1)){
  s.date=date;
  for(const slot of target.slot===undefined?[1,2]:[target.slot]){s.slot=slot;
   for(let seed=0;seed<60&&!found;seed++){s.encounters={seed};if(C.AquaEncounters.resolve(s).scenes[target.place]!==target.id)continue;
    assert.ok(Story.available(s,target.place).some(rule=>rule.id===target.id));assert.ok(State.restore(JSON.parse(JSON.stringify(s))));found=true;}
   if(found)break;
  }
 }
 assert.ok(found,`Unreachable ${target.id}`);reached.push(target.id);
}
const s=State.initial();s.met=['nari','daeun','seojin'];s.date='2026-11-25';s.bond={nari:60,daeun:80,seojin:60};
// Invitations use existing relationship state; a secret or pending talk is not group consent.
for (const mode of ['open','hidden']) {
 const day=State.initial();day.date='2026-12-19';day.met=['nari','daeun'];day.bond={nari:90,daeun:90,seojin:0};
 assert.ok(L.answer(day,'nari','accept'));assert.ok(L.answer(day,'daeun',mode==='open'?'disclose':'hide'));
 if(mode==='open'){day.date=day.romance.talk.date;assert.ok(L.agree(day));}
 day.date='2027-02-14';const before=JSON.stringify(day.romance),data=C.AquaWinter.buildValentine(day);
 const choices=data.lines.find(line=>line.choice).choice;
 assert.equal(choices.some(choice=>choice.label.includes('각자 물어본다')),mode==='open');
 if(mode==='open')assert.ok(choices.find(choice=>choice.label.includes('각자 물어본다')).lines[0].text.includes('각자 좋다는 답'));
 assert.equal(JSON.stringify(day.romance),before);assert.ok(State.restore(JSON.parse(JSON.stringify(day))));
}
const pending=State.initial();pending.date='2026-12-19';pending.met=['daeun'];pending.bond.daeun=80;
assert.ok(L.answer(pending,'daeun','pending'));pending.date='2027-02-14';
const pendingChoice=C.AquaWinter.buildValentine(pending).lines.find(line=>line.choice).choice.find(choice=>choice.label.includes('다은'));
assert.ok(pendingChoice.lines.some(line=>line.text?.includes('오늘 답하라는 뜻은 아냐')));assert.equal(pending.romance.status.daeun,'pending');
// January never assumes a job or relationship that the player did not establish.
for (const [flags, expected, absent] of [
 [{}, '아직 지원한 건 아니야', '다음 수업 계획이야'],
 [{seojinApplied:true}, '연락 기다리는 중', '아직 지원한 건 아니야'],
 [{seojinApplied:true,seojinHired:true}, '다음 수업 계획이야', '연락 기다리는 중']
]) {
 const january=State.initial();january.date='2027-01-06';january.slot=1;january.met=['seojin'];january.bond.seojin=50;january.flags=flags;
 const text=Story.build('seojinJanuary',january).lines.map(line=>line.text||'').join(' ');
 assert.ok(text.includes(expected));assert.ok(!text.includes(absent));
}
const stranger=State.initial();stranger.date='2027-01-06';stranger.slot=1;
assert.ok(!Story.eligible(stranger,'club').some(rule=>['nariJanuary','daeunJanuary'].includes(rule.id)));
assert.ok(!Story.eligible(stranger,'cafe').some(rule=>rule.id==='seojinJanuary'));
// Autumn and recording callbacks must not claim moments the player skipped.
for (const hadFestival of [false,true]) {
 const nari=State.initial();if(hadFestival)nari.flags.autumnWithNari=true;
 const text=Story.build('nariRecord',nari).lines.map(line=>line.text||'').join(' ');
 assert.equal(text.includes('축제 끝나고 계단에서'),hadFestival);
}
for (const sawRecording of [false,true]) {
 const nari=State.initial();if(sawRecording)nari.seen.push('nariRecord');
 const text=Story.build('nariPaper',nari).lines.map(line=>line.text||'').join(' ');
 assert.equal(text.includes('그날 정류장에서 가 보면'),sawRecording);
}
assert.equal(C.AquaWinter.mandatory(s,2),'seojinConfess');s.met=[];assert.equal(C.AquaWinter.mandatory(s,2),null);
s.met=['nari','daeun','seojin'];L.answer(s,'seojin','accept');s.date='2026-12-18';s.bond.daeun=69;assert.equal(C.AquaWinter.mandatory(s,2),'winterTermEnd');
s.bond.daeun=70;assert.equal(C.AquaWinter.mandatory(s,2),'daeunConfess');
// A special recording heard twice offers no second gift and never exposes a portrait.
const special=State.initial();special.date='2026-11-19';special.radio.listened=['radio-2026-04-02'];special.radio.hiatusUntil='2026-12-17';
const episode=W.episodeOn(special.date),first=C.AquaRadio.build(special,episode);
assert.ok(first.lines.some(line=>line.choice));assert.ok(first.lines.every(line=>!line.cast?.length));assert.equal(special.radio.aired[episode.id].rerun,false);
C.AquaRadio.finish(special,episode.id);assert.ok(C.AquaRadio.build(special,episode,true).lines.every(line=>!line.choice&&!line.effect));
// Replay uses the final broadcast's original history, even if later state changes.
const finale=State.initial();finale.date='2027-02-25';finale.slot=3;finale.flags.nariWinterOwnSong=true;
finale.radio.listened=['radio-2026-12-24'];const last=W.episodeOn(finale.date);
const firstLast=C.AquaRadio.build(finale,last);assert.ok(firstLast.lines.some(line=>line.text?.includes('다 쓰지 못한 노래')));
finale.flags.nariWinterOwnSong=false;finale.flags.nariHeardMelody=true;finale.radio.listened=[];
const replayLast=C.AquaRadio.build(finale,last,true);
assert.ok(replayLast.lines.some(line=>line.text?.includes('다 쓰지 못한 노래')));
assert.ok(replayLast.lines.some(line=>line.text?.includes('성탄절에는 노래')));
assert.ok(!replayLast.lines.some(line=>line.text?.includes('여덟 마디')));
assert.ok(replayLast.lines.every(line=>!line.effect&&!line.cast?.length));
for(const episode of W.broadcasts.slice(21,28).filter(episode=>episode.number!==24)){
 const radio=State.initial();radio.date=episode.date;radio.slot=3;
 assert.ok(C.AquaRadio.build(radio,episode).lines.filter(line=>line.speaker==='루나').length>=7,`Short broadcast ${episode.number}`);
}
await fs.writeFile(new URL('qa/campus-v2/winter-results.json',root),JSON.stringify({passed:true,reachableEncounters:reached,scenes:Object.keys(C.AquaWinter.scenes),scope:'Production modules, relationship-specific reachability, confession gates and protected broadcast replay. Runtime and layout verified separately.'},null,2)+'\n');
console.log(`PASS ${reached.length} reachable winter encounters, two confession gates, protected special broadcast and six regular broadcasts`);
