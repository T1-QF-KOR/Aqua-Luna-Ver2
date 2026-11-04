/* Autumn: decisions return as boundaries, promises, and a public performance. */
(function (root) {
  'use strict';
  const W = root.AquaWorld;
  const person = { 나리: 'nari', 다은: 'daeun', 서진: 'seojin' };
  const n = (text, cast = [], extra = {}) => ({ text, cast, ...extra });
  const say = (speaker, text, cast, extra = {}) => ({ speaker, text, cast: cast ?? [person[speaker]].filter(Boolean), ...extra });
  const option = (label, effect, lines, when) => ({ label, effect, lines, ...(when ? { when } : {}) });
  const choose = (...choice) => ({ choice });
  const scenes = {
    nariCard: { title: '명함 한 장', background: 'rooftop', lines: [
      n('나리가 명함을 손가락 사이에서 굴리고 있었다. 모서리가 피크처럼 닳아 있었다.', ['nari']),
      say('나리', '소리결 엔터테인먼트. 봄 축제 영상 봤대. 솔로 준비해 보재.'),
      say('나리', '대신 휴학하고 회사 연습실에서 살아야 돼. 곡은 회사가 주고.'),
      n('명함 뒷면에는 미팅 날짜와 2월 등록 마감일이 적혀 있었다.', ['nari'], { effect: { flag: 'knowsOffer', card: '명함 한 장' } }),
      say('나리', '남의 노래를 자기 노래처럼 부르는 애는 드물대. 내가 그렇대. 칭찬이지?'),
      say('나리', '엄마는 벌써 울었어. 좋아서. 노래방 닫고 나서 그렇게 운 거 처음 봐.'),
      n('웃고 있었지만, 명함은 계속 손가락 사이를 돌았다.', ['nari']),
      choose(
        option('“너는 어떻게 하고 싶어?”', { bond: { nari: 6 }, selfChoice: 1 }, [
          n('명함이 멈췄다.', ['nari']), say('나리', '…그거 묻는 사람은 네가 처음이야.'),
          say('나리', '몰라. 근데 곡은 우리가 줄게요, 할 때 숨이 막혔어. 좋은 말인데.'),
          say('나리', '내가 쓴 걸 들고 가면 안 되는 건지, 그거부터 물어보고 싶어. 다음에.')]),
        option('“축하해. 먼저 연락이 온 거잖아.”', { bond: { nari: 2 } }, [say('나리', '그치. 대단하지.'), n('나리는 명함을 휴대폰 케이스에 꽂았다. 이름이 바깥에서 보이는 쪽이었다.', ['nari'])]),
        option('“가지 마. 여기서도 네 노래 들을 수 있잖아.”', { bond: { nari: 1 }, selfChoice: -1 }, [say('나리', '…다들 가라거나 가지 말라거나, 그 얘기부터 하네.'), n('나리가 명함 대신 피크를 꺼냈다. 나는 내 말이 누구를 위한 말이었는지 생각했다.', ['nari'])]))
    ] },
    nariStudio: { title: '불 꺼진 부스', background: 'radio', lines: [
      n('목요일 오후. 이현 선배가 조정실 의자를 내 쪽으로 밀었다. 부스 커튼은 닫혀 있었다.'),
      say('이현', '오늘 엔지니어 선배가 아파요. 저녁 오기 전에 테스트만 같이 해 줘요. 커튼은 그대로 두고요.'),
      n('테스트 표시등이 켜졌다. 커튼 너머에서 원고를 넘기는 소리가 났다.'),
      say('루나', '안녕하세요, 아쿠아 루나의… 아. 이 줄 다시 할게요.'),
      n('스피커에서 짧은 노래가 흘렀다. 마이크가 열린 줄 모르고 따라 부르는 목소리였다.'),
      n('이어폰에서 들었던 숨과, 동아리방에서 들었던 음이 겹쳤다.', [], { when: { flag: 'knowsLuna' } }),
      choose(
        option('커튼을 그대로 두고 테스트 소리만 맞춘다', { bond: { nari: 4 }, flag: 'curtainKept', clue: 'boothVoice' }, [
          say('나', '테스트 끝났어요. 마이크는 꺼 둘게요.'), say('이현', '고마워요. 오늘 저녁 방송은 제가 맡을게요.'),
          n('나는 파일 이름만 확인하고 조정실을 나왔다. 닫힌 커튼이 질문의 답이 될 필요는 없었다.')]),
        option('장비를 끈 뒤 커튼 틈으로 들여다본다', { flag: 'boothPeeked' }, [
          n('이어폰을 목에 건 나리가 원고를 접고 있었다. 눈이 마주치기 전에 이현 선배가 커튼을 닫았다.', [], { effect: { flag: 'knowsLuna' } }),
          say('이현', '그만해 주세요.'), n('작은 목소리였다. 나는 손을 내려놓고 부스에서 물러났다.')]))
    ] },
    nariAngry: { title: '알고 있었어?', background: 'classroom', lines: [
      n('실습이 끝나고 나리가 책상 위 악보를 정리하지 않았다. 마지막 학생이 나가고도 잠깐을 더 기다렸다.', ['nari']),
      say('나리', '그날 강변에서 물어본 거. 그냥 물어본 거 아니지.', undefined, { when: { flag: 'questionedRadio' } }),
      say('나리', '부스 커튼. 네가 열어 봤다고 들었어.', undefined, { when: { all: [{ flag: 'boothPeeked' }, { notFlag: 'questionedRadio' }] } }),
      say('나리', '나 얼굴 없는 데가 거기밖에 없어. 무대는 다 보이고, 무대 밖에선 말이 안 나오고.'),
      say('나리', '거기서만 내 말을 해. 네가 아는 게 싫은 건지, 먼저 알게 된 게 무서운 건지… 아직 모르겠어.'),
      choose(
        option('“미안. 네가 먼저 말할 때까지 기다렸어야 했어.”', { bond: { nari: 6 }, anonymous: 5, flag: 'nariReconciled' }, [
          n('나는 더 설명하지 않았다. 나리가 접은 악보를 다시 폈다.', ['nari']),
          say('나리', '방송을 그만두고 싶은 건 아니야. 그냥, 내가 말할 시간을 좀 줘.'),
          say('나', '응. 이름도 말 안 할게.', ['nari']), say('나리', '…그건 꼭. 네가 안다고 다른 사람도 알아야 하는 건 아니니까.')]),
        option('“일부러 알아낸 건 아니었어.”', { bond: { nari: -6 }, radioBreak: 3, flag: 'nariBoundaryMissed' }, [
          say('나리', '알아. 일부러 아닌 거.'), say('나리', '근데 지금 필요한 건 그 말이 아니었어.'),
          n('나리는 악보를 가방 안에 넣었다. 다음 세 번의 정규 방송은 다시 듣기로 바뀌었다.', ['nari'])]))
    ] },
    nariBirthday: { title: '선배의 생일', background: 'practice', lines: [
      n('동아리방에 들어가자 나리가 종이 고깔모자를 혼자 고쳐 쓰고 있었다.', ['nari']),
      say('나리', '생일. 다들 축제 준비하느라 까먹었대. 그래서 셀프로 쓰는 중.'),
      n('나는 휴대폰 달력에 날짜를 적었다. 10월 14일.', ['nari'], { effect: { birthday: 'nari' } }),
      say('나리', '다은이는 아침에 문자 왔어. 떡볶이는 축제 끝나고 먹재.', undefined, { when: { flag: 'daeunJoinedBand' } }),
      n('뒤집힌 휴대폰이 짧게 울렸다. 화면은 보이지 않았다.', ['nari'], { when: { seen: 'lunaLeakStart' } }),
      choose(
        option('생일 노래를 가사 없이 흥얼거린다', { bond: { nari: 6 }, card: '선배의 생일' }, [
          say('나리', '오늘 온 사람 하나, 그거면 만석.'), n('나리가 내 멜로디 위에 가사를 얹었다.', ['nari']),
          say('나리', '봐. 이게 내 재능이야.'), n('나리는 휴대폰 알림을 껐다. 나는 박자를 한 번 더 두드렸다.', ['nari'])]),
        option('고깔모자가 내려오지 않게 테이프를 건넨다', { bond: { nari: 4 }, card: '선배의 생일' }, [
          say('나리', '…생일의 실용성 담당이네.'), n('나리가 모자 끈을 붙였다. 조금 비뚤었지만 이번에는 벗지 않았다.', ['nari']),
          say('나리', '사진 한 장만 찍어 줘. 오늘 이러고 있었다고, 나중에 내가 보게.')]))
    ] },
    nariFright: { title: '못 올라가겠어', background: 'practice', lines: [
      n('앰프 옆에서 나리가 수첩을 덮었다. 펼쳐져 있던 페이지마다 인사말이 적혀 있었다.', ['nari']),
      say('나리', '무대 위의 나, 다 외운 거야. 멘트도 웃는 타이밍도. 그러면 안 떨려서.'),
      say('나리', '이번엔 메인 무대래. 내 노래를 천 명이 듣는 거야. 별로면 어떡해?'),
      say('나리', '그 팀장님도 온대. 남의 노래 잘 부르는 애 말고, 내가 쓴 걸 보러.', undefined, { when: { flag: 'knowsOffer' } }),
      n('선풍기는 멈춰 있었는데 수첩 모서리가 조금씩 움직였다.', ['nari']),
      choose(
        option('“맨 앞줄에 서 있을게. 한 명쯤은 아는 얼굴이어도 되잖아.”', { bond: { nari: 8 }, flag: 'frontRowPromise' }, [
          say('나리', '…그거 진짜 오글거린다.'), n('나리가 수첩을 가방에 넣었다.', ['nari']),
          say('나리', '근데 할게. 천 명 보지 말고, 처음엔 너 한 명만 볼게. 약속이야.')]),
        option('“이번 무대가 어떤 무대였으면 좋겠어?”', { bond: { nari: 4 }, selfChoice: 1 }, [
          say('나리', '…외우지 않은 말을 한 번이라도 했으면 좋겠어.'), say('나', '그럼 그 한 번부터 연습해 보자.', ['nari']),
          n('나는 빈 의자를 돌려 앉았다. 나리가 수첩 없이 인사할 때까지 기다렸다.', ['nari'])]))
    ] },
    nariFight: { title: '원래 가사', background: 'concert', lines: [
      n('텅 빈 공연장의 리허설. 나리가 자작곡의 첫 줄을 불렀다. 「오늘 밤은 별이 높다.」', ['nari']),
      n('옥상에서 나리가 말했던, 무대를 내려오는 계단의 이야기는 들리지 않았다.', ['nari']),
      n('나리는 물병을 열었다. 한 모금도 마시지 않은 채 뚜껑을 다시 돌렸다.', ['nari']),
      say('나리', '어땠어? 이번 게 무난해서 좋대. 음향 선배가.'),
      n('질문은 가벼웠지만, 나리는 내 얼굴에서 눈을 떼지 않았다.', ['nari']),
      choose(
        option('“계단 이야기는 빠졌네.”', {}, [
          say('나리', '…응. 이게 더 무난하잖아.'),
          say('나리', '계단 얘기 하면 다 알 것 같아서. 내가 무대 끝나고 어떻게 되는지.'),
          say('나리', '영상 찍히고, 누가 올리고, 모르는 사람들도 다 보면… 그다음엔?'),
          n('물병 뚜껑이 손에서 미끄러졌다. 나리는 그것을 주우려다 말고 나를 봤다.', ['nari']),
          say('나리', '천 명 앞에서 나 사실 떨어요, 하고 말해 본 적 있어?'),
          say('나리', '너는 객석에서 보기만 하잖아. 쉽게 말하지 마.'),
          n('마지막 말이 빈 객석에 생각보다 크게 울렸다. 나리가 놀란 듯 입을 다물었다. 나는 한 걸음 물러나, 계단 아래에서 말을 골랐다.', ['nari']),
          choose(
            option('“네가 정해. 나는 네가 쓰고 싶던 이야기가 듣고 싶어.”', { bond: { nari: 6 }, flag: 'originalLyrics', selfChoice: 1, card: '계단은 무대보다 높다' }, [
              n('나리가 물병을 내려놓고 악보를 펼쳤다. 뒷장에 작게 적힌 문장이 보였다. 「계단은 무대보다 높다.」', ['nari']),
              say('나리', '…나도 그 줄이 좋아. 그래서 더 무서워.'),
              say('나리', '아까 소리 질러서 미안해. 네가 정하라고 한 것도 아닌데.'),
              say('나리', '다시 생각해 볼게. 내가 그걸로 부르면… 틀려도 끝까지 들어 줘.'),
              n('나는 알겠다고 말했다. 나리는 악보를 넘겨 첫 줄을 한 번 더 읽었다. 아직 지우지도, 동그라미를 치지도 않았다.', ['nari'])]),
            option('“소리 지르게 해서 미안해. 준비 잘해.”', { bond: { nari: 2 }, flag: 'lyricsLeftChanged' }, [
              say('나리', '나도 소리 질러서 미안. 그냥… 아직은 이 가사로 할래.'),
              n('나는 떨어진 물병 뚜껑을 주워 건넸다. 나리는 고맙다고 말한 뒤 악보를 들고 다시 무대로 올라갔다.', ['nari'])]))]),
        option('“좋았어. 잘 들었어.”', { bond: { nari: 2 }, flag: 'lyricsLeftChanged' }, [
          say('나리', '그치. 그럼 됐지.'),
          n('나리는 무대에서처럼 웃었다. 뚜껑을 닫은 물병은 손에 쥔 채였다.', ['nari']),
          n('나는 옥상에서 들었던 계단 이야기를 떠올렸다. 다시 묻지는 않았다.', ['nari'])]))
    ] },
    daeunAlone: { title: '혼자 있는 시간', background: 'river', time: 2, lines: [
      n('다은이 강변 계단에 앉아 있었다. 휴대폰은 가방 안에 있었고, 손에는 마실 것 하나만 들려 있었다.', ['daeun']),
      say('다은', '어, 들켰다. 오늘은 일부러 아무도 안 불렀는데.'),
      say('다은', '여름에 영화 보고 나오니까 내가 먼저 연락할 사람을 골라도 되더라. 기다리기만 하는 거 말고.', undefined, { when: { flag: 'daeunSoloTicket' } }),
      say('다은', '혼자 있으면 나 없어도 다들 잘 지낼 것 같아서, 계속 사람 불렀나 봐.'),
      say('다은', '오늘은 연습해 보려고. 약속 없는 시간.'),
      choose(
        option('“나도 옆에서 혼자 있어도 돼?”', { bond: { daeun: 8 }, flag: 'daeunQuietTogether' }, [
          say('다은', '…그게 무슨 혼자냐. 물어봐 주는 건 좋네.'), n('나는 한 계단 아래에 앉았다. 다은이 먼저 말을 걸 때까지 강을 봤다.', ['daeun']),
          say('다은', '이상하다. 너랑 있으면 내가 안 떠들어도 되네.')]),
        option('“그럼 다녀올게. 나중에 네가 연락해 줘.”', { bond: { daeun: 4 }, flag: 'daeunTimeRespected' }, [
          say('다은', '응. 내가 먼저 할게.'), n('나는 강변 출구로 걸었다. 휴대폰을 확인하지 않고 버스 정류장까지 갔다.'),
          say('다은 · 메시지', '아직 안 무서움ㅋㅋ 이거 알려 주려고 연락한 건 연락한 걸로 안 치기', [])]))
    ] },
    daeunBack: { title: '드럼은 맨 뒤', background: 'practice', time: 2, lines: [
      n('합주가 끝나고 다은이 스틱의 테이프를 다시 감았다. 끝이 갈라져 있었다.', ['daeun']),
      say('다은', '드럼은 맨 뒤라서 다 보여. 관객이 누구 보는지. 보통 언니 보지.'),
      say('다은', '나 언니 좋아. 언니 무대 보고 드럼도 시작했어. 근데… 나도 한 번은 누가 맨 뒤 봐 줬으면 해서.'),
      n('스틱 하나가 바닥에 굴렀다. 주우려고 내민 손이 다은의 손보다 빨랐다.', ['daeun']),
      choose(
        option('“이거 나 줘. 축제 때 맨 뒤 볼게.”', { bond: { daeun: 7 }, flag: 'backRowPromise', card: '맨 뒷줄의 스틱' }, [
          say('다은', '부러진 건데.'), say('나', '알아. 새 거 사 달라는 뜻은 아니었지?', ['daeun']),
          n('다은이 고개를 저었다. 이번에는 웃음을 크게 만들지 않았다.', ['daeun']), say('다은', '그때 제일 크게 칠게. 듣기 말고 보기. 한 번만.')]),
        option('“축제 영상에 드럼도 제대로 담을게.”', { bond: { daeun: 5 }, flag: 'filmDaeunPromise' }, [
          say('다은', '보컬 안 나오면 사람들이 안 볼 텐데.'), say('나', '네가 볼 거잖아. 나도 보고.', ['daeun']), say('다은', '…그럼 오른쪽에서 찍어. 왼쪽은 심벌에 가려.')]),
        option('“나리한테도 말해 보면 어때?”', { bond: { daeun: 2 } }, [say('다은', '언니 나 좀 봐 주세요? ㅋㅋ 그건 좀.'), n('다은이 스틱을 케이스에 넣었다. 나는 해결할 일을 찾다가, 듣던 얘기를 놓쳤다는 걸 알았다.', ['daeun'])]))
    ] },
    seojinFight: { title: '네가 뭔데', background: 'cafe', time: 2, lines: [
      say('사장님', '서진아. 복학 안내 또 왔던데. 요즘 그 수영장 자리에도 가고 그러면서.', ['seojin']),
      n('사장님이 주방으로 들어가자 서진이 닦던 컵을 내려놓았다. 내 쪽을 보는 눈에서 웃음기가 사라졌다.', ['seojin']), say('서진', '내 얘기, 이모한테 했어? 직접 확인할게.'),
      say('나', '아니.', ['seojin']), say('서진', '그럼 어떻게 안 거지. 내가 입을 떼기도 전에 다시 해 보라는 말부터 하니까.'),
      say('서진', '그날도 이미 알고 있었지. 나보다 먼저.', undefined, { when: { flag: 'seojinLetterExposed' } }),
      choose(
        option('내 말을 더 얹지 않고 기다린다', { bond: { seojin: 5 }, flag: 'seojinReconciled' }, [
          say('서진', '아니, 잠깐. 이모가 직접 봤을 수도 있네. 그 앞 주차장 쓰니까. 너한테 먼저 따진 건 내가 잘못했어.'), say('서진', '내가 화난 건 따로 있어.'),
          say('서진', '그만두는 것도 다시 하는 것도 다들 나보다 먼저 정해. 내가 하고 싶다고 말하면… 그때부터 또 잘해야 하잖아.'),
          say('나', '누나가 하고 싶은 얘기부터 들을게.', ['seojin']),
          n('서진이 행주를 내려놓았다. 닦던 컵의 손잡이를 내 쪽으로 돌렸다.', ['seojin']), say('서진', '그럼 기다려 줘. 이번엔 내가 먼저 말할게. 피하려고 하는 말은 아니야.')]),
        option('“난 말 안 했어. 사장님이 보신 거야.”', { bond: { seojin: 1 } }, [say('서진', '알았어. 네가 아니라고 했으니까 믿을게. 지금은 조금 혼자 정리하고 싶어.'), n('믿는다는 말 뒤로 대화가 이어지지는 않았다. 나는 컵을 다른 선반에 옮겼다.', ['seojin'])]),
        option('“누나, 사장님 말도 맞잖아. 다시 해 봐.”', { bond: { seojin: -3 }, flag: 'seojinPressured' }, [
          say('서진', '그건 내가 정해. 너한테까지 허락받고 싶진 않아.'), n('서진이 행주를 반듯하게 접어 놓고 재활용 봉투를 들었다. 뒷문이 닫힌 뒤 나는 마감 안내판을 뒤집었다. 기다릴 수 있었던 말이 계속 떠올랐다.', ['seojin'])]))
    ] },
    seojinDream: { title: '강사 모집 공고', background: 'river', lines: [
      n('서진이 휴대폰을 내밀었다. 구립 체육센터의 어린이 수영 강사 모집 공고였다.', ['seojin']),
      say('서진', '내가 찾았어. 이번엔 이모가 보내 준 거 아니야. 선수 말고도 내가 할 수 있는 일이 있더라.', undefined, { when: { flag: 'seojinReconciled' } }),
      say('서진', '이모가 보내 준 건데, 이번엔 내가 읽어 봤어. 선수 모집이 아니라 어린이 강사야.', undefined, { when: { notFlag: 'seojinReconciled' } }),
      say('서진', '지원하고 싶어. 여기까진 확실해. 그런데 또 안 되면… 그다음 말을 아직 못 찾겠어.'),
      choose(
        option('“안 되면 그때 또 같이 서 있자. 그 수영장 앞에.”', { bond: { seojin: 8 } }, [
          say('서진', '위로 참 특이하게 하네. 답은 안 해 주고 자리부터 잡아 주고. 그건 마음에 든다.'), n('서진이 공고를 저장했다. 휴대폰을 쥔 손이 조금 덜 굳어 있었다.', ['seojin']),
          n('우리는 벤치에 앉았다. 서진이 지원 항목을 하나씩 채웠다. 나는 화면을 대신 읽어 주지 않고 기다렸다.', ['seojin']),
          say('서진', '보냈어. 나 방금 좀 멋있었지? …결과 나오면 네가 먼저 알게 할게.', undefined, { effect: { flag: 'seojinApplied', card: '다시 물 쪽으로' } })]),
        option('“내 생각보다 누나 생각부터 듣고 싶어.”', { bond: { seojin: 6 } }, [
          say('서진', '하고 싶어. 대답은 이미 했네. 내가 내 말을 못 믿고 있었나 봐.'), n('서진이 지원서를 썼다. 나는 화면을 들여다보지 않고 벤치의 빈 봉투를 치웠다.', ['seojin']),
          n('마지막 항목을 확인하고 서진이 제출을 눌렀다. 접수 완료라는 글자를 보고서야 휴대폰을 뒤집었다.', ['seojin'], { effect: { flag: 'seojinApplied', card: '다시 물 쪽으로' } })], { flag: 'seojinReconciled' }),
        option('“천천히 생각해 봐. 다음에 얘기해도 되고.”', { bond: { seojin: 4 }, flag: 'seojinConsidering' }, [
          say('서진', '좋아. 마감 날짜는 알아. 미루더라도 내가 알고 미룰게.'), n('서진은 공고를 닫기 전에 지원 자격을 한 번 더 읽었다.', ['seojin'])]))
    ] },
    crossRegular: { title: '창가 자리 단골', background: 'cafe', time: 2, lines: [
      n('마감 안내판을 뒤집으려는데 나리가 들어왔다. 서진은 주문을 묻지 않고 따뜻한 물을 놓았다.', ['seojin', 'nari']),
      say('서진', '왔네. 오늘은 여기 앉아. 창가 춥더라.', ['seojin', 'nari']),
      n('나리는 명함과 접힌 서류를 나란히 놓았다. 서진의 눈이 표지에 잠깐 머물렀다.', ['seojin', 'nari']),
      say('서진', '계약서야? 아직 읽는 중이면 서두르지 마.', ['seojin', 'nari']), say('나리', '…아직요.', ['seojin', 'nari']),
      say('서진', '나 수영했었어. 다쳐서 그만뒀는데, 그만둔 거랑 놓친 거는 다르더라.', ['seojin', 'nari']),
      say('서진', '너는 아직 고를 수 있잖아. 고를 수 있을 때 네가 골라.', ['seojin', 'nari']),
      n('나리가 서류 위에 손바닥을 놓았다. 물잔을 잡을 때까지 아무도 말을 보태지 않았다.', ['seojin', 'nari']),
      choose(
        option('못 들은 척 컵을 정리한다', { bond: { seojin: 3, nari: 3 }, selfChoice: 1 }, [
          say('나리', '감사합니다. 다음에… 제가 어떻게 정했는지 말하러 올게요.', ['seojin', 'nari']), say('서진', '응. 네가 고른 얘기 들으러 기다릴게. 주문하러 오는 척은 안 해도 되고.', ['seojin', 'nari'])]),
        option('“누나 말 맞아. 나도 그렇게 생각해.”', { bond: { seojin: 1, nari: 1 } }, [
          say('나리', '…응. 너도 알고 있었지.', ['seojin', 'nari']), n('나리는 서류를 다시 접었다. 나는 더 하지 않아도 됐을 말을 컵 소리 사이로 삼켰다.', ['seojin', 'nari'])]))
    ] },
    chuseok: { title: '추석, 어느 쪽의 집', background: 'room', time: 0, lines: [
      n('9월 24일. 옆방이 조용했다. 민재는 어제 본가에 갔다. 엄마에게서 「기차표 끊었나」라는 문자가 와 있었다.'),
      say('사장님 · 메시지', '연휴엔 금요일만 열어요. 고향 가면 쉬어도 돼요.', []),
      say('다은 · 메시지', '나 서울 남음ㅋㅋ 너도 있으면 심심할 때 연락해', [], { when: { met: 'daeun' } }),
      n('표를 끊으면 26일까지 고향에 머문다. 캠퍼스에서 보낼 사흘과 금요일 근무를 비우게 된다.'),
      choose(
        option('26일까지 고향에 다녀온다', { flag: 'chuseokHome', card: '추석의 기차표' }, [
          n('역에서 내려서야 바다 냄새가 났다. 엄마는 반찬통을 실은 차 앞에서 기다리고 있었다.'),
          say('엄마', '짐부터 넣어라. 밥 먹고 얘기하자.'), n('나는 가방을 뒷좌석에 놓았다. 차 안은 내가 아는 세제 냄새가 났다.'),
          n('집에 도착해 창문을 열었다. 바다가 보였다. 책상 위의 공책만 서울에서 가져온 것이었다.', [], { background: 'home' })]),
        option('서울에 남는다', { flag: 'chuseokStayed' }, [
          say('나 · 메시지', '이번에는 서울에 있을게. 저녁에 전화할게.', []), say('엄마 · 메시지', '그래 밥은 챙겨 묵고. 전화 기다릴게.', []),
          n('나는 저녁 알람을 맞췄다. 변명 대신 남은 하루를 그대로 말해 보기로 했다.')]))
    ] },
    chuseokMorning: { title: '괜찮다는 말 다음', background: 'home', time: 0, lines: [
      n('고향의 아침. 식탁 위에 송편과 너무 많은 반찬이 놓였다. 엄마가 내 앞으로 빈 접시를 밀었다.'),
      say('엄마', '서울은 어떻노.'), say('나', '괜찮아.'), say('엄마', '니는 맨날 괜찮다 카대. 전화해도 괜찮다, 문자해도 괜찮다.'),
      choose(
        option('괜찮았던 일을 하나씩 이야기한다', { flag: 'toldHomeMyLife', card: '괜찮다는 말 다음' }, [
          n('학식, 민재의 선풍기, 카페 사장님의 플레이리스트. 사소해서 말하지 않았던 일이 식탁 위에 오래 놓였다.'),
          n('엄마는 대답 대신 내 접시에 송편을 하나 더 놓았다. 나는 이번에는 입에 넣기 전에 다음 얘기를 시작했다.')]),
        option('엄마의 요즘 이야기를 묻는다', { flag: 'askedHomeLife', card: '괜찮다는 말 다음' }, [
          say('나', '엄마는? 내가 없으니까 좀 조용해?'), say('엄마', '조용하긴. 니 방 창문이 바람 불 때마다 운다.'),
          n('점심을 먹고 창문 틈에 테이프를 붙였다. 전화로는 몰랐을 소리가 하나 줄었다.')]))
    ] },
    chuseokPacking: { title: '돌아갈 때의 짐', background: 'home', time: 0, lines: [
      n('가방 옆에 반찬통이 세 개 더 늘었다. 엄마는 작은 통은 친구랑 나눠 먹으라고 했다.'),
      say('나', '친구 몇 명인지도 모르면서.'), say('엄마', '있긴 있네. 됐다.'),
      n('나는 뚜껑에 날짜를 적었다. 빈 가방으로 왔는데, 돌아갈 때는 두 손으로 들어야 했다.'),
      choose(option('내일 서울에 도착하면 먼저 연락하겠다고 말한다', { flag: 'homeArrivalPromise' }, [say('엄마', '도착하고 바로 씻지 말고 냉장고부터 넣어라.'), n('나는 알겠다고 했다. 기억할 말을 이번에는 메모하지 않았다.')]))
    ] },
    chuseokReturn: { title: '다시 내 방', background: 'room', time: 0, lines: [
      n('서울의 아침. 반찬통부터 냉장고에 넣고 엄마에게 도착했다고 보냈다. 숫자가 1에서 사라졌다.'),
      n('민재가 문을 세 번 두드렸다. 나는 밥 두 공기를 꺼냈다.'), say('민재', '뭐야. 얼굴이 좀 집 다녀온 얼굴인데.'),
      say('나', '그게 무슨 얼굴이야.'), say('민재', '냉장고가 자신 있는 얼굴.'),
      n('나는 작은 반찬통을 열었다. 서울의 방이 잠깐 두 군데의 집이 됐다.')
    ] },
    lunaLeakStart: { title: '올해 루나는 누구?', background: 'room', time: 3, lines: [
      n('민재의 노크가 평소보다 빨랐다. 휴대폰에는 익명 게시판의 제보가 떠 있었다.'),
      say('민재', '목요일 방송 끝나고 학생회관 비상구로 나온대. 나 루나 누군지 알 것 같아.'),
      say('민재', '3년 내내 댓글만 달았는데 이번엔 내가 첫 글 쓸 수 있어. 이거 올리면—'),
      n('화면에는 출구와 시간만 적혀 있었다. 이름을 모르는 사람도 기다릴 수 있을 만큼 구체적이었다.'),
      choose(
        option('“그 사람이 숨긴 이름을 우리가 먼저 올려도 될까?”', { flag: 'stoppedMinjae' }, [
          say('민재', '…그건 생각 안 해 봤네.'), n('민재가 작성 화면을 닫았다. 하지만 같은 제보는 이미 다른 계정에도 도착해 있었다.'),
          say('민재', '나 말고 누가 올릴 수도 있겠다. 나도 받은 거니까.')]),
        option('민재가 나간 뒤 방송국의 공개 연락처로 알린다', { flag: 'warnedIhyun' }, [
          say('나 · 메시지', '목요일 비상구 앞에 사람들이 모일 것 같아요. 제보가 돌고 있어요.', []),
          say('이현 · 메시지', '확인했어요. 알려 줘서 고마워요. 부원들 안전부터 챙길게요.', []),
          n('이름을 적을 필요는 없었다. 누가 그 안에 있든, 혼자 출구를 나가게 두고 싶지 않았다.')]),
        option('“올리면 정말 누군지 알 수 있을까?”', { flag: 'encouragedLeak' }, [
          say('민재', '목요일엔 알겠지. 올린다?'), n('새 글 알림이 떴다. 댓글이 늘어나는 동안 나는 화면을 내려놓지 못했다.')]))
    ] },
    lunaLeakExit: { title: '불 꺼진 복도', background: 'radio', time: 2, lines: [
      n('목요일 저녁. 학생회관 계단에 휴대폰을 든 사람들이 모였다. 방송국 문에는 촬영 자제 안내문이 붙어 있었다.'),
      say('이현', '부원들은 다른 출구로 나가요. 이쪽은 제가 정리할게요.'),
      n('이현 선배가 계단 쪽으로 걸어 나왔다. 나도 복도 한쪽으로 물러났다.'),
      say('이현', '제가 지난 시즌 루나였습니다. 올해 부원들의 신원을 묻는 촬영은 삼가 주세요.'),
      say('이현', '궁금한 이야기는 방송에서 하겠습니다. 오늘은 돌아가 주세요.'),
      n('몇 사람이 작년 녹음 파일을 틀어 봤다. 같은 목소리라는 말이 퍼지면서, 계단에 앉았던 사람들이 일어났다.'),
      n('나는 뒤쪽 방화문을 받쳐 두었다. 사람이 지나간 뒤에야 문을 놓았다.', [], { effect: { flag: 'sawLeakExit', clue: 'lastSeasonHost' } }),
      n('민재에게 메시지가 왔다. 「나 지금 보고 있어. 이것도 글로 안 쓸게.」', [], { when: { flag: 'stoppedMinjae' } }),
      n('내가 거들었던 글이 화면에서 아직 내려가지 않았다. 나는 더 퍼 나르지 않았다.', [], { when: { flag: 'encouragedLeak' } }),
      choose(option('휴대폰을 넣고 계단이 비워질 때까지 기다린다', { flag: 'keptExitPrivate' }, [
        n('복도 끝에서 방송 준비 표시등이 켜졌다. 오늘 방송을 할지 쉴지는, 그 안의 사람이 정할 일이었다.')]))
    ] },
    lunaLeakAfter: { title: '이름을 남겨 둔 자리', background: 'rooftop', lines: [
      n('옥상에서 나리가 게시판 화면을 껐다. 휴대폰을 주머니에 넣은 뒤에도 손을 빼지 않았다.', ['nari']),
      say('나리', '선배는 졸업할 때 자기가 루나였다고 말하고 싶어 했어. 준비한 방송도 있었고.'),
      say('나리', '근데 내 얼굴 안 나오게 하려고 어제 먼저 말했어. 나 때문에.'),
      n('나리가 먼저 그 이름을 자기 쪽으로 가져왔다. 나는 더 확인하지 않았다.', ['nari'], { effect: { flag: 'knowsLuna' } }),
      say('나리', '그만둘까 봐. 어차피 2월이면… 아직 아무것도 못 정했는데.'),
      choose(
        option('“선배가 지킨 방송으로 고맙다고 말할 수도 있잖아.”', { bond: { nari: 4 }, flag: 'lunaWillContinue' }, [
          say('나리', '…그 말은 방송에서 할 수 있겠다.'), n('나리가 원고 앱을 열었다. 나는 화면이 보이지 않는 쪽에 섰다.', ['nari'])]),
        option('옆에 앉아 그녀가 다음 말을 고를 때까지 기다린다', { bond: { nari: 3 }, selfChoice: 1, flag: 'lunaChoseContinue' }, [
          say('나리', '너는 그만두라고도 하라고도 안 하네.'), say('나', '내가 못 정하겠어. 네가 하고 싶은 말을 듣고 싶어.', ['nari']),
          say('나리', '…한 번 더 할게. 내 말로 고맙다고 해 볼래.')]),
        option('“힘들면 그만둬도 돼.”', { bond: { nari: 1 }, selfChoice: -1 }, [
          say('나리', '응. 그만두는 건 언제든 할 수 있는데.'), n('나리는 그다음 말을 하지 않았다. 나는 난간에서 떨어진 낙엽을 주워 버렸다.', ['nari'])]))
    ] },
    autumnFestival: { title: '맨 앞줄과 맨 뒷줄', background: 'concert', time: 2, lines: [
      n('가을 축제. 봄보다 찬 공기 속으로 조명이 켜졌다. 나는 객석의 빈자리를 찾아 걸었다.'),
      n('약속한 맨 앞줄에 섰다. 무대까지는 얼굴 하나를 알아볼 수 있는 거리였다.', [], { when: { flag: 'frontRowPromise' }, effect: { flag: 'frontRowKept' } }),
      n('무대 맨 뒤의 심벌과 카운트를 보았다. 스틱이 들어 올려지는 순간, 나는 손을 흔들었다.', [], { when: { flag: 'backRowPromise' }, effect: { flag: 'backRowKept' } }),
      n('오른쪽 객석에서 드럼이 가리지 않는 구도를 잡았다. 녹화 버튼을 누르고 휴대폰을 고정했다.', [], { when: { flag: 'filmDaeunPromise' }, effect: { flag: 'filmedDaeun' } }),
      say('나리', '안녕하세요, 한여울 밴드입니다. 오늘은… 외워 둔 말을 조금 빼고 할게요.', undefined, { when: { flag: 'originalLyrics' } }),
      say('나리', '마지막 곡 첫 줄은 원래 가사로 부를게요. 계단에 있던 사람이 알아들을 거예요.', undefined, { when: { flag: 'originalLyrics' } }),
      n('「계단은 무대보다 높다.」 첫 줄 뒤에 작은 침묵이 생겼다. 나리는 그다음 줄도 끝까지 불렀다.', [], { when: { flag: 'originalLyrics' } }),
      say('나리', '안녕하세요, 한여울 밴드입니다! 오늘 날씨 같은 노래 하나 할게요!', undefined, { when: { notFlag: 'originalLyrics' } }),
      n('마지막 곡은 「오늘 밤은 별이 높다」로 시작했다. 좋은 노래였다. 객석에서 큰 박수가 났다.', [], { when: { notFlag: 'originalLyrics' } }),
      n('서진이 객석 뒤쪽에서 고개를 까딱했다. 나는 손을 들었다. 그녀는 마지막 곡이 끝난 뒤 조용히 출구로 갔다.', [], { when: { bond: { seojin: 35 } } }),
      n('공연이 끝나자 통로가 두 갈래로 갈라졌다. 계단 쪽에는 나리의 기타 케이스, 철수 통로에는 드럼 케이스가 보였다.', [], { effect: { flag: 'autumnFestivalSeen', card: '가을 축제의 끝' } }),
      choose(
        option('무대 뒤 계단에서 나리를 기다린다', { bond: { nari: 6 }, flag: 'autumnWithNari' }, [
          n('나리가 계단에 앉았다. 손이 떨리지 않았다.', ['nari']),
          say('나리', '오늘은 다 말해 버려서 그런가 봐. 숨길 게 하나 줄었어.', undefined, { when: { flag: 'originalLyrics' } }),
          say('나리', '맨 앞줄에 있는 거 봤어. 진짜 왔더라.', undefined, { when: { flag: 'frontRowPromise' } }),
          say('나리', '오늘 노래 어땠어? 잘했냐는 말 말고, 그냥 어땠는지 듣고 싶어.'),
          n('나는 한 줄씩 이야기했다. 나리는 중간에 내 말을 대신 끝내지 않았다.', ['nari'])], { met: 'nari' }),
        option('철수 통로에서 다은의 장비 정리를 돕는다', { bond: { daeun: 6 }, flag: 'autumnWithDaeun' }, [
          say('다은', '어? 왜 여기 왔어. 언니한테 가는 줄 알았는데.'), say('나', '심벌 잡아 줄게. 어느 쪽부터 해?', ['daeun']),
          say('다은', '…맨 뒤 봤어?', undefined, { when: { flag: 'backRowPromise' } }),
          say('나', '약속했잖아. 손 흔든 것도 봤어?', ['daeun'], { when: { flag: 'backRowPromise' } }),
          say('다은', '아 진짜. 지금 울면 땀이라고 해 줘.', undefined, { when: { flag: 'backRowPromise' } }),
          say('다은', '영상 나중에 같이 보자. 틀린 데부터 찾지 말고.', undefined, { when: { flag: 'filmDaeunPromise' } }),
          n('다은이 케이스 손잡이 하나를 내게 맡겼다. 우리는 같은 속도로 통로를 걸었다.', ['daeun'])], { all: [{ met: 'daeun' }, { flag: 'daeunJoinedBand' }] }),
        option('오늘은 객석에 남아 마지막 장면을 적는다', { flag: 'autumnOwnPage' }, [
          n('사람들이 빠져나간 객석에 앉았다. 박수가 끝난 뒤의 장면을 공책에 적었다. 다음 곡의 첫 마디가 조금 덜 막막했다.')]))
    ] }
  };
  Object.assign(root.AQUA_SCENES, scenes);
  const rules = [
    { id: 'nariCard', place: 'roof', from: '2026-09-07', to: '2026-09-30', bond: { nari: 35 } },
    // A closed curtain is an unseen broadcaster, never a visible heroine itinerary.
    { id: 'nariStudio', place: 'radio', from: '2026-09-03', to: '2026-12-17', day: 4, slot: 1, club: 'radio', bond: { nari: 30 } },
    { id: 'nariAngry', place: 'class', from: '2026-09-07', to: '2026-12-17', priority: 3, bond: { nari: 45 }, any: [{ flag: 'questionedRadio' }, { flag: 'boothPeeked' }] },
    { id: 'nariBirthday', place: 'club', from: '2026-10-14', to: '2026-10-14', priority: 5, bond: { nari: 25 } },
    { id: 'nariFright', place: 'club', from: '2026-09-09', to: '2026-10-27', bond: { nari: 35 } },
    { id: 'nariFight', place: 'concert', from: '2026-10-19', to: '2026-10-27', priority: 3, seen: 'nariLyrics', bond: { nari: 45 } },
    { id: 'daeunAlone', place: 'river', from: '2026-09-07', to: '2026-12-10', slot: 2, bond: { daeun: 40 } },
    { id: 'daeunBack', place: 'club', from: '2026-10-01', to: '2026-10-27', slot: 2, flag: 'daeunJoinedBand', bond: { daeun: 30, nari: 25 } },
    { id: 'seojinFight', place: 'cafe', from: '2026-09-07', to: '2026-10-16', work: true, seen: 'seojinPool', bond: { seojin: 35 } },
    { id: 'seojinDream', place: 'river', from: '2026-10-05', to: '2026-11-20', seen: 'seojinFight', bond: { seojin: 40 } },
    { id: 'crossRegular', place: 'cafe', from: '2026-10-07', to: '2026-10-28', day: 3, slot: 2, work: true, priority: 2, flag: 'knowsOffer', bond: { seojin: 30, nari: 25 } },
    { id: 'lunaLeakAfter', place: 'roof', from: '2026-10-16', to: '2026-10-23', priority: 3, seen: 'lunaLeakExit', bond: { nari: 35 } }
  ];
  root.AquaStory.rules.push(...rules);
  for (const rule of rules) W.routeOwners[rule.id] = rule.id === 'nariStudio' ? [] : rule.id === 'crossRegular' ? ['seojin', 'nari'] : [rule.id.startsWith('daeun') ? 'daeun' : rule.id.startsWith('seojin') ? 'seojin' : 'nari'];
  // A missed introductory relationship event can still be resolved this school year.
  for (const gate of root.AquaRelationships.gates) root.AquaStory.rules.find(rule => rule.id === gate.id).to = '2027-02-24';
  root.AquaStory.rules.find(rule => rule.id === 'crossRain').to = '2027-02-24';
  function away(state) { return !!state.flags.chuseokHome && state.date >= '2026-09-24' && state.date <= '2026-09-26'; }
  function mandatory(state, slot) {
    const id = ({ '2026-09-24:0': 'chuseok', '2026-10-12:3': 'lunaLeakStart', '2026-10-15:2': 'lunaLeakExit', '2026-10-28:2': 'autumnFestival' })[`${state.date}:${slot}`] ||
      (state.flags.chuseokHome && slot === 0 ? ({ '2026-09-25': 'chuseokMorning', '2026-09-26': 'chuseokPacking', '2026-09-27': 'chuseokReturn' })[state.date] : null);
    return id && !state.seen.includes(id) ? id : null;
  }
  root.AquaAutumn = { scenes, rules, mandatory, away };
})(typeof window !== 'undefined' ? window : globalThis);
