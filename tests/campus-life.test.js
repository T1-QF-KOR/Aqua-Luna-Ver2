(() => {
  const E=LunaEngine,D=LunaData,N=LunaStory,results=[];
  const assert=(v,m)=>{if(!v)throw Error(m);};
  const test=(n,f)=>{try{f();results.push('PASS '+n);}catch(e){results.push('FAIL '+n+': '+e.message);}};
  const on=day=>({...E.makeState(),day});
  const take=r=>{assert(!r.error,r.error);assert(E.validate(r.state),'save invalid');return r.state;};
  const finish=s=>{while(s.story.active){const a=s.story.active;s=take(E.chooseStory(s,N.script(a.kind,a.id)[a.choices.length].choices[0].id,a.choices.length));}return s;};
  test('Café and event shifts follow their booked weekdays',()=>{
    for(let day=1;day<=14;day++){
      const s=on(day),weekday=D.calendar(day).weekday;
      assert(!E.reason(s,'work','cafe')===['수','금','토'].includes(weekday),'café '+weekday);
      assert(!E.reason(s,'work','event')===['토','일'].includes(weekday),'event '+weekday);
    }
    assert(D.jobs.find(j=>j.id==='cafe').hours===4&&D.jobs.find(j=>j.id==='event').hours===8,'shift duration');
  });
  test('All jobs share a daily cap and blocked attempts leave resources unchanged',()=>{
    for(const id of ['cafe','edit','event']){
      const s=take(E.act(on(6),'work',id)),before=JSON.stringify(s);
      for(const next of D.jobs){const r=E.act(s,'work',next.id);assert(r.error&&r.state===s&&JSON.stringify(s)===before,'repeat '+id+'/'+next.id);}
    }
  });
  test('Shift cap persists after save/load and journal trimming; a new day permits work',()=>{
    let s=take(E.act(on(3),'work','cafe'));s.journal=[];s=E.validate(JSON.parse(JSON.stringify(s)));
    assert(s&&E.reason(s,'work','edit'),'cap survives without journal');
    s=take(E.act(s,'nextDay'));assert(!E.reason(s,'work','edit'),'next day unlocks');assert(E.reason(s,'work','cafe'),'Thursday is not café shift');
  });
  test('Old saves infer the last shift and retain earned money',()=>{
    let old=take(E.act(on(3),'work','cafe'));delete old.lastWork;const s=E.validate(old);
    assert(s&&s.lastWork.day===3&&s.lastWork.id==='cafe'&&s.money===125000&&E.reason(s,'work','edit'),'old shift migrated');
    const untouched=E.makeState();delete untouched.lastWork;assert(E.validate(untouched).lastWork===null,'fresh migration');
    for(const value of [{day:4,id:'cafe'},{day:0,id:'edit'},{day:1,id:'bogus'}])assert(!E.validate({...on(3),lastWork:value}),'corrupt shift accepted');
  });
  test('Lunch charges two tickets once and resumes at every dialogue step',()=>{
    const base=on(1);let s=take(E.act(base,'date','lunch'));
    assert(base.money===80000&&s.money===70000&&s.totalSpent===10000&&s.ap===2&&s.location==='cafeteria','two-ticket accounting');
    assert(s.story.active.time==='afternoon','lunch departure');
    while(s.story.active){s=E.validate(JSON.parse(JSON.stringify(s)));assert(s,'mid-lunch save');const a=s.story.active;s=take(E.chooseStory(s,N.script(a.kind,a.id)[a.choices.length].choices[0].id,a.choices.length));assert(s.money===70000,'charged more than once');}
    assert(s.story.dateCount===1&&s.memories.at(-1).date==='lunch'&&s.affection===3&&s.trust===4,'completion');
    assert(E.reason(s,'date','walk'),'one date per day includes lunch');
  });
  test('Lunch is a weekday first activity and unavailable departures are atomic',()=>{
    for(const s of [on(6),on(7),take(E.act(on(3),'train','study'))]){
      const snapshot=JSON.stringify(s),r=E.act(s,'date','lunch');assert(r.error&&r.state===s&&JSON.stringify(s)===snapshot,'late/weekend lunch');
    }
    assert(!E.reason(on(8),'date','lunch'),'Monday lunch');
  });
  test('Lunch follow-up remembers the meal and keeps polite/casual message variants',()=>{
    let s=finish(take(E.act(on(1),'date','lunch')));s=take(E.act(s,'nextDay'));
    assert(s.story.message.key==='lunch'&&N.sticker('lunch')[0]==='🍚','meal message');
    const p=take(E.replyMessage(s,'a'));assert(p.story.message.reply==='a'&&E.validate(p),'reply persists');
    s.story.speech='casual';const c=take(E.replyMessage(s,'a'));assert(c.journal.at(-1).text.includes('맞춰 보자'),'casual variant');
  });
  test('Concerts and full event shifts have time to travel home',()=>{
    let s=take(E.act({...on(3),trust:20},'work','cafe'));assert(E.reason(s,'date','concert'),'no concert after café shift');
    s=take(E.act(s,'nextDay'));assert(!E.reason(s,'date','concert'),'separate day allowed');
    s=finish(take(E.act(s,'date','concert')));assert(E.reason(s,'work','edit'),'no shift after concert');
    const event=take(E.act(on(6),'work','event'));assert(E.reason(event,'date','walk'),'long event day reserved');
  });
  test('Planner enforces shift availability and stops a plan invalidated by a date',()=>{
    const s=on(3);assert(E.setSchedule(s,[{type:'work',id:'cafe'},{type:'work',id:'edit'}]).error,'two shifts planned');
    assert(E.setSchedule(on(1),[{type:'work',id:'cafe'}]).error,'unbooked weekday planned');
    let p=take(E.setSchedule({...s,trust:20,money:100000,totalEarned:20000},[{type:'work',id:'cafe'}]));p=finish(take(E.act(p,'date','concert')));
    const r=E.runAllSchedule(p,JSON.stringify(p));assert(r.error&&r.state===p&&p.growth.schedule.length===1,'invalidated plan spent money');
  });
  test('Affordable dates preserve the free option and old choice ids',()=>{
    assert(D.dates.find(d=>d.id==='cafe').cost===12000&&D.dates.find(d=>d.id==='walk').cost===0,'date prices');
    for(const id of ['walk','cafe','concert']){
      assert(N.script('date',id).length===3,'old scene count');
      assert(N.script('date',id)[0].choices.map(c=>c.id).join() === 'quiet,share','opening ids');
      assert(N.script('date',id)[2].choices.map(c=>c.id).join() === 'open,promise','farewell ids');
    }
  });
  document.getElementById('results').textContent=results.join('\n')+`\n${results.filter(r=>r.startsWith('PASS')).length}/${results.length} passed`;
})();
