/* A finished route is determined only by decisions and events actually recorded. */
(function (root) {
  'use strict';
  const L = root.AquaRomance, W = root.AquaWorld;
  const n = (text, cast = []) => ({ text, cast });
  const say = (id, text) => ({ speaker: W.people[id].short, text, cast: [id] });
  const nariCards = ['가사 없는 악보','멘트 수첩','혼잣말 원고','떨리는 손의 피크','시드는 꽃다발','계단은 무대보다 높다','관객 한 명','명함 한 장','녹음실의 새벽','두 장의 종이','답장하기 전의 질문','두 번째 질문의 답'];
  const hints = [
    ['nariVoice','여름 강변에서 누군가 혼잣말로 멜로디를 불렀다.'],
    ['nariRecord','11월의 이른 아침, 악보를 든 사람이 버스를 기다렸다.'],
    ['nariFebruary','겨울 연습실에는 아직 답을 기다리는 질문이 있었다.'],
    ['daeunFight','어느 날 밤 단체 대화방을 나간 사람이 있었다.'],
    ['seojinPool','강변의 주차선 아래에는 오래된 수영장의 기억이 있었다.'],
    ['winterShowcase','겨울 공연장에는 끝나지 않은 곡을 위한 자리가 있었다.']
  ];
  function select(s) {
    const r=L.ensure(s), lovers=L.lovers(s), flags=s.flags, cards=s.cards;
    if(r.clashes.length>=2 || flags.equivocated) return 'empty';
    if(r.talk || r.trial || r.mode==='hidden') return 'unresolved';
    if(r.mode==='open' && lovers.length>=2) {
      if(lovers.length===3 && lovers.every(id=>s.bond[id]>=70) && !r.clashes.length && flags.valentineTogether) return 'full';
      if(lovers.length===2 && lovers.every(id=>s.bond[id]>=70) && !r.clashes.length) return 'pair';
      return 'together';
    }
    if(flags.valentineFair && !lovers.length && ['nari','daeun','seojin'].every(id=>r.status[id]==='pending')) return 'fair';
    if(lovers.includes('daeun')) return 'daeun-love';
    if(lovers.includes('seojin')) return 'seojin-love';
    if(lovers.includes('nari')) return (flags.nariSelfChoice||0)>=3 && flags.nariIdentityShared && nariCards.filter(card=>cards.includes(card)).length>=4 ? 'nari-true' : 'nari-love';
    if(r.status.nari==='friend' && s.bond.nari>=40) return 'nari-friend';
    if(s.radio.anonymous>=20 && !flags.nariIdentityShared) return 'reflection';
    const friends=['daeun','seojin'].filter(id=>r.status[id]==='friend' && s.bond[id]>=40).sort((a,b)=>s.bond[b]-s.bond[a]);
    if(friends.length) return `${friends[0]}-friend`;
    if(s.bond.nari<25 && s.radio.anonymous<10) return 'far';
    return 'solo';
  }
  function build(s, id=select(s)) {
    const f=s.flags, lovers=L.lovers(s), lines=[];
    const add=(...items)=>lines.push(...items);
    const identity = !!f.nariIdentityShared;
    const titles={empty:'빈 객석',unresolved:'아직 정하지 않은 말',full:'만석',pair:'두 자리',together:'함께 남겨 둔 자리',fair:'공정위원회',
      'daeun-love':'너의 1순위','seojin-love':'물 냄새가 나는 봄','nari-true':'진짜 달','nari-love':'다른 강, 같은 달',
      'nari-friend':'친구의 목소리',reflection:'물에 비친 달','daeun-friend':'단톡방 맨 위','seojin-friend':'마감 뒤의 커피',far:'닿지 않은 거리',solo:'혼자 걷는 강변'};
    if(!titles[id]) throw new Error(`Unknown ending: ${id}`);
    let background='river';
    // Recall only moments the player actually experienced, never a promised seat
    // or a shared song inferred from affection alone.
    function nariMemory() {
      if (f.originalLyrics && f.autumnFestivalSeen) return [
        n('나리가 악보 맨 위를 손끝으로 눌렀다. 「계단은 무대보다 높다.」 지우지 않은 첫 줄이었다.', ['nari']),
        say('nari','그날은 무서워서 너한테 괜히 화도 냈잖아. 근데 끝까지 들어 줬지. 아직도 기억나.')
      ];
      if (f.frontRowKept) return [
        say('nari','가을에 맨 앞줄에 있었잖아. 조명 때문에 잘 안 보일 줄 알았는데, 네 얼굴은 보이더라.'),
        n('나리가 손가락으로 벤치에 작은 박자를 두드렸다. 그날 객석에서 올려다보던 박자였다.', ['nari'])
      ];
      if (f.nariSummerEncore) return [
        say('nari','여름에 한 번만 더 불러 달랬지? 그때 너 혼자 듣고 있었는데, 이상하게 만석 같았어.'),
        n('나리는 멋쩍은지 목을 가다듬었다. 그날 한 번 더 들려준 마지막 음이 떠올랐다.', ['nari'])
      ];
      return [say('nari','다음에 내 노래 들으면 잘 불렀다는 말 말고, 어떤 장면이 떠올랐는지도 말해 줘.')];
    }
    add(n('2월 26일 아침. 한여울대학교의 다음 학기 등록 마감일이 밝았다.'));
    if(id==='nari-true') {
      add(n('강변 벤치에 나리가 먼저 와 있었다. 손에 든 목도리 끝이 바람에 흔들렸다.',['nari']),
        say('nari',s.radio.listened.includes('radio-2027-02-25') ? '어젯밤 방송, 끝까지 들어 줘서 고마워. 오늘은 내가 고른 얘기를 하려고.' : '오늘은 내가 고른 얘기를 하려고. 먼저 네 얼굴 보고 말하고 싶었어.'),
        say('nari','등록했어. 회사에도 내 곡을 더 쓰고 나서 다시 이야기하겠다고 말했어.'),
        n('나리는 휴대폰에 적힌 다음 학기 공연 신청서를 보여 줬다. 자기 이름 옆에 직접 쓴 곡 제목이 있었다.',['nari']),
        ...nariMemory(),
        say('nari',f.nariDecisionTrusted ? '내가 고른 다음 얘기도 들어 준다고 했잖아. 다음 곡도 들어 줄래?' : '다음 곡도 들어 줄래? 이번에는 완성되기 전에 들려주고 싶어.'),
        n('나는 고개를 끄덕였다. 나리가 목도리 한쪽을 내게 건넸다. 강 위에 아침빛이 번졌다.',['nari']),
        say('nari','아, 근데 아직 가사는 한 줄밖에 없어. 놀리면 안 돼.'),
        n('그녀는 휴대폰 녹음 버튼을 켜고 내 어깨에 살짝 기대었다. 첫 음이 바람에 흔들렸다. 나리는 지우지 않고 다음 음을 불렀다.',['nari']),
        n('3월의 첫 목요일. 방송국 창문에 불이 켜졌다. 다음 곡의 제목은 아직 빈칸이었다.'));
    } else if(id==='nari-love') {
      add(n('나리는 접힌 악보와 회사에서 받은 답장을 나란히 펼쳐 놓았다.',['nari']),
        say('nari','어디로 갈지 아직 다 정한 건 아니야. 계약서에 물어볼 게 더 남았거든.'),
        say('nari','좋아한다고 말한 거랑 내 노래를 어떻게 할지 정하는 건 다른 얘기지?'),
        n('나는 그렇다고 대답했다. 나리가 악보의 빈 마디를 손가락으로 짚었다.',['nari']),
        ...nariMemory(),
        say('nari','그럼 정해지면 제일 먼저 들려줄게. 기다리기만 하지 말고, 너도 네 곡 써.'),
        say('nari','다 쓰고 들려주라는 건 아니고. 중간에 막힌 데부터 들려줘도 돼.'),
        n('나는 휴대폰 달력에 다음 약속을 적었다. 나리가 날짜 아래에 작은 음표를 하나 그렸다.',['nari']),
        n('멀어질지 가까이 있을지는 아직 몰랐다. 다음 이야기를 서로에게 들려줄 날짜는 정해져 있었다.',['nari']));
    } else if(id==='daeun-love' || id==='daeun-friend') {
      background='campus'; add(n('다은이 새 학기 시간표를 들고 캠퍼스 벤치로 달려왔다.',['daeun']),
        say('daeun',id==='daeun-love'?'공강 하나 맞췄다! 애인이라고 자동으로 맞는 건 아니더라ㅋㅋ':'첫 모임 공지 올리기 전에 너한테 먼저 물어보러 왔다. 친구 특전임ㅋㅋ'),
        say('daeun','나 불안할 때 숫자부터 보는 버릇 아직 있어. 대신 이제는 그렇다고 말해 보려고.'),
        ...(f.daeunReconciled?[say('daeun','그날 나가지 말고 말하라고 했잖아. 나 아직 연습 중이야.')]:[]),
        ...(f.daeunWinterSpace?[say('daeun','겨울 합주 때 빈 마디 남겼잖아. 안 채워도 다음 박자가 오더라. 그게 아직 생각나.')]:
          f.backRowKept?[say('daeun','가을에 맨 뒤에서 손 흔든 거 기억하지? 나 무대에서 진짜 다 봤다니까.')]:
          f.daeunQuietTogether?[say('daeun','강변에서 너랑 조용히 앉아 있었던 날 있지. 나 그때 아무 말 안 해도 괜찮았어.')]:[]),
        n('다은은 휴대폰을 내리고 내 대답을 기다렸다. 나는 오늘 비는 시간을 먼저 알려 줬다.',['daeun']),
        say('daeun','좋아. 그럼 이 약속은 둘 다 알고 있는 거다.'),
        n('다은이 내 시간표의 빈칸을 손가락으로 짚었다가 펜을 내려놓았다.',['daeun']),
        say('daeun',id==='daeun-love'?'여기 뭐 할지는 같이 정하자. 밥은 내가 먼저 고를래!':'그날 시간 되면 같이 밥 먹자. 못 오면 말해 줘. 나도 내 거 하고 있을게.'),
        n('나는 고개를 끄덕였다. 다은은 공지 대신 우리 둘의 약속을 달력에 적었다.',['daeun']));
    } else if(id==='seojin-love' || id==='seojin-friend') {
      background='cafe'; add(n('카페 물결. 서진이 마감 표시판을 뒤집고 내 앞에 잔을 놓았다.',['seojin']),
        ...(f.seojinHired?[say('seojin','수영 수업은 계속할 거야. 아이들 이름도 이제 거의 다 외웠고.')]:f.seojinApplied?[say('seojin','수영장 쪽 대답은 아직 기다리는 중이야. 안 정해진 걸 정해졌다고 말하진 않을게.')]:[say('seojin','수영장에 다시 가 보고 싶어. 지원은 아직 안 했어. 내가 정하면 직접 말할게.')]),
        ...(f.seojinWinterProgress?[say('seojin','그 메모 기억나? 물 쪽으로 갔다고 적은 거. 아직 주머니에 있어.')]:[]),
        ...(f.seojinPoolWaited?[say('seojin','그 주차장에서 5번 레인 자리에 같이 섰던 날 있지. 지금은 거기서부터 다른 길도 보이네.')]:
          s.seen.includes('seojinPlaylist')?[say('seojin','처음엔 마감 음악 한 곡만 알려 줬는데. 이제는 네가 고를 차례도 많아졌네.')]:[]),
        say('seojin',id==='seojin-love'?'봄에 시간 맞으면 물 보러 가자. 네 손 잡고 걷는 쪽이 마음에 드니까.':'가끔 들러. 커피는 다음엔 네가 골라. 친구라고 봐주는 건 없어.'),
        n('서진은 내 잔을 가리키고 자리에 앉았다. 마감 뒤의 음악이 낮게 흘렀다.',['seojin']),
        say('seojin','오늘 마지막 곡은 네가 골라. 다 듣고 나서 어디 갈지도 얘기하자.'),
        n('나는 곡 목록을 넘겼다. 서진은 앞치마를 벗은 채 내 옆에서 첫 음이 시작되기를 기다렸다.',['seojin']));
    } else if(id==='nari-friend') {
      add(n('나리가 등록 안내를 접어 가방에 넣었다.',['nari']),say('nari','다음 학기에도 만나면 내 노래 들어 줘. 친구한테 부탁하는 거야.'),
        say('nari','대답이 다르다고 그때 했던 얘기까지 없어지는 건 아니잖아.'),
        ...nariMemory(),
        say('nari',f.frontRowKept?'다음에도 앞줄 비어 있으면 앉아. 이번엔 약속 아니고 초대야.':'공연하면 알려 줄게. 와서 좋았던 데 하나만 말해 줘.'),
        n('나는 일정이 맞으면 꼭 들으러 가겠다고 했다. 나리는 작게 웃고 먼저 손을 흔들었다.',['nari']));
    } else if(['full','pair','together'].includes(id)) {
      background='cafe';add(n('카페 창가에 각자의 자리가 마련됐다. 함께 만나는 날짜는 모두에게 따로 물어 정했다.',lovers));
      for(const who of lovers) add(say(who,{nari:'다음번에도 내 일정 먼저 물어봐. 말하고 싶은 건 내가 말할게.',daeun:'공지 올리기 전에 시간부터 확인! 이젠 나도 기다리지만은 않는다ㅋㅋ',seojin:'함께하기로 한 건 우리 모두의 선택이야. 바뀌면 바로 얘기하고.'}[who]));
      add(n('우리는 각자의 다음 약속을 확인했다. 한 번의 합의가 앞으로의 대화를 대신하지는 않았다.',lovers));
    } else if(id==='fair') {
      background='cafe';const people=['nari','daeun','seojin'];add(n('카페 창가. 세 사람은 각자 아직 정하지 않은 대답에 관해 이야기하기 위해 만났다.',people),
        say('daeun','순서 정하는 모임 아님! 다 같이 얘기해 보자고 해서 온 거야.'),say('seojin','누구도 기다리기로 강요받은 건 아니야. 생각이 바뀌면 말하는 걸로.'),
        say('nari','…오늘은 대답을 대신 고르지 말고 들어 줘.'),n('나는 세 사람의 말을 차례로 들었다. 관계의 이름은 오늘 정해지지 않았다.',people));
    } else if(id==='empty' || id==='unresolved') {
      add(n(id==='empty'?'숨긴 말과 미뤄 둔 대답이 남아 있었다. 나는 누군가가 곁에 있는 결말을 혼자 정할 수 없었다.':'아직 서로에게 확인하지 못한 말이 남아 있었다. 합의하지 않은 관계에 이름을 붙이지 않기로 했다.'),
        n('강변 벤치에 앉아 보낼 말을 적었다. 이번에는 답을 받기 전에 다음 문장을 미리 정하지 않았다.'));
    } else if(id==='reflection') {
      add(n(s.letters.length ? '어젯밤 라디오의 목소리가 오래 남았다. 그 사람이 누구인지와 별개로, 나는 얼굴 없는 목소리에 내 이야기를 보냈다.' : '어젯밤 라디오의 목소리가 오래 남았다. 그 사람이 누구인지와 별개로, 나는 얼굴 없는 목소리에 귀를 기울였다.'),
        n('이어폰을 빼자 강물 위에 달이 비쳤다. 이름을 모르는 채로도 함께 보낸 시간은 있었다.'));
    } else if(id==='far') {
      add(n('학교 라디오의 시즌이 끝났다. 무대 위에서 본 목소리와 방송 속 목소리가 내게는 각기 다른 기억으로 남았다.'),
        n('새 학기 첫 목요일에도 라디오를 켜 볼 생각이었다. 아직 만나지 않은 이야기가 있을 테니까.'));
    } else {
      add(n('이사 오던 날의 상자 세 개 중 하나를 접었다. 일 년 전보다 방이 조금 익숙해졌다.'),
        n('강변을 걸으며 휴대폰에 짧은 멜로디를 녹음했다. 끝은 여전히 질문 같았지만 지우지 않았다.'));
    }
    const missed=hints.filter(([key])=>!s.seen.includes(key)).slice(0,3);
    add(n(`결말 · ${titles[id]}`));
    if(missed.length) { add(n('놓친 순간')); for(const [,hint] of missed) add(n(`· ${hint}`)); }
    add(n(s.radio.honestCount>=5?'올해 나는 내 이야기를 조금 더 자주 보냈다.':'올해 나는 듣고, 가끔 내 이야기도 꺼냈다.'));
    add(n('AQUA LUNA · 한여울의 첫해'), n('끝까지 함께해 주셔서 감사합니다.'));
    return {id,title:titles[id],background,time:0,lines};
  }
  root.AquaEndings={select,build};
})(typeof window!=='undefined'?window:globalThis);
