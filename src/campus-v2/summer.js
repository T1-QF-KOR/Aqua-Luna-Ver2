/* Summer chapter: authored encounters and the first return to campus. */
(function (root) {
  'use strict';
  const W = root.AquaWorld;
  const n = (text, cast = [], extra = {}) => ({ text, cast, ...extra });
  const say = (speaker, text, cast, extra = {}) => ({ speaker, text, cast: cast || [{ 나리: 'nari', 다은: 'daeun', 서진: 'seojin' }[speaker]].filter(Boolean), ...extra });
  const option = (label, effect, lines, when) => ({ label, effect, lines, ...(when ? { when } : {}) });
  const choose = (...choice) => ({ choice });
  function poolEnding(exposed) {
    return [
      say('서진', '여기, 원래 구민 수영장이었어. 일곱 살 때부터 다녔지. 너한테 보여 주고 싶었어.'),
      n('서진이 주차선 하나를 가리켰다. 나는 그 선 너머를 바라봤다.', ['seojin']),
      say('서진', '저기가 5번 레인. 내 자리. 고2 때 어깨를 다쳤어. 수술하고 돌아왔는데, 기록이 안 돌아오더라.'),
      say('서진', '그다음 해에 여기도 없어졌어. 다 정리한 줄 알았는데… 장소까지 없어지니까 그제야 실감 나더라.'),
      n('나는 위로할 말을 찾다가 입을 다물었다. 주차선 끝에 고인 물이 조금 흔들렸다.', ['seojin']),
      choose(
        option('말없이 5번 레인 자리에 같이 선다', { bond: { seojin: exposed ? 0 : 7 }, card: '주차장이 된 수영장', flag: 'seojinPoolWaited' }, [
          say('서진', '여기 서면 아직 염소 냄새가 나. 안 나는 거 아는데도.'),
          say('나', '안 이상해.', ['seojin']),
          say('서진', exposed ? '들었다고 다 아는 건 아니야. 이다음 얘기는 내가 먼저 할게.' : '이모 말고는 네가 처음이야. 내가 여기까지 데려오고 싶었던 사람.'),
          n('서진이 먼저 움직일 때까지 나는 같은 선 위에 서 있었다.', ['seojin'])]),
        option('“선수가 아니어도 다시 수영할 수 있잖아.”', { bond: { seojin: exposed ? 0 : 2 }, card: '주차장이 된 수영장', flag: 'seojinPoolRushed' }, [
          say('서진', '다시 하면 되지, 그 말은 나도 해 봤어. 오늘은 그 대답 듣자고 온 게 아니야.'), n('나는 뒤늦게 내 말의 속도를 깨달았다. 서진이 먼저 주머니에 손을 넣었다.', ['seojin']),
          say('서진', '오늘은 여기까지 할게. 먼저 갈래.')]))
    ];
  }
  const scenes = {
    summerStart: { title: '시간표 없는 아침', background: 'room', time: 0, lines: [
      n('7월 1일. 알람이 울리기 전에 눈을 떴다. 시간표를 확인하고서야, 오늘도 수업이 없다는 걸 기억했다.'),
      n('창문을 열자 먼 도로 소리가 들어왔다. 대학에 오면 방학도 달라질 줄 알았는데, 할 일 없는 아침은 고향과 비슷했다.'),
      say('민재', '문 열렸냐? 선풍기 좀 빌려 줘. 내 거 켜면 헬기 뜬다.'),
      say('나', '그걸 왜 지금까지 썼어?'), say('민재', '나름 잠 잘 와. 탈출하는 꿈 꾸거든.'),
      n('나는 선풍기 플러그를 뽑았다. 책상 밑에 접힌 악보가 걸려 나왔다. 3월에 가져온 가사 없는 곡이었다.'),
      say('민재', '서울 남은 김에 하고 싶은 거 하나만 해. 개강하면 또 시간 없다고 할 테니까.'),
      choose(
        option('그동안 미뤄 둔 곡을 꺼낸다', { flag: 'summerMusicPlan', card: '시간표 없는 아침' }, [n('나는 악보를 새 공책 첫 장에 붙였다. 이번엔 완성 날짜를 적지 않았다. 오늘 고칠 한 마디에만 동그라미를 쳤다.')]),
        option('먼저 연락할 사람을 생각한다', { flag: 'summerPeoplePlan', card: '시간표 없는 아침' }, [n('수업이 없으면 우연히 마주칠 일도 줄어든다. 나는 휴대폰을 켰다. 안부를 묻는 데 핑계가 꼭 필요하지는 않았다.')]),
        option('오늘은 아무 계획 없이 걸어 본다', { flag: 'summerWalkPlan', card: '시간표 없는 아침' }, [n('나는 지갑과 열쇠만 챙겼다. 익숙한 버스 정류장을 지나 한 정거장 더 걸어 보기로 했다.')])),
      n('문을 잠그고 나니 방 안에서 헬기 소리가 났다. 민재가 자기 선풍기를 두고 갔다. 나는 복도에서 웃었다.')
    ] },
    nariSummer: { title: '관객 한 명', background: 'practice', lines: [
      n('동아리방 문에 에어컨 수리 안내가 붙어 있었다. 돌아서려는데, 선풍기 소리 사이로 노래가 들렸다.', ['nari']),
      n('나리가 창문 앞에 앉아 있었다. 마이크도 앰프도 꺼져 있었다. 나는 문손잡이를 놓고 가만히 들었다.', ['nari']),
      n('악보의 첫 줄만 허밍이었다. 뒤의 가사는 작지만 또렷했다. 나는 끝나기 전에 박수를 치지 않으려고 손을 포갰다.', ['nari']),
      say('나리', '…언제 왔어?'), say('나', '첫 줄쯤. 들어와도 돼?', ['nari']),
      say('나리', '이미 다 들었잖아. 들어와.'), n('나는 선풍기를 그녀 쪽으로 돌리고 옆 의자에 앉았다.', ['nari']),
      say('나리', '무대 아닌 데서 부르는 거, 처음이야. 노래방 말고.'),
      say('나리', '너 하나만 듣고 있어서 그런가. 무대보다 더 떨려.'),
      choose(
        option('박수를 아주 오래 친다', { bond: { nari: 5 }, card: '관객 한 명' }, [say('나리', '그만해, 그만. …아니, 조금만 더 쳐.'), say('나리', '관객 한 명도 만석이래. 어떤 사람이 그러더라.'), n('나리가 부끄러운 얼굴로 악보를 덮었다. 접힌 모서리를 다시 펴지는 않았다.', ['nari'])]),
        option('“한 번만 더. 이번엔 눈 감고 들을게.”', { bond: { nari: 6 }, card: '관객 한 명', flag: 'nariSummerEncore' }, [
          say('나리', '…끝까지 감고 있어. 중간에 확인하지 말고.'), n('두 번째 노래는 더 작았다. 끝 소절에서 목소리가 아주 조금 떨렸다. 나는 약속대로 눈을 뜨지 않았다.', ['nari']),
          n('의자가 움직이는 소리에 눈을 떴다. 나리는 창밖을 보고 있었다. 귀 끝이 빨갰다.', ['nari']), say('나리', '다음엔 첫 줄도 써 올게. 네가 또 온다면.')]))
    ] },
    nariArchive: { title: '지난 시즌의 목소리', background: 'rooftop', lines: [
      n('옥상 벤치에서 이현 선배가 노트북을 닫았다. 나는 박람회에서 봤던 방송국 이름표를 알아봤다.'),
      say('이현', '아쿠아 루나 듣죠? 박람회 때 부스 앞에서 봤어요.'), say('나', '네. 방학에는 다시 듣기로 들어요.'),
      say('이현', '고마워요. 그 말이면 편집하느라 밤새운 보람은 있네요.'),
      n('이현 선배가 외장 하드를 가방 안에 넣었다. 케이스에는 해마다 다른 글씨로 같은 이름이 적혀 있었다. 루나.'),
      say('이현', '루나는 그만둘 때 이름을 넘겨요. 대개 그 방송을 제일 오래 들은 사람한테요.'),
      say('이현', '작년에 매주 사연 보내던 사람이 있었어요. 고등학생 때부터요. 별명이 피크였는데…'),
      n('선배가 말을 멈췄다. 나는 기다렸다.', [], { effect: { clue: 'archiveInheritance' } }),
      n('피크. 나리가 자기 입으로 말해 줬던 별명이었다. 나는 그 이름을 소리 내어 반복하지 않았다.', [], { when: { flag: 'knowsPick' }, effect: { clue: 'archivePick' } }),
      say('이현', '올해 루나가 누군지는 저만 알아요. 앞으로도 제가 먼저 말할 일은 없고요.'),
      choose(
        option('더 묻지 않고 가방 지퍼가 닫히기를 기다린다', { flag: 'ihyunAskedToWait' }, [say('이현', '고마워요. 묻지 않아 줘서.'), say('이현', '혹시 알게 되더라도, 그 사람이 먼저 말할 때까지 기다려 줘요. 자기 얘기 하는 데 오래 걸리는 사람이에요.'), n('나는 고개를 끄덕였다. 선배는 그제야 노트북 충전기를 챙겼다.')]),
        option('“혹시 피크가 올해 진행자인가요?”', { flag: 'archiveAsked' }, [say('이현', '그건 제가 대답할 수 없어요.'), n('웃는 얼굴이었지만 질문이 끝났다는 건 알 수 있었다. 나는 다른 말을 찾다가, 먼저 인사했다.')]))
    ] },
    nariVoice: { title: '강물 위의 콧노래', background: 'river', time: 2, lines: [
      n('해가 지는 강변. 나리가 벤치에 앉아 휴대폰으로 무언가를 쓰고 있었다. 나는 조금 떨어진 곳에서 걸음을 멈췄다.', ['nari']),
      n('내가 들려줬던 멜로디였다. 여덟 마디 끝이 질문처럼 올라갔다. 나리는 그 자리를 다시 흥얼거렸다.', ['nari'], { when: { flag: 'nariHeardMelody' } }),
      n('처음 듣는 멜로디였다. 끝에 한 마디가 비어 있는 것처럼, 노래가 끝나도 다음을 기다리게 됐다.', ['nari'], { when: { notFlag: 'nariHeardMelody' } }),
      say('나리', '…안녕하세요, 아쿠아 루나의 루나예요. 오늘 하루, 잘 끝내고 계신가요.'),
      n('나는 인사하려던 입을 다물었다. 매주 이어폰에서 들었던 숨의 길이였다. 조금 늦게 올라가는 마지막 음도 같았다.', ['nari']),
      n('한나리가 루나였다. 나는 알고 있던 목소리와 알고 있던 얼굴을 처음으로 겹쳐 봤다.', ['nari'], { effect: { flag: 'knowsLuna' } }),
      n('나리가 고개를 들었다. 휴대폰 화면이 그녀 무릎 위에서 꺼졌다.', ['nari']), say('나리', '…언제부터 있었어?'),
      choose(
        option('“방금. 산책하다가. 노래 좋더라.”', { bond: { nari: 5 }, anonymous: 3, flag: 'lunaPrivacyKept' }, [
          say('나리', '…노래만 들었어?'), say('나', '응. 노래만.', ['nari']), n('나리가 한참 나를 봤다. 나는 강 쪽으로 시선을 옮겼다.', ['nari']),
          say('나리', '너 거짓말 못 한다. 귀 빨개.'), say('나리', '…근데 고마워. 그 거짓말.')]),
        option('아무 말 없이 옆에 앉는다', { bond: { nari: 4 }, anonymous: 4, flag: 'lunaPrivacyKept' }, [
          n('나리는 가방을 옮겨 내 자리를 만들었다. 해가 강 아래로 내려갈 때까지 우리는 말하지 않았다.', ['nari'], { background: 'night' }),
          say('나리', '나, 얼굴 안 보이는 데서만 말이 나와. 이상하지.'), say('나', '안 이상해.', ['nari']), say('나리', '…그 말 하는 사람, 너 두 번째야.')]),
        option('“너 혹시… 라디오 해?”', { bond: { nari: -3 }, flag: 'questionedRadio', radioBreak: true }, [
          say('나리', '…무슨 소리야?'), n('나는 대답 대신 그녀의 웃음을 봤다. 무대 위에서 보았던, 조금도 흔들리지 않는 웃음이었다.', ['nari']),
          say('나리', '나 노래하는 사람이야. 말하는 거 못해. 너도 알잖아.'),
          n('나리가 일어섰다. 나는 붙잡을 말을 찾는 동안 벤치에 남은 이어폰 한쪽을 바라봤다.', ['nari']),
          n('나중에 방송국 공지가 올라왔다. 「다음 방송은 지난 시즌 다시 듣기로 대신합니다.」 나는 댓글 창을 열지 않았다.')]))
    ] },
    daeunTicket: { title: '한 장의 표', background: 'river', lines: [
      n('강변 벤치에 앉자 다은이 휴대폰을 내밀었다. 영화 예매 화면이었다. 좌석 하나만 노란색으로 칠해져 있었다.', ['daeun']),
      say('다은', '이거 봐. 혼자 예매했다. 결제는 아직이지만.'), say('나', '보고 싶은 영화야?', ['daeun']),
      say('다은', '응. 근데 다들 바쁘대. 네가 같이 가면 좋겠는데… 오늘은 혼자 해 보려고.'),
      n('다은의 엄지가 결제 버튼 위에서 멈췄다. 나는 옆자리까지 고르려던 손을 거뒀다.', ['daeun']),
      choose(
        option('“보고 나서 제일 좋았던 장면 알려 줘. 듣고 싶어.”', { bond: { daeun: 4 }, flag: 'daeunSoloTicket' }, [
          say('다은', '스포해도 돼?'), say('나', '그 장면 하나는.', ['daeun']), n('결제 완료 화면이 떴다. 곧바로 내 휴대폰에 표 사진이 도착했다.', ['daeun']),
          say('다은', '다녀올게. 끝나고 연락할게. 넌 그때 바쁘면 바쁘다고 해도 되고.'), say('나', '읽고 나서 답할게.', ['daeun']), say('다은', '좋아. 그 정도 약속이면 된다.')]),
        option('“네가 고른 자리 좋네. 화면 잘 보이겠다.”', { bond: { daeun: 3 }, flag: 'daeunChoseSeat' }, [
          say('다은', '그치? 다른 사람 자리까지 고르려면 늘 고민했는데.'), n('이번에는 손가락이 망설이지 않았다. 다은은 휴대폰을 가방에 넣고 기지개를 켰다.', ['daeun']),
          say('다은', '나 이제 영화관 가는 길도 혼자 골라야 된다. 지도 잠깐만 봐 줘ㅋㅋ')]))
    ] },
    daeunBirthday: { title: '아무도 모르는 생일', background: 'river', lines: [
      n('다은이 편의점 봉투를 벤치에 내려놓았다. 봉투 안에는 작은 조각 케이크와 숟가락 하나가 있었다.', ['daeun']),
      say('다은', '오늘 내 생일이거든. 다른 사람 생일은 내가 다 알려 줘서 아는데, 내 건 내가 안 올렸더니 아무도 몰라ㅋㅋ'),
      n('나는 날짜를 확인하고 휴대폰을 뒤집었다. 지금은 화면보다 먼저 볼 사람이 있었다.', ['daeun'], { effect: { birthday: 'daeun' } }),
      say('나', '생일 축하해. 오늘 여기 와서 다행이다.', ['daeun']), say('다은', '…그렇게 진지하게 말하면 나 뭐라고 해야 되냐.'),
      choose(
        option('작게 생일 노래를 부른다', { bond: { daeun: 8 }, card: '초 하나' }, [
          n('세 번째 마디에서 음이 미끄러졌다. 다은이 웃음을 터뜨렸고, 나는 마지막까지 불렀다.', ['daeun']),
          say('다은', '작곡과 맞냐 진짜ㅋㅋ'), n('다은은 초 대신 케이크 위의 초콜릿을 잠깐 바라봤다. 눈을 감았다가, 손등으로 눈가를 문질렀다.', ['daeun']),
          say('다은', '소원 빌었어. 안 알려 줄 거야.')]),
        option('“숟가락 하나 더 가져올게. 같이 먹자.”', { bond: { daeun: 6 }, card: '초 하나' }, [
          say('다은', '갔다가 그냥 가는 거 아니지?'), say('나', '케이크 두고 어떻게 가.', ['daeun']),
          n('돌아왔을 때 다은은 케이크를 정확히 반으로 나누고 있었다. 조금 큰 쪽을 내 앞으로 밀었다.', ['daeun']),
          say('다은', '안 늦었어. 오늘 안에 왔잖아. 그거면 1등이야.')]))
    ] },
    seojinBeginner: { title: '처음이라는 말', background: 'river', lines: [
      n('서진이 운동화 끈을 다시 묶고 있었다. 벤치에는 접었다 편 흔적이 많은 스트레칭 안내지가 놓여 있었다.', ['seojin']),
      say('서진', '새로 배우는 동작이야. 그렇게 본다고 시범까지 잘해 주진 못해.'), say('나', '누나도 배우는 게 있어?', ['seojin']),
      say('서진', '모르면 배우지. 다 아는 척은 내 취향 아니야. 근데… 잘하던 건 계속 잘해야 할 것 같더라.'),
      n('서진은 안내지 한 귀퉁이에 작은 글씨로 ‘천천히’라고 적었다. 나는 그 글씨가 지워지지 않게 종이 끝을 잡았다.', ['seojin']),
      choose(
        option('“나한테도 하나 알려 줄래? 제일 쉬운 걸로.”', { bond: { seojin: 4 }, stats: { fitness: 1 }, flag: 'seojinBeginnerTogether' }, [
          say('서진', '내가 아직 초보인 건 들었지? 따라 하다 틀리면 네 책임도 반이야.'), say('나', '그럼 같이 안내지 보자.', ['seojin']),
          n('우리는 동작 이름부터 틀렸다. 서진이 숨을 내쉬듯 웃었다. 나는 반대쪽 발을 내렸다.', ['seojin']), say('서진', '오늘은 둘 다 초보네. 나 잘하는 것만 보다가 새롭지?')]),
        option('‘천천히’를 가리킨다. “오늘 목표는 이거네.”', { bond: { seojin: 3 }, flag: 'seojinSlowPace' }, [
          say('서진', '맞아. 횟수보다 속도. 내 욕심부터 좀 눌러 보려고.'), n('서진은 마지막 동작을 한 번만 더 했다. 잘됐는지 묻지 않고, 안내지를 반듯하게 접었다.', ['seojin']),
          say('서진', '내일도 와야 되니까. 오늘은 여기까지만.')]))
    ] },
    seojinPool: { title: '주차장이 된 수영장', background: 'river', time: 2, lines: [
      n('나는 강변북로 아래 공영주차장 앞에서 서진을 만났다. 차를 기다리는 줄 알았는데, 서진은 빈 주차선만 보고 있었다.', ['seojin']),
      n('주차장과 물 냄새. 라디오에서 들은 ‘5번 레인’이 떠올랐다. 그때 서진은 자기 이름을 쓰지 않았다.', ['seojin'], { when: { flag: 'recognizedSeojinLetter' } }),
      choose(
        option('그녀가 말할 때까지 옆에 서 있는다', { keptIf: 'recognizedSeojinLetter' }, poolEnding(false)),
        option('“여기… 수영장 있던 데지? 5번 레인.”', { flag: 'seojinLetterExposed' }, [
          say('서진', '…너 그거 어떻게 알아?'), say('나', '어디서 들은 것 같아서.', ['seojin']), say('서진', '그래.'),
          n('서진은 더 묻지 않았다. 대신 말을 고르기 시작했다. 나는 처음보다 멀리 선 것 같았다.', ['seojin']), ...poolEnding(true)
        ], { flag: 'recognizedSeojinLetter' }))
    ] },
    seojinBirthday: { title: '사장님의 케이크', background: 'cafe', time: 2, lines: [
      n('마감 뒤 사장님이 냉장고에서 작은 케이크를 꺼냈다. 나는 의자를 올리던 손을 멈췄다.', ['seojin']),
      say('사장님', '서진이 생일이에요. 쟤는 말을 안 해요, 매년.', ['seojin']), say('서진', '이모, 내 소개보다 케이크 공개가 먼저네.'),
      n('서진이 웃으며 빈 테이블 쪽으로 의자를 돌렸다. 나는 케이크 상자를 접어 테이블 아래에 놓았다.', ['seojin'], { effect: { birthday: 'seojin' } }),
      say('나', '그래서 오늘 일찍 마감한 거구나.', ['seojin']), say('서진', '응. 오늘은 내가 좀 일찍 쉬고 싶어서. 네가 초 켤래?'),
      choose(
        option('“소원 빌어, 누나. 진짜 소원으로.”', { bond: { seojin: 5 }, card: '사장님의 케이크' }, [
          say('서진', '진짜 소원까지 알아내려고? 축하만 해도 충분해.'), n('서진은 오래 눈을 감고 있었다. 나는 성냥을 내려놓고 기다렸다. 촛농이 흘렀지만 재촉하지 않았다.', ['seojin']),
          say('서진', '됐어. 이제 케이크. 첫 조각은 내가 고른다.')]),
        option('냅킨에 축하 인사를 써서 케이크 옆에 놓는다', { bond: { seojin: 6 }, card: '사장님의 케이크' }, [
          n('「누나와 같이 마감하는 날이 좋아요. 생일 축하해요.」 나는 냅킨을 한 번 접어 내밀었다.', ['seojin']),
          say('서진', '이건 좀 잘 썼네. 평소엔 그렇게 능숙한 말 안 하더니. 내가 가져도 되지?'), n('서진은 케이크보다 냅킨을 먼저 챙겼다. 접은 종이가 앞치마 주머니 안으로 들어갔다.', ['seojin'])]))
    ] },
    summerPostcard: { title: '보내지 않은 안부', background: 'room', time: 3, lines: [
      n('8월 1일. 엄마에게서 사진이 왔다. 고향 방파제와 빨간 고무 대야. 제목은 「집은 멀쩡하다」였다.'),
      n('나는 답장을 쓰다가 지웠다. 잘 지낸다고 쓰기에는 말할 일이 많았고, 전부 쓰기에는 첫 문장이 어려웠다.'),
      n('창문 밖에서 오토바이가 지나갔다. 처음엔 시끄럽기만 했던 소리가, 이제는 내 방의 저녁 소리였다.'),
      choose(
        option('오늘 찍은 길 사진을 보낸다', { flag: 'summerSentStreet', card: '보내지 않은 안부' }, [n('사진에는 아무도 없었다. 그런데 어디서 멈춰 서고 누구를 기다렸는지, 나는 전부 기억했다.'), n('「여기는 요즘 이렇게 생겼어. 나도 잘 있어.」 전송 표시가 뜨고 나서야 숨을 내쉬었다.')]),
        option('말 대신 전화를 건다', { flag: 'summerCalledHome', card: '보내지 않은 안부' }, [say('나', '엄마. 사진 잘 봤어.'), n('엄마는 밥 먹었느냐고 물었다. 나는 먹었다고 답했다. 그 뒤에 오늘 무슨 일이 있었는지, 묻지 않은 얘기를 조금 더 했다.')]),
        option('아직 보내지 않고 공책에 먼저 쓴다', { flag: 'summerUnsentNote', card: '보내지 않은 안부' }, [n('「나 여기서 좋아하는 게 생겼어.」 나는 그 아래에 한 줄을 더 썼다. 남에게 보여 주지 않는 문장이라 조금 덜 어렵게 쓸 수 있었다.')])),
      n('책상 위에 3월의 악보와 8월의 공책이 겹쳐 있었다. 나는 새 페이지를 찢지 않았다.')
    ] },
    summerReturn: { title: '빈 의자에 놓아 둔 것', background: 'campus', time: 2, lines: [
      n('개강 전날, 나는 강의동까지 걸어 봤다. 두 달 동안 조용하던 게시판에 새 시간표와 공연 모집지가 겹쳐 붙어 있었다.'),
      say('민재', '신입생처럼 길 잃지 마라. 이제 후배도 생길 사람이다.'), say('나', '아직 반년밖에 안 됐는데.'),
      say('민재', '그럼 반년 선배지. 나는 내일도 늦잠 잘 거니까 자리 하나 부탁한다.'),
      n('민재가 자판기 잔돈을 챙겼다. 나는 공연 모집지 아래 빈 칸을 읽었다. 함께 연습할 사람. 파트 무관.'),
      n('여름에 혼자 들었던 나리의 노래가 생각났다. 첫 줄을 아직 쓰지 않았다고 했던 곡이었다.', [], { when: { seen: 'nariSummer' } }),
      n('영화를 보고 온 다은이 보내 준 긴 메시지가 생각났다. 혼자 본 장면을 나에게 들려주는 목소리였다.', [], { when: { flag: 'daeunSoloTicket' } }),
      n('서진이 접어 넣던 안내지가 생각났다. ‘천천히’라는 글씨는 더 오래 기억에 남았다.', [], { when: { seen: 'seojinBeginner' } }),
      choose(
        option('나리에게 내일 수업 끝나고 잠깐 보자고 보낸다', { flag: 'summerPromiseNari' }, [say('나리 · 메시지', '응. 쓰던 가사 보여 줄게. 완성한 척 안 해도 되지?', [])], { met: 'nari' }),
        option('다은에게 내일 먼저 자리를 맡겠다고 보낸다', { flag: 'summerPromiseDaeun' }, [say('다은 · 메시지', '내가 아니고 네가?ㅋㅋ 좋아. 내 자리도 꼭 하나. 내일 봐!', [])], { met: 'daeun' }),
        option('서진에게 개강 후 첫 근무 때 보자고 보낸다', { flag: 'summerPromiseSeojin' }, [say('서진 · 메시지', '좋아. 수업은 다 듣고 와. 일 잘한다고 수업 빠지는 것까지 봐주진 않을 거야.', [])], { met: 'seojin' }),
        option('내 이름으로 공연 모집지에 적는다', { flag: 'summerPromiseOwnSong' }, [n('나는 이름 뒤에 ‘작곡’이라고 적었다. 연락처를 쓰는 손이 조금 떨렸다. 빈 첫 줄보다, 적고 난 줄이 더 무서웠다.')])),
      n('집으로 돌아오는 길에 알람을 다시 켰다. 내일은 우연히 마주칠 사람도, 내가 먼저 만나러 갈 사람도 있었다.')
    ] },
    autumnReturn: { title: '같은 강의실, 다른 자리', background: 'classroom', time: 0, lines: [
      n('9월 1일. 같은 강의실인데 창문으로 들어오는 빛의 각도가 달라져 있었다. 나는 3월에 앉았던 뒤쪽 자리를 지나쳤다.', [], { effect: { stats: { knowledge: 1, energy: -5 } } }),
      n('나는 다은의 자리에 가방을 놓았다. 문 앞에서 다은이 멈췄다가, 내 쪽으로 곧장 걸어왔다.', ['daeun'], { when: { flag: 'summerPromiseDaeun' } }),
      say('다은', '진짜 맡았네. 오늘은 내가 따라 앉는 날이다.', undefined, { when: { flag: 'summerPromiseDaeun' } }),
      n('나리가 접힌 종이를 책상 위로 밀었다. 맨 윗줄에 가사가 한 줄 적혀 있었다.', ['nari'], { when: { flag: 'summerPromiseNari' } }),
      say('나리', '소리 내서 읽지 마. 이따가… 내가 읽을게.', undefined, { when: { flag: 'summerPromiseNari' } }),
      n('서진에게서 근무표 사진이 왔다. 내 수업이 끝난 다음 시간에 동그라미가 그어져 있었다.', [], { when: { flag: 'summerPromiseSeojin' } }),
      n('공연 모집 연락처로 첫 답장이 왔다. 「악보 있으면 다음 합주 때 가져와 주세요.」 나는 가방 안의 공책을 한 번 만졌다.', [], { when: { flag: 'summerPromiseOwnSong' } }),
      say('교수', '방학 때 뭘 했는지 다음 시간까지 여덟 마디로 가져오세요. 설명보다 먼저 들려주면 됩니다.'),
      n('나는 공책을 폈다. 지난 학기처럼 깨끗한 페이지는 아니었다. 접힌 자국과 지운 문장이 있는 쪽을 그대로 펼쳤다.'),
      choose(option('지우지 않은 문장 아래에 다음 마디를 적는다', { flag: 'returnedForAutumn' }, [n('창밖에서 늦게 온 학생들의 발소리가 들렸다. 나는 첫 줄을 다시 시작하지 않았다. 그다음 줄을 썼다.')]))
    ] }
  };
  Object.assign(root.AQUA_SCENES, scenes);
  const rules = [
    { id: 'nariSummer', place: 'club', from: '2026-07-07', to: '2026-08-31', bond: { nari: 25 } },
    { id: 'nariArchive', place: 'roof', from: '2026-07-01', to: '2026-08-31', broadcasts: 3, any: [{ flag: 'heardLastSeason' }, { flag: 'knowsPick' }] },
    { id: 'nariVoice', place: 'river', slot: 2, from: '2026-08-03', to: '2026-10-31', bond: { nari: 30 }, clues: 1, broadcasts: 3, priority: 3 },
    { id: 'daeunTicket', place: 'river', from: '2026-07-02', to: '2026-08-23', bond: { daeun: 20 } },
    { id: 'daeunBirthday', place: 'river', from: '2026-07-28', to: '2026-07-28', bond: { daeun: 20 }, priority: 5 },
    { id: 'seojinBeginner', place: 'river', from: '2026-07-04', to: '2026-08-25', bond: { seojin: 22 } },
    { id: 'seojinPool', place: 'river', slot: 2, from: '2026-07-06', to: '2026-10-31', bond: { seojin: 28 } },
    { id: 'seojinBirthday', place: 'cafe', work: true, from: '2026-08-19', to: '2026-08-19', bond: { seojin: 15 }, priority: 5 }
  ];
  root.AquaStory.rules.push(...rules);
  // Missing a spring meeting must not permanently seal a friendship threshold.
  for (const rule of root.AquaStory.rules) if (root.AquaRelationships.gates.some(gate => gate.id === rule.id) || rule.id === 'crossRain') {
    if (rule.to < '2026-08-31') rule.to = '2026-08-31';
  }
  for (const rule of rules) W.routeOwners[rule.id] = rule.id === 'nariArchive' ? [] : [rule.id.startsWith('nari') ? 'nari' : rule.id.startsWith('daeun') ? 'daeun' : 'seojin'];
  const events = { '2026-07-01:0': 'summerStart', '2026-08-01:3': 'summerPostcard', '2026-08-31:2': 'summerReturn', '2026-09-01:0': 'autumnReturn' };
  function mandatory(state, slot) { const id = events[`${state.date}:${slot}`]; return id && !state.seen.includes(id) ? id : null; }
  root.AquaSummer = { scenes, rules, mandatory };
})(typeof window !== 'undefined' ? window : globalThis);
