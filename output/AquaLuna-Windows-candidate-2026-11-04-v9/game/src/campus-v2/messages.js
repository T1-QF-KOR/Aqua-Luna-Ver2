(function(root){
 const W=root.AquaWorld,D=root.AquaDialogue,B=root.AquaRelationships;
 const content={
 nari:[['오늘 과제 몇 마디까지 했어?','연습실 문이 좀 뻑뻑하더라. 손 조심해.','이 곡 제목 아는지 물어보려고. 나중에 들려줄게.','아까 인사 못 했네. 안녕.'],['네가 없는 옆자리는 좀 넓네.','점심 먹었어? 나도 지금 나가려고.','오늘은 먼저 말 걸어 봤어. 문자지만.','네 악보 여백 생각나서 나도 한 줄 비워 봤어.'],['아까 하려던 말 이제 생각났어. 보고 싶었다고.','네가 듣고 있을 때는 끝까지 해 보고 싶어져.','오늘은 할 말 없이 연락했어. 그래도 돼?','바람 좀 쐬고 왔어. 너랑 걸었으면 덜 추웠을까.']],
 daeun:[['야 일어났냐! 오늘 메뉴 봐 봐ㅋㅋ','공지 읽었지? 너한테만 확인하는 거 아냐!','스틱 한쪽 잃어버린 줄. 가방 밑에 있었어ㅋㅋ','오늘 수업 늦지 마라. 나도 뛰는 중!'],['점심 자리 네 몫도 잡을까?','너한테 제일 먼저 보내는 거다. 오늘 하늘 예쁨!','어제 웃긴 거 생각났는데 만나면 얘기해 줄게.','답장 천천히 해도 돼. 그래도 오면 좋고ㅋㅋ'],['오늘 너랑 얘기할 시간 있으면 좋겠다.','단톡방 말고 너한테 보낼 얘기 따로 모으는 중.','나 먼저 안 부르면 네가 불러 줄까 궁금했어. 못 참고 보냄ㅋㅋ','오늘은 그냥 네 이름 한 번 불러 보고 싶었어.']],
 seojin:[['오늘도 커피로 버틸 생각이면 취소해. 밥 먹고 와, 알바생.','비 온대. 우산 없이 와서 같이 쓰자고 하려던 건 아니지?','앞치마는 두 번째 서랍. 찾느라 나부터 부르지 말고.','마감 순서 바꿨어. 다음에 올 때 네 판단도 좀 볼게.'],['네가 좋아할 것 같은 곡 찾았어. 혼자 먼저 들어 봤는데, 네 반응도 궁금해.','오늘은 쉬는 중. 나한테 일 얘기하면 답장 좀 늦게 할 거야.','답장은 일 끝나고. 내 문자 때문에 컵 떨어뜨리면 곤란하니까.','별일은 없고. 네 생각이 나서 먼저 연락했어. 이유 더 필요해?'],['다음 마감 곡은 네가 골라. 내가 조금 더 있고 싶은 걸로.','오늘은 내가 먼저 불렀어. 네가 반가워하는지 좀 보려고.','바쁜데 연락한 건 아니야. 그냥 네가 궁금해서.','잘 잤어? 지금 네 목소리로 들으면 더 좋겠네.']]
 };
 const reply={honest:['네 연락 기다렸어. 만나서 얘기하자.','네가 먼저 물어봐 줘서 좋아. 나도 궁금했어.','오늘 네 생각 했어. 잠깐이라도 얼굴 보고 싶다.'],plain:['응. 나중에 보자.','알려 줘서 고마워. 잘 지내.','응, 확인했어. 좋은 하루 보내.']};
 const missed={nari:'…어제 기다렸어. 못 오면 알려 줘.',daeun:'야 어제 안 왔잖아. 무슨 일 없지? 다음엔 말해 줘.',seojin:'어제는 네 약속 믿고 기다렸어. 못 오는 건 말할 수 있잖아. 다음엔 먼저 연락해.'};
 const tips={
 nari:[['무대에서는 멀어 보여도 인사부터 해 봐.','한나리? 처음엔 말이 작아서 잘 들어야 해.'],['이제 네가 오면 먼저 고개 들던데.','너한테는 인사하고 기다리더라.'],['너랑 얘기할 땐 피크를 덜 만지는 것 같더라.','네 옆에서 조금 오래 머무는 거 봤어.'],['너한테 할 말을 따로 생각하는 것 같던데.','너를 보면 표정이 먼저 바뀌더라.']],
 daeun:[['다은이? 누구한테나 먼저 인사하니까 좀 더 얘기해 봐.','단톡방 말고 개인으로 말해 봐.'],['요즘 네 답장은 꼭 확인하더라.','너 부를 때 목소리가 더 커지는 건 알지?'],['너 없는 날에 너 어디 갔냐고 묻던데.','일정 잡을 때 네 시간부터 확인하더라.'],['너 있을 때 드럼 소리가 두 배야.','단톡방보다 네 답장에 더 웃던데.']],
 seojin:[['카페 누나? 인사는 짧아도 듣고는 있더라.','급하게 답 달라고 하지 말고 기다려 봐.'],['네가 올 시간엔 빈 의자를 닦더라.','알바 얘기 말고도 너랑 얘기하는 것 같던데.'],['요즘 네가 좋아하는 곡을 틀어 놓더라.','네가 오면 마감 뒤에 조금 더 앉아 있더라.'],['같이 쉬자는 말을 먼저 하던데.','너 기다릴 땐 시계를 자주 보더라.']]
 };
 const tomorrowSpeech={
  message:{
   nari:['내일 {time}에는 {place} 쪽에 있을 것 같아.','내일 {time}, {place}에 잠깐 갈 거야.','내일 {place}에서 {time}을 보낼 것 같아. 마주치면 인사해.','내일 {time}에 {place} 쪽으로 가려고. 시간 되면 봐.','내일 {place}에 {time}쯤 들를게. 우연히 만나도 좋겠다.'],
   daeun:['야 내일 {time}엔 {place}에 있을 거야!','내일 {place} 쪽에 {time}쯤 갈 건데 너도 지나가?','내일 {time}에 {place} 들러! 나 거기 있을 듯ㅋㅋ','내일 {place}에서 {time}에 볼 수도 있겠다. 내가 먼저 찾을 거야!','내일 {time}엔 {place}로 갈 생각이야. 마주치면 불러!'],
   seojin:['내일 {time}에는 {place} 쪽에 있을 거야. 마주치면 모른 척하기 없기.','내일 {place}에 {time}쯤 갈 것 같아. 궁금해할까 봐 먼저 알려 줘.','내일 {time}, {place}에서 보면 먼저 불러. 나도 찾아볼게.','내일은 {time}에 {place} 쪽으로 가려고. 너는 어디로 가?','내일 {place}에서 {time}쯤 마주칠 수도 있겠네. 알아보면 인사하고.']
  },
  hint:{
   nari:['나리 선배 내일 {time}엔 {place} 쪽에 있대.','내일 {place}에서 {time}쯤 나리 선배를 볼 수도 있겠다.','나리 선배 내일 {time}에 {place} 간다는 얘길 들었어.','내일 {time}쯤 {place}로 가 보면 나리 선배가 있을지도.','나리 선배는 내일 {place}에 {time}쯤 들를 것 같더라.'],
   daeun:['다은이는 내일 {time}에 {place} 간대.','내일 {place}에서 {time}쯤 다은이 볼 수도 있겠네.','다은이 내일 {time}엔 {place} 쪽이라더라.','내일 {time}에 {place} 가 보면 다은이 있을지도 몰라.','다은이가 내일 {place}에 {time}쯤 간다고 했어.'],
   seojin:['카페 누나는 내일 {time}에 {place} 쪽에 있대.','내일 {place}에서 {time}쯤 그 누나를 볼 수도 있겠네.','서진 누나 내일 {time}엔 {place}에 간다더라.','내일 {time}에 {place} 가면 서진 누나가 있을지도 몰라.','서진 누나는 내일 {place}에 {time}쯤 들를 것 같대.']
  }
 };
 function tomorrowPlace(s,id){const date=W.addDays(s.date,1);if(!s.met.includes(id)||date>'2027-02-26')return null;
  for(const slot of [1,2]){const next={...s,date,slot,encounters:{...s.encounters,plan:null}};const place=root.AquaEncounters.resolve(next).locations[id];
   if(place && W.scheduledAt(next,place).includes(id))return {place,time:slot===1?'오후':'노을'};}
  return null;
 }
 function tomorrowLine(s,id,source){const location=tomorrowPlace(s,id);if(!location)return '';
  const name=root.AquaSmallEvents.places[location.place]?.name;if(!name)return '';
  return D.pick(s,`tomorrow:${source}:${id}`,tomorrowSpeech[source][id]).replace('{time}',location.time).replace('{place}',name);
 }
 const band=[['다은','오늘 합주 끝나고 밥 먹을 사람! 나 배고픔!!'],['태오','케이블은 쓰고 제자리에. 지난번 거 아직 찾는다.'],['나리','🐱👍'],['다은','읽었으면 이모티콘이라도! 언니처럼ㅋㅋ']];
 function ensure(s){return s.messages ||= {inbox:[],appointments:[],lastMorning:null,lastRegular:null,lastInvite:null,rotation:0,inviteRotation:0,bandWeeks:[],hintDate:null,hintLines:[]};}
 function morning(s){const m=ensure(s);if(m.lastMorning===s.date)return;m.lastMorning=s.date;
  for(const a of m.appointments)if(a.status==='accepted'&&a.date<s.date){a.status='missed';B.change(s,a.person,-3);s.social.missedGreeting ||= {};s.social.missedGreeting[a.person]=true;m.inbox.push({id:`miss-${a.id}`,person:a.person,date:s.date,text:missed[a.person],kind:'missed',reply:'none'});}
  if(s.met.length&&(!m.lastRegular||W.addDays(m.lastRegular,3)<=s.date)){
   const id=s.met[m.rotation++%s.met.length],t=D.tier(s,id),base=D.pick(s,`message:${id}:${t}`,content[id][t]),tomorrow=tomorrowLine(s,id,'message'),text=tomorrow?`${base}\n${tomorrow}`:base;
   m.inbox.push({id:`msg-${s.date}`,person:id,date:s.date,text,kind:'regular',reply:null});m.lastRegular=s.date;
  }
  const friends=s.met.filter(id=>s.bond[id]>=(id==='nari'?25:15));
  if(friends.length&&(!m.lastInvite||W.addDays(m.lastInvite,10)<=s.date)){
   const person=friends[m.inviteRotation++%friends.length],places=['river','cafe','roof'],place=places[(m.inviteRotation-1)%3];
   let date=W.addDays(s.date,1);
   // Appointments use the afternoon and sunset. Avoid dates with mandatory
   // story scenes in either slot so accepting an invitation remains feasible.
   const busyDates=['2026-03-05','2026-03-10','2026-04-19','2026-05-20','2026-06-19','2026-06-20'];
   while(busyDates.includes(date))date=W.addDays(date,1);
   if(date<='2026-06-30'){const appointment={id:`invite-${s.date}`,person,date,slot:1,place,status:'offered',paid:m.inviteRotation%2===1};
    m.appointments.push(appointment);m.inbox.push({id:appointment.id,person,date:s.date,kind:'invite',text:person==='seojin'?`${date.slice(5).replace('-','/')} 오후, ${{river:'한강변',cafe:'카페',roof:'옥상 정원'}[place]}에서 볼래? 네 시간 좀 쓰고 싶어서.${appointment.paid?' 이번엔 내가 살게.':''}`:`${date.slice(5).replace('-','/')} 오후에 ${{river:'한강변',cafe:'카페',roof:'옥상 정원'}[place]}에서 볼래?${appointment.paid?' 이번엔 내가 챙길게.':''}`,reply:null});m.lastInvite=s.date;}
  }
  const bandKey=`${W.weekKey(s.date)}:${W.weekday(s.date)>=4?'late':'early'}`;
  if(s.club==='band'&&!m.bandWeeks.includes(bandKey)){m.bandWeeks.push(bandKey);m.inbox.push({id:`band-${bandKey}`,date:s.date,kind:'band',text:band.map(([name,text])=>`${name}: ${text}`).join('\n'),reply:'none'});}
 }
 function respond(s,id,mode){const m=ensure(s),msg=m.inbox.find(x=>x.id===id);if(!msg||msg.reply!==null||msg.kind==='band')return false;
  if(msg.kind==='invite') {const a=m.appointments.find(x=>x.id===id);if(!a||a.date<s.date)return false;a.status=mode==='accept'?'accepted':'declined';msg.reply=mode;return true;}
  if(!['honest','plain','none'].includes(mode))return false;msg.reply=mode;msg.replyText=mode==='none'?'':reply[mode][D.tier(s,msg.person)];
  if(mode!=='none') B.change(s,msg.person,mode==='honest'?(D.tier(s,msg.person)===2?3:2):1,'message');
  else if(msg.person==='daeun'&&s.date>='2026-10-01')s.flags.daeunUnanswered=true;
  return true;
 }
 function due(s,place){return ensure(s).appointments.find(a=>a.status==='accepted'&&a.date===s.date&&a.slot===s.slot&&a.place===place);}
 function start(s,id){const a=ensure(s).appointments.find(x=>x.id===id);if(!a||a!==due(s,a.place)||s.energy<15)return null;const dest=root.AquaSocial.destinations.find(d=>d.id===a.place),price=a.paid?0:dest.price;if(s.money<price)return null;
  s.energy-=15;s.money-=price;a.status='attending';s.social.lastMet[a.person]=s.date;
  return {person:a.person,destination:a.place,date:s.date,variant:s.social.album.filter(x=>x.person===a.person&&x.destination===a.place).length%4,bonus:0,appointmentId:id};
 }
 function hint(s){const m=ensure(s);if(m.hintDate===s.date)return m.hintLines;m.hintDate=s.date;
  m.hintLines=s.met.map(id=>{const stage=id==='nari'?(s.bond[id]>=45?3:s.bond[id]>=25?2:s.bond[id]>=10?1:0):(s.bond[id]>=55?3:D.tier(s,id)),tomorrow=tomorrowLine(s,id,'hint');return `${W.people[id].short} · ${D.pick(s,`hint:${id}:${stage}`,tips[id][stage])}${tomorrow?' '+tomorrow:''}`;});
  if(s.met.filter(id=>D.tier(s,id)===2).length>=2)m.hintLines.push('야. 너 지금 몇 명이랑 썸 타냐. 시간 약속 잘 지켜. 숲에 글 올라오기 직전이다.');return m.hintLines;
 }
 root.AquaMessages={content,reply,tips,band,tomorrowSpeech,tomorrowPlace,tomorrowLine,ensure,morning,respond,due,start,hint};
})(typeof window!=='undefined'?window:globalThis);
