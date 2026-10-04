/* Economy values are provisional. Story and scenarios will be co-designed with the user. */
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
  window.LunaData = { jobs, dates, outfits, startingMoney: 80000, maxAp: 3 };
})();
