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
    { time: '입학 전의 겨울', title: '한 소절에서 시작된 꿈', expression: 'thoughtful', lines: [
      ['', '수련은 좋아하는 발라드를 몇 번이고 따라 부르며, 같은 가사도 목소리에 따라 다르게 들린다는 걸 알게 됐습니다. 자신도 노래로 마음을 전하고 싶어 보컬 입시를 준비했습니다.'],
      ['', '집안 형편 때문에 레슨과 연습실을 마음껏 이용할 수는 없었지만, 실용음악과 보컬 전공에 합격했습니다. 가방에는 입시곡의 호흡과 가사 해석을 적은 노트도 넣었습니다.'],
      ['수련', '발라드를 좋아해요. 저도 한 소절만으로 마음이 전해지는 노래를 부르고 싶어요.'] ] },
    { time: '1학년 · 첫 전공 수업', title: '빈자리인가요?', expression: 'neutral', lines: [
      ['', '강의실을 잘못 찾아 늦게 들어온 당신에게, 창가 쪽 학생이 옆 의자의 가방을 치워 주었습니다.'],
      ['플레이어', '여기 앉아도 돼요?'], ['수련', '네. 강의계획서, 같이 봐요.'],
      ['', '같은 실용음악과 보컬 전공, 같은 학년. 두 사람이 처음 나눈 것은 이름보다 한 장의 종이였습니다.'] ] },
    { time: '첫 조별 과제', title: '같은 소리를 듣는 사람', expression: 'smile', lines: [
      ['', '첫 보컬 앙상블 과제는 짝을 지어 발라드 한 곡을 나누어 부르는 일이었습니다. 당신은 옆자리의 수련에게 같이 하자고 했습니다.'],
      ['수련', '조금만 더 들어봐요. 여기서는 숨을 고른 다음에 가사가 시작돼요.'],
      ['', '두 사람은 반주에 맞춰 파트와 화음을 나누었습니다. 발표 전날에는 수련이 떨리는 당신의 첫 소절을 끝까지 들어 주고, 다음 소절을 조용히 이어 불렀습니다.'],
      ['', '혼자라면 미뤘을 일을, 둘은 함께 조금씩 끝내고 있었습니다.'] ] },
    { time: '함께 보낸 첫 학년', title: '친구가 되는 동안', expression: 'shy', lines: [
      ['', '과제가 끝난 날, 수련이 학생식당에서 같이 먹자고 했습니다. 학식 메뉴를 고르고 식판을 반납하는 짧은 점심이, 과제가 없는 날에도 이어졌습니다.'],
      ['', '수련이 듣는 음악도, 즐겨 부르는 노래도 발라드라는 걸 그때 알았습니다. 좋아하는 곡을 묻자 가사부터 이야기하던 수련은, 언젠가 자기 마음도 노래로 들려주고 싶다며 웃었습니다.'],
      ['수련', '다음 학기에도 시간표 같이 볼래요?'],
      ['', '같은 전공이라 만났지만, 이제는 만나고 싶어서 시간을 맞추는 사이. 그렇게 두 사람은 친구가 되었습니다.'] ] },
    { time: '현재 · 다시 찾아온 봄', title: '오늘도, 옆자리', expression: 'smile', lines: [
      ['', '새 학기. 같은 실용음악과 보컬 전공 동기인 두 사람은 각자 집에서 통학합니다. 수업과 카페 근무 사이에 연습 시간을 맞추고, 늦은 만남보다는 겹치는 점심과 짧은 공강을 찾습니다. 수련은 발라드 실기곡과 보컬 데모, 작은 라이브를 준비하고 있습니다.'],
      ['수련 · 메시지', '수업 끝나고 연습실에 잠깐 있을게요. 집 가기 전에 시간 괜찮아요?'],
      ['플레이어 · 메시지', '갈게요. 돌아갈 버스 시간 보고 잠깐만 걸어요.'],
      ['', '수련이 버츄얼 아이돌 연습생이 되기 전. 수련과 당신의 새로운 일상이 시작됩니다.'] ] }
  ];
  const dates = {
    walk: [
      scene([
        ['', '각자 일정을 마친 두 사람은 강가에서 만나 먼저 돌아갈 교통편을 확인합니다.', { cam: 'wide', sfx: 'wind' }],
        ['수련', '오늘은 저 다리까지만 갔다 와요. 환승 놓치면 내일 아침에 후회할 것 같아서요.', { face: 'playful' }],
        ['나', '좋아요. 짧게 걷는 건데 가방은 왜 이렇게 무겁죠.'],
        ['수련', '오늘 교재 다 챙겨 왔잖아요. 아까 빈 강의실 찾을 때부터 무거워 보였어요.', { face: 'smile' }]
      ], [
        pick('quiet', '벤치에서 가방을 내려놓고 잠깐 쉬기', '그럼 가방부터 쉬게 해 줘요.', [['수련', '가방 핑계로 우리도 좀 쉬고요.', { face: 'playful' }], ['', '가방 두 개를 발치에 놓고 나란히 앉습니다.']], { preference: 'quiet' }),
        pick('share', '걸으면서 오늘 수업 이야기하기', '오늘 수업에서 웃긴 일 있었는데, 들어 봐요.', [['수련', '잠깐만요. 저도 하나 있어요. 먼저 말해요.', { face: 'smile' }], ['', '서로 웃다가 다음 말을 놓치고, 같은 이야기를 다시 시작합니다.']], { preference: 'share', affection: 1 })]),
      scene([
        ['', '다리 쪽으로 걷다가 수련이 휴대폰을 주머니에 넣습니다.', { cam: 'lean' }],
        ['수련', '집 가면 과제 해야 하는데, 그냥 바로 가기는 아쉬웠어요.', { face: 'thoughtful' }],
        ['수련', '오늘 계속 수업 듣고 연습만 해서 그런가 봐요. 같이 걸으니까 이제 좀 하루가 끝나는 것 같네요.', { face: 'smile' }]
      ], [
        pick('listen', '짧게 바람 쐬고 각자 할 일 하자고 하기', '조금 쉬었다 가요. 과제는 집에서 마저 하고요.', [['수련', '네. 오늘 할 일까지 없던 걸로 만들면 내일의 제가 힘드니까요.', { face: 'playful' }]]),
        pick('ask', '내일 점심시간이 겹치는지 묻기', '내일 점심은 몇 시에 먹어요?', [['수련', '수업 끝나고요. 시간 맞으면 학식 같이 먹을래요?', { face: 'shy' }]], { trust: 1 }),
        pick('steady', '돌아갈 길까지 여유 있게 걸음 맞추기', '여기서 돌아가면 딱 좋겠어요. 버스 타는 데까지 같이 가요.', [['수련', '벌써요? 아… 올 때 걸린 시간도 세고 있었네요.', { face: 'surprised' }], ['수련', '좋아요. 뛰어서 헤어지는 것보다 이게 낫겠어요.', { face: 'smile' }]], { requireStat: 'fitness', requireValue: 10, affection: 2, trust: 1, mood: 5 })]),
      farewell([
        ['', '약속한 지점에서 발길을 돌려 정류장 앞에 섭니다. 아직 귀가할 여유가 남아 있습니다.', { cam: 'wide' }],
        ['수련', '멀리 안 갔는데 생각보다 좋았어요. 내일 일찍 일어날 자신도 있고요.', { face: 'smile' }],
        ['수련', '집 도착하면 연락해요. 저도 할게요.', { face: 'shy', cam: 'lean' }]
      ], '다음에도 시간 맞으면 짧게 걸어요.', '다음에도 귀가 전에 이 길 같이 걸어요.', [['수련', '좋아요. 다음 근무 없는 날부터 맞춰 봐요.', { face: 'smile' }]])
    ],
    cafe: [
      scene([
        ['', '둘은 음료 두 잔만 주문합니다. 계산대 옆 케이크는 다음으로 미루고 창가에 가방을 내려놓습니다.', { cam: 'wide', sfx: 'bell' }],
        ['수련', '오늘은 음료만 마셔요. 점심도 먹었고, 오래 있을 것도 아니니까요.', { face: 'smile' }],
        ['나', '그럼 자리 고르는 데만 삼십 분 쓰는 건 금지예요.'],
        ['수련', '그 정도는 아니었거든요. …창가 비었네요.', { face: 'playful' }]
      ], [
        pick('quiet', '안쪽 자리에서 잠깐 쉬기', '오늘은 조용한 안쪽으로 가 볼까요?', [['수련', '좋아요. 가방 내려놓으니까 이제 좀 살겠네요.', { face: 'smile' }]], { preference: 'quiet' }),
        pick('share', '창가에서 오늘 있었던 일 나누기', '창가로 가요. 오늘은 뭐가 제일 웃겼어요?', [['수련', '아까 자리 삼십 분 고른다고 한 사람이요.', { face: 'playful' }], ['수련', '농담이에요. 반쯤은요.', { face: 'smile' }]], { preference: 'share', affection: 1 })]),
      scene([
        ['', '수련이 달력에 적힌 다음 근무를 확인하고 휴대폰을 뒤집어 둡니다.'],
        ['수련', '수업 끝나면 알바 가고, 쉬는 날에는 밀린 과제 하고. 이번 주는 시간이 되게 빨리 가네요.', { face: 'thoughtful' }],
        ['수련', '길게 못 만나면 다음으로 미뤄야 하나 했는데… 이렇게 잠깐 보는 것도 괜찮네요.', { face: 'shy', cam: 'lean' }]
      ], [
        pick('listen', '알바와 과제 사이 짧게 만나도 좋다고 하기', '한 시간 비면 한 시간 만나는 거죠. 꼭 하루를 다 비울 필요는 없고요.', [['수련', '네. 그러면 다음 약속 잡는 게 덜 어렵겠어요.', { face: 'smile' }]]),
        pick('share', '나도 이번 주 일정이 빠듯했다고 말하기', '저도 이번 주는 밥 먹을 때밖에 시간이 안 나더라고요.', [['수련', '그럼 다음에는 학식 같이 먹어요. 밥은 어차피 먹어야 하잖아요.', { face: 'playful' }]], { affection: 1 }),
        pick('insight', '빈 시간을 맞추느라 애쓴 걸 알아주기', '오늘도 빈 시간 맞춰 준 거죠? 같이 오고 싶었던 거, 고마워요.', [['수련', '…티 났어요?', { face: 'surprised' }], ['수련', '커피는 혼자 마셔도 되는데, 얘기는 같이 하고 싶어서요.', { face: 'shy', cam: 'lean' }]], { requireStat: 'sensitivity', requireValue: 10, affection: 2, trust: 1, mood: 5 })]),
      farewell([
        ['', '다음 일정에 늦지 않도록 남은 음료를 챙겨 나옵니다. 헤어지는 골목에서 수련이 한 번 뒤를 돌아봅니다.', { cam: 'wide' }],
        ['수련', '오늘은 이만 가야겠어요. 다음에는 좀 덜 바쁜 날에 봐요.', { face: 'smile' }],
        ['수련', '아니면… 점심시간에 잠깐 봐도 되고요.', { face: 'shy' }]
      ], '서로 빈 시간 생기면 연락해요.', '다음엔 돈 안 드는 부두 산책으로 해요.', [['수련', '좋아요. 돌아갈 시간 먼저 정해 두고요.', { face: 'smile' }]])
    ],
    concert: [
      scene([
        ['', '둘 다 근무가 없는 날을 골라 미리 예매한 공연입니다. 두 장의 표와 공연 종료 시간을 다시 확인합니다.', { cam: 'wide' }],
        ['수련', '이번 달에는 이 공연 하나만 보려고요. 연습실 비용도 남겨 둬야 해서요.', { face: 'thoughtful' }],
        ['나', '그럼 오늘은 제대로 듣고 가요. 끝나고 환승할 시간도 봐 뒀어요.'],
        ['수련', '좋아요. 다음에는 돈 안 쓰는 데이트 해요. …산책 같은 거요.', { face: 'shy' }]
      ], [
        pick('quiet', '공연 중에는 감상을 미루고 함께 듣기', '끝나고 얘기해요. 지금은 무대에 집중하고요.', [['수련', '네. 휴대폰도 넣어 둘게요.', { face: 'smile' }]], { preference: 'quiet' }),
        pick('share', '기억에 남은 한 소절을 나중에 나누기', '끝나면 제일 좋았던 한 소절만 서로 말해 줘요.', [['수련', '좋아요. 같은 부분 고르면 좀 웃기겠는데요.', { face: 'playful' }]], { preference: 'share', affection: 1 })]),
      scene([
        ['', '공연이 끝나고 박수가 잦아듭니다. 수련이 접어 둔 표를 가방 안쪽에 넣습니다.'],
        ['수련', '저 마지막 가사요. 같은 말인데 첫 소절이랑 완전히 다르게 들렸어요.', { face: 'thoughtful' }],
        ['수련', '아… 지금 너무 수업 때처럼 얘기했죠?', { face: 'playful' }]
      ], [
        pick('listen', '더 듣고 싶다고 말하며 출구로 천천히 걷기', '계속 얘기해 줘요. 정류장 가면서 들을게요.', [['수련', '다행이다. 지금 얘기 안 하면 집 가는 내내 혼자 생각할 것 같았어요.', { face: 'smile' }]]),
        pick('ask', '다음에는 수련의 노래도 듣고 싶다고 말하기', '수련이 부르면 어떨지도 듣고 싶어요.', [['수련', '그럼 다음에 연습할 때 와요. 오늘 들은 걸 조금 따라 해 볼래요.', { face: 'shy' }]], { trust: 1 }),
        pick('theory', '마지막 화음의 인상을 나누기', '마지막에 장조로 끝나니까 좀 다르게 들리죠?', [['수련', '맞아요. 저도 그 부분에서 고개 들었어요.', { face: 'surprised' }], ['수련', '다음 합주 때 이런 느낌 한번 내 볼까요?', { face: 'smile' }]], { requireStat: 'knowledge', requireValue: 16, affection: 2, trust: 1, mood: 5 })]),
      farewell([
        ['', '다음 버스가 오기 전, 정류장 의자에 나란히 앉습니다. 공연 뒤의 비싼 식사 대신 각자 챙겨 온 물을 마십니다.', { cam: 'wide' }],
        ['수련', '오늘 표는 잘 넣어 뒀어요. 다음 달 교통비까지 쓰면 안 되니까, 한동안 꺼내 보기만 하려고요.', { face: 'playful' }],
        ['수련', '버스 오네요. 집 도착하면 오늘 고른 소절 보내 줘요.', { face: 'smile', cam: 'lean' }]
      ], '다음 공연은 예산이랑 일정 보고 골라요.', '다음엔 부두에서 오늘 들은 노래 얘기해요.', [['수련', '좋아요. 다음에는 걷는 것만 해도 충분해요.', { face: 'smile' }]])
    ],
    lunch: [
      scene([
        ['', '점심 수업이 끝난 뒤, 학생식당 앞에서 만납니다. 수련이 식권 두 장을 든 당신을 발견하고 손을 듭니다.', { cam: 'wide' }],
        ['수련', '먼저 왔네요? 오늘 줄 길어서 자리 없을 줄 알았어요.', { face: 'surprised' }],
        ['나', '수업 끝나자마자 왔죠. 식권은 제가 샀어요. 한 장에 오천 원이더라고요.'],
        ['수련', '그럼 잘 먹을게요. 다음번 밥은 제가 살게요.', { face: 'smile' }]
      ], [
        pick('quiet', '수업 전에 쉬기 좋은 안쪽 자리 찾기', '안쪽에 두 자리 비었어요. 저기로 가요.', [['수련', '좋아요. 밥 먹는 동안은 강의실 생각 좀 안 할래요.', { face: 'smile' }]], { preference: 'quiet' }),
        pick('share', '오늘 메뉴 얘기로 편하게 시작하기', '오늘 반찬 보고 결정했어요. 이건 줄 설 만하죠?', [['수련', '아까부터 그 반찬만 보고 있었죠? 들켰어요.', { face: 'playful' }]], { preference: 'share', affection: 1 })]),
      scene([
        ['', '가방을 빈 의자 아래 넣고 식판을 나란히 놓습니다. 주변에서는 다음 강의와 과제 이야기가 들려옵니다.'],
        ['수련', '오늘은 수업 끝나면 바로 집 가요? 아니면 알바 있어요?', { face: 'neutral' }],
        ['수련', '저는 연습 조금만 하고 가려고요. 집 가는 데도 시간이 걸리니까, 너무 늦게까지는 말고요.', { face: 'thoughtful' }]
      ], [
        pick('listen', '각자 일정이 있어도 밥은 같이 먹자고 하기', '오늘은 밥만 같이 먹어도 좋죠. 남은 일정은 각자 하고요.', [['수련', '네. 따로 약속 크게 안 잡아도 볼 수 있으니까 좋네요.', { face: 'smile' }]]),
        pick('ask', '다음 주 겹치는 점심시간 찾아보기', '다음 주에도 이 시간 비어요?', [['수련', '같은 수업 끝나니까 아마요. 그날은 제가 먼저 식당 와 있을게요.', { face: 'shy' }]], { trust: 1 }),
        pick('insight', '평범한 점심 약속이 기다려졌다고 말하기', '오늘 메뉴보다 같이 먹는 게 더 기다려졌어요.', [['수련', '저도요. 아까 수업 끝나기 전부터 시계 봤어요.', { face: 'shy', cam: 'lean' }]], { requireStat: 'sensitivity', requireValue: 10, affection: 2, trust: 1, mood: 5 })]),
      scene([
        ['', '식판을 반납하고 학생식당 앞까지 함께 걷습니다. 서로 갈 강의실이 달라 계단 앞에서 멈춥니다.', { cam: 'wide' }],
        ['수련', '점심시간 진짜 짧다. 벌써 가야 하네요.', { face: 'thoughtful' }],
        ['수련', '그래도 오늘 밥은 안 급하게 먹었어요. 같이 먹어서 그런가.', { face: 'shy', cam: 'lean' }]
      ], [
        pick('open', '다음 공강에 또 밥 먹자고 하기', '다음에도 시간 맞으면 같이 먹어요.', [['수련', '좋아요. 수업 잘 듣고 와요.', { face: 'smile' }]]),
        pick('promise', '다음 만남은 무료 산책으로 약속하기', '다음에는 근무 없는 날에 짧게 걸어요. 부두 쪽으로요.', [['수련', '좋아요. 통학 시간도 보고 맞춰요. 무리해서 늦게까지 있지는 말고요.', { face: 'smile' }]], { promise: true })])
    ]
  };
  // Main chapters need a few days to breathe after the previous one, so the story follows the calendar.
  const mainChain = ['hello', 'space', 'invite', 'score', 'boundary', 'repair', 'session', 'confession', 'revisit', 'epilogue', 'casual'], storyGap = 5;
  const rested = s => { const last = s.story.completed.filter(e => mainChain.includes(e.id)).at(-1); return !last || s.day - last.day >= storyGap; };
  const events = [
    { id: 'hello', title: '친구가 기다리는 연습실', location: 'practice', hint: '연습실에서 기다리는 친구 수련을 만나 보세요.', ready: () => true, nodes: [
      scene([
        ['', '아직 수련이 어떤 엔터테인먼트에도 들어가지 않았던 시절.', { cam: 'wide' }],
        ['', '보컬 수업이 끝난 뒤, 빌린 동네 연습실의 문이 반쯤 열려 있습니다. 발라드 반주가 멈추고, 수련이 숨을 고른 뒤 같은 소절을 다시 부릅니다.'],
        ['', '문틈으로 들여다보는 순간, 같은 실용음악과 보컬 전공 동기 수련과 눈이 마주칩니다.', { face: 'surprised', cam: 'lean' }],
        ['수련', '왔네요.', { face: 'smile' }],
        ['수련', '오늘도 같은 데서 막혔어요. 세 번째 마디요.', { face: 'playful' }],
        ['', '늘 두던 옆자리에, 종이컵 하나가 놓입니다. 악보 옆 수첩에는 수·금·토 근무와 돌아갈 버스 시간이 적혀 있습니다.', { cam: 'back' }],
        ['속', '내 몫까지 사 둔 걸까. 아직 따뜻하다.']
      ], [
        pick('listen', '지금은 듣고 있어도 될까요?', '버스 타러 가기 전까지 옆에서 듣고 있어도 돼요?', [['수련', '네. 아직 중간에 자주 멈추는데…', { face: 'shy' }], ['수련', '괜찮으시면요.', { face: 'smile' }], ['', '빈 의자에 앉자, 반주가 다시 시작됩니다.', { cam: 'back' }]]),
        pick('plan', '연습 끝나고 같이 걸을 시간을 정할까요?', '귀가 시간 맞으면 잠깐 걸어요. 몇 시쯤 끝나요?', [['수련', '좋아요. 돌아갈 시간부터 적어 둬요. 둘 다 내일 아침 수업 있잖아요.', { face: 'smile' }], ['', '수련이 악보 옆의 개인 수첩과 펜을 내밉니다.']])]) ] },
    { id: 'space', title: '비어 있는 한 칸', location: 'rooftop', hint: '연습실에서 대화한 뒤 일하기 또는 휴식을 경험해 보세요.', ready: s => done(s, 'hello') && s.journal.some(j => ['work','rest'].includes(j.type)), nodes: [
      node('근무를 마치거나 잠깐 쉰 날, 옥상에 나온 수련이 물병을 건넵니다. “다음 근무까지 빈 시간이 있네요. 여기서 좀 쉬다가 들어갈까요?” 두 사람은 각자 돌아갈 교통편을 확인하고 난간에 등을 기댑니다.', [
        choice('rest', '그 시간에는 아무것도 안 해도 되죠', '“그럼 오늘은 쉬어요. 내일 점심시간 맞으면 학식 같이 먹고요.”'),
        choice('walk', '시간이 맞으면 강가에 같이 가요', '“좋아요. 돌아오는 길까지 생각해서 짧게만 걸어요. 집 가서 과제도 해야 하니까요.”')]) ] },
    { id: 'invite', title: '두 번 적힌 약속', location: 'pier', hint: '연습실 대화와 첫 외출을 마치면 수련이 먼저 말을 걸어요.', ready: s => done(s, 'hello') && s.story.dateCount >= 1, nodes: [
      node('수련이 개인 수첩을 펼칩니다. 연습 메모와 근무 일정 사이의 빈칸에 작은 물결이 그려져 있습니다. “다음에는 둘 다 근무 없는 날에 걸을까요? 점심만 같이 먹어도 좋고요. 이번에는 제가 먼저 물어보고 싶었어요.”', [
        choice('yes', '다음 외출을 부두에서 함께하기', '“그럼 물가 쪽 길은 제가 안내할게요. 돈 안 드는 짧은 코스로요. 귀가할 시간도 미리 맞춰요.”', { promise: true }),
        choice('later', '지금은 여유가 없지만 다음에 다시 이야기하기', '“알려 줘서 고마워요. 가능한 날에 말해 주세요. 기다리는 숙제로 만들지는 않을게요.”')]) ] },
    { id: 'score', title: '고쳐 쓴 보컬 노트', location: 'practice', hint: '며칠 뒤, 데이트 3회·신뢰 15를 쌓아 보세요.', ready: s => done(s, 'invite') && rested(s) && s.story.dateCount >= 3 && s.trust >= 15, nodes: [
      node('수련이 반주를 멈추고 낡은 보컬 노트를 펼칩니다. “입시 때는 높은 음을 흔들리지 않게 내는 게 전부인 줄 알았어요. 실용음악과에서 보컬을 배우면 좋아하는 발라드도 제 마음대로 부를 수 있을 줄 알았는데요. 레슨비랑 연습실 비용을 계산하다 보면, 좋아하는 마음까지 점수를 매기게 돼요.” 가사 사이에는 숨을 쉴 자리와 전하고 싶은 마음이 적혀 있습니다.', [
        choice('listen', '지금 부르면 어떤 느낌일지 묻기', '“아직 모르겠어요. 그걸 모르는 채로 시작해도 괜찮을까요?”', { music: 'now' }),
        choice('new', '후렴을 다른 감정으로 불러 봐도 된다고 말하기', '“버리는 게 아니라 고르는 거겠죠. 이번엔 제가 정해 보고 싶어요.”', { music: 'new' })]),
      node('수련이 보컬 노트를 보면대에 올립니다. “제가 고른 발라드로 작은 무대를 열어 볼까 해요. 실기 점수 말고, 가사를 어떤 마음으로 전하고 싶은지부터 생각해 볼게요.”', [
        choice('wait', '곡을 정할 때까지 기다리기', '“정해지면 가장 먼저 들려드릴게요. 대신, 조금 오래 걸려도 괜찮아요?”'),
        choice('help', '필요한 준비가 생기면 알려 달라고 하기', '“의자 몇 개면 될 것 같아요. 큰 무대로 만들지 않아도 괜찮아요.”')]) ] },
    { id: 'boundary', title: '아직 정하지 않은 일', location: 'practice', hint: '보컬 노트 이야기에서 며칠 지나 데이트 6회·호감 20을 쌓아 보세요.', ready: s => done(s, 'score') && rested(s) && s.story.dateCount >= 6 && s.affection >= 20, nodes: [
      node('연락을 마친 수련이 휴대폰을 뒤집습니다. “보컬 수업 선배가 축제 무대 이야기를 들었어요. 반갑지만… 제가 고른 발라드보다 고음이 돋보이는 유명한 곡을 기대하는 것 같아서, 벌써 거기에 맞추고 있어요.”', [
        choice('ask', '누구에게 들려주고 싶은지 먼저 묻기', '“지금의 제 노래를 듣고 싶은 사람에게요. 선배에게도 제가 직접 말씀드릴게요.”', { boundary: 'clear' }),
        choice('decide', '부담 없게 내가 대신 거절해 줄게요', '“도와주려는 건 알아요. 그래도 제 대답을 먼저 듣고 움직여 주셨으면 해요.” 수련은 악보를 닫지 않습니다. 다시 이야기할 여지는 남아 있습니다.', { boundary: 'repair' })]) ] },
    { id: 'repair', title: '대답을 기다리는 연습', location: 'rooftop', hint: '수련에게 결정권을 돌려주는 대화를 할 수 있어요.', ready: s => done(s, 'boundary') && s.story.boundary === 'repair', nodes: [
      node('수련은 옥상 문을 열어 둡니다. “멀어지고 싶어서 한 말은 아니었어요. 가까운 사람에게도 제가 고를 자리는 필요해서요.”', [
        choice('sorry', '먼저 정하려 해서 미안해요. 무엇을 원해요?', '“선배에게 제가 연락하고 싶어요. 옆에 있어 주는 건, 그 다음에 부탁할게요.”', { boundary: 'clear' }),
        choice('honest', '돕고 싶어 서둘렀어요. 다음엔 먼저 물을게요', '“그 말이면 돼요. 저도 필요한 걸 더 분명히 말해 볼게요.”', { boundary: 'clear' })]) ] },
    { id: 'session', title: '내 노래로 서는 작은 무대', location: 'practice', hint: '서로의 결정권을 확인하고 며칠 지나 데이트 9회·신뢰 30을 쌓아 보세요.', ready: s => done(s, 'boundary') && s.story.boundary === 'clear' && rested(s) && s.story.dateCount >= 9 && s.trust >= 30, nodes: [
      node('연습실의 작은 오픈 마이크. 의자 몇 개 앞에 선 수련이 마이크 높이를 맞추고 발라드 악보를 펼칩니다. “완벽해진 다음에 부르려고 했는데, 그러면 계속 미루게 될 것 같아요. 오늘은 제가 고른 노래를 제 마음으로 끝까지 불러 볼래요.”', [
        choice('listen', '관객석에서 끝까지 듣기', '마지막 숨이 끝난 뒤에야 손뼉을 칩니다. “기다려 주니까, 끝까지 제 노래처럼 부를 수 있었어요.”'),
        choice('support', '준비할 것이 있는지 묻고 자리에 앉기', '“물 한 잔이면 돼요. 이제는 듣는 사람이 되어 주세요.” 수련은 반주를 켜고 숨을 고른 뒤 첫 소절을 부릅니다.')]),
      node('수련이 마이크를 내려놓고 보컬 노트에 오늘의 날짜를 적습니다. “잘 불렀는지는 나중에 생각하려고요. 오늘은 제가 부르고 싶어서 불렀다는 걸 기억할래요.”', [
        choice('memory', '오늘의 순간을 함께 기억하자고 하기', '“그럼 제목은 제가 정할게요. 오늘의 소리를 접어 둬. 오늘 제가 부른 발라드의 마음을 그렇게 기억하고 싶어요.”'),
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
        ['', '수련이 새 일정표를 펼칩니다. 카페 근무, 수업, 통학 시간을 적고 나니 같은 날의 점심시간이 비어 있습니다.'],
        ['수련', '여기, 비워 뒀어요. 우리 칸.', { face: 'playful' }],
        ['수련', '다음번에는 제가 점심 살게요. 학식 먹고 정류장까지 같이 가요. 멀리 안 가도 좋겠어요.', { face: 'smile', cam: 'lean' }],
        ['속', '“우리 칸”이라는 말이, 생각보다 오래 남았다.']
      ], [
        pick('walk', '다음 산책을 함께 준비하기', '좋아요. 그 길, 같이 준비해요.', [['수련', '그럼 다음 산책도 약속이에요. 알바 없는 날에요. 내일 점심도 보고요.', { face: 'smile' }], ['', '이야기는 한 장을 마쳤지만, 둘의 일상은 계속됩니다.', { cam: 'back' }]], { promise: true }),
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
  // Optional ballad vocal route (legacy acoustic ids retained for save compatibility): progress follows learned skills and actual outings.
  // No new save fields: completed scene/choice ids are the durable project notebook.
  const acousticProjectIds = ['acoustic-chords', 'acoustic-lyrics', 'acoustic-demo'];
  events.push(
    { id: 'acoustic-chords', title: '둘이 맞추는 첫 호흡', location: 'practice',
      hint: '연습실에서 인사한 뒤 지식 8·감수성 8을 쌓으면 첫 보컬 연습이 열려요.',
      ready: s => done(s, 'hello') && s.growth.stats.knowledge >= 8 && s.growth.stats.sensitivity >= 8,
      nodes: [scene([
        ['', '보컬 수업이 끝나고도 수련은 연습실에 남아 있습니다. 발라드 악보 위에 숨표와 가사에 힘을 줄 자리가 나란히 적혀 있습니다.', { cam: 'wide' }],
        ['수련', '과제는 끝났는데요. 이 발라드를 제 목소리에 맞게 불러 보고 싶어요. 한 번만 같이 들어 줄래요?', { face: 'shy' }],
        ['수련', '다만 숨 쉬는 자리는 제가 정해도 돼요? 음정을 신경 쓰다 보면 가사가 자꾸 급해져요.', { face: 'thoughtful' }]
      ], [
        pick('pulse', '수련이 정한 호흡에 맞춰 작게 박자 세어 주기', '먼저 불러 봐요. 거기에 맞출게요.', [['', '수련이 반주를 켜고 숨을 고릅니다. 당신은 첫 소절 앞에서 작게 박자를 세어 줍니다.'], ['수련', '이번에는 제 목소리가 들어갈 자리가 있네요.', { face: 'smile' }]], { trust: 1 }),
        pick('voicing', '반주 조성을 낮춰 편안한 음역을 함께 찾기', '반주를 한 키 낮춰서도 불러 볼까요?', [['수련', '같은 곡인데 목소리가 더 편하게 나와요. 가사도 또렷하게 들리고요.', { face: 'surprised' }], ['수련', '그런데 마지막은 제가 고를게요. 두 가지 다 녹음해 봐요.', { face: 'smile' }]], { requireStat: 'knowledge', requireValue: 12, trust: 2 })])]
    },
    { id: 'acoustic-lyrics', title: '후렴에 남길 한 문장', location: 'cafe',
      hint: '첫 보컬 연습 뒤 음악 테마 코스 1곳을 다녀오고 감수성 12를 쌓아 보세요.',
      ready: s => done(s, 'acoustic-chords') && s.growth.stats.sensitivity >= 12 && window.LunaData.dates.some(d => d.theme === 'music' && s.story.exploration?.[d.id]),
      nodes: [scene([
        ['', '카페 창가. 수련은 음악 탐방 때 적은 메모와 가사 노트를 나란히 펼칩니다.', { cam: 'wide' }],
        ['수련', '같이 걸었던 날을 생각하면서 불러 봤어요. 같은 발라드인데도 가사가 조금 다르게 느껴지더라고요.', { face: 'thoughtful' }],
        ['수련', '후렴은 고음을 내는 데만 집중하지 않고… 옆에서 말하듯 전하고 싶어요.', { face: 'shy' }]
      ], [
        pick('image', '가사에 어울리는 함께한 장면을 이야기하기', '바람 때문에 나란히 멈춰 섰던 날을 떠올리면 어때요?', [['수련', '좋아요. 그 장면을 떠올리면서 다음 소절을 불러 볼게요.', { face: 'smile' }], ['', '수련이 가사 옆에 두 사람이 떠올린 장면을 적고, 말을 건네듯 작게 불러 봅니다.']], { affection: 1 }),
        pick('space', '가사 사이에 마음을 전할 쉼표 제안하기', '말하지 않는 한 마디도 남겨 볼까요?', [['수련', '거기는 반주만 들리게 둘게요. 다음 말을 기다릴 시간도 필요하니까요.', { face: 'smile' }]], { requireStat: 'sensitivity', requireValue: 16, trust: 2 })])]
    },
    { id: 'acoustic-demo', title: '우리의 첫 발라드 데모', location: 'practice',
      hint: '후렴·신뢰 20·‘처음 남기는 연습 녹음’ 방문이 필요해요. 이 코스는 음악 탐방 4곳을 경험하면 열려요.',
      ready: s => done(s, 'acoustic-lyrics') && s.trust >= 20 && !!s.story.exploration?.['music-recording'],
      nodes: [scene([
        ['', '휴대폰 녹음기를 켜고 연습용 발라드 반주를 작게 틉니다. 수련은 반주에 목소리가 묻히지 않는 자리를 찾아 섭니다.', { cam: 'wide' }],
        ['수련', '후렴 앞에 숨 고르는 소리가 남았네요. 그래도 이번엔 가사를 놓치지 않고 끝까지 불렀어요.', { face: 'surprised' }],
        ['수련', '파일 이름은 「오늘의 소리를 접어 둬」. 제가 부른 발라드를 누구에게 들려줄지는 아직 고민이에요.', { face: 'shy' }]
      ], [
        pick('private', '오늘은 둘만 듣는 데모로 보관하기', '지금은 우리만 들어도 충분해요.', [['수련', '네. 공유하지 말고, 다음에 제가 먼저 물어볼게요.', { face: 'smile' }]], { trust: 1 }),
        pick('class', '수련이 고르면 보컬 수업에서 함께 틀기', '들려주고 싶어지면 수업에서 같이 틀어요.', [['수련', '좋아요. 먼저 하윤한테 들어 달라고 해 볼래요. 파일은 제가 보낼게요.', { face: 'smile' }]], { trust: 1 })]),
        scene([
          ['', '수련이 파일 이름 끝의 ‘최종’을 지우고 오늘 날짜를 붙입니다.'],
          ['수련', '과제는 제출하면 끝나지만, 같은 발라드도 다음에는 다른 마음으로 불러도 되네요.', { face: 'playful' }],
          ['수련', '다음에는 라이브로 들려주고 싶어요. 관객 수 말고, 끝까지 부른 걸 기억하면서요.', { face: 'shy' }]
        ], [
          pick('keep', '다음 버전도 듣고 싶다고 말하기', '다음 버전도 제일 먼저 듣고 싶어요.', [['수련', '그럼 첫 번째 청자 자리는 비워 둘게요.', { face: 'smile' }]]),
          pick('rest', '오늘은 녹음을 마치고 함께 쉬기', '오늘 녹음은 여기까지 하고 쉬어요.', [['수련', '네. 목도 좀 쉬어야겠어요. 같이 걸어요.', { face: 'smile' }]])])]
    }
  );
  function acousticProject(s) {
    return acousticProjectIds.map(id => { const event = events.find(e => e.id === id); return { id, title: event.title, complete: done(s, id), ready: !done(s, id) && event.ready(s), hint: event.hint }; });
  }
  // Optional growth stories enrich the route without blocking existing endings.
  [
    { id: 'growth-score', stat: 'knowledge', title: '가사 옆의 숨표', location: 'practice', expression: 'thoughtful', text: '수련이 보컬 노트를 펼칩니다. “같은 발라드인데 반주 조성을 바꾸면 목소리 느낌도 달라져요. 화성학 수업 내용으로 제 음역에 맞는 키를 같이 찾아볼래요?”', special: '조옮김을 짚고 수련이 편하게 부르는 음역 듣기', reply: '“설명을 듣고 나니 제가 부르고 싶은 느낌도 조금 선명해졌어요.”' },
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
    lunch: { lines: [['오늘 메뉴 보고 어제 생각났어요.', '오늘 메뉴 보고 어제 생각났어.'], ['다음 밥은 제가 사기로 한 거 기억하죠?', '다음 밥은 내가 사기로 한 거 기억하지?']], replies: [
      { id: 'a', label: '“다음 공강도 맞춰 봐요.”', say: ['다음 공강도 맞춰 봐요.', '다음 공강도 맞춰 보자.'], back: ['좋아요. 그날 수업 끝나고 식당 앞에서 봐요.', '좋아. 그날 수업 끝나고 식당 앞에서 보자.'], trust: 1 },
      { id: 'b', label: '“통학 길은 괜찮았어요?”', say: ['어제 통학 길은 괜찮았어요?', '어제 통학 길은 괜찮았어?'], back: ['네. 덕분에 여유 있게 갔어요.', '응. 덕분에 여유 있게 갔어.'] }] },
    walk: { lines: [['오늘 바람, 좋았죠.', '오늘 바람 좋았지.'], ['다음에도 그 길로 걸어요.', '다음에도 그 길로 걷자.']], replies: [
      { id: 'a', label: '“좋았어요. 또 가요.”', say: ['좋았어요. 또 가요.', '좋았어. 또 가자.'], back: ['네. 이번엔 제가 먼저 연락할게요.', '응. 이번엔 내가 먼저 연락할게.'], trust: 1 },
      { id: 'b', label: '“잘 들어갔어요?”', say: ['잘 들어갔어요?', '잘 들어갔어?'], back: ['네, 무사히요. 물어봐 줘서 고마워요.', '응, 무사히. 물어봐 줘서 고마워.'] }] },
    cafe: { lines: [['어제 잠깐 봐서 좋았어요.', '어제 잠깐 봐서 좋았어.'], ['알바 없는 날에 창가 자리 또 가요.', '알바 없는 날에 창가 자리 또 가자.']], replies: [
      { id: 'a', label: '“다음엔 제가 살게요.”', say: ['다음엔 제가 살게요.', '다음엔 내가 살게.'], back: ['그때도 음료만 마셔요. 오래 못 봐도 괜찮고요.', '그때도 음료만 마시자. 오래 못 봐도 괜찮고.'], trust: 1 },
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
    cafeteria: { morning: '식당 앞에서 점심을 기다리는 중', afternoon: '다음 수업 전에 식판을 반납하는 중', evening: '학생식당 앞에서 귀가 시간을 확인하는 중', night: '점심 약속을 떠올리는 중' },
    practice: { morning: '발라드 가사에 호흡을 표시하는 중', afternoon: '발라드 실기곡의 표현을 연습하는 중', evening: '보컬 데모를 다시 듣는 중', night: '불 꺼진 연습실을 정리하는 중' },
    cafe: { morning: '창가에서 과제를 펼쳐 둔 채', afternoon: '따뜻한 차를 식히는 중', evening: '오늘 들은 곡을 적는 중', night: '마감 직전 마지막 한 모금' },
    pier: { morning: '강바람을 맞으며 걷는 중', afternoon: '벤치에서 이어폰 한쪽을 낀 채', evening: '노을을 바라보는 중', night: '물가 가로등 아래에서 쉬는 중' },
    rooftop: { morning: '물병을 들고 바람 쐬는 중', afternoon: '난간에 기대 하늘을 보는 중', evening: '노을빛 아래 흥얼거리는 중', night: '별을 찾는 중' },
    concert: { morning: '공연 일정표를 살펴보는 중', afternoon: '로비에서 프로그램을 읽는 중', evening: '객석에 앉아 조율 소리를 듣는 중', night: '앙코르의 여운에 잠긴 채' }
  };
  // Short talk (3 turns). Each topic: name, what I say, her opener hinting it, an inner-voice hint, and reactions.
  // Every text is [polite, casual]; reactions carry a face.
  const talk = {
    music: { name: '음악', say: ['요즘 무슨 노래 들어요?', '요즘 무슨 노래 들어?'], opener: ['요즘 계속 같은 노래만 듣고 있어요. 이어폰이 뜨거워질 정도로요.', '요즘 계속 같은 노래만 듣고 있어. 이어폰이 뜨거워질 정도로.'], hint: '이어폰 줄을 계속 만지작거린다.',
      hit: [['아, 이거요! 제가 좋아하는 발라드인데요. 후렴 전에 숨을 고르는 부분이 좋아요… 들어 볼래요?', '아, 이거! 내가 좋아하는 발라드인데, 후렴 전에 숨을 고르는 부분이 좋아… 들어 볼래?'], 'playful'],
      neutral: [['음… 이것저것요. 발라드를 제일 많이 들어요. 부르는 것도 발라드가 좋아요.', '음… 이것저것. 발라드를 제일 많이 들어. 부르는 것도 발라드가 좋아.'], 'neutral'],
      miss: [['오늘은 음악 얘기는 조금 쉬고 싶어요. 하루 종일 연습했거든요.', '오늘은 음악 얘기는 좀 쉬고 싶어. 하루 종일 연습했거든.'], 'worried'] },
    class: { name: '수업', say: ['오늘 수업 어땠어요?', '오늘 수업 어땠어?'], opener: ['오늘 수업에서 교수님이 재밌는 얘길 하셨어요.', '오늘 수업에서 교수님이 재밌는 얘기 하셨어.'], hint: '가방 밖으로 수업 노트가 삐죽 나와 있다.',
      hit: [['맞다, 그 얘기 하려고 했어요! 같은 발라드도 어디서 숨을 쉬고 어떤 단어를 살리느냐에 따라 다르게 들려요.', '맞다, 그 얘기 하려고 했어! 같은 발라드도 어디서 숨을 쉬고 어떤 단어를 살리느냐에 따라 다르게 들려.'], 'smile'],
      neutral: [['평소랑 비슷했어요. 과제가 하나 늘었어요.', '평소랑 비슷했어. 과제가 하나 늘었어.'], 'neutral'],
      miss: [['수업 얘기는… 오늘 발표를 좀 망쳐서요.', '수업 얘기는… 오늘 발표를 좀 망쳐서.'], 'worried'] },
    worry: { name: '요즘 고민', say: ['무슨 고민 있어요?', '무슨 고민 있어?'], opener: ['…아, 미안해요. 잠깐 딴생각했어요.', '…아, 미안. 잠깐 딴생각했어.'], hint: '웃고 있지만 어딘가 생각이 많아 보인다.',
      hit: [['…티 났어요? 사실, 제가 부른 발라드를 다른 사람한테 들려줘도 될지 계속 고민 중이에요.', '…티 났어? 사실, 내가 부른 발라드를 다른 사람한테 들려줘도 될지 계속 고민 중이야.'], 'thoughtful'],
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
  // Sulien drops by during a shift: [title, [polite, casual], face]. Picked by day, so it never repeats twice running.
  const workScenes = {
    cafe: [
      { title: '교대 전 짧은 인사', line: ['오늘 네 시간 근무죠? 저 먼저 갈게요. 끝나면 버스 놓치지 말고요. 내일 점심에 봐요.', '오늘 네 시간 근무지? 나 먼저 갈게. 끝나면 버스 놓치지 말고. 내일 점심에 보자.'], face: 'smile' },
      { title: '카운터 앞에서', line: ['라테 한 잔 부탁드려요. …주문할 때만 존댓말하는 거 어색하네요. 쉬는 시간 아니면 먼저 갈게요. 일 끝나고 연락해요.', '라테 한 잔 부탁드려요. …주문할 때만 이러니까 어색하다. 쉬는 시간 아니면 나 먼저 갈게. 일 끝나고 연락해.'], face: 'playful' }
    ],
    edit: [
      { title: '납품 전 메시지', line: ['수정본 보내는 날이죠? 제 메시지는 나중에 봐도 돼요. 납품 끝나면 밥부터 챙겨 먹어요.', '수정본 보내는 날이지? 내 메시지는 나중에 봐도 돼. 납품 끝나면 밥부터 챙겨 먹어.'], face: 'smile' },
      { title: '렌더링을 기다리며', line: ['내보내는 동안은 좀 쉬어요. 오늘은 따로 안 만나도 괜찮아요. 다음에 점심 같이 먹으면 되죠.', '내보내는 동안은 좀 쉬어. 오늘은 따로 안 만나도 괜찮아. 다음에 점심 같이 먹으면 되지.'], face: 'thoughtful' }
    ],
    event: [
      { title: '안내 데스크의 인사', line: ['보러 왔다가 얼굴만 보고 가요. 근무 중이니까 길게 안 붙잡을게요. 끝나고는 바로 들어가서 쉬어요.', '보러 왔다가 얼굴만 보고 가. 근무 중이니까 길게 안 붙잡을게. 끝나고는 바로 들어가서 쉬어.'], face: 'smile' },
      { title: '긴 근무 끝의 메시지', line: ['오늘 여덟 시간이었죠. 데이트는 다른 날 해요. 집 도착하면 연락만 줘요.', '오늘 여덟 시간이었지. 데이트는 다른 날 하자. 집 도착하면 연락만 줘.'], face: 'thoughtful' }
    ]
  };
  // How close the friendship has grown, in words instead of a percentage (a quieter SOME SOME app).
  const heartStages = [
    { name: '편한 친구', note: '아직은 과제 이야기로 시작해 수업 이야기로 끝나는 사이예요.' },
    { name: '신경 쓰이는 사이', note: '함께 걸은 길이 늘면서, 수련이 먼저 연락하는 날이 생겼어요.' },
    { name: '썸', note: '서로의 결정을 존중하는 법을 알았어요. 말하지 않아도 같이 있는 시간이 편해졌어요.' },
    { name: '고백 직전', note: '수련이 무언가 말하려다 삼키는 순간이 많아졌어요. 조금만 더 함께하면 돼요.' }
  ];
  function heart(s) {
    const r = s.story.relationship;
    if (r === 'lovers') return { index: 4, final: true, name: '연인', note: '친구라는 말 다음의 대답을 함께 골랐어요.' };
    if (r === 'friends') return { index: 4, final: true, name: '소중한 친구', note: '서로를 가장 잘 아는 친구로 남기로 했어요.' };
    if (r === 'considering') return { index: 3, name: '대답을 기다리는 사이', note: '수련은 서두르지 않고 당신의 대답을 기다리고 있어요.' };
    const index = done(s, 'session') ? 3 : done(s, 'boundary') ? 2 : done(s, 'score') ? 1 : 0;
    return { index, ...heartStages[index] };
  }
  // Stickers she sends after your reply: one per message kind.
  const stickers = { lunch: ['🍚', '다음 공강에'], walk: ['🌙', '또 걷자'], cafe: ['☕', '다음은 디저트'], concert: ['🎤', '앵콜'], checkin: ['🍀', '힘내'], course: ['📒', '메모 완료'] };
  const sticker = key => stickers[key] || stickers.course;
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
    heart: arg => ({ 1: '야, 수련 요즘 너 얘기 은근 많이 한다? 같이 간 데 얘기할 때 표정이 달라.', 2: '너네 둘… 요즘 좀 썸 같던데? 수련한테 물어봤더니 아니라는데 귀가 빨개지더라 ㅋㅋ', 3: '수련이 나한테 "고백은 어떻게 하는 거야?" 이러던데. 모르는 척해 줄게. 너도 마음 정해 둬.' })[arg] || '요즘 수련이랑 잘 지내?',
    stat: arg => ({ fitness: '수련이 요즘 강가 산책 코스 얘기를 자주 하던데, 같이 걸으려면 체력 좀 길러 둬 ㅋㅋ', knowledge: '수련이 발라드 실기곡을 자기 음역에 맞추고 싶대. 화성학 복습해 두면 같이 얘기하기 좋을걸.', sensitivity: '수련은 발라드 얘기 할 때 제일 신나 보여. 가사랑 보컬 표현 얘기도 해 봐.' })[arg] || '요즘 수련이랑 잘 지내?'
  };
  const noticeText = {
    practice: () => '[동네 연습실] 이번 주 대관이 열렸어요. 평일 저녁은 빨리 마감돼요.',
    exam: arg => `[실용음악과 공지] ${arg} 주간입니다. 보컬 실기 평가 곡과 연습실 예약을 확인해 주세요.`,
    festival: arg => `[총학생회] ${arg}가 시작됐어요! 학생회관 앞 공연은 저녁 7시부터.`,
    break: arg => `[학과 공지] ${arg}이 시작됐어요. 연습실 이용 시간이 늘어나요.`,
    start: arg => `[실용음악과 공지] ${arg}입니다. 화성학·보컬 앙상블·보컬 실기 시간표를 확인해 주세요.`
  };
  function pickFriend(before, after) {
    const D = window.LunaData, cal = D.calendar(after.day), soon = D.calendar(after.day + 2);
    if (!done(after, 'hello')) return null;
    const sent = (key, arg) => (after.story.msgLog || []).some(m => m.from === 'friend' && m.key === key && m.arg === arg);
    if (soon.birthday) return { day: after.day, from: 'friend', key: 'birthday', arg: `${soon.month}월 ${soon.date}일` };
    const h = heart(after).index;
    // Tracked in story.heartHint, not the 60-message log, so an old hint never comes back after scrolling out.
    if (h >= 1 && h <= 3 && h > (after.story.heartHint || 0)) return { day: after.day, from: 'friend', key: 'heart', arg: String(h) };
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
    if ([r.lastMet, r.giftDay, r.workMet].some(v => v !== undefined && (!integer(v) || v < 1 || v > state.day))) return null;
    if (r.msgLog !== undefined && (!Array.isArray(r.msgLog) || r.msgLog.length > 60 || !r.msgLog.every(m => m && integer(m.day) && m.day >= 1 && m.day <= state.day && (m.arg === undefined || (typeof m.arg === 'string' && m.arg.length <= 60)) && (m.from === 'sulien' ? Object.hasOwn(messages, m.key) && [null, 'a', 'b', undefined].includes(m.reply) : m.from === 'friend' ? Object.hasOwn(friendText, m.key) : m.from === 'notice' && Object.hasOwn(noticeText, m.key))))) return null;
    if (r.seen !== undefined && (!integer(r.seen) || r.seen > (r.msgLog || []).length)) return null;
    if (r.birthdays !== undefined && (!Array.isArray(r.birthdays) || r.birthdays.length > 50 || !r.birthdays.every(y => integer(y, 3000)))) return null;
    if (r.heartHint !== undefined && !integer(r.heartHint, 3)) return null;
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
  window.LunaStory = { acousticProject, workScenes, heart, heartStages, sticker, storyGap, rested, intro, dates, events, fresh, script, available, stage, validate, done, messages, pickMessage, messageText, speechIndex, giftLines, reunionLines, touchLines, doing, moodLabel, bondLevel, talk, talkClose, friendText, noticeText, pickFriend, pickNotice, logText, birthdayLines, birthdayGreeting };
})();
