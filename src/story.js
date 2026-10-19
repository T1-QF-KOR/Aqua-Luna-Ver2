/* Original Aqua Luna scenes. Events follow shared experiences, never real-world time. */
(() => {
  'use strict';
  const choice = (id, label, reply, effect = {}) => ({ id, label, reply, ...effect });
  const node = (text, choices) => ({ text, choices });
  // Line-by-line scenes: [who, text, cue]. who: '' narration · '수련' · '나' (spoken) · '속' (inner voice).
  // cue: { face, cam, bg, sfx }. `text` / `reply` stay plain strings for saves, the album and summaries.
  const plain = lines => lines.map(([who, text]) => who === '수련' ? `“${text}”` : who === '' ? text : '').filter(Boolean).join(' ');
  const scene = (lines, choices) => ({ text: plain(lines), lines, choices });
  const pick = (id, label, say, react, effect = {}) => ({ id, label, ...(say ? { say } : {}), react, reply: plain(react), ...effect });
  // A farewell per course; ids stay `open` / `promise` so saved choices remain valid.
  const farewell = (lines, openSay, promiseSay, promiseReact) => scene(lines, [
    pick('open', '서로 여유 있을 때 다시 이야기하기', openSay, [['수련', '좋아요. 빈 시간부터 같이 찾아요.', { face: 'smile' }]]),
    pick('promise', '다음 외출은 무료 부두 산책으로 약속하기', promiseSay, promiseReact, { promise: true })]);
  // A self-contained memory before DAY 01; it never awards relationship or economy points.
  const intro = [
    { time: '입학 전의 겨울', title: '접어 둔 악보', expression: 'thoughtful', lines: [
      ['', '예고에서 성악을 공부하던 수련은, 집안 형편이 어려워지면서 클래식 진학을 접었습니다.'],
      ['', '대신 소리와 영상, 이야기를 만드는 학과에 지원해 합격했습니다. 악보는 버리지 못하고 책장 한쪽에 꽂아 두었습니다.'],
      ['수련', '일단 가보자. 좋아하는 건, 더 찾아봐도 되니까.'] ] },
    { time: '1학년 · 첫 전공 수업', title: '빈자리인가요?', expression: 'neutral', lines: [
      ['', '강의실을 잘못 찾아 늦게 들어온 당신에게, 창가 쪽 학생이 옆 의자의 가방을 치워 주었습니다.'],
      ['플레이어', '여기 앉아도 돼요?'], ['수련', '네. 강의계획서, 같이 봐요.'],
      ['', '같은 전공, 같은 학년. 두 사람이 처음 나눈 것은 이름보다 한 장의 종이였습니다.'] ] },
    { time: '첫 조별 과제', title: '같은 소리를 듣는 사람', expression: 'smile', lines: [
      ['', '첫 과제는 짝을 지어 학교의 하루를 소리로 기록하는 일이었습니다. 당신은 옆자리의 수련에게 같이 하자고 했습니다.'],
      ['수련', '조금만 더 들어봐요. 바람 들어오는 소리도 있어요.'],
      ['', '수련이 듣던 소리가 뒤늦게 당신 귀에도 들어왔습니다. 발표 전날에는 수련이 떨리는 당신의 첫 문장을 끝까지 들어 주었습니다.'],
      ['', '혼자라면 미뤘을 일을, 둘은 함께 조금씩 끝내고 있었습니다.'] ] },
    { time: '함께 보낸 첫 학년', title: '친구가 되는 동안', expression: 'shy', lines: [
      ['', '과제가 끝난 날, 수련이 먼저 점심을 먹자고 했습니다. 그 뒤로 점심 약속은 과제가 없어도 이어졌습니다.'],
      ['', '수련이 성악을 공부했다는 것도 그때 알았습니다. 언젠가 듣고 싶다는 말에, 수련은 아직은 부끄럽다며 웃었습니다.'],
      ['수련', '다음 학기에도 시간표 같이 볼래요?'],
      ['', '같은 전공이라 만났지만, 이제는 만나고 싶어서 시간을 맞추는 사이. 그렇게 두 사람은 친구가 되었습니다.'] ] },
    { time: '현재 · 다시 찾아온 봄', title: '오늘도, 옆자리', expression: 'smile', lines: [
      ['', '새 학기. 수련은 수업이 끝나면 틈틈이 동네 연습실을 빌립니다. 노래를 앞으로 어떻게 할지는 아직 정하지 못했습니다.'],
      ['수련 · 메시지', '수업 끝나고 연습실 들를 거예요. 시간 괜찮으면 와요.'],
      ['플레이어 · 메시지', '끝날 때쯤 갈게요. 같이 걸어요.'],
      ['', '수련이 버츄얼 아이돌 연습생이 되기 전. 수련과 당신의 새로운 일상이 시작됩니다.'] ] }
  ];
  const dates = {
    walk: [
      scene([
        ['', '해가 강 건너 빌딩 사이로 천천히 내려앉습니다.', { cam: 'wide', sfx: 'wind' }],
        ['수련', '바람 좋다….', { face: 'smile' }],
        ['', '흐트러진 머리카락을 손끝으로 넘기다가, 눈이 마주칩니다.', { cam: 'lean' }],
        ['수련', '…방금 거, 못 본 걸로 해 줘요.', { face: 'shy' }],
        ['속', '못 본 척하기엔, 조금 늦었다.'],
        ['수련', '오늘은 멀리 가지 않아도 괜찮아요. 어디부터 걸을까요?', { face: 'smile', cam: 'back' }]
      ], [
        pick('quiet', '물가에서 잠깐 쉬었다 걷기', '저기 벤치에 잠깐 앉았다 가요.', [['수련', '…좋아요.', { face: 'surprised' }], ['수련', '말을 쉬어도 어색하지 않은 시간, 필요했어요.', { face: 'smile' }]], { preference: 'quiet' }),
        pick('share', '서로의 하루를 나누며 걷기', '오늘 좋았던 거, 하나씩 말하면서 걸어요.', [['수련', '그럼 오늘 좋았던 일 하나씩만 말해요.', { face: 'playful' }], ['수련', '저는… 지금 이 바람이요.', { face: 'smile', cam: 'lean' }]], { preference: 'share', affection: 1 })]),
      scene([
        ['', '난간 앞에서 수련이 걸음을 멈춥니다.', { cam: 'wide' }],
        ['수련', '연습할 때는요, 한 소절을 몇 번씩 되돌아가요.', { face: 'thoughtful' }],
        ['수련', '근데 밖에서는… 그냥 앞으로 걸으면 되니까. 그게 좋아요.', { face: 'neutral', cam: 'close' }],
        ['속', '난간 위의 손이, 잠깐 망설이는 것처럼 보였다.']
      ], [
        pick('listen', '오늘은 돌아가지 않아도 된다고 말하기', '오늘은 되돌아가지 않아도 돼요.', [['수련', '…네.', { face: 'surprised' }], ['수련', '오늘만큼은, 틀린 길 같은 건 없었으면 해요.', { face: 'smile' }]]),
        pick('ask', '내가 옆에서 해 줄 수 있는 일을 묻기', '내가 옆에서 해 줄 수 있는 게 있을까요?', [['수련', '답을 찾아 주지 않아도 돼요.', { face: 'thoughtful' }], ['수련', '…조금만, 같이 걸어 주세요.', { face: 'shy', cam: 'lean' }]], { trust: 1 }),
        pick('steady', '다리 끝까지 걸음을 맞춰 함께 걷기', '저기 다리 끝까지, 같이 걸어 볼래요?', [['수련', '…좋아요. 이상하다, 오늘은 숨이 안 차네요.', { face: 'surprised' }], ['', '다리 끝에 서자 강바람이 한꺼번에 불어옵니다.', { cam: 'wide', sfx: 'wind' }], ['수련', '여기까지 온 건 처음이에요. 같이 와서 다행이다.', { face: 'smile', cam: 'lean' }]], { requireStat: 'fitness', requireValue: 10, affection: 2, trust: 1, mood: 5 })]),
      farewell([
        ['', '가로등이 하나둘 켜집니다. 돌아가는 길은 올 때보다 조금 느립니다.', { bg: 'moonlit-pier', cam: 'wide' }],
        ['수련', '벌써 여기까지 왔네요.', { face: 'neutral' }],
        ['수련', '다음에는… 어떻게 만날까요?', { face: 'shy', cam: 'lean' }]
      ], '여유 있을 때 다시 이야기해요.', '다음에도 이 부두에서 걸어요.', [['수련', '기억할게요.', { face: 'surprised' }], ['수련', '다음번엔 제가 먼저 물가 쪽으로 걸어갈게요.', { face: 'playful' }]])
    ],
    cafe: [
      scene([
        ['', '문을 열자 원두 향이 먼저 마중 나옵니다. 창가엔 햇빛이, 안쪽 자리엔 낮은 음악이 머뭅니다.', { cam: 'wide', sfx: 'bell' }],
        ['수련', '메뉴판이… 생각보다 길다.', { face: 'surprised' }],
        ['수련', '오늘은 어디가 좋으세요?', { face: 'smile' }],
        ['속', '고르는 척하면서, 수련이 창가를 한 번 먼저 보는 걸 봤다.']
      ], [
        pick('quiet', '안쪽에 앉아 잠시 숨 돌리기', '안쪽 자리 어때요? 조용할 것 같아요.', [['수련', '여긴 잔 내려놓는 소리도 작네요.', { face: 'neutral' }], ['수련', '…마음이 조금 놓여요.', { face: 'smile' }]], { preference: 'quiet' }),
        pick('share', '창가에서 오늘의 작은 일을 이야기하기', '창가로 가요. 오늘 있었던 얘기도 해 주고요.', [['수련', '그럼 저도 하나 말할게요.', { face: 'playful' }], ['수련', '오늘 연습에서, 처음으로 마음에 든 부분이 있었어요.', { face: 'shy', cam: 'lean' }]], { preference: 'share', affection: 1 })]),
      scene([
        ['', '잔을 천천히 돌리던 수련이 고개를 듭니다.'],
        ['수련', '좋아하는 일을 계속하면… 늘 행복해야 하는 걸까요?', { face: 'thoughtful', cam: 'close' }],
        ['', '음악은 계속되지만, 수련은 대답을 서두르지 않습니다.', { cam: 'blur' }],
        ['속', '쉽게 대답하면 안 되는 질문 같았다.']
      ], [
        pick('listen', '좋아해도 힘든 날은 있다고 말하기', '좋아해도, 힘든 날은 있는 거잖아요.', [['수련', '…그 말을 듣고 싶었나 봐요.', { face: 'surprised' }], ['수련', '오늘이 힘들었다고, 전부 싫어진 건 아니니까요.', { face: 'smile' }]]),
        pick('share', '나도 버거웠던 하루를 솔직히 나누기', '사실 저도 요즘 좀 버거웠어요.', [['수련', '잘해 보이고 싶어서 말을 아꼈는데…', { face: 'worried' }], ['수련', '저만 그런 건 아니었네요.', { face: 'smile', cam: 'lean' }]], { affection: 1 }),
        pick('insight', '좋아해서 더 힘든 마음을 짚어 주기', '좋아하니까 더 잘하고 싶어서, 그래서 더 힘든 거 아닐까요?', [['수련', '…….', { face: 'surprised', cam: 'close' }], ['수련', '맞아요. 그 말, 제가 하고 싶었던 말이에요.', { face: 'shy' }], ['속', '잔을 감싼 손이 조금 풀어졌다.']], { requireStat: 'sensitivity', requireValue: 10, affection: 2, trust: 1, mood: 5 })]),
      farewell([
        ['', '가게를 나서자 바깥 공기가 조금 서늘합니다.', { cam: 'wide' }],
        ['수련', '커피 식는 줄도 몰랐네요.', { face: 'playful' }],
        ['수련', '다음에는… 어떻게 만날까요?', { face: 'shy', cam: 'lean' }]
      ], '여유 있을 때 또 와요.', '다음엔 부두 쪽으로 걸어요. 돈 안 드는 데로요.', [['수련', '기억할게요.', { face: 'smile' }], ['수련', '다음번엔 제가 먼저 물가 쪽으로 걸어갈게요.', { face: 'playful' }]])
    ],
    concert: [
      scene([
        ['', '공연장 문이 열리고, 조율하는 현 소리가 낮게 깔립니다.', { cam: 'wide' }],
        ['수련', '첼로 소리는 사람이 숨 쉬는 것 같아서 좋아요.', { face: 'smile' }],
        ['', '수련이 표를 반으로 접어 손에 꼭 쥡니다.'],
        ['수련', '오늘은 끝까지 들어 보고 싶어요.', { face: 'thoughtful', cam: 'lean' }]
      ], [
        pick('quiet', '감상을 서두르지 않고 함께 듣기', '그럼 끝나고 천천히 이야기해요.', [['수련', '끝나고 아무 말도 떠오르지 않아도 괜찮아요.', { face: 'neutral' }], ['수련', '같이 들었다는 건 남으니까요.', { face: 'smile' }]], { preference: 'quiet' }),
        pick('share', '끝나고 기억에 남은 한 소절을 나누자고 하기', '끝나면 제일 좋았던 한 소절, 서로 말해 줘요.', [['수련', '좋아요. 같은 곳일지, 다른 곳일지….', { face: 'playful' }], ['수련', '벌써 궁금하네요.', { face: 'smile' }]], { preference: 'share', affection: 1 })]),
      scene([
        ['', '박수가 잦아들어도, 수련은 한동안 자리에서 일어나지 않습니다.', { cam: 'close' }],
        ['수련', '마지막 음이 끝나는 걸 기다리는 사람도… 무대의 일부 같아요.', { face: 'thoughtful' }],
        ['속', '무대를 보는 눈이, 조금 그리워 보였다.']
      ], [
        pick('listen', '수련이 일어날 때까지 옆에 있기', '', [['', '말없이 옆자리에 그대로 앉아 있습니다.', { cam: 'lean' }], ['수련', '…기다려 줘서 고마워요. 이제 나가도 될 것 같아요.', { face: 'smile' }]]),
        pick('ask', '언젠가 수련의 노래도 이렇게 듣고 싶다고 말하기', '언젠가 그 노래도, 이렇게 끝까지 듣고 싶어요.', [['수련', '멋지게 부르겠다는 약속은 못 해요.', { face: 'surprised' }], ['수련', '그래도… 듣고 싶은 사람이 있다는 건, 좋네요.', { face: 'shy', cam: 'close' }]], { trust: 1 }),
        pick('theory', '마지막 화음 이야기를 꺼내기', '마지막에 장조로 끝난 거, 일부러 그런 거겠죠?', [['수련', '알아들었어요? 저 그 부분에서 소름 돋았어요.', { face: 'surprised' }], ['수련', '슬픈 곡인데 마지막에 문을 열어 두는 느낌… 저도 그런 노래 부르고 싶어요.', { face: 'smile', cam: 'lean' }]], { requireStat: 'knowledge', requireValue: 16, affection: 2, trust: 1, mood: 5 })]),
      farewell([
        ['', '공연장 밖, 밤공기에 아직 첼로 소리가 남아 있는 것 같습니다.', { cam: 'wide' }],
        ['수련', '귀가 아직 멍해요. 좋은 쪽으로요.', { face: 'playful' }],
        ['수련', '다음에는… 어떻게 만날까요?', { face: 'shy', cam: 'lean' }]
      ], '또 좋은 공연 있으면 같이 와요.', '다음엔 부두를 걸어요. 오늘 들은 걸 얘기하면서요.', [['수련', '기억할게요.', { face: 'smile' }], ['수련', '다음번엔 제가 먼저 물가 쪽으로 걸어갈게요.', { face: 'playful' }]])
    ]
  };
  // Main chapters need a few days to breathe after the previous one, so the story follows the calendar.
  const mainChain = ['hello', 'space', 'invite', 'score', 'boundary', 'repair', 'session', 'confession', 'revisit', 'epilogue', 'casual'], storyGap = 5;
  const rested = s => { const last = s.story.completed.filter(e => mainChain.includes(e.id)).at(-1); return !last || s.day - last.day >= storyGap; };
  const events = [
    { id: 'hello', title: '친구가 기다리는 연습실', location: 'practice', hint: '연습실에서 기다리는 친구 수련을 만나 보세요.', ready: () => true, nodes: [
      scene([
        ['', '아직 수련이 어떤 엔터테인먼트에도 들어가지 않았던 시절.', { cam: 'wide' }],
        ['', '빌린 동네 연습실의 문이 반쯤 열려 있습니다. 피아노 소리가 멈췄다가, 다시 이어집니다.'],
        ['', '문틈으로 들여다보는 순간, 오랜 친구 수련과 눈이 마주칩니다.', { face: 'surprised', cam: 'lean' }],
        ['수련', '왔네요.', { face: 'smile' }],
        ['수련', '오늘도 같은 데서 막혔어요. 세 번째 마디요.', { face: 'playful' }],
        ['', '늘 두던 옆자리에, 종이컵 하나가 놓입니다.', { cam: 'back' }],
        ['속', '내 몫까지 사 둔 걸까. 아직 따뜻하다.']
      ], [
        pick('listen', '지금은 듣고 있어도 될까요?', '오늘은 옆에서 듣고 있어도 돼요?', [['수련', '네. 아직 중간에 자주 멈추는데…', { face: 'shy' }], ['수련', '괜찮으시면요.', { face: 'smile' }], ['', '빈 의자에 앉자, 반주가 다시 시작됩니다.', { cam: 'back' }]]),
        pick('plan', '연습 끝나고 같이 걸을 시간을 정할까요?', '끝나고 같이 걸어요. 몇 시쯤 끝나요?', [['수련', '좋아요. 끝나는 시간도 같이 적어요.', { face: 'smile' }], ['', '수련이 악보 옆의 개인 수첩과 펜을 내밉니다.']])]) ] },
    { id: 'space', title: '비어 있는 한 칸', location: 'rooftop', hint: '연습실에서 대화한 뒤 일하기 또는 휴식을 경험해 보세요.', ready: s => done(s, 'hello') && s.journal.some(j => ['work','rest'].includes(j.type)), nodes: [
      node('옥상에 나온 수련이 물병을 건넵니다. “일정표에 빈칸이 있길래요. 실수로 빼먹은 건 아니죠?” 그녀도 잠시 난간에 등을 기댑니다.', [
        choice('rest', '그 시간에는 아무것도 안 해도 되죠', '“그럼 오늘은 비워 둬요. 다음에 뭘 하고 싶은지 생각할 자리도 필요하니까요.”'),
        choice('walk', '시간이 맞으면 강가에 같이 가요', '“멀리 가지 않아도 좋겠어요. 여기서부터 걸어가는 길도 괜찮고요.”')]) ] },
    { id: 'invite', title: '두 번 적힌 약속', location: 'pier', hint: '연습실 대화와 첫 외출을 마치면 수련이 먼저 말을 걸어요.', ready: s => done(s, 'hello') && s.story.dateCount >= 1, nodes: [
      node('수련이 개인 수첩을 펼칩니다. 연습 메모 옆의 빈 여백에 작은 물결이 그려져 있습니다. “지난번처럼 걸을까요? 이번에는 제가 먼저 물어보고 싶었어요.”', [
        choice('yes', '다음 외출을 부두에서 함께하기', '“그럼 물가 쪽 길은 제가 안내할게요. 비용 들이는 약속은 아니에요.”', { promise: true }),
        choice('later', '지금은 여유가 없지만 다음에 다시 이야기하기', '“알려 줘서 고마워요. 가능한 날에 말해 주세요. 기다리는 숙제로 만들지는 않을게요.”')]) ] },
    { id: 'score', title: '접힌 악보', location: 'practice', hint: '며칠 뒤, 데이트 3회·신뢰 15를 쌓아 보세요.', ready: s => done(s, 'invite') && rested(s) && s.story.dateCount >= 3 && s.trust >= 15, nodes: [
      node('악보의 접힌 귀퉁이를 수련이 펴고 또 접습니다. “예고 성악과에 들어갔을 때는 이 길을 계속 갈 줄 알았어요. 집안 사정으로 클래식 진로를 접었는데, 이 악보를 펴면 그때의 저를 흉내 내야 할 것 같아요.” 아직 어느 엔터테인먼트에도 속하지 않은 수련이 오랜 친구 앞에 악보를 내려놓습니다.', [
        choice('listen', '지금 부르면 어떤 느낌일지 묻기', '“아직 모르겠어요. 그걸 모르는 채로 시작해도 괜찮을까요?”', { music: 'now' }),
        choice('new', '다른 곡을 고를 수도 있다고 말하기', '“버리는 게 아니라 고르는 거겠죠. 이번엔 제가 정해 보고 싶어요.”', { music: 'new' })]),
      node('수련이 악보를 가방 밖에 둡니다. “작은 세션을 열어 볼까 해요. 누구에게 증명하려는 건지부터 생각해 볼게요.”', [
        choice('wait', '곡을 정할 때까지 기다리기', '“정해지면 가장 먼저 들려드릴게요. 대신, 조금 오래 걸려도 괜찮아요?”'),
        choice('help', '필요한 준비가 생기면 알려 달라고 하기', '“의자 몇 개면 될 것 같아요. 큰 무대로 만들지 않아도 괜찮아요.”')]) ] },
    { id: 'boundary', title: '아직 정하지 않은 일', location: 'practice', hint: '접힌 악보 이야기에서 며칠 지나 데이트 6회·호감 20을 쌓아 보세요.', ready: s => done(s, 'score') && rested(s) && s.story.dateCount >= 6 && s.affection >= 20, nodes: [
      node('연락을 마친 수련이 휴대폰을 뒤집습니다. “예전 선생님이 세션 이야기를 들으셨어요. 반갑지만… 벌써 기대에 맞춰 부르고 있는 것 같아요.”', [
        choice('ask', '누구에게 들려주고 싶은지 먼저 묻기', '“지금의 제 노래를 듣고 싶은 사람에게요. 선생님께도 제가 직접 말씀드릴게요.”', { boundary: 'clear' }),
        choice('decide', '부담 없게 내가 대신 거절해 줄게요', '“도와주려는 건 알아요. 그래도 제 대답을 먼저 듣고 움직여 주셨으면 해요.” 수련은 악보를 닫지 않습니다. 다시 이야기할 여지는 남아 있습니다.', { boundary: 'repair' })]) ] },
    { id: 'repair', title: '대답을 기다리는 연습', location: 'rooftop', hint: '수련에게 결정권을 돌려주는 대화를 할 수 있어요.', ready: s => done(s, 'boundary') && s.story.boundary === 'repair', nodes: [
      node('수련은 옥상 문을 열어 둡니다. “멀어지고 싶어서 한 말은 아니었어요. 가까운 사람에게도 제가 고를 자리는 필요해서요.”', [
        choice('sorry', '먼저 정하려 해서 미안해요. 무엇을 원해요?', '“선생님께 제가 연락하고 싶어요. 옆에 있어 주는 건, 그 다음에 부탁할게요.”', { boundary: 'clear' }),
        choice('honest', '돕고 싶어 서둘렀어요. 다음엔 먼저 물을게요', '“그 말이면 돼요. 저도 필요한 걸 더 분명히 말해 볼게요.”', { boundary: 'clear' })]) ] },
    { id: 'session', title: '다시 부르는 이유', location: 'practice', hint: '서로의 결정권을 확인하고 며칠 지나 데이트 9회·신뢰 30을 쌓아 보세요.', ready: s => done(s, 'boundary') && s.story.boundary === 'clear' && rested(s) && s.story.dateCount >= 9 && s.trust >= 30, nodes: [
      node('연습실에는 의자 몇 개만 놓여 있습니다. 수련이 직접 고른 악보를 펼칩니다. “완벽해진 다음에 부르려고 했는데, 그러면 계속 미루게 될 것 같아요.”', [
        choice('listen', '관객석에서 끝까지 듣기', '마지막 숨이 끝난 뒤에야 손뼉을 칩니다. “기다려 주니까, 끝까지 제 노래처럼 부를 수 있었어요.”'),
        choice('support', '준비할 것이 있는지 묻고 자리에 앉기', '“물 한 잔이면 돼요. 이제는 듣는 사람이 되어 주세요.” 수련은 자기 손으로 반주를 시작합니다.')]),
      node('수련이 악보를 접지 않고 책상 위에 펼쳐 둡니다. “잘 불렀는지는 나중에 생각하려고요. 오늘은 제가 부르고 싶어서 불렀다는 걸 기억할래요.”', [
        choice('memory', '오늘의 순간을 함께 기억하자고 하기', '“그럼 제목은 제가 정할게요. 다시 부르는 이유. 오늘은 그 정도면 충분해요.”'),
        choice('joy', '마지막에 웃는 모습이 좋았다고 말하기', '“저, 웃었어요? 그건 계획에 없었는데.” 수련이 이번에는 숨기지 않고 웃습니다.')]) ] },
    { id: 'confession', title: '친구라는 말 다음에', location: 'pier', hint: '작은 세션 이후 며칠 지나 데이트 12회·호감 40·신뢰 40을 쌓아 보세요.', ready: s => done(s, 'session') && rested(s) && s.story.dateCount >= 12 && s.affection >= 40 && s.trust >= 40, nodes: [
      scene([
        ['', '강바람이 잦아든 저녁. 수련이 연습 수첩을 가방에 넣습니다.', { bg: 'pier-evening', cam: 'wide', sfx: 'wind' }],
        ['수련', '저, 할 말이 있어요.', { face: 'thoughtful' }],
        ['속', '목소리가 평소보다 조금 낮았다.'],
        ['수련', '친구니까 편한 거라고 생각했어요.', { face: 'neutral', cam: 'lean' }],
        ['수련', '그런데 헤어질 때마다… 조금 더 같이 있고 싶어요.', { face: 'shy' }],
        ['', '강가를 지나는 사람들의 발소리가 잠시 멀어집니다.', { cam: 'blur' }],
        ['수련', '익숙해서가 아니라… 당신이어서요.', { face: 'shy', cam: 'close', sfx: 'heart' }]
      ], [
        pick('romance', '나도 그래요. 연인으로 만나고 싶어요', '저도 그래요. 친구 말고… 연인으로 만나고 싶어요.', [['수련', '…정말요?', { face: 'surprised', cam: 'close' }], ['', '수련이 한참 강 쪽을 바라보다가, 천천히 웃습니다.', { face: 'shy' }], ['수련', '좋아요. 오래된 친구여도, 새로 물어볼 일은 많겠죠.', { face: 'smile', cam: 'lean' }], ['수련', '서로의 꿈을 대신 정하지 않고, 천천히 알아가요.', { face: 'shy' }]], { relationship: 'lovers' }),
        pick('friend', '소중한 친구로 곁에 있고 싶어요', '소중해서요. 친구로, 계속 곁에 있고 싶어요.', [['수련', '…그렇구나.', { face: 'worried' }], ['수련', '솔직하게 말해 줘서 고마워요.', { face: 'thoughtful' }], ['수련', '우리 시간이 덜 소중해지는 건 아니에요.', { face: 'smile', cam: 'back' }]], { relationship: 'friends' }),
        pick('later', '소중해서 조금 더 생각하고 싶어요', '소중해서, 조금만 더 생각해 보고 싶어요.', [['수련', '알겠어요.', { face: 'neutral' }], ['수련', '오늘 답을 해야 하는 건 아니에요. 조금 더 같이 지낸 뒤에, 다시 이야기해요.', { face: 'smile' }]], { relationship: 'considering' })]) ] },
    { id: 'revisit', title: '천천히 찾은 대답', location: 'pier', hint: '마음을 보류했다면 데이트를 두 번 더 한 뒤 다시 이야기할 수 있어요.', ready: s => s.story.relationship === 'considering' && s.story.dateCount >= s.story.considerAt + 2, nodes: [
      node('수련이 당신과 같은 속도로 걷습니다. “기다리면서 혼자 결론을 내리지는 않았어요. 지금은 어떤 마음인지 듣고 싶어요.”', [
        choice('romance', '연인으로 다음 하루를 함께하고 싶어요', '“저도요. 기다리는 동안 함께한 시간까지 우리 시작으로 기억해요.”', { relationship: 'lovers' }),
        choice('friend', '오래 함께할 친구가 되고 싶어요', '“좋아요. 답을 맞추려고 하지 않아 줘서 고마워요.”', { relationship: 'friends' })]) ] },
    { id: 'epilogue', title: '너와 나란한 하루', location: 'rooftop', hint: '관계를 정하고 며칠 지나 한 번 더 데이트하면 후일담이 열려요.', ready: s => ['lovers','friends'].includes(s.story.relationship) && rested(s) && s.story.dateCount > s.story.commitAt, nodes: [
      scene([
        ['', '옥상에 오후 햇살이 길게 눕습니다.', { cam: 'wide' }],
        ['', '수련이 새 일정표를 펼칩니다. 큰 계획보다, 둘이 비워 둔 한 칸이 먼저 눈에 들어옵니다.'],
        ['수련', '여기, 비워 뒀어요. 우리 칸.', { face: 'playful' }],
        ['수련', '다음번에는 제가 코스를 골라도 돼요? 늘 걷던 길에서, 조금만 돌아가 봐요.', { face: 'smile', cam: 'lean' }],
        ['속', '“우리 칸”이라는 말이, 생각보다 오래 남았다.']
      ], [
        pick('walk', '다음 산책을 함께 준비하기', '좋아요. 그 길, 같이 준비해요.', [['수련', '그럼 약속이에요. 특별한 날이 아니어도 같이 걸어요.', { face: 'smile' }], ['', '이야기는 한 장을 마쳤지만, 둘의 일상은 계속됩니다.', { cam: 'back' }]], { promise: true }),
        pick('quiet', '오늘은 여기서 조용히 함께 있기', '', [['', '대답 대신, 옆자리에 나란히 앉습니다.', { cam: 'lean' }], ['수련', '…네. 매번 새로운 걸 하지 않아도 좋네요.', { face: 'smile' }], ['', '나란히 앉은 두 사람의 그림자가 조금씩 길어집니다. 내일도 선택할 하루가 남아 있습니다.', { cam: 'back' }]])]) ] },
    { id: 'casual', title: '말 놓아도 돼요?', location: 'pier', hint: '연인이 된 뒤 후일담에서 며칠이 지나면 수련이 조심스럽게 물어 와요.', ready: s => s.story.relationship === 'lovers' && done(s, 'epilogue') && rested(s), nodes: [
      scene([
        ['', '부두 끝 벤치. 수련이 휴대폰 화면을 한참 내려다봅니다.', { bg: 'pier-evening', cam: 'wide' }],
        ['수련', '저기… 이상한 거 물어봐도 돼요?', { face: 'shy' }],
        ['수련', '우리, 처음 만난 날부터 계속 존댓말이잖아요.', { face: 'playful' }],
        ['수련', '친구일 땐 그게 편했는데요. 요즘은… 조금 멀게 들릴 때가 있어요.', { face: 'thoughtful', cam: 'lean' }],
        ['수련', '이제… 말 놓아도 돼요?', { face: 'shy', cam: 'close', sfx: 'heart' }],
        ['속', '고작 말투 하나인데, 심장이 이상하게 빨리 뛴다.']
      ], [
        pick('yes', '“응. 우리 말 놓자.”', '응. 우리 이제 말 놓자.', [['수련', '…응.', { face: 'surprised' }], ['수련', '이상하다. 한 글자 바꿨을 뿐인데, 되게 가까워진 것 같아.', { face: 'shy', cam: 'close' }], ['수련', '앞으로도 잘 부탁해.', { face: 'smile' }]], { speech: 'casual', affection: 2 }),
        pick('slow', '천천히 바꿔 가자고 말하기', '좋아요. 대신 천천히, 편해질 때마다 하나씩 바꿔 가요.', [['수련', '네. 그럼 오늘은… 한 번만 연습해 볼게요.', { face: 'playful' }], ['수련', '잘 자. …아, 아직 저녁이다.', { face: 'shy' }]])]) ] }
  ];
  // Optional growth stories enrich the route without blocking existing endings.
  [
    { id: 'growth-score', stat: 'knowledge', title: '악보 사이의 메모', location: 'practice', expression: 'thoughtful', text: '수련이 낡은 악보를 펼칩니다. “여기 적힌 말이 늘 어려웠어요. 오늘은 같이 읽어 볼래요?”', special: '공부한 배경을 설명하고 수련의 해석을 듣기', reply: '“설명을 듣고 나니 제가 부르고 싶은 느낌도 조금 선명해졌어요.”' },
    { id: 'growth-walk', stat: 'fitness', title: '같은 속도로 걷는 연습', location: 'pier', expression: 'smile', text: '강가의 계단을 내려오던 수련이 숨을 고릅니다. “조금 천천히 가도 되죠? 풍경도 보고 싶어요.”', special: '쉬어 갈 자리를 찾아 같은 속도로 걷기', reply: '“옆에서 속도를 맞춰 주니까, 더 오래 같이 걸을 수 있겠네요.”' },
    { id: 'growth-music', stat: 'sensitivity', title: '한 소절에 남은 마음', location: 'concert', expression: 'shy', text: '수련이 오늘 들은 선율을 작게 흥얼거립니다. “저는 마지막보다 중간에 멈춘 음이 자꾸 생각나요.”', special: '멈춘 음에서 느낀 여운을 나누기', reply: '“같은 부분을 기억하고 있었네요. 말하지 않아도 통할 때가 있나 봐요.”' }
  ].forEach(e => events.push({ ...e,
    hint: `${({knowledge:'지식',fitness:'체력',sensitivity:'감수성'})[e.stat]} 8 · 2일째부터`,
    ready: s => s.day >= 2 && (s.growth?.stats[e.stat] || 0) >= 8,
    nodes: [{ text: e.text, expression: e.expression, choices: [
      choice('listen', '수련의 이야기를 끝까지 듣기', '“답부터 찾지 않아도 되겠네요. 함께 들어 줘서 고마워요.”', { trust: 1, mood: 3 }),
      choice('understand', e.special, e.reply, { requireStat: e.stat, requireValue: 12, affection: 3, trust: 2, mood: 8 }),
      choice('rush', '시간이 없으니 다음에 이야기하자고 재촉하기', '“알겠어요. 오늘은 여기까지만 할게요.” 수련이 잠시 말을 아낍니다.', { mood: -8 })
    ] }]
  }));
  // Phone messages arrive the morning after; replying is optional and never penalised.
  // Each text has a polite form and, after the 말 놓기 scene, a casual form.
  const messages = {
    walk: { lines: [['오늘 바람, 좋았죠.', '오늘 바람 좋았지.'], ['다음에도 그 길로 걸어요.', '다음에도 그 길로 걷자.']], replies: [
      { id: 'a', label: '“좋았어요. 또 가요.”', say: ['좋았어요. 또 가요.', '좋았어. 또 가자.'], back: ['네. 이번엔 제가 먼저 연락할게요.', '응. 이번엔 내가 먼저 연락할게.'], trust: 1 },
      { id: 'b', label: '“잘 들어갔어요?”', say: ['잘 들어갔어요?', '잘 들어갔어?'], back: ['네, 무사히요. 물어봐 줘서 고마워요.', '응, 무사히. 물어봐 줘서 고마워.'] }] },
    cafe: { lines: [['커피 맛, 아직도 생각나요.', '커피 맛 아직도 생각나.'], ['창가 자리 또 비어 있으면 좋겠다.', '창가 자리 또 비어 있으면 좋겠다.']], replies: [
      { id: 'a', label: '“다음엔 제가 살게요.”', say: ['다음엔 제가 살게요.', '다음엔 내가 살게.'], back: ['그럼 저는 디저트요. 공평하게.', '그럼 난 디저트. 공평하게.'], trust: 1 },
      { id: 'b', label: '“이야기 들려줘서 고마웠어요.”', say: ['이야기 들려줘서 고마웠어요.', '얘기 들려줘서 고마웠어.'], back: ['저야말로요. 말하고 나니까 가벼워졌어요.', '나야말로. 말하고 나니까 가벼워졌어.'] }] },
    concert: { lines: [['아직도 마지막 음이 귀에 남아 있어요.', '아직도 마지막 음이 귀에 남아 있어.'], ['같이 들어서 다행이에요.', '같이 들어서 다행이야.']], replies: [
      { id: 'a', label: '“나도 아직 남아 있어요.”', say: ['저도 아직 남아 있어요.', '나도 아직 남아 있어.'], back: ['그럼 우리, 같은 소리를 기억하는 거네요.', '그럼 우리 같은 소리를 기억하는 거네.'], trust: 1 },
      { id: 'b', label: '“다음 공연도 찾아볼게요.”', say: ['다음 공연도 찾아볼게요.', '다음 공연도 찾아볼게.'], back: ['기대할게요. 이번엔 제가 표 접어 둘게요.', '기대할게. 이번엔 내가 표 접어 둘게.'] }] },
    course: { lines: [['어제 {place}, 계속 생각나요.', '어제 {place}, 계속 생각나.'], ['수첩에 한 줄 적어 뒀어요.', '수첩에 한 줄 적어 뒀어.']], replies: [
      { id: 'a', label: '“뭐라고 적었는지 궁금해요.”', say: ['뭐라고 적었는지 궁금해요.', '뭐라고 적었는지 궁금해.'], back: ['비밀이에요. 다음에 만나면 보여 줄게요.', '비밀. 다음에 만나면 보여 줄게.'], trust: 1 },
      { id: 'b', label: '“나도 좋았어요.”', say: ['저도 좋았어요.', '나도 좋았어.'], back: ['다행이다. 다음 곳도 같이 정해요.', '다행이다. 다음 곳도 같이 정하자.'] }] },
    // Theme courses: her text remembers what kind of outing it was.
    'course-river': { lines: [['어제 {place}에서 바람 맞은 게 아직 기분 좋아요.', '어제 {place}에서 바람 맞은 거 아직 기분 좋아.'], ['다리가 좀 뻐근한데, 이상하게 싫지 않네요.', '다리가 좀 뻐근한데 이상하게 싫지 않네.']], replies: [
      { id: 'a', label: '“다음엔 더 천천히 걸어요.”', say: ['저도요. 다음엔 더 천천히 걸어요.', '나도. 다음엔 더 천천히 걷자.'], back: ['좋아요. 쉬는 자리부터 정해 둘게요.', '좋아. 쉬는 자리부터 정해 둘게.'], trust: 1 },
      { id: 'b', label: '“스트레칭 꼭 해요.”', say: ['스트레칭 꼭 해요.', '스트레칭 꼭 해.'], back: ['네, 잔소리 접수했어요. 고마워요.', '응, 잔소리 접수. 고마워.'] }] },
    'course-culture': { lines: [['{place}에서 본 거, 자기 전에 계속 생각났어요.', '{place}에서 본 거, 자기 전에 계속 생각났어.'], ['당신이 한 말을 수첩에 옮겨 적었어요.', '네가 한 말 수첩에 옮겨 적었어.']], replies: [
      { id: 'a', label: '“무슨 말이었는지 알려 줘요.”', say: ['무슨 말이었는지 알려 줘요.', '무슨 말이었는지 알려 줘.'], back: ['다음에 만나면 직접 읽어 줄게요. 조금 부끄럽지만요.', '다음에 만나면 직접 읽어 줄게. 좀 부끄럽지만.'], trust: 1 },
      { id: 'b', label: '“수련 감상 듣는 게 좋았어요.”', say: ['저도 수련 감상 듣는 게 좋았어요.', '나도 네 감상 듣는 게 좋았어.'], back: ['정답이 아니어도 들어 줘서 편했어요.', '정답 아니어도 들어 줘서 편했어.'] }] },
    'course-taste': { lines: [['어제 {place}, 맛도 맛인데 같이 먹어서 좋았어요.', '어제 {place}, 맛도 맛인데 같이 먹어서 좋았어.'], ['오늘 점심은 혼자라 좀 심심하네요.', '오늘 점심은 혼자라 좀 심심하네.']], replies: [
      { id: 'a', label: '“다음엔 수련이 메뉴 골라요.”', say: ['다음엔 수련이 메뉴 골라요.', '다음엔 네가 메뉴 골라.'], back: ['진짜요? 벌써 후보가 세 개 있어요.', '진짜? 벌써 후보 세 개 있어.'], trust: 1 },
      { id: 'b', label: '“점심 잘 챙겨 먹어요.”', say: ['점심 잘 챙겨 먹어요.', '점심 잘 챙겨 먹어.'], back: ['네. 사진 보내 줄게요, 증거로요.', '응. 사진 보내 줄게, 증거로.'] }] },
    'course-craft': { lines: [['{place}에서 만든 거, 책상 위에 올려 뒀어요.', '{place}에서 만든 거 책상 위에 올려 뒀어.'], ['비뚤어진 부분이 제일 마음에 들어요.', '비뚤어진 부분이 제일 마음에 들어.']], replies: [
      { id: 'a', label: '“나도 잘 보이는 데 뒀어요.”', say: ['저도 제 거 잘 보이는 데 뒀어요.', '나도 내 거 잘 보이는 데 뒀어.'], back: ['그럼 우리 둘 다 매일 보겠네요.', '그럼 우리 둘 다 매일 보겠네.'], trust: 1 },
      { id: 'b', label: '“다음엔 뭐 만들어 볼까요?”', say: ['다음엔 뭐 만들어 볼까요?', '다음엔 뭐 만들어 볼까?'], back: ['생각해 둘게요. 이번엔 덜 어려운 걸로요.', '생각해 둘게. 이번엔 덜 어려운 걸로.'] }] },
    'course-music': { lines: [['어제 {place}에서 들은 소리, 아침에 흥얼거렸어요.', '어제 {place}에서 들은 소리 아침에 흥얼거렸어.'], ['음은 좀 틀렸지만요.', '음은 좀 틀렸지만.']], replies: [
      { id: 'a', label: '“다음에 직접 들려줘요.”', say: ['다음에 직접 들려줘요.', '다음에 직접 들려줘.'], back: ['…조금 연습하고요. 약속할게요.', '…조금 연습하고. 약속할게.'], trust: 1 },
      { id: 'b', label: '“나도 그 소리 기억나요.”', say: ['저도 그 소리 기억나요.', '나도 그 소리 기억나.'], back: ['같은 걸 기억하니까 좋네요.', '같은 걸 기억하니까 좋다.'] }] },
    'course-night': { lines: [['어제 {place}, 집에 와서도 한참 잠이 안 왔어요.', '어제 {place}, 집에 와서도 한참 잠이 안 왔어.'], ['좋은 쪽으로요. 잘 들어갔죠?', '좋은 쪽으로. 잘 들어갔지?']], replies: [
      { id: 'a', label: '“덕분에 잘 들어왔어요.”', say: ['덕분에 잘 들어왔어요.', '덕분에 잘 들어왔어.'], back: ['다행이다. 오늘은 일찍 자요.', '다행이다. 오늘은 일찍 자.'], trust: 1 },
      { id: 'b', label: '“나도 잠이 잘 안 왔어요.”', say: ['저도 잠이 잘 안 왔어요.', '나도 잠이 잘 안 왔어.'], back: ['그럼 우리 오늘 둘 다 졸리겠네요.', '그럼 우리 오늘 둘 다 졸리겠다.'] }] },
    checkin: { lines: [['요즘 바빠요? 연습실 옆자리가 좀 허전해서요.', '요즘 바빠? 연습실 옆자리가 좀 허전해서.'], ['무리하지 말고요.', '무리하지 말고.']], replies: [
      { id: 'a', label: '“조만간 들를게요.”', say: ['조만간 들를게요.', '조만간 들를게.'], back: ['종이컵 하나 더 사 둘게요.', '종이컵 하나 더 사 둘게.'], trust: 1 },
      { id: 'b', label: '“고마워요. 수련도요.”', say: ['고마워요. 그쪽도 무리하지 말아요.', '고마워. 너도 무리하지 마.'], back: ['네. 오늘은 일찍 잘게요.', '응. 오늘은 일찍 잘게.'] }] }
  };
  // Gift reactions, by hidden taste: [polite, casual] text + face.
  const giftLines = {
    loved: [['어, 이거… 제가 좋아하는 거 어떻게 알았어요?', '어, 이거… 내가 좋아하는 거 어떻게 알았어?'], 'shy'],
    liked: [['고마워요. 잘 쓸게요.', '고마워. 잘 쓸게.'], 'smile'],
    neutral: [['아, 고마워요. 마음만으로도 좋아요.', '아, 고마워. 마음만으로도 좋아.'], 'neutral'],
    disliked: [['아… 고마워요. 이건, 음… 조금 어려울지도 몰라요.', '아… 고마워. 이건, 음… 조금 어려울지도.'], 'worried']
  };
  // After three or more days apart: a quiet "I missed you".
  const reunionLines = [['요즘 바빴어요? …솔직히, 조금 보고 싶었어요.', '요즘 바빴어? …솔직히, 조금 보고 싶었어.'], ['며칠 못 봤네요. 연습실 옆자리가 너무 조용했어요.', '며칠 못 봤네. 연습실 옆자리가 너무 조용했어.']];
  // Tapping Sulien on the main screen: a few lines per mood band, cycled by day and tap count.
  const touchLines = {
    high: [['오늘은 왠지 노래가 잘 될 것 같아요.', '오늘은 왠지 노래가 잘 될 것 같아.', 'smile'], ['왜요? …아무 일 없는데 불러 본 거죠?', '왜? …아무 일 없는데 불러 본 거지?', 'playful'], ['이렇게 같이 있는 거, 좋아요.', '이렇게 같이 있는 거, 좋아.', 'shy']],
    mid: [['네, 듣고 있어요.', '응, 듣고 있어.', 'neutral'], ['오늘 수업 어땠어요?', '오늘 수업 어땠어?', 'smile'], ['잠깐 생각 중이었어요. 별건 아니고요.', '잠깐 생각 중이었어. 별건 아니고.', 'thoughtful']],
    low: [['조금 지쳤나 봐요. 괜찮아요, 금방 나아져요.', '조금 지쳤나 봐. 괜찮아, 금방 나아져.', 'worried'], ['…오늘은 말이 잘 안 나오네요.', '…오늘은 말이 잘 안 나오네.', 'thoughtful']],
    again: [['또요? …그렇게 보면 부끄럽잖아요.', '또? …그렇게 보면 부끄럽잖아.', 'shy'], ['할 말 있으면 해요. 다 들어 줄게요.', '할 말 있으면 해. 다 들어 줄게.', 'playful']]
  };
  // What Sulien is doing right now, by place and time of day.
  const doing = {
    practice: { morning: '악보에 연필로 표시하는 중', afternoon: '피아노로 음을 잡는 중', evening: '발성 연습을 마무리하는 중', night: '불 꺼진 연습실을 정리하는 중' },
    cafe: { morning: '창가에서 과제를 펼쳐 둔 채', afternoon: '따뜻한 차를 식히는 중', evening: '오늘 들은 곡을 적는 중', night: '마감 직전 마지막 한 모금' },
    pier: { morning: '강바람을 맞으며 걷는 중', afternoon: '벤치에서 이어폰 한쪽을 낀 채', evening: '노을을 바라보는 중', night: '물가 가로등 아래에서 쉬는 중' },
    rooftop: { morning: '물병을 들고 바람 쐬는 중', afternoon: '난간에 기대 하늘을 보는 중', evening: '노을빛 아래 흥얼거리는 중', night: '별을 찾는 중' },
    concert: { morning: '공연 일정표를 살펴보는 중', afternoon: '로비에서 프로그램을 읽는 중', evening: '객석에 앉아 조율 소리를 듣는 중', night: '앙코르의 여운에 잠긴 채' }
  };
  // Short talk (3 turns). Each topic: name, what I say, her opener hinting it, an inner-voice hint, and reactions.
  // Every text is [polite, casual]; reactions carry a face.
  const talk = {
    music: { name: '음악', say: ['요즘 무슨 노래 들어요?', '요즘 무슨 노래 들어?'], opener: ['요즘 계속 같은 노래만 듣고 있어요. 이어폰이 뜨거워질 정도로요.', '요즘 계속 같은 노래만 듣고 있어. 이어폰이 뜨거워질 정도로.'], hint: '이어폰 줄을 계속 만지작거린다.',
      hit: [['아, 이거요! 첼로 소리가 처음부터 끝까지 이어지는 곡인데요… 들어 볼래요?', '아, 이거! 첼로 소리가 처음부터 끝까지 이어지는 곡인데… 들어 볼래?'], 'playful'],
      neutral: [['음… 이것저것요. 요즘은 클래식이 많아요.', '음… 이것저것. 요즘은 클래식이 많아.'], 'neutral'],
      miss: [['오늘은 음악 얘기는 조금 쉬고 싶어요. 하루 종일 연습했거든요.', '오늘은 음악 얘기는 좀 쉬고 싶어. 하루 종일 연습했거든.'], 'worried'] },
    class: { name: '수업', say: ['오늘 수업 어땠어요?', '오늘 수업 어땠어?'], opener: ['오늘 수업에서 교수님이 재밌는 얘길 하셨어요.', '오늘 수업에서 교수님이 재밌는 얘기 하셨어.'], hint: '가방 밖으로 수업 노트가 삐죽 나와 있다.',
      hit: [['맞다, 그 얘기 하려고 했어요! 소리도 이야기처럼 편집할 수 있대요.', '맞다, 그 얘기 하려고 했어! 소리도 이야기처럼 편집할 수 있대.'], 'smile'],
      neutral: [['평소랑 비슷했어요. 과제가 하나 늘었어요.', '평소랑 비슷했어. 과제가 하나 늘었어.'], 'neutral'],
      miss: [['수업 얘기는… 오늘 발표를 좀 망쳐서요.', '수업 얘기는… 오늘 발표를 좀 망쳐서.'], 'worried'] },
    worry: { name: '요즘 고민', say: ['무슨 고민 있어요?', '무슨 고민 있어?'], opener: ['…아, 미안해요. 잠깐 딴생각했어요.', '…아, 미안. 잠깐 딴생각했어.'], hint: '웃고 있지만 어딘가 생각이 많아 보인다.',
      hit: [['…티 났어요? 사실, 다시 노래해도 될지 계속 고민 중이에요.', '…티 났어? 사실, 다시 노래해도 될지 계속 고민 중이야.'], 'thoughtful'],
      neutral: [['고민까지는 아니에요. 그냥 조금 피곤해요.', '고민까지는 아니야. 그냥 조금 피곤해.'], 'neutral'],
      miss: [['괜찮아요. 오늘은 그런 얘기 말고 다른 얘기 해요.', '괜찮아. 오늘은 그런 얘기 말고 다른 얘기 하자.'], 'worried'] },
    food: { name: '음식', say: ['뭐 먹고 싶은 거 있어요?', '뭐 먹고 싶은 거 있어?'], opener: ['배고프다…. 아침을 걸렀거든요.', '배고프다…. 아침을 걸렀거든.'], hint: '편의점 쪽을 자꾸 힐끔거린다.',
      hit: [['따뜻한 국물요! 오늘은 무조건 국물이에요.', '따뜻한 국물! 오늘은 무조건 국물이야.'], 'playful'],
      neutral: [['아무거나 괜찮아요. 같이 먹으면 다 맛있으니까요.', '아무거나 괜찮아. 같이 먹으면 다 맛있으니까.'], 'smile'],
      miss: [['아까 먹어서 배불러요. 생각만 해도 졸려요.', '아까 먹어서 배불러. 생각만 해도 졸려.'], 'neutral'] },
    future: { name: '장래', say: ['졸업하고 뭐 하고 싶어요?', '졸업하고 뭐 하고 싶어?'], opener: ['요즘 졸업하고 뭘 할지 자주 생각해요.', '요즘 졸업하고 뭘 할지 자주 생각해.'], hint: '지나오다 게시판의 공연 포스터 앞에서 걸음을 늦췄었다.',
      hit: [['저… 노래를 사람들 앞에서 다시 해 보고 싶어요. 아직 아무한테도 말 안 했어요.', '나… 노래를 사람들 앞에서 다시 해 보고 싶어. 아직 아무한테도 말 안 했어.'], 'shy'],
      neutral: [['아직 잘 모르겠어요. 천천히 정하려고요.', '아직 잘 모르겠어. 천천히 정하려고.'], 'thoughtful'],
      miss: [['그 얘기는… 오늘은 좀 무거워요.', '그 얘기는… 오늘은 좀 무거워.'], 'worried'] },
    small: { name: '시시한 이야기', say: ['그냥… 오늘 하늘 예쁘다, 그런 얘기요.', '그냥… 오늘 하늘 예쁘다, 그런 얘기.'], opener: ['오늘은 그냥, 아무 얘기나 하고 싶은 날이에요.', '오늘은 그냥, 아무 얘기나 하고 싶은 날이야.'], hint: '오늘은 가벼운 이야기가 어울릴 것 같다.',
      hit: [['그쵸? 이런 날은 아무것도 안 하고 걷고 싶어요.', '그치? 이런 날은 아무것도 안 하고 걷고 싶어.'], 'smile'],
      neutral: [['네, 그러네요.', '응, 그러네.'], 'neutral'],
      miss: [['…지금 그 얘기예요? 미안해요, 딴생각하고 있었어요.', '…지금 그 얘기야? 미안, 딴생각하고 있었어.'], 'surprised'] }
  };
  const talkClose = {
    friend: { label: '오늘 이야기, 좋았다고 말하기', say: ['오늘 이야기, 좋았어요. 또 해 줄래요?', '오늘 얘기, 좋았어. 또 해 줄래?'], reply: [['…네. 이상하게 당신한테는 말이 잘 나와요.', '…응. 이상하게 너한테는 말이 잘 나와.'], 'shy'] },
    lovers: { label: '손을 잡아도 되는지 묻기', say: ['손, 잡아도 돼요?', '손 잡아도 돼?'], reply: [['…물어봐 줘서 좋아요. 네.', '…물어봐 줘서 좋아. 응.'], 'shy'] },
    good: [['얘기하다 보니 시간 가는 줄 몰랐네요.', '얘기하다 보니 시간 가는 줄 몰랐네.'], 'smile'],
    quiet: [['오늘은 제가 좀 말이 없었죠. 다음엔 더 얘기해요.', '오늘은 내가 좀 말이 없었지. 다음엔 더 얘기하자.'], 'thoughtful']
  };
  const moodLabel = m => m >= 80 ? '기분 아주 좋음' : m >= 60 ? '기분 좋음' : m >= 40 ? '평온함' : m >= 25 ? '조금 지침' : '쓸쓸함';
  const bondLevel = s => Math.min(10, 1 + Math.floor((s.affection + s.trust) / 20));
  function pickMessage(before, after) {
    const last = before.memories.at(-1);
    const themed = `course-${window.LunaData.dates.find(d => d.id === last?.date)?.theme}`;
    if (last && last.day === before.day) return { day: after.day, key: Object.hasOwn(messages, last.date) ? last.date : Object.hasOwn(messages, themed) && after.day % 3 ? themed : 'course', place: Object.hasOwn(messages, last.date) ? '' : (window.LunaData.dates.find(d => d.id === last.date)?.name || ''), reply: null };
    const quiet = !before.memories.length || before.day - before.memories.at(-1).day >= 2;
    return done(before, 'hello') && quiet && after.day % 3 === 0 ? { day: after.day, key: 'checkin', place: '', reply: null } : null;
  }
  // 하윤: a classmate of both (messenger only). Hints about Sulien's mood, the next story, a taste you haven't found, her birthday.
  const casualHint = h => h.replace(/해 보세요\.$/, '해 봐.').replace(/보세요\.$/, '봐.').replace(/있어요\.$/, '있을 거야.').replace(/걸어요\.$/, '걸 거야.').replace(/열려요\.$/, '열릴걸.').replace(/와요\.$/, '올 거야.').replace(/열립니다\.$/, '열린대.');
  const friendText = {
    birthday: arg => `야, 모레 수련 생일인 거 알지? ${arg}. 뭐 줄지 정했어? 수련은 비싼 거보다 마음 쓴 거 좋아하더라.`,
    mood: () => '수련 요즘 좀 지쳐 보이더라. 연습실에서도 말이 별로 없고. 연락 한번 해 봐.',
    taste: arg => `수련 ${(window.LunaData.gifts.find(g => g.id === arg) || {}).name || '그거'} 진짜 좋아하는 거 알아? 지난번에 그거 보고 엄청 웃더라.`,
    hint: arg => { const e = events.find(x => x.id === arg); return e?.theme || !e ? '수련이 탐방 수첩을 자주 들여다보더라. 안 가 본 곳도 같이 가 봐.' : `수련이 너한테 할 말 있는 것 같던데. 내가 보기엔… ${casualHint(e.hint)}`; },
    exam: () => '이번 주 시험이네… 수련도 도서관에서 계속 공부하더라. 너도 공부 좀 해 두면 수련이랑 얘기 잘 통할걸.',
    festival: () => '축제 시작이다! 수련 대학 축제는 처음이래. 같이 한 바퀴 돌아봐.',
    stat: arg => ({ fitness: '수련이 요즘 강가 산책 코스 얘기를 자주 하던데, 같이 걸으려면 체력 좀 길러 둬 ㅋㅋ', knowledge: '수련이 전시랑 책 얘기를 자주 하더라. 공부 좀 해 두면 대화가 잘 통할걸.', sensitivity: '수련은 음악 얘기 할 때 제일 신나 보여. 음악 좀 들어 두면 좋을걸.' })[arg] || '요즘 수련이랑 잘 지내?'
  };
  const noticeText = {
    practice: () => '[동네 연습실] 이번 주 대관이 열렸어요. 평일 저녁은 빨리 마감돼요.',
    exam: arg => `[학과 공지] ${arg} 주간입니다. 도서관은 자정까지 연장 운영합니다.`,
    festival: arg => `[총학생회] ${arg}가 시작됐어요! 학생회관 앞 공연은 저녁 7시부터.`,
    break: arg => `[학과 공지] ${arg}이 시작됐어요. 연습실 이용 시간이 늘어나요.`,
    start: arg => `[학과 공지] ${arg}입니다. 새 시간표를 확인해 주세요.`
  };
  function pickFriend(before, after) {
    const D = window.LunaData, cal = D.calendar(after.day), soon = D.calendar(after.day + 2);
    if (!done(after, 'hello')) return null;
    const sent = (key, arg) => (after.story.msgLog || []).some(m => m.from === 'friend' && m.key === key && m.arg === arg);
    if (soon.birthday) return { day: after.day, from: 'friend', key: 'birthday', arg: `${soon.month}월 ${soon.date}일` };
    if (after.growth.mood < 40 && after.day % 3 === 0) return { day: after.day, from: 'friend', key: 'mood' };
    if (cal.event?.id === 'exam' && cal.weekday === '월') return { day: after.day, from: 'friend', key: 'exam' };
    if (cal.event?.id === 'festival' && D.calendar(after.day - 1).event?.id !== 'festival') return { day: after.day, from: 'friend', key: 'festival' };
    const unknown = D.gifts.find(g => g.taste === 'loved' && !after.story.tastes?.[g.id] && !sent('taste', g.id));
    if (unknown && after.day % 5 === 0) return { day: after.day, from: 'friend', key: 'taste', arg: unknown.id };
    const next = events.find(e => !done(after, e.id) && !e.ready(after));
    if (next && after.day % 6 === 3 && !sent('hint', next.id)) return { day: after.day, from: 'friend', key: 'hint', arg: next.id };
    if (after.day % 7 === 5) { const st = after.growth.stats, low = Object.keys(st).sort((a, b) => st[a] - st[b])[0]; return { day: after.day, from: 'friend', key: 'stat', arg: low }; }
    return null;
  }
  function pickNotice(after) {
    const cal = window.LunaData.calendar(after.day), prev = window.LunaData.calendar(after.day - 1);
    if (cal.event && cal.event.name !== prev.event?.name) return { day: after.day, from: 'notice', key: cal.event.id, arg: cal.event.name };
    if (cal.term && cal.weekday === '월') return { day: after.day, from: 'notice', key: 'practice' };
    return null;
  }
  const logText = entry => entry.from === 'friend' ? friendText[entry.key]?.(entry.arg) : entry.from === 'notice' ? noticeText[entry.key]?.(entry.arg) : '';
  // Birthday gifts: every taste lands warmer.
  const birthdayLines = {
    loved: [['…생일인 거, 알고 있었어요? 이거… 평생 기억할 것 같아요.', '…생일인 거, 알고 있었어? 이거… 평생 기억할 것 같아.'], 'shy'],
    liked: [['생일 선물이에요? …고마워요. 진짜로요.', '생일 선물이야? …고마워. 진짜로.'], 'smile'],
    neutral: [['기억해 준 것만으로도 좋아요. 오늘 하루 중에 제일 좋은 일이에요.', '기억해 준 것만으로도 좋아. 오늘 하루 중에 제일 좋은 일이야.'], 'smile'],
    disliked: [['아, 이건… 후후, 그래도 생일을 기억해 줬잖아요. 그걸로 됐어요.', '아, 이건… 후후, 그래도 생일 기억해 줬잖아. 그걸로 됐어.'], 'playful']
  };
  const birthdayGreeting = ['오늘…? 아, 아니에요. 그냥 기분 좋은 날이에요.', '오늘…? 아, 아니야. 그냥 기분 좋은 날이야.'];
  const speechIndex = s => s.story.speech === 'casual' ? 1 : 0;
  const messageText = (s, pair, place = '') => pair[speechIndex(s)].replace('{place}', place);
  function fresh() { return { revision: 1, completed: [], active: null, dateCount: 0, preference: null, promise: false, keptPromises: 0, boundary: null, music: null, relationship: 'acquaintances', considerAt: 0, commitAt: 0, last: null }; }
  function done(s, id) { return s.story.completed.some(e => e.id === id); }
  function script(kind, id) { return kind === 'date' ? (Object.hasOwn(dates,id) ? dates[id] : undefined) : events.find(e => e.id === id)?.nodes; }
  function available(s) { return s.story.active || s.story.activities?.active ? [] : events.filter(e => !done(s, e.id) && e.ready(s)); }
  function stage(s) { return ({ lovers: '친구에서 연인으로', friends: '소중한 친구', considering: '친구 이상의 마음을 알아가는 중' })[s.story.relationship] || (s.story.dateCount >= 3 ? '새로운 마음을 알아가는 친구' : '오래 알고 지낸 친구'); }
  function validate(story, state) {
    if (story === undefined) return fresh(); // v2 saves predate narrative; never invent past choices.
    const r = story, integer = (v, max = 9999) => Number.isInteger(v) && v >= 0 && v <= max;
    const validChoices = (kind, id, ids) => { const nodes = script(kind,id); return !!nodes && Array.isArray(ids) && ids.length <= nodes.length && ids.every((v,i) => nodes[i].choices.some(c => c.id === v)); };
    if (!r || r.revision !== 1 || !integer(r.dateCount) || !integer(r.keptPromises) || r.keptPromises > r.dateCount || !integer(r.considerAt) || !integer(r.commitAt) || r.considerAt > r.dateCount || r.commitAt > r.dateCount || typeof r.promise !== 'boolean' || ![null,'quiet','share'].includes(r.preference) || ![null,'clear','repair'].includes(r.boundary) || ![null,'now','new'].includes(r.music) || !['acquaintances','lovers','friends','considering'].includes(r.relationship)) return null;
    if (!Array.isArray(r.completed) || r.completed.length > events.length || new Set(r.completed.map(e => e?.id)).size !== r.completed.length || !r.completed.every(e => e && validChoices('event',e.id,e.choices) && e.choices.length === script('event',e.id).length && integer(e.day) && e.day >= 1 && e.day <= state.day)) return null;
    const snapshot = a => a && (a.neckAccessory === undefined || ['none','headset'].includes(a.neckAccessory)) && integer(a.day) && a.day >= 1 && a.day <= state.day && state.owned.includes(a.outfit) && state.ownedAccessories.includes(a.legwear) && (a.outfit === 'skirt' || a.legwear === 'none') && window.LunaData.times.some(t => t.id === a.time);
    if (r.active !== null) {
      const a = r.active;
      if (!a || !['date','event'].includes(a.kind) || !snapshot(a) || !validChoices(a.kind,a.id,a.choices) || a.choices.length >= script(a.kind,a.id).length || a.day !== state.day || a.outfit !== state.outfit || a.legwear !== state.legwear || (a.neckAccessory || 'none') !== (state.neckAccessory || 'none') || (a.kind === 'event' && r.completed.some(e=>e.id===a.id)) || (a.kind === 'date' && state.datesToday[0] !== a.id)) return null;
    }
    if (r.last !== null && (!r.last || !['date','event'].includes(r.last.kind) || !validChoices(r.last.kind,r.last.id,r.last.choices) || r.last.choices.length !== script(r.last.kind,r.last.id).length || !snapshot(r.last) || !integer(r.last.affection,12) || !integer(r.last.trust,10))) return null;
    if (r.speech !== undefined && !['polite','casual'].includes(r.speech)) return null;
    if (r.carry !== undefined && (!r.carry || typeof r.carry !== 'object' || Array.isArray(r.carry) || Object.keys(r.carry).some(k => !['affection','trust'].includes(k)) || !Object.values(r.carry).every(v => integer(v, 99)))) return null;
    if ([r.lastMet, r.giftDay].some(v => v !== undefined && (!integer(v) || v < 1 || v > state.day))) return null;
    if (r.msgLog !== undefined && (!Array.isArray(r.msgLog) || r.msgLog.length > 60 || !r.msgLog.every(m => m && integer(m.day) && m.day >= 1 && m.day <= state.day && (m.arg === undefined || (typeof m.arg === 'string' && m.arg.length <= 60)) && (m.from === 'sulien' ? Object.hasOwn(messages, m.key) && [null, 'a', 'b', undefined].includes(m.reply) : m.from === 'friend' ? Object.hasOwn(friendText, m.key) : m.from === 'notice' && Object.hasOwn(noticeText, m.key))))) return null;
    if (r.seen !== undefined && (!integer(r.seen) || r.seen > (r.msgLog || []).length)) return null;
    if (r.birthdays !== undefined && (!Array.isArray(r.birthdays) || r.birthdays.length > 50 || !r.birthdays.every(y => integer(y, 3000)))) return null;
    if (r.talkDay !== undefined && (!integer(r.talkDay) || r.talkDay < 1 || r.talkDay > state.day)) return null;
    if (r.talks !== undefined && (!Array.isArray(r.talks) || r.talks.length > 10 || !r.talks.every(t => t && integer(t.day) && t.day >= 1 && t.day <= state.day && integer(t.score, 100) && Array.isArray(t.picks) && t.picks.length === 3 && new Set(t.picks).size === 3 && t.picks.every(p => Object.hasOwn(talk, p))))) return null;
    if (r.tastes !== undefined && (!r.tastes || typeof r.tastes !== 'object' || Array.isArray(r.tastes) || !Object.entries(r.tastes).every(([k, v]) => window.LunaData.gifts.some(g => g.id === k && g.taste === v)))) return null;
    if (r.message !== undefined && r.message !== null) {
      const m = r.message;
      if (!m || !Object.hasOwn(messages, m.key) || !integer(m.day) || m.day > state.day || typeof m.place !== 'string' || m.place.length > 60 || ![null,'a','b'].includes(m.reply)) return null;
    }
    const exploration = window.LunaCourses ? window.LunaCourses.validate(r.exploration,state,r.dateCount) : {};
    if (!exploration) return null;
    const activities=window.LunaActivities?window.LunaActivities.validate(r.activities,{...state,story:{...r,exploration}}):undefined;
    if(window.LunaActivities&&!activities)return null;
    return JSON.parse(JSON.stringify({...r,exploration,...(activities?{activities}:{})}));
  }
  window.LunaStory = { storyGap, rested, intro, dates, events, fresh, script, available, stage, validate, done, messages, pickMessage, messageText, speechIndex, giftLines, reunionLines, touchLines, doing, moodLabel, bondLevel, talk, talkClose, friendText, noticeText, pickFriend, pickNotice, logText, birthdayLines, birthdayGreeting };
})();
