(() => {
  const A=LunaActivities,E=LunaEngine,D=LunaData,N=LunaStory,results=[];
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);},test=(name,run)=>{try{run();results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.stack);}};
  const check=r=>{assert(!r.error,r.error);assert(E.validate(r.state),'invalid save');return E.validate(r.state);};
  const begin=()=>check(E.act(E.makeState(),'date','river-reed'));
  let catalog=[];
  test('All 576 generated challenges terminate through legal moves, including every maze exit',()=>{
    for(const d of D.dates.filter(d=>d.theme))for(let level=1;level<=12;level++){
      const p=A.puzzle(d.id,level),a={course:d.id,level,moves:[],assisted:false};let b=A.replay(a),guard=0;
      while(!b.done&&guard++<1000){const moves=A.hint(p,b);assert(moves.length,'no solution '+p.key);a.moves.push(...moves);b=A.replay(a);assert(b,'illegal solver move '+p.key);}
      assert(b.done,'unsolved '+p.key);if(p.kind==='explore')assert(b.turns<=p.limit&&b.pos===p.end&&b.collected.length===p.treasures.length,'bad maze budget');
      assert(JSON.stringify(A.puzzle(d.id,level))===JSON.stringify(p),'non deterministic');catalog.push({key:p.key,kind:p.kind,width:p.w,moves:a.moves.length});
    }
    assert(catalog.length===576,'catalog count');
  });
  test('A full 12-challenge course saves every input without charging or advancing its dialogue',()=>{
    let s=begin();const before={money:s.money,ap:s.ap,energy:s.energy,choices:s.story.active.choices.length};
    for(let level=1;level<=12;level++){
      s=check(A.start(s,'river-reed',level));while(A.progress(s).active){const a=A.progress(s).active;s=check(A.move(s,'hint',a.moves.length));s=E.validate(JSON.parse(JSON.stringify(s)));}
      assert(s.money===before.money&&s.ap===before.ap&&s.energy===before.energy&&s.story.active.choices.length===before.choices,'activity changes resources/dialogue');
    }
    assert(A.progress(s).wins.length===12,'missing results');while(s.story.active){const a=s.story.active;s=check(E.chooseStory(s,N.script('date',a.id)[a.choices.length].choices[0].id,a.choices.length));}assert(E.validate(s),'wins lost after date');
  });
  test('Exploration rejects walls, teleportation, stale moves and narrative bypass',()=>{
    let s=check(A.start(begin(),'river-reed',1));const a=A.progress(s).active,p=A.puzzle(a.course,a.level),before=JSON.stringify(s);
    assert(A.move(s,0,0).error&&A.move(s,p.end,0).error,'wall/teleport');assert(E.act(s,'nextDay').error&&E.chooseStory(s,'quiet',0).error,'active game bypass');assert(JSON.stringify(s)===before,'invalid mutation');
    s=check(A.move(s,'hint',0));assert(A.move(s,'hint',0).error,'stale input');const moved=JSON.stringify(A.replay(A.progress(s).active));s=check(A.move(s,'undo',1));assert(A.progress(s).active.moves.length===0&&JSON.stringify(A.replay(A.progress(s).active))!==moved,'undo failed');
    s=check(A.move(s,'leave',0));assert(!A.progress(s).active&&s.story.active,'leave loses dialogue');
  });
  test('Music toggle affects exactly a cross; pressing twice restores the board',()=>{
    const a={course:'river-reed',level:2,moves:[],assisted:false},p=A.puzzle(a.course,a.level),initial=A.replay(a).board;
    a.moves=[0];const once=A.replay(a).board;assert(once.filter((v,i)=>v!==initial[i]).length===3,'corner cross');a.moves=[0,0];assert(JSON.stringify(A.replay(a).board)===JSON.stringify(initial),'toggle reversibility');
  });
  test('Memory pairs persist, mismatches stay visible and a third card closes them',()=>{
    const a={course:'river-reed',level:3,moves:[],assisted:false},p=A.puzzle(a.course,a.level),other=p.board.findIndex(v=>v!==p.board[0]);
    a.moves=[0,other];assert(A.replay(a).open.length===2,'mismatch hidden too early');const third=p.board.findIndex((_,i)=>i!==0&&i!==other);a.moves.push(third);assert(A.replay(a).open.length===1,'third does not close mismatch');
    a.moves=[0,p.board.findIndex((v,i)=>i!==0&&v===p.board[0])];assert(A.replay(a).matched.length===2,'matching pair');a.moves.push(0);assert(!A.replay(a),'matched card reselected');
  });
  test('Locked activities and corrupted replay records are rejected, legacy states migrate',()=>{
    assert(A.start(E.makeState(),'river-reed',1).error&&A.start(begin(),'river-reed',2).error,'unlock bypass');
    const s=check(A.start(begin(),'river-reed',1));
    for(const active of [null,{course:'fake',level:1,moves:[],assisted:false},{course:'river-reed',level:1,moves:[0],assisted:false},{course:'river-reed',level:1,moves:Array(1001).fill(1),assisted:false}]){const x=JSON.parse(JSON.stringify(s));x.story.activities.active=active;if(active!==null)assert(!E.validate(x),'corrupt replay accepted');}
    const x=JSON.parse(JSON.stringify(s));x.story.activities.wins=[{key:'river-reed:12',moves:2,assisted:false,day:1}];assert(!E.validate(x),'fabricated gate');
    const old=E.makeState();delete old.story.activities;assert(E.validate(old).story.activities.wins.length===0,'invented progress');
  });
  test('576 records with full course memories fit the actual pretty-printed export limit',()=>{
    const s=E.makeState();s.story.dateCount=48;s.story.exploration={};s.story.activities=A.fresh();
    for(const d of D.dates.filter(d=>d.theme))s.story.exploration[d.id]={visits:1,first:{day:1,date:d.id,outfit:'casual',legwear:'none',time:'morning',choices:N.script('date',d.id).map(n=>n.choices[0].id),keptPromise:false}};
    s.story.activities.wins=catalog.map(p=>({key:p.key,day:1,moves:p.moves,assisted:true}));
    s.memories=Array.from({length:60},()=>({day:1,date:'river-reed',outfit:'casual',legwear:'none',time:'morning',choices:N.script('date','river-reed').map(n=>n.choices[0].id),keptPromise:false}));
    s.journal=Array.from({length:200},()=>({day:1,type:'date',title:'갈대숲의 느린 산책 완료',text:'수련과 오늘의 외출을 기억합니다. 서로 선택한 길과 대화를 남겼어요. 호감 +0 · 신뢰 +0',money:0,outfit:'casual'}));
    assert(E.validate(s),'full save invalid');const size=new Blob([JSON.stringify(s,null,2)]).size;assert(size<1048576,'export too large '+size);window.activitySaveBytes=size;
    s.journal.forEach(j=>{j.title='가'.repeat(119);j.text='나'.repeat(499);});assert(E.validate(s)&&new Blob([JSON.stringify(s,null,2)]).size<1048576,'valid longest journal exceeds import cap');
  });
  window.activityAudit={challenges:catalog.length,byKind:Object.fromEntries(A.kinds.map(k=>[k,catalog.filter(p=>p.kind===k).length])),allSolvable:!results.some(r=>r.startsWith('FAIL')),prettySaveBytes:window.activitySaveBytes,procedurallyGenerated:true,humanThirtyHourPlaytest:false};
  document.getElementById('results').textContent=results.join('\n')+`\n${results.filter(r=>r.startsWith('PASS')).length}/${results.length} passed\n`+JSON.stringify(activityAudit,null,2);document.body.dataset.status=results.some(r=>r.startsWith('FAIL'))?'failed':'passed';
})();
