(() => {
  const E=LunaEngine,N=LunaStory,C=LunaCourses,D=LunaData,results=[];
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  const test=(name,run)=>{try{run();results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.stack);}};
  const check=r=>{assert(!r.error,r.error);const v=E.validate(r.state);assert(v,'invalid state');return v;};
  function finish(s,side=0){while(s.story.active){const a=s.story.active,node=N.script(a.kind,a.id)[a.choices.length];s=check(E.chooseStory(s,node.choices[Math.min(side,node.choices.length-1)].id,a.choices.length));}return s;}
  function next(s){return check(E.act(s,'nextDay'));}
  function date(s,id,side=0){return finish(check(E.act(s,'date',id)),side);}
  function events(s,friend=false){for(let i=0;i<40;i++){const e=N.available(s)[0];if(!e)return s;s=check(E.startStory(s,e.id));if(friend&&e.id==='confession')s=check(E.chooseStory(s,'friend',0));else s=finish(s);}throw Error('event loop');}
  let full;
  test('51 valid courses, 48 six-choice trips, 6 themes and 25 exploration stories',()=>{
    assert(D.dates.length===51&&C.themes.length===6,'catalog counts');assert(new Set(D.dates.map(d=>d.id)).size===51,'duplicate course');
    for(const t of C.themes){const items=D.dates.filter(d=>d.theme===t.id);assert(items.length===8,'theme size');for(const item of items){const script=N.script('date',item.id);assert(script.length===6&&script.every(n=>n.text&&n.choices.filter(c=>!c.requireStat).length===2&&n.choices.length<=3&&n.choices.every(c=>c.label&&c.reply))&&script[1].choices.some(c=>c.requireStat&&c.requireValue>=10),'incomplete scene');assert(D.locations[item.location]&&item.cost>=0,'bad metadata');}}
    assert(N.events.length===39&&new Set(N.events.map(e=>e.id)).size===39,'event count');
  });
  test('Variety gates reject repeated-course grinding and never charge on refusal',()=>{
    let s=E.makeState();const locked=D.dates.find(d=>d.theme==='river'&&d.requiredVisits===2);
    for(let i=0;i<8;i++){s=date(s,'river-reed');s=next(s);}
    assert(C.visited(s,'river')===1&&C.entries(s)['river-reed'].visits===8,'unique progress');
    const old=JSON.stringify(s),r=E.act(s,'date',locked.id);assert(r.error&&r.error.includes('서로 다른')&&JSON.stringify(r.state)===old,'gate bypass');
    s=date(s,'river-bridge');s=next(s);assert(!E.reason(s,'date',locked.id),'second unique does not unlock');
  });
  test('All 48 trips and all exploration chapters reach prequel finale through valid actions',()=>{
    let s=E.makeState();
    for(let i=0;i<80&&!N.done(s,'epilogue');i++){s=events(s);if(N.done(s,'epilogue'))break;s=date(s,'walk');s=next(s);}s=events(s);assert(N.done(s,'epilogue'),'base story');
    for(const item of D.dates.filter(d=>d.theme)){
      s=check(E.act(s,'work','edit'));
      const money=s.money,before=JSON.stringify(s);s=check(E.act(s,'date',item.id));assert(s.money===money-item.cost,'cost');
      for(let step=0;step<6;step++){
        const a=s.story.active,n=N.script('date',a.id)[step];s=check(E.chooseStory(s,n.choices[step%2].id,step));
        const restored=E.validate(JSON.parse(JSON.stringify(s)));assert(restored,'step reload');s=restored;
        if(step<5)assert(!C.entries(s)[item.id],'premature stamp');
      }
      assert(C.entries(s)[item.id].first.choices.length===6&&C.entries(s)[item.id].visits===1,'first archive');
      assert(before!==JSON.stringify(s),'no progress');s=events(s);s=next(s);
    }
    assert(N.done(s,'prelude-next')&&Object.keys(C.entries(s)).length===48,'finale not reachable');
    assert(s.story.completed.filter(e=>e.id.startsWith('journey-')).length===24,'missing chapters');assert(s.day===75,'unexpected grind '+s.day);
    assert(new Blob([JSON.stringify(s)]).size<256000,'save import size');full=s;
  });
  test('First visits survive 240 later dates and recent-album eviction',()=>{
    assert(full,'full run failed');let s=full;const first=JSON.stringify(C.entries(s));
    for(let i=0;i<240;i++){s=date(s,'walk');s=next(s);}
    assert(s.memories.length===60&&s.memories.every(m=>m.date==='walk'),'album ring');assert(JSON.stringify(C.entries(s))===first,'lost permanent memories');
    assert(E.validate(s)&&new Blob([JSON.stringify(s)]).size<256000,'long save rejected');
  });
  test('Friendship can finish all exploration stories without forced romance',()=>{
    let s=E.makeState();for(let i=0;i<8;i++){s=events(s,true);s=date(s,'walk');s=next(s);}s=events(s,true);
    for(const item of D.dates.filter(d=>d.theme)){s=check(E.act(s,'work','edit'));s=date(s,item.id,1);s=events(s,true);s=next(s);}
    assert(s.story.relationship==='friends'&&N.done(s,'prelude-next'),'friendship route blocked');
  });
  test('First choices change replies and rewards; replaying a course does not replace its first record',()=>{
    let a=date(E.makeState(),'river-reed'),b=date(E.makeState(),'river-reed',1);
    assert(a.trust===4&&b.trust===3&&a.affection===4&&b.affection===5,'choice consequences');
    const first=JSON.stringify(C.entries(a)['river-reed'].first);a=date(next(a),'river-reed',1);
    assert(JSON.stringify(C.entries(a)['river-reed'].first)===first&&C.entries(a)['river-reed'].visits===2,'overwrites first');
  });
  test('Corrupt exploration saves fail safely; legacy saves migrate with no invented visits',()=>{
    const s=date(E.makeState(),'river-reed'),clone=()=>JSON.parse(JSON.stringify(s));
    for(const book of [null,[],1,{'__bad__':{}},{'river-reed':{visits:9999,first:C.entries(s)['river-reed'].first}}]){const x=clone();x.story.exploration=book;assert(!E.validate(x),'accepted corrupt book');}
    for(const mutate of [x=>x.first.choices.pop(),x=>x.first.choices[0]='fake',x=>x.first.outfit='unknown',x=>x.first.day=9999,x=>x.visits=-1,x=>x.first.keptPromise=true]){const x=clone();mutate(x.story.exploration['river-reed']);assert(!E.validate(x),'accepted corrupt record');}
    const old=E.makeState();delete old.story.exploration;const migrated=E.validate(old);assert(Object.keys(C.entries(migrated)).length===0&&migrated.money===80000,'migration invented visits');
  });
  test('Long conversations cannot be skipped with stale input or produce duplicate rewards',()=>{
    let s=check(E.act(E.makeState(),'date','river-reed'));s=check(E.chooseStory(s,'share',0));const before=JSON.stringify(s);
    assert(E.chooseStory(s,'share',0).error&&E.act(s,'nextDay').error&&JSON.stringify(s)===before,'stale bypass');
    s=finish(s);const after=JSON.stringify(s);assert(E.chooseStory(s,'keep',5).error&&JSON.stringify(s)===after,'duplicate completion');
  });
  test('Story content describes a friend before agency entry, without manager or debut claims',()=>{
    const text=JSON.stringify([...Object.values(N.dates),...N.events.map(e=>e.nodes)]);
    assert(!text.includes('매니저')&&!text.includes('함께 일하시는'),'old role remains');assert(N.events[0].nodes[0].text.includes('오랜 친구'),'friend premise');
    assert(N.events.find(e=>e.id==='prelude-next').nodes[1].text.includes('어느 엔터테인먼트에도 들어가지 않았습니다'),'timeline crossed');
  });
  const all=[...Object.values(N.dates).flat(),...N.events.flatMap(e=>e.nodes)],unique=new Set(all.map(n=>n.text)),strings=new Set(all.flatMap(n=>[n.text,...n.choices.flatMap(c=>[c.label,c.reply])]));
  const chars=[...strings].reduce((sum,t)=>sum+t.replace(/\s/g,'').length,0);
  window.courseAudit={courses:D.dates.length,newCourses:48,themes:6,events:N.events.length,playableNodes:all.length,uniqueSceneTexts:unique.size,uniqueNonWhitespaceCharacters:chars,allTextReadingModelHours:{at300CharsPerMinute:+(chars/300/60).toFixed(2),at600CharsPerMinute:+(chars/600/60).toFixed(2)},thirtyHoursVerified:false};
  const failed=results.some(r=>r.startsWith('FAIL'));document.body.dataset.status=failed?'failed':'passed';document.getElementById('results').textContent=results.join('\n')+`\n${results.filter(r=>r.startsWith('PASS')).length}/${results.length} passed\n`+JSON.stringify(courseAudit,null,2);
})();
