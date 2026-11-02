/* Deterministic relationship transactions; menus only commit on confirmation. */
(function (root) {
  'use strict';
  const W = root.AquaWorld, people = ['nari', 'daeun', 'seojin'];
  const gifts = [
    { id: 'coffee', name: '캔커피', price: 2000, taste: [1, 2, 0], symbol: '☕' },
    { id: 'macarons', name: '마카롱 세트', price: 9000, taste: [1, 3, 1], symbol: '◌' },
    { id: 'flower', name: '꽃 한 송이', price: 7000, taste: [0, 1, 3], symbol: '✿' },
    { id: 'film', name: '필름 한 롤', price: 13000, taste: [1, 2, 2], symbol: '▣' },
    { id: 'picks', name: '기타 피크 세트', price: 8000, taste: [3, 1, 1], symbol: '♢' },
    { id: 'tape', name: '드럼 스틱 테이프', price: 6000, taste: [1, 3, 0], symbol: '╱' },
    { id: 'postcard', name: '그림엽서', price: 3000, taste: [2, 1, 2], symbol: '▱' },
    { id: 'warmer', name: '손난로', price: 3000, taste: [2, 2, 2], symbol: '♨' },
    { id: 'earphones', name: '이어폰 케이스', price: 15000, taste: [3, 1, 1], symbol: '♫' },
    { id: 'candy', name: '목캔디', price: 2500, taste: [2, 1, 1], symbol: '◇' }
  ];
  const destinations = [
    { id: 'river', name: '한강변 산책', price: 0, background: 'river', place: 'river', desc: '바람을 따라, 조금 느린 걸음으로.' },
    { id: 'cafe', name: '강변 카페', price: 9000, background: 'cafe', place: 'cafe', desc: '일하는 날과는 다른 창가 자리.' },
    { id: 'concert', name: '작은 공연', price: 24000, background: 'concert', place: 'concert', desc: '오늘은 둘 다 객석에 앉아서.' },
    { id: 'roof', name: '옥상 정원', price: 0, background: 'rooftop', place: 'roof', desc: '멀리 갈 필요 없는, 조용한 오후.' },
    { id: 'karaoke', name: '노래방', price: 16000, background: 'karaoke', place: 'karaoke', desc: '작은 방 하나와 마이크 두 개.' }
  ];
  gifts.push(...root.AquaEconomy.clothes);
  const birthdays = { nari: '10-14', daeun: '07-28', seojin: '08-19' };
  function initial() {
    return { inventory: {}, lastGift: {}, gifts: [], album: [], lastMet: {},
      knownBirthdays: {}, jealousy: {}, witnessGreeting: {}, nariRadioPending: null, karaokeInvites: [] };
  }
  function ensure(s) { return s.social ||= initial(); }
  function present(s, person, place) { return W.presentAt(s, place).includes(person); }
  function buy(s, id) {
    const item = gifts.find(g => g.id === id), social = ensure(s);
    if (!item) return { ok: false, reason: '물건을 다시 골라 주세요.' };
    if (s.money < item.price) return { ok: false, reason: '소지금이 부족해요.' };
    if ((social.inventory[id] || 0) >= 99) return { ok: false, reason: '같은 물건은 99개까지 보관할 수 있어요.' };
    s.money -= item.price; social.inventory[id] = (social.inventory[id] || 0) + 1;
    return { ok: true, item };
  }
  function giftReason(s, person, id, place) {
    const social = ensure(s);
    if (!present(s, person, place)) return '지금 같은 장소에서 만날 수 있는 사람에게 건네요.';
    if (id && gifts.find(g=>g.id===id)?.person && gifts.find(g=>g.id===id).person !== person) return '그 사람을 위해 고른 옷이에요.';
    if (id && (!gifts.some(g => g.id === id) || !social.inventory[id])) return '가방에 없는 물건이에요.';
    if (social.lastGift[person] && s.date < W.addDays(social.lastGift[person], 7)) return '선물은 같은 사람에게 7일에 한 번 건넬 수 있어요.';
    return '';
  }
  function give(s, person, id, place) {
    const reason = giftReason(s, person, id, place), item = gifts.find(g => g.id === id);
    if (reason || !item) return { ok: false, reason: reason || '건넬 선물을 골라 주세요.' };
    const social = ensure(s);
    const rank = id === 'candy' && person === 'nari' && s.date >= '2026-10-01' ? 3 : item.taste[people.indexOf(person)];
    const birthday = s.date.slice(5) === birthdays[person];
    const gain = W.recurringBond(s, person, [-2, 1, 3, 6][rank] * (birthday ? 2 : 1));
    social.inventory[id]--; social.lastGift[person] = s.date; social.lastMet[person] = s.date;
    if (birthday) social.knownBirthdays[person] = true;
    if(item.outfit) { s.giftClothes ||= {}; s.giftClothes[person]=item.outfit; }
    social.gifts.push({ date: s.date, person, item: id, birthday });
    return { ok: true, item, rank, gain, birthday };
  }
  function dateReason(s, person, destination, meetingPlace, eveningEvent = false) {
    const place = destinations.find(d => d.id === destination);
    if (!present(s, person, meetingPlace)) return '지금 만난 사람과 약속할 수 있어요.';
    if (s.bond[person] < (person === 'nari' ? 25 : 15)) return '조금 더 가까워진 뒤에 약속해요. 친구 사이부터 함께할 수 있어요.';
    if (s.slot !== 1) return '오후에 시작해 노을까지 두 칸을 함께 보내요.';
    if (eveningEvent) return '오늘 노을에는 먼저 정해진 약속이 있어요.';
    if (s.energy < 15) return '기력이 15 이상 필요해요.';
    if (!place) return '함께 갈 곳을 골라 주세요.';
    if (s.money < place.price) return '소지금이 부족해요.';
    return '';
  }
  function invite(s, person, destination, meetingPlace, eveningEvent = false) {
    const reason = dateReason(s, person, destination, meetingPlace, eveningEvent);
    if (reason) return { ok: false, reason };
    const social = ensure(s), place = destinations.find(d => d.id === destination);
    if (person === 'nari' && destination === 'karaoke') {
      if (social.karaokeInvites.length < 2 || s.bond.nari < 45 || !s.seen.includes('nariVoice') || s.date < '2026-09-01') {
        if (social.karaokeInvites.length < 2 && !social.karaokeInvites.includes(s.date)) social.karaokeInvites.push(s.date);
        return { ok: false, refused: true, reason: '…다른 데 가자. 노래방 말고.' };
      }
    }
    s.money -= place.price; s.energy -= 15; social.lastMet[person] = s.date;
    const variant = social.album.filter(a => a.person === person && a.destination === destination).length % 4;
    const outing = { person, destination, date: s.date, variant, bonus: 0 };
    if (person === 'nari' && destination === 'karaoke' && !s.seen.includes('nariRoom')) outing.routeId = 'nariRoom';
    return { ok: true, outing };
  }
  function finishDate(s, outing) {
    const social = ensure(s), key = `${outing.date}:${outing.person}:${outing.destination}`;
    if (social.album.some(a => a.key === key)) return false;
    if (!outing.routeId) W.recurringBond(s, outing.person, 3 + Math.max(2, Math.min(4, outing.bonus || 2)));
    if (outing.routeId && !s.seen.includes(outing.routeId)) s.seen.push(outing.routeId);
    social.album.push({ ...outing, key });
    root.AquaRomance?.noteDate(s, outing.person);
    if(outing.appointmentId){const a=root.AquaMessages.ensure(s).appointments.find(a=>a.id===outing.appointmentId);if(a)a.status='done';}
    if (social.jealousy[outing.person]) social.jealousy[outing.person].upset = false;
    return true;
  }
  function attention(s, selected, observers, witness = false) {
    if (witness) root.AquaRomance?.witness(s, selected, observers);
    const social = ensure(s), lines = [];
    for (const id of [...new Set(observers)]) {
      if (id === selected || !s.met.includes(id) || s.bond[id] < (witness ? 35 : 15)) continue;
      const record = social.jealousy[id] ||= { aware: false, date: null, upset: false };
      if (record.date === s.date) continue;
      record.date = s.date;
      const bond = s.bond[id];
      if (bond >= 55) {
        s.bond[id] = W.clamp(bond - (s.romance?.mode === 'open' && root.AquaRomance.isLover(s,id) && root.AquaRomance.isLover(s,selected) ? 1.5 : 3)); record.upset = true;
      } else if (bond >= 35 && !record.aware) {
        record.aware = true; s.flags[`${id}Aware`] = true; s.bond[id] = W.clamp(bond + 3);
      } else if (bond >= 35) { s.bond[id] = W.clamp(bond - (s.romance?.mode === 'open' && root.AquaRomance.isLover(s,id) && root.AquaRomance.isLover(s,selected) ? 1 : 2)); record.upset = true; }
      const text = id === 'nari' ? '나리가 피크 모서리를 엄지로 한 번 문지르고, 시선을 돌렸다.' :
        id === 'daeun' ? bond < 35 ? '다은의 웃음이 잠깐 멈췄다가 조금 크게 돌아왔다.' : record.upset ? '다은이 휴대폰을 뒤집었다. “아냐, 둘이 얘기해. 나 먼저 갈게. ㅋ.”' : '“야, 나도 좀 봐 줘. ㅋㅋ.” 다은은 웃고 나서 자기 말에 잠깐 놀란 듯했다.' :
        bond < 35 ? '서진이 빈 잔을 가지런히 맞추었다. 방금 닦았던 잔이었다.' : record.upset ? '서진의 인사가 짧아졌다. “먼저 갈게.”' : '서진의 손이 멎었다. 나와 눈이 마주쳤지만 먼저 웃어 주지는 않았다.';
      const varied = root.AquaDialogue.pick(s, `jealousy:${id}`, root.AquaDialogue.jealousy[id]);
      lines.push({ expr:'jealous', text: witness ? `${W.people[id].name}와 잠깐 눈이 마주쳤다. ${varied}` : varied, cast: witness ? [selected, id] : [...new Set([selected, ...observers])] });
      if (id === 'nari' && bond >= 35) social.nariRadioPending = { date: s.date, witness };
      if (witness && bond >= 55) social.witnessGreeting[id] = true;
    }
    return lines;
  }
  function greeting(s, id) {
    const social = ensure(s), stage = s.bond[id];
    social.lastMet[id] = s.date;
    if (social.witnessGreeting[id]) {
      delete social.witnessGreeting[id];
      return { nari: '…왔어. 오늘은 어디 가?', daeun: '그날 재밌었냐? ㅋ. 아냐, 그냥 물어봤어.', seojin: '바빴나 보네. 오늘은 무슨 얘기 하려고 왔어?' }[id];
    }
    return stage >= 35 ? { nari: '…너 올 것 같아서. 그냥, 잠깐 더 있었어.', daeun: '왔네! 너 안 오면 내가 먼저 부르려고 했지.', seojin: '네 자리 여기. 내가 먼저 봐 둔 건데, 앉을래?' }[id] :
      { nari: '…안녕. 오늘도 학교에 있었네.', daeun: '오! 여기서 보네. 잠깐 얘기할래?', seojin: '왔네. 잠깐은 괜찮아.' }[id];
  }
  root.AquaSocial = { gifts, destinations, birthdays, initial, ensure, buy, giftReason, give, dateReason, invite, finishDate, attention, greeting };
})(typeof window !== 'undefined' ? window : globalThis);
