// Deterministic model using production rules and scene data. This does not drive game.js or certify UI behavior.
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url), C={structuredClone,console}; C.window=C; vm.createContext(C);
const html=await fs.readFile(new URL('index.html',root),'utf8');
for(const [,path] of html.matchAll(/<script defer src="([^"]+)">/g)) if(!path.endsWith('/game.js')) vm.runInContext(await fs.readFile(new URL(path,root),'utf8'),C,{filename:path});
const {AquaWorld:W,AquaState:State,AquaEncounters:Enc,AquaSocial:S,AquaRelationships:B,AquaDialogue:D,AquaEconomy:E,AquaMessages:M,AquaStory:Story,AquaSmallEvents:Small}=C;
const places=['class','library','dining','cafe','club','studio','radio','roof','river','concert','room'];
function run(strategy,seed){
 const s=State.initial('테스트','물고기');s.encounters.seed=seed;s.club='band';let chatLines=[],weekly={},messages=0,invitations=0,income=0,actions=0,lastDate=null,dates=0,peopleScenes=0,approaches=0,approachPersons={nari:0,daeun:0,seojin:0};
 const record=()=>{const k=W.weekKey(s.date);weekly[k]=(weekly[k]||0)+1;};
 function effects(effect){if(!effect)return;if(effect.meet&&!s.met.includes(effect.meet))s.met.push(effect.meet);if(effect.flag)s.flags[effect.flag]=true;if(effect.club)s.club=effect.club;
  if(effect.bond)for(const [id,amount]of Object.entries(effect.bond))B.change(s,id,amount);
  if(effect.recurring)for(const [id,amount]of Object.entries(effect.recurring))W.recurringBond(s,id,amount);
  if(effect.stats)for(const [k,v]of Object.entries(effect.stats))if(E.stats.includes(k)&&v>0)E.gain(s,k,v);else s[k]=W.clamp((s[k]||0)+v,k==='money'?999999999:100);
  if(effect.card&&!s.cards.includes(effect.card))s.cards.push(effect.card);if(effect.clue)s.radio.clues[effect.clue]=true;
 }
 function scene(id,data){for(const line of data.lines){if(id.startsWith('approach-')&&line.speaker&&line.text)chatLines.push(line.text);effects(line.effect);if(line.choice){const chosen=line.choice.find(x=>Story.allowed(s,x.requires));if(chosen){effects(chosen.effect);for(const next of chosen.lines||[])effects(next.effect);}}}
  if(id==='crossRain')s.flags.crossRainDate=s.date;if(!s.seen.includes(id))s.seen.push(id);B.finish(s,id);if(id.startsWith('approach-')){approaches++;approachPersons[id.split('-')[1]]++;}if(C.AquaPeopleEvents.events.some(x=>x.id===id))peopleScenes++;if(id.startsWith('common-') || id.startsWith('work-') || id.startsWith('approach-') || C.AquaPeopleEvents.events.some(x=>x.id===id) || ['prologue','entrance','daeunMeet','fair','festival'].includes(id) || B.gates.some(g=>g.id===id))record();
 }
 function work(routeWork=false){if(E.workReason(s)||s.energy<22)return false;s.workDays.push(s.date);s.energy-=22;s.money+=32000;income+=32000;actions++;
  if(!s.met.includes('seojin'))scene('seojinMeet',Story.build('seojinMeet',s));else if(!routeWork){const event=Small.maybe(s,'cafe');if(event && (event.id.startsWith('work-') || C.AquaPeopleEvents.events.some(x=>x.id===event.id)))scene(event.id,event);}return true;}
 function train(kind){if(kind==='rest'){s.energy=W.clamp(s.energy+30);return;}if(s.energy<15){s.energy=W.clamp(s.energy+10);return;}
  if(kind==='fitness'){s.energy=W.clamp(s.energy-15);E.gain(s,'fitness',3);}
  if(kind==='sensitivity'){s.energy=W.clamp(s.energy-10);E.gain(s,'sensitivity',3);}
  if(kind==='knowledge'){s.energy=W.clamp(s.energy-12);E.gain(s,'knowledge',3);}
 }
 function social(){let ids=s.met.filter(id=>places.some(p=>W.presentAt(s,p).includes(id))&&s.conversations[id]?.date!==s.date);
  if(strategy==='nari')ids=ids.filter(id=>id==='nari');
  for(const id of ids){const place=places.find(p=>W.presentAt(s,p).includes(id));chatLines.push(D.greeting(s,id,place));const approach=Small.approach(s,id,place);if(approach)scene(approach.id,approach);const i=(W.dateObject(s.date).getUTCDate()+actions)%6, line=D.peekTalk(s,id,i);D.commit(s,line.key);chatLines.push(line.text);W.recurringBond(s,id,3,'chat');s.conversations[id]={date:s.date,topics:[D.topics[i]]};}
 }
 function route(){const eligible=places.flatMap(p=>Story.available(s,p));if(!eligible.length)return false;
  eligible.sort((a,b)=>strategy==='nari'?(W.routeOwners[b.id]||[]).includes('nari')-(W.routeOwners[a.id]||[]).includes('nari'):0);
  const r=eligible[0];if(r.work&&!work(true))return false;scene(r.id,Story.build(r.id,s));return true;
 }
 function finishOuting(outing){const script=C.AquaOutings.build(s,outing);for(const line of script.lines){if(!line.choice)continue;const choice=line.choice.find(x=>Story.allowed(s,x.requires));if(!choice)continue;if(choice.effect?.datePoints!==undefined)outing.points=(outing.points||0)+choice.effect.datePoints;if(choice.effect?.dateChoice)outing.memory=choice.effect.dateChoice;effects(choice.effect);}outing.result=C.AquaDateActivities.result(outing);outing.bonus={good:4,normal:3,poor:2}[outing.result];S.finishDate(s,outing);record();}
 function dateOuting(){if(!['balanced','nari'].includes(strategy)||s.date<'2026-04-01'||lastDate&&W.addDays(lastDate,21)>s.date)return false;
  const candidates=s.met.filter(id=>strategy!=='nari'||id==='nari');for(const id of candidates){const place=places.find(p=>W.presentAt(s,p).includes(id));if(!place)continue;const result=S.invite(s,id,'river',place,s.date==='2026-05-20');if(result.ok){finishOuting(result.outing);lastDate=s.date;dates++;return true;}}return false;}
 for(let date='2026-03-02';date<='2026-06-30';date=W.addDays(date,1)){s.date=date;s.slot=0;B.monday(s);M.morning(s);
  for(const m of s.messages.inbox.filter(m=>m.date===date&&m.kind==='regular')){messages++;if(strategy!=='chat')M.respond(s,m.id,'honest');}
  for(const m of s.messages.inbox.filter(m=>m.date===date&&m.kind==='invite')){invitations++;M.respond(s,m.id,'accept');}
  if(date==='2026-03-02'){scene('prologue',Story.build('prologue',s));continue;}
  if(date==='2026-03-03'){s.slot=0;const sc=Story.build('entrance',s);const choice=sc.lines.find(x=>x.choice);choice.choice=[choice.choice[1]];scene('entrance',sc);}
  else if(W.hasClass(date)){E.gain(s,'knowledge',1);s.energy=W.clamp(s.energy-5);}
  for(let slot=1;slot<=2;slot++){s.slot=slot;Enc.ensurePlan(s);
   const mandatory=date==='2026-03-05'&&slot===1?'daeunMeet':date==='2026-03-10'&&slot===1?'fair':date==='2026-05-20'&&slot===2?'festival':null;
   const common=date==='2026-04-19'&&slot===1?'exam':date==='2026-06-19'&&slot===2?'party':date==='2026-06-20'&&slot===1?'vacation':null;
   if(mandatory){scene(mandatory,Story.build(mandatory,s));continue;}if(common){scene(`common-${common}`,Small.commonScene(s,common));continue;}
   const appointment=s.messages.appointments.find(a=>M.due(s,a.place)===a);
   if(appointment&&s.energy>=15){const outing=M.start(s,appointment.id);if(outing){finishOuting(outing);continue;}}
   if(strategy==='chat' && !s.met.includes('seojin') && date>='2026-03-11' && work())continue;
   if(strategy!=='chat' && (strategy!=='money' || E.workReason(s)) && route())continue;
   if(strategy!=='money' || E.workReason(s))social();
   if(slot===1&&dateOuting())break;
   if(strategy==='money'&&work())continue;
   if(strategy==='balanced'&&slot===2&&work())continue;
   let kind=strategy==='money'?'rest':strategy==='nari'?'sensitivity':['knowledge','fitness','sensitivity'][(actions+W.dateObject(date).getUTCDate()+slot)%3];
   let place={knowledge:'library',fitness:'river',sensitivity:'club',rest:'room'}[kind];
   if(strategy==='nari' && kind==='sensitivity' && actions%2===0)place='studio';
   if(strategy==='money' && kind==='rest' && actions%2===0)place='roof';
   if(s.energy<22){kind='rest';place='room';}if(place==='studio' && kind==='sensitivity'){s.energy=W.clamp(s.energy-10);E.gain(s,'sensitivity',2);E.gain(s,'knowledge',1);}else if(place==='roof'&&kind==='rest')s.energy=W.clamp(s.energy+10);else train(kind);actions++;
   const small=Small.maybe(s,place);if(small&&C.AquaPeopleEvents.events.some(x=>x.id===small.id))scene(small.id,small);else if(small&&small.lines.some(l=>l.choice)){effects(small.lines.find(l=>l.choice).choice[0].effect);}
  }
  s.slot=3;C.AquaRadio.air(s);s.energy=W.clamp(s.energy+50);
 }
 let freq={};for(const l of chatLines)freq[l]=(freq[l]||0)+1;
 const weeks=[];for(let d=W.weekKey('2026-03-02');d<='2026-06-30';d=W.addDays(d,7))weeks.push({week:d,scenes:weekly[d]||0});
 return {strategy,seed,period:'2026-03-02–2026-06-30',dates,peopleScenes,approaches,approachPersons,stats:{knowledge:s.knowledge,fitness:s.fitness,sensitivity:s.sensitivity},money:s.money,workIncome:income,bond:s.bond,dialogue:{samples:chatLines.length,unique:Object.keys(freq).length,maxRepeat:Math.max(0,...Object.values(freq)),mostRepeated:Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5)},weeks:{count:weeks.length,average:weeks.reduce((n,w)=>n+w.scenes,0)/weeks.length,empty:weeks.filter(w=>!w.scenes).length,details:weeks},messages,perWeek:messages/weeks.length,invitations,assumptions:'Production rule model, chosen encounters and scenes, one action per free slot; travel and conversations without time cost. Not game.js/browser automation. Automatic class and rest approximated; landscape flavor excluded.'};
}
const seeds=[5731,191,2026], results=seeds.flatMap(seed=>['balanced','nari','money','chat'].map(strategy=>run(strategy,seed)));
for(const r of results) r.checks={
 dialogue:r.strategy==='money'?null:r.dialogue.unique>=100&&r.dialogue.maxRepeat<=3,
 stories:r.weeks.average>=3&&r.weeks.empty===0,
 workIncome:r.workIncome<=1700000,
 chatCap:r.strategy==='chat'?r.bond.nari<45&&r.bond.daeun<35&&r.bond.seojin<35:null,
 balancedStats:r.strategy==='balanced'?Object.values(r.stats).every(n=>n>=15&&n<=22):null,
 focusedStat:r.strategy==='nari'?Math.max(...Object.values(r.stats))<=45:null,
 peopleScenes:r.peopleScenes>0,
 voluntaryDates:['balanced','nari'].includes(r.strategy)?r.dates>0:null,
 messageCadence:r.perWeek>=2,
 invitations:r.strategy==='chat'?null:r.invitations>=4
};
const catalogue=C.AquaPeopleEvents.events,heroes=['nari','daeun','seojin'];
const personCount=Object.fromEntries(heroes.map(id=>[id,catalogue.filter(x=>x.person===id).length]));
const chains=catalogue.filter(x=>x.after && catalogue.find(y=>y.id===x.after)?.after).length;
const spendOnce=S.gifts.reduce((sum,g)=>sum+g.price,0)+E.equipment.reduce((sum,g)=>sum+g.price,0)+S.destinations.reduce((sum,g)=>sum+g.price,0)+24000;
const purchase=State.initial();purchase.money=100000;const repeatPurchases=S.buy(purchase,'coffee').ok&&S.buy(purchase,'coffee').ok&&S.buy(purchase,'macarons').ok&&S.buy(purchase,'macarons').ok;
let shown=0,accurate=0,leaked=0;for(const seed of seeds){const test=State.initial();test.met=[...heroes];test.encounters.seed=seed;for(let day=0;day<121;day++){test.date=W.addDays('2026-03-02',day);for(const slot of [1,2]){test.slot=slot;Enc.ensurePlan(test);for(const place of places)for(const id of Enc.hints(test,place)){shown++;if(W.presentAt(test,place).includes(id))accurate++;if(!test.met.includes(id)||(id==='nari'&&W.weekday(test.date)===4&&slot===2))leaked++;}}}}
const unknown=State.initial();unknown.met=[];unknown.date='2026-04-03';unknown.slot=1;const hidesUnknown=places.every(place=>Enc.hints(unknown,place).length===0);
const firstContact=heroes.every(id=>{const test=State.initial();test.met=[id];test.bond[id]=0;for(let day=0;day<28;day++){test.date=W.addDays('2026-04-01',day);for(const slot of [1,2]){test.slot=slot;for(const place of places)if(Small.approach(test,id,place))return true;}}return false;});
const globalChecks={
 authoredPeople:catalogue.length>=40&&heroes.every(id=>personCount[id]>=8)&&catalogue.filter(x=>x.speaker).length>=10&&chains>=4,
 authoredStructure:catalogue.every(x=>x.setup.length>=3&&x.setup.length<=6&&x.choices.length>=2&&x.choices.length<=3&&x.choices.every(c=>c.label&&c.text&&c.effect)&&new Set(x.choices.map(c=>JSON.stringify(c.effect))).size===x.choices.length&&x.days.length&&x.season&&[1,2].includes(x.slot)),
 topicCards:catalogue.filter(x=>x.person&&x.reaction&&x.choices.some(c=>c.effect.smallTopic===x.id)).length>=20,
 recentLines:heroes.every(id=>Object.values(D.recentLines[id]).flat().length>=10),
 workStories:Small.workStories.length>=8,
 firstContact,
 spending:spendOnce>=1500000&&repeatPurchases,
 mapAccuracy:shown>0&&accurate/shown>=0.8&&leaked===0&&hidesUnknown,
 tomorrowLines:heroes.every(id=>M.tomorrowSpeech.message[id].length>=5&&M.tomorrowSpeech.hint[id].length>=5)
};
const doc={date:'2026-10-29',seeds,results,globalChecks,metrics:{personCount,chains,spendOnce,repeatPurchases,map:{shown,accurate,leaked}}};
await fs.mkdir(new URL('qa/campus-v2/',root),{recursive:true});await fs.writeFile(new URL('qa/campus-v2/semester-sim.json',root),JSON.stringify(doc,null,2)+'\n');
for(const r of results)console.log(`${r.seed} ${r.strategy}: stats ${JSON.stringify(r.stats)}, cash ${r.money}, income ${r.workIncome}, lines ${r.dialogue.unique}/${r.dialogue.maxRepeat}, weeks ${r.weeks.average.toFixed(2)}/${r.weeks.empty} empty, messages ${r.perWeek.toFixed(2)}/week, invitations ${r.invitations}, bond ${JSON.stringify(r.bond)}`);
const failed=[...Object.entries(globalChecks).filter(([,ok])=>!ok).map(([name])=>`global:${name}`),...results.flatMap(r=>Object.entries(r.checks).filter(([,ok])=>ok===false).map(([name])=>`${r.seed}:${r.strategy}:${name}`))];
console.log(`Global checks: ${JSON.stringify(globalChecks)}; one-time spend ${spendOnce}; map ${accurate}/${shown}, leaks ${leaked}`);
if(failed.length){console.error(`FAILED ${failed.join(', ')}`);process.exitCode=1;}else console.log('PASS all measurable requirements for all three seeds');
