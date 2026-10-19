(() => {
  const E=LunaEngine,N=LunaStory,D=LunaData,results=[];
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  const test=(name,fn)=>{try{fn();results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.message);}};
  const take=r=>{assert(!r.error,r.error);assert(E.validate(r.state),'invalid resulting save');return r.state;};
  const nextDays=(s,n)=>{for(let i=0;i<n;i++)s=take(E.act(s,'nextDay'));return s;};
  test('Gifts cost money once a day, reveal the hidden taste and never mutate the prior state',()=>{
    const before=E.makeState(),g=D.gifts.find(x=>x.taste==='loved'),s=take(E.giveGift(before,g.id));
    assert(s.money===before.money-g.cost&&s.totalSpent===g.cost,'cost');assert(s.affection===2&&s.growth.mood===60,'loved effect');
    assert(s.story.tastes[g.id]==='loved'&&s.story.giftDay===1&&s.story.lastMet===1,'recorded');assert(!before.story.tastes&&before.money===D.startingMoney,'mutation');
    assert(E.giveGift(s,D.gifts[1].id).error,'second gift same day');assert(s.journal.at(-1).type==='gift','journal');
    const t=take(E.giveGift(nextDays(s,1),D.gifts[1].id));assert(Object.keys(t.story.tastes).length===2,'next day gift');
  });
  test('Disliked gifts lower only mood; gifts need money and no active scene',()=>{
    const s=take(E.giveGift(E.makeState(),D.gifts.find(x=>x.taste==='disliked').id));assert(s.affection===0&&s.growth.mood===45,'disliked');
    const poor={...E.makeState(),money:0};assert(E.giveGift(poor,D.gifts[0].id).error.includes('부족'),'money');
    const busy=take(E.startStory(E.makeState(),'hello'));assert(E.giveGift(busy,D.gifts[0].id).error,'active scene');
  });
  test('Missing her lowers mood gently with a floor of 30; meeting again restores it',()=>{
    let s=take(E.giveGift(E.makeState(),D.gifts.find(x=>x.taste==='neutral').id));assert(s.growth.mood===52,'start');
    s=nextDays(s,2);assert(s.growth.mood===52,'no decay before three days');
    s=nextDays(s,1);assert(s.growth.mood===47,'decay on day three');s=nextDays(s,10);assert(s.growth.mood===30&&s.affection===0,'floor, affection untouched');
    const r=E.giveGift(s,D.gifts.find(x=>x.taste==='liked').id);assert(r.result.reunion&&take(r).growth.mood===43,'reunion restores mood');
  });
  test('Saves keep tastes and meeting days; fabricated tastes and future days are rejected',()=>{
    const s=take(E.giveGift(E.makeState(),D.gifts[0].id)),round=E.validate(JSON.parse(JSON.stringify(s)));assert(round.story.tastes[D.gifts[0].id]==='loved','round trip');
    assert(!E.validate({...s,story:{...s.story,tastes:{[D.gifts[0].id]:'disliked'}}}),'wrong taste');assert(!E.validate({...s,story:{...s.story,tastes:{unknown:'loved'}}}),'unknown gift');
    assert(!E.validate({...s,story:{...s.story,lastMet:5}}),'future meeting');assert(E.validate(E.makeState()),'fresh save without new fields');
  });
  test('Bond level, mood labels and status lines cover every place and time',()=>{
    assert(N.bondLevel({affection:0,trust:0})===1&&N.bondLevel({affection:30,trust:30})===4&&N.bondLevel({affection:100,trust:100})===10,'levels');
    assert(['기분 아주 좋음','기분 좋음','평온함','조금 지침','쓸쓸함'].every((l,i)=>N.moodLabel([90,70,50,30,10][i])===l),'labels');
    assert(Object.keys(D.locations).every(p=>D.times.every(t=>N.doing[p]?.[t.id])),'status for each place and time');
    assert(D.gifts.every(g=>N.giftLines[g.taste]&&N.giftLines[g.taste][0].length===2),'gift lines polite and casual');
  });
  test('Talk plans pick two wanted topics and one to avoid; hits raise the atmosphere and score',()=>{
    const s=E.makeState(),p=E.talkPlan(s);assert(p.hot.length===2&&p.hot[0]!==p.hot[1]&&!p.hot.includes(p.cold)&&p.tension===1,'plan');
    const other=E.talkTopics.find(t=>!p.hot.includes(t)&&t!==p.cold),r=E.talkScore(p,[p.hot[0],p.hot[1],other]);
    assert(r.steps[0].kind==='hit'&&r.steps[0].gain===35&&r.steps[1].gain===40&&r.steps[2].kind==='neutral'&&r.score===93&&r.tension===2,'scoring');
    const low=E.talkScore(p,[p.cold,other,E.talkTopics.find(t=>![...p.hot,p.cold,other].includes(t))]);assert(low.score<60&&low.steps[0].kind==='miss'&&low.steps[0].tension===0,'miss lowers atmosphere');
    const sad={...s,growth:{...s.growth,mood:20}};assert(E.talkPlan(sad).tension===0,'low mood starts awkward');
  });
  test('Finishing a talk rewards once a day; the closer needs a ripe conversation',()=>{
    const s=E.makeState(),p=E.talkPlan(s),other=E.talkTopics.find(t=>!p.hot.includes(t)&&t!==p.cold),picks=[p.hot[0],p.hot[1],other];
    const t=take(E.finishTalk(s,picks,true));assert(t.affection===1&&t.trust===1&&t.growth.mood===56&&t.story.talkDay===1&&t.story.lastMet===1,'rewards');
    assert(t.story.talks[0].score===93&&t.journal.at(-1).type==='talk','record');assert(E.finishTalk(t,picks).error,'once a day');
    const rest=E.talkTopics.filter(x=>!p.hot.includes(x)).slice(0,3);assert(E.finishTalk(s,rest,true).error,'closer locked');
    assert(E.finishTalk(s,[p.hot[0],p.hot[0],other]).error&&E.finishTalk(s,['music','class']).error,'invalid picks');
    assert(!E.validate({...t,story:{...t.story,talks:[{day:1,picks:['music','music','food'],score:50}]}}),'fabricated talk rejected');
  });
  test('Growth opens a stat choice in every date; it stays locked until the stat is high enough',()=>{
    const C=LunaCourses;assert(D.dates.every(d=>N.script('date',d.id).some(n=>n.choices.some(c=>c.requireStat&&E.statNames[c.requireStat]&&c.requireValue>=10))),'every date has a stat choice');
    let s=take(E.act(E.makeState(),'date','walk'));s=take(E.chooseStory(s,'quiet',0));
    const steady=N.script('date','walk')[1].choices.find(c=>c.id==='steady');assert(E.choiceReason(s,steady)==='체력 10 필요'&&E.chooseStory(s,'steady',1).error,'locked');
    const strong={...s,growth:{...s.growth,stats:{...s.growth.stats,fitness:10}}},moodBefore=strong.growth.mood;
    let t=take(E.chooseStory(strong,'steady',1));assert(t.growth.mood===moodBefore+5,'mood now');t=take(E.chooseStory(t,'open',2));
    const plain=take(E.chooseStory(take(E.chooseStory(s,'listen',1)),'open',2));assert(t.affection-plain.affection===2&&t.trust-plain.trust===1,'stat choice rewards');
    assert(C.themes.every(th=>C.insight[th.id]&&E.statNames[C.insight[th.id].stat])&&C.insightNeed(0)===10&&C.insightNeed(7)===70,'theme stats and thresholds');
  });
  test('School calendar: DAY 1 is Monday 2 March 2026; terms, events and her birthday line up',()=>{
    const c1=D.calendar(1);assert(c1.month===3&&c1.date===2&&c1.weekday==='월'&&c1.term===1&&c1.week===1&&c1.event.id==='start','day one');
    assert(D.dayOf(2026,4,17)===47&&D.calendar(47).birthday&&D.calendar(412).birthday,'birthday every year');
    assert(D.calendar(50).event.id==='exam'&&D.calendar(80).event.id==='festival'&&D.calendar(113).term===0&&D.calendar(184).term===2,'events and terms');
    assert(D.calendar(365).term===0&&D.calendar(366).week===1,'next spring');
  });
  test('Birthday gifts land warmer and are remembered by year',()=>{
    let s={...E.makeState(),day:47};const r=E.giveGift(s,D.gifts.find(g=>g.taste==='disliked').id);assert(r.result.birthday&&r.result.affection===1&&r.result.mood===15,'warm even when disliked');
    s=take(r);assert(s.story.birthdays[0]===2026,'year recorded');const loved=take(E.giveGift({...E.makeState(),day:47},D.gifts.find(g=>g.taste==='loved').id));assert(loved.affection===5,'loved birthday');
  });
  test('Messages archive by day: Sulien, 하윤 and notices; repeats are avoided and saves stay valid',()=>{
    let s=take(E.startStory(E.makeState(),'hello'));while(s.story.active){const a=s.story.active;s=take(E.chooseStory(s,N.script(a.kind,a.id)[a.choices.length].choices[0].id,a.choices.length));}
    s=take(E.act(s,'date','walk'));while(s.story.active){const a=s.story.active;s=take(E.chooseStory(s,N.script(a.kind,a.id)[a.choices.length].choices[0].id,a.choices.length));}
    s=nextDays(s,1);assert(s.story.message.key==='walk','morning message');s=nextDays(s,12);
    const log=s.story.msgLog;assert(log.some(m=>m.from==='sulien'&&m.key==='walk')&&log.some(m=>m.from==='friend')&&log.some(m=>m.from==='notice'),'three kinds');
    assert(log.every(m=>m.from==='sulien'||N.logText(m)),'text for each');const taste=log.filter(m=>m.key==='taste').map(m=>m.arg);assert(new Set(taste).size===taste.length,'no repeated taste tip');
    assert(!N.logText(log.find(m=>m.key==='hint')||{from:'friend',key:'mood'}).includes('보세요'),'friend speaks casually');
    const seen=take(E.markMessagesSeen(s));assert(seen.story.seen===log.length,'seen');assert(!E.validate({...s,story:{...s.story,msgLog:[{day:1,from:'friend',key:'unknown'}]}}),'fabricated message');
  });
  test('Closeness grows slower as it deepens, carries fractions and stays saveable',()=>{
    const g=D.gifts.find(x=>x.taste==='loved');
    const low=take(E.giveGift(E.makeState(),g.id)),high=take(E.giveGift({...E.makeState(),affection:85},g.id));
    assert(low.affection===2,'full gain while new');assert(high.affection===85&&high.story.carry.affection===20,'deep closeness carries a fraction');
    let s={...E.makeState(),affection:85};for(let i=0;i<5;i++){s=take(E.giveGift(s,g.id));s=nextDays(s,1);}assert(s.affection===86&&s.story.carry.affection===0,'fractions add up');
    assert(!E.validate({...s,story:{...s.story,carry:{affection:150}}})&&!E.validate({...s,story:{...s.story,carry:{luck:1}}}),'carry validation');
    assert(E.trainGain(0)===4&&E.trainGain(50)===3&&E.trainGain(70)===2&&E.trainGain(90)===1,'training tapers');
  });
  test('Main chapters wait a few days after the previous one',()=>{
    let s=E.makeState();s.story.completed.push({id:'hello',choices:['listen'],day:1});s.story.completed.push({id:'invite',choices:['yes'],day:1});s.story.dateCount=3;s.trust=15;
    assert(!N.available(s).some(e=>e.id==='score'),'too soon');s=nextDays(take({state:s}),N.storyGap);assert(N.available(s).some(e=>e.id==='score'),'opens after the gap');
    assert(N.events.find(e=>e.id==='score').hint.includes('며칠'),'hint mentions the wait');
  });
  test('Course messages remember the theme of the outing',()=>{
    const item=D.dates.find(d=>d.theme==='night');let s=E.makeState();s.day=2;s.memories.push({day:2,date:item.id,outfit:'casual',legwear:'none',neckAccessory:'none',time:'evening',choices:N.script('date',item.id).map(n=>n.choices[0].id),keptPromise:false});
    const m=N.pickMessage(s,{...s,day:4});assert(m.key==='course-night'&&m.place===item.name,'themed message');
    assert(N.pickMessage(s,{...s,day:3}).key==='course','generic variant still appears');
    assert(Object.keys(N.messages).filter(k=>k.startsWith('course-')).length===6&&N.messages['course-night'].replies.every(r=>r.say.length===2&&r.back.length===2),'six themes with both speech forms');
  });
  const passed=results.filter(r=>r.startsWith('PASS')).length;
  document.getElementById('results').textContent=results.join('\n')+`\n${passed}/${results.length} passed`;
})();
