/* First visits and small observations, grouped for editorial review. */
(function(root){
 const W=root.AquaWorld;
 const places={
 class:{name:'강의실',intro:['문을 열자 분필 냄새와 종이 냄새가 났다.','창가에는 아직 주인을 기다리는 악보가 놓여 있었다.','나는 빈 책상에 가방을 내려놓았다.'],spring:['창문 틈으로 악보 한 장이 들썩였다.','누군가 지우다 남긴 음표가 칠판에 있었다.','복도에서 실습이 끝나는 종이 울렸다.'],summer:['열린 창으로 더운 바람이 들어왔다.','책상에 햇빛이 길게 걸렸다.','나는 의자를 당겨 창문에서 조금 물러났다.']},
 library:{name:'도서관',intro:['문을 열자 발소리가 작아졌다.','책등이 빼곡한 통로 끝에 긴 책상이 있었다.','나는 비어 있는 창가 자리를 찾았다.'],spring:['책갈피 하나가 책상 위에 남아 있었다.','반납함에서 책이 포개지는 소리가 났다.','나는 창가에서 페이지가 저절로 넘어가는 걸 봤다.'],summer:['냉방 바람에 책장이 조금씩 움직였다.','누군가 연필로 적은 대출 날짜가 눈에 들어왔다.','나는 닫힌 책을 제자리에 밀어 넣었다.']},
 dining:{name:'학생식당',intro:['식판과 수저가 부딪히는 소리가 났다.','오늘의 메뉴가 입구 게시판에 적혀 있었다.','나는 줄 끝에서 천천히 메뉴를 읽었다.'],spring:['쟁반 위에 작은 귤 하나가 굴러왔다.','식권 자판기 옆에 오늘의 메뉴가 새로 붙었다.','나는 빈 물컵을 한 줄로 정리했다.'],summer:['차가운 물통 주위로 물방울이 맺혔다.','식당 문이 열릴 때마다 바깥의 더운 공기가 밀려왔다.','나는 마지막 남은 창가 자리를 발견했다.']},
 cafe:{name:'강변 카페',intro:['문을 열자 원두 향과 음악이 섞여 흘렀다.','강이 보이는 창가에 작은 테이블이 놓여 있었다.','나는 카운터의 메뉴판을 올려다봤다.'],spring:['빈 컵에 봄 햇빛이 둥글게 담겼다.','문에 매달린 종이 바람에 한 번 울렸다.','나는 카운터 옆에 놓인 물수건을 가지런히 접었다.'],summer:['얼음 부딪히는 소리가 유리창에 닿았다.','창문 밖 나뭇잎 그림자가 테이블을 흔들었다.','나는 응결된 물방울 아래 받침을 하나 놓았다.']},
 club:{name:'동아리방',intro:['문틈으로 낮은 앰프 소리가 새어 나왔다.','구석에는 케이블과 악기 케이스가 모여 있었다.','나는 문 옆에서 신발을 고쳐 신었다.'],spring:['메트로놈이 아무도 없는 방에서 짧게 울렸다.','케이블 끝에 작은 이름표가 달려 있었다.','나는 의자 밑으로 굴러간 피크를 발견했다.'],summer:['선풍기가 악보 모서리를 들었다 놓았다.','벽에 붙은 연습 일정표가 바람에 펄럭였다.','나는 박자가 적힌 종이를 책으로 눌러 두었다.']},
 studio:{name:'연습실',intro:['건반 덮개에 오후의 빛이 얹혀 있었다.','방음문이 닫히자 복도의 소리가 멀어졌다.','나는 의자 높이를 맞추고 건반 앞에 앉았다.'],spring:['건반 위 먼지 없는 자리에서 손가락 자국을 봤다.','창가에 놓인 연필이 바닥으로 굴러갔다.','나는 마지막 음이 사라질 때까지 손을 들지 않았다.'],summer:['닫힌 방 안에 선풍기 소리만 남았다.','녹음 버튼 옆에 작은 메모지가 붙어 있었다.','나는 열기 때문에 열린 문을 조금 더 밀었다.']},
 radio:{name:'방송국',intro:['복도 끝 유리문에 HYBS라고 적혀 있었다.','조정실의 작은 불빛들이 차례로 깜빡였다.','나는 문 앞의 방송 시간표를 읽었다.'],spring:['조정실 창 너머로 불이 하나 켜졌다.','낡은 방송 시간표가 게시판 한쪽에 남아 있었다.','나는 복도의 느슨한 전단을 다시 붙였다.'],summer:['선풍기가 방송 원고 끝을 살짝 들었다.','방송 장비의 불빛이 여름 햇살에 희미했다.','나는 정리된 음반 상자의 먼지를 털었다.']},
 roof:{name:'옥상 정원',intro:['계단을 끝까지 오르자 바람이 먼저 닿았다.','화분 사이로 도시와 강이 조금씩 보였다.','나는 난간에서 한 걸음 떨어져 섰다.'],spring:['화분의 새잎 하나가 바람을 따라 흔들렸다.','난간 아래로 벚꽃잎이 흘러갔다.','나는 날아갈 듯한 화분 이름표를 눌러 놓았다.'],summer:['화분의 흙이 햇빛에 바싹 말라 있었다.','그늘이 벤치 다리 아래에 작게 모였다.','나는 시원한 바람을 기다리며 계단참에 섰다.']},
 river:{name:'한강변',intro:['강물은 고향의 바다보다 잔잔했다.','자전거와 산책하는 사람들이 서로를 비켜 갔다.','나는 물가를 따라 천천히 걸었다.'],spring:['강물 위로 벚꽃잎이 하나씩 지나갔다.','자전거 종소리가 뒤에서 멀어졌다.','나는 벤치 옆에 떨어진 종이컵을 주웠다.'],summer:['햇빛이 물 위에서 잘게 부서졌다.','다리 아래 그늘에 바람이 모였다.','나는 강변 분수대에서 손을 잠깐 식혔다.']},
 concert:{name:'공연장',intro:['아직 무대에는 불이 켜지지 않았다.','빈 객석의 의자들이 무대 쪽으로 향해 있었다.','나는 입구의 공연 일정표를 살펴봤다.'],spring:['무대 점검 소리가 객석 끝까지 번졌다.','포스터 모서리가 벽에서 떨어져 있었다.','나는 빈 객석에서 박수 소리를 상상했다.'],summer:['객석 문이 열리며 시원한 공기가 흘렀다.','공연 일정표에 손으로 쓴 새 날짜가 붙었다.','나는 퇴장하는 사람들의 발걸음이 잦아들기를 기다렸다.']},
 room:{name:'내 방',intro:['상자를 접자 방이 조금 넓어졌다.','창문 너머로 강 쪽 불빛이 보였다.','나는 가방을 내려놓고 자리에 앉았다.'],spring:['창틀에 붙은 꽃잎 하나를 발견했다.','옆방에서 민재가 의자를 끄는 소리가 났다.','나는 전기포트 옆에 컵을 하나 더 놓았다.'],summer:['창문을 열자 더운 바람이 들어왔다.','선풍기 앞에 놓인 악보가 흔들렸다.','나는 물 한 잔을 마시고 창밖을 봤다.']}
 };
 const extra={
 class:[['새로 지운 칠판에 하얀 가루가 남아 있었다.','누군가 창가 책상에 접어 둔 시간표를 찾으러 왔다.','나는 빈 악보의 오선 위에 그림자를 올려 보았다.'],['복도 끝에서 늦게 끝난 수업의 웃음소리가 들렸다.','나는 열려 있던 창문을 조금 더 밀어 바람길을 냈다.','교실 구석의 선풍기가 천천히 방향을 바꾸었다.']],
 library:[['책 사이에서 대출표가 바스락거렸다.','누군가 찾던 책의 빈자리에 안내 쪽지가 놓여 있었다.','나는 글씨가 작은 책을 창가 빛 아래로 옮겼다.'],['반납된 책 한 권이 수레 맨 위에서 미끄러졌다.','나는 차가운 물병을 책에서 멀리 두었다.','창가에 앉은 사람의 연필이 종이를 느리게 긁었다.']],
 dining:[['메뉴판 옆에 직접 그린 작은 당근 그림이 붙었다.','나는 쟁반을 돌려 수저가 떨어지지 않게 잡았다.','식당 창문에 바깥 나무가 비쳤다.'],['나는 물을 받으려다 빈 컵이 쌓인 걸 봤다.','늦은 점심 손님들이 하나둘 빈자리를 채웠다.','창가에 놓인 얼음이 맑은 소리를 냈다.']],
 cafe:[['사장님이 바꾼 메뉴판에 새 글씨가 삐뚤게 적혀 있었다.','테이블 하나에 강물 그림자가 일렁였다.','나는 흔들리는 의자 다리 아래를 살펴봤다.'],['시원한 물잔 바깥으로 작은 물방울이 흘렀다.','카페 문이 열리자 자전거 종소리가 잠깐 들어왔다.','나는 비어 있는 컵받침을 카운터로 옮겼다.']],
 club:[['오래된 합주 표에 지운 연필 자국이 남아 있었다.','드럼 패드 위에 작은 천이 덮여 있었다.','나는 바닥의 악기 케이블을 벽 쪽으로 모았다.'],['열린 문틈으로 이웃 동아리의 웃음소리가 났다.','앰프 옆 생수병에 이름이 하나씩 적혀 있었다.','나는 낡은 스탠드 나사를 가볍게 조였다.']],
 studio:[['빈 악보 위로 창틀 그림자가 다섯 줄을 만들었다.','건반 옆 시계의 초침이 작은 박자를 세었다.','나는 놓여 있던 이어폰 줄을 풀었다.'],['벽에 붙은 방음재 가장자리가 살짝 들떠 있었다.','나는 건반 뚜껑을 닫기 전에 마지막 음을 눌렀다.','문밖에서 다음 연습자가 조용히 기다리고 있었다.']],
 radio:[['방송국 게시판에 오래된 곡 목록이 붙어 있었다.','마이크 덮개가 책상 위에서 동그랗게 굴렀다.','나는 접힌 방송 안내문의 모서리를 폈다.'],['조정실 앞에 시원한 물이 담긴 병이 놓였다.','나는 방송 일정이 적힌 칠판을 가만히 읽었다.','복도 끝에서 장비 점검을 알리는 소리가 났다.']],
 roof:[['화분 사이로 작은 벌 한 마리가 지나갔다.','난간 위에 내려앉은 꽃잎이 빙글 돌았다.','나는 벤치 아래 굴러간 조약돌을 주웠다.'],['낮은 담장에 해가 데운 냄새가 남아 있었다.','물뿌리개 옆에 흙 묻은 장갑이 놓여 있었다.','나는 발끝을 그늘 쪽으로 옮겨 섰다.']],
 river:[['강을 건너는 배의 물결이 늦게 도착했다.','벤치 옆 풀잎이 자전거 바람에 흔들렸다.','나는 강 쪽으로 날아간 모자를 주워 돌려줬다.'],['나무 아래에서 아이가 자전거 바퀴를 고쳐 달라고 불렀다.','나는 물 위의 빛을 따라 시선을 천천히 옮겼다.','산책로 끝에서 누군가 운동화 끈을 다시 묶었다.']],
 concert:[['입구의 오늘 공연 표지판이 바람에 흔들렸다.','객석 문틈으로 누군가 악기를 조율하는 소리가 났다.','나는 의자 사이에 떨어진 공연 안내문을 주웠다.'],['누군가 빈 무대에서 조명 위치를 확인했다.','휴식 시간의 객석에서 물병 뚜껑 소리가 났다.','나는 표 한 장이 떨어지지 않게 지갑에 넣었다.']],
 room:[['책상 모서리에 뜯지 않은 택배 상자가 있었다.','나는 문 앞에 놓인 전단을 접어 한쪽에 뒀다.','창문을 닫자 복도에서 누군가 부르는 소리가 들렸다.'],['선풍기 그릴에 매달린 먼지가 빛을 받았다.','나는 마른 수건을 창가에서 걷어 들였다.','냉장고에서 꺼낸 물병에 손바닥 자국이 남았다.']]
 };
 const moments=['나는 잠시 걸음을 멈췄다.','나는 눈에 들어온 것을 한 번 더 살폈다.','나는 그 장면을 마음속에 담아 두었다.'];
 const observations=Object.entries(places).flatMap(([place,p])=>['spring','summer'].flatMap(season=>p[season].map((text,index)=>({id:`${place}-${season}-${index}`,place,season,slot:index,text,title:`${p.name} · ${season==='spring'?'봄':'초여름'} ${['아침','오후','노을'][index]}`,choice:index!==0}))));
 for(const [place,seasons] of Object.entries(extra))for(const [season,index] of [['spring',0],['summer',1]])for(let slot=0;slot<3;slot++)observations.push({id:`${place}-${season}-${slot}-b`,place,season,slot,text:seasons[index][slot],title:`${places[place].name} · ${season==='spring'?'봄':'초여름'} ${['아침','오후','노을'][slot]} · 두 번째`,choice:true});
 const choiceText={class:'악보를 정리한다',library:'책을 제자리에 놓는다',dining:'빈 자리를 정리한다',cafe:'작은 일을 돕는다',club:'도구를 정리한다',studio:'음 하나를 적어 둔다',radio:'자료를 정리한다',roof:'화분을 살펴본다',river:'주변을 정리한다',concert:'안내문을 살펴본다',room:'자리를 정리한다'};
 const topics={nari:'오늘 본 풍경을 한 줄로 적으면 좋겠다. 너는 어떻게 적을래?',daeun:'야 그런 거 혼자만 봤어? 다음엔 같이 보자!',seojin:'그걸 보고 내 생각이 났어? 좋아. 어디가 제일 눈에 들어왔는데?'};
 const common={
 exam:{title:'시험 전날 도서관',background:'library',lines:['도서관에 빈 자리를 찾기 어려웠다.','나는 쌓인 노트 사이에 연필을 놓았다.','모르는 부분을 다시 펼쳤지만 같은 줄에서 두 번 멈췄다.','맞은편 의자가 조용히 움직였다.','나는 고개를 들어 자리를 내주었다.','창문 밖에서는 해가 천천히 기울었다.','누군가 정리한 필기 끝에 작은 별표가 있었다.','나는 그 부분부터 다시 읽기 시작했다.']},
 party:{title:'기말 끝난 날 뒤풀이',background:'dining',lines:['마지막 시험이 끝나자 복도가 한꺼번에 시끄러워졌다.','나는 가방에 구겨진 시험지를 넣었다.','학생식당 구석에 자리를 잡은 사람들이 손을 흔들었다.','식탁에는 얼음이 녹아 가는 음료가 놓여 있었다.','누군가 이번 학기에 제일 어려웠던 일을 물었다.','나는 바로 답하지 못하고 컵을 돌렸다.','처음 왔을 때보다 아는 목소리가 많아졌다.','나는 남은 음료를 마저 마셨다.']},
 vacation:{title:'방학 첫날 약속',background:'river',lines:['수업이 없는 첫날 아침이었다.','나는 평소보다 늦게 눈을 떴다.','달력에는 한동안 빈칸이 이어졌다.','강변으로 나가자 물 위에 햇빛이 번졌다.','앞으로 뭘 할지 묻는 목소리가 들렸다.','나는 가방 속 수첩을 꺼냈다.','아직 아무것도 쓰지 않은 페이지였다.','나는 빈 줄 하나에 날짜를 적었다.']}
 };
 const commonSpeech={nari:['모르는 건 같이 찾아보자. 답은 천천히.','시험 끝났네. …오늘은 조금 더 있어도 돼?','빈 날 하나는 나한테 남겨 줄래?'],daeun:['야, 내가 아는 건 꼭 알려 줄게. 모르는 건 같이 고민하고!','끝났다! 뒤풀이는 내가 출석 부른다!','방학 첫 약속! 너랑 뭐부터 할까?'],seojin:['잠깐 쉬자. 계속 노려본다고 답이 먼저 나오진 않더라.','시험 끝났지? 오늘 한 끼는 나랑 먹을래?','시간 비면 연락해. 내 쉬는 날에 네 자리도 좀 만들어 보게.']};
 // Work episodes are separate from the ambient observations above.
 const workStories=[
  {id:'work-cups',title:'컵의 순서',speaker:'서진',requires:'seojin',lines:['나는 주문이 밀린 카운터에서 컵 두 개를 헷갈렸다.','서진이 내 손을 멈추고 컵 아래 적힌 표시를 가리켰다.','표시를 다시 보니 얼음이 없는 잔이 먼저였다.'],speech:'급할수록 한 번 보고 줘. 다시 만드는 것보다 빨라.',choices:[{label:'표시를 소리 내어 확인한다',effect:{stats:{knowledge:2}},text:'나는 주문을 한 번 더 읽고 차례대로 잔을 놓았다.'},{label:'서진에게 순서를 물어본다',effect:{bond:{seojin:1}},text:'서진이 손가락으로 표시를 짚었다. 나는 그 순서를 따라 적었다.'}]},
  {id:'work-note',title:'컵의 순서 · 작은 메모',speaker:'서진',requires:'seojin',after:'work-cups',lines:['나는 지난번에 적은 주문 메모를 카운터 밑에 붙였다.','서진이 메모를 보고 펜을 하나 꺼냈다.','그녀는 우유가 들어가는 순서 옆에 작은 화살표를 그렸다.'],speech:'괜찮네. 처음 보는 사람도 알겠어. 알바생에서 교육 담당까지 노리나?',choices:[{label:'빈칸을 남겨 다음 주문을 적는다',effect:{stats:{knowledge:2}},text:'나는 메모 아래에 줄을 하나 더 그었다.'},{label:'서진에게 고맙다고 말한다',effect:{bond:{seojin:1}},text:'서진은 펜 뚜껑을 닫고 내 쪽으로 밀어 주었다.'}]},
  {id:'work-rain',title:'빗물 묻은 입구',speaker:'사장님',rain:true,lines:['나는 입구의 젖은 바닥을 보고 걸레를 가져왔다.','사장님이 문을 열어 둔 채 미끄럼 안내판을 찾았다.','손님이 들어오기 전에 나는 안내판을 세울 자리를 살폈다.'],speech:'안내판은 문에서 보이는 곳에 놓아 주세요.',choices:[{label:'입구에서 보이게 안내판을 세운다',effect:{stats:{energy:2}},text:'나는 문을 열어 보고 글씨가 보이는지 확인했다.'},{label:'바닥의 물기를 먼저 닦는다',effect:{stats:{fitness:2}},text:'나는 젖은 발자국이 끝나는 곳까지 걸레를 밀었다.'}]},
  {id:'work-sign',title:'빗물 묻은 입구 · 다음 근무',speaker:'사장님',after:'work-rain',lines:['나는 접어 둔 안내판을 창고에서 꺼냈다.','지난번 젖었던 자리에 마른 수건도 한 장 가져다 놓았다.','사장님이 문 앞을 보고 고개를 끄덕였다.'],speech:'오늘은 미리 준비해 두셨네요. 고마워요.',choices:[{label:'수건을 더 가져다 둔다',effect:{stats:{fitness:2}},text:'나는 창고에서 수건을 한 장 더 꺼냈다.'},{label:'안내판의 글씨를 닦는다',effect:{stats:{energy:2}},text:'나는 마른 천으로 글씨에 묻은 얼룩을 지웠다.'}]},
  {id:'work-milk',title:'우유가 모자랄 때',speaker:'사장님',lines:['나는 냉장고에 우유가 한 팩만 남은 것을 봤다.','사장님은 창고 재고표에 마지막 수량을 적고 있었다.','카운터에는 아직 만들어야 할 주문이 놓여 있었다.'],speech:'창고에 있는지 먼저 확인해 주시겠어요?',choices:[{label:'창고에서 재고를 확인한다',effect:{stats:{knowledge:2}},text:'나는 유통기한을 살펴 먼저 쓸 팩을 골랐다.'},{label:'남은 주문을 정리한다',effect:{stats:{energy:2}},text:'나는 우유가 필요한 주문을 한쪽에 모아 두었다.'}]},
  {id:'work-stock',title:'재고표의 빈칸',speaker:'사장님',after:'work-milk',lines:['나는 지난번 빈칸으로 남겨 둔 재고표를 꺼냈다.','사장님이 새로 들여온 우유 상자를 옆에 내려놓았다.','날짜가 다른 팩을 어떻게 놓을지 자리가 필요했다.'],speech:'먼저 들어온 것부터 보이게 놓아 주세요.',choices:[{label:'날짜순으로 진열한다',effect:{stats:{knowledge:2}},text:'나는 날짜가 빠른 팩을 앞줄에 놓았다.'},{label:'빈 상자를 접어 정리한다',effect:{stats:{fitness:2}},text:'나는 통로에 쌓인 빈 상자를 접어 옮겼다.'}]},
  {id:'work-menu',title:'낯선 메뉴 이름',speaker:'서진',requires:'seojin',lines:['나는 손님이 물은 메뉴 이름을 듣고 메뉴판을 다시 봤다.','서진은 급하게 답하지 않고 메뉴 설명을 펼쳤다.','나는 손님이 기다리는 동안 물을 한 잔 가져왔다.'],speech:'모르면 확인해. 자신 있는 표정보다 맞는 답이 먼저니까.',choices:[{label:'설명을 함께 읽는다',effect:{stats:{knowledge:2}},text:'나는 재료와 따뜻한 음료인지 차례로 확인했다.'},{label:'서진에게 고맙다고 말한다',effect:{bond:{seojin:1}},text:'서진은 메뉴판을 닫고 다음 주문을 받을 자리를 만들어 줬다.'}]},
  {id:'work-chair',title:'마지막 의자',speaker:'서진',requires:'seojin',lines:['나는 마감 뒤 테이블 아래에 남은 의자를 발견했다.','서진은 다른 의자들을 올려놓고 내 쪽을 돌아봤다.','바닥을 닦으려면 의자 아래가 비어야 했다.'],speech:'반대쪽 잡아. 힘자랑은 영업 끝났을 때도 안 받아 줄 거야.',choices:[{label:'반대쪽 다리를 잡는다',effect:{bond:{seojin:1}},text:'나는 서진과 숫자를 세고 의자를 함께 들어 올렸다.'},{label:'테이블 주변을 먼저 치운다',effect:{stats:{fitness:2}},text:'나는 발에 걸릴 물건을 치우고 의자를 옮길 공간을 만들었다.'}]}
 ];
 function ensure(s){return s.smallEvents ||= {visited:[],seen:[],topic:null};}
 function first(s,place){const e=ensure(s),p=places[place];if(!p||e.visited.includes(place))return null;e.visited.push(place);return {title:`처음 찾은 ${p.name}`,background:{class:'classroom',library:'library',dining:'dining',cafe:'cafe',club:'practice',studio:'practice',radio:'radio',roof:'rooftop',river:'river',concert:'concert',room:'room'}[place],lines:p.intro.map(text=>({text,expr:'neutral'}))};}
 function hash(str){let n=2166136261;for(const c of str)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
 function approach(s,id,place){
  if(!s.met.includes(id)||!W.presentAt(s,place).includes(id))return null;
  const prefix='approach:',week=W.weekKey(s.date),keys=Object.keys(s.flags).filter(k=>k.startsWith(prefix));
  if(keys.some(k=>k.startsWith(`${prefix}${s.date}:`)) || keys.filter(k=>W.weekKey(k.slice(prefix.length,prefix.length+10))===week).length>=3)return null;
  const variants=root.AquaPeopleEvents.visits[id],candidates=variants.map((entry,index)=>({entry,index})).filter(x=>!x.entry.places||x.entry.places.includes(place));
  const last=index=>keys.filter(k=>k.endsWith(`:${id}:${index}`)).map(k=>k.slice(prefix.length,prefix.length+10)).sort().at(-1)||'';
  const available=candidates.filter(x=>!last(x.index)||W.addDays(last(x.index),14)<=s.date);
  const selected=[...(available.length?available:candidates)].sort((a,b)=>last(a.index).localeCompare(last(b.index)))[0];
  if(!selected)return null;const {entry,index}=selected,flag=`${prefix}${s.date}:${id}:${index}`,cast=[id];
  return {id:`approach-${id}-${index}`,title:entry[0],background:firstBackground(place),lines:[
   {text:entry[1],cast,expr:'neutral',effect:{flag}},{text:entry[2],cast,expr:'neutral'},
   {speaker:W.people[id].short,text:entry[3],cast,expr:'smile'},
   {choice:entry.slice(4).map(c=>({label:c[0],effect:{stats:{[c[2]]:1}},lines:[{text:c[1],cast,expr:'neutral'}]}))}]};
 }
 function people(s,place){const e=ensure(s),season=s.date<'2026-06-01'?'spring':'summer';
  const plan=root.AquaEncounters.resolve(s);
  const pool=root.AquaPeopleEvents.events.filter(x=>x.place===place&&x.season===season&&x.slot===s.slot&&x.days.includes(W.weekday(s.date))&&
    !e.seen.includes(x.id)&&(!x.after||e.seen.includes(x.after))&&(!x.person||(s.met.includes(x.person)&&root.AquaDialogue.tier(s,x.person)>=x.stage&&plan.locations[x.person]===place&&!(x.person==='nari'&&W.weekday(s.date)===4&&s.slot===2))));
  if(!pool.length)return null;const x=pool[hash(`${s.date}:${s.slot}:${place}:pick`)%pool.length];e.seen.push(x.id);
  const cast=x.person?[x.person]:[];return {id:x.id,title:x.title,background:firstBackground(place),lines:[...x.setup.map(text=>({text,cast,expr:'neutral'})),{speaker:x.person?W.people[x.person].short:x.speaker,text:x.speech,cast,expr:'neutral'},{choice:x.choices.map(c=>({label:c.label,effect:c.effect,lines:[{text:c.text,cast,expr:'neutral'}]}))}]};
 }
 function maybe(s,place){const e=ensure(s),season=s.date<'2026-06-01'?'spring':'summer';
  if(place==='cafe' && s.workDays.includes(s.date)) { const story=workStories.find(x=>!e.seen.includes(x.id)&&(!x.requires||s.met.includes(x.requires)&&W.presentAt(s,place).includes(x.requires))&&(!x.rain||root.AquaEncounters.weather(s)==='rain')&&(!x.after||e.seen.includes(x.after))); if(story){e.seen.push(story.id);return {id:story.id,title:story.title,background:'cafe',lines:[...story.lines.map(text=>({text,expr:'neutral'})),{speaker:story.speaker,text:story.speech,expr:'neutral',...(story.requires?{cast:[story.requires]}:{})},{choice:story.choices.map(c=>({label:c.label,effect:c.effect,lines:[{text:c.text,expr:'neutral'}]}))}]};} }
  if(!places[place] || hash(`${s.encounters.seed}:${s.date}:${s.slot}:${place}`)%10>=3)return null;
  const personEvent=people(s,place);if(personEvent)return personEvent;
  let pool=observations.filter(x=>x.place===place&&x.season===season&&x.slot===Math.min(s.slot,2)&&!e.seen.includes(x.id));
  if(!pool.length)pool=observations.filter(x=>x.place===place&&x.season===season&&!e.seen.includes(x.id));
  if(!pool.length){e.seen=e.seen.filter(id=>!id.startsWith(`${place}-${season}-`));pool=observations.filter(x=>x.place===place&&x.season===season&&x.slot===Math.min(s.slot,2));}
  const item=pool[hash(`${s.date}:${s.slot}:${place}`)%pool.length];e.seen.push(item.id);
  const lines=[{text:item.text,expr:'neutral'},{text:moments[item.slot],expr:'neutral'}];
  if(item.choice)lines.push({choice:[{label:choiceText[place],effect:{smallTopic:item.id,stats:{energy:2}},lines:[{text:'나는 손을 털고 다시 주변을 둘러봤다.',expr:'neutral'}]},{label:'잠시 바라보다가 돌아간다',lines:[{text:'나는 서두르지 않고 자리를 떠났다.',expr:'neutral'}]}]});
  return {id:item.id,title:item.title,background:firstBackground(place),lines};
 }
 function firstBackground(place){return {class:'classroom',library:'library',dining:'dining',cafe:'cafe',club:'practice',studio:'practice',radio:'radio',roof:'rooftop',river:'river',concert:'concert',room:'room'}[place];}
 function commonScene(s,id){const item=common[id],person=s.met.slice().sort((a,b)=>s.bond[b]-s.bond[a])[0],idx=['exam','party','vacation'].indexOf(id),lines=item.lines.map(text=>({text,expr:'neutral'}));
  if(person){lines.splice(4,0,{speaker:W.people[person].short,text:commonSpeech[person][idx],cast:[person],expr:'smile'});lines.push({choice:[{label:'“같이 천천히 해 보자.”',effect:{bond:{[person]:2}},lines:[{speaker:W.people[person].short,text:{nari:'…응. 같이.',daeun:'좋아! 약속이다!',seojin:'그래. 같이 하자.'}[person],cast:[person],expr:'smile'}]},{label:'고개를 끄덕이고 옆에 앉는다',effect:{bond:{[person]:1}},lines:[{text:'나는 그 사람 옆에서 잠시 쉬었다.',cast:[person],expr:'neutral'}]}]});}
  return {title:item.title,background:item.background,lines};
 }
 root.AquaSmallEvents={places,observations,workStories,choiceText,topics,common,commonSpeech,ensure,first,approach,people,maybe,commonScene};
})(typeof window!=='undefined'?window:globalThis);
