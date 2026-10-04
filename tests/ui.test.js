(async () => {
  const frame = document.getElementById('app');
  await new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
  const w = frame.contentWindow, d = frame.contentDocument, E = w.LunaEngine;
  const results = [], errors = [];
  w.addEventListener('error', e => errors.push(e.message));
  const assert = (ok, text) => { if(!ok) throw new Error(text); };
  const $ = id => d.getElementById(id);
  const click = id => { assert($(id), `Missing ${id}`); $(id).click(); };
  const modalButton = text => { const b=[...$('modal-body').querySelectorAll('button')].find(b=>b.textContent.includes(text)); assert(b && !b.disabled, `Missing or disabled modal button: ${text}`); b.click(); };
  const read = () => E.storage.load(0);
  try {
    assert($('title-screen') && !$('title-screen').hidden,'Title is visible');
    assert(w.LunaData && E, 'Runtime loads');
    click('new-game'); if($('modal').open) modalButton('새로 시작');
    assert(!$('play-screen').hidden && read().money===80000,'New game starts'); results.push('PASS boot and new game');
    click('budget-button'); d.querySelector('[data-goal-id="buy:knit"]').click();
    assert(read().expenseGoal.id==='knit' && read().money===80000,'Budget target saved without spending');
    assert($('budget-detail').textContent.includes('40,000원'),'Shortfall on game screen'); click('close-modal'); results.push('PASS budget target and live shortage');
    click('work-button'); modalButton('+75,000');
    assert($('modal-body').querySelector('.resource-preview').textContent.includes('155,000원'),'Forecast shows exact future balance');
    assert(read().money===80000,'Preview is not a transaction'); modalButton('돌아가기'); assert(read().ap===3,'Cancel costs no time');
    modalButton('+75,000'); modalButton('일 시작하기');
    assert(read().money===155000 && $('money').textContent.includes('155,000'), 'Job updates DOM and saved money');
    assert($('budget-detail').textContent.includes('예산 준비 완료'),'Earning updates target readiness');
    assert($('activity-feed').textContent.includes('영상 편집 외주 완료'),'Activity appears as text'); results.push('PASS work confirmation, economy, text feed, autosave');
    click('wardrobe-button'); modalButton('120,000'); modalButton('구매하기'); modalButton('갈아입기');
    assert(read().money===35000 && read().outfit==='knit','Buy and equip');
    assert(read().expenseGoal===null,'Purchase completes selected target');
    assert($('equipped-name').textContent.includes('니트'),'Text outfit state visible');
    assert(d.querySelector('[data-outfit-id="knit"]').disabled,'Owned/equipped cannot buy twice'); results.push('PASS buy, equip, duplicate guard');
    click('close-modal'); click('date-button'); modalButton('35,000'); modalButton('데이트 진행');
    assert(read().money===0 && read().trust===3 && read().affection===6,'Date charges exact remaining balance');
    click('date-button'); assert([...$('modal-body').querySelectorAll('.primary')].every(b=>b.disabled),'Daily date cap'); click('close-modal'); results.push('PASS paid date and repeat prevention');
    click('save-button'); modalButton('기억 01'); if($('modal-title').textContent==='기억 덮어쓰기') modalButton('덮어쓰기');
    click('close-modal'); click('next-day'); if($('modal').open) modalButton('다음 날로');
    assert(read().day===2 && read().ap===3,'Advance day');
    click('load-button'); modalButton('기억 01'); modalButton('불러오기');
    assert(read().day===1 && read().money===0 && read().outfit==='knit','Manual save restore'); results.push('PASS next day and manual save/load roundtrip');
    click('journal-button'); assert($('modal-body').textContent.includes('누적 지출 155,000원'),'Journal accounting'); click('close-modal');
    click('settings'); const checkbox=$('modal-body').querySelector('input[type=checkbox]'); checkbox.click(); assert($('game').classList.contains('portrait-off'),'Text only mode'); checkbox.click(); click('close-modal'); results.push('PASS journal and illustration toggle');
    click('settings'); const size=$('text-size'); size.value='largest'; size.dispatchEvent(new w.Event('change',{bubbles:true}));
    assert(w.getComputedStyle($('modal-body').querySelector('.reading-sample')).fontSize==='21px','Large reading font');
    assert(E.storage.read('prefs').textSize==='largest','Reading preference saved'); click('close-modal'); results.push('PASS reading size preference and preview');
    click('home-button'); click('continue-game'); assert(read().money===0 && !$('play-screen').hidden,'Continue'); results.push('PASS return to title and resume');
    const width=w.innerWidth; assert(d.documentElement.scrollWidth <= width+1,`Horizontal overflow: ${d.documentElement.scrollWidth} > ${width}`);
    for(const id of ['work-button','date-button','wardrobe-button','rest-button','next-day','budget-button']) { const r=$(id).getBoundingClientRect(); assert(r.width>=44 && r.height>=36,`${id} touch target`); assert(r.left>=0 && r.right<=width,`${id} outside viewport`); }
    const feedPanel=d.querySelector('.text-play').getBoundingClientRect(), summaryPanel=d.querySelector('.day-message').getBoundingClientRect(); assert(feedPanel.bottom<=summaryPanel.top,'Large text does not overlap day summary');
    assert(errors.length===0,errors.join('\n')); results.push(`PASS ${width}px layout, controls, no runtime errors`);
    const scene = new URLSearchParams(location.search).get('scene');
    if(scene==='title') click('home-button');
    if(scene==='wardrobe') click('wardrobe-button');
    if(scene==='date') click('date-button');
    if(scene==='budget') { click('budget-button'); d.querySelector('[data-goal-id="buy:coat"]').click(); }
    document.body.dataset.status='passed';
  } catch(e) { results.push(`FAIL ${e.stack}`); document.body.dataset.status='failed'; }
  document.getElementById('results').textContent=results.join('\n');
})();
