(async()=>{
  const frame=document.getElementById('app');
  await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  const w=frame.contentWindow,d=frame.contentDocument,E=w.LunaEngine,results=[];
  const assert=(ok,message)=>{if(!ok)throw new Error(message);};
  const $=id=>d.getElementById(id);
  const modalButton=text=>{const b=[...$('modal-body').querySelectorAll('button')].find(b=>b.textContent.includes(text));assert(b&&!b.disabled,`Missing modal action ${text}`);b.click();};
  const test=async(name,fn)=>{try{await fn();results.push(`PASS ${name}`);}catch(e){results.push(`FAIL ${name}: ${e.message}`);}};
  const start=()=>{$('new-game').click();if($('modal').open)modalButton('새로 시작');};
  const work=()=>{$('work-button').click();modalButton('+75,000');modalButton('일 시작하기');};
  const storageWrite=w.Storage.prototype.setItem;
  await test('Unavailable storage retains session and leaves persistent notice',()=>{
    start();
    w.Storage.prototype.setItem=function(key,value){if(key.startsWith('aqualuna.v2.save.'))throw new w.DOMException('Test quota failure','QuotaExceededError');return storageWrite.call(this,key,value);};
    work(); assert($('money').textContent.includes('155,000'),'Work still applies in memory');
    assert(E.storage.load(0).money===80000,'Old save unchanged after failure');
    const notice=$('save-status')&&!$('save-status').hidden&&$('save-status').textContent.includes('저장');
    $('home-button').click();assert(!$('continue-game').disabled,'In-session continue enabled');$('continue-game').click();
    assert($('money').textContent.includes('155,000'),'Continue must preserve unsaved money');
    assert(notice,'Visible persistent recovery notice');
  });
  await test('Storage recovers without losing unsaved progress',()=>{
    w.Storage.prototype.setItem=storageWrite;
    // Resume the current in-memory session if previous assertions stopped at the title.
    if($('play-screen').hidden)$('continue-game').click();
    $('home-button').click();$('continue-game').click();
    assert(E.storage.load(0).money===155000,'Recovered autosave contains latest session');
    assert($('save-status').hidden,'Recovery clears warning');
  });
  await test('Import rejects malformed file without replacing play state',async()=>{
    $('load-button').click();
    const input=$('modal-body').querySelector('input[type=file]'),transfer=new w.DataTransfer();
    transfer.items.add(new w.File(['{broken'],'broken.json',{type:'application/json'}));input.files=transfer.files;
    input.dispatchEvent(new w.Event('change',{bubbles:true}));
    const deadline=performance.now()+2000;
    while(input.value!==''&&performance.now()<deadline)await new Promise(resolve=>setTimeout(resolve,20));
    assert(E.storage.load(0).money===155000,'Invalid import leaves save intact');
    assert($('modal-title').textContent==='기억 불러오기','Invalid import does not navigate');
    assert(input.value==='','Invalid file picker resets for retry');
    $('close-modal').click();
  });
  await test('Closing import dialog cancels pending file read',async()=>{
    $('load-button').click();
    const input=$('modal-body').querySelector('input[type=file]'),transfer=new w.DataTransfer(),file=new w.File(['{}'],'delayed.json');
    let finishRead;Object.defineProperty(file,'text',{configurable:true,value:()=>new Promise(resolve=>finishRead=resolve)});
    transfer.items.add(file);input.files=transfer.files;
    // DataTransfer may wrap the File. Override the selected File instance as well.
    Object.defineProperty(input.files[0],'text',{configurable:true,value:()=>new Promise(resolve=>finishRead=resolve)});
    input.dispatchEvent(new w.Event('change',{bubbles:true}));$('close-modal').click();
    finishRead(JSON.stringify(E.makeState()));await new Promise(resolve=>setTimeout(resolve,30));
    assert(!$('modal').open,'Cancelled import must not reopen dialog');
    assert(E.storage.load(0).money===155000,'Cancelled import leaves progress intact');
  });
  w.Storage.prototype.setItem=storageWrite;
  document.getElementById('results').textContent=results.join('\n');document.body.dataset.status=results.some(r=>r.startsWith('FAIL'))?'failed':'passed';
})();
