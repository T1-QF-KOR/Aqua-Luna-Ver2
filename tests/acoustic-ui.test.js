(async()=>{
 const frame=document.getElementById('app'),results=[],errors=[];let w,d,E,N;
 const assert=(v,m)=>{if(!v)throw Error(m);};
 async function bind(){if(!frame.contentWindow.LunaEngine||frame.contentDocument.readyState!=='complete')await new Promise(r=>frame.addEventListener('load',r,{once:true}));w=frame.contentWindow;d=frame.contentDocument;E=w.LunaEngine;N=w.LunaStory;w.addEventListener('error',e=>errors.push(e.message));}
 const read=()=>E.storage.load(0),click=id=>d.getElementById(id).click();
 function button(text){const b=[...d.querySelectorAll('#modal-body button')].find(b=>b.textContent.includes(text));assert(b&&!b.disabled,'missing '+text);b.click();}
 const apply=r=>{assert(!r.error,r.error);return r.state;};
 function finishState(s){while(s.story.active){const a=s.story.active,n=N.script(a.kind,a.id)[a.choices.length];s=apply(E.chooseStory(s,n.choices.find(c=>!c.requireStat).id,a.choices.length));}return s;}
 function finishUI(first){let i=0;while(read().story.active){assert(i<5,'UI loop');const b=d.querySelector(first&&i===0?`[data-story-choice="${first}"]`:'[data-story-choice]');assert(b,'missing choice');b.click();i++;}click('close-modal');}
 async function load(s){assert(E.storage.save(0,s),'save');await new Promise(r=>{frame.addEventListener('load',r,{once:true});w.location.reload();});await bind();click('continue-game');}
 function trip(s,id){s=apply(E.act(s,'work','edit'));s=finishState(apply(E.act(s,'date',id)));return apply(E.act(s,'nextDay'));}
 try{
  await bind();w.localStorage.clear();
  let s=finishState(apply(E.startStory(E.makeState(),'hello')));
  for(const id of ['study','study','study','music','music','music','music']){if(s.ap===0||s.energy<10)s=apply(E.act(s,'nextDay'));s=apply(E.act(s,'train',id));}s=apply(E.act(s,'nextDay'));
  await load(s);click('bond-button');
  assert(d.querySelectorAll('.acoustic-project-step').length===3,'project step count');assert(d.getElementById('modal-body').textContent.includes('실용음악과 · 보컬 전공'),'major');assert(d.querySelector('.note-profile').textContent.includes('좋아하는 장르발라드주로 부르는 장르발라드'),'listening and singing genres');
  button('함께 작업하기');assert(read().story.active.id==='acoustic-chords','start from note');finishUI('voicing');results.push('PASS project progress, major and first vocal practice action');
  s=trip(read(),'music-busking');await load(s);click('bond-button');button('함께 작업하기');assert(read().story.active.id==='acoustic-lyrics','lyrics');finishUI('space');
  s=read();for(const id of ['music-listening','music-vinyl','music-rehearsal','music-recording'])s=trip(s,id);
  await load(s);click('bond-button');button('함께 작업하기');assert(read().story.active.id==='acoustic-demo','demo');
  d.querySelector('[data-story-choice="class"]').click();assert(read().story.active.choices.length===1,'consent autosave');await load(read());assert(read().story.active.choices[0]==='class','consent reload');finishUI();
  click('bond-button');assert(N.acousticProject(read()).every(p=>p.complete),'project complete');assert(d.querySelector('.acoustic-project').textContent.includes('하윤'),'sharing feedback');results.push('PASS lyrics, demo consent, mid-scene reload and completion feedback');
  assert(d.documentElement.scrollWidth<=w.innerWidth+1,'page overflow');assert(d.getElementById('modal').getBoundingClientRect().right<=w.innerWidth+1,'modal bounds');assert(!errors.length,errors.join('\n'));
  results.push('PASS project note fits PC viewport without runtime errors');
  document.body.dataset.status='passed';
 }catch(e){results.push('FAIL '+e.stack);document.body.dataset.status='failed';}
 document.getElementById('results').textContent=results.join('\n');
})();
