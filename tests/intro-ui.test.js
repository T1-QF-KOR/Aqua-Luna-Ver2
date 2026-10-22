(async () => {
  const frame = document.getElementById('app'), results = [], errors = [];
  const assert = (v,msg) => { if(!v) throw Error(msg); };
  if (frame.contentDocument.readyState !== 'complete' || !frame.contentWindow.LunaEngine) await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  let w, d, E;
  const bind = () => { w=frame.contentWindow; d=frame.contentDocument; E=w.LunaEngine; w.addEventListener('error',e=>errors.push(e.message)); };
  bind();
  const savedKeys = Object.keys(w.localStorage).filter(k=>k.startsWith('aqualuna.v2.'));
  const originalStorage = Object.fromEntries(savedKeys.map(k=>[k,w.localStorage.getItem(k)]));
  const $=id=>d.getElementById(id), click=id=>$(id).click(), read=()=>E.storage.load(0);
  const modalButton=text=>{const b=[...$('modal-body').querySelectorAll('button')].find(b=>b.textContent.includes(text));assert(b&&!b.disabled,'missing button '+text);b.click();};
  const start=()=>{click('new-game');if($('modal').open)modalButton('새로 시작');};
  const reload=async()=>{await new Promise(resolve=>{frame.addEventListener('load',resolve,{once:true});frame.contentWindow.location.reload();});bind();};
  try {
    start();
    assert(!$('intro-screen').hidden&&$('play-screen').hidden,'new game must show intro first');
    assert(read().intro.step===0&&$('intro-previous').disabled,'first page state');
    assert($('intro-lines').textContent.includes('인디 어쿠스틱'),'admission background missing');
    assert(d.activeElement===$('intro-title'),'reading focus');
    results.push('PASS new game opens admission story before daily play');
    click('intro-next');click('intro-next');
    assert(read().intro.step===2&&$('intro-title').textContent.includes('같은 소리')&&$('intro-lines').textContent.includes('합주 과제'),'first project');
    click('intro-previous');assert(read().intro.step===1,'previous');click('intro-next');
    click('intro-save');modalButton('기억 03');if($('modal-title').textContent==='기억 덮어쓰기')modalButton('덮어쓰기');click('close-modal');
    assert(E.storage.load(3).intro.step===2,'manual intro save');
    click('intro-home');assert($('intro-screen').hidden&&!$('title-screen').hidden,'intro title exit');
    assert($('continue-note').textContent.includes('인트로 3/5'),'continue label');
    click('continue-game');assert(read().intro.step===2&&!$('intro-screen').hidden,'in-session resume');
    await reload();click('continue-game');assert(read().intro.step===2&&!$('intro-screen').hidden,'reload resume');
    results.push('PASS previous, manual save, title return and reload resume');
    click('settings');$('text-size').value='largest';$('text-size').dispatchEvent(new w.Event('change',{bubbles:true}));click('close-modal');
    for(const width of [1280,1440]) {
      frame.style.width=width+'px';
      assert(d.documentElement.scrollWidth<=width+1,'intro horizontal overflow');
      assert(parseFloat(w.getComputedStyle(d.querySelector('.intro-line')).fontSize)>=21,'large font');
      const page=d.querySelector('.intro-page').getBoundingClientRect(),portrait=$('character').getBoundingClientRect();
      assert(page.left>=0&&page.right<=width&&page.bottom<=w.innerHeight&&page.top>=w.innerHeight*.4,'dialogue box outside the lower stage');
      assert(Math.abs((page.left+page.right)/2-(portrait.left+portrait.right)/2)<width*.1,'Sulien stands centre stage behind the dialogue');
      assert($('intro-next').getBoundingClientRect().width>=100,'next button too small');
    }
    while(! $('intro-screen').hidden) click('intro-next');
    assert(!$('play-screen').hidden&&read().day===1&&read().money===80000&&read().ap===3&&read().energy===100,'completion resource change');
    assert(d.activeElement===$('story-button'),'daily handoff focus');
    click('home-button');click('continue-game');assert($('intro-screen').hidden,'completed intro replayed');
    results.push('PASS 1280/1440 layout, large text, all pages and daily handoff');
    click('home-button');start();assert(read().intro.step===0,'restart intro');click('intro-skip');
    assert(!$('play-screen').hidden&&!E.introPending(read()),'skip did not finish');
    results.push('PASS new game restarts intro and skip enters day one');
    let legacy=E.act(E.makeState(),'work','cafe').state;delete legacy.intro;
    E.storage.write('save.0',legacy);await reload();click('continue-game');
    assert($('intro-screen').hidden&&read().money===125000,'legacy save lost progress or replayed');
    results.push('PASS existing save resumes without intro');
    const original=w.Storage.prototype.setItem;
    try {
      w.Storage.prototype.setItem=function(){throw Error('test blocked storage');};
      click('home-button');start();click('intro-next');
      assert(!$('save-status').hidden,'save failure warning missing');
      click('intro-home');click('continue-game');assert($('intro-progress').textContent==='02 / 05','unsaved session lost');
    } finally { w.Storage.prototype.setItem=original; }
    click('intro-next');assert(read().intro.step===2&&$('save-status').hidden,'save recovery');
    assert(!errors.length,errors.join('\n'));results.push('PASS storage failure preserves session, recovery saves, no runtime errors');
    document.body.dataset.status='passed';
  } catch(e) {results.push('FAIL '+e.stack);document.body.dataset.status='failed';}
  finally {
    for(const key of Object.keys(w.localStorage).filter(k=>k.startsWith('aqualuna.v2.'))) w.localStorage.removeItem(key);
    for(const [key,value] of Object.entries(originalStorage)) w.localStorage.setItem(key,value);
    // Keep the final screenshot, but prevent a later click from saving the test session.
    frame.inert = true;
  }
  document.getElementById('results').textContent=results.join('\n');
})();
