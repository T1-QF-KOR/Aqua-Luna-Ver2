(() => {
  // Long-run pacing: a deterministic player plays every day; the relationship must not max out in the first weeks.
  const E=LunaEngine,N=LunaStory,D=LunaData,results=[];
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  const test=(name,fn)=>{try{fn();results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.message);}};
  function play(days,{gifts=true,talkWell=true,money=true}={}){
    let s=E.makeState(),seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280,log={level:{},story:{}};
    const take=r=>{if(!r.error)s=r.state;return !r.error;};
    const finish=()=>{while(s.story.active){const a=s.story.active,node=N.script(a.kind,a.id)[a.choices.length],open=node.choices.filter(c=>!E.choiceReason(s,c));const c=open.find(c=>c.id==='insight'||c.id==='understand')||open.find(c=>c.relationship==='lovers')||open.find(c=>c.boundary==='clear')||open[0];assert(take(E.chooseStory(s,c.id,a.choices.length)),'story choice');}};
    for(let day=1;day<=days;day++){
      for(const ev of N.available(s)){if(take(E.startStory(s,ev.id))){finish();log.story[ev.id]=s.day;}}
      if(!E.talkReason(s)){const plan=E.talkPlan(s),picks=talkWell?[...plan.hot]:[...E.talkTopics].sort(()=>rnd()-.5).slice(0,2);picks.push(E.talkTopics.find(t=>!picks.includes(t)&&t!==plan.cold));if(!take(E.finishTalk(s,picks,talkWell)))take(E.finishTalk(s,picks));}
      if(gifts){const g=D.gifts.find(x=>s.story.tastes?.[x.id]==='loved')||D.gifts.find(x=>!s.story.tastes?.[x.id]);if(g&&s.money>g.cost+50000)take(E.giveGift(s,g.id));}
      const open=D.dates.filter(d=>!E.reason(s,'date',d.id)&&(money||!d.cost)),fresh=open.filter(d=>!s.memories.some(m=>m.date===d.id)),pick=(fresh.length?fresh:open)[0];
      if(pick&&take(E.act(s,'date',pick.id)))finish();
      for(let i=0;i<5&&s.ap>0;i++){if(money&&s.money<150000&&take(E.act(s,'work','edit')))continue;const t=E.training.filter(t=>!E.reason(s,'train',t.id)).sort((a,b)=>s.growth.stats[a.stat]-s.growth.stats[b.stat])[0];if(t&&take(E.act(s,'train',t.id)))continue;if(take(E.act(s,'rest')))continue;break;}
      const lv=N.bondLevel(s);log.level[lv]??=s.day;assert(E.validate(s),'valid save on day '+s.day);
      assert(take(E.act(s,'nextDay')),'next day');
    }
    return {s,log};
  }
  const devoted=play(60);
  test('A devoted player reaches the confession in weeks, not days',()=>{const d=devoted.log.story.confession;assert(d>=15&&d<=40,'confession day '+d);assert(devoted.log.story.epilogue>d,'epilogue after confession');});
  test('Bond level 10 takes more than a month even with daily dates, gifts and good talks',()=>{const d=devoted.log.level[10];assert(!d||d>=35,'level 10 on day '+d);assert(devoted.log.level[5]>=7,'level 5 too early '+devoted.log.level[5]);});
  test('Main chapters are spaced across the calendar',()=>{const days=['score','boundary','session','confession','epilogue'].map(id=>devoted.log.story[id]);assert(days.every((d,i)=>!i||d-days[i-1]>=N.storyGap),'gaps '+days.join(','));});
  test('Stats taper: the highest course requirement is not reached in the first two weeks',()=>{const s=play(14).s;assert(Object.values(s.growth.stats).every(v=>v<70),'stats '+Object.values(s.growth.stats).join('/'));});
  test('Free walks alone still reach the romance without spending money',()=>{const {s,log}=play(60,{gifts:false,talkWell:false,money:false});assert(s.story.relationship==='lovers'&&log.story.epilogue<=50&&s.totalSpent===0,'free route epilogue '+log.story.epilogue);});
  const passed=results.filter(r=>r.startsWith('PASS')).length;
  document.getElementById('results').textContent=results.join('\n')+`\n${passed}/${results.length} passed`;
})();
