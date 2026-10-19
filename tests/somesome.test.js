(() => {
  // Systems adapted from the 「썸썸 편의점」 study (reports/SOMESOME_STORE_STUDY_2026-10-19.md):
  // weekly settlement, work drop-ins, run-all schedule, heart stages, Hayun's heart hints, new game+.
  const E=LunaEngine,N=LunaStory,D=LunaData,results=[];
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  const test=(name,fn)=>{try{fn();results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.message);}};
  const ok=r=>{assert(!r.error,r.error);return r;};
  const finish=s=>{while(s.story.active){const a=s.story.active,node=N.script(a.kind,a.id)[a.choices.length],open=node.choices.filter(c=>!E.choiceReason(s,c));const c=open.find(c=>c.relationship==='lovers')||open.find(c=>c.boundary==='clear')||open[0];s=ok(E.chooseStory(s,c.id,a.choices.length)).state;}return s;};
  const hello=()=>finish(ok(E.startStory(E.makeState(),'hello')).state);
  const roundtrip=s=>{const v=E.validate(JSON.parse(JSON.stringify(s)));assert(v,'save must validate');return v;};

  test('New state starts the week on day 1 with no settlement yet',()=>{const s=E.makeState();assert(s.week.day===1&&s.lastWeek===null&&s.ngp===null,'fresh week');roundtrip(s);});
  test('Monday morning brings last week\'s settlement; other mornings do not',()=>{
    let s=hello();const weekday=d=>D.calendar(d).weekday;assert(weekday(1)==='월'&&weekday(8)==='월','day 1 and 8 are Mondays');
    for(let day=1;day<=7;day++){
      s=ok(E.act(s,'work','edit')).state;
      if(!E.reason(s,'date','walk'))s=finish(ok(E.act(s,'date','walk')).state);
      const r=ok(E.act(s,'nextDay'));
      if(day<7)assert(!r.result.week,'no settlement before Monday (day '+(day+1)+')');
      else{
        const w=r.result.week;assert(w&&w.from===1&&w.to===7,'covers days 1-7');
        assert(w.earned===s.totalEarned&&w.spent===s.totalSpent,'money matches the week');
        assert(w.dates===s.story.dateCount&&w.works===7&&w.affection===s.affection&&w.trust===s.trust,'counts match the week');
        assert(r.state.lastWeek&&r.state.week.day===8&&r.state.week.earned===r.state.totalEarned,'baseline resets on Monday');
      }
      s=r.state;
    }
    roundtrip(s);
    for(let day=8;day<14;day++)s=ok(E.act(s,'nextDay')).state;
    const quiet=ok(E.act(s,'nextDay')).result.week;assert(quiet&&quiet.from===8&&quiet.to===14&&quiet.dates===0&&quiet.earned===0,'quiet week is all zeros');
  });
  test('Older saves without the new fields still load and start a fresh week',()=>{
    let s=hello();for(let i=0;i<4;i++)s=ok(E.act(s,'nextDay')).state;
    const old=JSON.parse(JSON.stringify(s));delete old.week;delete old.lastWeek;delete old.ngp;
    const v=roundtrip(old);assert(v.week.day===s.day&&v.week.affection===s.affection&&v.lastWeek===null&&v.ngp===null,'backfilled');
  });
  test('Corrupt weekly or new game+ data fails closed',()=>{
    const s=E.makeState(),bad=[x=>x.week.affection=5,x=>x.week.day=9,x=>x.week=null,x=>x.lastWeek={from:1,to:1,earned:-1,spent:0,dates:0,stories:0,affection:0,trust:0,gifts:0,talks:0,works:0,mood:50},x=>x.lastWeek={from:3,to:1},x=>x.ngp={endings:['rich'],applied:true},x=>x.ngp={endings:['lovers'],applied:false},x=>x.ngp={endings:['lovers','lovers'],applied:true},x=>x.story.workMet=99];
    bad.forEach((f,i)=>{const x=JSON.parse(JSON.stringify(s));f(x);assert(E.validate(x)===null,'case '+i+' accepted');});
  });
  test('Work drop-ins: only after the first meeting, at most once a day, deterministic',()=>{
    let fresh=E.makeState();for(let i=0;i<12;i++){assert(!ok(E.act(fresh,'work','edit')).result.encounter,'no drop-in before hello');fresh=ok(E.act(fresh,'nextDay')).state;}
    let s=hello(),met=0,days=0;
    for(let day=1;day<=30;day++){
      const a=E.act(s,'work','cafe'),b=E.act(s,'work','cafe');assert(JSON.stringify(a)===JSON.stringify(b),'preview equals result');
      const r=ok(a);days++;
      if(r.result.encounter){
        met++;const e=r.result.encounter;assert(typeof e.line==='string'&&e.line.length>10&&e.title&&e.face,'scene text');
        assert(r.state.story.workMet===r.state.day&&r.state.story.lastMet===r.state.day,'counts as meeting');
        assert(e.mood===r.state.growth.mood-s.growth.mood&&e.mood>0&&e.affection>=0,'small, visible effect');
        assert(!ok(E.act(r.state,'work','edit')).result.encounter,'only once a day');
        roundtrip(r.state);
      }
      s=ok(E.act(r.state,'nextDay')).state;
    }
    assert(met>=6&&met<=days*0.5,'drop-in rate '+met+'/'+days);
  });
  test('Drop-in lines switch to casual speech after 말 놓기',()=>{
    let s=hello();s.story.speech='casual';let e=null;for(let i=0;i<10&&!e;i++){e=ok(E.act(s,'work','event')).result.encounter;if(!e)s=ok(E.act(s,'nextDay')).state;}
    assert(e&&N.workScenes.event.some(x=>x.line[1]===e.line),'casual line used');
  });
  test('Run all: the whole plan in one call, stale clicks rejected, partial stop keeps finished work',()=>{
    let s=E.makeState();s=ok(E.setSchedule(s,[{type:'train',id:'study'},{type:'work',id:'cafe'},{type:'rest',id:'rest'}])).state;
    const r=ok(E.runAllSchedule(s,JSON.stringify(s)));assert(r.results.length===3&&!r.state.growth.schedule.length&&r.state.ap===0&&!r.stopped,'all three ran');
    assert(E.runAllSchedule(s,'stale').error,'stale state rejected');
    let low=E.makeState();low.energy=40;low=ok(E.setSchedule(low,[{type:'train',id:'study'},{type:'work',id:'event'}])).state;
    const p=ok(E.runAllSchedule(low,JSON.stringify(low)));assert(p.results.length===1&&p.stopped&&p.state.growth.schedule.length===1&&p.state.ap===2,'stopped after first');
    roundtrip(p.state);
  });
  test('Heart stages follow the main story and end in the chosen relationship',()=>{
    const at=(ids,rel='acquaintances')=>N.heart({story:{relationship:rel,completed:ids.map(id=>({id}))}});
    assert(at([]).index===0&&at(['hello','score']).index===1&&at(['score','boundary']).index===2&&at(['session']).index===3,'0-3');
    assert(at(['session'],'considering').name==='대답을 기다리는 사이','on hold');
    assert(at(['epilogue'],'lovers').final&&at(['epilogue'],'friends').name==='소중한 친구','final states');
    assert(N.heartStages.length===4&&N.heartStages[2].name==='썸','four named steps');
  });
  test('A full route climbs every heart step; Hayun texts once per step and never twice',()=>{
    let s=E.makeState();const seen=[],hints=[];
    for(let day=1;day<=60;day++){
      for(const ev of N.available(s)){const r=E.startStory(s,ev.id);if(!r.error)s=finish(r.state);}
      const open=D.dates.filter(d=>!E.reason(s,'date',d.id)&&!d.cost),pick=open.find(d=>!s.memories.some(m=>m.date===d.id))||open[0];
      if(pick)s=finish(ok(E.act(s,'date',pick.id)).state);
      if(!E.giftReason(s,'citron-tea'))s=ok(E.giveGift(s,'citron-tea')).state;
      while(s.ap>0&&!E.reason(s,'work','cafe'))s=ok(E.act(s,'work','cafe')).state;
      const h=N.heart(s).index;if(seen.at(-1)!==h)seen.push(h);
      s=ok(E.act(s,'nextDay')).state;
      (s.story.msgLog||[]).filter(m=>m.day===s.day&&m.from==='friend'&&m.key==='heart').forEach(m=>hints.push(m.arg));
    }
    assert(seen.join(',')==='0,1,2,3,4','heart path '+seen.join(','));
    assert(hints.join(',')==='1,2,3'&&s.story.heartHint===3,'hints '+hints.join(','));
    assert(E.ending(s)==='lovers','ending recorded');roundtrip(s);
  });
  test('New game+: endings carry a head start that lands when the intro ends',()=>{
    const s=E.makeState({intro:true,legacy:['friends','bogus','lovers']});
    assert(s.ngp.endings.join()==='lovers,friends'&&!s.ngp.applied&&s.money===D.startingMoney,'pending bonus');
    roundtrip(s);
    const r=ok(E.moveIntro(s,0,'skip'));
    assert(r.result.legacy.join()==='연인 결말,우정 결말','result names');
    const t=r.state;assert(t.money===D.startingMoney+50000&&t.totalEarned===50000&&Object.values(t.growth.stats).every(v=>v===6),'money and stats');
    assert(t.ngp.applied&&t.journal.filter(j=>j.type==='legacy').length===2&&t.week.earned===50000,'logged once, week baseline after bonus');
    roundtrip(t);
    assert(!ok(E.moveIntro(E.makeState({intro:true}),0,'skip')).result,'no bonus without legacy');
    assert(E.makeState().ngp===null&&E.makeState({legacy:['lovers']}).money===D.startingMoney+50000,'immediate when no intro');
  });
  test('Every message kind has a sticker',()=>{Object.keys(N.messages).forEach(k=>{const [icon,label]=N.sticker(k);assert(icon&&label,'sticker '+k);});});

  const passed=results.filter(r=>r.startsWith('PASS')).length;
  document.getElementById('results').textContent=results.join('\n')+`\n${passed}/${results.length} passed`;
})();
