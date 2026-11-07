/* Authored first-semester route scenes, adapted from GDD/시나리오. */
(function (root) {
  'use strict';
  const scenes = root.AQUA_SCENES;
  const n = (text, cast = []) => ({ text, cast });
  const say = (speaker, text, cast) => ({ speaker, text, cast: cast || [{ 나리: 'nari', 다은: 'daeun', 서진: 'seojin' }[speaker]].filter(Boolean) });

  Object.assign(scenes, {
    crossRain: { title: '비 오는 카페의 셋', background: 'cafe', lines: [
      n('장대비였다. 손님은 하나도 없었다. 서진이 창밖을 보며 컵을 닦았다.', ['seojin']),
      say('다은', '으아아 비! 야! 너 여기서 일하는구나! 대박! 피신!', ['seojin', 'daeun']),
      say('서진', '손님, 젖은 우산은 문 옆에. 바닥까지 뛰어오게 하진 말고.', ['seojin', 'daeun']),
      say('다은', '아 죄송해요! 근데 언니 진짜 키 크다. 얘가 맨날 컵 깨면 혼난다고—', ['seojin', 'daeun']),
      say('서진', '알바생, 아는 사람?', ['seojin', 'daeun']),
      say('나', '같은 과. 다은이.', ['seojin', 'daeun']),
      n('서진이 말없이 수건을 꺼내 다은에게 던졌다. 그리고 따뜻한 물 한 잔을 놓았다.', ['seojin', 'daeun']),
      say('서진', '비 그칠 때까지 있어. 주문은 안 해도 돼.', ['seojin', 'daeun']),
      n('마감 시간이 다가왔다. 우산꽂이에는 비닐우산 하나뿐이었다.', ['seojin', 'daeun']),
      { choice: [
        { label: '다은에게 우산을 빌려준다', effect: { flag: 'umbrellaDaeun', bond: { daeun: 5, seojin: 1 } }, lines: [say('다은', '진짜? 너는? 아 몰라 내일 갖다줄게! 1순위로!', ['seojin', 'daeun']), say('서진', '남의 우산은 멋있게 챙겼네. 넌 나랑 가. 차 가져왔어.')] },
        { label: '서진과 마감하고, 다은은 사장님 우산을 빌려 보낸다', effect: { bond: { seojin: 4, daeun: 2 } }, lines: [say('다은', '오 사장님 우산 트로트 가수 사진 있어ㅋㅋ 고맙습니다!', ['seojin', 'daeun']), n('서진과 둘이 의자를 올렸다. 카페 음악이 조금 느려졌다.', ['seojin']), say('서진', '말은 빠른데 고맙다는 건 안 빼먹네. 괜찮은 친구 뒀다.')] },
        { label: '함께 앉아 비가 그치기를 기다린다', effect: { bond: { seojin: 2, daeun: 2 } }, lines: [n('다은이 떠들고, 서진이 짧게 대꾸하고, 나는 웃었다. 비는 열한 시에 그쳤다.', ['seojin', 'daeun'])] }
      ] }
    ] },
    festival: { title: '봄 대동제', background: 'concert', lines: [
      n('봄 대동제 둘째 날. 야외 무대 앞에 사람이 빽빽했다. 한여울 밴드 차례였다.'),
      { text: '드럼 자리에 다은이 앉아 있었다. 객석의 나를 찾아 스틱을 한 번 흔들었다.', effect: { flag: 'daeunJoinedBand' } },
      n('세 곡이 끝나자 꽃다발을 든 남학생이 무대 앞으로 걸어 나왔다. “한나리 선배! 좋아합니다!”'),
      n('환호와 카메라 수십 대. 나리는 완벽한 무대 웃음으로 꽃을 받았다. 대답은 하지 않았다.'),
      n('조명이 꺼지고 사람들이 흩어졌다. 다은에게서는 뒤풀이에 오라는 메시지가 왔다.'),
      { text: '서진에게서도 연락이 왔다. 「알바생. 축제라 손님 많아. 도와줄 수 있어? 네 일정 먼저 보고 답 줘.」', when: { met: 'seojin' } },
      n('무대 뒤 계단 쪽은 어두웠다. 한 곳에만 갈 수 있었다.'),
      { choice: [
        { label: '무대 뒤 계단으로 간다', effect: { bond: { nari: 6 }, card: '시드는 꽃다발', flag: 'festivalNari' }, lines: [say('나리', '…왔네. 너 올 줄 알았어. 아니, 몰랐는데, 오면 좋겠다고 생각했어.'), say('나리', '꽃 싫은 거 아니야. 예뻐. 근데 집에 가서 시드는 걸 보면, 내가 받은 박수가 시드는 것 같아서.'), say('나리', '하나만 가져가. 그럼 다 시드는 거 안 봐도 되니까.'), n('나리가 꽃다발에서 한 송이를 빼 내게 내밀었다.', ['nari'])] },
        { label: '다은의 뒤풀이에 간다', effect: { bond: { daeun: 6 }, flag: 'festivalDaeun' }, lines: [say('다은', '왔다!! 내 첫 무대 봤지? 봤지? …근데 다들 나리 언니 얘기만 하더라. 나 맨 뒤라서 안 보였을걸.'), say('나', '보였어. 스틱 흔든 거.', ['daeun']), say('다은', '…봤어? 그거 너한테 한 건데.')] },
        { label: '서진이 혼자 일하는 카페로 간다', when: { met: 'seojin' }, effect: { bond: { seojin: 6 }, flag: 'festivalSeojin' }, lines: [say('서진', '축제 대신 이쪽을 골랐네. 정말 도와주러 온 거야?'), say('나', '누나 혼자잖아.', ['seojin']), say('서진', '일당은 이모한테 받아. 난 마감 뒤에 한 곡 골라 줄게.'), n('마감 뒤 서진이 플레이리스트에서 한 곡을 뺐다가 다시 넣었다. 내가 좋다고 했던 곡이었다.', ['seojin'])] }
      ] }
    ] },
    nariVolume: { title: '마이크를 끄고', background: 'practice', lines: [
      n('앰프 전원을 끄자 동아리방이 갑자기 넓어졌다. 나리는 케이블을 감고 있었다.', ['nari']),
      say('나리', '끝났으면… 저기, 문 좀.'), say('나', '닫아?', ['nari']),
      say('나리', '아니, 잡아 달라고. 기타 들고 나가려고.'),
      n('무대 위에서는 맨 뒤까지 들리던 말이, 지금은 세 걸음도 못 왔다.', ['nari']),
      say('나리', '평소에도 크게 말하려고 하면 공연하는 것 같아서 이상해. 그래서 그냥 작게 말해. 아니면 안 하고.'),
      { choice: [
        { label: '문을 잡고 조금 가까이 선다. “여기서는 들려.”', effect: { bond: { nari: 4 }, flag: 'nariQuietVoice' }, lines: [say('나리', '…응. 그 정도면 돼.'), n('이번에는 문밖에서도 그녀의 “고마워”가 들렸다.', ['nari'])] },
        { label: '“천천히 말해도 돼. 나 아직 안 가.”', effect: { bond: { nari: 3 } }, lines: [say('나리', '나도 아직 안 가. 가방 안 챙겼어.'), n('그 말이 웃겨서 둘 다 웃었다. 아까보다 조금 큰 목소리였다.', ['nari'])] }
      ] }
    ] },
    nariHabit: { title: '같은 말버릇', background: 'practice', lines: [
      n('합주가 엉망이었다. 태오 선배가 템포를 세 번 바꿨고, 나리는 2절 가사를 통째로 까먹었다.'),
      n('다들 말없이 짐을 쌌다. 나리가 마이크 스탠드를 접으며 말했다.', ['nari']),
      say('나리', '망한 날에도 하루는 끝나. 오늘은 그냥 끝내.'),
      n('목요일 밤 열한 시의 마지막 문장이었다. 토씨 하나 다르지 않았다.', ['nari']),
      say('나', '그거, 라디오—', ['nari']), say('나리', '응? 아, 그거. 흔한 말이잖아. 다들 써.'),
      say('나리', '나 먼저 간다. 문 잠가 줘.'),
      { text: '빠르게 나간 그녀의 기타 케이스가 계단 벽에 한 번 부딪혔다.', effect: { clue: 'sameHabit' } },
      { choice: [
        { label: '흔한 말이라고 넘긴다', effect: { bond: { nari: 2 } }, lines: [n('흔한 말이었다. 아마도.')] },
        { label: '지난 방송의 마지막 문장을 다시 듣는다', effect: { anonymous: 1, clue: 'sameBreath' }, lines: [n('“오늘은 그냥 끝내요.” 같은 문장. 같은 숨. 무대 위의 나리와는 다른데, 아까 동아리방에서 들은 작은 목소리와는 닮아 있었다.')] }
      ] }
    ] },
    nariLyrics: { title: '첫 줄에서 막힌 가사', background: 'rooftop', lines: [
      n('옥상 정원. 나리가 노트에 뭔가 적었다 지웠다 했다. 지운 자국이 세 겹이었다.', ['nari']),
      say('나리', '축제 때 자작곡 하나 하고 싶은데 첫 줄을 못 쓰겠어. 쓰면 다 남의 말 같아.'),
      say('나', '뭐 쓰고 싶은데?', ['nari']),
      say('나리', '고등학생 때 라디오에 이 고민 보냈거든. 그때 디제이가 그랬어. 남의 말 같으면 남한테 못 한 말부터 써 보라고.'),
      say('나리', '무대에서 내려오는 계단. 거기서 떨리는 거. 근데 그걸 쓰면 다들 알잖아.'),
      { choice: [
        { label: '“알아도 돼. 그게 네 노래면.”', requires: { knowledge: 15 }, reason: '지식 15 이상', effect: { bond: { nari: 6 }, card: '계단은 무대보다 높다', keptIf: 'knowsPick' }, lines: [n('나리가 피크를 놓고 한 줄을 적었다. ‘계단은 무대보다 높다’.', ['nari']), say('나리', '어? 이거다. 이거야!')] },
        { label: '같이 흥얼거려 본다', effect: { bond: { nari: 4 }, keptIf: 'knowsPick' }, lines: [n('아무 말이나 멜로디에 얹어 봤다. 대부분 엉망이었다. 나리가 배를 잡고 웃었다.', ['nari']), say('나리', '아 진짜, 너 가사 재능은 없다. …근데 멜로디는 좋아.') ] },
        { label: '“그 디제이, 작년 루나지? 너 피크로 보냈다며.”', when: { flag: 'knowsPick' }, effect: { flag: 'usedAnonymousWords' }, lines: [n('나리가 노트를 덮었다. 소리가 컸다.', ['nari']), say('나리', '그거 익명이라서 보낸 거야. 이름 붙이면 다 무거워져.'), n('그날 첫 줄은 나오지 않았다.')] }
      ] }
    ] },
    nariDemo: { title: '삭제하지 않은 파일', background: 'practice', lines: [
      n('연습실 문이 열렸다. 나리가 휴대폰을 들고 서 있었다.', ['nari']),
      say('나리', '여기 있을 줄 알았어. 너 맨날 여기 있대. 다은이가.'),
      n('녹음 목록에는 ‘새로운 녹음 37’. 길이는 18초였다. 마지막 음이 숨으로 흩어졌다.', ['nari']),
      say('나리', '별로면 지워도 돼. 아니, 내가 지울게. …대신 너 거 하나 들려줘. 공평하게.'),
      { choice: [
        { label: '내 휴대폰의 가사 없는 멜로디를 들려준다', effect: { bond: { nari: 5 }, flag: 'nariHeardMelody' }, lines: [n('바닷가 방파제에서 녹음한 멜로디를 틀었다. 파도 소리와 서툰 피아노가 겹쳤다.', ['nari']), say('나리', '…바다다. 이것도 끝이 질문이네. 너 원래 그래? 대답을 안 붙여?'), n('그녀는 자기 파일을 지우지 않았다. 대신 이름을 바꿨다.', ['nari'])] },
        { label: '“끝의 숨소리가 좋아. 다음 말을 기다리게 돼.”', effect: { bond: { nari: 4 } }, lines: [say('나리', '그건 노래가 아닌데.'), say('나', '그래도 네가 들려준 거잖아.', ['nari']), n('파일 이름이 ‘끝을 기다리는 노래’로 바뀌었다.', ['nari'])] }
      ] }
    ] },
    daeunPhoto: { title: '사진 바깥의 사람', background: 'cafe', lines: [
      n('다은이 새터 사진을 넘겼다. 단체 사진마다 가장자리에서 똑같이 웃고 있었다.', ['daeun']),
      say('다은', '내가 찍은 건 다 잘 나왔는데. 내가 나온 건 왜 다 이래?'),
      say('나', '이건 얼굴 반이 잘렸네.', ['daeun']), say('다은', '그치? 반만 나와도 존재감이 엄청나지.'),
      n('웃으면서도 그 사진은 금방 넘겼다. 나는 휴대폰을 꺼냈다.', ['daeun']),
      { choice: [
        { label: '“이번엔 너 찍어 줄게. 어디서 찍을까?”', effect: { bond: { daeun: 4 }, flag: 'daeunPortrait' }, lines: [say('다은', '지금? 머리도 안 만졌는데. …여기서. 그냥 밥 먹던 것처럼 찍어 줘.'), n('사진 가운데에 다은이 있었다.', ['daeun'])] },
        { label: '“다음엔 같이 가운데 서자. 내가 자리 맡을게.”', effect: { bond: { daeun: 3 } }, lines: [say('다은', '진짜? 제일 앞줄? 키 큰 사람 뒤로 보내는 거 금지다.'), n('다은이 다음 모임 날짜에 동그라미를 쳤다.', ['daeun'])] }
      ] }
    ] },
    daeunBike: { title: '자전거로 끝까지', background: 'river', lines: [
      n('강변에서 다은이 자전거 두 대를 빌려 왔다.', ['daeun']), say('다은', '오늘 한강 자전거 끝까지 간다! 약속했잖아.'),
      n('5km쯤 달렸을 때 다은이 뒤처지기 시작했다. “괜찮아, 먼저 가!”를 세 번 외쳤다.', ['daeun']),
      say('다은', '사실 나 운동 진짜 못해. 단톡방에 갈 사람 있냐고 했는데 아무도 답이 없어서. 너한테 따로 물어본 거야.'),
      { choice: [
        { label: '“돌아갈 땐 네 속도로 가자. 내가 뒤에서 갈게.”', effect: { bond: { daeun: 6 }, stats: { fitness: 1 } }, lines: [say('다은', '…야, 그런 말 하면 반칙이야.'), n('돌아오는 길, 다은은 한 번도 “먼저 가”라고 하지 않았다.', ['daeun'])] },
        { label: '“다음엔 이길 때까지 연습하자. 내가 코치 해 줄게.”', effect: { bond: { daeun: 4 }, stats: { fitness: 2 } }, lines: [say('다은', '오, 코치님! 그럼 주말마다 훈련이다?')] }
      ] }
    ] },
    daeunChat: { title: '읽고 답 없는 단톡방', background: 'cafe', lines: [
      n('학식 구석 자리. 다은이 휴대폰을 엎었다 뒤집었다 했다.', ['daeun']),
      say('다은', '종강 파티 공지 올렸는데 읽은 사람 열두 명에 답장 0. 웃기지?'),
      say('나', '다들 시험 기간이라 그래.', ['daeun']), say('다은', '알아. 아는데… 아 몰라! 너 오늘 떡볶이 콜?'),
      n('평소의 큰 웃음이었다. 크기만 했다.', ['daeun']),
      { choice: [
        { label: '그 자리에서 단톡방에 「나 갈게」라고 쓴다', effect: { bond: { daeun: 6 }, keptIf: 'recognizedDaeunLetter' }, lines: [n('‘나 갈게. 장소는 다은이 정해.’ 잠깐 뒤, 답장이 줄줄이 달리기 시작했다.', ['daeun']), say('다은', '…너 진짜. 고마워. 이 말 하는 거 되게 오랜만이다.')] },
        { label: '“너 없으면 아무도 안 모이는 거, 그건 맞아.”', effect: { bond: { daeun: 4 }, keptIf: 'recognizedDaeunLetter' }, lines: [say('다은', '…그런 식으로 생각해 본 적 없었는데.'), n('다은이 휴대폰을 뒤집어 놓았다. 화면이 위로 오게.', ['daeun'])] },
        { label: '“안 읽은 사람 숫자, 0 되는 거 못 봤지?”', when: { flag: 'recognizedDaeunLetter' }, effect: { flag: 'usedAnonymousWords' }, lines: [say('다은', '…어? 뭐야 무섭게ㅋㅋ 너 점쟁이야? 아 몰라, 떡볶이나 먹으러 가자.'), n('그날 다은은 쉬지 않고 떠들었다. 단톡방 얘기는 한 번도 하지 않았다.', ['daeun'])] }
      ] }
    ] },
    seojinCup: { title: '손잡이의 방향', background: 'cafe', lines: [
      n('서진이 머그잔 손잡이를 하나씩 오른쪽으로 돌려놓았다.', ['seojin']),
      say('서진', '이 손님은 왼손잡이. 그건 반대로.'), say('나', '다 외워?', ['seojin']),
      say('서진', '매일 오니까. 네가 설탕 반 봉지만 넣는 것도 알고. 내가 별생각 없이 보는 줄 알았어?'),
      n('높은 선반으로 팔을 올리던 서진이 잠깐 멈췄다. 잔이 아주 작게 달그락거렸다.', ['seojin']),
      { choice: [
        { label: '“윗칸은 내가 할까?”', effect: { bond: { seojin: 4 }, flag: 'seojinAskedHelp' }, lines: [say('서진', '좋아. 윗칸은 맡길게. 나는 아래. 바꾸고 싶으면 먼저 말하고.'), n('설명할 필요 없는 일처럼 잔이 자리를 바꿨다.', ['seojin']), say('서진', '먼저 물어보네. 그런 건 꽤 마음에 들어.')] },
        { label: '잔을 내려놓을 자리를 비워 둔다', effect: { bond: { seojin: 3 } }, lines: [say('서진', '잠깐 쉬자. 커피는 내가 내릴게. 네가 대신할 거 있나 찾지는 말고.'), n('그녀가 먼저 휴식을 말한 건 처음이었다.', ['seojin'])] }
      ] }
    ] },
    seojinRain: { title: '우산은 하나', background: 'cafe', lines: [
      n('마감 직후 장대비가 쏟아졌다. 우산꽂이에 남은 건 내 비닐우산 하나.', ['seojin']),
      say('서진', '오늘은 차 안 가져왔어. 정류장까지만 가면 되는데.'), say('나', '감기 걸려.', ['seojin']),
      say('서진', '나 물에는 익숙해. 진짜로.'), n('농담 같지 않았다.', ['seojin']),
      { choice: [
        { label: '“정류장까지만 같이 쓰자. 반반.”', effect: { bond: { seojin: 6 } }, lines: [n('우산 아래 어깨가 자꾸 닿았다. 서진은 우산 손잡이를 가리키며 나를 봤다.', ['seojin']), say('서진', '너 우산 내 쪽으로 너무 기울였어. 너 어깨 다 젖었잖아.'), say('나', '물에 익숙하다며. 나도 연습 좀 하려고.', ['seojin']), say('서진', '핑계는 괜찮네. 그럼 이쪽으로 와. 반반이라며.')] },
        { label: '우산을 쥐여 주고 먼저 뛴다', effect: { bond: { seojin: 4 } }, lines: [say('나', '이거 써! 나 뛰면 3분이야!', ['seojin']), n('등 뒤에서 서진이 뭐라고 외쳤다. 빗소리에 묻혔지만 웃는 목소리였다.')] }
      ] }
    ] },
    crossDrum: { title: '드러머 오디션', background: 'practice', lines: [
      n('동아리방 오디션. 다은이 스틱을 들었다. 손이 떨렸지만 카운트가 시작되자 떨림이 사라졌다.', ['daeun', 'nari']),
      n('크고, 빠르고, 조금 거칠었다. 그래도 한 번도 박자를 놓치지 않았다.', ['daeun', 'nari']),
      say('태오', '합격. 템포만 좀 잡자.', ['daeun', 'nari']),
      say('다은', '진짜요? 대박! 언니! 나리 언니! 저 붙었어요!', ['daeun', 'nari']),
      say('나리', '…잘 부탁해.', ['daeun', 'nari']),
      n('작은 말은 드럼 소리에 묻혔다. 나리는 다시 말하지 않고 기타를 메고 나갔다.', ['daeun']),
      say('다은', '…어? 언니 나 싫어하나?'),
      { choice: [
        { label: '“잘 부탁한다고 했어. 작게.”', effect: { bond: { daeun: 3, nari: 3 }, flag: 'daeunJoinedBand' }, lines: [say('다은', '진짜? 아 나 귀 먹었나 봐 드럼 때문에ㅋㅋ'), n('단체방에 인사가 올라왔다. 한참 뒤, 꾸벅 인사하는 고양이가 답으로 왔다.')] },
        { label: '“원래 무대 밖에선 말이 없대.”', effect: { bond: { daeun: 2 }, flag: 'daeunJoinedBand' }, lines: [say('다은', '아 그래? 그럼 다행이고. 근데 좀 무섭다ㅋㅋ 카리스마.')] },
        { label: '나리를 따라 나가 본다', effect: { bond: { nari: 4 }, flag: 'daeunJoinedBand' }, lines: [say('나리', '…나 또 너무 작게 말했지. 다시 하기엔 이상하잖아. 이미 나왔는데.'), n('돌아왔을 때 다은은 혼자 스틱을 돌리고 있었다. 웃었지만 나를 보지 않았다.', ['daeun'])] }
      ] }
    ] },
    crossThursday: { title: '목요일의 합주', background: 'practice', lines: [
      n('목요일 노을. 동아리방에는 드럼 패드를 치는 다은 혼자 있었다.', ['daeun']),
      say('다은', '어? 왜 왔어? 목요일은 합주 없어. 나리 언니가 목요일엔 절대 안 잡아.'),
      say('다은', '태오 선배가 한 번 잡았다가 언니가 처음으로 정색했대. 뭐 하는지는 아무도 몰라.'),
      { text: '목요일 밤. 시간표 한 칸이 마음에 걸렸다.', cast: ['daeun'], effect: { clue: 'thursdaySchedule' } },
      say('다은', '온 김에 메트로놈 좀 봐 줘. 나 자꾸 빨라져.'),
      { choice: [
        { label: '메트로놈을 맞춰 주고 같이 연습한다', effect: { bond: { daeun: 5 } }, lines: [say('다은', '됐다! 야 너 은근 선생님 체질이다. 목요일마다 와. 우리 둘이 전세야.')] },
        { label: '“목요일 밤이면… 학교 라디오 하는 시간 아니야?”', effect: { bond: { daeun: 2 }, clue: 'thursdayRadio' }, lines: [say('다은', 'ㅋㅋ 언니가? 말도 안 돼. 무대 밖에선 세 마디 이상 말하는 거 못 봤어. …어? 아 아니다ㅋㅋ')] }
      ] }
    ] }
  });

  const rules = [
    { id: 'crossRain', place: 'cafe', from: '2026-05-27', to: '2026-07-31', priority: 2, work: true, bond: { seojin: 15, daeun: 15 } },
    { id: 'crossDrum', place: 'club', from: '2026-03-12', to: '2026-03-31', priority: 2, seen: 'fair' },
    { id: 'crossThursday', place: 'club', from: '2026-04-09', to: '2026-06-18', priority: 2, day: 4, slot: 2, club: 'band', bond: { daeun: 14 } },
    { id: 'nariShake', place: 'club', from: '2026-03-18', to: '2026-06-19', bond: { nari: 5 } },
    { id: 'nariVolume', place: 'club', from: '2026-03-23', to: '2026-04-30', bond: { nari: 5 } },
    { id: 'nariHabit', place: 'club', from: '2026-04-06', to: '2026-06-19', bond: { nari: 8 }, broadcasts: 1 },
    { id: 'nariLyrics', place: 'roof', from: '2026-04-28', to: '2026-07-31', bond: { nari: 15 } },
    { id: 'nariDemo', place: 'studio', from: '2026-06-01', to: '2026-08-26', bond: { nari: 20 } },
    { id: 'daeunFirst', place: 'dining', from: '2026-03-11', to: '2026-06-19', bond: { daeun: 5 } },
    { id: 'daeunPhoto', place: 'dining', from: '2026-03-18', to: '2026-04-24', bond: { daeun: 5 } },
    { id: 'daeunBike', place: 'river', from: '2026-04-25', to: '2026-06-19', bond: { daeun: 14 } },
    { id: 'daeunChat', place: 'dining', from: '2026-06-01', to: '2026-06-30', bond: { daeun: 25 } },
    { id: 'seojinPlaylist', place: 'cafe', from: '2026-03-25', to: '2026-06-30', bond: { seojin: 8 } },
    { id: 'seojinCup', place: 'cafe', from: '2026-04-01', to: '2026-05-15', bond: { seojin: 8 } },
    { id: 'seojinRain', work: true, seen: 'crossRain', place: 'cafe', from: '2026-05-27', to: '2026-07-31', bond: { seojin: 18 } }
  ];
  for (const gate of root.AquaRelationships.gates) { const rule=rules.find(r=>r.id===gate.id); rule.bond={[gate.person]:gate.value-1}; if (rule.to < '2026-06-30') rule.to='2026-06-30'; }
  function allowed(state, condition = {}) {
    return (!condition.flag || !!state.flags[condition.flag]) &&
      (!condition.notFlag || !state.flags[condition.notFlag]) &&
      (!condition.all || condition.all.every(branch => allowed(state, branch))) &&
      (!condition.any || condition.any.some(branch => allowed(state, branch))) &&
      (!condition.metAll || condition.metAll.every(id => state.met.includes(id))) &&
      (!condition.met || state.met.includes(condition.met)) &&
      (!condition.noLovers || !root.AquaRomance.lovers(state).length) &&
      (!condition.hasLovers || !!root.AquaRomance.lovers(state).length) &&
      (!condition.openRomance || root.AquaRomance.ensure(state).mode === 'open') &&
      (!condition.lover || root.AquaRomance.isLover(state, condition.lover)) &&
      (!condition.romance || Object.entries(condition.romance).every(([id, status]) => root.AquaRomance.ensure(state).status[id] === status && state.met.includes(id))) &&
      (!condition.ignoredMessage || state.messages?.inbox.some(message => message.person === condition.ignoredMessage && message.reply === 'none')) &&
      (!condition.notHolidayInvite || !root.AquaHolidays.invited(state, condition.notHolidayInvite)) &&
      (!condition.seen || state.seen.includes(condition.seen)) &&
      (!condition.club || state.club === condition.club) &&
      (!condition.notClub || state.club !== condition.notClub) &&
      (!condition.clues || root.AquaRadio.clueCount(state) >= condition.clues) &&
      (!condition.item || (state.social?.inventory[condition.item] || 0) > 0) &&
      (!condition.broadcasts || root.AquaRadio.ensure(state).listened.length >= condition.broadcasts) &&
      Object.entries(condition.bond || {}).every(([id, value]) => state.met.includes(id) && state.bond[id] >= value) &&
      ['knowledge', 'fitness', 'sensitivity'].every(key => !condition[key] || state[key] >= condition[key]);
  }
  function eligible(state, place) {
    return [...rules].sort((a, b) => (b.priority || 0) - (a.priority || 0)).filter(rule =>
      rule.place === place &&
      (!root.AquaRelationships.gates.some(g=>g.id===rule.id) || root.AquaRelationships.ready(state,root.AquaRelationships.gates.find(g=>g.id===rule.id))) && state.date >= rule.from && state.date <= rule.to &&
      (state.slot !== 3 || rule.slot === 3) &&
      !state.seen.includes(rule.id) && (rule.slot === undefined || rule.slot === state.slot) &&
      (rule.day === undefined || root.AquaWorld.weekday(state.date) === rule.day) &&
      (!rule.work || ([1, 2].includes(state.slot) && !state.workDays?.includes(state.date) && [3, 5, 6].includes(root.AquaWorld.weekday(state.date)))) &&
      (rule.id !== 'seojinRain' || (state.flags.crossRainDate && state.date > state.flags.crossRainDate)) && allowed(state, rule));
  }
  function available(state, place) {
    return eligible(state, place).filter(rule => !root.AquaEncounters || root.AquaEncounters.sceneAvailable(state, rule));
  }
  function build(id, state) {
    const source = scenes[id];
    if (!source) throw new Error(`Unknown story scene: ${id}`);
    const data = structuredClone(source);
    if (id === 'fair') {
      // Knowing a public stage persona is different from an actual first meeting.
      if (!state.met.includes('nari')) data.lines.splice(3, 0,
        n('부스 뒤를 지나가는데, 나리가 혼자 쭈그려 앉아 있었다. 마이크를 쥔 손이 떨리고 있었다.', ['nari']),
        say('나리', '…어? 신입생? 미안, 잠깐만. 무대 끝나면 늘 이래. 선배라고 하지 마. 나리라고 불러.'),
        { choice: [
          { label: '물을 건네고 옆에 같이 앉는다', effect: { meet: 'nari', bond: { nari: 4 }, card: '떨리는 손의 피크' }, lines: [say('나리', '…고마워. 떨리는 거 보여 준 거, 비밀로 해 줘.'), say('나리', '이 피크 너 가져. 오늘 무대에서 쓴 거야.')] },
          { label: '“아까 무대 진짜 멋있었어.”', effect: { meet: 'nari', bond: { nari: 2 } }, lines: [say('나리', '그치! …아, 지금 이 모습은 잊어 줘. 무대 위의 나만 기억해.')] }
        ] });
      delete data.lines[data.lines.length - 1].effect;
      const clubChoice = data.lines.find(line => line.choice?.some(option => option.effect?.club));
      clubChoice.choice[0].effect.bond = { nari: 2, daeun: 2 };
    }
    function compile(lines) {
      return lines.filter(line => allowed(state, line.when)).map(line => {
        if (line.choice) line.choice = line.choice.filter(option => allowed(state, option.when)).map(option => ({ ...option, lines: compile(option.lines || []) }));
        return line;
      });
    }
    data.lines = compile(data.lines);
    const gate=root.AquaRelationships.gates.find(g=>g.id===id);
    if(gate) {
      // Expand existing GDD scenes with their original scene's beats, never invent a second rank event.
      const extra={nariVolume:['나리가 케이블 끝을 놓쳤다가 다시 잡았다.','나는 문을 잡은 채 한 걸음 옆으로 비켰다.'],nariDemo:['이어폰 한쪽에서 의자가 삐걱거리는 소리가 들렸다.','나는 끝난 파일의 재생 막대를 바라봤다.','나리는 휴대폰을 뒤집지 않고 내 앞에 두었다.'],daeunBike:['편의점 앞 벤치에 자전거 두 대를 세웠다.','다은이 이온 음료를 한 번에 반 넘게 마셨다.','나는 돌아가는 길을 지도에서 다시 찾았다.','벤치 아래로 자전거 바퀴 그림자가 나란히 놓였다.'],daeunFirst:['나는 다은 맞은편에 가방을 내려놓았다.','다은이 내 앞으로 빈 접시를 밀었다.'],daeunChat:['나는 식판을 내려놓고 다은의 말을 기다렸다.','다은이 김 한 장을 집었다가 내려놓았다.'],seojinPlaylist:['나는 닦던 컵을 내려놓고 다음 곡을 기다렸다.','마감 표시를 뒤집자 카페가 조용해졌다.'],seojinCup:['나는 빈 쟁반을 선반 아래로 옮겼다.','서진이 잔의 손잡이를 다시 확인했다.'],seojinRain:['나는 우산을 펴서 비닐에 난 구멍을 확인했다.','정류장의 불빛이 젖은 길에 번졌다.']}[id]||[];
      data.lines.splice(data.lines.findIndex(l=>l.choice),0,...extra.map(text=>({...n(text,[gate.person]),expr:'neutral'})));
      if(gate.value===(gate.person==='nari'?45:gate.person==='daeun'?35:55)) data.lines.push({...say(root.AquaWorld.people[gate.person].short,root.AquaRelationships.rewardLines[gate.person]),expr:'smile'});
    }
    if (id === 'seojinRain' && state.flags.umbrellaDaeun) data.lines[0].text = '다은이 돌려준 비닐우산을 챙겨 출근했다. 마감 직후 다시 장대비가 쏟아졌다.';
    if (id === 'crossRain' && root.AquaWorld.weekday(state.date) === 3 && state.slot === 2 && root.AquaWorld.presentAt(state, 'cafe').includes('nari')) {
      const cast = ['seojin', 'daeun', 'nari'];
      data.lines.splice(6, 0, n('창가 끝자리에서 큰 후드를 쓴 사람이 고개를 더 깊이 숙였다. 다은은 알아보려다가 고개를 갸웃했다.', cast));
      const choice = data.lines.find(line => line.choice).choice[2];
      choice.effect.bond.nari = 1;
      choice.lines = [n('다은이 떠들고, 서진이 짧게 대꾸하고, 나는 웃었다. 창가의 나리도 조용히 같은 비를 기다렸다.', cast),
        n('비가 그치자 나리가 먼저 나갔다. 테이블에 지운 자국이 많은 종이 한 장이 남았다. 서진이 버리지 않고 접어 두었다.')];
    }
    root.AquaWinter?.decorate(id, state, data);
    root.AquaHolidays?.decorate(id, state, data);
    return data;
  }
  root.AquaStory = { rules, allowed, eligible, available, build };
})(typeof window !== 'undefined' ? window : globalThis);
