(function(root){
 const W=root.AquaWorld;
 const words=[['질문','nari'],['계단','nari'],['여운','nari'],['숨','nari'],['빈칸','nari'],['새벽','nari'],['박자','daeun'],['달리기','daeun'],['불빛','daeun'],['웃음','daeun'],['자전거','daeun'],['출발','daeun'],['물','seojin'],['느린','seojin'],['창가','seojin'],['잔','seojin'],['그늘','seojin'],['휴식','seojin']];
 const reactions={
 nari:[['…끝까지 들어 봤어.','나는 여백이 좀 더 있는 쪽이 좋아. 다음엔 네가 좋아하는 이유도 말해 줘.','나는 마지막 음을 다시 낮춰 본다.'],['여기, 잠깐 쉬는 부분 좋네.','나중에 한 번 더 들려줘. 다른 날 들으면 달라질 것 같아.','나는 나리가 짚은 마디 옆에 점을 찍는다.'],['…이 끝, 대답이 없네.','다시 틀어 줘. 이번엔 처음부터 가만히 듣고 싶어.','나는 재생 버튼을 누르고 옆에 앉는다.']],
 daeun:[['오, 네 곡이구나!','나는 좀 더 뛰는 리듬이 좋긴 해. 그래도 끝까지 들었지!','나는 다은이 두드린 박자를 기억해 둔다.'],['중간에 고개 까딱하게 되네ㅋㅋ','다음엔 내가 드럼 붙여 봐도 돼?','나는 빈 트랙에 드럼이라고 적어 둔다.'],['야 이거! 몸이 먼저 움직인다!','네가 만든 곡으로 한 번 쳐 보고 싶어. 진짜로.','나는 다은이 맞춰 주는 카운트를 듣는다.']],
 seojin:[['끝까지 들었어. 감상도 제대로 듣고 싶지?','내 취향엔 조금 빠른데, 네가 고른 이유는 궁금해.','나는 이어폰 줄을 천천히 감는다.'],['가운데 조용해지는 부분, 거기 좋더라.','내가 고른 곡 말고 네 곡을 듣는 것도 괜찮네. 한 번 더 틀어 봐.','나는 서진이 가리킨 마디를 다시 재생한다.'],['이 곡은 마감 뒤에 듣고 싶어. 시간 안 쫓길 때.','마지막 음 때문에 더 앉아 있었네. 이 정도면 칭찬 제대로 했지?','나는 곡 이름을 종이에 적어 건넨다.']]
 };
 function ensure(s){return s.music ||= {songs:[],fragments:0,score:{nari:0,daeun:0,seojin:0},words:[],active:null,serial:0};}
 function required(s){return s.equipment?.length?3:4;}
 function begin(s){const m=ensure(s);if(m.active)return true;if(s.energy<15)return false;s.energy-=10;m.active={date:s.date,slot:s.slot,picks:[],settled:false};return true;}
 function cards(s){const m=ensure(s),bar=m.active?.picks.length||0,offset=(m.serial+bar)%6;return [words[offset],words[6+(offset+bar)%6],words[12+(offset+2*bar)%6]];}
 function choose(s,word){const m=ensure(s);if(!m.active||m.active.settled||m.active.picks.length>=4||!cards(s).some(w=>w[0]===word))return false;m.active.picks.push(word);return true;}
 function settle(s){const m=ensure(s),a=m.active;if(!a||a.settled||a.picks.length!==4)return false;a.settled=true;
  for(const w of a.picks){m.score[words.find(x=>x[0]===w)[1]]++;m.words.push(w);}m.fragments=Math.min(required(s),m.fragments+(root.AquaRelationships.hasReward(s,'nari')?2:1));m.serial++;
  root.AquaEconomy.gain(s,'sensitivity',2);root.AquaEconomy.gain(s,'knowledge',1);return true;
 }
 function complete(s,title){const m=ensure(s);if(!m.active?.settled)return false;
  if(m.fragments>=required(s)){const score={...m.score}; if(s.equipment?.includes('recorder')) { const strongest=Object.keys(score).sort((a,b)=>score[b]-score[a])[0]; score[strongest]++; } m.songs.push({id:`song-${m.serial}`,title:String(title||`이름 없는 곡 ${m.songs.length+1}`).slice(0,30),date:s.date,score,words:[...m.words],heard:{}});m.fragments-=required(s);m.score={nari:0,daeun:0,seojin:0};m.words=[];}
  m.active=null;return true;
 }
 function share(s,id,person){const song=ensure(s).songs.find(x=>x.id===id);if(!song||!s.met.includes(person))return null;
  const max=Math.max(...Object.values(song.score)),value=song.score[person],rank=value===max&&value>0?2:value>0?1:0;
  const first=!song.heard[person];if(first){song.heard[person]=s.date;W.recurringBond(s,person,[1,3,6][rank]);if(person==='nari')s.flags.nariHeardMelody=true;}
  return {title:`${song.title} · 곡을 들려준 날`,background:'practice',lines:[{text:`나는 「${song.title}」의 재생 버튼을 누른다.`,cast:[person],expr:'neutral'},...reactions[person][rank].map((text,i)=>({text,speaker:i<2?W.people[person].short:undefined,cast:[person],expr:rank===2?'happy':rank===1?'smile':'neutral'}))]};
 }
 root.AquaComposition={words,reactions,ensure,required,begin,cards,choose,settle,complete,share};
})(typeof window!=='undefined'?window:globalThis);
