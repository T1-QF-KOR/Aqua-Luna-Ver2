/* Christmas appointments, Nari's own answer, and the first reply of the new year. */
(function (root) {
  'use strict';
  const W = root.AquaWorld, L = root.AquaRomance, ids = Object.keys(W.people);
  const n = (text, cast = [], extra = {}) => ({ text, cast, ...extra });
  const say = (id, text, cast, extra = {}) => ({ speaker: W.people[id]?.short || id, text, cast: cast ?? (W.people[id] ? [id] : []), ...extra });
  const option = (label, action, lines = []) => ({ label, effect: { holiday: action }, lines });
  const choose = (...choice) => ({ choice });
  const personalCards = ['가사 없는 악보', '멘트 수첩', '혼잣말 원고', '떨리는 손의 피크', '시드는 꽃다발', '계단은 무대보다 높다', '관객 한 명', '명함 한 장', '선배의 생일', '녹음실의 새벽', '두 장의 종이'];
  function initial() { return { invites: {}, settled: false, conflictResolved: false, nariMemory: null, nariBonusApplied: false,
    nariMetTonight: false, nariOutcome: null, nariReplyDate: null, nariDeferredBy: null, partyPeople: [], partyKind: null }; }
  function ensure(s) { return s.holidays ||= initial(); }
  function invited(s, id) { return !!ensure(s).invites[id]; }
  function invitedGroup(s) { const lovers = L.lovers(s); return L.ensure(s).mode === 'open' && lovers.length >= 2 && lovers.every(id => ensure(s).invites[id]?.status === 'group'); }
  function nariMayTalk(s) {
    const h = ensure(s), r = L.ensure(s);
    return s.met.includes('nari') && s.bond.nari >= 45 && !['friend','lover','proposed'].includes(r.status.nari) && !r.talk && !r.trial && r.mode !== 'hidden' &&
      !['declined','missed'].includes(h.invites.nari?.status) && (!L.lovers(s).length || invitedGroup(s));
  }
  function offer(s, id) {
    if (!s.met.includes(id) || s.date < '2026-12-07' || s.date > '2026-12-23') return;
    ensure(s).invites[id] ||= { status: 'offered', date: s.date, rewarded: false };
  }
  function invitation(s, id, answer, remote = false) {
    const h = ensure(s), invite = h.invites[id];
    if (!s.met.includes(id) || !invite || s.date > '2026-12-23' || !['accept','decline','consider','group','switch'].includes(answer)) return [];
    if (answer === 'group' && L.ensure(s).mode !== 'open') return [];
    const status = { accept:'accepted', decline:'declined', consider:'considering', group:'group', switch:'accepted' }[answer];
    if (invite.status === status && answer !== 'switch') return [];
    const lines = [];
    if (answer === 'switch') for (const other of ids.filter(other => other !== id && other !== 'nari' && id !== 'nari' && ['accepted','group'].includes(h.invites[other]?.status))) {
      h.invites[other].status = 'declined'; root.AquaRelationships.change(s, other, -2);
      lines.push(say(`${W.people[other].short} · 메시지`, '알았어. 미리 말해 줘서 고마워. 다음 약속은 다시 얘기하자.', []));
    }
    if (!invite.rewarded && ['accepted','group'].includes(status)) { root.AquaRelationships.change(s, id, status === 'group' ? 3 : 5); invite.rewarded = true; }
    if (status === 'declined' && ['accepted','group'].includes(invite.status)) root.AquaRelationships.change(s, id, -2);
    invite.status = status;
    lines.push(say(remote ? `${W.people[id].short} · 메시지` : id, status === 'accepted' ? { nari:'응. 방송 끝나고 그 벤치로 갈게.', daeun:'진짜? 그날은 너한테만 연락한다ㅋㅋ', seojin:'알았어. 늦어지면 먼저 말하고.' }[id] :
      status === 'group' ? { nari:'…나도 방송 끝나고 갈게. 다들 있는 데로.', daeun:'다 같이? 좋아. 누구 오는지 미리 알려 줘. 케이크 내가 고른다ㅋㅋ', seojin:'응. 다들 직접 좋다고 하면. 그날 보자.' }[id] :
      status === 'considering' ? '알았어. 23일까지는 알려 줘. 나도 시간을 정해야 하니까.' : '응. 그럼 이번 약속은 없는 걸로 알게.', remote ? [] : [id]));
    return lines;
  }
  function buildInvite(s, id, remote = false) {
    const cast = remote ? [] : [id], speaker = remote ? `${W.people[id].short} · 메시지` : id;
    const others = ids.filter(other => other !== id && other !== 'nari' && id !== 'nari' && ['accepted','group'].includes(ensure(s).invites[other]?.status));
    const lines = [n(remote ? '앞서 나눴던 성탄 약속 대화창을 열었다.' : '헤어지기 전에 그녀가 날짜를 하나 물었다.', cast, { effect: { holiday: { action:'offer', person:id } } }),
      say(speaker, { nari:'24일 밤, 방송 끝나고 강변에 있을 거야. 그 벤치에서… 잠깐 볼래?', daeun:'24일 뭐 해? 단톡방 말고 너한테 물어보는 거야. 같이 뭐 먹을까 해서.', seojin:'24일엔 가게 일찍 닫아. 남는 시간 너랑 쓰고 싶은데, 약속 있어?' }[id], cast)];
    if (others.length) lines.push(n(`${others.map(other => W.people[other].short).join(', ')}와 같은 시간대에 한 약속이 있다.`, []));
    if (id === 'nari' && L.lovers(s).length === 1) lines.push(n('지금 사귀는 사람에게는 아직 이 밤 약속을 말하지 않았다. 낮과 밤의 시간이 다르다는 말만으로 끝낼 수는 없었다.'));
    const choices = [option(others.length ? '앞 약속을 그대로 둔 채 이날도 비워 두겠다고 말한다' : '“응. 그 시간 비워 둘게.”', { action:'invite',person:id,answer:'accept' })];
    if (others.length) choices.push(option('앞서 약속한 사람에게 연락하고 이 약속을 잡는다', { action:'invite',person:id,answer:'switch' }));
    choices.push(option('“미안. 이번에는 약속 못 하겠어.”', { action:'invite',person:id,answer:'decline' }), option('“23일까지 생각해 보고 답할게.”', { action:'invite',person:id,answer:'consider' }));
    if (L.ensure(s).mode === 'open') choices.push(option('“다 같이 보내자. 다른 사람에게도 직접 물어볼게.”', { action:'invite',person:id,answer:'group' }));
    for (const choice of choices) choice.effect.holiday.remote = remote;
    lines.push(choose(...choices));
    return { title:'12월 24일에 시간 있어?', background: remote ? 'room' : id === 'nari' ? 'rooftop' : id === 'daeun' ? 'dining' : 'cafe', lines };
  }
  function morning(s) {
    const h = ensure(s);
    if (s.date >= '2026-12-24' && !h.settled) {
      h.settled = true;
      for (const [id, invite] of Object.entries(h.invites)) if (['offered','considering'].includes(invite.status)) { root.AquaRelationships.change(s,id,-3); invite.status='missed'; }
    }
    if (s.date === '2026-12-24' && L.ensure(s).mode === 'hidden' && !L.ensure(s).clashes.includes(s.date)) L.ensure(s).clashDue ||= { date:s.date, people:L.lovers(s) };
  }
  function promiseConflict(s) {
    const h = ensure(s);
    return !h.conflictResolved && !L.ensure(s).talk && !L.ensure(s).trial && L.lovers(s).length === 1 && L.ensure(s).mode === 'single' && ['accepted','group'].includes(h.invites.nari?.status);
  }
  function buildConflict(s) {
    const partner = L.lovers(s)[0];
    return { title:'같은 날에 한 두 약속', background:'room', lines:[
      n('휴대폰에 두 대화창이 열려 있었다. 지금 사귀는 사람과, 성탄 밤 강변에서 보자고 한 나리.'),
      n('시간이 다르다는 말 뒤로 내가 말하지 않은 관계가 남았다. 오늘을 시작하기 전에 직접 연락하기로 했다.'),
      choose(
        option('지금의 교제를 이어 가고 나리에게 약속을 취소한다고 말한다', { action:'conflict',answer:'keep' }),
        option('교제를 끝낸다고 직접 말한다. 나리의 대답은 별개로 듣는다', { action:'conflict',answer:'end' }),
        option('두 사람 모두에게 괜찮다고 말하고 약속을 그대로 둔다', { action:'conflict',answer:'evade' }))
    ] };
  }
  function resolveConflict(s, answer) {
    const h = ensure(s), partner=L.lovers(s)[0];
    if (h.conflictResolved || !promiseConflict(s)) return [];
    h.conflictResolved=true;
    if (answer === 'keep') {
      h.invites.nari.status='declined'; root.AquaRelationships.change(s,'nari',-5);
      return [say('나리 · 메시지','알았어. 말해 줘서 고마워. 오늘은 기다리지 않을게.',[])];
    }
    if (answer === 'end') {
      L.endRelationship(s,partner);
      return [say(`${W.people[partner].short} · 메시지`,'알았어. 지금 대답은 알겠어. 나도 내 시간 갖고 다시 얘기할게.',[]),n('나리와 약속이 남았다는 것이 새 교제를 뜻하지는 않았다. 나는 그 대답도 따로 듣기로 했다.')];
    }
    s.flags.equivocated=true;
    if (!L.ensure(s).clashes.includes(s.date)) L.ensure(s).clashes.push(s.date);
    root.AquaRelationships.change(s,partner,-8); root.AquaRelationships.change(s,'nari',-8);
    return [n('대화창마다 괜찮다는 말을 보냈다. 오늘 누구에게 어디까지 말했는지, 나만 알고 있었다.')];
  }
  function dayPeople(s) {
    const h=ensure(s),r=L.ensure(s);
    if (s.flags.equivocated && h.conflictResolved) return [];
    if (invitedGroup(s)) return L.lovers(s);
    const accepted=['daeun','seojin'].filter(id=>s.met.includes(id)&&h.invites[id]?.status==='accepted');
    if (accepted.length) return accepted;
    return r.mode==='single' ? L.lovers(s).filter(id=>id!=='nari'&&!['declined','missed'].includes(h.invites[id]?.status)) : [];
  }
  function buildDay(s) {
    const h=ensure(s),r=L.ensure(s),people=dayPeople(s);
    if (r.mode==='hidden'&&r.clashDue) {
      const data=L.buildClash(s); data.title='성탄에 겹친 약속';
      data.time=2; data.lines[0]=n('성탄 약속을 확인하던 두 사람이 같은 교제를 서로에게 처음 알게 됐다. 나는 두 사람에게 직접 이야기할 자리를 잡았다.',r.clashDue.people);
      return data;
    }
    if (people.length>1&&!invitedGroup(s)) return {title:'같은 시간의 약속',background:'cafe',time:2,lines:[
      n('같은 시간에 두 사람을 기다리게 한 약속이었다. 단체 약속이라고 말한 적은 없었다.',people),
      choose(...people.map(id=>option(`${W.people[id].short}에게 가고 다른 약속은 직접 취소한다`,{action:'dayChoose',person:id})))
    ]};
    const lines=[];
    if (people.length>1) {
      lines.push(n('일찍 문을 닫은 카페에 각자 고른 것을 들고 모였다. 누구를 기다리는 자리인지 모두 알고 있었다.',people));
      for(const id of people)lines.push(say(id,{nari:'목요일이라 늦게 합류할 줄 알았는데. …낮에도 잠깐은 괜찮네.',daeun:'케이크 자르는 건 내가 한다. 크기 다른 건 내 실력 문제니까 오해 금지ㅋㅋ',seojin:'접시 여기. 누구 하나만 다 챙기게 두지 말고.'}[id],people));
      lines.push(choose(option('각자의 얘기를 듣고 다음 약속도 따로 묻는다',{action:'party',people,kind:'group'},[n('한 자리에 있다고 같은 시간을 보낸 건 아니었다. 나는 돌아가기 전에 한 사람씩 다음 안부를 물었다.',people)])));
    } else if (people[0]==='daeun') {
      lines.push(say('daeun','오늘은 아무도 안 불렀어. 너 하나만. 이거 나한텐 엄청 큰일이야.'),n('다은이 트리 앞에서 사진을 찍었다. 흔들린 사진까지 지우지 않고 남겨 두었다.',['daeun']),
        say('daeun',L.isLover(s,'daeun')?'네가 내 남자친구라는 거, 사진보다 말로 하는 게 더 떨린다ㅋㅋ':'오늘 너한테 먼저 물어보길 잘했다. 단톡방 말고.'));
      lines.push(choose(option('사진 한 장은 내가 먼저 찍자고 한다',{action:'party',people,kind:'daeun'},[n('이번에는 카메라를 보지 않고 서로 웃는 순간이 찍혔다. 다은이 그 사진을 먼저 저장했다.',['daeun'])])));
    } else if (people[0]==='seojin') {
      lines.push(n('카페는 일찍 문을 닫았다. 서진은 앞치마를 벗어 걸고 새 플레이리스트를 틀었다.',['seojin']),say('seojin','제목은 수심 0m. 물 밖으로 나왔다는 뜻이야.'),
        say('seojin','오늘은 내가 좋아하는 곡만 넣은 거 아니야. 네가 듣는 것도 기억했어.'));
      lines.push(choose(option('한 곡이 끝나도 바로 일어나지 않는다',{action:'party',people,kind:'seojin'},[say('seojin','마감은 끝났어. 난 한 곡 더 듣고 싶은데. 너도 더 있을래?'),n('나는 빈 컵을 급히 치우지 않았다. 일하던 테이블이 오늘은 약속한 자리가 됐다.',['seojin'])])));
    } else {
      lines.push(n('성탄 전날 오후. 민재가 옆방 문에 작은 과자 봉지를 걸어 두고 갔다.'),say('민재 · 메시지','나 없다고 라면만 먹지 마라. 이건 반찬은 아닌데 아무튼.',[]),
        n('나는 휴대폰에 남은 약속을 확인했다. 없는 약속을 만든 척하지 않고, 오늘의 오후부터 보내기로 했다.'));
      lines.push(choose(option('창문을 열고 오늘의 멜로디를 적는다',{action:'party',people:[],kind:'alone'},[n('거리에서 들리는 노래와 다른 첫 마디를 적었다. 끝까지 부를 수 있을지는 다음에 정하기로 했다.')])));
    }
    return {title:people.length>1?'함께 정한 성탄':people[0]==='daeun'?'열여덟 명 말고 한 명':people[0]==='seojin'?'물 냄새가 나는 오후':'각자의 성탄',background:people.includes('seojin')?'cafe':people.length?'river':'room',time:2,lines};
  }
  function declaration(s) {
    const choices=[option('내가 먼저 좋아한다고 말한다',{action:'nariAnswer',answer:'first'}),option('나리가 자기 말을 고를 때까지 기다린다',{action:'listenNari'}),option('나는 친구로 좋아한다고 분명히 말한다',{action:'nariAnswer',answer:'friend'})];
    if (L.ensure(s).status.daeun==='pending'&&L.ensure(s).status.seojin==='pending'&&s.bond.nari>=60) choices.push(option('“나도… 아직 대답 못 해.”',{action:'nariAnswer',answer:'defer'}));
    return choose(...choices);
  }
  function meetNari(s) {
    const h=ensure(s); if(h.nariMetTonight||!nariMayTalk(s))return[];h.nariMetTonight=true;
    const others=invitedGroup(s)?L.lovers(s):[],cast=[...others,'nari'];
    const lines=[n('약속한 벤치에 도착하자 나리가 걸어왔다. 손에 원고도 피크도 없었다.',cast,{background:'night'}),
      n('나리는 코트 자락을 모아 벤치에 앉았다. 목도리 위로 올라온 작은 숨을 고르며 나를 봤다.',['nari'],{title:'대본을 접은 밤',illustration:'nariChristmas',effect:{flag:'sawNariChristmas'}}),say('nari','…들었어?',cast),
      say('nari','오늘은 외운 말 말고, 내 말을 해 보려고. 무대보다 떨린다.',cast)];
    if(others.length)lines.push(n('함께 있던 사람들에게도 지금 나누려는 마음을 설명했다. 아직 새 관계를 정한 것은 아니었다.',cast));
    const cards=personalCards.filter(card=>s.cards.includes(card)).slice(0,3);
    if(cards.length&&!h.nariMemory)lines.push(choose(...cards.map(card=>option(`「${card}」의 기억을 꺼낸다`,{action:'recall',card})),option('지금의 말부터 고른다',{action:'declare'})));
    else lines.push(declaration(s));
    return lines;
  }
  function bonuses(s) {
    const h=ensure(s);if(h.nariBonusApplied)return;h.nariBonusApplied=true;
    const gain=((s.flags.keptAnonymousWords||0)>=2&&!s.flags.questionedRadio?2:0)+(s.flags.frontRowKept?2:0);
    if(gain)root.AquaRelationships.change(s,'nari',gain);
  }
  function nariRating(s) {
    const r=L.ensure(s);
    const rivals=['daeun','seojin'].some(id=>s.met.includes(id)&&s.bond[id]>=55&&!['friend','pending'].includes(r.status[id])&&!(r.mode==='open'&&L.isLover(s,id)&&invitedGroup(s)));
    if(rivals)return 'withdrawn';
    if(s.bond.nari>=70&&['knowledge','fitness','sensitivity'].every(stat=>s[stat]>=35)&&(s.radio.anonymous>=20||s.bond.nari>=80))return 'accepted';
    return s.bond.nari>=55?'pending':'friend';
  }
  function identityLines(s,shared) {
    const lines=[];
    if(L.lovers(s).length>1||L.ensure(s).talk)lines.push(n('잠깐 떨어진 곳에서 나리가 목소리를 낮췄다. 다른 사람에게는 들리지 않는 거리였다.',['nari']));
    if(!s.flags.knowsLuna)lines.push(say('nari','하나만 먼저 말할게. …아까 그 방송, 나야. 계속 나였어.'));
    else if(s.flags.boothPeeked || s.flags.questionedRadio) lines.push(say('nari','그때 일, 나도 기억해. 그래도 오늘은 내가 말할게. 루나는 나야.'));
    else lines.push(say('nari','너도 알고 있지. …루나는 나야. 오늘은 내가 직접 말하고 싶었어.'));
    s.flags.knowsLuna=true;if(shared)s.flags.nariIdentityShared=true;
    return lines;
  }
  function nariAnswer(s,answer) {
    const h=ensure(s);if(h.nariOutcome||!h.nariMetTonight||L.ensure(s).status.nari!=='unresolved')return[];
    if(answer==='friend'){L.answer(s,'nari','friend');h.nariOutcome='player-friend';return[say('nari','…알았어. 그래도 오늘은 내 말로 하려고 나왔어. 들어 줘서 고마워.'),n('나는 대답을 다른 말로 흐리지 않았다. 우리는 각자 돌아갈 길을 골랐다.',['nari'])];}
    if(answer==='defer'){
      if(L.ensure(s).status.daeun!=='pending'||L.ensure(s).status.seojin!=='pending'||s.bond.nari<60)return[];
      L.answer(s,'nari','pending');h.nariOutcome='player-pending';h.nariReplyDate='2027-02-14';h.nariDeferredBy='player';
      return[say('nari','…그럼 나도 기다릴게. 대신 그때는 네 말로 해 줘. 남의 말 말고.')];
    }
    bonuses(s);if(answer==='first')s.flags.firstSaidLove=true;
    const result=nariRating(s);h.nariOutcome=result;
    const lines=answer==='first'?[say('나','좋아해. 무대 위의 너도, 계단의 너도. 오늘 내 앞에 있는 너도.',['nari'])]:[];
    if(result==='accepted'){
      const together=L.lovers(s).length>0;L.answer(s,'nari',together?'disclose':'accept');if(together)h.nariOutcome='proposed';
      lines.push(...identityLines(s,true),say('nari',(answer==='answer'?'…다행이다. ':'나도 좋아해. ')+(together?'새해에 다 같이 다시 얘기하자. 모두의 대답도 듣고 싶어.':'이제 떨려도 되지? 무대 아니니까.')),n(together?'나리는 약속한 날짜를 직접 확인했다. 마음에 대답한 것과 모두의 관계가 정해지는 것은 별개였다.':'나리가 내 손을 잡았다. 조금 떨렸지만 이번에는 숨기지 않았다.',['nari']));
    }else if(result==='pending'){
      L.answer(s,'nari','pending');L.ensure(s).delayedUntil.nari=s.date;h.nariReplyDate='2027-01-01';h.nariDeferredBy='nari';
      lines.push(say('nari','일주일만. 새해 첫날까지만 기다려 줄래? 너무 많은 걸 고르고 있어서, 이것까지 대충 정하고 싶지 않아.'));
    }else{
      L.answer(s,'nari','friend');lines.push(say('nari',result==='withdrawn'?'너한테 아직 대답을 듣지 못한 사람이 있는 것 같아. 나는 그 마음을 없는 셈 치고 시작하고 싶지 않아.':'고마워. 근데 지금은 누구 손을 잡을 수 있는 사람이 아닌 것 같아. 내 말부터 조금 더 골라야겠어.'),n('무대에서 보던 웃음은 아니었다. 그래서 나는 그 대답을 그대로 듣기로 했다.',['nari']));
    }
    return lines;
  }
  function broadcastContext(s){return{personal:nariMayTalk(s),summer:s.seen.includes('nariSummer'),first:s.seen.includes('nariClass')?'class':s.seen.includes('nariRoof')?'roof':s.seen.includes('nariRiver')?'river':'other',melody:!!s.flags.nariHeardMelody};}
  function broadcast(s,episode,replay) {
    const context=s.radio.aired[episode.id]?.christmas||broadcastContext(s);
    const lunar=text=>({speaker:'루나',text,onAir:true,cast:[]}),personal=context.personal,lines=[n(replay?'보관해 둔 성탄 방송을 다시 틀었다.':'목요일 밤 열한 시. 성탄 특집 알림이 켜졌다.'),lunar('안녕하세요, 아쿠아 루나의 루나예요. 메리 크리스마스. 오늘 하루, 잘 끝내고 계신가요.')];
    if(personal){
      lines.push(lunar('원래는 대본이 있었는데요. 방금 접어 뒀어요. 오늘 할 말은 제 말로 하고 싶어서요.'));
      if(context.summer)lines.push(lunar('올해 처음으로 무대 아닌 데서 노래했어요. 관객이 한 명이었는데, 그게 제일 떨렸어요.'));
      if(context.first==='class')lines.push(lunar('처음엔 가사 없는 악보를 봤어요. 빈칸을 급히 채우지 않는 사람이 있더라고요.'));
      else if(context.first==='roof')lines.push(lunar('외운 말을 연습하다가 누군가에게 들킨 적이 있어요. 그날은 말을 틀려도 괜찮았어요.'));
      else if(context.first==='river')lines.push(lunar('강변에서 혼잣말을 연습한 적이 있어요. 들은 걸 함부로 다른 데 꺼내지 않는 사람이 있었고요.'));
      else lines.push(lunar('올해는 내려온 무대 옆에서도 인사를 나눴어요. 짧게 말해도 끝까지 들어 주는 사람이 있었어요.'));
      lines.push(lunar('오늘은 클로징 대신 제가 고른 노래를 조금 부를게요. 잘 부르는 노래 말고, 부르고 싶은 노래로요.'));
      lines.push(n(context.melody?'내가 들려줬던 멜로디였다. 질문처럼 남겨 두었던 끝에 처음 듣는 가사가 붙었다.':'기타와 목소리만 남았다. 누가 시켜서 고른 것 같지 않은, 작고 또렷한 노래였다.'));
    }else lines.push(lunar('오늘 누군가를 기다리는 분, 누군가의 옆에 있는 분, 혼자 듣는 분. 모두 메리 크리스마스.'),lunar('특별한 날이라고 하루가 전부 특별할 필요는 없겠죠.'),lunar('따뜻한 물을 마신 일, 안부를 한 번 물은 일도 오늘의 기억에 남았으면 좋겠어요.'),lunar('얼굴을 모르는 분들과 같은 시간을 보내는 게, 올해는 제게 제일 특별했어요.'));
    lines.push(lunar('오늘은 그냥 끝내요. 메리 크리스마스.'));return{title:'아쿠아 루나 · 성탄 특집',background:'room',radioEpisode:episode.id,replay,lines};
  }
  function buildNight(s) {
    const data=root.AquaRadio.build(s,W.episodeOn('2026-12-24'));
    if(nariMayTalk(s)&&L.ensure(s).status.nari==='unresolved'){
      const promised=['accepted','group'].includes(ensure(s).invites.nari?.status);
      data.lines.push(n(promised?'방송이 끝났다. 나리와 약속한 벤치가 떠올랐다.':'나리에게 메시지가 왔다. 「아직 안 자? 강변에 잠깐 나올래?」'),choose(
        option(promised?'약속한 벤치로 간다':'잠깐 만나자고 답하고 강변으로 간다',{action:'meetNari'}),
        option('오늘은 못 간다고 바로 연락한다',{action:'cancelNight'})));
    }else if(['accepted','group'].includes(ensure(s).invites.nari?.status))data.lines.push(n('약속한 밤이 되었지만, 나는 아직 앞선 관계를 정리하지 못했다.'),choose(option('나리에게 지금이라도 못 간다고 직접 연락한다',{action:'cancelNight'})));
    return data;
  }
  function newYearAnswer(s) {
    const h=ensure(s);if(h.nariOutcome!=='pending'||h.nariDeferredBy!=='nari'||L.ensure(s).status.nari!=='pending')return[];
    const yes=nariMayTalk(s)&&s.bond.nari>=70&&['knowledge','fitness','sensitivity'].every(stat=>s[stat]>=35);
    if(yes){const together=L.lovers(s).length>0;L.resolvePending(s,'nari',together?'disclose':'accept');h.nariOutcome=together?'proposed':'accepted';
      return[...identityLines(s,true),say('nari','일주일 동안 생각했어. 계약 말고, 너에 대해서. 복잡한 건 그거대로 남았지만… 좋아해.'),n('나리는 목도리를 고쳐 감았다. 고른 다음에도 할 이야기가 남아 있었다.',['nari'])];}
    L.resolvePending(s,'nari','friend');h.nariOutcome='friend';return[say('nari','미안. 지금은 안 될 것 같아. 내 마음을 내 말로 하는 것도 아직 어려워. 그래도 기다리게 한 대답은 오늘 해야 할 것 같았어.'),n('나는 알겠다고 말했다. 새해의 첫 대답도, 내가 듣고 싶었던 대답만으로 채워지지는 않았다.',['nari'])];
  }
  function apply(s,e) {
    const h=ensure(s);
    if(e.action==='offer'){offer(s,e.person);return[];}
    if(e.action==='invite')return invitation(s,e.person,e.answer,!!e.remote);
    if(e.action==='conflict')return resolveConflict(s,e.answer);
    if(e.action==='meetNari')return meetNari(s);
    if(e.action==='declare')return[declaration(s)];
    if(e.action==='recall'){
      if(!h.nariMetTonight||!personalCards.includes(e.card)||!s.cards.includes(e.card))return[];
      if(!h.nariMemory&&personalCards.includes(e.card)&&s.cards.includes(e.card)){h.nariMemory=e.card;root.AquaRelationships.change(s,'nari',3);}
      const memories={
        '가사 없는 악보':'그 빈칸을 바로 채우려고 하지 않았잖아. 나도 그날을 기억해.',
        '멘트 수첩':'그때는 적어 둔 말이 없으면 아무 말도 못 할 줄 알았어. 오늘은 수첩 안 가져왔어.',
        '관객 한 명':'관객이 한 명이면 덜 떨릴 줄 알았는데. 너 하나 있는 게 더 떨렸어.',
        '명함 한 장':'종이 한 장인데, 그 뒤에 있는 날들이 다 달라질 것 같았어. 그때 네 말도 기억해.',
        '두 장의 종이':'내가 고른 말이 들어간 종이였잖아. 오늘도 그렇게 말해 보려고.'
      };
      return[say('나',`나는 「${e.card}」 때의 이야기를 꺼냈다.`,['nari']),say('nari',memories[e.card]||'기억하고 있었네. 나는 그때 네가 어디 있었는지 기억해.'),declaration(s)];
    }
    if(e.action==='listenNari')return[say('nari','나 오늘은 대본 없이 말했어. 너한테. …좋아해. 그 말 하려고 나왔어.'),choose(option('“나도 좋아해.”',{action:'nariAnswer',answer:'answer'}),option('“고마워. 나는 친구로 좋아해.”',{action:'nariAnswer',answer:'friend'}),...(L.ensure(s).status.daeun==='pending'&&L.ensure(s).status.seojin==='pending'&&s.bond.nari>=60?[option('“나도 아직 대답 못 해.”',{action:'nariAnswer',answer:'defer'})]:[]))];
    if(e.action==='nariAnswer')return nariAnswer(s,e.answer);
    if(e.action==='cancelNight'){if(['accepted','group'].includes(h.invites.nari?.status))root.AquaRelationships.change(s,'nari',-3);h.nariOutcome='missed';return[say('나리 · 메시지','응. 알려 줘서 고마워. 잘 자.',[])];}
    if(e.action==='party'){h.partyPeople=e.people;h.partyKind=e.kind;for(const id of e.people)L.touch(s,id);return[];}
    if(e.action==='dayChoose'){
      for(const id of ['daeun','seojin'])if(id!==e.person&&h.invites[id]?.status==='accepted'){h.invites[id].status='declined';root.AquaRelationships.change(s,id,-3);}
      h.partyPeople=[e.person];h.partyKind=e.person;L.touch(s,e.person);return[say(e.person,'다른 약속에 먼저 말하고 와. 기다릴게.'),n('나는 취소할 약속에도 직접 연락했다. 누구와 가는지는 나중에 들키도록 남겨 두지 않았다.')];
    }
    if(e.action==='newYearAnswer')return newYearAnswer(s);
    return[];
  }
  const scenes={
    holidayInviteNari:{title:'밤에 남긴 포스트잇',background:'rooftop',lines:[n('악보를 정리하던 나리가 내 쪽으로 돌아섰다.')]},
    holidayInviteDaeun:{title:'단톡방 말고 너한테',background:'dining',lines:[n('다은이 식판을 반납하고 내 걸음을 기다렸다.')]},
    holidayInviteSeojin:{title:'일찍 닫는 날',background:'cafe',lines:[n('서진이 마감 안내판에 휴일 시간을 적었다.')]},
    newYearMorning:{title:'달력의 첫 칸',background:'room',time:0,lines:[n('새 달력의 첫 칸. 엄마에게서 짧은 새해 인사가 왔다.'),say('엄마 · 메시지','밥 묵고. 새해에도 건강해라.',[]),n('나는 괜찮다는 말 뒤에 오늘 할 일을 한 가지 더 적어 보냈다.'),choose(option('답장을 보내고 창문을 연다',{action:'newYearMorning'}))]},
    nariNewYear:{title:'새해의 대답',background:'river',time:1,lines:[n('새해의 강변. 나리가 먼저 와 있었다. 목도리를 반만 감고 내 쪽을 봤다.',['nari']),say('nari','새해 복 많이 받아. …이거 하려고 부른 건 아닌 거 알지.'),choose(option('일주일 동안 고른 말을 듣는다',{action:'newYearAnswer'}))]}
  };
  Object.assign(root.AQUA_SCENES,scenes);
  const inviteIds={holidayInviteNari:'nari',holidayInviteDaeun:'daeun',holidayInviteSeojin:'seojin'};
  const rules=Object.entries(inviteIds).map(([id,person])=>({id,place:person==='nari'?'roof':person==='daeun'?'dining':'cafe',from:'2026-12-07',to:'2026-12-23',priority:2,work:person==='seojin',notHolidayInvite:person,bond:{[person]:person==='nari'?45:35},any:[{romance:{[person]:'unresolved'}},{romance:{[person]:'pending'}},{lover:person}]}));
  root.AquaStory.rules.push(...rules);for(const rule of rules)W.routeOwners[rule.id]=[inviteIds[rule.id]];
  function decorate(id,s,data){if(inviteIds[id])Object.assign(data,buildInvite(s,inviteIds[id]));}
  function mandatory(s,slot){const h=ensure(s);
    if(s.date==='2026-12-24'){
      if(slot===1&&promiseConflict(s))return'holidayPromiseConflict';
      if(slot===2&&!s.seen.includes('holidayXmasDay'))return'holidayXmasDay';
      if(slot===3&&!s.seen.includes('holidayXmasNight'))return'holidayXmasNight';
    }
    if(s.date==='2027-01-01'&&slot===0&&!s.seen.includes('newYearMorning'))return'newYearMorning';
    if(s.date>='2027-01-01'&&slot===1&&h.nariOutcome==='pending'&&h.nariDeferredBy==='nari'&&L.ensure(s).status.nari==='pending'&&!s.seen.includes('nariNewYear'))return'nariNewYear';
    return null;
  }
  function valid(s,h){const object=x=>x&&typeof x==='object'&&!Array.isArray(x),date=d=>W.validDate(d)&&d>='2026-03-02'&&d<='2027-02-26';
    return Array.isArray(s.cards)&&object(h)&&object(h.invites)&&Object.entries(h.invites).every(([id,i])=>s.met.includes(id)&&object(i)&&['offered','accepted','declined','considering','group','missed'].includes(i.status)&&date(i.date)&&i.date<=s.date&&typeof i.rewarded==='boolean')&&
      ['settled','conflictResolved','nariBonusApplied','nariMetTonight'].every(key=>typeof h[key]==='boolean')&&(h.nariMemory===null||personalCards.includes(h.nariMemory)&&s.cards.includes(h.nariMemory))&&
      (h.nariOutcome===null||['accepted','proposed','pending','player-pending','player-friend','friend','withdrawn','missed'].includes(h.nariOutcome))&&(h.nariReplyDate===null||date(h.nariReplyDate))&&
      [null,'nari','player'].includes(h.nariDeferredBy)&&Array.isArray(h.partyPeople)&&new Set(h.partyPeople).size===h.partyPeople.length&&h.partyPeople.every(id=>s.met.includes(id))&&[null,'group','daeun','seojin','alone'].includes(h.partyKind);
  }
  root.AquaHolidays={initial,ensure,personalCards,invited,invitedGroup,nariMayTalk,buildInvite,morning,promiseConflict,buildConflict,buildDay,buildNight,nariRating,newYearAnswer,apply,scenes,rules,decorate,mandatory,valid,broadcast,broadcastContext};
})(typeof window!=='undefined'?window:globalThis);
