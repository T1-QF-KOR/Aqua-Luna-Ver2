/* Aqua Luna: first spring. Story content adapted from the project's GDD. */
window.AQUA_SCENES = {
 intro:{title:'낯선 도시, 첫 페이지',background:'campus',presentation:'intro',lines:[
  {text:'나는 한여울대학교에 들어왔다.',chapter:'새로운 시작',duration:4200},
  {text:'실용음악과, 작곡 전공.\n악보에는 익숙했지만, 서울의 길은 아직 읽을 줄 몰랐다.',chapter:'낯선 도시에서',duration:6200},
  {text:'어떤 사람을 만나게 될지, 어떤 노래를 쓰게 될지.\n그때의 나는, 아무것도 몰랐다.',chapter:'아직 쓰지 않은 이야기',duration:6200}
 ]},
 prologue:{title:'서울의 첫날',background:'room',lines:[
  {text:'상자 세 개, 이불 한 채, 전기포트 하나. 그게 내 서울 살림의 전부였다.'},
  {text:'커터칼을 안 챙겨 와서 테이프를 손톱으로 뜯고 있는데, 벽이 세 번 울렸다.'},
  {speaker:'민재',text:'저기요! 혹시 커터칼 필요해요? 소리가 처절해서.'},
  {text:'옆방 사람이 문 앞에 서 있었다. 커터칼을 내밀며 상자에 붙은 이름표를 읽었다.'},
  {speaker:'민재',text:'한여울대? 나도. 미커 26. 너는?'},
  {speaker:'나',text:'실용음악과. 작곡.'},
  {speaker:'민재',text:'오, 실음과. 그럼 내일 입학식 축하 무대 봐. 한나리라고, 노래 진짜 잘하는 선배가 있거든.'},
  {speaker:'민재',text:'근데 무대 내려오면 아무랑도 말 안 한대. 아, 난 민재. 한 살 많지만 그냥 말 놔.'},
  {text:'낯선 도시에서 처음 들은 이름이었다. 아직은 얼굴도 모르는.'},
  {time:3,text:'밤. 짐을 대충 풀고 누웠다. 창문 틈으로 강 냄새가 들어왔다. 바다 냄새보다 조용했다.'},
  {text:'휴대폰에 학교 방송국 채널이 떴다. 「HYBS 심야 라디오 · 아쿠아 루나 — 4월 첫 방송 예정」'},
  {choice:[{label:'지난 시즌 마지막 회를 틀어 본다',effect:{flag:'heardLastSeason'},lines:[{text:'피아노. 그리고 낮고 단단한 목소리.'},{speaker:'루나 · 지난 시즌',text:'실패한 날에도 하루는 끝나요. 오늘은 그냥 끝내요.'},{text:'방송이 끝날 때까지 낯선 천장을 바라봤다. 알림 버튼을 눌러 두었다.'}]},{label:'알림만 켜 두고 잔다',lines:[{text:'물 위의 달. 이름이 예뻐서 알림 버튼을 눌러 두었다.'}]}]}
 ]},
 entrance:{title:'축하 무대',background:'concert',lines:[
  {text:'입학식. 강당에 신입생 천 명이 앉아 있었다. 총장님 축사가 끝나고 불이 꺼졌다.'},
  {text:'드럼 카운트. 기타. 그리고 목소리. 첫 소절에 강당이 조용해졌다.'},
  {text:'분홍 브릿지가 있는 머리, 갈색 재킷. 무대 위의 그 사람은 강당 전체를 자기 것처럼 썼다.'},
  {speaker:'나리 · 무대 위',text:'안녕하세요, 한여울 밴드입니다! 입학 축하해요!'},
  {text:'한나리. 민재가 말한 그 사람.'},
  {text:'공연이 끝나고 길을 잘못 들어 무대 옆 철문을 열었다. 좁은 계단에 방금 그 사람이 쭈그려 앉아 있었다.'},
  {text:'마이크를 쥐었던 손이 무릎 위에서 떨리고 있었다. 손가락 사이에는 분홍 피크가 끼워져 있었다.',cast:['nari']},
  {speaker:'나리',text:'…어. 여기 화장실 아니야.',cast:['nari']},
  {choice:[{label:'아무 말 없이 문을 닫고 나간다',lines:[{text:'문이 닫히기 직전, 아주 작은 목소리가 들렸다. “…고마워.”'}]},{label:'“괜찮아요? 물 드릴까요?”',effect:{meet:'nari',bond:{nari:2},card:'떨리는 손의 피크'},lines:[{speaker:'나리',text:'…선배라고 존댓말 하지 마. 나리라고 불러.',cast:['nari']},{speaker:'나리',text:'무대 끝나면 늘 이래. 비밀로 해 줘.',cast:['nari']},{text:'그녀가 분홍 피크를 내 손바닥에 올렸다. 아직 조금 따뜻했다.',cast:['nari']},{speaker:'나리',text:'이거 너 가져. 오늘 거니까. …입막음이야.',cast:['nari']}]}]}
 ]},
 nariClass:{title:'가사 없는 악보',background:'classroom',lines:[
  {text:'앙상블 실습이 끝난 강의실. 내 악보 한 장이 바닥에 떨어졌다. 줍기 전에 다른 손이 먼저 집었다.',cast:['nari']},
  {speaker:'나리',text:'…이거 네 거야? 가사는?',cast:['nari']},{speaker:'나',text:'못 써.',cast:['nari']},{speaker:'나리',text:'…나도.',cast:['nari']},
  {text:'그녀는 악보를 돌려주지 않고 첫 두 마디를 흥얼거렸다. 처음 보는 악보를, 한 번에.',cast:['nari']},
  {choice:[{label:'나머지 여섯 마디를 이어서 흥얼거린다',effect:{meet:'nari',bond:{nari:4},flag:'nariHeardMelody',card:'가사 없는 악보'},lines:[{text:'둘이 같이 여덟 마디를 끝냈다. 빈 강의실에 멜로디가 남았다.',cast:['nari']},{speaker:'나리',text:'끝이 좋다. 질문으로 끝나네. …가사 붙으면 알려 줘. 아, 너 못 쓰지.',cast:['nari']}]},{label:'“입학식 때 노래한 선배 맞지?”',effect:{meet:'nari',bond:{nari:2},card:'가사 없는 악보'},lines:[{speaker:'나리',text:'…응. 선배라고 하지 마. 나리라고 불러. 그리고 그 얘기는, 그냥 하지 마.',cast:['nari']}]}]}
 ]},
 nariRoof:{title:'멘트 수첩',background:'rooftop',lines:[{text:'옥상 정원 문을 열자 밝고 시원한 목소리가 들렸다.',cast:['nari']},{speaker:'나리',text:'안녕하세요, 한여울 밴드입니다! 오늘 날씨 같은 노래 하나 할게요!',cast:['nari']},{text:'화분 뒤에서 나리는 작은 수첩을 들고 같은 문장을 반복하고 있었다.',cast:['nari']},{speaker:'나리',text:'…들었어? 다음 주 박람회 멘트야. 안 외우면 무대에서 아무 말도 안 나와.',cast:['nari']},{choice:[{label:'“나 한 번만 해 봐도 돼?”',effect:{meet:'nari',bond:{nari:4},flag:'sawNotebook',card:'멘트 수첩'},lines:[{speaker:'나리',text:'…최악이다. 날씨가 장마야, 지금. 너 목소리는 장마.',cast:['nari']},{text:'그녀가 처음으로 웃었다. 무대 웃음이 아니었다.',cast:['nari']}]},{label:'못 본 척 문을 닫고 나간다',effect:{meet:'nari',bond:{nari:3},card:'멘트 수첩'},lines:[{text:'문 뒤에서 여덟 번째 “안녕하세요”가 들렸다. 아까보다 작았다.'}]}]}]},
 nariRiver:{title:'혼잣말 원고',background:'river',lines:[{text:'해 지는 강변. 벤치에 이어폰 한쪽을 끼고 앉은 나리가 휴대폰을 보고 있었다.',cast:['nari']},{speaker:'나리',text:'…오늘 하루, 잘— 아니다. 다시.',cast:['nari']},{text:'나와 눈이 마주치자 화면을 꺼서 무릎 위에 엎었다.',cast:['nari']},{speaker:'나리',text:'…통화 아니야. 발음 연습. 실용음악과. 보컬. 그런 거.',cast:['nari']},{choice:[{label:'옆 벤치에 앉아 강만 본다',effect:{meet:'nari',bond:{nari:4},card:'혼잣말 원고'},lines:[{speaker:'나리',text:'강도 밤엔 괜찮아. 달 뜨면.',cast:['nari']}]},{label:'“방금 거, 라디오 디제이 같았어.”',effect:{meet:'nari',bond:{nari:1},flag:'riverClue',card:'혼잣말 원고'},lines:[{speaker:'나리',text:'…발음 연습이라니까.',cast:['nari']},{text:'그녀는 이어폰을 귀에 꽂고 가 버렸다.'}]}]}]},
 daeunMeet:{title:'새내기 배움터',background:'concert',lines:[{text:'새내기 배움터. 조 편성표 앞에서 다들 자기 이름을 찾느라 바빴다.',cast:['daeun']},{speaker:'다은',text:'야! 너 3조지? 나도 3조! 나 오다은. 드럼. 다은이라고 불러.',cast:['daeun'],expr:'happy'},{speaker:'다은',text:'한나리 선배 무대 봤어? 밴드 동아리 드러머 뽑는대. 나 무조건 갈 거야.',cast:['daeun']},{text:'쉬는 시간. 다은이 혼자 휴대폰을 보고 있었다. 알림이 하나도 없는 화면이었다.',cast:['daeun']},{choice:[{label:'“너 진짜 금방 친해진다. 부러워.”',effect:{meet:'daeun',bond:{daeun:4}},lines:[{speaker:'다은',text:'그치? 이게 내 유일한 재능이야. 아 드럼도. 두 개. …근데 너는 먼저 말 걸어 주네.',cast:['daeun']}]},{label:'“과 단톡방 만들자. 내가 도와줄게.”',effect:{meet:'daeun',bond:{daeun:3},flag:'groupChat'},lines:[{speaker:'다은',text:'오, 추진력! 좋아. 방장은 나, 부방장은 너.',cast:['daeun']}]},{label:'휴대폰을 내밀어 번호를 찍어 준다',effect:{meet:'daeun',bond:{daeun:3}},lines:[{speaker:'다은',text:'오, 말없이 번호부터. 너 은근 선수다?',cast:['daeun']}]}]},{text:'그날 밤 「26 실음 동기방」이 생겼다. 다은이 한 명씩 초대했다. 열여덟 명.'}]},
 fair:{title:'동아리 박람회',background:'concert',lines:[{text:'학생회관 앞 광장이 부스로 꽉 찼다. 사진, 등산, 보드게임, 방송국, 그리고 밴드.'},{speaker:'다은',text:'야! 왔어? 나 지금 드러머 지원한다. 봐 봐.',cast:['daeun']},{text:'무대에서 나리가 첫 소절을 내지르자 지나가던 사람들이 멈춰 섰다.'},{speaker:'이현',text:'HYBS 국장 강이현이에요. 엔지니어 자리가 비어요. 목소리가 아니어도 방송은 할 수 있어요.'},{speaker:'이현',text:'루나는 그만둘 때 다음 사람한테 이름을 넘겨요. 올해는 누가 받았을까요.'},{text:'부스를 다 돌고 나니 손에 신청서 세 장이 남았다.'},{choice:[{label:'밴드 동아리에 들어간다',effect:{club:'band',bond:{daeun:2}},lines:[{speaker:'다은',text:'야 대박! 너도? 우리 같이 붙자!',cast:['daeun']}]},{label:'방송국에 들어간다',effect:{club:'radio'},lines:[{speaker:'이현',text:'환영해요. 목요일 밤엔 바쁠 거예요. 방송국에서 본 건, 방송국 밖으로 안 나가요.'}]},{label:'아무 데도 들어가지 않는다',effect:{club:'none'},lines:[{text:'시간은 내 것으로 남겨 두기로 했다. 알바도, 공부도, 사람도.'}]}]},{text:'광장 끝, 나리가 조용히 손을 흔들었다.',cast:['nari'],effect:{meet:'nari',bond:{nari:1}}}]},
 seojinMeet:{title:'첫 출근',background:'cafe',lines:[
  {text:'강변 카페 ‘물결’. 첫 출근 날.'},
  {speaker:'사장님',text:'오늘은 서진이가 가르쳐 줄 거예요. 우리 조카인데, 제일 오래 일했어요.'},
  {text:'검정 상의 위에 짙은 청록색 앞치마를 한 사람이 돌아봤다. 길게 묶은 흑갈색 머리 아래로 가는 금색 귀걸이가 흔들렸다. 올라간 눈꼬리와 시선이 마주쳤다.',cast:['seojin']},
  {speaker:'서진',text:'백서진. 휴학생이고 스물넷. 누나라고 하든 반말을 하든 편한 대로 해. 대신 컵은 깨지 마.',cast:['seojin']},
  {speaker:'서진',text:'구경은 쉬는 시간에. 지금은 내 손 봐. 한 번 해 줄게.',cast:['seojin']},
  {text:'내가 시선을 내리자 서진의 입꼬리가 조금 올라갔다. 라테 비율, 마감 순서, 단골 이름. 설명도 손놀림도 군더더기가 없었다.',cast:['seojin']},
  {text:'마감 시간. 서진이 컵을 닦다가 창밖 강을 오래 봤다. 아까처럼 먼저 말을 꺼내지는 않았다.',cast:['seojin']},
  {choice:[
   {label:'“강 좋아해, 누나?”',effect:{meet:'seojin',bond:{seojin:4}},lines:[
    {speaker:'서진',text:'…좋아했지. 물 냄새가 나잖아.',cast:['seojin']},
    {text:'과거형이었다. 서진은 잠깐 늦게 나를 봤다. 나는 더 묻지 않고 컵을 내려놓았다.',cast:['seojin']},
    {speaker:'서진',text:'마감 끝. 첫날치고 잘했어, 알바생. 칭찬은 여기까지. 다음 근무 때 방심할까 봐.',cast:['seojin']}]},
   {label:'컵을 마저 닦는다',effect:{meet:'seojin',bond:{seojin:2}},lines:[
    {speaker:'서진',text:'눈치 빠르네. 오래 가겠어, 알바생.',cast:['seojin']},
    {text:'서진이 내가 닦은 잔을 빛에 비춰 보고는 그대로 선반에 올렸다.',cast:['seojin']}]}]}
 ]},
 firstRadio:{title:'물 위의 달',background:'room',lines:[{text:'목요일 밤 열한 시. 벽이 쿵쿵 울렸다.'},{speaker:'민재',text:'야! 학교 라디오 첫 방송 한다! 아쿠아 루나! 한여울숲 지금 난리야.'},{text:'알림이 동시에 울렸다. 이어폰을 꽂았다. 잔잔한 피아노. 그리고 목소리.'},{speaker:'루나',text:'안녕하세요, 아쿠아 루나의 루나예요. 오늘 하루, 잘 끝내고 계신가요.'},{text:'낯선 목소리였다. 그런데 어디선가 들은 것 같았다.'},{speaker:'루나',text:'이 방송은 여러분의 하루가 끝나는 곳이에요. 길었던 하루도, 별일 없던 하루도 괜찮아요.'},{speaker:'루나',text:'다음 주에는 여러분의 사연을 읽을게요. 익명이어도 좋고, 한 줄이어도 좋아요.'},{speaker:'루나',text:'오늘은 여기까지. 좋은 밤 보내세요.'},{text:'방송이 끝나고도 이어폰을 빼지 않았다. 창밖 강 위로 달이 떠 있었다.'}]}
};
Object.assign(window.AQUA_SCENES, {
 nariShake:{title:'떨리는 손',background:'practice',lines:[
  {text:'합주가 끝나고 다들 나간 동아리방. 나리가 앰프 위에 앉아 작은 수첩을 덮었다.',cast:['nari']},
  {speaker:'나리',text:'아, 너구나. 다행이다. 다른 사람이면 숨었을 거야.',cast:['nari']},
  {text:'나리가 손을 폈다. 피크를 너무 세게 쥐어서 손바닥에 자국이 나 있었다.',cast:['nari']},
  {speaker:'나리',text:'무대에선 하나도 안 떨려. 내려오는 순간부터 떨려. 내가 방금 뭘 한 건지 갑자기 실감 나서.',cast:['nari']},
  {speaker:'나리',text:'고등학생 때는 이럴 때 라디오에 사연 보냈어. 별명이 피크였어. …아, 이건 왜 말했지.',cast:['nari'],effect:{flag:'knowsPick'}},
  {choice:[{label:'“이거 내가 들고 있을게. 손 좀 쉬겠지.”',effect:{bond:{nari:5},card:'떨리는 손의 피크'},lines:[{speaker:'나리',text:'…그런 방법이 있었네.',cast:['nari']},{text:'나리가 빈손을 쥐었다 폈다 했다. 떨림이 천천히 멎었다.',cast:['nari']}]},{label:'“무대 위의 너, 진짜 커 보여.”',effect:{bond:{nari:3}},lines:[{speaker:'나리',text:'그치? 근데 그게 진짜 나인지 모르겠어.',cast:['nari']}]}]}
 ]},
 daeunFirst:{title:'1순위 떡볶이',background:'dining',lines:[
  {text:'점심시간. 학식 앞에서 다은이 손을 흔들었다.',cast:['daeun']},
  {speaker:'다은',text:'야! 학식 말고 떡볶이 먹으러 가자. 시장 안쪽 거. 내가 살게.',cast:['daeun']},
  {speaker:'나',text:'갑자기? 무슨 날이야?',cast:['daeun']},
  {speaker:'다은',text:'오늘 아침에 떡볶이 생각났는데, 제일 먼저 네 얼굴이 떠올랐어. 그래서 1순위로 연락한 거야. 기억해 둬.',cast:['daeun']},
  {text:'다은은 어묵 국물을 두 번 리필하면서 쉬지 않고 떠들었다.',cast:['daeun']},
  {choice:[{label:'“알았어. 1순위, 기억해 둘게.”',effect:{bond:{daeun:5},card:'1순위 떡볶이'},lines:[{speaker:'다은',text:'…어, 어. 그래. 진지하게 대답하니까 좀 이상하네.',cast:['daeun']},{text:'다은이 처음으로 말을 멈췄다. 그리고 아주 작게 웃었다.',cast:['daeun']}]},{label:'“다음엔 내가 살게. 그럼 공평하지.”',effect:{bond:{daeun:3},card:'1순위 떡볶이'},lines:[{speaker:'다은',text:'좋아! 그럼 다음 1순위는 네 차례다.',cast:['daeun']}]}]}
 ]},
 seojinPlaylist:{title:'마감 플레이리스트',background:'cafe',lines:[
  {text:'마감 30분 전이 되면 카페 음악이 바뀐다. 느리고, 물속처럼 먹먹한 노래들.',cast:['seojin']},
  {speaker:'나',text:'이 플레이리스트 누가 만든 거야? 좋다.',cast:['seojin']},
  {speaker:'서진',text:'누가 골랐으면 좋겠는데?',cast:['seojin']},
  {speaker:'사장님',text:'난 트로트밖에 몰라요.'},
  {speaker:'서진',text:'이모, 정답을 너무 빨리 알려 주네.',cast:['seojin']},
  {choice:[{label:'“누나 취향 좋네. 하나 공유해 줘.”',effect:{bond:{seojin:5},flag:'playlist'},lines:[{speaker:'서진',text:'보내 줄게. 네가 어디까지 듣나 궁금하니까. 다 들으면 제일 좋았던 곡 하나 골라 와.',cast:['seojin']},{text:'그날 밤 링크가 왔다. 플레이리스트 제목은 ‘수심 3m’였다.'}]},{label:'모르는 척 노래를 듣는다',effect:{bond:{seojin:3},flag:'playlist'},lines:[{text:'서진은 내 반응을 잠깐 보다가 스피커 쪽으로 시선을 돌렸다.',cast:['seojin']},{speaker:'서진',text:'다음 곡 제일 좋아해. 지금처럼 끝까지 들어.',cast:['seojin']}]}]}
 ]}
});
