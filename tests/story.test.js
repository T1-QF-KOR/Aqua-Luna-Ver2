(() => {
  const E=LunaEngine,N=LunaStory,results=[];
  const assert=(v,msg)=>{if(!v)throw Error(msg);};
  const test=(name,run)=>{try{run();results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.stack);}};
  const check=r=>{assert(!r.error,r.error);assert(E.validate(r.state),'invalid state');return r.state;};
  const choose=(s,id)=>check(E.chooseStory(s,id,s.story.active.choices.length));
  function finish(s,branch={}) {while(s.story.active){const a=s.story.active,n=N.script(a.kind,a.id)[a.choices.length];s=choose(s,branch[a.id+':'+a.choices.length]||n.choices[0].id);}return s;}
  const date=(s,id='walk',branch={})=>finish(check(E.act(s,'date',id)),branch);
  function route(branch={}) {let s=E.makeState(); for(let turn=0;turn<80;turn++){ for(let i=0;i<12;i++){const ev=N.available(s)[0];if(!ev)break;s=finish(check(E.startStory(s,ev.id)),branch);} if(N.done(s,'epilogue'))return s; s=date(s);s=check(E.act(s,'nextDay'));}throw Error('route failed to finish');}
  test('All three dates reserve cost once and resume every dialogue step',()=>{
    for(const id of ['walk','cafe','concert']){let s=E.makeState();s=check(E.act(s,'work','event'));s=check(E.act(s,'nextDay'));s.trust=20;
      const before=JSON.stringify(s),cost=LunaData.dates.find(d=>d.id===id).cost,start=s.money;
      const old=s;s=check(E.act(s,'date',id));assert(JSON.stringify(old)===before,'mutated original');assert(s.money===start-cost&&s.memories.length===0&&s.affection===0,'premature completion');
      assert(E.act(s,'nextDay').error&&E.act(s,'date','walk').error&&E.act(s,'equip','casual').error,'pending bypass');
      while(s.story.active){s=E.validate(JSON.parse(JSON.stringify(s)));const a=s.story.active; s=choose(s,N.script(a.kind,a.id)[a.choices.length].choices[0].id);assert(s.money===start-cost,'charged twice');}
      assert(s.memories.length===1&&s.story.dateCount===1,'completion count');assert(E.chooseStory(s,'open',2).error,'duplicate completion');
    }
  });
  test('Stale choices and locked scenes fail without mutation',()=>{let s=check(E.act(E.makeState(),'date','walk'));s=choose(s,'quiet');const before=JSON.stringify(s);assert(E.chooseStory(s,'listen',0).error,'stale step');assert(E.chooseStory(s,'fake',1).error,'unknown choice');assert(E.startStory(s,'hello').error,'nested story');assert(JSON.stringify(s)===before,'failure mutated');assert(E.startStory(E.makeState(),'confession').error,'gate bypass');});
  test('Romance ends via basic clothes and free walks without grinding money',()=>{const s=route();assert(s.story.relationship==='lovers'&&N.done(s,'epilogue'),'romance ending');assert(s.money===80000&&s.totalSpent===0&&s.outfit==='casual','paywall');assert(s.story.dateCount===26&&s.day===27,'target route length');});
  test('Friendship has its own ending and continues daily play',()=>{let s=route({'confession:0':'friend'});assert(s.story.relationship==='friends','friend ending');s=check(E.act(s,'work','cafe'));assert(s.money===125000,'post ending work');s=date(s);assert(s.story.relationship==='friends','romance overwritten');});
  test('Deferral unlocks a second answer after two dates',()=>{const s=route({'confession:0':'later','revisit:0':'romance'});assert(N.done(s,'revisit')&&s.story.relationship==='lovers'&&s.story.dateCount===28,'deferral flow');});
  test('Overstepping opens repair; both repair responses recover the route',()=>{for(const c of ['sorry','honest']){const s=route({'boundary:0':'decide','repair:0':c});assert(N.done(s,'repair')&&s.story.boundary==='clear'&&N.done(s,'epilogue'),'repair outcome');}});
  test('Music choice survives through the independent performance scene',()=>{const s=route({'score:0':'new'});assert(s.story.music==='new'&&N.done(s,'session'),'music memory');});
  test('Promises persist without expiry and fulfill only on a finished walk',()=>{let s=date(E.makeState(),'walk',{'walk:2':'promise'});assert(s.story.promise,'promise not set');for(let i=0;i<5;i++)s=check(E.act(s,'nextDay'));s=date(s,'cafe');assert(s.story.promise&&s.story.keptPromises===0,'wrong venue fulfills');s=check(E.act(s,'nextDay'));s=date(s);assert(!s.story.promise&&s.story.keptPromises===1&&s.memories.at(-1).keptPromise,'promise missing');});
  test('Choices change personal memory, reactions, and outcomes',()=>{const quiet=date(E.makeState()),share=date(E.makeState(),'walk',{'walk:0':'share','walk:1':'ask'});assert(quiet.story.preference==='quiet'&&share.story.preference==='share','preferences');assert(share.affection===quiet.affection+1&&share.trust===quiet.trust+1,'choice consequences');assert(share.memories[0].choices[0]==='share','choice archive');});
  test('Event replay cannot award or complete the same scene twice',()=>{const s=finish(check(E.startStory(E.makeState(),'hello')));assert(E.startStory(s,'hello').error,'replay allowed');assert(s.ap===3&&s.money===80000&&s.affection===0,'story hidden cost/reward');});
  test('Legacy v2 migration preserves economy and does not fabricate memories',()=>{let s=E.makeState();delete s.story;s=E.validate(s);assert(s.story.dateCount===0&&s.story.completed.length===0&&s.money===80000,'legacy migration');});
  test('Malformed narrative saves fail closed without crashing',()=>{const s=E.makeState();const mutations=[null,{}, {...s.story,active:{kind:'date',id:'toString',choices:[]}}, {...s.story,completed:[null]}, {...s.story,completed:[{id:'fake',choices:[],day:1}]},{...s.story,preference:'<script>'},{...s.story,relationship:'fake'},{...s.story,last:{kind:'date',id:'__proto__',choices:[]}}];mutations.forEach(story=>assert(!E.validate({...s,story}),'corrupt narrative accepted'));});
  test('Paid date max bonuses and capped changes remain saveable',()=>{let s=E.makeState();s=check(E.act(s,'work','event'));s=check(E.act(s,'nextDay'));s.trust=20;s=date(s,'concert',{'concert:0':'share','concert:1':'ask'});assert(s.affection===11&&s.trust===23&&s.story.carry.trust===50&&E.validate(s),'max bonus save');s=check(E.act(s,'nextDay'));s.affection=99;s.trust=99;s=date(s);assert(s.story.last.affection===s.affection-99&&s.story.last.trust===s.trust-99&&s.affection<=100&&s.trust<=100,'cap feedback');});
  const failed=results.some(r=>r.startsWith('FAIL'));document.body.dataset.status=failed?'failed':'passed';document.getElementById('results').textContent=results.join('\n')+`\n${results.filter(r=>r.startsWith('PASS')).length}/${results.length} passed`;
})();
