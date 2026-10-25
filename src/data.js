/* Economy values are provisional. Authored narrative lives in story.js. */
(() => {
  const jobs = [
    { id: 'cafe', name: '카페 아르바이트', sub: '수·금·토 · 4시간 근무', description: '미리 잡아 둔 수·금·토 근무. 주문과 설거지를 마치고 교대합니다. 하루 한 번, 4시간 일해 45,000원을 받아요.', weekdays: ['수','금','토'], hours: 4, pay: 45000, energy: 20, ap: 1, icon: '☕' },
    { id: 'edit', name: '영상 편집 외주', sub: '사전 수주한 짧은 영상 1편', description: '미리 맡은 영상 한 편의 자막·컷 수정과 납품을 마무리합니다. 하루 작업 한 건만 정산하며, 다른 근무와 겹쳐 잡지 않아요.', pay: 75000, energy: 35, ap: 1, icon: '▣' },
    { id: 'event', name: '행사 운영 보조', sub: '토·일 · 8시간 근무', description: '주말에 신청한 현장 근무. 준비·안내·정리를 포함해 8시간 일하고, 식사·휴식 시간은 따로 확보합니다.', weekdays: ['토','일'], hours: 8, pay: 120000, energy: 50, ap: 2, icon: '✧' }
  ];
  const dates = [
    { id: 'walk', name: '달빛 부두 산책', sub: '귀가 전 짧게 · 무료', description: '돌아갈 버스와 환승 시간을 먼저 확인하고, 한강의 짧은 구간만 함께 걷습니다.', cost: 0, energy: 10, ap: 1, affection: 3, trust: 4, requiredTrust: 0, icon: '☾' },
    { id: 'cafe', name: '조용한 카페', sub: '음료 두 잔 · 2인 합계', description: '공강이나 알바 전의 짧은 약속. 음료 두 잔을 사고 다음 일정 전까지 이야기합니다.', cost: 12000, energy: 10, ap: 1, affection: 6, trust: 3, requiredTrust: 0, icon: '☕' },
    { id: 'concert', name: '발라드 라이브', sub: '미리 비워 둔 날 · 2인 티켓', description: '둘 다 근무 없는 날을 골라 예매하는 특별한 외출. 공연 종료 후 환승할 여유까지 잡습니다.', cost: 90000, energy: 20, ap: 2, affection: 10, trust: 6, requiredTrust: 20, icon: '♫' },
    { id: 'lunch', name: '공강 사이 학식', sub: '평일 점심 · 식권 두 장', description: '학생식당에서 함께 먹는 점심. 1인 5,000원, 두 사람 합계 10,000원을 내가 결제해요. 평일 첫 활동으로 선택합니다.', weekdays: ['월','화','수','목','금'], firstActivity: true, departureTime: 'afternoon', cost: 10000, energy: 5, ap: 1, affection: 3, trust: 4, requiredTrust: 0, icon: '🍚' }
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
    practice: { name: '교내 · 예약 연습실', image: 'assets/environment/practice.png' },
    concert: { name: '망원동 · 발라드 라이브 카페', image: 'assets/environment/acoustic-live.png' },
    rooftop: { name: '동네 건물 · 옥상 쉼터', image: 'assets/environment/rooftop.png' },
    cafeteria: { name: '교내 · 학생식당', image: 'assets/environment/cafe-day.png' }
  };
  dates.forEach(d => d.location = ({ walk: 'pier', lunch: 'cafeteria' })[d.id] || d.id);
  const expressions = [{ id: 'neutral', name: '차분한 표정' }, { id: 'smile', name: '잔잔한 미소' }, { id: 'thoughtful', name: '생각에 잠긴 표정' }];
  expressions.push({ id: 'shy', name: '수줍은 표정' }, { id: 'surprised', name: '살짝 놀란 표정' });
  expressions.push({ id: 'worried', name: '걱정스러운 표정' }, { id: 'playful', name: '장난스러운 미소' });
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
  function characterImage(outfit, legwear = 'none', expression = 'neutral', neckAccessory = 'none') {
    if (!outfits.some(o => o.id === outfit)) outfit = 'casual';
    if (!availableExpressions(outfit).some(e => e.id === expression)) expression = 'neutral';
    const on = neckAccessory === 'headset';
    if (outfit === 'casual' && expression !== 'neutral') {
      const pose = expression === 'smile' ? 'warm-smile' : expression;
      return `assets/characters/${on ? 'poses-20261007' : 'poses-no-headset'}/${pose}.png`;
    }
    const base = outfit === 'skirt' && ['black','nude'].includes(legwear) ? `skirt-${legwear}` : outfit;
    if ((['knit','coat','skirt'].includes(outfit) && expression !== 'neutral') || base !== outfit)
      return `assets/characters/${on ? '' : 'variants-no-headset/'}${base}${expression === 'neutral' ? '' : '-' + expression}.png`;
    return `assets/characters/${!on ? 'fullbody-no-headset' : ['blouse','satin-midi'].includes(outfit) ? 'fullbody-headset' : 'fullbody-20261007'}/${outfit}.png`;
  }
  // Story scenes: every outfit has 7 expressions in the accessory-free set (same pose, only the face changes).
  // With the headset or tights on, fall back to the main portrait set so the outfit stays accurate.
  const sceneFaces = ['neutral', 'smile', 'thoughtful', 'shy', 'surprised', 'worried', 'playful'];
  function sceneCharacter(outfit, legwear = 'none', expression = 'neutral', neckAccessory = 'none') {
    if (!outfits.some(o => o.id === outfit)) outfit = 'casual';
    if (!sceneFaces.includes(expression)) expression = 'neutral';
    if (neckAccessory === 'headset' || (outfit === 'skirt' && legwear !== 'none')) return characterImage(outfit, legwear, expression, neckAccessory);
    return `assets/characters/accessory-free/${outfit}${expression === 'neutral' ? '' : '-' + expression}.png`;
  }
  function characterFraming(path) {
    return /(?:^|\/)(?:knit|coat)-(?:smile|thoughtful)\.png$/.test(path) ? 'portrait' : 'full';
  }
  // Legacy gift ids stay stable for existing taste discoveries and gift journals.
  // Small daily gifts. Tastes follow Sulien's profile (acoustic guitar, indie acoustic, quiet cafes, warm drinks) and stay hidden until given.
  const gifts = [
    { id: 'citron-tea', name: '따뜻한 유자차', cost: 4500, taste: 'loved', icon: '☕', desc: '목이 쉬기 쉬운 날을 위한 따뜻한 한 잔.' },
    { id: 'score-clip', name: '보컬 악보 표시 탭', cost: 6000, taste: 'loved', icon: '♪', desc: '숨 쉴 자리와 강조할 가사를 표시하는 탭. 발라드 연습 노트에 붙일 수 있어요.' },
    { id: 'cello-card', name: '발라드 공연 엽서', cost: 3000, taste: 'liked', icon: '✉', desc: '작은 발라드 공연의 마이크 그림과 날짜가 담긴 엽서.' },
    { id: 'lemon-candy', name: '레몬 사탕', cost: 2000, taste: 'liked', icon: '◍', desc: '연습 전에 하나씩 먹기 좋은 새콤한 사탕.' },
    { id: 'iced-americano', name: '아이스 아메리카노', cost: 4000, taste: 'neutral', icon: '❄', desc: '시원하지만, 목을 아끼는 사람에게는 어떨지.' },
    { id: 'charm-keyring', name: '고양이 키링', cost: 5000, taste: 'neutral', icon: '✧', desc: '가방에 다는 작은 고양이 장식.' },
    { id: 'spicy-snack', name: '매운 떡볶이 과자', cost: 2500, taste: 'disliked', icon: '✺', desc: '요즘 유행하는 아주 매운 과자.' },
    { id: 'perfume-sample', name: '진한 향수 샘플', cost: 7000, taste: 'disliked', icon: '❀', desc: '향이 오래 남는 진한 향수.' }
  ];
  // School calendar: DAY 1 is Monday, 2 March 2026 (legacy epoch; new games start DAY 2, March 3 after the substitute holiday). Days keep running; the calendar only adds rhythm.
  const birthday = { month: 4, date: 17 };
  const termEvents = [
    { from: [3, 3], to: [3, 6], id: 'start', name: '개강 주간' },
    { from: [4, 20], to: [4, 24], id: 'exam', name: '중간고사' },
    { from: [5, 20], to: [5, 22], id: 'festival', name: '봄 축제' },
    { from: [6, 15], to: [6, 19], id: 'exam', name: '기말고사' },
    { from: [6, 20], to: [8, 31], id: 'break', name: '여름방학' },
    { from: [9, 1], to: [9, 4], id: 'start', name: '2학기 개강 주간' },
    { from: [10, 19], to: [10, 23], id: 'exam', name: '중간고사' },
    { from: [10, 28], to: [10, 30], id: 'festival', name: '가을 축제' },
    { from: [12, 14], to: [12, 18], id: 'exam', name: '기말고사' },
    { from: [12, 19], to: [12, 31], id: 'break', name: '겨울방학' },
    { from: [1, 1], to: [3, 1], id: 'break', name: '겨울방학' }
  ];
  const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
  function calendar(day) {
    const d = new Date(Date.UTC(2026, 2, 2 + day - 1)), month = d.getUTCMonth() + 1, date = d.getUTCDate(), md = month * 100 + date;
    const event = termEvents.find(e => md >= e.from[0] * 100 + e.from[1] && md <= e.to[0] * 100 + e.to[1]) || null;
    const term = md >= 303 && md <= 619 ? 1 : md >= 901 && md <= 1218 ? 2 : 0;
    const termStart = term === 1 ? Date.UTC(d.getUTCFullYear(), 2, 2) : term === 2 ? Date.UTC(d.getUTCFullYear(), 8, 1) : 0;
    const week = term ? Math.floor((d - termStart) / 604800000) + 1 : 0;
    return { year: d.getUTCFullYear(), month, date, weekday: weekdayNames[d.getUTCDay()], event, term, week, birthday: month === birthday.month && date === birthday.date,
      label: `${month}월 ${date}일 (${weekdayNames[d.getUTCDay()]})`, termLabel: term ? `${term}학기 ${week}주차` : event?.name || '방학' };
  }
  const dayOf = (year, month, date) => Math.round((Date.UTC(year, month - 1, date) - Date.UTC(2026, 2, 2)) / 86400000) + 1;
  const neckAccessories = [{ id: 'headset', name: '수련의 헤드셋', image: 'assets/accessories/20261007/headset.png', cost: 0, defaultOwned: true }];
  // Interior UI backdrops do not change the saved story location.
  const interiors = { room: 'assets/environment/sulien-room.png', fitting: 'assets/environment/wardrobe-fitting.png' };
  const assetPaths = [...new Set([
    'assets/characters/sulien-sd-work.png',
    ...Object.values(interiors),
    ...neckAccessories.map(a => a.image),
    ...Object.keys(locations).flatMap(place => times.map(time => sceneImage(place, time.id))),
    ...outfits.flatMap(o => (o.id === 'skirt' ? accessories : [accessories[0]]).flatMap(a => availableExpressions(o.id).flatMap(e => ['none','headset'].map(neck => characterImage(o.id, a.id, e.id, neck)))))
  ])];
  window.LunaData = { calendar, dayOf, birthday, termEvents, gifts, jobs, dates, outfits, outfitCategories, accessories, neckAccessories, locations, interiors, expressions, times, timeForAp, sceneImage, characterImage, sceneCharacter, sceneFaces, characterFraming, availableExpressions, assetPaths, startingMoney: 80000, maxAp: 3 };
})();
