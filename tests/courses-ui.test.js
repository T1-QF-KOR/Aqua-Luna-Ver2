(async()=>{
  const frame=document.getElementById('app'),results=[],errors=[];
  if (!frame.contentWindow.LunaEngine || frame.contentDocument.readyState !== 'complete') await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  let w=frame.contentWindow,d=frame.contentDocument,E=w.LunaEngine;
  const listen=()=>{w.addEventListener('error',e=>errors.push(e.message));w.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));};listen();
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);},$=id=>d.getElementById(id),click=id=>{assert($(id),'missing '+id);$(id).click();},read=()=>E.storage.load(0);
  const button=text=>{const b=[...$('modal-body').querySelectorAll('button')].find(b=>b.textContent.includes(text));assert(b&&!b.disabled,'button '+text);b.click();};
  const close=()=>{if($('modal').open)click('close-modal');};
  const select=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new w.Event('change'));};
  const search=text=>{$('course-search').value=text;$('course-search').dispatchEvent(new w.Event('input'));};
  const choose=()=>{const b=d.querySelector('[data-story-choice]');assert(b,'missing choice');b.click();};
  const next=()=>{close();click('next-day');if($('modal').open)button('다음 날로');};
  const start=id=>{click('date-button');const b=d.querySelector(`[data-action-id="${id}"]`);assert(b&&!b.disabled,'date '+id);b.click();button('데이트 진행');};
  try{
    click('new-game');if($('modal').open)button('새로 시작'); click('intro-skip');
    click('bond-button');assert($('modal-body').textContent.includes('입사 전')&&$('modal-body').textContent.includes('친구'),'profile premise');assert(!$('modal-body').textContent.includes('리더 /'),'future role leaked');close();results.push('PASS friend prequel profile and no agency membership');
    click('date-button');assert(d.querySelectorAll('[data-action-id]').length===12,'paging');button('다음 →');assert(d.querySelectorAll('[data-action-id]').length===12,'second page');
    select('course-theme','river');assert(d.querySelectorAll('[data-action-id]').length===8,'theme filter');
    assert(d.querySelector('[data-action-id="river-picnic"]').disabled,'locked course');
    search('갈대');assert(d.querySelectorAll('[data-action-id]').length===1,'search');search('없는곳');assert($('modal-body').textContent.includes('조건에 맞는'),'empty feedback');search('');results.push('PASS pagination, eight-course themes, search and locked feedback');
    select('course-status','ready');assert(d.querySelectorAll('[data-action-id]').length===2,'ready filter');select('course-status','all');close();
    start('river-reed');choose();choose();choose();assert(read().story.active.choices.length===3&&!read().story.exploration['river-reed'],'early stamp');
    const money=read().money,ap=read().ap;
    await new Promise(resolve=>{frame.addEventListener('load',resolve,{once:true});w.location.reload();});w=frame.contentWindow;d=frame.contentDocument;E=w.LunaEngine;listen();click('continue-game');
    assert(read().story.active.choices.length===3&&read().money===money&&read().ap===ap,'resume state');choose();choose();choose();assert(read().story.exploration['river-reed'].first.choices.length===6,'completion');results.push('PASS six-stage date reload, frozen cost and durable first memory');
    button('탐방 수첩 확인');assert($('modal-body').textContent.includes('1/48곳')&&$('modal-body').textContent.includes('갈대 소리를 적은 메모'),'book count');
    const before=JSON.stringify(read());button('첫날 대화 다시 읽기');assert($('modal-body').textContent.includes('갈대가 바람에'),'first transcript');assert(JSON.stringify(read())===before,'replay mutation');button('탐방 수첩으로');results.push('PASS permanent first-visit transcript and read-only replay');
    next();click('date-button');select('course-theme','river');select('course-status','visited');assert(d.querySelectorAll('[data-action-id]').length===1,'visited filter');select('course-status','new');assert(d.querySelectorAll('[data-action-id]').length===7,'new filter');select('course-status','all');close();
    start('river-bridge');for(let i=0;i<6;i++)choose();button('탐방 수첩 확인');button('새 이야기 읽기');assert($('modal-title').textContent==='지도가 아닌 속도','milestone');assert($('modal-body').textContent.includes('당신이 골랐던 말'),'choice callback');choose();choose();assert(w.LunaStory.done(read(),'journey-river-1'),'milestone completion');results.push('PASS distinct visits unlock a chapter with remembered choices');
    close();click('settings');select('text-size','largest');close();next();click('date-button');select('course-theme','river');close();start('river-reed');
    await Promise.all([d.fonts.load('16px Pretendard','수련과 보내는 하루'),d.fonts.load('16px "Gowun Batang"','달빛 아래 너와 나')]);await d.fonts.ready;
    assert(d.fonts.check('16px Pretendard','수련')&&d.fonts.check('16px "Gowun Batang"','수련'),'fonts failed');
    assert([...d.fonts].filter(f=>f.status==='loaded').length>=2,'font fallback only');assert(w.getComputedStyle(d.querySelector('.story-text')).fontFamily.includes('Gowun'),'story typography');assert(w.getComputedStyle(d.querySelector('.story-text')).fontSize==='21px','size preference');results.push('PASS both local fonts loaded, Korean story typeface and largest text');
    assert(d.documentElement.scrollWidth<=w.innerWidth+1&&$('modal').scrollWidth<=$('modal').clientWidth+1,'overflow');
    for(let i=0;i<60&&d.querySelector('.story-choices.line-hidden');i++)d.querySelector('.story-prose').click();assert(!d.querySelector('.story-choices.line-hidden'),'lines reveal choices');
    for(const b of d.querySelectorAll('[data-story-choice]')){const r=b.getBoundingClientRect();assert(r.height>=44&&r.width>=44&&r.left>=0&&r.right<=w.innerWidth+1,'choice target');}
    assert(errors.length===0,errors.join('\n'));await Promise.all([...$('modal-body').querySelectorAll('img')].map(img=>img.decode()));
    results.push(`PASS ${w.innerWidth}px narrative, keyboard focus, images and runtime`);
    window.showCourseBook=()=>{close();click('story-button');while(read().story.active)choose();close();click('date-button');button('탐방 수첩');};
    window.showCourseCatalog=()=>{close();click('date-button');select('course-theme','all');select('course-status','all');};
    document.body.dataset.status='passed';
  }catch(e){results.push('FAIL '+e.stack);document.body.dataset.status='failed';}
  document.getElementById('results').textContent=results.join('\n');
})();
