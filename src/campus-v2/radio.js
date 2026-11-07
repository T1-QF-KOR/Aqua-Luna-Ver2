/* Broadcasts, submitted letters, and what the player actually heard are separate records. */
(function (root) {
  'use strict';
  const W = root.AquaWorld;
  const topics = ['오늘 있었던 일', '고민', '신경 쓰이는 사람', '루나에게 묻기'];
  const openings = [
    '이 방송은 얼굴 없는 사람이 얼굴 모르는 사람들한테 하는 이야기예요.',
    '처음 도착한 사연은 봉투도 우표도 없었어요. 그래도 손에 쥐는 기분은 똑같더라고요.',
    '작년에 매주 사연 보내 주시던 피크 님, 기억하시는 분? 그분 요즘 잘 지내신대요. …제가 어떻게 아냐고요? 그냥요.',
    '시험 범위는 정해져 있는데, 걱정에는 범위가 없죠. 오늘은 딱 이 방송만큼만 쉬어요.',
    '달력 한 장을 넘길 때마다, 아무것도 안 한 것 같은 날부터 생각나요. 그래도 오늘 여기까지 왔네요.',
    '같은 길을 조금 느리게 걸었더니 처음 보는 창문이 있었어요. 오늘은 늦어도 괜찮은 밤이에요.',
    '오늘은 물 냄새가 그립다는 사연이 왔어요. 저는 읽기 전에 잠깐 창문을 열었어요.',
    '어제 축제 다녀오신 분들, 목 괜찮으세요? 저는 좀… 아, 아니에요.',
    '비 오는 날에는 이어폰 소리를 조금 낮춰 보세요. 길에도 반주가 있거든요.',
    '안부를 묻는 말은 짧은데, 보내기까지는 오래 걸려요. 오늘 못 보낸 말도 여기서는 읽어 드릴게요.',
    '오늘은 늘 다른 사람을 모으는 분의 사연이에요. 그분도 누가 먼저 불러 줬으면 하는 날이 있겠죠.',
    '다음 주부터는 방학이에요. 이 시간에 알림이 없어도, 여러분의 목요일은 계속되겠죠.',
    '여름은 잘 보내셨나요. 저는 선풍기 소리를 오래 들었어요.',
    '조금 늦게 끝나는 여름도 있어요. 달력에 없는 더위는 천천히 식혀요.',
    '남의 노래를 제일 잘 부른다는 말, 칭찬일까요. 오늘은 그 문장을 오래 생각했어요.',
    '다른 방에서, 다른 이불을 덮고 듣는 분도 계시겠죠. 오늘의 달은 여기서도 보여요.',
    '바람이 먼저 가을을 알아챘나 봐요. 창문 닫는 소리가 지난주보다 많아요.',
    '말이 안 나오는 날에는, 잠깐 음악에 맡겨도 되겠죠.',
    '오늘은 끝나고도 잠깐 천천히 걸어갈게요. 같이 듣는 분들도 조심히 돌아가세요.',
    '지난주에 놀라신 분들, 죄송해요. 오늘도 제자리에 앉았어요.',
    '이 목소리는 조금 먼저 도착한 목소리예요. 오늘 방송은 녹음으로 보내 드려요.',
    '추워졌네요. 주머니에 넣은 손으로는 휴대폰을 볼 수 없어서, 오히려 하늘을 더 봤어요.',
    '큰 시험을 앞둔 분들께. 결과가 나오기 전에도, 오늘의 수고는 이미 한 일이에요.',
    '오늘 하루 종일 남의 노래를 불렀어요. 그래서 지금은, 제 말을 하고 싶어요.',
    '오늘 첫눈 보셨어요? 기다린 사람과 우연히 본 사람은 같은 눈을 다르게 기억하겠죠.',
    '남은 달력을 세다가, 지나간 날에 적어 둔 메모를 읽었어요. 사소해서 다행인 날도 많았네요.',
    '다음 다음 주에는 성탄 특집으로 만나요. 오늘은 아직 평범한 목요일을 같이 보내요.',
    '기말고사가 끝나 가네요. 빈 교실보다, 할 일을 다 적은 노트가 더 낯설어요.',
    '메리 크리스마스. 오늘 혼자 계신 분, 손 들어 보세요. …저도요. 부스에 혼자예요.',
    '오늘은 이번 시즌 마지막 방송이에요. 얼굴 모르는 분들의 하루 덕분에 제 하루도 끝낼 수 있었어요.'
  ];
  const closings = {
    3: '피크 님, 보고 있으면 사연 하나 보내요. 아, 아니다.',
    8: '꽃은 예쁜데 시드는 걸 보는 게 싫어요. 그러니까 오늘은 빨리 끝낼게요.',
    12: '방학에는 쉬어 가요. 9월 첫 목요일, 이 시간에 다시 만나요.',
    24: '대본이 없으니까 클로징도 없어요. …오늘은 그냥 끝내요.',
    29: '내일은 공휴일이니까, 늦잠 자도 돼요.',
    30: '어느 쪽이든, 오늘은 그냥 끝내요.'
  };

  function ensure(state) {
    state.radio ||= { listened: [], aired: {}, clues: {}, anonymous: 0, honestCount: 0, hiatusUntil: null };
    return state.radio;
  }
  function isHiatus(state, episode) {
    return !episode.protected && !!ensure(state).hiatusUntil && episode.date <= state.radio.hiatusUntil;
  }
  function letterReason(state) {
    if (state.slot !== 3) return '사연은 내 방에서 밤에 쓸 수 있어요.';
    if (!W.inTerm(state.date) && !(state.date >= '2027-02-22' && state.date <= '2027-02-24')) return '방학 중에는 사연함도 잠시 쉬어요.';
    if (![1, 2, 3].includes(W.weekday(state.date))) return '사연함은 월요일부터 수요일 밤에 열려요.';
    const episode = W.thisWeeksEpisode(state.date);
    if (!episode) return state.date < '2026-04-02' ? '정규 사연함은 첫 방송 주인 3월 30일에 열려요. 초안은 미리 써 둘 수 있어요.' : '이번 주에는 방송이 없어요. 초안은 보관할 수 있어요.';
    if (isHiatus(state, episode)) return '이번 주는 재방송이라 새 사연을 받지 않아요.';
    if (state.letters.some(l => l.week === W.weekKey(state.date))) return '이번 주 사연은 이미 보냈어요.';
    return '';
  }
  function draftFor(state, topic, tone) {
    const target = topic === '신경 쓰이는 사람' ? [...state.met].sort((a, b) => state.bond[b] - state.bond[a])[0] || null : null;
    const honest = {
      '오늘 있었던 일': state.melodies.length ? '오늘도 멜로디를 하나 적었어요. 가사는 없고, 끝은 아직 질문 같아요. 그래도 지우지는 않았어요.' : '서울에 온 뒤로 괜찮다는 말을 자주 해요. 오늘은 정말 괜찮았던 순간 하나를 기억해 보려고요.',
      '고민': '하고 싶은 말이 있는데, 말하면 지금 사이가 달라질까 봐 자꾸 지워요. 말을 안 해도 조금씩 달라지는데요.',
      '신경 쓰이는 사람': target === 'daeun' ? '같은 과에 단톡방 공지를 맨날 올리는 애가 있는데요. 걔가 요즘 신경 쓰여요. 내가 먼저 답장하면 조금 덜 기다릴까요.' : target === 'seojin' ? '카페에서 같이 일하는 사람이 있어요. 눈치가 빨라서 내 생각은 금방 들켜요. 그 사람은 늘 여유 있어 보이는데, 어떤 얘기 앞에선 말을 고르더라고요. 그때 나도 잘 듣고 싶어요.' : target === 'nari' ? '무대 위에서는 아주 멀어 보이는 사람이 있어요. 무대에서 내려오면 작은 목소리로 말해요. 그 말을 놓치고 싶지 않아요.' : '아직 누구라고 부를 수는 없지만, 누군가를 기다리는 마음이 어떤 건지 조금 궁금해졌어요.',
      '루나에게 묻기': '루나는 말하고 나서 후회한 적 없어요? 저는 썼다 지운 말이 더 많아요. 지우지 않은 말은 어디에 두면 좋을까요.'
    };
    const plain = {
      '오늘 있었던 일': '오늘도 학교에 다녀왔어요. 별일 없는 하루였지만 방송을 기다리고 있어요.',
      '고민': '요즘 생각이 많네요. 틀어 주시는 음악 들으면서 조금 쉬고 싶어요.',
      '신경 쓰이는 사람': '요즘 조금 신경 쓰이는 사람이 생겼어요. 서로 잘 지냈으면 좋겠어요.',
      '루나에게 묻기': '오늘은 어떤 음악을 듣고 계신가요? 추천해 주세요.'
    };
    return { topic, tone, target, text: (tone === 'honest' ? honest : plain)[topic] || plain['오늘 있었던 일'] };
  }
  function send(state, draft) {
    const reason = letterReason(state);
    if (reason) return { ok: false, reason };
    if (!draft || !topics.includes(draft.topic) || !['honest', 'plain'].includes(draft.tone)) return { ok: false, reason: '사연의 주제와 문장을 다시 골라 주세요.' };
    const radio = ensure(state), letter = {
      ...draft, id: `letter-${W.weekKey(state.date)}`, date: state.date, week: W.weekKey(state.date),
      alias: state.nickname, read: false, heard: false, readAt: null, heardAt: null
    };
    state.letters.push(letter);
    radio.anonymous = W.clamp(radio.anonymous + (draft.tone === 'honest' ? 4 : 2));
    if (draft.tone === 'honest') radio.honestCount++;
    state.letterDraft = null;
    return { ok: true, letter };
  }
  function air(state, date = state.date) {
    const episode = W.episodeOn(date);
    if (!episode) return null;
    const radio = ensure(state);
    if (radio.aired[episode.id]) return radio.aired[episode.id];
    const record = { date, rerun: isHiatus(state, episode), letterIds: [] };
    if (episode.number === 29 && root.AquaHolidays) record.christmas = root.AquaHolidays.broadcastContext(state);
    if (episode.number === 30) record.finale = {
      ownSong: !!state.flags.nariWinterOwnSong,
      heardMelody: !!state.flags.nariHeardMelody,
      christmasHeard: radio.listened.includes('radio-2026-12-24'),
      sentBefore: state.letters.some(letter => letter.date < episode.date && W.weekKey(letter.date) !== W.weekKey(episode.date))
    };
    if (!record.rerun && state.social?.nariRadioPending) {
      record.jealousy = { ...state.social.nariRadioPending };
      state.social.nariRadioPending = null;
    }
    if (!record.rerun) for (const letter of state.letters.filter(l => l.week === W.weekKey(date) && !l.read)) {
      letter.read = true;
      letter.readAt = date;
      record.letterIds.push(letter.id);
      if (letter.target && letter.target !== 'nari' && letter.topic === '신경 쓰이는 사람') {
        state.bond.nari = W.clamp(state.bond.nari - 1);
        radio.anonymous = W.clamp(radio.anonymous + 2);
      }
    }
    radio.aired[episode.id] = record;
    return record;
  }
  const lunar = text => ({ speaker: '루나', text, onAir: true, expr:'neutral' });
  function lastBroadcast(state, episode, record, effects, replay) {
    // The story heard on replay is based on the broadcast-time snapshot, not future choices.
    const context = record.finale || {};
    const lines = [
      { text: replay ? '보관해 둔 시즌 마지막 방송을 다시 틀었다.' : '목요일 밤 열한 시. 시즌 마지막 방송의 시작을 기다렸다.' },
      lunar('안녕하세요, 아쿠아 루나의 루나예요. 오늘 하루, 잘 끝내고 계신가요.'),
      lunar('이 인사를 처음 읽던 날에는 종이를 양손으로 잡고 있었어요. 종이 떨리는 소리가 마이크에 들어갈까 봐요.'),
      lunar('얼굴 모르는 분들의 하루를 읽다 보니, 제 하루도 조금씩 말하게 됐어요.')
    ];
    if (context.christmasHeard) lines.push(lunar('성탄절에는 노래도 불렀죠. 방송이 끝난 다음에도 그 밤을 오래 생각했어요.'));
    if (context.ownSong) lines.push(lunar('다 쓰지 못한 노래를 들려준 적이 있어요. 끝까지 듣고 기다려 준 사람이 있었어요.'));
    else lines.push(lunar('다 고르지 못한 문장이 아직 많아요. 오늘 다 끝내지 못해도 괜찮다고 말해 보고 싶었어요.'));
    if (context.heardMelody) lines.push(lunar('누군가 들려준 여덟 마디도 기억해요. 마지막이 질문처럼 남는 곡이었어요.'));
    for (const id of record.letterIds || []) {
      const letter = state.letters.find(item => item.id === id);
      if (!letter) continue;
      lines.push(lunar(`${letter.alias} 님의 사연이에요.`),
        { ...lunar(letter.text), ...(effects ? { effect:{heardLetter:letter.id} } : {}) },
        lunar('마지막이라는 말이 부담스러웠을 텐데, 오늘 이야기를 보내 주셔서 고마워요. 잘 받았어요.'));
    }
    if (!(record.letterIds || []).length) lines.push(lunar(context.sentBefore ? '오늘은 사연을 기다리는 분도 계시겠죠. 전해 주신 지난 이야기들도 여기 남아 있어요.' : '오늘 이 시간에 말없이 듣는 분도 계시겠죠. 여기까지 함께해 주셔서 고마워요.'));
    lines.push(lunar('이 이름은 언젠가 다른 사람에게 건네질 거예요. 그다음에 제가 뭘 할지는, 지금 제 말로 정하는 중이에요.'),
      lunar('실패한 날에도 하루는 끝나요. 오늘은 그냥 끝내요.'),
      { text:'ON AIR 표시가 꺼졌다. 이어폰 너머의 침묵이 익숙한 방 안으로 천천히 돌아왔다.' });
    return {title:'아쿠아 루나 · 시즌 마지막 방송',background:'room',radioEpisode:episode.id,replay,lines};
  }
  function build(state, episode, replay = false) {
    const radio = ensure(state);
    const record = replay ? radio.aired[episode.id] || { rerun: false, letterIds: [] } : air(state, episode.date);
    const heardBefore = radio.listened.includes(episode.id), effects = !replay && !heardBefore;
    if (record.rerun) return { title: `아쿠아 루나 · 재방송`, background: 'room', radioEpisode: episode.id,
      rerun: true, lines: [{ text: '오늘은 새 방송 대신 지난 회차가 흘러나온다.' },
        lunar('잠깐 쉬어 가는 주에도, 여러분의 하루는 잘 끝났으면 좋겠어요.'),
        { text: '익숙한 클로징이었다. 새로운 사연과 새로운 단서는 없었다.' }] };
    if (episode.number === 24 && root.AquaWinter) return root.AquaWinter.recording(state, episode, replay);
    if (episode.number === 29 && root.AquaHolidays) return root.AquaHolidays.broadcast(state, episode, replay);
    if (episode.number === 30) return lastBroadcast(state, episode, record, effects, replay);
    let opening = openings[episode.number - 1];
    if (episode.number === 13 && state.seen.includes('nariSummer')) opening = '여름에 처음으로 무대 아닌 데서 노래했어요. 관객이 한 명이었는데, 그게 제일 떨렸어요.';
    const lines = [{ text: replay ? '보관해 둔 방송을 다시 틀었다.' : episode.number === 16 && state.flags.chuseokHome ? '고향의 옛 방. 열한 시에 이어폰을 꽂았다. 창밖에서 서울과 다른 생활 소리가 들렸다.' : '목요일 밤 열한 시. 이어폰을 꽂자 잔잔한 피아노가 흘렀다.' },
      lunar('안녕하세요, 아쿠아 루나의 루나예요. 오늘 하루, 잘 끝내고 계신가요.'), lunar(opening)];
    if (state.social?.nariDistanceWeek === W.weekKey(episode.date)) lines.push(lunar('요즘 연락 안 하는 사람 있으세요? 먼저 해 보세요. 저는 못 하지만.'));
    if (record.jealousy) lines.push(lunar(record.jealousy.witness ? '오늘은 같이 온 사람들이 눈에 띄더라고요. …저랑 상관없는 일인데요.' : '요즘 누가 누구랑 웃고 있는 걸 봤어요. 저랑 상관없는 일인데요.'));
    if (episode.number === 1) {
      lines.unshift({ speaker: '민재', text: '야! 학교 라디오 첫 방송 한다! 올해 루나 바뀌었나 봐. 한여울숲 지금 난리야.' });
      lines.push({ text: state.flags.heardLastSeason ? '3월 첫날의 목소리와 달랐다. 낮고 단단한 목소리 대신, 조금 더 맑고 먼 목소리였다.' : '낯선 목소리였다. 그런데 어디선가 들은 것 같았다.' });
      if (state.flags.riverClue) lines.push({ text: '강변에서 들은 혼잣말이 잠깐 떠올랐다. — 아니다. 그 사람은 노래하는 사람이었다.' });
      lines.push(lunar('사연은 언제든 보내 주세요. 이름 대신 별명으로. 저도 이름 대신 루나니까요.'));
      lines.push(lunar('아, 그리고. 저 노래는 안 해요. 틀기만 해요. 기대하지 마세요.'));
    }
    for (const id of record.letterIds) {
      const letter = state.letters.find(l => l.id === id);
      if (!letter) continue;
      lines.push(lunar(`${letter.alias} 님이 보내 주셨어요.`));
      lines.push({ ...lunar(letter.text), ...(effects ? { effect: { heardLetter: letter.id } } : {}) });
      lines.push(lunar(letter.target === 'daeun' ? '…좋네요. 공지 올리는 사람한테 답장, 꼭 해 주세요.' : letter.target === 'seojin' ? '…누군가의 취향을 기억해 주는 일. 그 사람도 알면 좋겠네요.' : letter.topic === '고민' ? '바뀌는 사이가 전부 멀어지는 사이는 아닐 거예요. 보내고 싶은 말 하나는 남겨 두세요.' : '오늘의 이야기를 여기까지 보내 주셔서 고마워요. 제가 잘 받았어요.'));
    }
    if (episode.number === 7) {
      lines.push(lunar('5번 레인 님의 사연이에요. 제가 다니던 수영장이 주차장이 됐대요. 마감 때 듣는 플레이리스트 이름을 수심 3m로 지었어요. 물 냄새가 그리운 건 이상한 걸까요.'));
      lines.push(lunar('이상하지 않아요. 그리운 게 있다는 건, 아직 거기 가고 싶다는 뜻이래요.'));
      if (state.seen.includes('seojinPlaylist')) lines.push({ text: '수심 3m. 카페 마감 뒤에 받은 링크의 이름이었다. 하지만 사연은 익명으로 보낸 말이었다.', ...(effects ? { effect: { flag: 'recognizedSeojinLetter' } } : {}) });
    }
    if (episode.number === 11) {
      lines.push(lunar('공지 담당 님이 보내 주셨어요. 공지를 올리면 안 읽은 사람 숫자부터 봐요. 그 숫자가 0이 되는 걸 한 번도 못 봤어요. 그래도 내일 또 올릴 거예요.'));
      lines.push(lunar('0이 안 돼도 괜찮아요. 오늘 이 사연은 제가 읽었어요. 그러니까 1은 줄었어요.'));
      if (state.met.includes('daeun') && state.bond.daeun >= 15) lines.push({ text: '엎었다 뒤집는 휴대폰과 단톡방이 떠올랐다. 알아챘다고 해서 내 말이 되는 것은 아니었다.', ...(effects ? { effect: { flag: 'recognizedDaeunLetter' } } : {}) });
    }
    if (episode.number === 18 && state.flags.nariHeardMelody) lines.push({ ...lunar('♪ …아. 마이크 켜져 있었네요.'), ...(effects ? { effect: { clue: 'myMelody' } } : {}) },
      { text: '내가 만든 멜로디였다. 세상에 나 혼자 알던, 가사 없는 여덟 마디가 라디오에서 흘러나왔다.' });
    if(episode.number <= 28) {
      const addition=root.AquaRadioEpisodes.episodes[episode.number-1];
      const count=episode.number===1?1:[7,11].includes(episode.number)?2:4;
      lines.push(...addition.slice(0,count).map(lunar));
    }
    const clue = episode.number === 1 && state.flags.heardLastSeason ? 'changedVoice' :
      episode.number === 3 && state.flags.knowsPick ? 'pickListener' :
      episode.number === 8 && state.flags.festivalNari ? 'fadingFlowers' :
      episode.number === 13 && state.seen.includes('nariSummer') ? 'oneAudience' :
      episode.number === 21 && state.seen.includes('autumnFestival') ? 'festivalHoarseVoice' : null;
    if (clue) lines.push({ text: clue === 'changedVoice' ? '목소리가 바뀌어도 마지막 말은 같았다. 루나는 한 사람의 이름이 아닐지도 모른다.' : '방송 속 문장이 귀에 남았다.', ...(effects ? { effect: { clue } } : {}) });
    lines.push(lunar(closings[episode.number] || '오늘은 그냥 끝내요. 실패한 날에도, 하루는 끝나니까.'));
    if (episode.number === 1 && effects) lines.push({ choice: [
      { label: '이어폰을 빼지 않고 끝까지 듣는다', effect: { anonymous: 1, card: '첫 방송의 목소리' }, lines: [{ text: '방송이 끝나고도 한참, 그 마지막 말이 귀에 남았다.' }] },
      { label: '민재 방에 가서 같이 듣는다', effect: { card: '첫 방송의 목소리' }, lines: [{ speaker: '민재', text: '내가 3년 들었는데 이건 확실해. 올해 루나는 신입이다. 그리고 음치다. 내 촉이 그래.' }, { text: '민재의 촉은 대체로 틀렸다. 이번엔 어떨지 몰랐다.' }] }
    ] });
    else lines.push({ text: 'ON AIR 표시가 꺼졌다. 방 안에 다시 작은 생활 소리가 돌아왔다.' });
    return { title: `아쿠아 루나 · ${episode.special ? '특집' : `${episode.number}회`} · ${episode.title}`,
      background: 'room', radioEpisode: episode.id, replay, lines };
  }
  function finish(state, episodeId) {
    const radio = ensure(state), record = radio.aired[episodeId];
    if (record && !record.rerun && !radio.listened.includes(episodeId)) radio.listened.push(episodeId);
  }
  function markHeard(state, letterId) {
    const letter = state.letters.find(item => item.id === letterId);
    if (!letter || !letter.read || letter.heard) return false;
    letter.heard = true;
    letter.heardAt = state.date;
    return true;
  }
  function clueCount(state) { return Object.entries(ensure(state).clues).reduce((sum, [key, value]) => sum + (value ? key === 'myMelody' ? 3 : 1 : 0), 0); }
  root.AquaRadio = { topics, ensure, isHiatus, letterReason, draftFor, send, air, build, finish, markHeard, clueCount };
})(typeof window !== 'undefined' ? window : globalThis);
