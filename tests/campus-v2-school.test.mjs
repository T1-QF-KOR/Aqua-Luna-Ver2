import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),C={structuredClone};C.window=C;vm.createContext(C);
const html=await fs.readFile(new URL('campus.html',root),'utf8');
for(const [,path] of html.matchAll(/<script defer src="([^"]+)">/g))if(!path.endsWith('/game.js'))vm.runInContext(await fs.readFile(new URL(path,root),'utf8'),C);
const School=C.AquaSchool,W=C.AquaWorld,checks=[];
const test=(name,fn)=>{fn();checks.push(name);console.log('PASS '+name);};
let schoolDays=0;
test('Both semesters contain sixteen authored weeks with 160 different daily beats and complete academic-calendar coverage',()=>{
  assert.equal(School.spring.length,16);assert.equal(School.autumn.length,16);
  const beats=[...School.spring,...School.autumn].flatMap(week=>{assert.equal(week.length,6);return [...week].slice(1);});assert.equal(new Set(beats).size,160);
  for(let date='2026-03-03';date<='2026-12-18';date=W.addDays(date,1)){
    const s=C.AquaState.initial();Object.assign(s,{date,slot:0});
    if(!W.hasClass(date)){assert.equal(School.available(s),false);continue;}
    schoolDays++;assert.equal(School.available(s),true);const data=School.build(s);
    assert.ok(data.lines.length>=3&&data.lines.length<=9);assert.ok(data.lines.every(line=>!line.text?.includes('undefined')));assert.ok(data.lines.every(line=>!line.cast?.length));
    assert.ok(data.lines.some(line=>line.text===School.chapter(s).entry[W.weekday(date)]));assert.ok(C.AquaState.restore({...s,scene:{...data,queue:data.lines,index:0,after:'event'}}));
    s.seen.push(data.id);assert.equal(School.available(s),false);
  }
});
test('Classroom actors follow the saved attendance plan, exclude the café worker, and never introduce an unknown heroine',()=>{
  for(const date of ['2026-03-09','2026-03-10','2026-04-21','2026-09-08','2026-11-16'])for(let seed=0;seed<100;seed++){
    const s=C.AquaState.initial();Object.assign(s,{date,slot:0,met:['nari','daeun','seojin']});s.encounters.seed=seed;
    const data=School.build(s),present=W.presentAt(s,'class');
    for(const id of new Set(data.lines.flatMap(line=>line.cast||[]))){assert.ok(present.includes(id));assert.notEqual(id,'seojin');if(id==='nari')assert.ok([2,4].includes(W.weekday(date)));}
    const before=JSON.stringify(s.encounters.plan);School.build(s);assert.equal(JSON.stringify(s.encounters.plan),before);
  }
});
test('Location follow-ups need a completed school day, remain optional and actor-free, and never manufacture a visit or sound recording',()=>{
  const s=C.AquaState.initial();Object.assign(s,{date:'2026-03-09',slot:1});assert.equal(School.field(s,'river'),null);
  s.seen.push('school-2026-03-09');const before=JSON.stringify(s),data=School.field(s,'river');assert.equal(JSON.stringify(s),before);
  assert.ok(data.lines.every(line=>!line.cast?.length));assert.equal(data.lines.at(-1).choice.length,2);assert.equal(data.lines.at(-1).choice[1].effect,undefined);
  School.observe(s,'river');assert.equal(s.flags.schoolObservation,'river');assert.equal(s.music.songs.length,0);assert.equal(s.social.album.length,0);
  s.flags['schoolOutside:2026-03-09']=true;assert.equal(School.field(s,'room'),null);
  s.date='2026-07-13';assert.equal(School.field(s,'river'),null);
});
test('A side story never summons a heroine whose itinerary says she is absent, including during a café shift',()=>{
  const s=C.AquaState.initial();Object.assign(s,{date:'2026-04-06',slot:1,met:['nari','daeun','seojin'],bond:{nari:65,daeun:65,seojin:65}});
  s.encounters.plan={key:s.date+':1',locations:{nari:null,daeun:null,seojin:null},scenes:{}};
  for(const place of ['roof','studio','club','river','library','cafe']){
    const data=C.AquaSmallEvents.people(structuredClone(s),place);assert.ok(!data||data.lines.every(line=>!line.cast?.length));
  }
  s.workDays.push(s.date);
  for(let i=0;i<20;i++){const data=C.AquaSmallEvents.maybe(s,'cafe');if(!data)break;assert.ok(data.lines.every(line=>!line.cast?.includes('seojin')));}
});
await fs.writeFile(new URL('qa/campus-v2/school-results.json',root),JSON.stringify({date:'2026-10-30',passed:true,checks,authoredWeeks:32,authoredDailyBeats:160,schoolDays,scope:'Production school and encounter rules; visual browser QA recorded separately.'},null,2)+'\n');
console.log(`${checks.length}/${checks.length} passed; ${schoolDays} academic days covered`);
