/* Late autumn and the first winter: a confession changes the following days. */
(function (root) {
  'use strict';
  const W = root.AquaWorld, Love = root.AquaRomance;
  const person = { 나리: 'nari', 다은: 'daeun', 서진: 'seojin' };
  const n = (text, cast = [], extra = {}) => ({ text, cast, ...extra });
  const say = (speaker, text, cast, extra = {}) => ({ speaker, text, cast: cast ?? [person[speaker]].filter(Boolean), ...extra });
  const option = (label, effect, lines, when) => ({ label, effect, lines, ...(when ? { when } : {}) });
  const choose = (...choice) => ({ choice });
  const scenes = {
    lastWeek: { title: '마지막 사연을 위한 빈칸', background: 'room', time: 0, lines: [
      n('2월 마지막 주. 학교 방송국에서 이번 목요일이 시즌 마지막 방송이라는 공지가 올라왔다.'),
      n('사연함은 수요일 밤까지 열린다. 보내고 싶은 말을 적었다 지우는 것과 실제로 보내는 것은 여전히 다른 일이었다.'),
      n('발표회에서 들려준 여덟 마디의 녹음 파일이 책상 위 휴대폰에 남아 있었다.', [], { when: { flag:'winterShowcasePerformed' } }),
      n('발표회에서 적었던 감상 카드처럼, 누군가의 이야기를 들은 뒤 남기는 말도 있다는 생각이 들었다.', [], { when: { flag:'winterShowcaseAttended' } }),
      choose(
        option('방송을 듣기 전에 내 이야기를 메모한다', { flag:'lastWeekWrite', card:'마지막 사연을 위한 빈칸' }, [n('종이에 첫 문장을 썼다. 사연을 보낼지는 밤에 다시 정하기로 했다. 아직 전송 버튼은 누르지 않았다.')]),
        option('이번에는 마지막까지 듣는 시간을 비워 둔다', { flag:'lastWeekListen', card:'마지막 사연을 위한 빈칸' }, [n('목요일 밤 일정에 작은 동그라미를 그렸다. 그날까지 사연을 보내기로 약속한 것은 아니었다.')]))
    ] },
    winterShowcase: { title: '끝나지 않은 곡들의 밤', background: 'concert', time: 2, lines: [
      n('2월 13일. 학생회관의 작은 공연장에는 「진행 중인 곡도 환영」이라고 적힌 종이가 붙어 있었다.'),
      n('무대 옆 접수대에는 빈 순서표가 놓였다. 이름을 적고 나서도 취소할 수 있다는 안내가 그 아래에 있었다.'),
      n('새해에 후보로 적어 둔 여덟 마디를 다시 들었다. 의자 소리가 나는 파일은 지우지 않았다.', [], { when: { flag: 'winterShowcaseMusic' } }),
      n('처음에는 다른 사람의 이야기를 들으러 오기로 했다. 접수대 앞에서 마음이 바뀌어도 괜찮았다.', [], { when: { flag: 'winterShowcaseListen' } }),
      n('나리가 무대에 올라 악보를 펼쳤다. 연습실에서 보여 줬던 후렴 전까지의 멜로디가 이어졌다.', ['nari'], { when: { all: [{ seen: 'nariFebruary' }, { flag: 'nariWinterOwnSong' }] } }),
      n('나리가 무대에 올라 악보를 펼쳤다. 그날 발표회에서 들려주겠다던 곡이었다.', ['nari'], { when: { all: [{ seen: 'nariFebruary' }, { notFlag: 'nariWinterOwnSong' }] } }),
      say('나리', '아직 뒤는 못 썼어요. 오늘은 여기까지 부를게요.', undefined, { when: { seen: 'nariFebruary' } }),
      n('마지막 음이 끝난 뒤에도 나리는 바로 인사하지 않았다. 침묵을 기다린 뒤에야 객석에서 박수가 났다.', ['nari'], { when: { seen: 'nariFebruary' } }),
      n('다은이 객석에서 손가락으로 박자를 세다가, 비어 있는 한 마디에서는 손을 멈췄다. 합주실에서 함께 남겨 둔 자리 같았다.', ['daeun'], { when: { all: [{ seen: 'daeunFebruary' }, { flag: 'daeunWinterSpace' }] } }),
      n('순서표 마지막 칸이 아직 비어 있었다. 나는 접수대에 놓인 펜을 집었다.'),
      choose(
        option('미완성 멜로디를 직접 들려준다', { flag: 'winterShowcasePerformed', card: '끝나지 않은 곡들의 밤' }, [
          n('나는 순서표에 이름을 썼다. 완성된 곡이 아니라고 먼저 말하고 첫 음을 눌렀다.'),
          n('여덟 번째 마디는 질문처럼 끝났다. 다음 음을 급하게 덧붙이지 않자 객석에서도 잠깐 기다리는 시간이 생겼다.'),
          say('나리', '그 끝, 들었어. 기다릴 수 있는 끝이네.', undefined, { when: { seen: 'nariFebruary' } }),
          n('박수를 받고 돌아와 악보 구석에 오늘 날짜를 썼다. 다음 음은 다음에 고르기로 했다.')]),
        option('객석에서 끝까지 듣고 한 곡에 감상을 남긴다', { flag: 'winterShowcaseAttended', card: '끝나지 않은 곡들의 밤' }, [
          n('나는 순서표 대신 객석에 남았다. 어떤 곡은 중간에 멈췄고, 어떤 곡은 같은 후렴을 두 번 불렀다.'),
          n('감상 카드에 「다음 음이 궁금했어요」라고 적어 접수대에 놓았다. 모르는 누군가에게 보낼 수 있는 가장 솔직한 문장이었다.'),
          say('나리', '들으러 와 줬네. 다 쓴 다음 말고, 오늘 들려줘서 다행이다.', undefined, { when: { seen: 'nariFebruary' } })])) ,
      n('공연장 밖에서 엄마에게 짧게 연락했다. 잘했는지보다 오늘 어떤 기분이었는지 적었다.', [], { when: { flag: 'lunarSharedPlans' } }),
      n('밤공기는 차가웠지만 학생회관 문틈으로 아직 조율하는 소리가 들렸다. 끝나지 않은 곡이 하나 더 남아 있었다.')
    ] },
    winterPlans: { title: '완성하지 않아도 되는 초대', background: 'room', time: 0, lines: [
      n('달력의 1월이 반쯤 지났다. 학교에서 다음 학기 등록 안내와 함께 작은 겨울 발표회 공지를 보냈다.'),
      n('완성된 곡만 내는 자리가 아니었다. 만들고 있는 것을 들려주고, 다음에 무엇을 할지 이야기하는 자리라고 했다.'),
      n('새해에 다시 들었던 파일을 열었다. 의자를 끄는 소리 뒤로 작게 흥얼거린 음이 남아 있었다.', [], { when: { flag: 'januaryMusic' } }),
      n('새해에 열었다 닫았던 대화창이 생각났다. 누군가의 시간을 빌리기 전에 내가 하고 싶은 이야기를 먼저 정리하기로 했다.', [], { when: { flag: 'januaryContact' } }),
      choose(
        option('미완성 멜로디를 발표회 후보로 적어 둔다', { flag: 'winterShowcaseMusic', card: '완성하지 않아도 되는 초대' }, [n('끝을 정하지 않은 여덟 마디. 파일 이름에 「후보」라고 덧붙였다. 제출하기 전까지는 바꿀 수 있었다.')]),
        option('발표회에 가서 다른 사람의 이야기를 들어 보기로 한다', { flag: 'winterShowcaseListen', card: '완성하지 않아도 되는 초대' }, [n('일정 옆에 「먼저 듣기」라고 적었다. 무대에 서지 않아도 그 자리에 갈 이유는 있었다.')]))
    ] },
    nariFebruary: { title: '두 번째 질문의 답', background: 'practice', lines: [
      n('나리가 휴대폰에 받은 답장을 보여 주었다. 질문마다 줄이 나뉘어 있었다.', ['nari']),
      say('나리', '내 곡은 일단 들어 볼 수 있대. 학교랑 공연 일정은 계약하기 전에 다시 맞춰 보자고 했고.'),
      say('나리', '지난번에 내가 읽었던 질문 두 개. 보내기 전에 입으로 읽어서 다행이었어.', undefined, { when: { flag: 'nariJanuaryListened' } }),
      say('나리', '답장 기한도 물어봤어. 다음 달 초까지래. 오늘 결정해야 하는 건 아니야.', undefined, { when: { notFlag: 'nariJanuaryListened' } }),
      say('나리', '겨울 발표회에서 한 곡 불러 볼까 해. 잘 부르는 노래 말고, 쓰고 있는 노래.'),
      say('나리', '네가 후보라고 적은 곡도 듣고 싶어. 안 들려줘도 괜찮고.', undefined, { when: { flag: 'winterShowcaseMusic' } }),
      choose(
        option('“네가 들려주고 싶은 부분부터 들을게.”', { bond: { nari: 4 }, selfChoice: 1, flag: 'nariWinterOwnSong', card: '두 번째 질문의 답', care: 'nari' }, [say('나리', '그럼 후렴 전까지만. 그다음은 아직 내가 모르겠어.'), n('나리는 틀린 곳에서 멈추지 않았다. 끝나자 내 쪽을 먼저 보았다.', ['nari'])]),
        option('“발표회에 가서 들을게.”', { bond: { nari: 2 }, flag: 'nariWinterAudience', card: '두 번째 질문의 답', care: 'nari' }, [say('나리', '응. 그날은 무대에서 들려줄게.'), n('나리는 악보에 작은 별을 그리고 옆에 날짜를 적었다.', ['nari'])]))
    ] },
    seojinFebruary: { title: '첫 칸의 이름', background: 'cafe', lines: [
      n('서진이 계산대에 접힌 메모를 놓았다. 귀퉁이가 물에 젖어 글씨가 조금 번졌다.', ['seojin']),
      say('서진', '오늘 수업 끝났어. 한 명이 물에 얼굴 대고 나오더니 자기가 해냈대.', undefined, { when: { flag: 'seojinHired' } }),
      say('서진', '지원한 곳에서 참관해 보라고 연락 왔어. 아직 채용은 정해진 거 없어.', undefined, { when: { all: [{ flag: 'seojinApplied' }, { notFlag: 'seojinHired' }] } }),
      say('서진', '구민 수영장 강사 모집 공고를 봤어. 아직 지원은 안 했고, 먼저 가서 물어보려고.', undefined, { when: { notFlag: 'seojinApplied' } }),
      say('서진', '네가 첫 칸에 뭘 쓸 거냐고 물었지. 아직도 이름부터 적고 있어.', undefined, { when: { flag: 'seojinJanuaryAsked' } }),
      say('서진', '조급해지면 내가 잘하던 때부터 떠올라. 근데 오늘은 지금 할 수 있는 걸 적어 봤어.'),
      choose(
        option('“오늘 해낸 걸 누나도 하나 적어.”', { bond: { seojin: 4 }, flag: 'seojinWinterProgress', card: '첫 칸의 이름', care: 'seojin' }, [say('서진', '남한테만 시킬 생각이었는데. 알았어, 한 줄.'), n('서진은 메모 끝에 「오늘도 물 쪽으로 갔다」라고 썼다. 다 쓴 종이를 내게 넘기지 않고 자기 주머니에 넣었다.', ['seojin'])]),
        option('메모가 마를 때까지 컵을 정리한다', { bond: { seojin: 2 }, card: '첫 칸의 이름', care: 'seojin' }, [say('서진', '손님 없을 때 잠깐 말하려고 했어. 잘 들었지?'), n('나는 고개를 끄덕이고 마른 행주를 건넸다.', ['seojin'])]))
    ] },
    daeunFebruary: { title: '빈 의자가 있는 합주', background: 'practice', lines: [
      n('합주실 의자 하나가 비어 있었다. 다은은 그 의자를 벽에 붙여 두고 스틱을 돌렸다.', ['daeun']),
      say('다은', '오늘 한 명 못 온대. 미리 알려 줬어. 빈자리 두고 그냥 하려고.'),
      say('다은', '네가 되는 시간 알려 준 거 기준으로 잡았는데, 다른 애한테도 따로 물어봤어.', undefined, { when: { flag: 'daeunJanuaryTime' } }),
      say('다은', '네가 와서 다 채워진 거라고는 안 할래. 빈 건 빈 거지. 그래도 네가 와서 좋아.'),
      choose(
        option('빠진 파트가 들어올 자리를 비워 두고 박자를 센다', { bond: { daeun: 4 }, flag: 'daeunWinterSpace', card: '빈 의자가 있는 합주', care: 'daeun' }, [say('다은', '좋아. 여기서 한 마디 쉬고, 그다음 같이.'), n('우리는 빈 마디를 건너뛰지 않았다. 다은이 웃으며 다음 박자를 세었다.', ['daeun'])]),
        option('오늘 녹음을 빠진 사람에게 보내자고 한다', { bond: { daeun: 2 }, card: '빈 의자가 있는 합주', care: 'daeun' }, [say('다은', '응. 바쁠 테니까 답은 나중에 해도 된다고 같이 보내자.'), n('다은은 전송하기 전에 파일을 한 번 들어 봤다.', ['daeun'])]))
    ] },
    lunarNewYear: { title: '전화 너머의 설날', background: 'room', time: 0, lines: [
      n('설날 아침. 냉장고 속 반찬통을 꺼내다가 엄마에게서 전화가 왔다.'),
      say('엄마', '떡국은 묵었나? 거긴 눈 온다 카던데.'),
      n('추석에 직접 받아 온 반찬통이 아직 하나 남아 있었다. 그때보다 통이 가벼워졌다.', [], { when: { flag: 'chuseokHome' } }),
      n('추석에도 서울에서 전화를 받았었다. 이번에는 내가 먼저 화면을 켜 엄마에게 창밖을 보여 줬다.', [], { when: { notFlag: 'chuseokHome' } }),
      say('엄마', '니 방 창문은 아직도 바람 불면 운다. 손봐야지 하면서 그냥 둔다.'),
      choose(
        option('이번 겨울에 하고 있는 일을 구체적으로 말한다', { flag: 'lunarSharedPlans', card: '전화 너머의 설날' }, [say('나', '아직 끝내진 못했는데, 학교 발표회가 있어서 생각 중이야.'), say('엄마', '끝나면 전화해라. 잘했나 말고 니가 어땠는지 듣게.')]),
        option('엄마의 설날은 어떤지 먼저 묻는다', { flag: 'lunarAskedHome', card: '전화 너머의 설날' }, [say('엄마', '지금? 니 외삼촌이 떡국 두 그릇째다. 내 그릇 뺏어 가기 전에 끊어야겠다.'), n('전화 너머에서 숟가락 부딪히는 소리가 났다. 나는 웃으며 새해 인사를 다시 했다.')]))
    ] },
    januaryStart: { title: '비워 둔 시간표', background: 'room', time: 0, lines: [
      n('새해 첫 월요일. 알람을 끄고도 한동안 누워 있었다. 방학에는 수업이 없는데도 시간표부터 찾게 됐다.'),
      n('다음 학기 등록 안내가 도착해 있었다. 아직 빈칸인 달력 옆에, 겨울 동안 해 보고 싶은 일을 하나 적기로 했다.'),
      choose(
        option('끝내지 못한 곡의 첫 소절을 다시 듣는다', { flag: 'januaryMusic' }, [n('녹음 파일을 틀자 마지막 음 다음에 의자를 끄는 소리가 났다. 잘못 녹음된 부분까지 그대로 듣고 제목 옆에 물음표를 적었다.')]),
        option('연락을 미뤄 둔 사람에게 안부를 전할 용기를 낸다', { flag: 'januaryContact' }, [n('대화창을 열었다 닫고, 오늘 만날 수 있는 시간을 먼저 확인했다. 누구에게 보낼지는 아직 정하지 않았다.')]))
    ] },
    nariJanuary: { title: '답장하기 전의 질문', background: 'practice', lines: [
      n('연습실 문틈으로 짧은 음이 새어 나왔다. 나리는 악보 위에 휴대폰을 올려두고 있었다.', ['nari']),
      say('나리', '회사에서 다시 연락 왔어. 이번엔 내가 쓰는 곡을 어떻게 할 건지 물어보려고.'),
      say('나리', '그때 명함 뒤에 적었던 질문, 아직 가지고 있어.', undefined, { when: { flag: 'nariAskedOwnSongs' } }),
      say('나리', '네가 고른 다음 얘기도 듣겠다고 했잖아. 아직 고르기 전인데도 얘기해도 돼?', undefined, { when: { flag: 'nariDecisionTrusted' } }),
      say('나리', '지난번에 내 대답 들었지. 오늘은 노래 얘기부터 할래.', undefined, { when: { lover: 'nari' } }),
      say('나리', '계약서를 받는다고 바로 사인하는 건 아니잖아. 내가 확인할 수 있는 것부터 적고 있어.'),
      choose(
        option('나리가 적은 질문을 읽을 때까지 기다린다', { bond: { nari: 4 }, flag: 'nariJanuaryListened', card: '답장하기 전의 질문', care: 'nari' }, [say('나리', '내 곡을 내가 고를 수 있는지, 공연이랑 학교를 계속할 수 있는지. 이 두 개는 꼭 물어볼래.'), n('나리는 질문 두 개를 소리 내어 읽었다. 답을 쓰는 손은 나리의 것이었다.', ['nari'])]),
        option('“답을 바로 하지 않아도 돼.”', { bond: { nari: 2 }, card: '답장하기 전의 질문', care: 'nari' }, [say('나리', '응. 대신 언제까지 답하면 되는지는 오늘 물어볼게.'), n('나리는 날짜를 확인하는 메시지를 보냈다.', ['nari'])]))
    ] },
    seojinJanuary: { title: '수심 1m', background: 'cafe', lines: [
      n('마감 전 카페. 서진은 영수증 뒷면에 네모난 칸들을 그리고 있었다.', ['seojin']),
      say('서진', '다음 수업 계획이야. 깊은 물에 들어가기 전에 물에 얼굴 대는 것부터.', undefined, { when: { flag: 'seojinHired' } }),
      say('서진', '지원한 곳에서 연락 기다리는 중이야. 수업 계획은 미리 써 보고 있어.', undefined, { when: { all: [{ flag: 'seojinApplied' }, { notFlag: 'seojinHired' }] } }),
      say('서진', '아직 지원한 건 아니야. 내가 어떤 수업을 하고 싶은지 먼저 적어 보는 중.', undefined, { when: { notFlag: 'seojinApplied' } }),
      say('서진', '나도 처음부터 깊은 데 들어간 건 아니었거든. 누가 내 속도를 기다려 준 적이 있어.'),
      say('서진', '오늘은 애인한테 자랑하는 거야. 평가받으려고 보여 주는 건 아니고.', undefined, { when: { lover: 'seojin' } }),
      choose(
        option('“첫 칸에는 뭘 적을 거야?”', { bond: { seojin: 4 }, flag: 'seojinJanuaryAsked', card: '수심 1m', care: 'seojin' }, [say('서진', '이름. 물 무서워하는 애도, 신나서 뛰는 애도. 이름부터 부르려고.'), n('서진은 첫 칸에 「이름 묻기」라고 썼다. 펜 끝이 종이를 한 번 더 눌렀다.', ['seojin'])]),
        option('계획표를 잡아 주고 서진이 쓰는 것을 지켜본다', { bond: { seojin: 2 }, card: '수심 1m', care: 'seojin' }, [say('서진', '고마워. 종이 자꾸 말려서 짜증 났거든.'), n('서진은 빈 칸을 전부 채우지 않았다. 아이들을 만나고 적을 자리라고 했다.', ['seojin'])]))
    ] },
    daeunJanuary: { title: '한 사람에게 보내는 박자', background: 'practice', lines: [
      n('합주실에서 다은이 드럼 스틱을 무릎에 올려놓고 휴대폰을 보고 있었다.', ['daeun']),
      say('다은', '방학 합주 잡으려는데 단톡방에 올리기 전에 한 명씩 물어보려고. 다들 되는 시간 다를 테니까.'),
      say('다은', '네가 먼저 약속 잡았던 거 기억나. 나도 이번에는 먼저 물어볼래.', undefined, { when: { flag: 'daeunNextDateAsked' } }),
      say('다은', '나한테도 날짜 비워 두라고 할 거야? 애인이라고 자동 참석 처리 안 해 줌ㅋㅋ', undefined, { when: { lover: 'daeun' } }),
      say('다은', '다 같이 못 와도 합주는 할 거야. 사람이 적다고 없는 일이 되는 건 아니니까.'),
      choose(
        option('“내가 되는 시간부터 알려 줄게.”', { bond: { daeun: 4 }, flag: 'daeunJanuaryTime', card: '한 사람에게 보내는 박자', care: 'daeun' }, [say('다은', '좋아. 그럼 다른 애들한테도 따로 물어볼게.'), n('다은이 내 대답을 적고 다음 대화창을 열었다. 출석 인원 대신 이름들이 하나씩 늘어났다.', ['daeun'])]),
        option('다은이 짧게 두드린 리듬에 박수를 맞춘다', { bond: { daeun: 2 }, card: '한 사람에게 보내는 박자', care: 'daeun' }, [say('다은', '오, 너 방금 한 박자 늦었어. 다시!'), n('두 번째에는 박수가 드럼 소리와 겹쳤다.', ['daeun'])]))
    ] },
    daeunFight: { title: '나간 사람', background: 'river', time: 2, lines: [
      n('강변 계단에 다은이 앉아 있었다. 단톡방 이름 옆에 있던 다은의 이름이 오늘은 보이지 않았다.', ['daeun']),
      say('다은', '나갔어. 실수 아니고. 내가 없으면 누가 알아줄까 싶어서.'),
      say('다은', '개인톡은 왔어. 왜 나갔냐고. 근데 그다음엔 다들 바빠지더라.'),
      n('다은이 내 쪽을 봤다. 나는 휴대폰을 넣고 계단에 앉았다.', ['daeun']),
      say('다은', '너한테도 답 기다린 적 있어. 안 기다린 척했는데.', undefined, { when: { ignoredMessage: 'daeun' } }),
      say('다은', '혼자 있어 보겠다고 했잖아. 근데 혼자 있고 싶은 거랑, 없어져도 되는 사람이 되고 싶은 건 다르더라.'),
      say('다은', '누가 찾으러 오나 시험하는 거, 나도 별로인 거 알아. …이 말 하려고 나간 건 아닌데.'),
      choose(
        option('“다음엔 나가지 말고 말해 줘. 나도 답할게.”', { bond: { daeun: 6 }, flag: 'daeunReconciled', card: '다시 들어온 방', care: 'daeun' }, [
          say('다은', '말하면 들어 줄 거야? 서운하다는 얘기, 매번 웃기지도 않을 텐데.'),
          say('나', '지금도 듣고 있잖아. 나도 바로 답 못 할 때는 그렇다고 말할게.', ['daeun']),
          n('다은이 초대 링크를 눌렀다. 「실수였음ㅋㅋ」이라는 새 인사가 올라왔다.', ['daeun']),
          say('다은', '이건 거짓말이네. 실수 아니었는데. 다음엔 너한테는 말할게.')]),
        option('“찾으러 와서 다행이다. 네가 여기 있었네.”', { bond: { daeun: 3 }, flag: 'daeunFound', care: 'daeun' }, [
          say('다은', '…응. 사과받으려고 부른 건 아니었어. 부르지도 못했지만.'),
          n('다은이 휴대폰을 뒤집어 들었다. 나는 돌아가자고 먼저 말하지 않았다.', ['daeun']),
          say('다은', '조금만 있다 갈게. 방에는 다시 들어갈 거야.')]),
        option('“다들 걱정했어. 같이 돌아가자.”', { bond: { daeun: 1 }, flag: 'daeunReturnedForOthers' }, [
          say('다은', '다들… 응. 놀랐겠지.'), n('다은이 계단에서 일어났다. 나는 그녀가 들고 있던 빈 컵을 받아 쓰레기통을 찾았다.', ['daeun']),
          say('다은', '걱정 끼친 건 미안하다고 해야겠다.')]))
    ] },
    nariRecord: { title: '녹음실의 새벽', background: 'night', time: 0, lines: [
      n('11월 19일 아침. 첫 버스가 오기 전 정류장에서 나리를 만났다. 손에는 다른 작곡가의 이름이 적힌 악보가 들려 있었다.', ['nari'], { effect: { stats: { knowledge: 1, energy: -5 } } }),
      say('나리', '회사 테스트 녹음. 다른 가수가 부를 곡, 먼저 불러 주는 거야. 하루 종일 걸릴 수도 있대.'),
      say('나리', '아직 뭘 고른 건 아니야. 가서 해 봐야 내 생각도 알 것 같아서.'),
      say('나리', '축제 끝나고 계단에서 네가 해 준 노래 얘기, 기억나. 이상하게 그 말이 오래 남더라.', undefined, { when: { flag: 'autumnWithNari' } }),
      say('나리', '오늘은 남의 곡이지만, 내가 어떤 소리를 내고 싶은지도 들어 보려고.'),
      n('버스 도착 숫자가 하나 줄었다. 나리가 악보 끝을 손바닥으로 눌렀다.', ['nari']),
      choose(
        option('버스가 올 때까지 옆에서 기다린다', { bond: { nari: 5 }, selfChoice: 1, card: '녹음실의 새벽', care: 'nari' }, [
          say('나리', '가지 말라고 안 해?'), say('나', '네가 가 보겠다고 한 거잖아.', ['nari']),
          say('나리', '응. 내가 가 보는 거야.'), n('나리가 버스에 올랐다. 문이 닫히기 전에 손을 한 번 들었다.', ['nari']),
          say('나리', '끝나면… 오늘은 그냥 끝내도 되지?')]),
        option('“잘하고 와. 네가 부른 노래는 다 좋았어.”', { bond: { nari: 3 }, card: '녹음실의 새벽', care: 'nari' }, [
          say('나리', '…응. 오늘도 잘 부를게.'), n('버스 창문에 나리의 얼굴이 비쳤다. 나는 어떤 표정인지 끝까지 알 수 없었다.', ['nari'])]),
        option('“오늘 안 가고 쉬면 안 돼?”', { selfChoice: -1 }, [
          say('나리', '쉬고 싶기도 한데. 그건 다녀와서 내가 말할게.'), n('나는 고개를 끄덕였다. 나리가 먼저 버스 계단을 올랐다.', ['nari'])]))
    ] },
    nariPaper: { title: '두 장의 종이', background: 'practice', lines: [
      n('나리가 꺼진 앰프 옆에 종이들을 늘어놓았다. 계약서와 휴학 신청서, 다음 학기 공연 신청서였다.', ['nari']),
      n('맨 아래에는 방송국 진행자 연장 신청서가 있었다. 진행자명 칸에 루나라고 적혀 있었다.', ['nari'], { when: { flag: 'knowsLuna' } }),
      n('나리가 맨 아래 종이를 계약서 밑으로 밀었다. 방송국 이름의 일부만 보였다.', ['nari'], { when: { notFlag: 'knowsLuna' } }),
      say('나리', '녹음 잘했대. 남의 노래처럼 안 들린다고. 칭찬은 맞는 것 같아.'),
      say('나리', '그날 정류장에서 가 보면 알 것 같다고 했잖아. 다녀오니까 오히려 더 물어볼 게 생겼어.', undefined, { when: { seen: 'nariRecord' } }),
      say('나리', '근데 집에 와서 내 목소리로 말을 하려니까 한 마디도 안 나왔어.'),
      say('나리', '선택지가 많아지면 쉬울 줄 알았는데, 고르지 않으면 없어지는 것도 많네.'),
      choose(
        option('“네가 고른 거면, 고른 다음 얘기도 들을게.”', { bond: { nari: 6 }, selfChoice: 1, flag: 'nariDecisionTrusted', card: '두 장의 종이', care: 'nari' }, [
          say('나리', '…일단 고르기만 하면 끝인 줄 알았어.'), say('나리', '고른 다음에도 얘기할 수 있겠네.'),
          n('나리는 공연 신청서를 계약서 옆에 놓았다. 어느 것도 구겨 넣지 않았다.', ['nari'])]),
        option('“계약하면 네가 쓴 노래는 언제 부를 수 있대?”', { bond: { nari: 3 }, flag: 'nariAskedOwnSongs', care: 'nari' }, [
          say('나리', '나중에. 잘되고 나서. 다들 그렇게 말해.'), say('나리', '그 나중이 언젠지는 다시 물어봐야겠어.'),
          n('나리는 명함 뒤에 질문을 적었다. 처음으로 답을 듣기 위한 문장이었다.', ['nari'])]),
        option('“내년에도 같은 무대에서 보고 싶어.”', { bond: { nari: 2 }, selfChoice: -1 }, [
          say('나리', '그 말 좋아. 근데 그건 네가 원하는 거네.'), n('나리는 웃었다. 나는 그 말이 맞다고 대답했다.', ['nari'])]))
    ] },
    seojinConfess: { title: '첫눈', background: 'riverSnow', time: 2, lines: [
      n('서진에게서 연락이 왔다. 일이 끝나면 강 쪽으로 잠깐 걷자고. 카페 앞에서 기다리는데 작은 눈발이 내려왔다.', ['seojin']),
      say('서진', '나 합격했어. 어린이 수영 강사. 다음 달부터 들어가. 이 얘긴 네 얼굴 보고 하고 싶었어.', undefined, { when: { flag: 'seojinApplied' }, effect: { flag: 'seojinHired' } }),
      say('서진', '지원서는 아직 못 보냈어. 잘돼 가는 척은 안 할게. 그래도 너한테는 지금 어디쯤인지 말하고 싶었어.', undefined, { when: { notFlag: 'seojinApplied' } }),
      say('서진', '그날 내가 기다리라고 했지. 말 골랐어. 오늘은 내가 먼저 할게.', undefined, { when: { flag: 'seojinReconciled' } }),
      say('서진', '그날 서로 짧게 말하고 끝낸 뒤로 생각 많이 했어. 오늘은 끝까지 말해 보려고.', undefined, { when: { all: [{ seen: 'seojinFight' }, { notFlag: 'seojinReconciled' }] } }),
      n('서진이 손바닥에 눈을 받았다. 바로 녹았다. 그녀는 손을 털지 않았다.', ['seojin'], { illustration:'seojinFirstSnow', effect:{flag:'sawSeojinFirstSnow'} }),
      say('서진', '나 너 좋아해. 알바생 말고, 너. 눈치챘을 것 같아도 이 말은 직접 하고 싶었어.'),
      say('서진', '지금 사귀는 사람이 있는 건 알아. 내가 말하는 것과 네가 대답하는 건 다른 거니까, 제대로 대답해 줘.', undefined, { when: { hasLovers: true } })
    ] },
    daeunConfess: { title: '종강 파티가 끝나고', background: 'river', time: 2, lines: [
      n('2학기 종강 파티가 끝났다. 다은이 남은 물건을 챙기다 나만 조용히 불렀다.', ['daeun']),
      n('강변까지 걸어 나온 다은은 코트 소매를 여미고 난간에 기댔다. 휴대폰은 뒤집어 든 채였다.', ['daeun'], { illustration:'daeunTermEnd', effect:{flag:'sawDaeunTermEnd'} }),
      say('다은', '오늘 인원 안 셌다. 네가 어디 앉았는지만 보느라.'),
      say('다은', '나 고등학교 때 나만 없는 단톡방이 있었대. 졸업식 날 알았어. 그래서 자꾸 숫자부터 봐.'),
      say('다은', '오늘은 숫자보다 얼굴이 먼저 보였어. 네 얼굴.'),
      say('다은', '그때 나가지 말고 말하라고 했잖아. 그래서 말할게.', undefined, { when: { flag: 'daeunReconciled' } }),
      say('다은', '이번엔 없어지지 않고 말해 보려고.', undefined, { when: { notFlag: 'daeunReconciled' } }),
      say('다은', '맨 뒤에서는 다 보인다? 근데 오늘은 여기서 너 보고 말하려고.', undefined, { when: { flag: 'backRowPromise' } }),
      say('다은', '나 너한테 특별한 사람이고 싶어. 친구 말고. …좋아해.'),
      say('다은', '누구랑 사귀는지 알아. 그러니까 더, 대충 좋은 말만 하지는 마.', undefined, { when: { hasLovers: true } })
    ] },
    winterTermEnd: { title: '시간표의 마지막 칸', background: 'campus', time: 2, lines: [
      n('종강. 공책 마지막 페이지에 다음 학기라는 말을 적었다가, 아직 오지 않은 달의 이름을 지웠다.'),
      say('민재', '방학 때 뭐 하냐. 이번엔 헬기 선풍기 안 빌릴게. 겨울이니까.'),
      say('나', '그럼 히터도 고장 났어?'), say('민재', '불길한 소리 하지 마. 지금도 연장선이 좀 따뜻해.'),
      choose(
        option('다음 곡의 제목부터 적는다', { flag: 'winterOwnSong' }, [n('끝내지 못한 곡 이름 아래에 빈 날짜를 남겼다. 방학 동안 바뀌어도 되는 계획 하나였다.')]),
        option('방학에 먼저 연락할 사람을 생각한다', { flag: 'winterReachOut' }, [n('누가 먼저 연락하나 세지 않고, 내가 하고 싶은 인사부터 메모했다.')]))
    ] },
    seojinCouple: { title: '마감이 아닌 약속', background: 'river', lines: [
      n('서진이 앞치마 없이 약속 장소에 왔다. 손을 흔들까 고민하는 사이 그녀가 먼저 내 손목을 가볍게 잡았다.', ['seojin']),
      say('서진', '오늘은 알바생이라고 안 부를게. 일하러 온 거 아니니까.'),
      say('서진', '수업에 들어가면 애들 이름부터 부를 거야. 기록 말고.', undefined, { when: { flag: 'seojinHired' } }),
      say('서진', '아직 정하지 못한 것도 있는데, 네가 물어봐 주는 건 괜찮아.', undefined, { when: { notFlag: 'seojinHired' } }),
      choose(
        option('“오늘은 누나가 가고 싶은 쪽으로 걸을까?”', { bond: { seojin: 4 }, card: '마감이 아닌 약속', care: 'seojin' }, [
          say('서진', '누나라고 부를 때 네 표정, 마음에 들어. 그러니까 그대로 불러. 내가 좋아서 듣는 거야.'),
          n('서진이 길을 골랐다. 나는 같은 쪽 손을 내밀었다. 그녀가 손목 대신 손을 잡았다.', ['seojin'])]),
        option('일 얘기 대신 오늘 좋았던 일을 하나 말한다', { bond: { seojin: 3 }, card: '마감이 아닌 약속', care: 'seojin' }, [
          say('서진', '오늘 좋았던 일? 네가 일 얘기 말고 내 얘기 들으러 온 거. 꽤 마음에 드는데.'), n('나는 웃었다. 서진은 대답을 바꾸지 않고 내 옆으로 걸었다.', ['seojin'])]))
    ] },
    seojinFriend: { title: '그다음 마감', background: 'cafe', lines: [
      n('서진이 빈 쟁반을 내 쪽으로 밀었다. 나는 잠깐 손을 멈췄다가 받았다.', ['seojin']),
      say('서진', '어색해할 시간에 컵 하나 더 닦자. 나 오늘은 진짜 일하러 왔어.'),
      say('나', '응. 그럼 아래 선반은 내가 할게.', ['seojin']), say('서진', '알았어. 친구라고 다 괜찮아진 척할 필요는 없어. 일은 같이할 수 있고.'),
      choose(option('평소처럼 맡은 선반부터 정리한다', { care: 'seojin', card: '그다음 마감' }, [n('말을 억지로 늘리지 않았다. 각자 닦은 잔을 같은 선반에 올렸다.', ['seojin'])]))
    ] },
    seojinPending: { title: '기다린다는 말', background: 'river', lines: [
      n('서진과 같은 벤치에 앉았다. 그녀는 내가 가져온 말을 기다리다가 먼저 웃었다.', ['seojin']),
      say('서진', '오늘 대답 받으려고 나온 거 아니야. 그렇다고 언제까지나 아무 일 없던 사이도 아니고.'),
      say('서진', '생각할 시간 달라고 했으니까 줄게. 대신 네 마음 바뀌면 먼저 얘기해.'),
      choose(option('“응. 기다리는 시간을 없는 셈 치지 않을게.”', { care: 'seojin', flag: 'seojinWaitAcknowledged' }, [
        say('서진', '그럼 오늘은 산책만 하자.'), n('나는 바로 손을 잡지 않았다. 서진이 걷기 시작하자 옆으로 나란히 걸었다.', ['seojin'])]))
    ] },
    daeunCouple: { title: '공지 없는 약속', background: 'river', lines: [
      say('다은', '오늘 약속은 단톡방 공지 안 했어. 너만 오면 되니까.'),
      n('다은이 휴대폰을 가방 안에 넣었다. 손에 남은 건 주머니에서 꺼낸 장갑 한 켤레였다.', ['daeun']),
      choose(
        option('“오늘은 내가 먼저 왔네.”', { bond: { daeun: 4 }, card: '공지 없는 약속', care: 'daeun' }, [
          say('다은', '사귀자마자 출석 경쟁이냐ㅋㅋ 좋아. 나 이런 거 잘해.'),
          n('다은이 장갑을 끼고 내 소매를 잡았다. 차가웠던 손이 조금씩 따뜻해졌다.', ['daeun'])]),
        option('다음 약속은 다은이 부르기 전에 먼저 잡는다', { bond: { daeun: 3 }, flag: 'daeunNextDateAsked', care: 'daeun' }, [
          say('다은', '벌써 다음 거? 오늘 거 아직 시작도 안 했는데.'), say('다은', '…좋아서 그래. 먼저 묻는 거 좋아.'), n('우리는 서로 비는 날을 확인했다. 시간까지 정한 다음에 걷기 시작했다.', ['daeun'])]))
    ] },
    daeunAfterAnswer: { title: '단톡방에서, 내일도', background: 'river', lines: [
      say('다은', '왔냐. 나 안 사라졌지? 계속 여기 있어.'),
      say('다은', '친구로 좋다는 말 들었는데, 그럼 친구로 약속도 지켜야지. 오늘은 밥 먹으러 가는 친구.', undefined, { when: { romance: { daeun: 'friend' } } }),
      say('다은', '생각할 시간 달랬다고 내가 연락 안 해야 되는 건 아니잖아. 오늘은 답 말고 안부만 물어볼래.', undefined, { when: { romance: { daeun: 'pending' } } }),
      choose(option('오늘의 안부를 먼저 묻는다', { care: 'daeun', flag: 'daeunAfterAnswerSeen' }, [
        say('다은', '응. 오늘은 그거부터 하자.'), n('다은이 걸음을 내 옆에 맞췄다. 나는 대답한 말과 아직 하지 않은 말을 구분해 두었다.', ['daeun'])]))
    ] }
  };
  Object.assign(root.AQUA_SCENES, scenes);
  const rules = [
    { id: 'nariJanuary', place: 'club', from: '2027-01-05', to: '2027-02-05', bond: { nari: 45 }, priority: 2 },
    { id: 'seojinJanuary', place: 'cafe', from: '2027-01-05', to: '2027-02-05', bond: { seojin: 35 }, priority: 2 },
    { id: 'daeunJanuary', place: 'club', from: '2027-01-05', to: '2027-02-05', bond: { daeun: 35 }, priority: 2 },
    { id: 'nariFebruary', place: 'club', from: '2027-01-19', to: '2027-02-12', seen: 'nariJanuary', bond: { nari: 45 }, priority: 3 },
    { id: 'seojinFebruary', place: 'cafe', from: '2027-01-19', to: '2027-02-12', seen: 'seojinJanuary', bond: { seojin: 35 }, priority: 3 },
    { id: 'daeunFebruary', place: 'club', from: '2027-01-19', to: '2027-02-12', seen: 'daeunJanuary', bond: { daeun: 35 }, priority: 3 },
    { id: 'daeunFight', place: 'river', slot: 2, from: '2026-11-02', to: '2026-12-11', seen: 'daeunAlone', bond: { daeun: 45 } },
    { id: 'nariPaper', place: 'club', from: '2026-12-07', to: '2026-12-22', flag: 'knowsOffer', bond: { nari: 50 }, any: [{ noLovers: true }, { openRomance: true }] },
    { id: 'seojinCouple', place: 'river', from: '2026-11-26', to: '2027-02-19', lover: 'seojin', bond: { seojin: 35 } },
    { id: 'seojinFriend', place: 'cafe', work: true, from: '2026-11-26', to: '2027-02-19', romance: { seojin: 'friend' } },
    { id: 'seojinPending', place: 'river', from: '2026-11-26', to: '2027-02-13', romance: { seojin: 'pending' } },
    { id: 'daeunCouple', place: 'river', from: '2026-12-19', to: '2027-02-19', lover: 'daeun' },
    { id: 'daeunAfterAnswer', place: 'river', from: '2026-12-19', to: '2027-02-13', any: [{ romance: { daeun: 'friend' } }, { romance: { daeun: 'pending' } }] }
  ];
  root.AquaStory.rules.push(...rules);
  for (const rule of rules) W.routeOwners[rule.id] = [rule.id.startsWith('nari') ? 'nari' : rule.id.startsWith('daeun') ? 'daeun' : 'seojin'];
  function answerChoices(s, id) {
    const existing = Love.lovers(s), cast = [id];
    const answer = choice => ({ romance: { action: 'answer', person: id, answer: choice } });
    const accepted = [say(W.people[id].short, id === 'seojin' ? '응. 지금은 내가 좀 웃을게. 대답까지 다 예상한 척하려고 했는데, 그건 안 되네.' : '진짜지? 나 지금 웃어도 되지?'),
      n(id === 'seojin' ? '서진이 내 손을 잡았다. 이번에는 우산 아래로 숨길 필요가 없었다.' : '다은이 내 소매를 잡고 웃었다. 잠깐 눈을 감았다가 다시 나를 보았다.', cast)];
    const friendLines = [say(W.people[id].short, id === 'seojin' ? '알았어. 네 대답은 들었어. 나도 조금 정리할 시간은 필요하겠다. 다음 근무 때 보자.' : '…알았어. 그래도 말해서 다행이다. 내일도 단톡방에서 봐. 안 나가고.'), n('나는 대답을 더 다정한 말로 흐리지 않았다. 그녀가 먼저 돌아설 시간을 주었다.', cast)];
    const accept = existing.length ? option('“나도 좋아해.”라고 대답하기 전에 생각을 정리한다', {}, [
      n('지금 사귀는 사람이 있다. 마음에 대답하는 것과 관계를 정하는 것을 같은 말로 끝낼 수는 없었다.', cast),
      choose(
        option('먼저 모두에게 말하고 함께 대답을 정한다', answer('disclose'), [
          say(W.people[id].short, id === 'daeun' ? '응. 나도 그 자리에서 들을게. 여기서 우리끼리 다 정하지 말자.' : '알았어. 그 사람 얘기도 듣고 정하자.'), n('우리는 다음 날 만날 시간을 정했다. 아직 모두가 동의한 것은 아니었다.', cast)]),
        option('지금은 다른 관계를 말하지 않고 받아들인다', answer('hide'), accepted),
        option('지금의 교제를 이어 가고 친구로 대답한다', answer('friend'), friendLines))
    ]) : option(id === 'seojin' ? '“나도 좋아해.”' : '“나도. 너한테 특별한 사람이고 싶어.”', answer('accept'), accepted);
    return choose(accept, option('“고마워. 나는 친구로 좋아해.”', answer('friend'), friendLines),
      option('“지금은 대답 못 하겠어. 대충 대답하고 싶지 않아서.”', answer('pending'), [
        say(W.people[id].short, id === 'seojin' ? '알았어. 대충 대답 안 하는 건 좋아. 대신 기다리는 내 시간도 네가 기억해 줘.' : '이 와중에 보류냐ㅋㅋ …알았어. 대신 언제까지나 없던 말로 두진 마.'),
        n('나는 기다려 달라는 말이 상대의 시간을 빌리는 말이라는 걸 기억하기로 했다.', cast)]));
  }
  function decorate(id, s, data) {
    if (id !== 'seojinConfess' && id !== 'daeunConfess') return;
    const who = id === 'seojinConfess' ? 'seojin' : 'daeun';
    const card = (who === 'seojin' ? ['주차장이 된 수영장', '사장님의 케이크', '다시 물 쪽으로'] : ['초 하나', '다시 들어온 방', '맨 뒷줄의 스틱']).find(title => s.cards.includes(title));
    if (card) data.lines.push(choose(
      option(`함께 겪은 「${card}」 이야기를 꺼낸다`, { flag: `${who}ConfessionMemory` }, [
        say(W.people[who].short, who === 'seojin' ? '그날 얘길 꺼내네. 나도 기억해. 네가 답부터 하지 않고 옆에 서 있던 거.' : '그거 기억해 줬네. 나 그때 지금이랑 비슷한 얼굴이었겠다.'), n('나는 우리가 함께 있었던 순간을 이야기했다. 답을 대신하는 말은 아니었다.', [who])]),
      option('지금의 대답부터 전한다', {}, [n('오래 생각한 말을, 오늘의 얼굴을 보며 고르기로 했다.', [who])])));
    data.lines.push(answerChoices(s, who));
  }
  function mandatory(s, slot) {
    if (s.date === '2027-01-04' && slot === 0 && !s.seen.includes('januaryStart')) return 'januaryStart';
    if (s.date === '2027-01-18' && slot === 0 && !s.seen.includes('winterPlans')) return 'winterPlans';
    if (s.date === '2027-02-06' && slot === 0 && !s.seen.includes('lunarNewYear')) return 'lunarNewYear';
    if (s.date === '2027-02-13' && slot === 2 && !s.seen.includes('winterShowcase')) return 'winterShowcase';
    if (s.date === '2027-02-14' && slot === 0 && !s.seen.includes('winterValentine')) return 'winterValentine';
    if (s.date === '2027-02-22' && slot === 0 && !s.seen.includes('lastWeek')) return 'lastWeek';
    if (s.date === '2027-02-25' && slot === 3 && !s.seen.includes('lastBroadcast')) return 'lastBroadcast';
    if (s.date === '2026-11-19' && slot === 0 && s.met.includes('nari') && s.bond.nari >= 45 && s.flags.knowsOffer && !Love.lovers(s).length && !s.seen.includes('nariRecord')) return 'nariRecord';
    if (s.date === '2026-11-19' && slot === 3 && s.radio.listened.length && !s.radio.listened.includes('radio-2026-11-19') && !s.seen.includes('recordingNight')) return 'recordingNight';
    if (s.date === '2026-11-25' && slot === 2 && Love.canConfess(s, 'seojin') && !s.seen.includes('seojinConfess')) return 'seojinConfess';
    if (s.date === '2026-12-18' && slot === 2) {
      if (Love.canConfess(s, 'daeun') && !s.seen.includes('daeunConfess')) return 'daeunConfess';
      if (!s.seen.includes('daeunConfess') && !s.seen.includes('winterTermEnd')) return 'winterTermEnd';
    }
    return null;
  }
  function buildValentine(s) {
    const r = Love.ensure(s), lovers = Love.lovers(s);
    const people = ['nari', 'daeun', 'seojin'].filter(id => s.met.includes(id));
    const names = { nari: '나리', daeun: '다은', seojin: '서진' };
    const loverLines = {
      nari: ['…이건 너 줄 거야. 포장지가 자꾸 구겨져서 세 번 다시 접었어.', '네가 좋아하는 걸 내가 고르는 날이 있어서 좋아. 다음엔 같이 고르자.'],
      daeun: ['애인한테 주는 거다! 다른 애들 거랑 리본 색도 다름ㅋㅋ', '오늘은 답장 숫자 안 셀게. 네가 지금 여기 있잖아.'],
      seojin: ['하나만 골라 왔어. 네 취향 기억하나 확인해 볼까?', '좋아하는 사람한테 주고 싶어서 골랐어. 이건 굳이 쿨한 척 안 할래.']
    };
    const pendingLines = {
      nari: ['답을 재촉하려는 건 아니야. 오늘 주고 싶어서 가져왔어.', '아직 정하지 않은 말은 나중에 해도 돼. 오늘은 이거 먹자.'],
      daeun: ['이거 준다고 오늘 답하라는 뜻은 아냐. 그건 따로 말해 줘야지ㅋㅋ', '기다리는 동안 나도 내 하루 살고 있어. 오늘은 너랑 먹고 싶었고.'],
      seojin: ['이걸 답장 재촉으로 받지는 마. 네 대답은 네가 정리해서 말해.', '기다리는 시간이 없던 일이 되는 건 아니야. 그래도 오늘은 같이 쉬자.']
    };
    const friendLines = {
      nari: ['친구한테도 줄 수 있잖아. …네 것도 남겨 뒀어.', '노래 얘기하면서 먹자. 오늘은 완성된 곡 아니어도 돼.'],
      daeun: ['친구 몫 챙겼다! 이거 안 받으면 내가 두 개 다 먹음ㅋㅋ', '선물 주는 데 순위 정할 필요 없더라. 네가 생각나서 샀어.'],
      seojin: ['친구 몫이야. 괜히 다른 뜻 찾지 마. 그냥 네 생각나서 샀어.', '맛있으면 다음에 이름 알려 줘. 나도 아직 안 먹어 봤거든.']
    };
    const options = people.map(id => {
      const status = r.status[id];
      const kind = status === 'lover' ? 'lover' : status === 'pending' ? 'pending' : 'friend';
      const words = (kind === 'lover' ? loverLines : kind === 'pending' ? pendingLines : friendLines)[id];
      return option(`${names[id]}에게 오늘 잠깐 만날 수 있는지 묻는다`, { flag: `valentine${id[0].toUpperCase()}${id.slice(1)}`, bond: { [id]: 2 }, care: id, card: '2월의 작은 약속' }, [
        n(`메시지를 보내자 ${names[id]}에게서 괜찮다는 답이 왔다. 서로 편한 시간을 확인한 뒤 카페에서 만났다.`, [id]),
        { speaker: names[id], text: words[0], cast: [id], background: 'cafe' },
        n('작은 포장지를 사이에 두고 앉았다. 나는 답을 대신하는 말보다 지금 건넬 수 있는 고맙다는 말을 골랐다.', [id]),
        say(names[id], words[1]), n('우리는 다음 약속을 섣불리 정하지 않고 오늘 가능한 시간까지 함께 있었다.', [id])]);
    });
    if (r.mode === 'open' && lovers.length >= 2 && !r.talk && !r.trial) {
      const cast = [...lovers];
      options.push(option('함께 만나도 좋은지 연인들에게 각자 물어본다', { flag: 'valentineTogether', card: '2월의 작은 약속' }, [
        n('나는 한 사람씩 오늘 함께 만나는 것이 괜찮은지 물었다. 각자 좋다는 답을 받고 카페에서 만났다.', cast),
        ...cast.map(id => say(names[id], { nari:'다 같이 나눠 먹을 만큼 가져왔어. 네가 먼저 하나 골라.', daeun:'오늘은 한 사람씩 고르기! 나 먼저는 아님ㅋㅋ', seojin:'다들 괜찮다고 해서 왔어. 다음 약속도 그때그때 물어봐.' }[id], cast)),
        n('상자를 열고 각자 고른 맛을 나눴다. 함께 만나는 약속도 매번 다시 물을 수 있는 것이었다.', cast)]));
    }
    if (!lovers.length && !r.talk && !r.trial && !r.clashes.length && !s.flags.equivocated &&
        ['nari','daeun','seojin'].every(id => s.met.includes(id) && r.status[id] === 'pending') &&
        s.bond.nari >= 60 && s.bond.daeun >= 75 && s.bond.seojin >= 75) {
      const cast=['nari','daeun','seojin'];
      options.push(option('세 사람에게 솔직하게 말하고 함께 이야기할 수 있는지 묻는다', { flag:'valentineFair', card:'2월의 작은 약속' }, [
        n('나는 세 사람에게 각자 대답을 미뤄 두었다고 사실대로 전했다. 한자리에 모일지는 각자가 정해 달라고 했다.',cast),
        say('나리','함께 이야기하는 건 괜찮아. 그게 기다리기로 한 대답은 아니야.',cast),
        say('다은','나도 갈게. 대신 누가 먼저인지는 오늘 억지로 정하지 말자.',cast),
        say('서진','모두 듣고 싶어서 가는 거야. 말 바뀌면 그때도 직접 이야기해.',cast),
        n('세 사람은 대화하는 자리에 각자 동의했다. 누구도 연인 관계에 동의한 것은 아니었다.',cast)]));
    }
    options.push(option('오늘은 혼자 보내며 내게 작은 선물을 산다', { flag: 'valentineAlone', card: '2월의 작은 약속' }, [
      n('편의점에서 작은 초콜릿을 골랐다. 누군가에게 주기 위한 것만 진심인 날은 아니었다.'),
      n('집으로 가는 길에 포장을 열었다. 어제 발표회의 마지막 박자가 아직 머릿속에 남아 있었다.', [], { when: { seen: 'winterShowcase' } })]));
    const lines = [
      n('2월 14일 아침. 가게 앞 진열대에 작은 초콜릿 상자들이 놓였다.'),
      n('어제 무대에 올렸던 여덟 마디를 다시 들었다. 끝을 고치기 전에, 오늘은 어떻게 보낼지 생각했다.', [], { when: { flag:'winterShowcasePerformed' } }),
      n('어제 남긴 감상 카드에 적었던 한 줄이 떠올랐다. 오늘의 한 줄도 내가 고르기로 했다.', [], { when: { flag:'winterShowcaseAttended' } }),
      choose(...options)
    ];
    const compile = entries => entries.filter(line => root.AquaStory.allowed(s, line.when)).map(line =>
      line.choice ? { ...line, choice: line.choice.map(choice => ({ ...choice, lines: compile(choice.lines || []) })) } : line);
    return { title:'오늘의 작은 약속', background:'room', time:0, lines:compile(lines) };
  }
  function recording(s, episode, replay) {
    const effects = !replay && !s.radio.listened.includes(episode.id);
    const luna = text => ({ speaker: '루나', text, cast: [], onAir: true });
    const lines = [n(replay ? '그날의 녹음 파일을 다시 틀었다.' : '목요일 밤. 이어폰을 꽂았다. 인사 뒤로 음악이 바로 나오지 않았다.'),
      luna('안녕하세요, 아쿠아 루나의 루나예요. 오늘 하루, 잘 끝내고 계신가요.'),
      luna('저는 오늘 하루 종일 남의 노래를 불렀어요. 서른한 번. 잘했대요. 다들 잘했대요.'),
      luna('그래서 지금은 제 말을 하고 싶어요. 근데 쓰는 것마다 다 남의 가사처럼 보여서, 대본을 못 썼어요.'),
      luna('오늘은 조금만 이렇게 있을게요. 노래는 오늘 너무 많이 했어요.'),
      n('마이크는 꺼지지 않았다. 종이를 접는 소리와, 말을 시작하려다 잠깐 멈추는 숨이 들렸다.')];
    if (effects) {
      const choices = [];
      if (s.seen.includes('nariRecord')) choices.push(option('라디오를 묻지 않고 나리에게 「끝났어?」라고 보낸다', { bond: { nari: 3 }, flag: 'recordingNightMessage', care: 'nari' }, [
        n('방송이 끝난 뒤 답장이 왔다.'), say('나리 · 메시지', '응. 끝냈어. 오늘은 진짜로.', [])]));
      choices.push(option('그녀가 다음 말을 고를 때까지 듣는다', { anonymous: 3, ...(s.flags.knowsOffer ? { clue: 'recordingOwnVoice' } : {}) }, [luna('…들어 줘서 고마워요. 오늘은 그냥 끝내요.')]));
      if (s.letters.length) choices.push(option('생방송 쪽지 창에 「들었어요.」라고 남긴다', { anonymous: 4, flag: 'recordingLiveThanks' }, [luna('방금 쪽지 한 통 왔네요. 들었어요. …네. 고마워요.'), n('그 뒤에는 이름을 더 부르지 않았다. 내 쪽지도 오늘 방송의 끝에 함께 남았다.')]));
      lines.push(choose(...choices));
    } else lines.push(luna('…들어 줘서 고마워요. 오늘은 그냥 끝내요.'));
    return { title: '아쿠아 루나 · 녹음실의 밤', background: 'room', radioEpisode: episode.id, replay, lines };
  }
  root.AquaWinter = { scenes, rules, decorate, mandatory, recording, buildValentine };
})(typeof window !== 'undefined' ? window : globalThis);
