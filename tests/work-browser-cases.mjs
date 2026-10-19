export async function workChecks({ evaluate, check, click, send, wait, until, shot }) {
  async function seed(expression = 'LunaEngine.makeState()', reduced = false) {
    await evaluate(`localStorage.setItem('aqualuna.v2.prefs',JSON.stringify({reduceMotion:${reduced},sfx:false,introAuto:false})); LunaEngine.storage.save(0,${expression});`);
    await send('Page.reload'); await until(()=>evaluate('Boolean(window.LunaEngine && document.readyState === "complete")'));
    await click('#continue-game');
  }
  async function work(id) {
    await click('#phone-button'); await click('[data-phone-app="work"]');
    await click(`[data-action-id="${id}"]`); await click('.confirm-actions .primary');
    await until(()=>evaluate('document.querySelector(".work-sulien")?.complete && document.querySelector(".work-sulien")?.naturalWidth > 0'));
  }
  for (const [id,pay] of [['cafe',45000],['edit',75000],['event',120000]]) {
    await seed('LunaEngine.makeState()',id==='event'); await work(id);
    await check(id+' vignette shows SD Sulien with distinct props',`document.querySelector('.work-vignette').dataset.workJob==='${id}' && document.querySelector('.work-props').children.length>0 && document.getElementById('modal-body').scrollWidth<=document.getElementById('modal-body').clientWidth+1`);
    await check(id+' pays only once on starting',`LunaEngine.storage.load(0).money===${80000+pay} && LunaEngine.storage.load(0).journal.filter(j=>j.type==='work').length===1`);
    await shot('work-'+id+'-1280');
    if(id==='cafe') {
      await click('.work-continue');
      await check('Skip reveals work result without extra payment',`document.querySelector('.work-vignette').classList.contains('finished') && LunaEngine.storage.load(0).money===125000`);
    } else if(id==='edit') {
      await until(()=>evaluate(`document.querySelector('.work-vignette').classList.contains('finished')`));
      await check('Timed editing sequence ends at payout',`document.querySelector('.work-reward').textContent.includes('75,000') && LunaEngine.storage.load(0).money===155000`);
    } else await check('Reduced motion immediately shows static result',`document.querySelector('.work-vignette').classList.contains('finished') && getComputedStyle(document.querySelector('.work-sulien')).animationName==='none'`);
    await check(id+' payout and return button remain readable at 720px',`(()=>{const r=document.querySelector('.work-reward').getBoundingClientRect(),b=document.querySelector('.work-continue').getBoundingClientRect(),p=document.getElementById('modal-body').getBoundingClientRect();return r.bottom<=b.top && b.bottom<=p.bottom+1;})()`);
    await click('.work-continue'); await check(id+' result returns to game','!document.getElementById("modal").open');
  }
  await seed(); await work('cafe');
  await evaluate('window.detachedWork = document.querySelector(".work-vignette")');
  await click('#close-modal'); await click('#phone-button'); await click('[data-phone-app="settings"]');
  await wait(3500);
  await check('Closing work disposes timers and leaves another app intact',`document.getElementById('modal-title').textContent==='환경 설정' && window.detachedWork.querySelector('.work-reward').hidden && LunaEngine.storage.load(0).money===125000`);
  await send('Page.reload'); await until(()=>evaluate('Boolean(window.LunaEngine && document.readyState === "complete")')); await click('#continue-game');
  await check('Reload preserves one payment without replay',`LunaEngine.storage.load(0).money===125000 && !document.querySelector('.work-vignette')`);
  async function clickText(text) {
    const selector=await evaluate(`(()=>{const buttons=[...document.querySelectorAll('#modal-body button')];const b=buttons.find(e=>e.textContent===${JSON.stringify(text)});if(!b)throw Error('Missing button');b.dataset.workTest='target';return '[data-work-test="target"]';})()`);
    await click(selector);
  }
  await seed(`LunaEngine.setSchedule(LunaEngine.makeState(),[{type:'work',id:'cafe'},{type:'work',id:'edit'}]).state`,true);
  await click('#phone-button'); await click('[data-phone-app="schedule"]'); await clickText('다음 일정 실행');
  await check('Scheduled work uses the same SD scene',`document.querySelector('.work-vignette').dataset.workJob==='cafe' && LunaEngine.storage.load(0).growth.schedule.length===1`);
  await click('.work-continue'); await check('Scheduled work returns to remaining plan',`document.getElementById('modal-title').textContent==='능력치와 오늘의 일정'`);
  await seed(`LunaEngine.setSchedule(LunaEngine.makeState(),[{type:'work',id:'cafe'},{type:'work',id:'edit'}]).state`,true);
  await click('#phone-button'); await click('[data-phone-app="schedule"]'); await click('[data-schedule-all]');
  await check('Batch work sums only completed jobs with no repeat rewards',`document.querySelector('.work-reward').textContent.includes('120,000') && LunaEngine.storage.load(0).money===200000 && LunaEngine.storage.load(0).growth.schedule.length===0`);
  // A blocked second job must never appear in the payout.
  await seed(`(()=>{const s=LunaEngine.makeState();s.energy=25;return LunaEngine.setSchedule(s,[{type:'work',id:'cafe'},{type:'work',id:'edit'}]).state;})()`,true);
  await click('#phone-button'); await click('[data-phone-app="schedule"]'); await click('[data-schedule-all]');
  await check('Partially blocked plan displays only the job actually completed',`document.querySelector('.work-reward').textContent.includes('45,000') && !document.querySelector('.work-reward').textContent.includes('영상') && LunaEngine.storage.load(0).money===125000 && LunaEngine.storage.load(0).growth.schedule.length===1`);
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await seed(); await work('cafe'); await shot('work-cafe-1440');
  await click('#modal-phone-home');
  await check('Home exits work without another payment',`!document.getElementById('phone').hidden && LunaEngine.storage.load(0).money===125000`);
}
