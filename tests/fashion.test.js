(async()=>{
  const frame=document.getElementById('app');await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  let w=frame.contentWindow,d=frame.contentDocument,E=w.LunaEngine,D=w.LunaData;
  const results=[],errors=[],listen=()=>{w.addEventListener('error',e=>errors.push(e.message));w.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));};listen();
  const assert=(v,msg)=>{if(!v)throw Error(msg);},$=id=>d.getElementById(id),click=id=>$(id).click(),read=()=>E.storage.load(0);
  const button=text=>{const b=[...$('modal-body').querySelectorAll('button')].find(b=>b.textContent.includes(text));assert(b&&!b.disabled,'missing '+text);b.click();};
  const close=()=>{if($('modal').open)click('close-modal');};
  const nextDay=()=>{close();click('next-day');if($('modal').open)button('다음 날로');};
  const filter=id=>{const b=d.querySelector(`[data-shop-filter="${id}"]`);assert(b,'filter '+id);b.click();};
  try{
    click('new-game');if($('modal').open)button('새로 시작');
    const fresh=D.outfits.filter(o=>o.collection==='city-2026');assert(fresh.length===8&&D.outfits.length===14,'catalog count');assert(new Set(fresh.map(o=>o.image)).size===8,'distinct images');
    click('shop-button');filter('new');assert(d.querySelectorAll('[data-shop-item]').length===8,'new filter');filter('mini');assert(d.querySelectorAll('[data-shop-item]').length===4,'mini filter');filter('midi');assert(d.querySelectorAll('[data-shop-item]').length===2,'midi filter');filter('pants');assert(d.querySelectorAll('[data-shop-item]').length===7,'pants filter');filter('accessory');assert(d.querySelectorAll('[data-shop-item]').length===2,'accessory filter');results.push('PASS 14-outfit catalog and six category filters');
    filter('mini');let before=JSON.stringify(read());d.querySelector('[data-shop-item="mini-pleats"] .product-preview').click();
    assert($('modal-body').querySelector('img').src.endsWith('/mini-pleats.png'),'preview uses actual artwork');assert(d.querySelector('[data-product-id="buy:mini-pleats"]').disabled,'insufficient funds');assert(JSON.stringify(read())===before,'preview charges');button('상점으로');assert(d.querySelector('[data-shop-filter="mini"]').getAttribute('aria-pressed')==='true','return filter');results.push('PASS full-body preview is free, preserves filter and enforces budget');close();
    for(const item of fresh){
      while(read().money<item.cost){
        if(E.reason(read(),'work','edit'))nextDay();
        click('work-button');button('+75,000');button('일 시작하기');
      }
      click('shop-button');filter('new');before=read();d.querySelector(`[data-product-id="buy:${item.id}"]`).click();button('구매하기');
      assert(read().money===before.money-item.cost&&read().ap===before.ap&&read().outfit===before.outfit,'purchase atomics '+item.id);
      d.querySelector(`[data-outfit-id="${item.id}"]`).click();assert(read().outfit===item.id&&$('character').src.endsWith('/'+item.id+'.png')&&$('character').classList.contains('full-body'),'equipped art '+item.id);
      assert($('modal-body').querySelector('img').src.endsWith('/'+item.id+'.png'),'wardrobe art');close();
      click('shop-button');assert(d.querySelector(`[data-product-id="buy:${item.id}"]`).disabled,'duplicate sale');close();
      if(E.reason(read(),'date','walk'))nextDay();
      click('date-button');button('무료');assert($('modal-body').querySelector('img').src.endsWith('/'+item.id+'.png'),'date preview');button('데이트 진행');
      for(let i=0;i<3;i++){assert($('modal-body').querySelector('img').src.endsWith('/'+item.id+'.png'),'story expression must preserve clothing');d.querySelector('[data-story-choice]').click();}
      close();assert(read().memories.at(-1).outfit===item.id,'memory snapshot');
      assert(E.validate(JSON.parse(JSON.stringify(read()))),'new outfit valid save');results.push('PASS purchase, equip, date, expressions and saved memory: '+item.id);
    }
    const saved=read();await new Promise(resolve=>{frame.addEventListener('load',resolve,{once:true});w.location.reload();});w=frame.contentWindow;d=frame.contentDocument;E=w.LunaEngine;D=w.LunaData;listen();click('continue-game');assert(read().owned.length===9&&read().outfit===saved.outfit&&read().money===saved.money,'reload state');
    click('wardrobe-button');d.querySelector('[data-outfit-id="casual"]').click();close();click('album-button');
    const memories=[...$('modal-body').querySelectorAll('.memory-card img')];assert(memories.length===8&&memories[0].src.endsWith('/utility-cargo.png')&&memories[7].src.endsWith('/mini-pleats.png'),'album preserves all prior outfits');results.push('PASS reload and all eight historical outfits after changing clothes');close();
    await Promise.all(fresh.map(o=>new Promise((resolve,reject)=>{const img=new w.Image();img.onload=()=>{try{assert(img.naturalWidth===1024&&img.naturalHeight===1536,'image size');const canvas=d.createElement('canvas');canvas.width=1024;canvas.height=1536;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);assert([[0,0],[1023,0],[0,1535],[1023,1535]].every(([x,y])=>ctx.getImageData(x,y,1,1).data[3]===0),'opaque corners');resolve();}catch(e){reject(e);}};img.onerror=()=>reject(Error(o.image));img.src=new URL(o.image,w.location.href).href;})));
    results.push('PASS eight full-size PNGs decode with transparent corners');
    click('shop-button');filter('mini');
    await Promise.all([...$('modal-body').querySelectorAll('img')].map(img=>img.decode()));
    assert($('modal').scrollWidth<=$('modal').clientWidth+1&&d.documentElement.scrollWidth<=w.innerWidth+1,'overflow');
    for(const b of d.querySelectorAll('.shop-filters button,.product-preview')){const r=b.getBoundingClientRect();assert(r.width>=44&&r.height>=44&&r.left>=0&&r.right<=w.innerWidth,'touch target');}
    assert(errors.length===0,errors.join('\n'));results.push(`PASS ${w.innerWidth}px shop layout, targets and runtime`);
    if(new URLSearchParams(location.search).get('scene')==='preview')d.querySelector('[data-shop-item="mini-pleats"] .product-preview').click();
    document.body.dataset.status='passed';
  }catch(e){results.push('FAIL '+e.stack);document.body.dataset.status='failed';}
  document.getElementById('results').textContent=results.join('\n');
})();
