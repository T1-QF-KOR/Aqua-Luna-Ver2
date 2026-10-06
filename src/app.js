(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const D = window.LunaData, E = window.LunaEngine, N = window.LunaStory, C = window.LunaCourses, A = window.LunaActivities;
  const won = amount => `${amount.toLocaleString('ko-KR')}원`;
  const el = (tag, className, text) => { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; };
  const button = (label, className, action) => { const b = el('button', className, label); b.addEventListener('click', action); return b; };
  let state = E.makeState(), active = false, hasSession = false, unsaved = false, toastTimer, lastFocus, modalRevision = 0;
  let shopCategory = 'all';
  let courseTheme = 'all', courseStatus = 'all', courseSearch = '';
  const storedPrefs = E.storage.read('prefs', {});
  const prefs = { portrait: storedPrefs?.portrait !== false, reduceMotion: storedPrefs?.reduceMotion === true, textSize: ['normal','large','largest'].includes(storedPrefs?.textSize) ? storedPrefs.textSize : 'normal', volume: Number.isFinite(storedPrefs?.volume) ? Math.max(0, Math.min(100, storedPrefs.volume)) : 25 };
  let audioContext, audioGain, musicTimer, soundOn = false, noteIndex = 0;
  function toast(text) { clearTimeout(toastTimer); ($('modal').open ? $('modal') : $('game')).append($('toast')); $('toast').textContent = text; $('toast').hidden = false; toastTimer = setTimeout(() => $('toast').hidden = true, 3600); }
  function applyPrefs() { $('game').classList.toggle('portrait-off', !prefs.portrait); $('game').classList.toggle('reduced-motion', prefs.reduceMotion); $('game').dataset.textSize = prefs.textSize; if (audioGain && audioContext) audioGain.gain.setTargetAtTime(prefs.volume / 100 * .13, audioContext.currentTime, .2); }
  function savePrefs() { E.storage.write('prefs', prefs); applyPrefs(); }
  function playNote() {
    if (!soundOn || document.hidden || !audioContext || audioContext.state !== 'running') return;
    const notes = [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66];
    const osc = audioContext.createOscillator(), gain = audioContext.createGain(), time = audioContext.currentTime;
    osc.type = 'sine'; osc.frequency.value = notes[noteIndex++ % notes.length] / 2;
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.4, time + .1); gain.gain.exponentialRampToValueAtTime(.001, time + 3.5);
    osc.connect(gain); gain.connect(audioGain); osc.start(); osc.stop(time + 3.6);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
  async function toggleSound() {
    try {
      if (!audioContext) { audioContext = new (window.AudioContext || window.webkitAudioContext)(); audioGain = audioContext.createGain(); audioGain.connect(audioContext.destination); applyPrefs(); }
      soundOn = !soundOn; clearInterval(musicTimer);
      if (soundOn) { await audioContext.resume(); playNote(); musicTimer = setInterval(playNote, 2200); } else await audioContext.suspend();
      $('sound').setAttribute('aria-pressed', String(soundOn)); $('sound').setAttribute('aria-label', soundOn ? '배경음 끄기' : '배경음 켜기');
    } catch { soundOn = false; clearInterval(musicTimer); toast('이 브라우저에서는 배경음을 재생할 수 없어요.'); }
  }
  document.addEventListener('visibilitychange', async () => { if (audioContext && soundOn) { try { if (document.hidden) await audioContext.suspend(); else await audioContext.resume(); } catch { /* Next explicit toggle can recover audio. */ } } });
  function warnBeforeExit(event) { if (unsaved) { event.preventDefault(); event.returnValue = ''; } }
  function persist() {
    unsaved = !E.storage.save(0, state);
    $('save-status').hidden = !unsaved;
    if (unsaved) window.addEventListener('beforeunload', warnBeforeExit);
    else window.removeEventListener('beforeunload', warnBeforeExit);
    return !unsaved;
  }
  function showTitle() {
    showScene('pier', 'casual', 'none', 'night');
    active = false; $('game').className = 'game title-mode'; applyPrefs(); $('title-screen').hidden = false; $('title-caption').hidden = false; $('title-footer').hidden = false; $('play-screen').hidden = true;
    const saved = hasSession ? state : E.storage.load(0); $('continue-game').disabled = !saved; $('continue-note').textContent = saved ? `${saved.day}일째 · ${won(saved.money)}${unsaved ? ' · 저장 필요' : ''}` : '아직 저장된 하루가 없어요';
  }
  function begin(loaded) {
    state = loaded || E.makeState(); active = true; hasSession = true; $('game').className = 'game play-mode'; applyPrefs(); $('title-screen').hidden = true; $('title-caption').hidden = true; $('title-footer').hidden = true; $('play-screen').hidden = false;
    render(); persist(); $('work-button').focus({ preventScroll: true });
    if (state.story.active || A.progress(state).active) storyScene();
  }
  function render() {
    showScene(state.location, state.outfit, state.legwear);
    $('day-number').textContent = String(state.day).padStart(2, '0'); $('log-day').textContent = String(state.day).padStart(2, '0');
    $('weekday').textContent = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일'][(state.day - 1) % 7];
    $('money').replaceChildren(document.createTextNode(state.money.toLocaleString('ko-KR')), el('small', '', '원'));
    $('ap').textContent = '◆ '.repeat(state.ap) + '◇ '.repeat(3 - state.ap); $('ap').setAttribute('aria-label', `남은 시간 ${state.ap}칸`);
    $('energy-number').textContent = state.energy; $('energy-bar').style.width = `${state.energy}%`; $('affection').textContent = state.affection; $('trust').textContent = state.trust;
    $('equipped-name').textContent = outfitLabel(state.outfit, state.legwear);
    const nextStories = N.available(state);
    $('story-button').textContent = A.progress(state).active ? '데이트 체험 이어가기 →' : state.story.active ? '이야기 이어가기 →' : nextStories.length ? `새 이야기 ${nextStories.length} · ${nextStories[0].title} →` : `관계와 이야기 · ${N.stage(state)} →`;
    $('story-button').classList.toggle('story-ready', !!state.story.active || nextStories.length > 0);
    const budget = E.expenseProgress(state);
    $('budget-summary').textContent = budget?.name || '함께할 내일을 계획해요';
    $('budget-detail').textContent = budget ? budget.shortage ? `${won(budget.shortage)} 더 모으면 돼요 · ${budget.percent}%` : budget.ready ? '예산 준비 완료 · 지금 사용할 수 있어요' : '예산 준비 완료 · 활동 조건 확인' : '의상 · 데이트 예산 설정 ↗';
    $('budget-bar').style.width = `${budget?.percent || 0}%`;
    $('rest-button').disabled = !!E.reason(state, 'rest'); $('rest-button').title = E.reason(state, 'rest') || '기력을 회복합니다';
    const recent = state.journal.filter(j => j.day === state.day).slice(-12);
    const feed = $('activity-feed'); feed.replaceChildren();
    const intro = el('div', 'feed-entry'); intro.append(el('small', '', `DAY ${String(state.day).padStart(2,'0')} · 일상`), el('p', '', `${state.day}일째의 하루입니다. 남은 시간과 소지금을 살펴보고 오늘 할 일을 선택해 주세요.`)); feed.append(intro);
    recent.forEach((j, index) => { const row = el('div', `feed-entry${index === recent.length - 1 ? ' latest' : ''}`); const heading = el('small', '', j.title); if (j.money) heading.append(el('em', '', `${j.money > 0 ? '+' : '−'}${won(Math.abs(j.money))}`)); row.append(heading, el('p', '', j.text)); feed.append(row); });
    feed.scrollTop = feed.scrollHeight;
    const latest = state.journal.at(-1); $('message-title').textContent = latest?.title || '우리의 일상을 시작해 볼까요?'; $('message-text').textContent = latest?.text || '일해서 돈을 벌고, 수련과 함께할 시간을 계획해 보세요.';
  }
  function openModal(title, build) {
    modalRevision += 1;
    if (!$('modal').open) lastFocus = document.activeElement;
    $('modal-title').textContent = title; $('modal-body').replaceChildren(); build($('modal-body'));
    if (!$('modal').open) $('modal').showModal(); $('modal').scrollTop = 0; $('close-modal').focus({ preventScroll: true });
  }
  function closeModal() { modalRevision += 1; $('modal').close(); }
  $('modal').addEventListener('close', () => { if (!$('modal').open) { $('game').append($('toast')); if (lastFocus && lastFocus.isConnected && !lastFocus.closest('[hidden]')) lastFocus.focus({ preventScroll: true }); } });
  $('modal').addEventListener('click', e => { if (e.target !== $('modal')) return; const r = $('modal').getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeModal(); });
  function confirm(title, text, label, yes, back) {
    openModal(title, body => { body.append(el('p', 'modal-description', text)); const actions = el('div', 'confirm-actions'); actions.append(button('돌아가기', 'secondary', () => back ? back() : closeModal()), button(label, 'primary', () => { closeModal(); yes(); })); body.append(actions); });
  }
  function doAction(type, id, keepWardrobe = false) {
    const result = E.act(state, type, id);
    if (result.error) { toast(result.error); return; }
    state = result.state; render(); persist();
    if (keepWardrobe) { wardrobe(); toast(result.result.title); } else { closeModal(); toast(result.result.title); }
  }
  function confirmActivity(type, item) {
    if (type === 'date') { prepareDate(item); return; }
    const preview = E.act(state, type, item.id);
    if (preview.error) { toast(preview.error); return; }
    const after = preview.state;
    openModal(type === 'buy' ? '의상 구매' : item.name, body => {
      body.append(el('p', 'modal-description', type === 'buy' ? `${item.name}를 구매합니다. 보유한 의상은 언제든 무료로 갈아입을 수 있어요.` : '아래 결과를 확인하고 진행해 주세요. 돌아가면 시간과 돈을 사용하지 않습니다.'));
      const table = el('table', 'resource-preview');
      const caption = el('caption', '', '활동 전후 예상 상태'); table.append(caption);
      const head = el('tr'); ['자원', '현재', '활동 후'].forEach(t => { const th = el('th', '', t); th.scope = 'col'; head.append(th); }); const thead=el('thead'); thead.append(head); table.append(thead);
      const tbody=el('tbody');
      const rows = [['소지금', won(state.money), won(after.money)], ['남은 시간', `${state.ap}칸`, `${after.ap}칸`], ['기력', state.energy, after.energy]];
      if (type === 'date') rows.push(['호감', state.affection, after.affection], ['신뢰', state.trust, after.trust]);
      rows.forEach(([name,before,value]) => { const tr=el('tr'), label=el('th','',name); label.scope='row'; tr.append(label,el('td','',before),el('td',String(before)!==String(value)?'changed':'',value)); tbody.append(tr); }); table.append(tbody); body.append(table);
      const actions=el('div','confirm-actions'); actions.append(button('돌아가기','secondary',()=>type==='buy'?shop():activities(type)),button(type==='buy'?'구매하기':type==='work'?'일 시작하기':'데이트 진행','primary',()=>doAction(type,item.id,type==='buy'))); body.append(actions);
    });
  }
  function setExpenseGoal(goal) {
    const planned = E.planExpense(state, goal);
    if (planned.error) { toast(planned.error); return; }
    state = planned.state; render(); persist(); budgetPlanner(); toast(goal ? '저축 목표를 정했어요.' : '저축 목표를 해제했어요.');
  }
  function budgetPlanner() {
    openModal('함께할 내일의 예산', body => {
      body.append(el('p','modal-description',`현재 ${won(state.money)}. 마음에 둔 의상이나 데이트를 목표로 정해 보세요. 목표 설정만으로 돈이 빠져나가거나 예약되지는 않습니다.`));
      const progress = E.expenseProgress(state);
      if (progress) {
        const panel=el('section','budget-progress'); panel.append(el('small','', '현재 저축 목표'),el('h3','',progress.name),el('p','',`${won(state.money)} / ${won(progress.cost)} · ${progress.percent}%`));
        const meter=el('progress'); meter.max=progress.cost; meter.value=Math.min(state.money,progress.cost); meter.setAttribute('aria-label',`${progress.name} 예산 준비`); panel.append(meter);
        panel.append(el('p','',progress.shortage?`${won(progress.shortage)}을 더 모으면 예산이 준비됩니다.`:progress.ready?'예산과 활동 조건이 준비되었습니다.':`예산은 준비되었어요. ${progress.reason}`));
        const actions=el('div','budget-controls'); const go=button(state.expenseGoal.type==='buy'?'상점 열기':'데이트 살펴보기','primary',()=>state.expenseGoal.type==='buy'?shop():activities('date')); actions.append(go,button('목표 해제','secondary',()=>setExpenseGoal(null))); panel.append(actions); body.append(panel);
      }
      const list=el('div','budget-options');
      const items=[...D.outfits.filter(o=>o.cost>0&&!state.owned.includes(o.id)).map(item=>({type:'buy',item})),...D.dates.filter(d=>d.cost>0).map(item=>({type:'date',item}))];
      items.forEach(({type,item})=>{
        const row=el('article','budget-option'), copy=el('div'); copy.append(el('small','',type==='buy'?'의상':'데이트'),el('h3','',item.name),el('p','',`${won(item.cost)} · ${state.money>=item.cost?'예산 준비 완료':won(item.cost-state.money)+' 부족'}`));
        if(type==='date') copy.append(el('p','muted-note',`시간 ${item.ap}칸 · 기력 ${item.energy}${item.requiredTrust?' · 신뢰 '+item.requiredTrust+' 필요':''}`));
        const selected=state.expenseGoal?.type===type&&state.expenseGoal.id===item.id;
        const choose=button(selected?'현재 목표':'목표로 정하기','secondary',()=>setExpenseGoal({type,id:item.id})); choose.dataset.goalId=`${type}:${item.id}`; choose.disabled=selected; row.append(copy,choose); list.append(row);
      }); body.append(list);
      body.append(el('p','muted-note','다른 곳에 돈을 쓰면 준비된 비율도 달라져요. 해당 의상을 구매하거나 데이트를 진행하면 목표가 자동으로 완료됩니다.'));
    });
  }
  function activities(type) {
    const work = type === 'work';
    openModal(work ? '일하러 가기' : '데이트 초대', body => {
      body.append(el('p', 'modal-description', work ? `주인공이 직접 일해서 돈을 벌어요. 현재 ${won(state.money)} · 남은 시간 ${state.ap}칸 · 기력 ${state.energy}` : `입사 전, 친구 수련과 함께 고르는 ${D.dates.length}개의 외출. 하루 한 번 출발하며 비용과 시간이 사용됩니다. 기본 코스는 3번, 탐방 코스는 6번의 선택으로 이어져요.`));
      if (state.story.active) body.append(button('진행 중인 이야기 이어가기', 'primary', storyScene));
      const filters=el('div','course-filters');
      if(!work){
        body.append(button(`탐방 수첩 · ${Object.keys(C.entries(state)).length}/48곳`,'secondary',courseBook));
        const search=el('input');search.type='search';search.placeholder='코스 이름이나 내용 검색';search.value=courseSearch;search.setAttribute('aria-label','데이트 코스 검색');search.id='course-search';
        function select(label,id,options,value){const wrap=el('label','dress-field',label),input=el('select');input.id=id;options.forEach(([v,t])=>{const o=el('option','',t);o.value=v;input.append(o);});input.value=value;wrap.append(input);filters.append(wrap);return input;}
        const theme=select('테마','course-theme',[['all','모든 테마'],['classic','익숙한 세 코스'],...C.themes.map(t=>[t.id,t.name])],courseTheme);
        const status=select('방문 상태','course-status',[['all','모든 코스'],['new','아직 가지 않은 곳'],['ready','지금 출발 가능한 곳'],['visited','다녀온 곳']],courseStatus);
        filters.prepend(search);body.append(filters);
        search.addEventListener('input',()=>{courseSearch=search.value;page=0;draw();});
        theme.addEventListener('change',()=>{courseTheme=theme.value;page=0;draw();});
        status.addEventListener('change',()=>{courseStatus=status.value;page=0;draw();});
      }
      let page=0;
      const found=el('p','muted-note');found.setAttribute('aria-live','polite');
      const list = el('div', 'choice-list');
      const pagination=el('nav','course-pagination');pagination.setAttribute('aria-label','데이트 목록 페이지');
      body.append(found,list,pagination);
      function draw(){
      list.replaceChildren();pagination.replaceChildren();
      const seen=id=>!!C.entries(state)[id]||state.memories.some(m=>m.date===id);
      const matches=(work?D.jobs:D.dates).filter(item=>work||(courseTheme==='all'||courseTheme==='classic'&&!item.theme||item.theme===courseTheme)&&(!courseSearch||`${item.name} ${item.description} ${item.sub}`.includes(courseSearch.trim()))&&(courseStatus==='all'||courseStatus==='new'&&!seen(item.id)||courseStatus==='visited'&&seen(item.id)||courseStatus==='ready'&&!E.reason(state,'date',item.id)));
      const pages=Math.max(1,Math.ceil(matches.length/12));page=Math.min(page,pages-1);
      found.textContent=work?'':`${matches.length}개 코스 · ${page+1}/${pages}페이지 · 현재 ${won(state.money)}`;
      matches.slice(page*12,page*12+12).forEach(item => {
        const row = el('article', 'activity-card'); row.append(el('span', 'card-icon', item.icon));
        const copy = el('div'); copy.append(el('h3', '', item.name), el('p', '', item.description));
        if(!work)copy.prepend(el('small','course-tag',`${item.sub} · ${seen(item.id)?'다녀온 곳':'새로운 곳'} · ${N.script('date',item.id).length}장면`));
        const costs = el('div', 'costs'); costs.append(el('span', '', `시간 ${item.ap}칸`), el('span', '', `기력 −${item.energy}`));
        if (!work) costs.append(el('span', '', `완료 기본 호감 +${Math.min(100-state.affection,item.affection)} · 신뢰 +${Math.min(100-state.trust,item.trust)} · 선택에 따라 추가 변화`)); copy.append(costs); row.append(copy);
        const action = el('div', 'card-action'); const reason = E.reason(state, type, item.id);
        const b = button(work ? `+${won(item.pay)} · 일하기` : item.cost ? `${won(item.cost)} · 초대` : '무료 · 함께 걷기', 'primary', () => confirmActivity(type,item));
        b.disabled = !!reason; b.dataset.actionId = item.id; action.append(b); if (reason) action.append(el('span', 'blocked-reason', reason)); row.append(action); list.append(row);
      });
      if(!matches.length)list.append(el('p','story-hint','조건에 맞는 코스가 없어요. 테마나 방문 상태를 바꿔 보세요.'));
      if(pages>1){const prev=button('← 이전','secondary',()=>{page--;draw();$('modal').scrollTop=0;}),next=button('다음 →','secondary',()=>{page++;draw();$('modal').scrollTop=0;});prev.disabled=page===0;next.disabled=page===pages-1;pagination.append(prev,el('span','',`${page+1} / ${pages}`),next);}
      }
      draw();
    });
  }
  function courseBook(){
    openModal('둘이 쓴 탐방 수첩',body=>{
      const count=Object.keys(C.entries(state)).length;
      body.append(el('p','modal-description',`서로 다른 탐방 코스 ${count}/48곳. 첫 방문의 선택과 코디는 최근 60회 앨범과 별도로 계속 보관됩니다. 같은 코스를 반복해도 탐방 진도는 늘지 않아요.`));
      body.append(el('p','story-outcome',`둘이 마친 체험 ${A.progress(state).wins.length}/576 · 탐색, 음의 조각, 추억 카드를 코스마다 12단계로 즐길 수 있어요.`));
      C.themes.forEach(theme=>{
        const section=el('section','course-book-theme');section.style.setProperty('--theme-color',theme.color);
        section.append(el('small','course-tag',`${C.visited(state,theme.id)} / 8곳`),el('h3','',`${theme.icon} ${theme.name}`));
        const progress=el('progress');progress.max=8;progress.value=C.visited(state,theme.id);progress.setAttribute('aria-label',`${theme.name} 탐방 진행`);section.append(progress);
        const milestones=el('div','course-milestones');
        N.events.filter(e=>e.theme===theme.id).forEach(event=>{
          const complete=N.done(state,event.id),ready=N.available(state).some(e=>e.id===event.id);
          const row=el('div');row.append(el('strong','',`${complete?'✓':ready?'◇':'○'} ${event.title}`),el('p','muted-note',event.hint));
          if(ready)row.append(button('새 이야기 읽기','secondary',()=>beginStory(event.id)));
          if(complete)row.append(button('이야기 다시 읽기','secondary',()=>readEvent(event.id,courseBook)));
          milestones.append(row);
        });section.append(milestones);
        const records=el('details');records.append(el('summary','', '코스별 첫 기억과 기념 기록'));
        D.dates.filter(d=>d.theme===theme.id).forEach(d=>{const r=C.entries(state)[d.id],row=el('div','course-memory');row.append(el('strong','',d.name),el('p','',r?`${d.souvenir} · 첫 방문 ${r.first.day}일째 · ${r.visits}회 방문`:`${d.souvenir} · 아직 남기지 않은 기록`));if(r)row.append(button('첫날 대화 다시 읽기','secondary',()=>readMemory(r.first,courseBook)),button(`둘이 체험하기 · ${A.progress(state).wins.filter(w=>w.key.startsWith(d.id+':')).length}/12`,'secondary',()=>activityMenu(d.id)));records.append(row);});
        section.append(records,button('이 테마의 코스 보기','secondary',()=>{courseTheme=theme.id;courseStatus='all';courseSearch='';activities('date');}));body.append(section);
      });
      const finale=N.events.find(e=>e.id==='prelude-next');body.append(el('p','story-hint',N.done(state,finale.id)?'문을 두드리기 전 · 입사 전 이야기의 마지막 장을 읽었어요. 외출과 회상은 계속할 수 있어요.':`마지막 이야기 · ${finale.hint}`));
      if(N.available(state).includes(finale))body.append(button('문을 두드리기 전','primary',()=>beginStory(finale.id)));
      body.append(button('데이트 목록으로','secondary',()=>activities('date')));
    });
  }
  function readEvent(id,back=storyHub){
    const record=state.story.completed.find(e=>e.id===id),event=N.events.find(e=>e.id===id);if(!record||!event)return;
    openModal(event.title,body=>{body.append(el('p','muted-note','회상은 자원이나 진행을 바꾸지 않아요.'));record.choices.forEach((id,i)=>{const n=event.nodes[i],c=n.choices.find(c=>c.id===id);body.append(el('p','story-text',n.text),el('p','story-player',c.label),el('p','story-reply',c.reply));});body.append(button('돌아가기','secondary',back));});
  }
  function outfitLabel(outfit, legwear) {
    const name = D.outfits.find(o => o.id === outfit).name;
    return outfit === 'skirt' ? `${name} · ${D.accessories.find(a => a.id === legwear).name}` : name;
  }
  const timeLabel = time => D.times.find(t => t.id === time)?.name || '시간 기록 없음';
  function showScene(location, outfit, legwear, time = D.timeForAp(state.ap)) {
    const place = D.locations[location];
    document.querySelector('.scenery').style.backgroundImage = `linear-gradient(90deg,rgba(8,17,30,.65),rgba(11,19,31,.06)),url("${D.sceneImage(location, time)}")`;
    $('game').dataset.time = time;
    $('location-name').textContent = `${place.name} · ${timeLabel(time)}`;
    const path = D.characterImage(outfit, legwear);
    if ($('character').getAttribute('src') !== path) { $('character').hidden = false; $('character').src = path; }
    $('character').alt = `${outfitLabel(outfit, legwear)} 차림의 수련`;
    $('character').classList.toggle('full-body', !!D.outfits.find(o => o.id === outfit)?.fullBody);
  }
  function artScene(location, outfit, legwear, expression = 'neutral', time = D.timeForAp(state.ap)) {
    const stage = el('div', 'art-scene');
    stage.style.backgroundImage = `url("${D.sceneImage(location, time)}")`;
    const img = el('img'); img.src = D.characterImage(outfit, legwear, expression); img.alt = `${outfitLabel(outfit, legwear)} 차림의 수련`; img.loading = 'lazy';
    stage.append(img); return stage;
  }
  function shop() {
    openModal('망원동 의상 상점', body => {
      body.append(el('p', 'modal-description', `소지금 ${won(state.money)} · 구매 후 옷장에서 입혀 주세요.`));
      const intro = el('div','fashion-intro');
      intro.append(el('small','','MANGWON STYLE COLLECTION'),el('h3','','오늘은 조금 다른 분위기로'),el('p','','미니스커트부터 여유로운 데님까지, 새로운 8가지 코디를 만나 보세요. 옷을 사기 전에 수련의 전신 착용 모습을 살펴볼 수 있어요.')); body.append(intro);
      body.append(button('보유한 옷 입히기 →', 'secondary', wardrobe));
      const filters = el('div','shop-filters'); filters.setAttribute('role','group'); filters.setAttribute('aria-label','의상 종류');
      D.outfitCategories.forEach(category => { const b=button(category.name,'secondary',()=>{ shopCategory=category.id;shop();$('modal-body').querySelector(`[data-shop-filter="${category.id}"]`).focus({preventScroll:true}); }); b.dataset.shopFilter=category.id;b.setAttribute('aria-pressed',String(shopCategory===category.id));filters.append(b); });body.append(filters);
      const grid = el('div', 'collection-grid');
      const products = [...D.outfits.filter(o => o.cost).sort((a,b)=>Number(!!b.collection)-Number(!!a.collection)).map(item => ({ item, type: 'buy' })), ...D.accessories.filter(a => a.cost).map(item => ({ item, type: 'buyAccessory' }))].filter(({item,type})=>shopCategory==='all'||shopCategory==='new'&&item.collection||shopCategory==='accessory'&&type==='buyAccessory'||shopCategory===item.category);
      body.append(el('p','shop-count',`${D.outfitCategories.find(c=>c.id===shopCategory).name} · ${products.length}종`));
      products.forEach(({ item, type }) => {
        const accessory = type === 'buyAccessory', owned = (accessory ? state.ownedAccessories : state.owned).includes(item.id);
        const card = el('article', 'product-card');
        card.dataset.shopItem=item.id;
        const preview = button('','product-preview',()=>previewProduct(item,type));preview.setAttribute('aria-label',`${item.name} 전신 미리보기`);
        preview.append(artScene('practice', accessory ? 'skirt' : item.id, accessory ? item.id : 'none'),el('span','preview-label','전신 크게 보기 ↗'));card.append(preview);
        card.append(el('small', 'product-kind', accessory ? '소품 · 가디건·플리츠 세트 전용' : `${item.collection?'NEW · ':''}${D.outfitCategories.find(c=>c.id===item.category)?.name || '의상'} · 한 벌 코디`), el('h3', '', item.name), el('p', '', item.description));
        const buy = button(owned ? '보유 중' : `${won(item.cost)} · 구매`, 'primary', () => {
          if (!accessory) { confirmActivity(type, item); return; }
          confirm('스타킹 구매', `${item.name} · ${won(item.cost)}\n구매 후 잔액 ${won(state.money - item.cost)}. 아이보리 가디건과 플리츠 스커트 세트에 착용할 수 있어요.`, '구매하기', () => doAction(type, item.id, true), shop);
        });
        buy.dataset.productId = `${type}:${item.id}`; buy.disabled = owned || !!E.reason(state, type, item.id); card.append(buy);
        if (!owned && E.reason(state, type, item.id)) card.append(el('p', 'blocked-reason', E.reason(state, type, item.id)));
        grid.append(card);
      }); body.append(grid);
    });
  }
  function previewProduct(item,type) {
    const accessory=type==='buyAccessory';
    openModal(`${item.name} · 미리보기`,body=>{
      const layout=el('div','dressing-layout product-detail'),controls=el('div','dressing-controls');
      layout.append(artScene('practice',accessory?'skirt':item.id,accessory?item.id:'none'),controls);body.append(layout);
      controls.append(el('small','product-kind','수련의 전신 착용 모습'),el('h3','',item.name),el('p','modal-description',item.description),el('p','date-total',won(item.cost)),el('p','muted-note',accessory?'아이보리 가디건과 플리츠 스커트 세트에 착용하는 소품입니다.':'한 벌 코디로 구매합니다. 미리보기는 현재 의상·소지금·시간을 바꾸지 않아요.'));
      const owned=(accessory?state.ownedAccessories:state.owned).includes(item.id);
      const buy=button(owned?'보유 중':`${won(item.cost)} · 구매`,'primary',()=>{
        if(!accessory){confirmActivity(type,item);return;}
        confirm('스타킹 구매',`${item.name} · ${won(item.cost)}. 구매 후 잔액 ${won(state.money-item.cost)}.`, '구매하기',()=>doAction(type,item.id,true),()=>previewProduct(item,type));
      });buy.disabled=owned||!!E.reason(state,type,item.id);buy.dataset.productId=`${type}:${item.id}`;controls.append(buy);
      if(!owned&&E.reason(state,type,item.id))controls.append(el('p','blocked-reason',E.reason(state,type,item.id)));
      controls.append(button('상점으로 돌아가기','secondary',shop));
    });
  }
  function dressingRoom() {
    openModal('수련의 옷장', body => {
      body.append(el('p', 'modal-description', '보유한 옷과 소품을 직접 입혀 주세요. 갈아입기는 무료이며 시간을 사용하지 않아요.'));
      const layout = el('div', 'dressing-layout'), controls = el('div', 'dressing-controls');
      layout.append(artScene(state.location, state.outfit, state.legwear), controls); body.append(layout);
      controls.append(el('small', 'product-kind', '지금 입고 있는 코디'), el('h3', '', outfitLabel(state.outfit, state.legwear)), el('h4', '', '의상'));
      D.outfits.filter(o => state.owned.includes(o.id)).forEach(o => {
        const b = button(`${state.outfit === o.id ? '✓ ' : ''}${o.name}${state.outfit === o.id ? ' · 착용 중' : ' · 갈아입기'}`, 'wardrobe-option', () => doAction('equip', o.id, true));
        b.disabled = state.outfit === o.id; b.dataset.outfitId = o.id; controls.append(b);
      });
      controls.append(el('h4', '', '스타킹'));
      D.accessories.filter(a => state.ownedAccessories.includes(a.id)).forEach(a => {
        const b = button(`${state.legwear === a.id ? '✓ ' : ''}${a.name}`, 'wardrobe-option', () => doAction('equipAccessory', a.id, true));
        b.disabled = !!E.reason(state, 'equipAccessory', a.id); b.dataset.accessoryId = a.id; controls.append(b);
      });
      controls.append(el('p', 'muted-note', state.outfit === 'skirt' ? '검은색 · 살색 · 미착용은 서로 다른 그림으로 표시됩니다.' : '별도 스타킹은 아이보리 가디건과 플리츠 스커트 세트 전용이에요. 다른 코디에는 그 의상의 신발·양말 구성이 적용됩니다.'));
      controls.append(button('새 의상과 소품 사기', 'secondary', shop), button('이 차림으로 데이트 고르기', 'primary', () => activities('date')));
    });
  }
  function prepareDate(item) {
    let outfit = state.outfit, legwear = state.legwear;
    openModal(`${item.name} · 외출 준비`, body => {
      body.append(el('p', 'modal-description', `${timeLabel(D.timeForAp(state.ap))}에 출발해요. 장소와 코디를 확인해 주세요. ${won(item.cost)} · 시간 ${item.ap}칸 · 기력 ${item.energy}. 출발 전까지 돈과 시간이 줄지 않아요.`));
      const layout = el('div', 'dressing-layout'), preview = artScene(item.location, outfit, legwear), controls = el('div', 'dressing-controls');
      layout.append(preview, controls); body.append(layout);
      controls.append(el('small', 'product-kind', D.locations[item.location].name), el('h3', '', '오늘, 함께할 모습'));
      const outfitSelect = el('select'), accessorySelect = el('select'); outfitSelect.id = 'date-outfit'; accessorySelect.id = 'date-accessory';
      function field(text, select) { const label = el('label', 'dress-field', text); label.append(select); controls.append(label); }
      D.outfits.filter(o => state.owned.includes(o.id)).forEach(o => { const option = el('option', '', o.name); option.value = o.id; outfitSelect.append(option); }); outfitSelect.value = outfit;
      field('의상 선택', outfitSelect); field('스타킹 선택', accessorySelect);
      const caption = el('p', 'muted-note'); controls.append(caption);
      function refresh() {
        accessorySelect.replaceChildren();
        D.accessories.filter(a => state.ownedAccessories.includes(a.id) && (outfit === 'skirt' || a.id === 'none')).forEach(a => { const option = el('option', '', a.name); option.value = a.id; accessorySelect.append(option); });
        if (outfit !== 'skirt') legwear = 'none'; accessorySelect.value = legwear; accessorySelect.disabled = outfit !== 'skirt';
        preview.querySelector('img').src = D.characterImage(outfit, legwear); preview.querySelector('img').alt = outfitLabel(outfit, legwear); caption.textContent = outfitLabel(outfit, legwear);
      }
      outfitSelect.addEventListener('change', () => { outfit = outfitSelect.value; refresh(); }); accessorySelect.addEventListener('change', () => { legwear = accessorySelect.value; refresh(); }); refresh();
      controls.append(el('p', 'date-total', `데이트 후 잔액 ${won(state.money - item.cost)} · 시간 ${state.ap - item.ap}칸 · 기력 ${state.energy - item.energy}\n호감 ${state.affection} → ${Math.min(100,state.affection+item.affection)} · 신뢰 ${state.trust} → ${Math.min(100,state.trust+item.trust)}`));
      controls.append(button('데이트 진행 · 이 차림으로 출발', 'primary', () => {
        const result = E.dateWithOutfit(state, item.id, outfit, legwear);
        if (result.error) { toast(result.error); return; }
        state = result.state; render(); persist(); storyScene();
      }), button('다른 장소 고르기', 'secondary', () => activities('date')));
    });
  }
  function album() {
    openModal('수련과의 추억 앨범', body => {
      body.append(el('p', 'modal-description', '데이트한 날의 장소와 코디를 보관합니다. 나중에 옷을 바꿔도 그날의 모습은 그대로 남아요. 최근 60번의 데이트를 보관해요.'));
      if (!state.memories.length) body.append(el('p', 'muted-note', '첫 데이트를 마치면 이곳에 추억이 생겨요.'));
      const grid = el('div', 'collection-grid');
      [...state.memories].reverse().forEach(m => { const date = D.dates.find(d => d.id === m.date), card = el('article', 'memory-card'); card.append(artScene(date.location, m.outfit, m.legwear, 'neutral', m.time || 'night'), el('small', 'product-kind', `${m.day}일째 · ${timeLabel(m.time)}${m.time ? ' 출발' : ''}`), el('h3', '', date.name), el('p', '', outfitLabel(m.outfit, m.legwear))); if (m.choices) { card.append(el('p','memory-choice',m.choices.map((id,i)=>N.script('date',m.date)[i].choices.find(c=>c.id===id).label).join(' → '))); card.append(button('그날의 대화 다시 읽기','secondary',()=>readMemory(m))); } if(m.keptPromise) card.append(el('small','', '함께 정한 산책 약속을 지킨 날')); grid.append(card); }); body.append(grid);
      body.append(button('일러스트 살펴보기', 'secondary', gallery));
    });
  }
  function gallery() {
    openModal('수련의 일러스트', body => {
      body.append(el('p', 'modal-description', '장소·시간·코디·표정을 조합해 살펴보세요. 미리보기는 구매나 진행 상태에 영향을 주지 않습니다. 후드는 표정 5종, 니트·코트·치마는 3종, 셔츠·블라우스는 기본 표정을 제공합니다.'));
      const preview = artScene('pier', 'casual', 'none'), controls = el('div', 'gallery-controls');
      const fill = (input, items, value) => { input.replaceChildren(); items.forEach(([id, name]) => { const o = el('option', '', name); o.value = id; input.append(o); }); input.value = items.some(([id]) => id === value) ? value : items[0][0]; };
      const select = (id, text, items, value) => { const label = el('label', 'dress-field', text), input = el('select'); input.id = id; fill(input, items, value); label.append(input); controls.append(label); return input; };
      const place = select('gallery-place', '장소', Object.entries(D.locations).map(([id,p]) => [id,p.name]), 'pier');
      const time = select('gallery-time', '시간대', D.times.map(t => [t.id,t.name]), D.timeForAp(state.ap));
      const outfit = select('gallery-outfit', '의상', D.outfits.map(o => [o.id,o.name]), 'casual');
      const accessory = select('gallery-accessory', '스타킹', [['none','스타킹 미착용']], 'none');
      const expression = select('gallery-expression', '표정', D.availableExpressions('casual').map(e => [e.id,e.name]), 'neutral');
      function refresh() {
        fill(accessory, D.accessories.filter(a => outfit.value === 'skirt' || a.id === 'none').map(a => [a.id,a.name]), accessory.value);
        accessory.disabled = outfit.value !== 'skirt';
        fill(expression, D.availableExpressions(outfit.value).map(e => [e.id,e.name]), expression.value);
        preview.style.backgroundImage = `url("${D.sceneImage(place.value, time.value)}")`;
        const img = preview.querySelector('img'); img.src = D.characterImage(outfit.value, accessory.value, expression.value);
        img.alt = `수련 · ${outfitLabel(outfit.value, accessory.value)} · ${D.expressions.find(e => e.id === expression.value).name}`;
      }
      [place,time,outfit,accessory,expression].forEach(input => input.addEventListener('change', refresh)); refresh();
      const layout = el('div', 'gallery-layout'); layout.append(preview, controls);
      body.append(layout, el('p', 'muted-note', '카페·연습실은 낮과 저녁 배경, 공연장은 공용 실내 배경을 사용해요.'), button('추억 앨범으로', 'secondary', album));
    });
  }
  function wardrobe() {
    dressingRoom();
  }
  function readMemory(m,back=album) {
    openModal('그날의 대화', body => {
      body.append(artScene(D.dates.find(d=>d.id===m.date).location,m.outfit,m.legwear,'smile',m.time));
      body.append(el('p','muted-note','회상은 자원과 진행을 바꾸지 않아요.'));
      m.choices.forEach((id,i)=> { const n=N.script('date',m.date)[i], c=n.choices.find(c=>c.id===id); body.append(el('p','story-text',n.text),el('p','story-player',c.label),el('p','story-reply',c.reply)); });
      body.append(button(back===album?'앨범으로':'탐방 수첩으로','secondary',back));
    });
  }
  function storyScene() {
    if(A.progress(state).active){activityScene();return;}
    const a=state.story.active;
    if (!a) { storyHub(); return; }
    const nodes=N.script(a.kind,a.id), step=a.choices.length, n=nodes[step];
    const title=a.kind==='date'?D.dates.find(d=>d.id===a.id).name:N.events.find(e=>e.id===a.id).title;
    openModal(title, body=> {
      body.append(el('small','story-progress',`${a.kind==='date'?'함께하는 외출':'수련의 이야기'} · ${step+1} / ${nodes.length}`));
      const layout=el('div','story-layout'), prose=el('div','story-prose');
      const expression=step ? 'smile' : ['score','boundary','repair'].includes(a.id)?'thoughtful':'neutral';
      layout.append(artScene(state.location,a.outfit,a.legwear,expression,a.time),prose); body.append(layout);
      if (step) { const prev=nodes[step-1].choices.find(c=>c.id===a.choices[step-1]); prose.append(el('p','story-player',prev.label),el('p','story-reply',prev.reply)); }
      if (!step && a.kind==='date') {
        const prev=[...state.memories].reverse().find(m=>m.choices);
        if (prev) {
          const c=N.script('date',prev.date)[0].choices.find(c=>c.id===prev.choices[0]);
          prose.append(el('p','story-recall',`“지난번엔 ${c.preference==='quiet'?'조용히 쉬는 시간을 함께했죠. 오늘도 편하게 있어요.':'서로의 하루를 이야기했죠. 오늘은 어떤 하루였는지 궁금해요.'}”`));
          if (prev.outfit===a.outfit && prev.legwear===a.legwear) prose.append(el('p','story-recall',`“${prev.day}일째에 같이 나갔던 차림이네요. 그날의 길이 생각나요.”`));
        }
        if (state.story.promise) prose.append(el('p','story-recall',a.id==='walk'?'“다음엔 강가에서 만나자고 했죠. 오늘 그 약속을 지키네요.”':'“다음 산책 약속은 기억하고 있어요. 오늘은 이곳에서 쉬어요.”'));
        if (state.story.relationship==='lovers') prose.append(el('p','story-recall','“연인이라고 모든 걸 알게 되는 건 아니네요. 오늘의 당신도 새로 알고 싶어요.”'));
        if (state.story.relationship==='friends') prose.append(el('p','story-recall','“친구라고 말하고 나니 편해졌어요. 오늘도 솔직하게 이야기해요.”'));
      }
      if (!step && a.id==='session') prose.append(el('p','story-recall',state.story.music==='now'?'접힌 악보가 펼쳐져 있습니다. 수련은 예전 곡을 지금의 호흡으로 부르기로 했습니다.':'처음 보는 악보가 놓여 있습니다. 수련은 과거의 곡 대신 오늘 고른 노래를 준비했습니다.'));
      if (!step && a.id==='epilogue') prose.append(el('p','story-recall',state.story.relationship==='lovers'?'손이 스치자 수련이 먼저 손을 내밉니다. “친구로 걷던 길을 연인으로 걸으니 조금 다르네요.”':'수련이 옆자리를 비워 둡니다. “오래된 친구에게도 처음 하는 이야기가 남아 있네요.”'));
      if(!step&&a.kind==='event'){
        const event=N.events.find(e=>e.id===a.id);
        if(event.theme){const memory=D.dates.filter(d=>d.theme===event.theme&&C.entries(state)[d.id]).at(-1);if(memory){const first=C.entries(state)[memory.id].first,chosen=N.script('date',memory.id)[1].choices.find(c=>c.id===first.choices[1]);prose.append(el('p','story-recall',`${first.day}일째 · ${memory.name}\n당신이 골랐던 말: ${chosen.label}\n수련의 대답: ${chosen.reply}`));}}
      }
      prose.append(el('p','story-text',n.text));
      const choices=el('div','story-choices');
      n.choices.forEach(c=> { const b=button(c.label,'secondary',()=> {
        const result=E.chooseStory(state,c.id,step);
        if(result.error) { toast(result.error); return; }
        state=result.state; render(); persist();
        if(state.story.active) storyScene(); else storyResult();
      }); b.dataset.storyChoice=c.id; choices.append(b); }); prose.append(choices);
      body.append(el('p','muted-note','닫아도 현재 선택은 저장됩니다. 관계와 이야기에서 이어 읽을 수 있어요. 진행 중에는 다른 활동과 다음 날 이동을 잠시 기다려 주세요.'));
      body.append(button('저장 메뉴','secondary',()=>slots('save')));
      if(a.kind==='date'&&D.dates.find(d=>d.id===a.id)?.theme)body.append(button('둘이 체험하기 · 탐색과 퍼즐','secondary',()=>activityMenu(a.id)));
    });
    // A new scene is a new reading position; announce its text, without moving to a choice.
    const text=$('modal-body').querySelector('.story-text'); text.tabIndex=-1; text.focus({preventScroll:true});
  }
  function storyResult() {
    const last=state.story.last;
    openModal('함께 남긴 한 페이지',body=> {
      body.append(el('small','story-progress',N.stage(state)));
      last.choices.forEach((id,i)=> { const c=N.script(last.kind,last.id)[i].choices.find(c=>c.id===id); body.append(el('p','story-player',c.label),el('p','story-reply',c.reply)); });
      if(last.kind==='date') body.append(el('p','story-outcome',`호감 +${last.affection} · 신뢰 +${last.trust} · 코디와 대화를 추억 앨범에 남겼어요.`));
      const course=last.kind==='date'&&D.dates.find(d=>d.id===last.id&&d.theme);
      if(course){body.append(el('p','story-outcome',`탐방 기록 · ${course.souvenir} · ${C.visited(state,course.theme)}/8곳`),button('탐방 수첩 확인','secondary',courseBook));}
      const next=N.available(state)[0];
      if(next) body.append(button(`새 이야기 · ${next.title}`,'primary',()=>beginStory(next.id)));
      body.append(button('일상으로 돌아가기','secondary',closeModal),button('관계와 이야기','secondary',storyHub));
    });
  }
  function beginStory(id) {
    const result=E.startStory(state,id);
    if(result.error) { toast(result.error); return; }
    state=result.state; render(); persist(); storyScene();
  }
  function storyHub() {
    if(state.story.active || A.progress(state).active) { storyScene(); return; }
    openModal('관계와 이야기',body=> {
      const summary=el('section','story-summary');
      summary.append(el('small','', '수련과 나'),el('h3','',N.stage(state)),el('p','',`함께한 외출 ${state.story.dateCount}회 · 지킨 산책 약속 ${state.story.keptPromises}회`));
      summary.append(el('p','',state.story.promise?'다음 산책 약속이 있어요. 무료 부두 산책으로 지킬 수 있어요. 기한은 없습니다.':'다음 약속은 외출을 마칠 때 함께 정할 수 있어요.'));
      summary.append(el('p','muted-note','Aqua Luna의 과거, 엔터테인먼트 입사 전. 당신은 수련의 친구입니다. 기본 관계 이야기는 무료 산책으로, 탐방 이야기는 서로 다른 코스를 경험하며 열려요.'));
      body.append(summary);
      body.append(button(`탐방 수첩 · ${Object.keys(C.entries(state)).length}/48곳`,'secondary',courseBook));
      const available=N.available(state);
      available.forEach(e=> { const row=el('section','story-entry'); row.append(el('h3','',e.title),el('p','',e.hint),button('이야기 읽기','primary',()=>beginStory(e.id))); body.append(row); });
      const next=N.events.find(e=>!N.done(state,e.id)&&!available.includes(e)&& !['repair','revisit'].includes(e.id));
      if (next) body.append(el('p','story-hint',`다음 단서 · ${next.hint}`));
      if(state.story.relationship==='considering') body.append(el('p','story-hint',`천천히 찾은 대답 · 데이트 ${Math.max(0,state.story.considerAt+2-state.story.dateCount)}회 뒤에 다시 이야기할 수 있어요.`));
      if(N.done(state,'epilogue')) body.append(el('p','story-outcome','두 사람의 관계를 정한 첫 장을 마쳤어요. 6개 테마를 탐방하며 입사 전 수련의 다음 이야기를 만나 보세요.'));
      const archive=el('details','story-archive'); archive.append(el('summary','',`지난 이야기 ${state.story.completed.length}편 다시 읽기`));
      state.story.completed.forEach(record=> { const event=N.events.find(e=>e.id===record.id), page=el('details'); page.append(el('summary','',`${record.day}일째 · ${event.title}`)); record.choices.forEach((id,i)=>{const n=event.nodes[i],c=n.choices.find(c=>c.id===id);page.append(el('p','story-text',n.text),el('p','story-player',c.label),el('p','story-reply',c.reply));}); archive.append(page); }); body.append(archive);
    });
  }
  function journal() {
    openModal('일상 기록', body => {
      const summary = el('div', 'journal-summary'); summary.append(el('span', '', `누적 수입 ${won(state.totalEarned)}`), el('span', '', `누적 지출 ${won(state.totalSpent)}`)); body.append(summary);
      if (!state.journal.length) body.append(el('p', 'modal-description', '아직 기록된 활동이 없어요. 오늘의 첫 활동을 골라 보세요.'));
      [...state.journal].reverse().forEach(j => { const row = el('div', 'journal-entry'); row.append(el('small', '', `${j.day}일째`)); const text = el('div', '', j.title); text.append(el('p', '', j.text)); row.append(text); if (j.money) row.append(el('span', `amount${j.money < 0 ? ' negative' : ''}`, `${j.money > 0 ? '+' : '−'}${won(Math.abs(j.money))}`)); body.append(row); });
      body.append(el('p', 'muted-note', '최근 활동 200건을 보관합니다. 누적 수입과 지출은 계속 유지됩니다.'));
    });
  }
  function exportSave() {
    try {
      const data = E.validate({ ...state, savedAt: new Date().toISOString() });
      if (!hasSession || !data) throw new Error('No valid session');
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = el('a'); a.href = url; a.download = `aqua-luna-day-${state.day}.json`; a.hidden = true; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000); toast('저장 파일 다운로드를 요청했어요. 다운로드 폴더를 확인해 주세요.');
    } catch { toast('파일을 만들지 못했어요. 현재 창을 유지한 채 다시 시도해 주세요.'); }
  }
  function slots(mode) {
    const save = mode === 'save';
    openModal(save ? '하루를 저장하기' : '기억 불러오기', body => {
      body.append(el('p', 'modal-description', '행동할 때마다 자동 저장됩니다. 수동 저장은 세 칸을 사용할 수 있어요. 브라우저 데이터를 지우기 전에는 파일로 내보내 주세요.'));
      const list = el('div', 'choice-list');
      for (let i = save ? 1 : 0; i <= 3; i++) {
        const saved = E.storage.load(i), label = i === 0 ? '자동 저장' : `기억 ${String(i).padStart(2,'0')}`;
        const slot = button('', 'save-slot', () => {
          const perform = () => { if (save) { toast(E.storage.save(i, state) ? `${label}에 저장했어요.` : '저장하지 못했어요. 파일 내보내기를 사용해 주세요.'); slots(mode); } else { const fresh = E.storage.load(i); if (!fresh) { toast('저장 데이터를 읽을 수 없어요.'); slots(mode); return; } closeModal(); begin(fresh); toast(`${label}을 불러왔어요.`); } };
          if (save && saved || !save && active) confirm(save ? '기억 덮어쓰기' : '저장된 하루로 돌아가기', save ? `${label}의 ${saved.day}일째 기록을 현재 상태로 바꿉니다.` : '현재 진행을 선택한 저장 기록으로 바꿉니다. 필요한 경우 먼저 다른 칸에 저장해 주세요.', save ? '덮어쓰기' : '불러오기', perform, () => slots(mode)); else perform();
        });
        const text = el('div'); text.append(el('strong', '', label), el('small', '', saved ? `${saved.day}일째 · ${won(saved.money)} · ${new Date(saved.savedAt).toLocaleString('ko-KR')}` : '비어 있거나 읽을 수 없는 기록')); slot.append(text, el('span', '', save ? '저장 ↗' : '불러오기 ↗')); slot.disabled = !save && !saved; list.append(slot);
      }
      body.append(list); const row = el('div', 'confirm-actions');
      if (hasSession) row.append(button('파일 내보내기', 'secondary', exportSave));
      const input = el('input'); input.type = 'file'; input.accept = '.json,application/json'; input.hidden = true;
      input.addEventListener('change', async () => {
        const file = input.files[0], revision = modalRevision; if (!file) return;
        try {
          if (file.size > 1048576) throw new Error('File too large');
          const text = await file.text();
          if (!$('modal').open || modalRevision !== revision) return;
          const loaded = E.validate(JSON.parse(text)); if (!loaded) throw new Error('Invalid save');
          confirm('저장 파일 불러오기', `${loaded.day}일째 · ${won(loaded.money)} 기록을 불러올까요?`, '불러오기', () => { begin(loaded); toast('저장 파일을 불러왔어요.'); }, () => slots(mode));
        } catch { if ($('modal').open && modalRevision === revision) toast('유효한 Aqua Luna 저장 파일이 아니에요.'); }
        finally { input.value = ''; }
      });
      row.append(button('파일 가져오기', 'secondary', () => input.click()), input); body.append(row);
    });
  }
  function activityMenu(course){
    if(A.progress(state).active){activityScene();return;}
    const item=D.dates.find(d=>d.id===course);
    openModal(`${item.name} · 둘이 체험하기`,body=>{
      body.append(el('p','modal-description','코스마다 다른 산책 지도, 음의 조각, 추억 카드가 기다려요. 3가지 체험을 네 차례, 조금씩 복잡하게 즐깁니다. 돈과 시간을 추가로 쓰지 않으며, 체험을 하지 않아도 대화와 결말은 이어갈 수 있어요.'));
      const grid=el('div','activity-levels');
      for(let level=1;level<=A.levels;level++){
        const p=A.puzzle(course,level),win=A.progress(state).wins.find(w=>w.key===p.key),reason=A.reason(state,course,level),card=el('section');
        card.append(el('small','course-tag',`${level}/12 · ${Math.floor((level-1)/3)+1}번째 모음`),el('h3','',p.name));
        if(win)card.append(el('p','',`✓ ${win.day}일째 완성${win.assisted?' · 함께 힌트를 보며':''}`));
        const b=button(win?'다시 즐기기':'함께 시작','secondary',()=>{const r=A.start(state,course,level);if(r.error){toast(r.error);return;}state=r.state;render();persist();activityScene();});b.disabled=!!reason;b.dataset.activityLevel=level;card.append(b);if(reason)card.append(el('p','muted-note',reason));grid.append(card);
      }
      body.append(grid,button(state.story.active?'대화로 돌아가기':'탐방 수첩으로','secondary',()=>state.story.active?storyScene():courseBook()));
    });
  }
  function activityAction(action,expected){
    const r=A.move(state,action,expected);if(r.error){toast(r.error);return;}
    state=r.state;render();persist();
    if(r.completed){
      const done=r.completed,p=A.puzzle(done.course,done.level);
      openModal(`${p.name} · 함께 해냈어요`,body=>{
        body.append(el('p','story-text',A.reflection(done.course,done.level)),el('p','story-outcome',`${done.level}/12번째 체험 완료${done.assisted?' · 힌트를 함께 보며 해결했어요.':''}`),el('p','muted-note',done.first?'탐방 수첩에 첫 완성 기록을 남겼어요.':'다시 즐긴 기록이에요. 처음 완성한 날은 그대로 보관합니다.'));
        if(done.level<A.levels)body.append(button('다음 체험','primary',()=>{const r=A.start(state,done.course,done.level+1);if(r.error){toast(r.error);return;}state=r.state;render();persist();activityScene();}));
        body.append(button('체험 목록으로','secondary',()=>activityMenu(done.course)),button(state.story.active?'수련과 대화 이어가기':'탐방 수첩으로','secondary',()=>state.story.active?storyScene():courseBook()));
      });
    }else if(A.progress(state).active)activityScene();else if(state.story.active)storyScene();else courseBook();
  }
  function activityScene(){
    const a=A.progress(state).active;if(!a){courseBook();return;}
    const p=A.puzzle(a.course,a.level),b=A.replay(a),step=a.moves.length,item=D.dates.find(d=>d.id===a.course);
    const oldCell=document.activeElement?.dataset?.activityCell;
    openModal(p.name,body=>{
      body.append(el('small','story-progress',`${item.name} · ${a.level}/12번째 체험`));
      const instructions=p.kind==='explore'?`둘이 그린 산책 지도예요. 네 방향으로 걸으며 ◇ 기록 ${p.treasures.length}개를 모은 뒤 출구 ⚑로 돌아오세요. 가까운 칸부터 보이고, 전체 지도를 펼쳐 길을 살펴볼 수도 있어요.`:p.kind==='music'?'빛나는 음의 조각을 모두 쉬게 해 주세요. 한 칸을 누르면 그 칸과 상하좌우의 빛이 함께 바뀝니다. 빛이 없는 칸도 누를 수 있어요. 소리를 듣지 않아도 풀 수 있습니다.':'카드를 한 장씩 뒤집어 같은 그림을 찾아 주세요. 서로 다른 두 장은 다음 카드를 고를 때 덮입니다. 제한시간은 없어요.';
      body.append(el('p','modal-description',instructions));
      const status=el('p','activity-status',p.kind==='explore'?`기록 ${b.collected.length}/${p.treasures.length} · 걸음 ${b.turns}/${p.limit} · 현재 ${Math.floor(b.pos/p.w)+1}행 ${b.pos%p.w+1}열`:p.kind==='music'?`남은 빛 ${b.board.filter(Boolean).length}개 · ${b.turns}번 선택`:`찾은 그림 ${b.matched.length/2}/${p.pairs}쌍 · ${b.turns}번 확인`);status.setAttribute('aria-live','polite');body.append(status);
      if(p.kind==='explore'){
        const map=el('div','explore-map');map.style.setProperty('--columns',p.w);map.setAttribute('role','img');map.setAttribute('aria-label',`산책 지도. 현재 ${Math.floor(b.pos/p.w)+1}행 ${b.pos%p.w+1}열, 기록 ${b.collected.length}/${p.treasures.length}. 아래 방향 버튼으로 이동합니다.`);
        function draw(reveal){map.replaceChildren();p.board.forEach((wall,i)=>{const visible=reveal||b.seen.includes(i),cell=el('span',`map-cell ${visible?(wall?'wall':'road'):'fog'}`,visible?(i===b.pos?'●':i===p.end?'⚑':p.treasures.includes(i)&&!b.collected.includes(i)?'◇':''):'');cell.setAttribute('aria-hidden','true');map.append(cell);});}
        draw(false);body.append(map);
        const reveal=el('label','map-reveal','전체 지도 펼치기'),check=el('input');check.type='checkbox';check.addEventListener('change',()=>draw(check.checked));reveal.prepend(check);body.append(reveal);
        const controls=el('div','map-controls');controls.tabIndex=0;controls.setAttribute('role','group');controls.setAttribute('aria-label','방향키 또는 WASD로 산책');
        const directions=[['위로','↑',-p.w,'up'],['왼쪽','←',-1,'left'],['아래로','↓',p.w,'down'],['오른쪽','→',1,'right']];
        directions.forEach(([name,arrow,delta,key])=>{const target=b.pos+delta,btn=button(arrow,'secondary',()=>activityAction(target,step));btn.setAttribute('aria-label',name);btn.dataset.direction=key;btn.disabled=b.turns>=p.limit||!A.neighbors(b.pos,p.w).includes(target)||p.board[target]!==0;controls.append(btn);});
        controls.addEventListener('keydown',event=>{const key=({ArrowUp:'up',w:'up',ArrowLeft:'left',a:'left',ArrowDown:'down',s:'down',ArrowRight:'right',d:'right'})[event.key];if(key){event.preventDefault();controls.querySelector(`[data-direction="${key}"]`).click();}});body.append(controls);
        if(b.turns>=p.limit)body.append(el('p','story-hint','오늘 그린 길이 너무 길어졌어요. 한 걸음 되돌리거나 처음부터 다른 길을 골라 보세요. 추가 비용은 없어요.'));
      }else{
        const grid=el('div',`activity-grid ${p.kind}`);grid.style.setProperty('--columns',p.w);const symbols=['☾','♫','✦','◇','♧','☀','♡','△','○','□','♬','❀'];
        p.board.forEach((value,i)=>{
          const matched=b.matched.includes(i),visible=p.kind==='music'||matched||b.open.includes(i),text=p.kind==='music'?(b.board[i]?'♪':'·'):visible?symbols[value]:'?';
          const cell=button(text,`puzzle-cell ${p.kind==='music'&&b.board[i]?'lit':''} ${matched?'matched':''}`,()=>activityAction(i,step));cell.dataset.activityCell=i;
          cell.disabled=matched||p.kind==='memory'&&b.open.length===1&&b.open[0]===i;
          cell.setAttribute('aria-label',p.kind==='music'?`${Math.floor(i/p.w)+1}행 ${i%p.w+1}열 ${b.board[i]?'빛나는 음':'쉬는 음'}`:`${i+1}번 카드 ${visible?symbols[value]:'뒷면'}${matched?' 맞춘 그림':''}`);
          if(p.kind==='music')cell.setAttribute('aria-pressed',String(!!b.board[i]));grid.append(cell);
        });body.append(grid);
      }
      const actions=el('div','activity-tools');
      const undo=button('한 수 되돌리기','secondary',()=>activityAction('undo',step));undo.disabled=!step;
      actions.append(undo,button('힌트 한 수','secondary',()=>activityAction('hint',step)),button('처음부터','secondary',()=>activityAction('reset',step)));body.append(actions);
      body.append(el('p','muted-note','닫거나 저장해도 현재 체험을 이어갈 수 있어요. 힌트·되돌리기·재시도는 무료입니다. 중단하면 이번 판만 초기화되며 이전 완성 기록은 남아요.'));
      body.append(button('저장 메뉴','secondary',()=>slots('save')),button('체험 중단 · 대화로 돌아가기','secondary',()=>activityAction('leave',step)));
    });
    const focus=p.kind==='explore'?dQuery('.map-controls'):dQuery(`[data-activity-cell="${oldCell||0}"]:not(:disabled)`)||dQuery('.puzzle-cell:not(:disabled)');focus?.focus({preventScroll:true});
  }
  function dQuery(selector){return $('modal-body').querySelector(selector);}
  function guide() { openModal('작은 일상을 쌓는 방법', body => { const list = el('ol', 'guide'); ['하루에 시간 3칸이 주어집니다. 일과 데이트는 시간과 기력을 사용합니다.', '일하기로 주인공의 돈을 벌어요. 급여는 활동 완료 즉시 소지금에 더해집니다.', '상점에서 의상과 스타킹을 산 뒤 수련의 옷장에서 직접 입혀 주세요. 구매는 호감을 직접 올리지 않습니다.', '데이트는 하루 한 번. 장소를 고르고 보유한 코디를 확인한 뒤 출발하세요. 추억 앨범에 그날의 모습이 남아요.', '탐방 데이트 도중 또는 탐방 수첩에서 둘이 체험하기를 여세요. 산책길 탐색·음의 조각·추억 카드가 코스마다 12단계씩 있습니다.', '체험은 선택 사항이며 추가 비용이나 시간 제한이 없습니다. 힌트와 되돌리기로 편하게 진행해도 이야기 결말에는 불이익이 없어요.', '쉬면 시간 1칸으로 기력 35를 회복합니다. 다음 날에는 시간 3칸과 기력 60을 회복합니다.', '활동은 자동 저장됩니다. 저장 메뉴에서 수동 저장과 파일 내보내기를 사용할 수 있어요.'].forEach(t => list.append(el('li', '', t))); body.append(list, el('p', 'muted-note', '관계와 이야기에서 열린 장면과 다음 단서를 확인하세요. 기본 옷과 무료 산책으로 관계를 진전할 수 있어요. 고백은 연인·우정·보류 중 직접 선택합니다.'));
    }); }
  function settings() { openModal('환경 설정', body => {
    const textLabel=el('label','settings-row','본문 글자 크기'), select=el('select'); select.id='text-size'; [['normal','기본'],['large','크게'],['largest','아주 크게']].forEach(([value,text])=>{const option=el('option','',text);option.value=value;select.append(option);}); select.value=prefs.textSize; select.addEventListener('change',()=>{prefs.textSize=select.value;savePrefs();}); textLabel.append(select); body.append(textLabel,el('p','reading-sample','선택한 하루가 차곡차곡 쌓입니다. 편안한 크기로 이야기를 읽어 보세요.'));
    [['보조 일러스트 표시', 'portrait'], ['화면 움직임 줄이기', 'reduceMotion']].forEach(([text,key]) => { const label = el('label', 'settings-row', text); const input = el('input'); input.type = 'checkbox'; input.checked = prefs[key]; input.addEventListener('change', () => { prefs[key] = input.checked; savePrefs(); }); label.append(input); body.append(label); });
    const label = el('label', 'settings-row', '배경음 크기'); const input = el('input'); input.type = 'range'; input.min = 0; input.max = 100; input.value = prefs.volume; input.setAttribute('aria-label', '배경음 크기'); input.addEventListener('input', () => { prefs.volume = Number(input.value); savePrefs(); }); label.append(input); body.append(label, el('p', 'settings-note', '상단 음표 버튼으로 배경음을 켜거나 끌 수 있어요. 음원 파일 없이 합성한 잔잔한 선율입니다.\n모든 활동은 버튼으로 선택합니다. Tab으로 이동하고 Enter로 선택하며, Esc로 창을 닫을 수 있어요.'));
    if (!active) body.append(button('저장 파일 불러오기', 'secondary', () => slots('load')));
  }); }
  function profile() { openModal('수련 · 水蓮', body => { body.append(el('p', 'profile-quote', '무대 위의 이름보다 먼저, 당신의 친구였던 수련.')); const list = el('dl', 'profile-list'); [['시점','Aqua Luna 본편 이전'],['소속','엔터테인먼트 입사 전 · 소속 없음'],['당신과의 관계','오래 알고 지낸 친구에서 시작'],['지금의 일상','동네 연습실에서 노래하며 자신의 길을 찾는 중'],['좋아하는 것','클래식, 첼로, 조용한 카페'],['성격','차분함 · 깊은 감수성 · 말보다 행동'],['호감',`${state.affection} / 100`],['신뢰',`${state.trust} / 100`],['현재 의상',D.outfits.find(o => o.id === state.outfit).name]].forEach(([k,v]) => list.append(el('dt','',k), el('dd','',v))); body.append(list, el('p','muted-note','Aqua Luna의 세계관과 수련의 기본 성격을 잇는 과거 이야기입니다. 현재 관계: ' + N.stage(state) + ' · 관계와 이야기에서 함께한 선택과 다음 단서를 확인해 보세요.')); }); }
  $('new-game').addEventListener('click', () => hasSession || E.storage.load(0) ? confirm('새로운 일상', unsaved ? '현재 저장되지 않은 진행이 있습니다. 필요한 경우 먼저 파일로 보관해 주세요. 새로 시작하면 현재 진행이 바뀝니다.' : '새로 시작하면 자동 저장 기록이 바뀝니다. 수동 저장 기록은 유지됩니다.', '새로 시작', () => begin()) : begin());
  $('continue-game').addEventListener('click', () => { const saved = hasSession ? state : E.storage.load(0); if (saved) begin(saved); else toast('불러올 수 있는 자동 저장이 없어요.'); });
  $('brand').addEventListener('click', () => { if (active) { persist(); showTitle(); } });
  $('home-button').addEventListener('click', () => { persist(); showTitle(); });
  $('sound').addEventListener('click', toggleSound); $('settings').addEventListener('click', settings); $('guide-button').addEventListener('click', guide);
  $('work-button').addEventListener('click', () => activities('work')); $('date-button').addEventListener('click', () => activities('date')); $('wardrobe-button').addEventListener('click', wardrobe); $('bond-button').addEventListener('click', profile);
  $('budget-button').addEventListener('click', budgetPlanner);
  $('shop-button').addEventListener('click', shop);
  $('album-button').addEventListener('click', album);
  $('story-button').addEventListener('click', storyHub);
  $('backup-button').addEventListener('click', exportSave);
  $('rest-button').addEventListener('click', () => doAction('rest')); $('next-day').addEventListener('click', () => state.ap ? confirm('하루 마무리', `남은 시간 ${state.ap}칸을 사용하지 않고 다음 날로 갈까요?`, '다음 날로', () => doAction('nextDay')) : doAction('nextDay'));
  $('journal-button').addEventListener('click', journal); $('save-button').addEventListener('click', () => slots('save')); $('load-button').addEventListener('click', () => slots('load')); $('close-modal').addEventListener('click', closeModal);
  $('character').addEventListener('error', () => { $('character').hidden = true; });
  showTitle();
})();
