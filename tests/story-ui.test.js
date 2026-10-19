(async()=>{
  const frame=document.getElementById('app'),results=[],errors=[];
  if (!frame.contentWindow.LunaEngine || frame.contentDocument.readyState !== 'complete') await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  let w=frame.contentWindow,d=frame.contentDocument,E=w.LunaEngine;
  const listen=()=>{w.addEventListener('error',e=>errors.push(e.message));w.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));};listen();
  const assert=(ok,text)=>{if(!ok)throw Error(text);},$=id=>d.getElementById(id),read=()=>E.storage.load(0);
  const click=id=>{assert($(id),'missing '+id);$(id).click();};
  const button=text=>{const b=[...$('modal-body').querySelectorAll('button')].find(b=>b.textContent.includes(text));assert(b&&!b.disabled,'missing '+text);b.click();};
  const choice=id=>{const b=d.querySelector(id?`[data-story-choice="${id}"]`:'[data-story-choice]');assert(b,'missing choice');b.click();};
  const close=()=>{if($('modal').open)click('close-modal');};
  const finish=()=>{for(let i=0;i<4&&read().story.active;i++)choice();assert(!read().story.active,'scene failed to complete');close();};
  const nextDay=()=>{close();click('next-day');if($('modal').open)button('다음 날로');};
  const startWalk=()=>{click('date-button');button('무료');button('데이트 진행');};
  try{
    click('new-game');if($('modal').open)button('새로 시작'); click('intro-skip');
    click('story-button');button('이야기 읽기');assert($('modal-body').textContent.includes('종이컵'),'prologue');choice();button('일상으로');
    assert(read().story.completed[0].id==='hello'&&read().money===80000,'prologue saved');results.push('PASS prologue and permanent choice history');
    startWalk();choice('share');assert(read().story.active.choices.length===1&&read().memories.length===0,'mid date save');
    const paid={money:read().money,ap:read().ap,energy:read().energy};
    await new Promise(resolve=>{frame.addEventListener('load',resolve,{once:true});frame.contentWindow.location.reload();});w=frame.contentWindow;d=frame.contentDocument;E=w.LunaEngine;listen();
    click('continue-game');assert($('modal').open&&$('modal-body').textContent.includes('좋았던 일'),'reloaded reaction');
    assert(read().ap===paid.ap&&read().energy===paid.energy&&read().money===paid.money,'double charge');
    choice('ask');choice('promise');button('일상으로');assert(read().memories[0].choices[0]==='share'&&read().story.promise,'choice memory');results.push('PASS in-progress reload, response restored, one charge');
    click('album-button');const before=JSON.stringify(read());button('그날의 대화');assert($('modal-body').textContent.includes('하루를 나누며'),'memory transcript');assert(JSON.stringify(read())===before,'replay mutates');close();results.push('PASS read-only album transcript');
    nextDay();startWalk();assert($('modal-body').textContent.includes('서로의 하루')&&$('modal-body').textContent.includes('약속을 지키네요'),'recall and promise');finish();assert(read().story.keptPromises===1,'promise fulfillment');results.push('PASS prior choice and outfit recall, fulfilled promise');
    // Only UI buttons advance the route; engine APIs are read-only observations.
    for(let day=0;day<80&&!w.LunaStory.done(read(),'epilogue');day++){
      for(let i=0;i<12;i++){
        const ev=w.LunaStory.available(read())[0];if(!ev)break;
        click('story-button');button('이야기 읽기');finish();
      }
      if(w.LunaStory.done(read(),'epilogue'))break;
      nextDay();startWalk();finish();
    }
    assert(w.LunaStory.done(read(),'epilogue')&&read().story.relationship==='lovers','UI ending');assert(read().money===80000&&read().outfit==='casual','paywall');results.push('PASS complete free route, confession and continuing epilogue');
    click('story-button');assert($('modal-body').textContent.includes('첫 장을 마쳤어요'),'ending feedback');close();
    click('settings');$('text-size').value='largest';$('text-size').dispatchEvent(new w.Event('change'));close();
    nextDay();startWalk();
    assert(w.getComputedStyle(d.querySelector('.story-text')).fontSize==='21px','story text scaling');
    assert(d.documentElement.scrollWidth<=w.innerWidth+1,'page overflow');assert($('modal').scrollWidth<=$('modal').clientWidth+1,'modal overflow');
    assert(d.activeElement.classList.contains('story-prose')&&d.activeElement.contains(d.querySelector('.story-text')),'reading focus');
    for(let i=0;i<60&&d.querySelector('.story-choices.line-hidden');i++)d.querySelector('.story-prose').click();assert(!d.querySelector('.story-choices.line-hidden'),'lines reveal choices');
    for(const b of d.querySelectorAll('[data-story-choice]')){const r=b.getBoundingClientRect();assert(r.width>=44&&r.height>=44&&r.left>=0&&r.right<=w.innerWidth,'choice size/bounds');}
    await Promise.all([...$('modal-body').querySelectorAll('img')].map(img=>img.decode()));
    assert(errors.length===0,errors.join('\n'));results.push(`PASS ${w.innerWidth}px large text, choice targets, reading focus, images and runtime`);
    document.body.dataset.status='passed';
  }catch(e){results.push('FAIL '+e.stack);document.body.dataset.status='failed';}
  document.getElementById('results').textContent=results.join('\n');
})();
