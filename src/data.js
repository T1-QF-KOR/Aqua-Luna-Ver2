/* Economy values are provisional. Authored narrative lives in story.js. */
(() => {
  const jobs = [
    { id: 'cafe', name: '카페 아르바이트', sub: '망원동의 작은 카페', description: '주문을 받고 커피를 내리는 짧은 근무.', pay: 45000, energy: 20, ap: 1, icon: '☕' },
    { id: 'edit', name: '영상 편집 외주', sub: '집중이 필요한 오후', description: '짧은 영상의 자막과 컷 편집을 마무리합니다.', pay: 75000, energy: 35, ap: 1, icon: '▣' },
    { id: 'event', name: '행사 운영 보조', sub: '하루를 부지런히', description: '행사 준비부터 현장 정리까지 돕습니다.', pay: 120000, energy: 50, ap: 2, icon: '✧' }
  ];
  const dates = [
    { id: 'walk', name: '달빛 부두 산책', sub: '돈보다 소중한 시간', description: '한강을 따라 천천히 걸으며 함께 시간을 보냅니다.', cost: 0, energy: 10, ap: 1, affection: 3, trust: 4, requiredTrust: 0, icon: '☾' },
    { id: 'cafe', name: '조용한 카페', sub: '따뜻한 두 잔의 여유', description: '수련이 좋아하는 조용한 카페에서 쉬어 갑니다.', cost: 35000, energy: 10, ap: 1, affection: 6, trust: 3, requiredTrust: 0, icon: '☕' },
    { id: 'concert', name: '첼로 공연', sub: '같은 선율을 듣는 밤', description: '둘이 나란히 앉아 클래식 공연을 감상합니다.', cost: 90000, energy: 20, ap: 2, affection: 10, trust: 6, requiredTrust: 20, icon: '♫' }
  ];
  const outfits = [
    { id: 'casual', name: '익숙한 차콜 후드', sub: '수련의 평소 모습', description: '편안한 후드와 목에 걸친 헤드폰.', cost: 0, image: 'assets/characters/sulien.png', color: '#737880' },
    { id: 'knit', name: '포근한 아이보리 니트', sub: '카페에서의 오후', description: '차분한 색감의 니트와 검은 슬랙스.', cost: 120000, image: 'assets/characters/sulien.png', color: '#e3d8c4' },
    { id: 'coat', name: '달빛 네이비 코트', sub: '함께 걷는 저녁', description: '선이 단정한 코트와 은은한 회색 머플러.', cost: 220000, image: 'assets/characters/sulien.png', color: '#3a4a68' }
  ];
  outfits.find(o => o.id === 'knit').image = 'assets/characters/knit.png';
  outfits.find(o => o.id === 'coat').image = 'assets/characters/coat.png';
  outfits.push({ id: 'skirt', name: '아이보리 가디건과 플리츠 스커트', sub: '차분한 외출', description: '무릎 길이의 차콜 치마와 로퍼. 스타킹을 따로 골라 코디할 수 있어요.', cost: 160000, image: 'assets/characters/skirt.png', color: '#dad2c4', fullBody: true });
  outfits.push(
    { id: 'shirt', name: '맑은 하늘빛 셔츠', sub: '가벼운 낮 산책', description: '여유 있는 하늘색 셔츠와 차콜 팬츠.', cost: 100000, image: 'assets/characters/shirt.png', color: '#b7cbe5' },
    { id: 'blouse', name: '라벤더 블라우스', sub: '차분한 봄빛', description: '은은한 보랏빛 블라우스와 검은 팬츠.', cost: 150000, image: 'assets/characters/blouse.png', color: '#b9abc7' }
  );
  const cityOutfits = [
  {
    "id": "mini-pleats",
    "name": "버건디 니트와 미니 플리츠",
    "category": "mini",
    "cost": 125000,
    "description": "버건디 골지 니트, 차콜 미니 플리츠 스커트와 메리제인.",
    "sub": "망원동 스타일 컬렉션",
    "image": "assets/characters/mini-pleats.png",
    "color": "#bcc8ca",
    "fullBody": true,
    "collection": "city-2026"
  },
  {
    "id": "denim-mini",
    "name": "후드 집업과 데님 미니스커트",
    "category": "mini",
    "cost": 110000,
    "description": "멜란지 크롭 집업과 인디고 A라인 미니스커트, 흰 스니커즈.",
    "sub": "망원동 스타일 컬렉션",
    "image": "assets/characters/denim-mini.png",
    "color": "#bcc8ca",
    "fullBody": true,
    "collection": "city-2026"
  },
  {
    "id": "suede-mini",
    "name": "스웨이드 재킷과 블랙 미니",
    "category": "mini",
    "cost": 195000,
    "description": "초콜릿 스웨이드 봄버와 블랙 미니스커트, 앵클부츠.",
    "sub": "망원동 스타일 컬렉션",
    "image": "assets/characters/suede-mini.png",
    "color": "#bcc8ca",
    "fullBody": true,
    "collection": "city-2026"
  },
  {
    "id": "bubble-mini",
    "name": "소프트 가디건과 버블 미니",
    "category": "mini",
    "cost": 140000,
    "description": "더스티 핑크 가디건, 아이보리 버블 미니스커트와 플랫 슈즈.",
    "sub": "망원동 스타일 컬렉션",
    "image": "assets/characters/bubble-mini.png",
    "color": "#bcc8ca",
    "fullBody": true,
    "collection": "city-2026"
  },
  {
    "id": "layered-denim",
    "name": "레이어드 니트와 와이드 데님",
    "category": "pants",
    "cost": 145000,
    "description": "아이보리 티셔츠 위 세이지 니트 베스트와 와이드 청바지.",
    "sub": "망원동 스타일 컬렉션",
    "image": "assets/characters/layered-denim.png",
    "color": "#bcc8ca",
    "fullBody": true,
    "collection": "city-2026"
  },
  {
    "id": "quarter-bermuda",
    "name": "쿼터집 니트와 버뮤다 팬츠",
    "category": "pants",
    "cost": 130000,
    "description": "오트밀 쿼터집과 차콜 무릎길이 버뮤다, 스니커즈.",
    "sub": "망원동 스타일 컬렉션",
    "image": "assets/characters/quarter-bermuda.png",
    "color": "#bcc8ca",
    "fullBody": true,
    "collection": "city-2026"
  },
  {
    "id": "satin-midi",
    "name": "블루 니트와 새틴 미디",
    "category": "midi",
    "cost": 175000,
    "description": "스모키 블루 니트와 샴페인 새틴 미디스커트, 슬링백.",
    "sub": "망원동 스타일 컬렉션",
    "image": "assets/characters/satin-midi.png",
    "color": "#bcc8ca",
    "fullBody": true,
    "collection": "city-2026"
  },
  {
    "id": "utility-cargo",
    "name": "시티 윈드브레이커와 카고",
    "category": "pants",
    "cost": 155000,
    "description": "세이지 바람막이와 차콜 카고 팬츠, 산책용 스니커즈.",
    "sub": "망원동 스타일 컬렉션",
    "image": "assets/characters/utility-cargo.png",
    "color": "#bcc8ca",
    "fullBody": true,
    "collection": "city-2026"
  }
];
  outfits.forEach(o => o.category = o.id === 'skirt' ? 'midi' : 'pants');
  outfits.push(...cityOutfits);
  const outfitCategories = [{id:'all',name:'전체'}, {id:'new',name:'새 코디'}, {id:'mini',name:'미니스커트'}, {id:'midi',name:'미디·롱'}, {id:'pants',name:'팬츠 코디'}, {id:'accessory',name:'소품'}];
  const accessories = [
    { id: 'none', name: '스타킹 미착용', cost: 0 },
    { id: 'black', name: '검은 스타킹', cost: 18000, description: '차콜 스커트와 어울리는 검은색 스타킹.' },
    { id: 'nude', name: '살색 스타킹', cost: 16000, description: '차분한 라이트 베이지 색상의 스타킹.' }
  ];
  const locations = {
    pier: { name: '망원동 · 달빛 부두', image: 'assets/environment/moonlit-pier.png' },
    cafe: { name: '망원동 · 조용한 카페', image: 'assets/environment/cafe.png' },
    practice: { name: '망원동 · 대여 연습실', image: 'assets/environment/practice.png' },
    concert: { name: '작은 실내악 공연장', image: 'assets/environment/concert.png' },
    rooftop: { name: '동네 건물 · 옥상 쉼터', image: 'assets/environment/rooftop.png' }
  };
  dates.forEach(d => d.location = d.id === 'walk' ? 'pier' : d.id);
  const expressions = [{ id: 'neutral', name: '차분한 표정' }, { id: 'smile', name: '잔잔한 미소' }, { id: 'thoughtful', name: '생각에 잠긴 표정' }];
  expressions.push({ id: 'shy', name: '수줍은 표정' }, { id: 'surprised', name: '살짝 놀란 표정' });
  const times = [{ id: 'morning', name: '아침' }, { id: 'afternoon', name: '오후' }, { id: 'evening', name: '노을' }, { id: 'night', name: '밤' }];
  const timeForAp = ap => times[Math.max(0, Math.min(3, 3 - ap))].id;
  locations.pier.variants = { morning: 'pier-morning', afternoon: 'pier-afternoon', evening: 'pier-evening' };
  locations.cafe.variants = { morning: 'cafe-day', afternoon: 'cafe-day' };
  locations.practice.variants = { morning: 'practice-day', afternoon: 'practice-day' };
  locations.rooftop.variants = { morning: 'rooftop-day', afternoon: 'rooftop-day', night: 'rooftop-night' };
  function sceneImage(location, time = 'night') {
    const place = locations[location] || locations.pier;
    return place.variants?.[time] ? `assets/environment/${place.variants[time]}.png` : place.image;
  }
  function availableExpressions(outfit) {
    return expressions.filter(e => e.id === 'neutral' || outfit === 'casual' || ['knit', 'coat', 'skirt'].includes(outfit) && ['smile', 'thoughtful'].includes(e.id));
  }
  function characterImage(outfit, legwear = 'none', expression = 'neutral') {
    if (!availableExpressions(outfit).some(e => e.id === expression)) expression = 'neutral';
    if (outfit === 'casual' && expression !== 'neutral') return `assets/characters/${['smile', 'thoughtful'].includes(expression) ? expression : 'casual-' + expression}.png`;
    const base = outfit === 'skirt' && ['black', 'nude'].includes(legwear) ? `skirt-${legwear}` : outfit;
    if (['knit', 'coat', 'skirt'].includes(outfit)) return `assets/characters/${base}${expression === 'neutral' ? '' : '-' + expression}.png`;
    return outfits.find(o => o.id === outfit)?.image || outfits[0].image;
  }
  const assetPaths = [...new Set([
    ...Object.keys(locations).flatMap(place => times.map(time => sceneImage(place, time.id))),
    ...outfits.flatMap(o => (o.id === 'skirt' ? accessories : [accessories[0]]).flatMap(a => availableExpressions(o.id).map(e => characterImage(o.id, a.id, e.id))))
  ])];
  window.LunaData = { jobs, dates, outfits, outfitCategories, accessories, locations, expressions, times, timeForAp, sceneImage, characterImage, availableExpressions, assetPaths, startingMoney: 80000, maxAp: 3 };
})();
