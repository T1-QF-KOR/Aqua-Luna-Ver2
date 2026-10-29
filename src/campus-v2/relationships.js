(function(root){
 const W=root.AquaWorld;
 const gates=[
  {id:'daeunFirst',person:'daeun',value:15}, {id:'daeunBike',person:'daeun',value:35}, {id:'daeunChat',person:'daeun',value:55,stat:'fitness'},
  {id:'seojinPlaylist',person:'seojin',value:15}, {id:'seojinCup',person:'seojin',value:35}, {id:'seojinRain',person:'seojin',value:55,stat:'knowledge'},
  {id:'nariVolume',person:'nari',value:25}, {id:'nariDemo',person:'nari',value:45,stat:'sensitivity'}
 ];
 const rewards={nari:'작곡할 때 조각 하나를 더 남긴다.',daeun:'학생식당에서 함께 챙긴 한 끼 · 기력 10 추가',seojin:'나눠 맡는 마감 · 근무 기력 소모 6 감소'};
 const rewardLines={nari:'네가 만들던 거, 다음 마디 같이 생각해 봤어. 적어 둘래?',daeun:'학식 먹을 땐 내가 반찬 챙길게. 밥 잘 먹어야 같이 다니지!',seojin:'이제 마감은 나눠 하자. 무거운 건 같이 들면 덜 힘들어.'};
 function ensure(s){s.relationships ||= {pending:{},unlocked:[],chatGain:{},decayWeeks:[],rewards:[]};return s.relationships;}
 function change(s,id,amount,source='story'){
  const r=ensure(s);let delta=amount;
  if(source==='chat' && delta>0){const cap=id==='nari'?12:20;delta=Math.min(delta,Math.max(0,cap-(r.chatGain[id]||0)));r.chatGain[id]=(r.chatGain[id]||0)+delta;}
  const before=s.bond[id];const gate=gates.find(g=>g.person===id&&!r.unlocked.includes(g.id));
  let target=W.clamp(before+delta);
  if(delta>0 && gate && target>=gate.value){r.pending[id]=gate.id; target=Math.max(before,gate.value-1);}
  s.bond[id]=target;return target-before;
 }
 function ready(s,g){const r=ensure(s);return r.pending[g.person]===g.id && (!g.stat || s[g.stat]>=15);}
 function hint(s,id){const g=gates.find(g=>g.id===ensure(s).pending[id]);return g?.stat && s[g.stat]<15 ? `조금 더 ${{fitness:'체력',knowledge:'지식',sensitivity:'감수성'}[g.stat]}이 필요해 보인다` : '';}
 function finish(s,id){const r=ensure(s),g=gates.find(g=>g.id===id);if(!g || r.unlocked.includes(id))return;
  r.unlocked.push(id);delete r.pending[g.person];s.bond[g.person]=Math.max(s.bond[g.person],g.value);
  if((g.person==='seojin'?g.value===55:g.value===(g.person==='nari'?45:35)) && !r.rewards.includes(g.person))r.rewards.push(g.person);
 }
 function hasReward(s,id){return ensure(s).rewards.includes(id);}
 function monday(s){const r=ensure(s),week=W.weekKey(s.date);if(W.weekday(s.date)!==1||r.decayWeeks.includes(week))return;
  r.decayWeeks.push(week);s.social.distant ||= {};
  for(const id of s.met)if(s.bond[id]>=15 && s.social.lastMet[id] && W.addDays(s.social.lastMet[id],14)<s.date){change(s,id,-2);s.social.distant[id]=true;if(id==='nari')s.social.nariDistanceWeek=week;}
 }
 function migrate(s){const r=ensure(s);for(const g of gates)if(s.seen.includes(g.id)||s.bond[g.person]>=g.value){if(!r.unlocked.includes(g.id))r.unlocked.push(g.id);} /* Migration never grants rewards. */}
 root.AquaRelationships={gates,ensure,change,ready,hint,finish,hasReward,rewards,rewardLines,monday,migrate};
})(typeof window!=='undefined'?window:globalThis);
