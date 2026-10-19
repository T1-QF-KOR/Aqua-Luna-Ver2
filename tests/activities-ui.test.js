(async()=>{
  const frame=document.getElementById('app'),results=[],errors=[];if (!frame.contentWindow.LunaEngine || frame.contentDocument.readyState !== 'complete') await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  let w=frame.contentWindow,d=frame.contentDocument,E=w.LunaEngine,A=w.LunaActivities;
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);},$=id=>d.getElementById(id),read=()=>E.storage.load(0),click=id=>$(id).click();
  const listen=()=>{w.addEventListener('error',e=>errors.push(e.message));w.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));};listen();
  const button=text=>{const b=[...$('modal-body').querySelectorAll('button')].find(b=>b.textContent.includes(text));assert(b&&!b.disabled,'button '+text);b.click();};
  const solve=()=>{let limit=0;while(A.progress(read()).active&&limit++<500)button('힌트 한 수');assert(!A.progress(read()).active,'solve failed');};
  try{
    click('new-game');if($('modal').open)button('새로 시작'); click('intro-skip');click('date-button');d.querySelector('[data-action-id="river-reed"]').click();button('데이트 진행');button('둘이 체험하기');
    assert(d.querySelectorAll('[data-activity-level]').length===12&&d.querySelector('[data-activity-level="2"]').disabled,'stages');d.querySelector('[data-activity-level="1"]').click();assert(d.querySelector('.explore-map'),'map');
    const resources={money:read().money,ap:read().ap,energy:read().energy};button('힌트 한 수');const first=JSON.stringify(A.replay(A.progress(read()).active));button('한 수 되돌리기');assert(A.progress(read()).active.moves.length===0,'undo');button('힌트 한 수');assert(JSON.stringify(A.replay(A.progress(read()).active))===first,'hint consistency');results.push('PASS date-integrated map, progressive unlocks, hint and undo');
    await new Promise(resolve=>{frame.addEventListener('load',resolve,{once:true});w.location.reload();});w=frame.contentWindow;d=frame.contentDocument;E=w.LunaEngine;A=w.LunaActivities;listen();click('continue-game');assert(d.querySelector('.explore-map')&&A.progress(read()).active.moves.length===1,'resume map');
    click('close-modal');click('story-button');assert(d.querySelector('.explore-map'),'resume closed');solve();assert(A.progress(read()).wins.length===1,'map result');results.push('PASS map input saved, reload and modal resume without additional charge');
    button('다음 체험');assert(d.querySelector('.activity-grid.music'),'music');const old=JSON.stringify(A.replay(A.progress(read()).active).board);d.querySelector('[data-activity-cell="0"]').click();assert(JSON.stringify(A.replay(A.progress(read()).active).board)!==old,'tile no effect');button('한 수 되돌리기');assert(JSON.stringify(A.replay(A.progress(read()).active).board)===old,'music undo');
    window.musicSnapshot=()=>{};solve();assert(A.progress(read()).wins.length===2,'music result');results.push('PASS music cross puzzle, visible board response, undo and completion');
    button('다음 체험');assert(d.querySelector('.activity-grid.memory'),'memory');const p=A.puzzle('river-reed',3),other=p.board.findIndex(v=>v!==p.board[0]);d.querySelector('[data-activity-cell="0"]').click();d.querySelector(`[data-activity-cell="${other}"]`).click();assert(A.replay(A.progress(read()).active).open.length===2,'mismatch hidden');
    await new Promise(resolve=>{frame.addEventListener('load',resolve,{once:true});w.location.reload();});w=frame.contentWindow;d=frame.contentDocument;E=w.LunaEngine;A=w.LunaActivities;listen();click('continue-game');assert(A.replay(A.progress(read()).active).open.length===2,'memory reload');solve();assert(A.progress(read()).wins.length===3,'memory result');results.push('PASS memory mismatch stays visible, reload freezes both cards and pairs complete');
    assert(read().money===resources.money&&read().ap===resources.ap&&read().energy===resources.energy&&read().story.active.choices.length===0,'resource or conversation drift');button('수련과 대화 이어가기');assert(d.querySelector('[data-story-choice]'),'back to story');results.push('PASS three activities leave economy and dialogue step unchanged');
    button('둘이 체험하기');d.querySelector('[data-activity-level="4"]').click();button('힌트 한 수');button('체험 중단');assert(!A.progress(read()).active&&A.progress(read()).wins.length===3&&d.querySelector('[data-story-choice]'),'leave destroys past wins');
    button('둘이 체험하기');d.querySelector('[data-activity-level="4"]').click();assert(A.progress(read()).active.moves.length===0,'restart');results.push('PASS explicit abandonment preserves finished activities and restores conversation');
    assert(d.documentElement.scrollWidth<=w.innerWidth+1&&$('modal').scrollWidth<=$('modal').clientWidth+1,'map overflow');
    for(const btn of d.querySelectorAll('[data-direction]')){const r=btn.getBoundingClientRect();assert(r.height>=44&&r.width>=44,'map control size');}
    assert(d.activeElement.classList.contains('map-controls'),'keyboard map focus');await d.fonts.ready;assert(!errors.length,errors.join('\n'));results.push(`PASS ${w.innerWidth}px map layout, focus, fonts and runtime`);
    window.activityKey=()=>{const a=A.progress(read()).active,p=A.puzzle(a.course,a.level),b=A.replay(a),target=A.hint(p,b)[0],delta=target-b.pos;return delta===-p.w?'ArrowUp':delta===p.w?'ArrowDown':delta===-1?'ArrowLeft':'ArrowRight';};
    window.activityMoveCount=()=>A.progress(read()).active.moves.length;
    window.showMusic=()=>{button('체험 중단');button('둘이 체험하기');d.querySelector('[data-activity-level="2"]').click();};
    window.showMemory=()=>{button('체험 중단');button('둘이 체험하기');d.querySelector('[data-activity-level="3"]').click();d.querySelector('[data-activity-cell="0"]').click();};
    document.body.dataset.status='passed';
  }catch(e){results.push('FAIL '+e.stack);document.body.dataset.status='failed';}
  document.getElementById('results').textContent=results.join('\n');
})();
