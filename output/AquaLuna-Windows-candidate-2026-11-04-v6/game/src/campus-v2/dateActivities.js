/* Place-specific choices and character tastes for the first-semester dates. */
(function(root){
 const activities={
 river:[
  {prompt:'나는 산책로 앞에서 발걸음을 멈춘다.', options:['강을 따라 천천히 걷자.','다리 쪽으로 조금 더 가 볼까?','나무 그늘 쪽으로 가자.']},
  {prompt:'물결에 반사된 빛이 우리 발치까지 흔들린다.',options:['사진 한 장 찍을까?','풍경은 그냥 눈에 담자.','서로 한 장씩 찍어 주자.']},
  {prompt:'나는 벤치의 빈 자리를 가리킨다.',options:['잠깐 앉아서 쉬자.','오늘 좋았던 걸 하나씩 말하자.','아직 더 걷고 싶어?']}],
 cafe:[
  {prompt:'나는 메뉴판을 두 사람 사이에 놓는다.',options:['따뜻한 차를 고르자.','달콤한 디저트도 시키자.','서로 마실 걸 골라 줄까?']},
  {prompt:'나는 비어 있는 테이블을 둘러본다.',options:['창가 쪽에 앉자.','조용한 안쪽 자리가 좋아.','햇빛 드는 자리에 앉자.']},
  {prompt:'컵을 내려놓으니 잠깐 말이 끊긴다.',options:['오늘 들은 음악 얘기할까?','요즘 어떻게 지내는지 듣고 싶어.','아무 말 없이 조금 쉬자.']}],
 concert:[
  {prompt:'객석 문 앞에서 나는 표를 펼친다.',options:['무대가 잘 보이는 앞쪽으로 가자.','뒤쪽에서 편하게 듣자.','드럼이 보이는 자리를 찾자.']},
  {prompt:'첫 곡이 끝나고 박수가 객석을 채운다.',options:['좋았던 악기 소리를 말해 볼까?','다음 곡은 조용히 들어 보자.','같이 박자를 맞춰 볼까?']},
  {prompt:'앙코르가 끝나고 사람들이 천천히 일어난다.',options:['마지막 곡 얘기를 나누자.','서두르지 말고 나가자.','다음 공연도 같이 보자.']}],
 roof:[
  {prompt:'옥상 문을 열자 바람이 머리카락을 흔든다.',options:['화분 옆에 앉자.','난간에서 강을 볼까?','햇빛을 피해 그늘로 가자.']},
  {prompt:'나는 주머니에서 음료를 꺼낸다.',options:['한 모금씩 마시며 쉬자.','오늘 웃긴 일 하나씩 말하자.','말없이 풍경만 봐도 좋아.']},
  {prompt:'바람에 종이 한 장이 펄럭인다.',options:['종이에 오늘을 한 줄 적자.','다음에 올 시간을 정하자.','바람이 잦을 때까지 기다리자.']}],
 karaoke:[
  {prompt:'나는 리모컨을 들고 첫 곡 목록을 연다.',options:['같이 아는 신나는 곡부터.','조용한 곡을 먼저 들어 보자.','네가 첫 곡을 골라 줘.']},
  {prompt:'마이크 두 개를 소파 위에 나란히 둔다.',options:['같이 부를까?','이번엔 네가 편하게 불러.','내가 먼저 불러 볼게.']},
  {prompt:'화면에 점수 표시 버튼이 보인다.',options:['점수는 끄고 부르자.','점수 켜고 한 판 해 보자!','마지막 곡은 네가 정해.']}]
 };
 const answers={nari:['…응. 그게 좋겠다.','생각보다 괜찮네. 한 번 더 해 볼래?','네가 고른 거라 기억할게.'],daeun:['오케이! 그럼 바로 시작이다!','야, 그거 좋다ㅋㅋ','다음에도 이거 하자!'],seojin:['좋아. 그렇게 해 보자. 서두를 생각은 없지?','네가 고른 쪽이네. 어떤지 같이 확인해 보자.','좋아. 나는 이쪽. 네 생각도 듣고 싶고.']};
 const wrap={nari:{good:'…오늘, 다음 얘기가 또 생겼네. 좋다.',normal:'오늘 잘 왔어. 같이 있어서 괜찮았어.',poor:'조금 서툴렀지만 괜찮아. 다음에 다시 해 보자.'},daeun:{good:'야 오늘 진짜 좋았다! 다음 약속도 내가 잡을래!',normal:'같이 놀아서 좋았어. 다음엔 더 오래 있자!',poor:'오늘은 좀 엇갈렸지? 다음엔 서로 물어보자ㅋㅋ'},seojin:{good:'오늘 꽤 좋았어. 나 이렇게 오래 쉬는 거 잘 안 하는데. 다음 약속은 내가 잡을게.',normal:'같이 온 건 잘했네. 너도 괜찮았으면 다음에 또 부르고.',poor:'오늘은 좀 엇갈렸네. 괜찮은 척은 말자. 다음엔 고르기 전에 서로 물어보고.'}};
 function score(person,stage,option){const preferred={nari:[1,1,2],daeun:[0,2,1],seojin:[2,1,0]}[person][stage];return option===preferred?3:option===(preferred+1)%3?1:0;}
 function augment(s,outing,lines){const {person,destination}=outing,cast=[person],say=text=>({speaker:root.AquaWorld.people[person].short,text,cast,expr:'smile'});
  const item=root.AquaEconomy.clothes.find(x=>x.person===person&&x.outfit===s.giftClothes?.[person]);
  const gifted=item&&root.AquaWardrobe.pick(s,person,{outing})===item.outfit;
  if(gifted)lines.unshift({text:`${{nari:'나리가',daeun:'다은이',seojin:'서진이'}[person]} 내가 선물한 ${item.name} 차림으로 나왔다.`,cast,expr:'smile'});
  const out=[];activities[destination].forEach((step,stage)=>{out.push({text:step.prompt,cast,expr:'neutral'},{choice:step.options.map((label,index)=>({label,effect:{datePoints:score(person,stage,index),dateChoice:label},lines:[say(answers[person][index]),{text:'나는 그 말을 듣고 고개를 끄덕인다.',cast,expr:'neutral'}]}))});});
  out.push({dateResult:true,text:'오늘의 시간을 돌아본다.',cast,expr:'neutral'});
  lines.splice(Math.max(0,lines.length-1),0,...out);return lines;
 }
 function result(outing){const points=outing.points||0;return points>=7?'good':points>=4?'normal':'poor';}
 function finishLine(outing){return wrap[outing.person][result(outing)];}
 root.AquaDateActivities={activities,answers,wrap,score,augment,result,finishLine};
})(typeof window!=='undefined'?window:globalThis);
