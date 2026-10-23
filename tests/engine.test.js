(() => {
  const E = window.LunaEngine, D = window.LunaData, results = [];
  const assert = (condition, text) => { if (!condition) throw new Error(text); };
  const test = (name, fn) => { try { fn(); results.push(`PASS ${name}`); } catch(e) { results.push(`FAIL ${name}: ${e.message}`); } };
  const finish = s => { while(s.story.active) { const a=s.story.active; const r=E.chooseStory(s,window.LunaStory.script(a.kind,a.id)[a.choices.length].choices[0].id,a.choices.length); assert(!r.error,r.error); s=r.state; } return s; };
  const act = (s, type, id) => { const r = E.act(s, type, id); assert(!r.error, r.error); return finish(r.state); };
  const onDay = day => ({ ...E.makeState(), day });
  test('Initial economy and valid save', () => { const s=E.makeState(); assert(s.money===80000 && s.ap===3 && s.energy===100, 'initial resources'); assert(E.validate(s), 'valid state'); });
  test('Jobs pay once, consume resources, do not mutate prior state', () => { const before=E.makeState(); const after=act(before,'work','edit'); assert(after.money===155000 && after.ap===2 && after.energy===65, 'job effects'); assert(before.money===80000 && before.journal.length===0,'immutability'); });
  test('Work respects shifts, time and energy', () => { let s=act(onDay(6),'work','event'); assert(E.act(s,'work','event').error && E.act(s,'work','edit').error,'one shift per day'); s=act(s,'train','study'); assert(s.energy===40 && s.ap===0,'resource totals'); assert(E.act(s,'work','cafe').error,'no free work'); const tired={...onDay(3),energy:10}; assert(E.act(tired,'work','cafe').error.includes('기력'),'energy gate'); });
  test('Buy, equip, own permanently; never double charge', () => { let s=act(E.makeState(),'work','edit'); s=act(s,'buy','knit'); assert(s.money===35000 && s.owned.includes('knit') && s.ap===2,'purchase'); const again=E.act(s,'buy','knit'); assert(again.error && again.state===s,'duplicate purchase'); s=act(s,'equip','knit'); assert(s.outfit==='knit' && s.money===35000 && s.ap===2,'equip no cost'); assert(E.act(s,'equip','coat').error,'unowned cannot equip'); });
  test('Insufficient funds are atomic', () => { const s=E.makeState(); const r=E.act(s,'buy','coat'); assert(r.error && r.state===s && s.money===80000,'blocked transaction'); });
  test('Dates deduct money and add relationships once per day', () => { let s=act(E.makeState(),'date','cafe'); assert(s.money===68000 && s.affection===6 && s.trust===3 && s.ap===2,'date accounting'); assert(E.act(s,'date','walk').error,'daily date cap'); s=act(s,'nextDay'); s=act(s,'date','walk'); assert(s.money===68000 && s.trust===7,'free walk'); });
  test('Trust gates concert, free activities unlock it', () => { let s=E.makeState(); assert(E.act(s,'date','concert').error,'trust gate'); for(let i=0;i<5;i++){s=act(s,'date','walk');s=act(s,'nextDay');} assert(s.trust===20,'trust earned'); assert(E.act(s,'date','concert').error,'money gate after trust'); s=act(s,'work','cafe'); assert(E.act(s,'date','concert').error,'shift day is reserved'); s=act(s,'nextDay'); s=act(s,'date','concert'); assert(s.money===35000 && s.trust===23 && s.ap===1,'concert effects'); });
  test('Rest and next day are bounded; spending cannot trap player', () => { let s=act(E.makeState(),'work','edit'); s=act(s,'rest'); assert(s.energy===100 && s.ap===1,'rest clamp'); assert(E.act(s,'rest').error,'full energy'); s=act(s,'nextDay'); assert(s.day===2 && s.ap===3 && s.energy===100,'day reset'); });
  test('Relationship cap and history retention', () => { let s=E.makeState(); for(let i=0;i<160;i++){ s=act(s,'date','walk'); s=act(s,'nextDay'); } assert(s.affection===100 && s.trust===100,'cap'); assert(s.journal.length===200 && E.validate(s),'bounded valid history'); });
  test('Reject corrupt, older, fabricated, or unsafe saves', () => { const s=E.makeState(); [null,{}, {...s,version:1}, {...s,money:-1}, {...s,money:999999}, {...s,ap:9}, {...s,owned:['casual','fake']}, {...s,outfit:'coat'}, {...s,journal:[{title:'invalid'}]}, {...s,savedAt:'invalid'}, {...s,energy:NaN}].forEach(v=>assert(!E.validate(v),'invalid save accepted')); });
  test('Save/load roundtrip and corruption recovery', () => { const s=act(onDay(3),'work','cafe'); assert(E.storage.save('test',s),'storage write'); const loaded=E.storage.load('test'); assert(loaded.money===125000 && loaded.ap===2,'load parity'); localStorage.setItem('aqualuna.v2.save.test','{broken'); assert(E.storage.load('test')===null,'corrupt fallback'); localStorage.removeItem('aqualuna.v2.save.test'); });
  test('Random action sequences preserve all economy invariants', () => { let s=E.makeState(), seed=48; const actions=[...D.jobs.map(j=>['work',j.id]),...D.dates.map(d=>['date',d.id]),...D.outfits.flatMap(o=>[['buy',o.id],['equip',o.id]]),['rest'],['nextDay']]; for(let i=0;i<3000;i++){ seed=(seed*1664525+1013904223)>>>0; const a=actions[seed%actions.length]; const r=E.act(s,...a); if(r.error) assert(r.state===s,'failed action mutated state'); s=finish(r.state); assert(E.validate(s),`invalid state at ${i}`); } });
  test('Budget plans do not spend resources and survive save/load', () => {
    const before=E.makeState(); const planned=E.planExpense(before,{type:'buy',id:'knit'}); assert(!planned.error,'valid plan');
    const s=planned.state; assert(s.money===80000 && s.ap===3 && s.energy===100 && !before.expenseGoal,'plan has no cost or mutation');
    const p=E.expenseProgress(s); assert(p.shortage===40000 && p.percent===66 && !p.ready,'target cost');
    assert(E.storage.save('budget-test',s),'save target'); assert(E.storage.load('budget-test').expenseGoal.id==='knit','restore target'); localStorage.removeItem('aqualuna.v2.save.budget-test');
    const earned=act(s,'work','edit'); assert(E.expenseProgress(earned).ready,'work prepares budget');
    const bought=act(earned,'buy','knit'); assert(bought.expenseGoal===null,'purchase completes plan'); assert(E.validate(bought),'valid completed state');
  });
  test('Budget money is not a bypass for date conditions', () => {
    let s=E.planExpense(E.makeState(),{type:'date',id:'concert'}).state; s=act(s,'work','edit');
    const p=E.expenseProgress(s); assert(p.shortage===0 && p.percent===100 && !p.ready && p.reason.includes('신뢰'),'trust remains required');
    s=act(s,'nextDay'); assert(s.expenseGoal.id==='concert','goal persists next day');
    assert(E.planExpense(s,{type:'buy',id:'casual'}).error,'owned target denied'); assert(E.planExpense(s,{type:'date',id:'walk'}).error,'free target denied');
    assert(E.planExpense(s,{type:'work',id:'edit'}).error,'wrong target kind');
    const cleared=E.planExpense(s,null).state; assert(cleared.expenseGoal===null && cleared.money===s.money,'clear no refund or charge');
  });
  test('Other spending adjusts progress; only matching expense completes plan', () => {
    let s=E.planExpense(E.makeState(),{type:'date',id:'cafe'}).state; s=act(s,'work','edit'); s=act(s,'buy','knit');
    assert(s.expenseGoal.id==='cafe' && E.expenseProgress(s).ready,'unrelated purchase preserves target');
    s=act(s,'date','cafe'); assert(s.expenseGoal===null && s.money===23000,'date completes target');
    let t=E.planExpense(E.makeState(),{type:'buy',id:'coat'}).state; const before=E.expenseProgress(t).shortage; t=act(t,'date','cafe'); assert(E.expenseProgress(t).shortage===before+12000,'spending increases shortage');
  });
  test('Earlier version-2 saves upgrade without losing money or wardrobe', () => {
    const old=act(E.makeState(),'work','edit'); delete old.expenseGoal; const loaded=E.validate(old);
    assert(loaded && loaded.expenseGoal===null && loaded.money===155000 && loaded.journal.length===1,'old save compatibility');
    assert(!E.validate({...old,expenseGoal:{type:'buy',id:'missing'}}),'unknown goal rejected');
    assert(!E.validate({...old,expenseGoal:{type:'buy',id:'casual'}}),'already-owned goal rejected');
  });
  test('Date result text reports actual capped relationship gain', () => {
    const s={...E.makeState(),affection:99,trust:98}; const r={state:finish(E.act(s,'date','walk').state)}; r.result=r.state.journal.at(-1);
    assert(r.state.affection<=100 && r.state.trust<=100 && r.state.story.carry && r.result.text.includes(`호감 +${r.state.affection-99} · 신뢰 +${r.state.trust-98}`),'partial gain text');
    const full={...E.makeState(),affection:100,trust:100}; assert(finish(E.act(full,'date','walk').state).journal.at(-1).text.includes('호감 +0 · 신뢰 +0'),'no phantom gain');
  });
  test('Skirt accessories are separate purchases, never auto-equipped or charged twice', () => {
    let s=act(onDay(6),'work','event'); s=act(s,'buy','skirt'); s=act(s,'buyAccessory','black');
    assert(s.money===22000 && s.outfit==='casual' && s.legwear==='none','purchase only owns');
    assert(E.act(s,'buyAccessory','black').error && E.act(s,'equipAccessory','black').error,'duplicate and pants gates');
    s=act(s,'equip','skirt'); s=act(s,'equipAccessory','black'); assert(s.money===22000 && s.ap===1,'free dressing');
    assert(D.characterImage(s.outfit,s.legwear).endsWith('skirt-black.png'),'real black variant');
    s=act(s,'equip','casual'); assert(s.legwear==='none' && s.ownedAccessories.includes('black'),'switch resets wear, not ownership');
  });
  test('Date preparation is atomic and freezes the outfit in memory', () => {
    let s=act(onDay(6),'work','event'); s=act(s,'buy','skirt'); s=act(s,'buyAccessory','black'); s=act(s,'buyAccessory','nude');
    const failed=E.dateWithOutfit(s,'cafe','skirt','black'); assert(failed.error && failed.state===s && s.outfit==='casual','insufficient money changes nothing');
    assert(E.dateWithOutfit(s,'walk','coat','none').error,'unowned date clothes rejected');
    assert(E.dateWithOutfit(s,'walk','casual','black').error,'incompatible legwear rejected');
    s=act(s,'nextDay'); s=finish(E.dateWithOutfit(s,'walk','skirt','black').state);
    assert(s.money===6000 && s.ap===2 && s.location==='pier' && s.memories[0].legwear==='black','date snapshot and resources');
    s=act(s,'equipAccessory','nude'); assert(s.memories[0].legwear==='black','memory independent of later wearing');
    const restored=E.validate(JSON.parse(JSON.stringify(s))); assert(restored.legwear==='nude' && restored.memories[0].legwear==='black','snapshot persists');
  });
  test('Older saves migrate; corrupt accessories and memories are rejected', () => {
    const old=E.makeState(); ['ownedAccessories','legwear','location','memories'].forEach(k=>delete old[k]);
    const loaded=E.validate(old); assert(loaded.legwear==='none' && loaded.location==='practice' && loaded.memories.length===0,'migration');
    [{...loaded,legwear:'black'},{...loaded,ownedAccessories:['none','none']},{...loaded,location:'toString'},{...loaded,memories:[{day:1,date:'walk',outfit:'skirt',legwear:'none'}]}].forEach(s=>assert(!E.validate(s),'invalid accepted'));
  });
  test('Time follows action cost, resets next day, and date memory freezes departure', () => {
    let s=onDay(3); assert(D.timeForAp(s.ap)==='morning','morning start');
    s=act(s,'work','cafe'); assert(D.timeForAp(s.ap)==='afternoon','one slot advances');
    s=act(s,'date','walk'); assert(s.memories[0].time==='afternoon' && D.timeForAp(s.ap)==='evening','departure distinct from return');
    s=act(s,'train','music'); assert(D.timeForAp(s.ap)==='night','night after three slots');
    s=act(s,'nextDay'); assert(D.timeForAp(s.ap)==='morning' && s.memories[0].time==='afternoon','memory independent of current time');
    const loaded=E.validate(JSON.parse(JSON.stringify(s))); assert(loaded.memories[0].time==='afternoon','time roundtrip');
    delete loaded.memories[0].time; assert(E.validate(loaded),'legacy memory accepted');
    loaded.memories[0].time='invalid'; assert(!E.validate(loaded),'unknown time rejected');
  });
  test('New outfits obey purchase ownership and expression fallback preserves clothing', () => {
    let s=act(onDay(6),'work','event'); s=act(s,'buy','shirt'); s=act(s,'equip','shirt');
    assert(s.money===100000 && s.ap===1 && E.validate(s),'shirt purchase/equip');
    assert(D.characterImage('shirt','none','smile').endsWith('shirt.png'),'unsupported expression keeps shirt');
    s=act(s,'nextDay'); s=act(s,'work','event'); s=act(s,'buy','blouse'); s=act(s,'equip','blouse');
    assert(E.validate(s) && s.outfit==='blouse','blouse save');
    assert(D.characterImage('skirt','black','smile').endsWith('skirt-black-smile.png'),'black tights preserved');
    assert(D.characterImage('skirt','nude','thoughtful').endsWith('skirt-nude-thoughtful.png'),'nude tights preserved');
    assert(D.availableExpressions('casual').length===7 && D.availableExpressions('shirt').length===1,'supported combinations');
  });
  const failed=results.filter(r=>r.startsWith('FAIL')).length;
  document.getElementById('results').textContent=results.join('\n')+`\n\n${results.length-failed}/${results.length} passed`;
  document.body.dataset.status=failed?'failed':'passed';
})();
