/* Fractional progress is retained; the display is deliberately whole numbers. */
(function(root) {
  const W = root.AquaWorld;
  const stats = ['knowledge', 'fitness', 'sensitivity'];
  function gain(s, key, base) {
    if (!stats.includes(key)) return 0;
    s.growth ||= {};
    const before = s[key];
    // Study includes compulsory classes; physical practice has fewer available sources.
    const rate = key === 'knowledge' ? .075 : .12;
    const diminished = s[key] < 20 ? 1 : s[key] < 40 ? .5 : .25;
    s.growth[key] = (s.growth[key] || 0) + base * rate * diminished;
    const whole = Math.floor(s.growth[key] + 1e-9);
    s[key] = W.clamp(s[key] + whole); s.growth[key] -= whole;
    return s[key] - before;
  }
  const clothes = [
    ['nari','casual','크림 카디건 · 라벤더 톱 · 데님 스커트',80000], ['nari','suede-mini','슬레이트 스웨이드 재킷 · 미니스커트 · 부츠',120000],
    ['nari','utility-cargo','퍼프 블라우스 · 블랙 뷔스티에 원피스',110000], ['nari','mini-pleats','라벤더 그레이 니트 · 플리츠 미니',100000],
    ['daeun','denim-mini','회색 후드 집업 · 데님 미니',90000], ['daeun','layered-denim','니트 조끼 · 와이드 청바지',100000],
    ['daeun','quarter-bermuda','크림 맨투맨 · 버뮤다 팬츠',80000], ['seojin','shirt','차콜 블레이저 · 새틴 톱 · 슬랙스',110000],
    ['seojin','knit','블랙 비대칭 니트 · 그레이 슬랙스',100000], ['seojin','coat','차콜 롱코트 · 블랙 하이넥 · 가죽 스커트',120000]
  ].map(([person, outfit, name, price]) => ({ id:`clothes-${person}-${outfit}`, person, outfit, name, price, symbol:'♧', taste:['nari','daeun','seojin'].map(id=>id===person?3:0) }));
  const equipment = [{id:'headphones',name:'작곡용 헤드폰',price:60000,symbol:'♫'}, {id:'keyboard',name:'중고 건반',price:180000,symbol:'▤'}, {id:'recorder',name:'휴대용 녹음기',price:120000,symbol:'◉'}];
  function buyEquipment(s,id) {
    const item=equipment.find(i=>i.id===id); s.equipment ||= [];
    if(!item || s.equipment.includes(id) || s.money<item.price) return false;
    s.money-=item.price; s.equipment.push(id); return true;
  }
  function workReason(s) {
    if(s.workDays.includes(s.date)) return '오늘 근무는 끝났어.';
    if(s.date<'2026-03-11' || ![3,5,6].includes(W.weekday(s.date)) || ![1,2].includes(s.slot)) return '수·금·토 오후 또는 노을에 근무할 수 있어요.';
    return '';
  }
  function ticketScene(id) { return { title:'같은 객석', background:'concert', lines:[{text:'나는 표 두 장을 건네고 나란한 자리를 찾았다.',cast:[id],expr:'neutral'}, {speaker:W.people[id].short,text:{nari:'…오늘은 내 차례 안 기다려도 되네.',daeun:'드러머 보이지? 저 자리 좋다!',seojin:'끝까지 듣자. 오늘은 급할 것 없어.'}[id],cast:[id],expr:'smile',effect:{recurring:{[id]:3}}}, {text:'나는 앙코르가 끝날 때까지 자리를 지켰다.',cast:[id],expr:'neutral'}] }; }
  root.AquaEconomy={ticketScene,gain,stats,clothes,equipment,buyEquipment,workReason};
})(typeof window !== 'undefined' ? window : globalThis);
