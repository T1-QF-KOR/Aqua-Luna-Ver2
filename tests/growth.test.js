(() => {
  const E=LunaEngine,N=LunaStory,results=[];
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  const test=(name,fn)=>{try{fn();results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.message);}};
  const take=r=>{assert(!r.error,r.error);assert(E.validate(r.state),'invalid resulting save');return r.state;};
  test('Legacy saves gain zero stats, neutral mood and an owned unequipped headset',()=>{
    const s=E.makeState();delete s.growth;delete s.neckAccessory;delete s.ownedNeckAccessories;
    const v=E.validate(s);assert(v.growth.stats.knowledge===0&&v.growth.mood===50&&v.neckAccessory==='none'&&v.ownedNeckAccessories.includes('headset'),'migration');
  });
  test('Training spends one turn, respects energy and preserves prior state',()=>{
    const before=E.makeState(),s=take(E.act(before,'train','study'));
    assert(s.growth.stats.knowledge===4&&s.ap===2&&s.energy===90&&s.money===before.money,'training');assert(before.ap===3&&before.growth.stats.knowledge===0,'mutation');
    assert(E.act({...before,energy:5},'train','exercise').error&&E.act({...before,ap:0},'train','music').error&&E.act(before,'train','unknown').error,'gates');
  });
  test('All three jobs develop the corresponding stat without changing pay',()=>{
    for(const [id,stat,pay] of [['cafe','sensitivity',45000],['edit','knowledge',75000],['event','fitness',120000]]){const s=take(E.act(E.makeState(),'work',id));assert(s.growth.stats[stat]===2&&s.money===80000+pay,'job reward');}
  });
  test('Planning is free, weighted by action time and bounded to remaining turns',()=>{
    const before=E.makeState(),s=take(E.setSchedule(before,[{type:'work',id:'event'},{type:'train',id:'study'}]));assert(s.ap===3&&s.money===80000&&before.growth.schedule.length===0,'reservation cost');
    assert(E.setSchedule(s,[{type:'work',id:'event'},{type:'work',id:'event'}]).error,'weighted AP');assert(E.setSchedule(s,[{type:'date',id:'walk'}]).error,'unsupported entry');
  });
  test('Stale schedule callbacks cannot execute a second identical task',()=>{
    let s=take(E.setSchedule(E.makeState(),[{type:'train',id:'study'},{type:'train',id:'study'}]));const token=JSON.stringify(s);s=take(E.runSchedule(s,token));
    const failed=E.runSchedule(s,token);assert(failed.error&&failed.state===s&&s.ap===2&&s.growth.stats.knowledge===4&&s.growth.schedule.length===1,'double execution');
  });
  test('A blocked scheduled action retains both resources and its queue',()=>{
    let s=take(E.setSchedule({...E.makeState(),energy:5},[{type:'train',id:'exercise'}]));const before=JSON.stringify(s),r=E.runSchedule(s,before);assert(r.error&&JSON.stringify(r.state)===before,'partial mutation');
  });
  test('Plans survive saving and expire when a new day begins',()=>{
    let s=take(E.setSchedule(E.makeState(),[{type:'train',id:'music'}]));s=E.validate(JSON.parse(JSON.stringify(s)));assert(s.growth.schedule.length===1,'lost queue');s=take(E.act(s,'nextDay'));assert(!s.growth.schedule.length&&s.ap===3,'daily reset');
  });
  test('Active dialogue blocks training, planning and headset changes',()=>{
    const s=take(E.startStory(E.makeState(),'hello'));assert(E.act(s,'train','study').error&&E.setSchedule(s,[]).error&&E.act(s,'equipNeckAccessory','headset').error,'story bypass');
  });
  test('Stat and date gates unlock optional scenes without changing original route',()=>{
    let s=E.makeState();for(let i=0;i<2;i++)s=take(E.act(s,'train','study'));assert(!N.available(s).some(e=>e.id==='growth-score'),'day gate');s=take(E.act(s,'nextDay'));assert(N.available(s).some(e=>e.id==='growth-score'),'stat unlock');s=take(E.startStory(s,'growth-score'));const r=E.chooseStory(s,'understand',0);assert(r.error&&r.state===s,'choice stat bypass');s=take(E.chooseStory(s,'listen',0));assert(s.trust===1&&s.growth.mood===53,'listening effects');
  });
  test('Special dialogue pays its relationship reward once and saves its mood',()=>{
    let s=E.makeState();for(let i=0;i<3;i++)s=take(E.act(s,'train','music'));s=take(E.act(s,'nextDay'));s=take(E.startStory(s,'growth-music'));s=take(E.chooseStory(s,'understand',0));assert(s.affection===3&&s.trust===2&&s.growth.mood===58,'special reward');assert(E.startStory(s,'growth-music').error&&E.chooseStory(s,'understand',0).error,'duplicate reward');
  });
  test('An impatient answer lowers mood; mood and stats clamp at bounds',()=>{
    let s=E.makeState();s.growth.stats.fitness=8;s.growth.mood=3;s.day=2;s=take(E.startStory(s,'growth-walk'));s=take(E.chooseStory(s,'rush',0));assert(s.growth.mood===0,'mood underflow');s.growth.stats.knowledge=99;s=take(E.act(s,'train','study'));assert(s.growth.stats.knowledge===100&&E.act(s,'train','study').error,'stat cap');
  });
  test('Headset is free and independent from outfits; date memory freezes it',()=>{
    let s=take(E.act(E.makeState(),'equipNeckAccessory','headset'));assert(s.ap===3&&s.money===80000,'equip cost');s=take(E.act(s,'date','walk'));assert(s.story.active.neckAccessory==='headset','departure snapshot');while(s.story.active){const a=s.story.active;s=take(E.chooseStory(s,N.script(a.kind,a.id)[a.choices.length].choices[0].id,a.choices.length));}s=take(E.act(s,'equipNeckAccessory','none'));assert(s.memories[0].neckAccessory==='headset'&&s.neckAccessory==='none','memory changed with wardrobe');
  });
  test('Date preparation selects headset atomically and rejects invalid equipment',()=>{
    const before=E.makeState(),r=E.dateWithOutfit(before,'walk','casual','none','headset');const s=take(r);assert(before.neckAccessory==='none'&&s.neckAccessory==='headset'&&s.story.active.neckAccessory==='headset','preview mutation or snapshot');
    const fail=E.dateWithOutfit(before,'concert','casual','none','headset');assert(fail.error&&fail.state===before&&before.neckAccessory==='none','failed departure equips');assert(E.dateWithOutfit(before,'walk','casual','none','fake').error,'unknown accessory');
  });
  test('Changing an outfit preserves headset ownership and selection',()=>{
    let s=take(E.act(E.makeState(),'equipNeckAccessory','headset'));s=take(E.act(s,'work','edit'));s=take(E.act(s,'buy','knit'));s=take(E.act(s,'equip','knit'));assert(s.neckAccessory==='headset'&&s.ownedNeckAccessories.length===1,'outfit cleared headset');s=E.validate(JSON.parse(JSON.stringify(s)));assert(s.neckAccessory==='headset','save lost equipment');
  });
  test('Malformed growth, plans and headset records fail closed',()=>{
    for(const growth of [null,{}, {stats:{knowledge:-1,fitness:0,sensitivity:0},mood:50,schedule:[]},{stats:{knowledge:0,fitness:0,sensitivity:0},mood:101,schedule:[]},{stats:{knowledge:0,fitness:0,sensitivity:0},mood:50,schedule:[null]}])assert(!E.validate({...E.makeState(),growth}),'bad growth');assert(!E.validate({...E.makeState(),neckAccessory:'fake'}),'bad accessory');
  });
  const failed=results.filter(r=>r.startsWith('FAIL')).length;
  document.getElementById('results').textContent=results.join('\n')+`\n${results.length-failed}/${results.length} passed`;
  document.body.dataset.status=failed?'failed':'passed';
})();
