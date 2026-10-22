(() => {
  const E=LunaEngine,N=LunaStory,D=LunaData,results=[];
  const assert=(v,m)=>{if(!v)throw Error(m);};
  const test=(name,run)=>{try{run();results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.stack);}};
  const check=r=>{assert(!r.error,r.error);const s=E.validate(JSON.parse(JSON.stringify(r.state)));assert(s,'save invalid');return s;};
  function finish(s,branch={}){while(s.story.active){const a=s.story.active,n=N.script(a.kind,a.id)[a.choices.length];s=check(E.chooseStory(s,branch[a.id+':'+a.choices.length]||n.choices.find(c=>!c.requireStat).id,a.choices.length));}return s;}
  const scene=(s,id,branch)=>finish(check(E.startStory(s,id)),branch);
  const next=s=>check(E.act(s,'nextDay'));
  function prepared(){let s=scene(E.makeState(),'hello');for(const id of ['study','study','study','music','music','music','music']){if(s.ap===0||s.energy<10)s=next(s);s=check(E.act(s,'train',id));}return next(s);}
  function trip(s,id){s=check(E.act(s,'work','edit'));s=finish(check(E.act(s,'date',id)));return next(s);}
  test('Ballad vocal project unlocks from learned skills and real first visits',()=>{
    assert(E.startStory(E.makeState(),'acoustic-chords').error,'no skills gate');
    let s=prepared();assert(N.acousticProject(s)[0].ready,'practice not ready');
    const money=s.money,ap=s.ap;s=scene(s,'acoustic-chords',{'acoustic-chords:0':'voicing'});
    assert(s.money===money&&s.ap===ap,'unexpected project charge');
    assert(E.startStory(s,'acoustic-lyrics').error,'no music visit gate');
    s=trip(s,'music-busking');s=scene(s,'acoustic-lyrics');assert(E.startStory(s,'acoustic-demo').error,'no recording gate');
    for(const id of ['music-listening','music-vinyl','music-rehearsal'])s=trip(s,id);
    assert(!E.reason(s,'date','music-recording'),'recording remains locked');s=trip(s,'music-recording');
    if(s.trust<20)s=trip(s,'music-busking');assert(N.acousticProject(s)[2].ready,'demo not ready');
    for(const first of ['private','class']){
      const before=JSON.stringify(s);let active=check(E.startStory(s,'acoustic-demo'));
      active=check(E.chooseStory(active,first,0));assert(active.story.active.choices[0]===first,'sharing choice not saved');
      assert(E.storage.save(2,active),'save');active=E.storage.load(2);assert(active.story.active.choices.length===1,'resume position');
      active=finish(active);assert(N.acousticProject(active).every(p=>p.complete),'missing completion');
      assert(active.story.completed.find(e=>e.id==='acoustic-demo').choices[0]===first,'sharing consent lost');
      assert(E.startStory(active,'acoustic-demo').error,'duplicate reward');assert(JSON.stringify(s)===before,'source mutation');
    }
  });
  test('Legacy concert, gift discoveries and mid-scene choices remain loadable',()=>{
    let s=E.makeState();s=check(E.giveGift(s,'cello-card'));assert(s.story.tastes['cello-card']==='liked','legacy taste');s=next(s);
    s=check(E.giveGift(s,'score-clip'));assert(s.story.tastes['score-clip']==='loved','legacy gift taste');
    s=next(s);s=check(E.act(s,'work','event'));s=next(s);s.trust=20;
    s=check(E.act(s,'date','concert'));s=check(E.chooseStory(s,'share',0));
    assert(E.storage.save(1,s),'concert save');s=E.storage.load(1);assert(s.story.active.id==='concert','legacy concert id');
    s=finish(s);assert(s.memories.at(-1).date==='concert','concert memory');
    assert(D.gifts.find(g=>g.id==='score-clip').name==='보컬 악보 표시 탭','gift content');
  });
  test('Live game content consistently uses the vocal major and ballad setting',()=>{
    const text=JSON.stringify({intro:N.intro,events:N.events.map(e=>e.nodes),dates:N.dates,talk:N.talk,locations:D.locations,gifts:D.gifts});
    assert(!/첼로|클래식|성악|예고|문화콘텐츠|통기타|인디 어쿠스틱/.test(text),'old character premise');
    assert(N.intro[0].lines.some(l=>l[1].includes('실용음악과 보컬 전공')),'major missing');
    assert(N.intro[3].lines.some(l=>l[1].includes('듣는 음악도, 즐겨 부르는 노래도 발라드')),'genre premise missing');
    assert(D.dates.find(d=>d.id==='concert').name==='발라드 라이브','concert genre');
    assert(N.talk.music.neutral[0].every(l=>l.includes('발라드')),'both speech styles');
    assert(D.locations.concert.image.endsWith('acoustic-live.png'),'old concert art');
  });
  document.body.dataset.status=results.some(r=>r.startsWith('FAIL'))?'failed':'passed';
  document.getElementById('results').textContent=results.join('\n')+`\n${results.filter(r=>r.startsWith('PASS')).length}/${results.length} passed`;
})();
