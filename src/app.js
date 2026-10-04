(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const D = window.LunaData, E = window.LunaEngine;
  const won = amount => `${amount.toLocaleString('ko-KR')}원`;
  const el = (tag, className, text) => { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; };
  const button = (label, className, action) => { const b = el('button', className, label); b.addEventListener('click', action); return b; };
  let state = E.makeState(), active = false, hasSession = false, unsaved = false, toastTimer, lastFocus, modalRevision = 0;
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
    active = false; $('game').className = 'game title-mode'; applyPrefs(); $('title-screen').hidden = false; $('title-caption').hidden = false; $('title-footer').hidden = false; $('play-screen').hidden = true;
    const saved = hasSession ? state : E.storage.load(0); $('continue-game').disabled = !saved; $('continue-note').textContent = saved ? `${saved.day}일째 · ${won(saved.money)}${unsaved ? ' · 저장 필요' : ''}` : '아직 저장된 하루가 없어요';
  }
  function begin(loaded) {
    state = loaded || E.makeState(); active = true; hasSession = true; $('game').className = 'game play-mode'; applyPrefs(); $('title-screen').hidden = true; $('title-caption').hidden = true; $('title-footer').hidden = true; $('play-screen').hidden = false;
    render(); persist(); $('work-button').focus({ preventScroll: true });
  }
  function render() {
    $('day-number').textContent = String(state.day).padStart(2, '0'); $('log-day').textContent = String(state.day).padStart(2, '0');
    $('weekday').textContent = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일'][(state.day - 1) % 7];
    $('money').replaceChildren(document.createTextNode(state.money.toLocaleString('ko-KR')), el('small', '', '원'));
    $('ap').textContent = '◆ '.repeat(state.ap) + '◇ '.repeat(3 - state.ap); $('ap').setAttribute('aria-label', `남은 시간 ${state.ap}칸`);
    $('energy-number').textContent = state.energy; $('energy-bar').style.width = `${state.energy}%`; $('affection').textContent = state.affection; $('trust').textContent = state.trust;
    $('equipped-name').textContent = D.outfits.find(o => o.id === state.outfit).name;
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
      const actions=el('div','confirm-actions'); actions.append(button('돌아가기','secondary',()=>type==='buy'?wardrobe():activities(type)),button(type==='buy'?'구매하기':type==='work'?'일 시작하기':'데이트 진행','primary',()=>doAction(type,item.id,type==='buy'))); body.append(actions);
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
        const actions=el('div','budget-controls'); const go=button(state.expenseGoal.type==='buy'?'옷장 열기':'데이트 살펴보기','primary',()=>state.expenseGoal.type==='buy'?wardrobe():activities('date')); actions.append(go,button('목표 해제','secondary',()=>setExpenseGoal(null))); panel.append(actions); body.append(panel);
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
      body.append(el('p', 'modal-description', work ? `주인공이 직접 일해서 돈을 벌어요. 현재 ${won(state.money)} · 남은 시간 ${state.ap}칸 · 기력 ${state.energy}` : '하루 한 번, 함께할 시간을 선택하세요. 지금은 비용과 관계 변화만 체험할 수 있으며, 대사와 사건은 추후 함께 정합니다.'));
      const list = el('div', 'choice-list');
      (work ? D.jobs : D.dates).forEach(item => {
        const row = el('article', 'activity-card'); row.append(el('span', 'card-icon', item.icon));
        const copy = el('div'); copy.append(el('h3', '', item.name), el('p', '', item.description));
        const costs = el('div', 'costs'); costs.append(el('span', '', `시간 ${item.ap}칸`), el('span', '', `기력 −${item.energy}`));
        if (!work) costs.append(el('span', '', `호감 +${Math.min(100-state.affection,item.affection)} · 신뢰 +${Math.min(100-state.trust,item.trust)}`)); copy.append(costs); row.append(copy);
        const action = el('div', 'card-action'); const reason = E.reason(state, type, item.id);
        const b = button(work ? `+${won(item.pay)} · 일하기` : item.cost ? `${won(item.cost)} · 초대` : '무료 · 함께 걷기', 'primary', () => confirmActivity(type,item));
        b.disabled = !!reason; b.dataset.actionId = item.id; action.append(b); if (reason) action.append(el('span', 'blocked-reason', reason)); row.append(action); list.append(row);
      }); body.append(list);
    });
  }
  function wardrobe() {
    openModal('수련의 옷장', body => {
      body.append(el('p', 'modal-description', `현재 소지금 ${won(state.money)}. 의상은 한 번 구매하면 계속 보유하며, 갈아입는 데 시간이나 비용이 들지 않아요.`));
      const grid = el('div', 'wardrobe-grid');
      D.outfits.forEach(o => {
        const owned = state.owned.includes(o.id), equipped = state.outfit === o.id, type = owned ? 'equip' : 'buy'; const reason = E.reason(state, type, o.id);
        const card = el('article', `outfit-card${equipped ? ' equipped' : ''}`); card.style.setProperty('--swatch', o.color);
        card.append(el('span', 'outfit-tag', equipped ? '지금 착용 중' : owned ? '보유 중' : 'NEW OUTFIT'), el('div', 'swatch'), el('h3', '', o.name), el('p', '', o.description));
        const b = button(equipped ? '착용 중' : owned ? '갈아입기' : `${won(o.cost)} · 구매`, 'primary', () => owned ? doAction('equip', o.id, true) : confirmActivity('buy',o));
        b.disabled = !!reason; b.dataset.outfitId = o.id; card.append(b); if (reason && !equipped) card.append(el('span', 'blocked-reason', reason)); grid.append(card);
      }); body.append(grid, el('p', 'muted-note', '텍스트형 게임: 착용 상태는 이름과 설명으로 표시됩니다. 보조 일러스트는 기본 사복 참고 이미지입니다. 의상 구매만으로 호감이 상승하지는 않습니다.'));
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
          if (file.size > 256000) throw new Error('File too large');
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
  function guide() { openModal('작은 일상을 쌓는 방법', body => { const list = el('ol', 'guide'); ['하루에 시간 3칸이 주어집니다. 일과 데이트는 시간과 기력을 사용합니다.', '일하기로 주인공의 돈을 벌어요. 급여는 활동 완료 즉시 소지금에 더해집니다.', '수련의 옷장에서 의상을 구매하고 착용할 수 있어요. 구매는 호감을 직접 올리지 않습니다.', '데이트는 하루 한 번. 무료 산책부터 유료 카페와 공연까지, 비용과 신뢰 조건을 확인하세요.', '쉬면 시간 1칸으로 기력 35를 회복합니다. 다음 날에는 시간 3칸과 기력 60을 회복합니다.', '활동은 자동 저장됩니다. 저장 메뉴에서 수동 저장과 파일 내보내기를 사용할 수 있어요.'].forEach(t => list.append(el('li', '', t))); body.append(list, el('p', 'muted-note', '시스템 체험판입니다. 직업 종류, 금액, 능력치와 제목은 임시이며, 스토리·대사·이벤트·엔딩은 사용자와 논의 후 추가합니다.'));
    }); }
  function settings() { openModal('환경 설정', body => {
    const textLabel=el('label','settings-row','본문 글자 크기'), select=el('select'); select.id='text-size'; [['normal','기본'],['large','크게'],['largest','아주 크게']].forEach(([value,text])=>{const option=el('option','',text);option.value=value;select.append(option);}); select.value=prefs.textSize; select.addEventListener('change',()=>{prefs.textSize=select.value;savePrefs();}); textLabel.append(select); body.append(textLabel,el('p','reading-sample','선택한 하루가 차곡차곡 쌓입니다. 편안한 크기로 이야기를 읽어 보세요.'));
    [['보조 일러스트 표시', 'portrait'], ['화면 움직임 줄이기', 'reduceMotion']].forEach(([text,key]) => { const label = el('label', 'settings-row', text); const input = el('input'); input.type = 'checkbox'; input.checked = prefs[key]; input.addEventListener('change', () => { prefs[key] = input.checked; savePrefs(); }); label.append(input); body.append(label); });
    const label = el('label', 'settings-row', '배경음 크기'); const input = el('input'); input.type = 'range'; input.min = 0; input.max = 100; input.value = prefs.volume; input.setAttribute('aria-label', '배경음 크기'); input.addEventListener('input', () => { prefs.volume = Number(input.value); savePrefs(); }); label.append(input); body.append(label, el('p', 'settings-note', '상단 음표 버튼으로 배경음을 켜거나 끌 수 있어요. 음원 파일 없이 합성한 잔잔한 선율입니다.\n모든 활동은 버튼으로 선택합니다. Tab으로 이동하고 Enter로 선택하며, Esc로 창을 닫을 수 있어요.'));
    if (!active) body.append(button('저장 파일 불러오기', 'secondary', () => slots('load')));
  }); }
  function profile() { openModal('수련 · 水蓮', body => { body.append(el('p', 'profile-quote', '조용하지만, 분명하게 자리를 지키는 사람.')); const list = el('dl', 'profile-list'); [['소속','Aqua Luna · Ansiro Entertainment'],['포지션','리더 / 서브보컬'],['좋아하는 것','클래식, 첼로, 조용한 카페'],['성격','차분함 · 깊은 감수성 · 말보다 행동'],['호감',`${state.affection} / 100`],['신뢰',`${state.trust} / 100`],['현재 의상',D.outfits.find(o => o.id === state.outfit).name]].forEach(([k,v]) => list.append(el('dt','',k), el('dd','',v))); body.append(list, el('p','muted-note','캐릭터 정보는 원본 GDD를 참조했습니다. 관계 단계와 시나리오 해금 조건은 함께 기획할 예정입니다.')); }); }
  $('new-game').addEventListener('click', () => hasSession || E.storage.load(0) ? confirm('새로운 일상', unsaved ? '현재 저장되지 않은 진행이 있습니다. 필요한 경우 먼저 파일로 보관해 주세요. 새로 시작하면 현재 진행이 바뀝니다.' : '새로 시작하면 자동 저장 기록이 바뀝니다. 수동 저장 기록은 유지됩니다.', '새로 시작', () => begin()) : begin());
  $('continue-game').addEventListener('click', () => { const saved = hasSession ? state : E.storage.load(0); if (saved) begin(saved); else toast('불러올 수 있는 자동 저장이 없어요.'); });
  $('brand').addEventListener('click', () => { if (active) { persist(); showTitle(); } });
  $('home-button').addEventListener('click', () => { persist(); showTitle(); });
  $('sound').addEventListener('click', toggleSound); $('settings').addEventListener('click', settings); $('guide-button').addEventListener('click', guide);
  $('work-button').addEventListener('click', () => activities('work')); $('date-button').addEventListener('click', () => activities('date')); $('wardrobe-button').addEventListener('click', wardrobe); $('bond-button').addEventListener('click', profile);
  $('budget-button').addEventListener('click', budgetPlanner);
  $('backup-button').addEventListener('click', exportSave);
  $('rest-button').addEventListener('click', () => doAction('rest')); $('next-day').addEventListener('click', () => state.ap ? confirm('하루 마무리', `남은 시간 ${state.ap}칸을 사용하지 않고 다음 날로 갈까요?`, '다음 날로', () => doAction('nextDay')) : doAction('nextDay'));
  $('journal-button').addEventListener('click', journal); $('save-button').addEventListener('click', () => slots('save')); $('load-button').addEventListener('click', () => slots('load')); $('close-modal').addEventListener('click', closeModal);
  $('character').addEventListener('error', () => { $('character').hidden = true; });
  showTitle();
})();
