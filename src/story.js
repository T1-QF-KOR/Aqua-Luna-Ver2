/* Original Aqua Luna scenes. Events follow shared experiences, never real-world time. */
(() => {
  'use strict';
  const choice = (id, label, reply, effect = {}) => ({ id, label, reply, ...effect });
  const node = (text, choices) => ({ text, choices });
  const dates = {
    walk: [
      node('강가의 바람에 수련이 헤드폰을 목으로 내립니다. “오늘은 멀리 가지 않아도 괜찮아요. 어디부터 걸을까요?”', [
        choice('quiet', '물가에서 잠깐 쉬었다 걷기', '“좋아요. 말을 쉬어도 어색하지 않은 시간이 필요했어요.”', { preference: 'quiet' }),
        choice('share', '서로의 하루를 나누며 걷기', '“그럼 오늘 좋았던 일 하나씩만 말해요. 저는… 지금 바람이 좋아요.”', { preference: 'share', affection: 1 })]),
      node('수련이 난간 위에 손을 얹습니다. “연습할 때는 한 소절을 몇 번씩 되돌아가요. 밖에서는 그냥 앞으로 걸을 수 있어서 좋네요.”', [
        choice('listen', '오늘은 돌아가지 않아도 된다고 말하기', '“네. 오늘만큼은 틀린 길 같은 건 없었으면 해요.”'),
        choice('ask', '내가 옆에서 해 줄 수 있는 일을 묻기', '“답을 찾아 주지 않아도 돼요. 조금만 같이 걸어 주세요.”', { trust: 1 })])
    ],
    cafe: [
      node('창가에는 햇빛이, 안쪽 자리에는 낮은 음악이 머뭅니다. 수련이 빈 의자를 가리킵니다. “오늘은 어디가 좋으세요?”', [
        choice('quiet', '안쪽에 앉아 잠시 숨 돌리기', '“여긴 잔 내려놓는 소리도 작네요. 마음이 조금 놓여요.”', { preference: 'quiet' }),
        choice('share', '창가에서 오늘의 작은 일을 이야기하기', '“그럼 저도 하나 말할게요. 오늘 연습에서 처음으로 마음에 든 부분이 있었어요.”', { preference: 'share', affection: 1 })]),
      node('잔을 돌리던 수련이 묻습니다. “좋아하는 일을 계속하면 늘 행복해야 하는 걸까요?” 음악은 계속되지만 그녀는 대답을 서두르지 않습니다.', [
        choice('listen', '좋아해도 힘든 날은 있다고 말하기', '“그 말을 듣고 싶었나 봐요. 오늘이 힘들었다고, 전부 싫어진 건 아니니까요.”'),
        choice('share', '나도 버거웠던 하루를 솔직히 나누기', '“잘해 보이고 싶어서 말을 아꼈는데… 저만 그런 건 아니었네요.”', { affection: 1 })])
    ],
    concert: [
      node('공연장 문이 열리자 수련이 표를 반으로 접습니다. “첼로 소리는 사람이 숨 쉬는 것 같아서 좋아요. 오늘은 끝까지 들어 보고 싶어요.”', [
        choice('quiet', '감상을 서두르지 않고 함께 듣기', '“끝나고 아무 말도 떠오르지 않아도 괜찮아요. 같이 들었다는 건 남으니까요.”', { preference: 'quiet' }),
        choice('share', '끝나고 기억에 남은 한 소절을 나누자고 하기', '“좋아요. 같은 곳일지, 다른 곳일지 궁금하네요.”', { preference: 'share', affection: 1 })]),
      node('박수가 잦아든 뒤에도 수련은 잠시 앉아 있습니다. “마지막 음이 끝나는 걸 기다리는 사람도 무대의 일부 같아요.”', [
        choice('listen', '수련이 일어날 때까지 옆에 있기', '“기다려 줘서 고마워요. 이제 나가도 될 것 같아요.”'),
        choice('ask', '언젠가 수련의 노래도 이렇게 듣고 싶다고 말하기', '“멋지게 부르겠다는 약속은 못 해요. 그래도… 듣고 싶은 사람이 있다는 건 좋네요.”', { trust: 1 })])
    ]
  };
  const farewell = node('헤어지기 전, 수련이 걸음을 늦춥니다. “다음에는 어떻게 만날까요?”', [
    choice('open', '서로 여유 있을 때 다시 이야기하기', '“좋아요. 빈 시간부터 같이 찾아요.”'),
    choice('promise', '다음 외출은 무료 부두 산책으로 약속하기', '“기억할게요. 다음번엔 제가 먼저 물가 쪽으로 걸어갈게요.”', { promise: true })]);
  Object.values(dates).forEach(nodes => nodes.push(farewell));
  const events = [
    { id: 'hello', title: '친구가 기다리는 연습실', location: 'practice', hint: '연습실에서 기다리는 친구 수련을 만나 보세요.', ready: () => true, nodes: [
      node('아직 수련이 어떤 엔터테인먼트에도 들어가지 않았던 시절. 빌린 동네 연습실의 문이 반쯤 열려 있습니다. 당신을 발견한 오랜 친구 수련이 반주를 멈춥니다. “왔네요. 오늘도 같은 데서 막혔어요.” 늘 두던 옆자리에 종이컵 하나가 놓입니다.', [
        choice('listen', '지금은 듣고 있어도 될까요?', '“네. 아직 중간에 자주 멈추는데… 괜찮으시면요.” 빈 의자에 앉자 반주가 다시 시작됩니다.'),
        choice('plan', '연습 끝나고 같이 걸을 시간을 정할까요?', '“좋아요. 끝나는 시간도 같이 적어요.” 수련이 악보 옆의 개인 수첩과 펜을 내밉니다.')]) ] },
    { id: 'space', title: '비어 있는 한 칸', location: 'rooftop', hint: '연습실에서 대화한 뒤 일하기 또는 휴식을 경험해 보세요.', ready: s => done(s, 'hello') && s.journal.some(j => ['work','rest'].includes(j.type)), nodes: [
      node('옥상에 나온 수련이 물병을 건넵니다. “일정표에 빈칸이 있길래요. 실수로 빼먹은 건 아니죠?” 그녀도 잠시 난간에 등을 기댑니다.', [
        choice('rest', '그 시간에는 아무것도 안 해도 되죠', '“그럼 오늘은 비워 둬요. 다음에 뭘 하고 싶은지 생각할 자리도 필요하니까요.”'),
        choice('walk', '시간이 맞으면 강가에 같이 가요', '“멀리 가지 않아도 좋겠어요. 여기서부터 걸어가는 길도 괜찮고요.”')]) ] },
    { id: 'invite', title: '두 번 적힌 약속', location: 'pier', hint: '연습실 대화와 첫 외출을 마치면 수련이 먼저 말을 걸어요.', ready: s => done(s, 'hello') && s.story.dateCount >= 1, nodes: [
      node('수련이 개인 수첩을 펼칩니다. 연습 메모 옆의 빈 여백에 작은 물결이 그려져 있습니다. “지난번처럼 걸을까요? 이번에는 제가 먼저 물어보고 싶었어요.”', [
        choice('yes', '다음 외출을 부두에서 함께하기', '“그럼 물가 쪽 길은 제가 안내할게요. 비용 들이는 약속은 아니에요.”', { promise: true }),
        choice('later', '지금은 여유가 없지만 다음에 다시 이야기하기', '“알려 줘서 고마워요. 가능한 날에 말해 주세요. 기다리는 숙제로 만들지는 않을게요.”')]) ] },
    { id: 'score', title: '접힌 악보', location: 'practice', hint: '수련의 제안을 확인하고 데이트 3회·신뢰 12를 쌓아 보세요.', ready: s => done(s, 'invite') && s.story.dateCount >= 3 && s.trust >= 12, nodes: [
      node('악보의 접힌 귀퉁이를 수련이 펴고 또 접습니다. “예고 성악과에 들어갔을 때는 이 길을 계속 갈 줄 알았어요. 집안 사정으로 클래식 진로를 접었는데, 이 악보를 펴면 그때의 저를 흉내 내야 할 것 같아요.” 아직 어느 엔터테인먼트에도 속하지 않은 수련이 오랜 친구 앞에 악보를 내려놓습니다.', [
        choice('listen', '지금 부르면 어떤 느낌일지 묻기', '“아직 모르겠어요. 그걸 모르는 채로 시작해도 괜찮을까요?”', { music: 'now' }),
        choice('new', '다른 곡을 고를 수도 있다고 말하기', '“버리는 게 아니라 고르는 거겠죠. 이번엔 제가 정해 보고 싶어요.”', { music: 'new' })]),
      node('수련이 악보를 가방 밖에 둡니다. “작은 세션을 열어 볼까 해요. 누구에게 증명하려는 건지부터 생각해 볼게요.”', [
        choice('wait', '곡을 정할 때까지 기다리기', '“정해지면 가장 먼저 들려드릴게요. 대신, 조금 오래 걸려도 괜찮아요?”'),
        choice('help', '필요한 준비가 생기면 알려 달라고 하기', '“의자 몇 개면 될 것 같아요. 큰 무대로 만들지 않아도 괜찮아요.”')]) ] },
    { id: 'boundary', title: '아직 정하지 않은 일', location: 'practice', hint: '접힌 악보 이야기를 나눈 뒤 데이트를 4회 마쳐 보세요.', ready: s => done(s, 'score') && s.story.dateCount >= 4, nodes: [
      node('연락을 마친 수련이 휴대폰을 뒤집습니다. “예전 선생님이 세션 이야기를 들으셨어요. 반갑지만… 벌써 기대에 맞춰 부르고 있는 것 같아요.”', [
        choice('ask', '누구에게 들려주고 싶은지 먼저 묻기', '“지금의 제 노래를 듣고 싶은 사람에게요. 선생님께도 제가 직접 말씀드릴게요.”', { boundary: 'clear' }),
        choice('decide', '부담 없게 내가 대신 거절해 줄게요', '“도와주려는 건 알아요. 그래도 제 대답을 먼저 듣고 움직여 주셨으면 해요.” 수련은 악보를 닫지 않습니다. 다시 이야기할 여지는 남아 있습니다.', { boundary: 'repair' })]) ] },
    { id: 'repair', title: '대답을 기다리는 연습', location: 'rooftop', hint: '수련에게 결정권을 돌려주는 대화를 할 수 있어요.', ready: s => done(s, 'boundary') && s.story.boundary === 'repair', nodes: [
      node('수련은 옥상 문을 열어 둡니다. “멀어지고 싶어서 한 말은 아니었어요. 가까운 사람에게도 제가 고를 자리는 필요해서요.”', [
        choice('sorry', '먼저 정하려 해서 미안해요. 무엇을 원해요?', '“선생님께 제가 연락하고 싶어요. 옆에 있어 주는 건, 그 다음에 부탁할게요.”', { boundary: 'clear' }),
        choice('honest', '돕고 싶어 서둘렀어요. 다음엔 먼저 물을게요', '“그 말이면 돼요. 저도 필요한 걸 더 분명히 말해 볼게요.”', { boundary: 'clear' })]) ] },
    { id: 'session', title: '다시 부르는 이유', location: 'practice', hint: '서로의 결정권을 확인하고 데이트 5회·신뢰 20을 쌓아 보세요.', ready: s => done(s, 'boundary') && s.story.boundary === 'clear' && s.story.dateCount >= 5 && s.trust >= 20, nodes: [
      node('연습실에는 의자 몇 개만 놓여 있습니다. 수련이 직접 고른 악보를 펼칩니다. “완벽해진 다음에 부르려고 했는데, 그러면 계속 미루게 될 것 같아요.”', [
        choice('listen', '관객석에서 끝까지 듣기', '마지막 숨이 끝난 뒤에야 손뼉을 칩니다. “기다려 주니까, 끝까지 제 노래처럼 부를 수 있었어요.”'),
        choice('support', '준비할 것이 있는지 묻고 자리에 앉기', '“물 한 잔이면 돼요. 이제는 듣는 사람이 되어 주세요.” 수련은 자기 손으로 반주를 시작합니다.')]),
      node('수련이 악보를 접지 않고 책상 위에 펼쳐 둡니다. “잘 불렀는지는 나중에 생각하려고요. 오늘은 제가 부르고 싶어서 불렀다는 걸 기억할래요.”', [
        choice('memory', '오늘의 순간을 함께 기억하자고 하기', '“그럼 제목은 제가 정할게요. 다시 부르는 이유. 오늘은 그 정도면 충분해요.”'),
        choice('joy', '마지막에 웃는 모습이 좋았다고 말하기', '“저, 웃었어요? 그건 계획에 없었는데.” 수련이 이번에는 숨기지 않고 웃습니다.')]) ] },
    { id: 'confession', title: '친구라는 말 다음에', location: 'pier', hint: '작은 세션 이후 데이트 6회·호감 18·신뢰 24를 쌓아 보세요.', ready: s => done(s, 'session') && s.story.dateCount >= 6 && s.affection >= 18 && s.trust >= 24, nodes: [
      node('수련이 연습 수첩을 가방에 넣습니다. “친구니까 편한 거라고 생각했어요. 그런데 헤어질 때마다 조금 더 같이 있고 싶어요. 익숙해서가 아니라… 당신이어서요.” 강가를 지나는 사람들의 발소리가 잠시 멀어집니다.', [
        choice('romance', '나도 그래요. 연인으로 만나고 싶어요', '“좋아요. 오래된 친구여도 새로 물어볼 일은 많겠죠. 서로의 꿈을 대신 정하지 않고, 천천히 알아가요.”', { relationship: 'lovers' }),
        choice('friend', '소중한 친구로 곁에 있고 싶어요', '“솔직하게 말해 줘서 고마워요. 우리 시간이 덜 소중해지는 건 아니에요.”', { relationship: 'friends' }),
        choice('later', '소중해서 조금 더 생각하고 싶어요', '“알겠어요. 오늘 답을 해야 하는 건 아니에요. 조금 더 같이 지낸 뒤 다시 이야기해요.”', { relationship: 'considering' })]) ] },
    { id: 'revisit', title: '천천히 찾은 대답', location: 'pier', hint: '마음을 보류했다면 데이트를 두 번 더 한 뒤 다시 이야기할 수 있어요.', ready: s => s.story.relationship === 'considering' && s.story.dateCount >= s.story.considerAt + 2, nodes: [
      node('수련이 당신과 같은 속도로 걷습니다. “기다리면서 혼자 결론을 내리지는 않았어요. 지금은 어떤 마음인지 듣고 싶어요.”', [
        choice('romance', '연인으로 다음 하루를 함께하고 싶어요', '“저도요. 기다리는 동안 함께한 시간까지 우리 시작으로 기억해요.”', { relationship: 'lovers' }),
        choice('friend', '오래 함께할 친구가 되고 싶어요', '“좋아요. 답을 맞추려고 하지 않아 줘서 고마워요.”', { relationship: 'friends' })]) ] },
    { id: 'epilogue', title: '너와 나란한 하루', location: 'rooftop', hint: '관계를 정한 뒤 한 번 더 데이트하면 후일담이 열려요.', ready: s => ['lovers','friends'].includes(s.story.relationship) && s.story.dateCount > s.story.commitAt, nodes: [
      node('수련이 새 일정표를 펼칩니다. 큰 계획보다 둘이 비워 둔 한 칸이 먼저 눈에 들어옵니다. “다음번에는 제가 코스를 골라도 돼요? 늘 걷던 길에서 조금만 돌아가 봐요.”', [
        choice('walk', '다음 산책을 함께 준비하기', '“그럼 약속이에요. 특별한 날이 아니어도 같이 걸어요.” 이야기는 한 장을 마쳤지만, 둘의 일상은 계속됩니다.', { promise: true }),
        choice('quiet', '오늘은 여기서 조용히 함께 있기', '“네. 매번 새로운 걸 하지 않아도 좋네요.” 나란히 앉은 두 사람의 그림자가 조금씩 길어집니다. 내일도 선택할 하루가 남아 있습니다.')]) ] }
  ];
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
    const snapshot = a => a && integer(a.day) && a.day >= 1 && a.day <= state.day && state.owned.includes(a.outfit) && state.ownedAccessories.includes(a.legwear) && (a.outfit === 'skirt' || a.legwear === 'none') && window.LunaData.times.some(t => t.id === a.time);
    if (r.active !== null) {
      const a = r.active;
      if (!a || !['date','event'].includes(a.kind) || !snapshot(a) || !validChoices(a.kind,a.id,a.choices) || a.choices.length >= script(a.kind,a.id).length || a.day !== state.day || a.outfit !== state.outfit || a.legwear !== state.legwear || (a.kind === 'event' && r.completed.some(e=>e.id===a.id)) || (a.kind === 'date' && state.datesToday[0] !== a.id)) return null;
    }
    if (r.last !== null && (!r.last || !['date','event'].includes(r.last.kind) || !validChoices(r.last.kind,r.last.id,r.last.choices) || r.last.choices.length !== script(r.last.kind,r.last.id).length || !snapshot(r.last) || !integer(r.last.affection,12) || !integer(r.last.trust,10))) return null;
    const exploration = window.LunaCourses ? window.LunaCourses.validate(r.exploration,state,r.dateCount) : {};
    if (!exploration) return null;
    const activities=window.LunaActivities?window.LunaActivities.validate(r.activities,{...state,story:{...r,exploration}}):undefined;
    if(window.LunaActivities&&!activities)return null;
    return JSON.parse(JSON.stringify({...r,exploration,...(activities?{activities}:{})}));
  }
  window.LunaStory = { dates, events, fresh, script, available, stage, validate, done };
})();
