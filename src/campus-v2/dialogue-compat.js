/* Bridge the dialogue pool and the scene transaction API. */
(function (root) {
  'use strict';
  const D = root.AquaDialogue, W = root.AquaWorld;
  D.initial = () => ({ recent: {}, greetingSession: null });
  function groundedLine(state, person, topic, index, text) {
    const seen = id => state.seen.includes(id);
    const fallback = {
      'nari:0:1': '빈 강의실은 조용해서 좋아. 의자 소리도 잘 들리고.',
      'nari:0:2': '악보는 쓰는 사람마다 모양이 다르지. 네 악보도 궁금해.',
      'nari:4:3': '같이 걷는 길이 생기면 좋겠다. 가게 이름은 몰라도 기억할 수 있게.',
      'nari:5:3': '가사 쓰는 건 어렵지. 누가 먼저 한 줄을 쓰나 내기할까.',
      'daeun:1:2': '네가 박자 세어 주면 편할 것 같아. 너무 빨라지면 말해 줘.',
      'daeun:2:2': '너 매운 거 잘 먹어? 나는 물부터 챙길 거야.',
      'daeun:4:2': '버스 정류장 지나칠 정도로 재밌는 얘기 하고 싶다. 너랑.',
      'daeun:4:5': '우리 자주 걸을 수 있는 길을 하나 정해 볼까? 벤치 있는 데로.',
      'seojin:0:1': '그 어려운 표정은 과제 때문이야? 그럼 내가 들을 수는 있겠네.',
      'seojin:1:2': '네가 좋아하는 곡 하나 골라. 끝까지 들어 볼게. 네 취향 궁금하거든.',
      'seojin:1:5': '다음에는 네가 곡 골라. 내가 조금 더 있고 싶어질 만한 걸로.',
      'seojin:2:2': '커피 취향은 직접 알려 줘. 맞혀 보는 건 조금 더 친해진 다음에 하고.',
      'seojin:2:4': '뭐 먹을래? 네 몫까지 고를 생각은 없으니까 직접 골라.'
    };
    const checks = {
      'nari:0:2': seen('nariClass'), 'nari:4:3': state.social.album.some(a => a.person === 'nari' && a.destination === 'river'),
      'nari:5:3': seen('nariClass'), 'daeun:1:2': false, 'daeun:2:2': seen('daeunFirst'),
      'daeun:4:2': false, 'daeun:4:5': state.social.album.some(a => a.person === 'daeun' && a.destination === 'river'),
      'seojin:1:2': !!state.flags.seojinHeardSong, 'seojin:1:5': !!state.flags.seojinHeardSong,
      'seojin:2:2': seen('seojinCup'), 'seojin:2:4': false
    };
    const key = `${person}:${topic}:${index}`;
    return fallback[key] && checks[key] !== true ? fallback[key] : text;
  }
  D.peekTalk = (state, person, topic) => {
    const stage = D.tier(state, person);
    const autumn = person === 'nari' && topic === 5 && state.date >= '2026-09-01';
    const lines = autumn ? ['…요즘 그 얘기 좀 무거워. 다른 얘기 해도 돼?', '꿈 얘기는 오늘 말고. 그냥 여기 같이 있어 주면 안 돼?'] : D.talk[person][topic].slice(stage * 2, stage * 2 + 2);
    const entries = lines.map((text, i) => ({ text: autumn ? text : groundedLine(state, person, topic, stage * 2 + i, text), key: `talk:${person}:${topic}:${autumn ? 'autumn' : stage}:${i}` }));
    if (!autumn) entries.push(...D.topicExtra[person][topic].map((text,i)=>({text,key:`extra:${person}:${topic}:${i}`})));
    const recent = state.dialogue?.recent || {};
    const within = date => date && date <= state.date && W.addDays(date,7) >= state.date;
    const kinds=[];
    if (state.social.album.some(a=>a.person===person && within(a.date))) kinds.push('date');
    if (state.social.gifts.some(g=>g.person===person && within(g.date))) kinds.push('gift');
    if (topic===1 && state.music?.songs.some(song=>within(song.heard?.[person]))) kinds.push('song');
    if (topic===1 && W.broadcasts.some(ep=>state.radio.listened.includes(ep.id) && within(ep.date))) kinds.push('radio');
    const contextual=kinds.flatMap(kind=>D.recentLines[person][kind].map((text,i)=>({text,key:`recent:${person}:${kind}:${i}`})))
      .filter(entry=>!recent[entry.key] || W.addDays(recent[entry.key],14)<=state.date);
    entries.push(...contextual);
    const available = entries.filter(entry => !recent[entry.key] || W.addDays(recent[entry.key], 14) <= state.date);
    return [...(available.length ? available : entries)].sort((a, b) => (recent[a.key] || '').localeCompare(recent[b.key] || ''))[0];
  };
  D.commit = (state, key) => { if (key) { state.dialogue ||= D.initial(); state.dialogue.recent[key] = state.date; } };
  const greeting = D.greeting;
  D.greeting = (state, person, place) => {
    const key = `${state.date}:${state.slot}:${person}:${place}`;
    if (state.greetingCache?.[key]) return state.greetingCache[key];
    if (state.social.witnessGreeting[person]) {
      const line = root.AquaSocial.greeting(state, person);
      state.greetingCache ||= {}; state.greetingCache[key] = line;
      return line;
    }
    return greeting(state, person, place);
  };
})(typeof window !== 'undefined' ? window : globalThis);
