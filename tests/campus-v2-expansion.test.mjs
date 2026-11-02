import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url), C={structuredClone,console};C.window=C;vm.createContext(C);
const html=await fs.readFile(new URL('index.html',root),'utf8');
for(const [,path]of html.matchAll(/<script defer src="([^"]+)">/g))if(!path.endsWith('/game.js'))vm.runInContext(await fs.readFile(new URL(path,root),'utf8'),C);
const {AquaState:State,AquaWorld:W,AquaEconomy:E,AquaRelationships:B,AquaStory:Story}=C;
const s=State.initial();s.date='2026-05-27';s.slot=1;s.met=['nari','daeun','seojin'];
assert.equal(E.workReason(s),'');s.workDays.push(s.date);assert.equal(E.workReason(s),'오늘 근무는 끝났어.');
s.slot=0;s.workDays=[];assert.ok(E.workReason(s));
s.flags.crossRainDate=s.date;s.seen.push('crossRain');s.bond.seojin=54;B.ensure(s).pending.seojin='seojinRain';s.knowledge=15;
assert.ok(!Story.eligible(s,'cafe').some(r=>r.id==='seojinRain'));
s.flags.umbrellaDaeun=true;assert.ok(Story.build('seojinRain',s).lines[0].text.includes('돌려준'));
assert.ok(E.clothes.length===10 && E.clothes.every(i=>i.price>=50000&&i.price<=120000));
const g=State.initial();for(let i=0;i<10;i++)E.gain(g,'fitness',3);assert.equal(g.fitness,3);assert.ok(g.growth.fitness>.59);
assert.ok(E.buyEquipment(g,'headphones'));const cash=g.money;assert.ok(!E.buyEquipment(g,'headphones'));assert.equal(g.money,cash);
for(const gate of B.gates){const t=State.initial();t.met=[gate.person];for(const previous of B.gates.filter(x=>x.person===gate.person&&x.value<gate.value))B.ensure(t).unlocked.push(previous.id);
 t.bond[gate.person]=gate.value-2;B.change(t,gate.person,8);assert.equal(t.bond[gate.person],gate.value-1);assert.equal(B.ensure(t).pending[gate.person],gate.id);
 if(gate.stat){assert.ok(!B.ready(t,gate));t[gate.stat]=15;}assert.ok(B.ready(t,gate));B.finish(t,gate.id);assert.equal(t.bond[gate.person],gate.value);const snapshot=JSON.stringify(t);B.finish(t,gate.id);assert.equal(JSON.stringify(t),snapshot);
}
const chat=State.initial();chat.met=['nari','daeun','seojin'];for(let i=0;i<121;i++)for(const id of chat.met){W.recurringBond(chat,id,4,'chat');const gate=B.gates.find(g=>B.ready(chat,g));if(gate)B.finish(chat,gate.id);}assert.ok(chat.bond.nari<45&&chat.bond.daeun<35&&chat.bond.seojin<35);
const old=State.initial();old.version=2;old.seen=['daeunFirst'];old.bond.daeun=20;const restored=State.restore(old);assert.ok(restored.relationships.unlocked.includes('daeunFirst'));assert.equal(restored.bond.daeun,20);assert.equal(restored.relationships.rewards.length,0);
const distant=State.initial();distant.date='2026-04-20';distant.met=['nari'];distant.bond.nari=20;distant.social.lastMet.nari='2026-04-01';B.monday(distant);assert.equal(distant.bond.nari,18);B.monday(distant);assert.equal(distant.bond.nari,18);assert.ok(distant.social.nariDistanceWeek);
console.log('PASS expansion: shifts, rain continuity, fractional stats, purchases, eight gates, chat cap, migration, weekly decay');
export {C,root};
const M=C.AquaMessages,ms=State.initial();ms.met=['daeun'];ms.bond.daeun=15;ms.date='2026-04-01';M.morning(ms);assert.equal(ms.messages.inbox.length,2);M.morning(ms);assert.equal(ms.messages.inbox.length,2);
const msg=ms.messages.inbox[0];assert.ok(M.respond(ms,msg.id,'honest'));const b=ms.bond.daeun;assert.ok(!M.respond(ms,msg.id,'honest'));assert.equal(ms.bond.daeun,b);
const ap=ms.messages.appointments[0];assert.ok(M.respond(ms,ap.id,'accept'));ms.date=W.addDays(ap.date,1);M.morning(ms);assert.equal(ap.status,'missed');const after=ms.bond.daeun;M.morning(ms);assert.equal(ms.bond.daeun,after);assert.ok(ms.social.missedGreeting.daeun);
assert.equal(M.hint(ms).join(),M.hint(ms).join());assert.ok(State.restore(JSON.parse(JSON.stringify(ms))));console.log('PASS messages: cadence, replies, invitation, missed promise, hint, save');
const Music=C.AquaComposition,music=State.initial();for(let round=0;round<4;round++){assert.ok(Music.begin(music));for(let bar=0;bar<4;bar++)assert.ok(Music.choose(music,Music.cards(music)[0][0]));assert.ok(Music.settle(music));const saved=State.restore(JSON.parse(JSON.stringify(music)));assert.ok(saved);assert.ok(!Music.settle(music));assert.ok(Music.complete(music,'질문'));music.energy=100;}
assert.equal(music.music.songs.length,1);music.met=['nari','daeun'];Music.share(music,music.music.songs[0].id,'nari');assert.ok(music.flags.nariHeardMelody);assert.ok(!music.music.songs[0].heard.daeun);const beforeShare=music.bond.nari;Music.share(music,music.music.songs[0].id,'nari');assert.equal(music.bond.nari,beforeShare);console.log('PASS composition: four bars, four fragments, resume, one reward per listener');
for(const person of ['nari','daeun','seojin'])for(const destination of C.AquaSocial.destinations){const outing={person,destination:destination.id,variant:0};const scene=C.AquaOutings.build(State.initial(),outing);assert.equal(scene.lines.filter(x=>x.choice).length,4);assert.ok(scene.lines.length>=12);for(const step of scene.lines.filter(x=>x.choice).slice(1))assert.equal(step.choice.length,3);}
assert.equal(C.AquaDateActivities.result({points:8}),'good');assert.equal(C.AquaDateActivities.result({points:5}),'normal');assert.equal(C.AquaDateActivities.result({points:1}),'poor');console.log('PASS dates: 15 person/place combinations, four choices, three results');
const Small=C.AquaSmallEvents;assert.equal(Small.observations.length,132);assert.ok(Small.observations.filter(x=>x.choice).length>=20);assert.equal(Object.keys(Small.places).length,11);
const v=State.initial();v.met=['daeun'];v.date='2026-04-19';for(const place of Object.keys(Small.places)){assert.equal(Small.first(v,place).lines.length,3);assert.equal(Small.first(v,place),null);}for(const id of ['exam','party','vacation']){const x=Small.commonScene(v,id);assert.ok(x.lines.length>=9);assert.ok(x.lines.some(l=>l.speaker==='다은'));}
let emitted=null;for(let seed=0;seed<200&&!emitted;seed++){v.encounters.seed=seed;emitted=Small.maybe(v,'library');}assert.ok(emitted);assert.ok(v.smallEvents.seen.includes(emitted.id));assert.ok(State.restore(JSON.parse(JSON.stringify(v))));console.log('PASS small events: 132, 110 choice events, 11 first visits, 3 met-aware common scenes');
for(const ep of W.broadcasts.slice(0,12)){const radio=State.initial();radio.date=ep.date;radio.slot=3;const scene=C.AquaRadio.build(radio,ep);assert.ok(scene.lines.length>=8&&scene.lines.length<=12,`episode ${ep.number}: ${scene.lines.length}`);assert.ok(scene.lines.filter(l=>l.speaker==='루나').length>=5);}
const costumes=State.initial();assert.ok(C.AquaWardrobe.source(costumes,'nari',{wardrobe:{nari:'campus'}},'smile').endsWith('nari-campus-v6.png'));C.AquaWardrobe.expressions.nari={campus:{smile:'nari/campus-smile.png'}};assert.ok(C.AquaWardrobe.source(costumes,'nari',{wardrobe:{nari:'campus'}},'smile').endsWith('/nari/campus-smile.png'));delete C.AquaWardrobe.expressions.nari;assert.ok(C.AquaWardrobe.source(costumes,'nari',{wardrobe:{nari:'campus'}},null).endsWith('nari-campus-v6.png'));
assert.equal(Object.keys(C.AquaAudio.tracks).length,3);console.log('PASS radio length, expression fallback source, optional audio tracks');
const seasons=State.initial();seasons.date='2026-04-01';seasons.slot=1;const sampled=[];for(let day=0;day<120;day++){seasons.date=W.addDays('2026-04-01',day%55);seasons.encounters.seed=day;const hit=Small.maybe(seasons,'library');if(hit)sampled.push(hit.id);}
assert.ok(sampled.length>6);assert.equal(new Set(sampled.slice(0,6)).size,6);assert.equal(new Set(sampled.slice(6,12)).size,6);assert.ok(sampled.every(id=>id.includes('-spring-')));console.log('PASS small events respect season and exhaust local pool without early repeats');
// Map hints only reveal met, scheduled characters at their settled location.
const hints=State.initial();hints.met=['nari','daeun','seojin'];let shown=0;
for(let day=0;day<121;day++){hints.date=W.addDays('2026-03-02',day);for(const slot of [1,2]){hints.slot=slot;C.AquaEncounters.ensurePlan(hints);for(const place of Object.keys(Small.places)){for(const id of C.AquaEncounters.hints(hints,place)){shown++;assert.ok(W.presentAt(hints,place).includes(id));assert.ok(W.scheduledAt(hints,place).includes(id));assert.ok(!(id==='nari'&&W.weekday(hints.date)===4&&slot===2));}}}}
assert.ok(shown>0);hints.met=[];assert.deepEqual([...C.AquaEncounters.hints(hints,'club')],[]);
const work=State.initial();work.met=['seojin'];work.date='2026-04-01';work.slot=1;const workIds=[];
for(let i=0;i<100 && workIds.length<8;i++){work.date=W.addDays('2026-04-01',i);if(![3,5,6].includes(W.weekday(work.date)))continue;work.workDays.push(work.date);const event=Small.maybe(work,'cafe');if(!event?.id.startsWith('work-'))continue;workIds.push(event.id);assert.ok(event.lines.length>=5);assert.equal(event.lines.at(-1).choice.length,2);}
assert.equal(new Set(workIds).size,8);assert.ok(State.restore(JSON.parse(JSON.stringify(work))));
const rec=State.initial();rec.money=200000;assert.ok(E.buyEquipment(rec,'recorder'));rec.music.fragments=3;rec.music.score={nari:3,daeun:1,seojin:0};rec.music.active={settled:true};assert.ok(Music.complete(rec,'녹음'));assert.equal(rec.music.songs[0].score.nari,4);
assert.ok(State.restore(JSON.parse(await fs.readFile(new URL('qa/campus-v2/may-qa-save.json',root),'utf8'))));
console.log('PASS map hints, eight work stories, recorder effect, May save');
const peopleEvents=C.AquaPeopleEvents.events;
assert.equal(peopleEvents.length,40);
for(const id of ['nari','daeun','seojin']) assert.ok(peopleEvents.filter(x=>x.person===id).length>=8);
assert.ok(peopleEvents.filter(x=>x.speaker).length>=10);
assert.ok(peopleEvents.filter(x=>x.reaction&&x.choices.some(c=>c.effect.smallTopic)).length>=20);
assert.ok(peopleEvents.filter(x=>x.after).length>=8);
assert.equal(new Set(peopleEvents.map(x=>x.id)).size,peopleEvents.length);
for(const e of peopleEvents){assert.equal(e.setup.length,3);assert.equal(e.choices.length,2);assert.ok(e.choices.every(c=>c.text&&c.label&&c.effect));assert.notDeepEqual(e.choices[0].effect,e.choices[1].effect);assert.ok(e.days.length);assert.ok(['spring','summer'].includes(e.season));assert.ok([1,2].includes(e.slot));}
const unknown=State.initial();unknown.date='2026-04-06';unknown.slot=1;let unknownHits=0;
for(let i=0;i<500;i++){unknown.encounters.seed=i;const candidate=Small.people(unknown,'roof');if(candidate){unknownHits++;assert.ok(!candidate.lines.some(l=>l.cast?.length));}}
assert.equal(unknownHits,0,'Unmet heroines never appear');
const encounters=State.initial();encounters.met=['nari'];encounters.date='2026-04-06';encounters.slot=1;
let event;for(let i=0;i<200&&!event;i++){encounters.encounters.seed=i;event=Small.people(encounters,'roof');}
assert.ok(event);assert.ok(['n01','n05'].includes(event.id));assert.ok(event.lines.some(l=>l.speaker==='나리'));assert.equal(event.lines.at(-1).choice[0].effect.smallTopic,event.id);assert.ok(State.restore(JSON.parse(JSON.stringify(encounters))));
console.log('PASS forty authored encounters, 24 personal topic cards, eligibility, branches and persistence');
for(const source of ['message','hint'])for(const id of ['nari','daeun','seojin'])assert.equal(M.tomorrowSpeech[source][id].length,5);
const tomorrow=State.initial();tomorrow.met=['nari','daeun','seojin'];let forecasts=0;
for(let day=0;day<120;day++){tomorrow.date=W.addDays('2026-03-02',day);for(const id of tomorrow.met){const found=M.tomorrowPlace(tomorrow,id);if(!found)continue;forecasts++;const next={...tomorrow,date:W.addDays(tomorrow.date,1),slot:found.time==='오후'?1:2,encounters:{...tomorrow.encounters,plan:null}};assert.ok(W.scheduledAt(next,found.place).includes(id));assert.equal(C.AquaEncounters.resolve(next).locations[id],found.place);assert.ok(!(id==='nari'&&W.weekday(next.date)===4&&next.slot===2));assert.ok(M.tomorrowLine(tomorrow,id,'hint').includes(Small.places[found.place].name));}}
assert.ok(forecasts>20);tomorrow.met=[];assert.equal(M.tomorrowLine(tomorrow,'nari','message'),'');console.log('PASS tomorrow messages and tips use met characters, scheduled public places and no Thursday secret');
for(const target of peopleEvents){const t=State.initial();t.met=['nari','daeun','seojin'];t.bond={nari:60,daeun:60,seojin:60};t.club='radio';t.smallEvents.seen=peopleEvents.filter(e=>e.id!==target.id).map(e=>e.id);let reachable=false;
 for(let day=0;day<121&&!reachable;day++){t.date=W.addDays('2026-03-02',day);t.slot=target.slot;for(let seed=0;seed<30&&!reachable;seed++){t.encounters={seed};const got=Small.people(t,target.place);if(got?.id===target.id)reachable=true;}}
 assert.ok(reachable,`${target.id} has no reachable first-semester state`);
}
for(const id of ['nari','daeun','seojin']){const t=State.initial();t.met=[id];t.bond[id]=0;let found=null;for(let day=0;day<28&&!found;day++){t.date=W.addDays('2026-04-01',day);for(const slot of [1,2]){t.slot=slot;for(const place of Object.keys(Small.places)){if(!W.presentAt(t,place).includes(id))continue;found=Small.approach(t,id,place);if(found)break;}if(found)break;}}
 assert.ok(found,`${id} can approach below friend stage`);const flag=found.lines[0].effect.flag;t.flags[flag]=true;const loc=Object.keys(Small.places).find(place=>W.presentAt(t,place).includes(id));assert.equal(Small.approach(t,id,loc),null,'Only one approach per day');assert.equal(t.bond[id],0);
}
console.log('PASS every authored event has a reachable state; first contact works at zero affection');
