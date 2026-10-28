/* Aqua Luna PC runtime. Story effects are committed once per saved line or choice. */
(() => {
  'use strict';
  const W = window.AquaWorld, R = window.AquaRadio, Story = window.AquaStory, Social = window.AquaSocial;
  const $ = id => document.getElementById(id);
  const SAVE_KEY = 'aqua-luna-campus-v2', PREF_KEY = `${SAVE_KEY}-prefs`;
  const CONTENT_END = '2026-06-30';
  const times = ['아침', '오후', '노을', '밤'];
  const bg = { room: '../campus-v2/room-night-v1.png', concert: 'concert.png',
    practice: 'practice-day.png', rooftop: 'rooftop-day.png', river: 'pier-evening.png',
    cafe: 'cafe-day.png', campus: '../campus-v2/campus-spring-v1.png',
    night: '../campus-v2/han-river-night-v1.png', karaoke: '../campus-v2/karaoke-v1.png',
    classroom: '../campus-v2/classroom-v1.png', library: '../campus-v2/library-v1.png',
    dining: '../campus-v2/dining-v1.png', radio: '../campus-v2/radio-v1.png' };
  const places = [
    { id: 'class', name: '강의실', desc: '복습', bg: 'classroom', energy: -8, knowledge: 2 },
    { id: 'library', name: '도서관', desc: '공부', bg: 'library', energy: -12, knowledge: 3 },
    { id: 'dining', name: '학생식당', desc: '밥 먹기', bg: 'dining', energy: 15, money: -5000 },
    { id: 'cafe', name: '강변 카페', desc: '알바하기', bg: 'cafe', energy: -22, money: 32000 },
    { id: 'club', name: '동아리방', desc: '합주 구경', bg: 'practice', energy: -10, sensitivity: 3 },
    { id: 'studio', name: '연습실', desc: '작곡하기', bg: 'practice', energy: -10, knowledge: 1, sensitivity: 2 },
    { id: 'radio', name: '방송국', desc: '방송 일 돕기', bg: 'radio', energy: -10, sensitivity: 3 },
    { id: 'roof', name: '옥상 정원', desc: '바람 쐬기', bg: 'rooftop', energy: 10 },
    { id: 'river', name: '한강변', desc: '달리기', bg: 'river', energy: -15, fitness: 3 },
    { id: 'concert', name: '공연장', desc: '공연 보기', bg: 'concert', energy: -8, sensitivity: 4, money: -12000 },
    { id: 'room', name: '내 방', desc: '쉬기', bg: 'room', energy: 30 }
  ];
  const statNames = { money: '소지금', energy: '기력', knowledge: '지식', fitness: '체력', sensitivity: '감수성' };
  let s = null, toastTimer, typingTimer, autoTimer, fullText = '', ctx, mapSelection = null;
  let prefs = { sfx: false, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    textSpeed: 26, textSize: 24, autoDelay: 2.5, showBond: false }, auto = false;
  try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch {}

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function particle(word, consonant, vowel) {
    const code = word.charCodeAt(word.length - 1) - 0xac00;
    return `${word}${code >= 0 && code <= 11171 && code % 28 !== 0 ? consonant : vowel}`;
  }
  function toast(message) {
    $('toast').textContent = message;
    $('toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3200);
  }
  function readSave(key) {
    try { return window.AquaState.restore(JSON.parse(localStorage.getItem(key))); } catch { return null; }
  }
  function saveAuto() {
    if (!s) return false;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); $('save-warning').hidden = true; return true; }
    catch { $('save-warning').hidden = false; return false; }
  }
  function pauseText() { clearTimeout(typingTimer); typingTimer = null; clearTimeout(autoTimer); }
  function modal(title, html) {
    pauseText();
    $('modal').classList.remove('calendar-modal');
    if (s?.scene && !s.scene.queue[s.scene.index]?.choice) $('line').textContent = fullText;
    $('modal-title').textContent = title;
    $('modal-content').innerHTML = html;
    if (!$('modal').open) $('modal').showModal();
  }
  function closeModal() {
    if ($('modal').open) $('modal').close();
    scheduleAuto();
  }
  function setBg(id) {
    const url = new URL(`assets/environment/${bg[id] || bg.campus}`, document.baseURI).href;
    if ($('backdrop').dataset.path !== url) {
      $('backdrop').style.backgroundImage = `url("${url}")`;
      $('backdrop').dataset.path = url;
    }
  }
  function applyPrefs() {
    document.body.classList.toggle('reduced', !!prefs.reduced);
    document.documentElement.style.setProperty('--reading-size', `${Math.max(20, Math.min(30, prefs.textSize))}px`);
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch {}
  }
  function beep() {
    if (!prefs.sfx) return;
    try {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 620;
      gain.gain.setValueAtTime(.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .08);
      osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .08);
    } catch { prefs.sfx = false; }
  }
  function updateStatus() {
    if (!s) return;
    $('date').textContent = W.dateLabel(s.date);
    $('time').textContent = times[s.slot];
    $('energy').textContent = `기력 ${s.energy}`;
    $('money').textContent = `${s.money.toLocaleString()}원`;
    $('term').textContent = W.holidays[s.date] || W.term(s.date);
  }
  function charge(values) {
    for (const key of Object.keys(statNames)) if (values[key]) s[key] = W.clamp(s[key] + values[key], key === 'money' ? 999999999 : 100);
  }
  function apply(effect) {
    if (!effect) return;
    if (effect.meet && !s.met.includes(effect.meet)) s.met.push(effect.meet);
    if (effect.flag) s.flags[effect.flag] = true;
    if (effect.card && !s.cards.includes(effect.card)) { s.cards.push(effect.card); toast(`기억을 간직했다 · ${effect.card}`); }
    if (effect.club) s.club = effect.club;
    if (effect.bond) for (const [id, amount] of Object.entries(effect.bond)) s.bond[id] = W.clamp(s.bond[id] + amount);
    if (effect.recurring) for (const [id, amount] of Object.entries(effect.recurring)) W.recurringBond(s, id, amount);
    if (effect.stats) charge(effect.stats);
    if (effect.anonymous) s.radio.anonymous = W.clamp(s.radio.anonymous + effect.anonymous);
    if (effect.clue) s.radio.clues[effect.clue] = true;
    if (effect.keptIf && s.flags[effect.keptIf]) s.flags.keptAnonymousWords = (s.flags.keptAnonymousWords || 0) + 1;
    if (effect.heardLetter) {
      R.markHeard(s, effect.heardLetter);
    }
    if (effect.talk) {
      const { id, topic } = effect.talk;
      const record = s.conversations[id] || { date: null, topics: [] };
      record.date = s.date; record.topics = [...record.topics, topic].slice(-2);
      s.conversations[id] = record;
    }
    if (effect.groupTalk) for (const id of effect.groupTalk.ids) {
      const previous = s.conversations[id]?.topics || [];
      s.conversations[id] = { date: s.date, topics: [...previous, effect.groupTalk.topic].slice(-2) };
    }
    if (effect.dateBonus && s.scene?.outing) s.scene.outing.bonus = effect.dateBonus;
    if (effect.dateMemory && s.scene?.outing) s.scene.outing.memory = effect.dateMemory;
    if (effect.attention) return Social.attention(s, effect.attention.person, effect.attention.observers);
  }

  function playScene(id, after, options = {}) {
    const data = options.data || Story.build(id, s);
    pauseText();
    s.scene = { id, after, title: data.title, background: data.background, queue: structuredClone(data.lines),
      index: 0, applied: [], logged: [], lastCast: [], pendingReward: options.reward || null,
      returnPlace: options.returnPlace || null, radioEpisode: data.radioEpisode || null, replay: !!data.replay,
      presentation: data.presentation || null, outing: options.outing || null };
    s.scene.wardrobe = Object.fromEntries(Object.keys(W.people).map(person => [person, window.AquaWardrobe.pick(s, person, s.scene)]));
    showScene();
  }
  function showScene() {
    if (!s.scene) return;
    const sc = s.scene;
    const source = window.AQUA_SCENES[sc.id];
    sc.title ||= source?.title || '우리의 이야기';
    sc.background ||= source?.background || 'room';
    sc.logged ||= []; sc.applied ||= [];
    sc.wardrobe ||= Object.fromEntries(Object.keys(W.people).map(person => [person, window.AquaWardrobe.pick(s, person, sc)]));
    if (!sc.lastCast) sc.lastCast = sc.queue.slice(0, sc.index).reverse().find(line => line.cast)?.cast || [];
    const isIntro = sc.presentation === 'intro';
    document.body.classList.remove('map-mode');
    $('title').hidden = true; $('map').hidden = true; $('scene').hidden = isIntro;
    $('intro').hidden = !isIntro; $('status').hidden = isIntro;
    document.body.classList.toggle('intro-mode', isIntro);
    setBg(sc.background); updateStatus();
    $('scene-label').textContent = `${W.dateLabel(s.date)}  ·  ${sc.title}`;
    renderLine();
  }
  function renderCast(ids, speaker) {
    const source = id => window.AquaWardrobe.source(s, id, s.scene || {});
    const current = [...$('cast').children].map(img => `${img.dataset.actor}:${img.dataset.outfit}`);
    if (current.join(',') !== ids.map(id => `${id}:${source(id)}`).join(',')) {
      $('cast').replaceChildren();
      ids.filter(id => W.people[id]).forEach(id => {
        const img = document.createElement('img');
        img.className = 'actor'; img.dataset.actor = id;
        img.src = source(id); img.dataset.outfit = source(id); img.alt = '';
        img.onerror = () => {
          if (!img.dataset.fallback) { img.dataset.fallback = 'true'; img.src = `assets/heroines/${id}-v1.png`; }
          else { img.hidden = true; toast('인물 그림을 불러오지 못했어요. 파일 구성을 확인해 주세요.'); }
        };
        $('cast').append(img);
      });
    }
    [...$('cast').children].forEach(img => img.classList.toggle('active', !!speaker?.includes(W.people[img.dataset.actor].short)));
    $('cast').dataset.count = String(ids.length);
  }
  function logLine(line) {
    const sc = s.scene;
    if (!sc.logged.includes(sc.index)) {
      s.history.push({ speaker: line.speaker === '나' ? s.name : line.speaker || '', text: line.text });
      s.history = s.history.slice(-120); sc.logged.push(sc.index);
    }
  }
  function scheduleAuto() {
    clearTimeout(autoTimer);
    if (s?.scene?.presentation === 'intro') {
      if (!$('modal').open && !document.hidden && !prefs.reduced) {
        autoTimer = setTimeout(advance, s.scene.queue[s.scene.index]?.duration || 6000);
      }
      return;
    }
    if (!auto || !s?.scene || $('modal').open || s.scene.queue[s.scene.index]?.choice || typingTimer) return;
    autoTimer = setTimeout(advance, Math.max(1.2, prefs.autoDelay) * 1000);
  }
  function typeLine(text) {
    pauseText(); fullText = text;
    if (!prefs.textSpeed || prefs.reduced) { $('line').textContent = text; scheduleAuto(); return; }
    const chars = Array.from(text); let index = 0;
    $('line').textContent = '';
    function tick() {
      index++;
      $('line').textContent = chars.slice(0, index).join('');
      if (index < chars.length) typingTimer = setTimeout(tick, 1000 / Math.max(12, prefs.textSpeed));
      else { typingTimer = null; scheduleAuto(); }
    }
    typingTimer = setTimeout(tick, 0);
  }
  function renderLine() {
    pauseText();
    const sc = s.scene, line = sc.queue[sc.index];
    if (!line) { finishScene(); return; }
    if (sc.presentation === 'intro') {
      logLine(line);
      fullText = line.text;
      $('intro-chapter').textContent = line.chapter;
      $('intro-text').textContent = line.text;
      $('intro-progress').textContent = `0${sc.index + 1} / 0${sc.queue.length}`;
      $('intro-next').textContent = sc.index === sc.queue.length - 1 ? '첫 페이지를 열기 →' : '계속 →';
      $('intro-card').dataset.beat = String(sc.index);
      // Recreate only this small text wrapper's animation, preserving focus on controls.
      if (!prefs.reduced && $('intro-card').animate) $('intro-card').animate(
        [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 900, easing: 'ease-out', fill: 'both' });
      saveAuto(); scheduleAuto(); return;
    }
    if (line.effect && !sc.applied.includes(sc.index)) { apply(line.effect); sc.applied.push(sc.index); }
    $('on-air').hidden = !line.onAir;
    $('dialogue').classList.toggle('player-line', line.speaker === '나');
    $('speaker').style.color = Object.values(W.people).find(p => p.short === line.speaker)?.color || '#c4e4e5';
    $('auto').textContent = `AUTO ${auto ? 'ON' : 'OFF'}`;
    $('auto').setAttribute('aria-pressed', String(auto));
    if (line.choice) {
      fullText = '어떻게 할까?';
      $('choices').hidden = false; $('choices').replaceChildren();
      $('speaker').textContent = '선택'; $('line').textContent = fullText; $('next').hidden = true;
      renderCast(sc.lastCast || [], null);
      line.choice.forEach((option, i) => {
        const button = document.createElement('button');
        const disabled = !Story.allowed(s, option.requires);
        button.innerHTML = `<span>0${i + 1}</span>${esc(option.label)}${disabled ? `<small>${esc(option.reason || '아직 고를 수 없는 선택입니다.')}</small>` : ''}`;
        button.disabled = disabled; button.onclick = () => choose(i); $('choices').append(button);
      });
      $('scene-progress').textContent = 'CHOICE';
    } else {
      $('choices').hidden = true; $('next').hidden = false;
      $('speaker').textContent = line.speaker === '나' ? s.name : line.speaker || '';
      $('scene-progress').textContent = sc.title;
      sc.lastCast = line.cast || [];
      renderCast(sc.lastCast, line.speaker); logLine(line); typeLine(line.text);
    }
    saveAuto();
  }
  function choose(index) {
    if (!s?.scene || $('modal').open || $('scene').hidden) return;
    const sc = s.scene, option = sc.queue[sc.index]?.choice?.[index];
    if (!option || !Story.allowed(s, option.requires)) return;
    beep();
    s.history.push({ speaker: '선택', text: option.label });
    const reactions = apply(option.effect) || [];
    sc.queue.splice(sc.index + 1, 0, ...reactions, ...(option.lines || []));
    sc.index++; renderLine();
  }
  function advance() {
    if (!s?.scene || $('modal').open || s.scene.queue[s.scene.index]?.choice) return;
    if (typingTimer) { pauseText(); $('line').textContent = fullText; scheduleAuto(); return; }
    beep(); s.scene.index++; renderLine();
  }
  function finishScene() {
    pauseText();
    const sc = s.scene;
    if (sc.pendingReward) charge(sc.pendingReward);
    if (sc.radioEpisode && !sc.replay) R.finish(s, sc.radioEpisode);
    if (!sc.replay && !s.seen.includes(sc.id) && !/^(talk|gift|date|group)-/.test(sc.id)) s.seen.push(sc.id);
    if (sc.outing) Social.finishDate(s, sc.outing);
    s.scene = null; $('cast').replaceChildren();
    $('intro').hidden = true; document.body.classList.remove('intro-mode');
    if (sc.after === 'intro') { playScene('prologue', 'prologue'); }
    else if (sc.after === 'prologue') { s.date = '2026-03-03'; s.slot = 0; prepare(); }
    else if (sc.after === 'encounter') {
      showMap(); const p = places.find(place => place.id === sc.returnPlace);
      if (p) encounterMenu(p, W.presentAt(s, p.id));
    } else if (sc.after === 'date') { s.slot = 3; prepare(); }
    else if (sc.after === 'radio' || sc.after === 'replay') showMap();
    else step();
    saveAuto();
  }

  function mandatoryAt(slot) {
    const event = s.date === '2026-03-03' && slot === 0 ? 'entrance' :
      s.date === '2026-03-05' && slot === 1 ? 'daeunMeet' :
      s.date === '2026-03-10' && slot === 1 ? 'fair' :
      s.date === '2026-04-02' && slot === 3 ? 'firstRadio' :
      s.date === '2026-05-20' && slot === 2 ? 'festival' : null;
    return event && !s.seen.includes(event) ? event : null;
  }
  function prepare() {
    const event = mandatoryAt(s.slot);
    if (event === 'firstRadio') {
      R.air(s); playScene('firstRadio', 'radio', { data: R.build(s, W.episodeOn(s.date)) }); return;
    }
    if (event) { playScene(event, 'event'); return; }
    if (s.slot === 0 && W.hasClass(s.date)) {
      charge({ knowledge: 1, energy: -5 }); s.slot = 1;
      toast('오전 수업 · 지식 +1 · 기력 −5'); prepare(); return;
    }
    if (s.slot === 3) R.air(s);
    showMap();
  }
  function step() {
    if (s.slot < 3) { s.slot++; prepare(); }
    else finishDay();
    saveAuto();
  }
  function finishDay() {
    // Finishing a day still visits its mandatory story slot before sleeping.
    for (let slot = s.slot; slot <= 3; slot++) if (mandatoryAt(slot)) { s.slot = slot; prepare(); return; }
    if (s.slot < 3) { s.slot = 3; prepare(); return; }
    R.air(s);
    if (s.date >= CONTENT_END) {
      showMap();
      modal('여름으로 이어질 이야기', '<p class="modal-text">현재 플레이 가능한 이야기는 6월 말까지입니다. 여름 이후의 루트와 결말은 제작 중입니다. 지금까지의 기록은 저장해 두고 계속 살펴볼 수 있어요.</p><button class="option-button" id="checkpoint-save">현재 기록 저장하기</button>');
      $('checkpoint-save').onclick = slots; return;
    }
    s.date = W.addDays(s.date, 1); s.slot = 0; charge({ energy: 50 });
    prepare(); saveAuto();
  }
  function possibleScene(place) {
    if (s.slot === 3) return null;
    if (!s.met.includes('nari') && s.date >= '2026-03-03' && s.date <= '2026-03-07') {
      if (place === 'class' && [2, 4].includes(W.weekday(s.date)) && s.slot === 1 && window.AquaEncounters.isAt(s, 'nari', place)) return { id: 'nariClass' };
      if (place === 'roof' && window.AquaEncounters.isAt(s, 'nari', place)) return { id: 'nariRoof' };
      if (place === 'river' && s.slot === 2 && window.AquaEncounters.isAt(s, 'nari', place)) return { id: 'nariRiver' };
    }
    if (place === 'cafe' && !s.met.includes('seojin') && s.date >= '2026-03-11' && [3, 5, 6].includes(W.weekday(s.date)) && window.AquaEncounters.isAt(s, 'seojin', place)) return { id: 'seojinMeet', work: true };
    return Story.available(s, place)[0] || null;
  }
  function canUse(p) {
    if (p.id === 'cafe' && s.date < '2026-03-11') return '첫 출근은 3월 11일부터예요';
    if (p.id === 'cafe' && ![3, 5, 6].includes(W.weekday(s.date))) return '수·금·토에 근무할 수 있어요';
    if (p.id === 'radio' && s.club !== 'radio') return '방송국 부원만 도울 수 있어요';
    if (p.energy < 0 && (s.energy < 15 || s.energy < Math.abs(p.energy))) return '기력이 부족해요';
    if (p.money < 0 && s.money < -p.money) return '소지금이 부족해요';
    return '';
  }
  function effectsLabel(p) {
    return Object.keys(statNames).filter(key => p[key]).map(key => key === 'money' ? `${p[key] > 0 ? '+' : '−'}${Math.abs(p[key]).toLocaleString()}원` : `${statNames[key]} ${p[key] > 0 ? '+' : '−'}${Math.abs(p[key])}`).join(' · ');
  }
  function showMap() {
    window.AquaEncounters.ensurePlan(s);
    pauseText(); $('title').hidden = true; $('scene').hidden = true; $('map').hidden = false;
    $('intro').hidden = true; document.body.classList.remove('intro-mode');
    document.body.classList.add('map-mode');
    $('map').dataset.slot = String(s.slot);
    $('map').dataset.weather = window.AquaEncounters.weather(s);
    $('status').hidden = false; $('cast').replaceChildren();
    setBg(s.slot === 3 ? 'room' : 'campus'); updateStatus();
    $('map-title').textContent = s.slot === 3 ? '하루의 끝' : `${times[s.slot]}, 어디로 갈까?`;
    $('map-desc').textContent = s.slot === 3 ? '내 방에서 보내는 작은 시간.' : '오늘의 남은 시간을 골라 보자.';
    $('map-weather').textContent = { clear: '맑음', cloudy: '흐림', rain: '비' }[$('map').dataset.weather];
    $('stats').innerHTML = ['knowledge', 'fitness', 'sensitivity'].map(key => `<span>${statNames[key]} <b>${s[key]}</b></span>`).join('');
    $('locations').replaceChildren();
    const list = s.slot === 3 ? [
      { id: 'letter', name: '라디오 사연', desc: s.letterDraft ? '써 두었던 초안을 이어서' : '보내지 못한 말을 적는 곳' },
      { id: 'listen', name: '아쿠아 루나', desc: radioStatus() },
      { id: 'notes', name: '나의 기록', desc: '관계 · 기억 · 멜로디 · 방송' },
      { id: 'sleep', name: '잠자기', desc: '내일로 · 기력 +50' }
    ] : places;
    list.forEach((p, index) => {
      const button = document.createElement('button'); button.className = 'location';
      button.innerHTML = `<span class="location-number">${String(index + 1).padStart(2, '0')}</span><strong>${esc(p.name)}</strong><small>${esc(p.desc)}</small><span class="location-arrow" aria-hidden="true">↗</span>`;
      button.dataset.location = p.id;
      button.setAttribute('aria-pressed', 'false');
      button.onclick = () => s.slot === 3 ? locationAction(p) : previewPlace(p); $('locations').append(button);
    });
    $('end-day').textContent = s.slot === 3 ? '잠자기 →' : '내 방으로 돌아가기 →';
    const episode = W.thisWeeksEpisode(s.date);
    $('radio-preview').textContent = episode ? `${W.dateLabel(episode.date)} · ${episode.special ? '특집' : `${episode.number}회`} · ${episode.title}` : s.date < '2026-04-02' ? '4월 2일 목요일, 첫 방송' : '방학에는 잠시 쉬어 가요';
    const selected = mapSelection?.key === `${s.date}:${s.slot}` && places.find(p => p.id === mapSelection.id);
    if (selected && s.slot !== 3) previewPlace(selected);
    else {
      mapSelection = null; $('preview-details').hidden = true; $('preview-hint').hidden = false;
      $('preview-number').textContent = s.slot === 3 ? '23:00' : 'H / Y';
      $('preview-eyebrow').textContent = s.slot === 3 ? 'A ROOM OF MY OWN' : 'HANYEOUL / AFTER CLASS';
      $('preview-title').textContent = s.slot === 3 ? '오늘도, 여기까지.' : s.slot === 1 && W.hasClass(s.date) ? '수업이 끝난 뒤' : '나에게 남은 시간';
      $('preview-desc').textContent = s.slot === 3 ? '창밖의 불빛이 하나둘 켜졌다.\n아직 잠들기엔 조금 이른 밤.' : s.slot === 1 && W.hasClass(s.date) ? '강의실 밖으로 나오자 익숙한 풍경이 조금 다르게 보였다.\n오늘은 어디에서 어떤 하루를 보내게 될까.' : '서두를 일 없이 풍경을 한 번 더 바라보았다.\n아직 정하지 않은 시간이 내 앞에 남아 있다.';
      $('preview-hint').textContent = s.slot === 3 ? '오른쪽에서 오늘의 마지막 일을 골라 보자.' : '오른쪽에서 가고 싶은 곳을 골라 보자.';
    }
    saveAuto();
  }
  function previewPlace(p) {
    if (s.scene || s.slot === 3 || $('modal').open) return;
    mapSelection = { key: `${s.date}:${s.slot}`, id: p.id };
    setBg(p.bg);
    $('preview-eyebrow').textContent = 'HANYEOUL / A PLACE FOR TODAY';
    $('preview-title').textContent = p.name;
    const descriptions = {
      class: '수업이 끝난 강의실.\n아직 정리하지 않은 악보와 조용한 오후가 남아 있다.',
      library: '책장을 넘기는 소리와 창문 너머의 빛.\n다음 페이지를 읽으며 잠깐 머물러도 좋겠다.',
      dining: '식판 부딪히는 소리, 오늘의 메뉴.\n따뜻한 밥 한 끼를 챙겨 먹을 시간이다.',
      cafe: '강변 카페 물결. 문을 열면 커피 향이 먼저 반긴다.\n일을 하거나 잠깐 쉬어 가는 익숙한 곳.',
      club: '복도 끝에서 연습하는 소리가 작게 들린다.\n문 너머의 오후는 어떤 소리일까.',
      studio: '건반 위로 빛이 내려앉은 작은 연습실.\n머릿속에 맴돌던 멜로디를 적어 보고 싶다.',
      radio: 'HYBS, 목요일 밤의 목소리가 준비되는 곳.\n낮의 방송국에는 기계 소리와 바쁜 일상이 있다.',
      roof: '계단을 끝까지 올라가면 만나는 작은 정원.\n잠깐 바람을 쐬고 내려와도 좋겠다.',
      river: '천천히 흐르는 강과 각자의 속도로 걷는 사람들.\n마음이 복잡할 땐, 일단 조금 걸어 보자.',
      concert: '무대의 불이 켜지기 전, 객석은 조용하다.\n오늘은 누군가의 음악을 들어 보고 싶다.',
      room: '아직 조금 낯설고, 이제는 조금 익숙한 내 방.\n아무 일도 하지 않는 시간도 필요하다.'
    };
    $('preview-desc').textContent = descriptions[p.id];
    $('preview-details').hidden = false; $('preview-hint').hidden = true;
    const reason = canUse(p);
    $('preview-cost').textContent = `${p.desc} · 시간 1칸\n${effectsLabel(p)}${reason ? `\n${reason}` : ''}`;
    $('preview-number').textContent = String(places.indexOf(p) + 1).padStart(2, '0');
    $('visit-label').textContent = `${p.name} 방문하기`;
    $('visit-place').onclick = () => { if (!$('modal').open && !s.scene && !$('map').hidden) locationAction(p); };
    [...$('locations').children].forEach(button => button.setAttribute('aria-pressed', String(button.dataset.location === p.id)));
  }
  function locationAction(p) {
    if (p.id === 'sleep') { finishDay(); return; }
    if (p.id === 'notes') { showNotes(); return; }
    if (p.id === 'letter') { letterMenu(); return; }
    if (p.id === 'listen') { radioMenu(); return; }
    const special = possibleScene(p.id);
    if (special) {
      if (special.work && canUse(p)) { toast(canUse(p)); return; }
      const reward = {};
      if (special.work) { charge({ energy: p.energy }); reward.money = p.money; }
      playScene(special.id, 'activity', { reward }); return;
    }
    const visitors = W.presentAt(s, p.id);
    if (visitors.length) { encounterMenu(p, visitors); return; }
    confirmActivity(p);
  }
  function confirmActivity(p) {
    if (canUse(p)) { toast(canUse(p)); return; }
    if (p.id === 'studio') { composeMenu(); return; }
    const quiet = p.id !== 'room' && !W.presentAt(s, p.id).length;
    modal(p.name, `${quiet ? '<p class="modal-text">잠깐 둘러봤지만 아는 얼굴은 보이지 않았다.</p>' : ''}<p class="modal-text">${esc(p.desc)}에 한 칸을 보냅니다.</p><p class="cost-summary">${esc(effectsLabel(p))}</p><div class="modal-actions"><button class="option-button" id="activity-cancel">돌아가기</button><button class="option-button" id="activity-confirm">시간 보내기</button></div>`);
    $('activity-cancel').onclick = closeModal;
    $('activity-confirm').onclick = () => {
      if (canUse(p)) return;
      closeModal(); charge(p); step(); toast(`${p.desc} · ${effectsLabel(p)}`);
    };
  }

  const talkTopics = ['수업', '음악', '먹는', '요즘 고민', '동네', '꿈'];
  const taste = { nari: [1, 3, 1, 2, 0, 2], daeun: [1, 2, 3, 2, 2, 1], seojin: [0, 2, 1, 3, 2, 1] };
  const talkResponses = {
    nari: [
      '과제? 여덟 마디. 아직 여덟 번쯤 지웠어. 네 건… 나중에 들려줘.',
      '노래보다 시작하기 전의 숨이 좋아. 다들 조용해지는 그 순간. …무대 얘기 너무 많이 했네.',
      '점심은 먹었어. 아니, 먹을 거야. 너는? 같이 가자는 말은 아니고. …가도 되고.',
      '말하기 전에 머릿속에서 연습해. 그럼 실제로는 말한 줄 알고 잊어버려. 웃기지.',
      '고등학교 때 살던 데? …그냥, 멀어. 오늘은 다른 얘기 하면 안 돼?',
      '내 노래로 무대를 해 보고 싶어. 노래하는 건 할 수 있는데, 내 말을 붙이는 게 어렵네.'
    ],
    daeun: [
      '출석은 내가 불러 줄게! 대신 과제는 각자. 나 믿으면 큰일 나. …출석도 가끔 큰일 나.',
      '드럼이 맨 뒤인 거 알아? 다 보이거든. 누가 딴짓하는지도. 너는 내 쪽 한 번만 봐라?',
      '떡볶이! 아니 지금 먹자는 건 아니고. …지금도 괜찮고. 네가 먼저 물어본 거다?',
      '나 요즘 말 너무 많이 하나? 아 됐어, 대답하지 마. 아니, 해 줘. 반만 진지하게.',
      '동네? 우리 동네는 골목마다 내가 별명 붙였어. 다음에 지도 그려 줄까?',
      '나중에도 합주하면 좋겠다. 그때는 입대 말고 다른 이유로도 사람이 빠지겠지? 아, 너무 멀리 갔다.'
    ],
    seojin: [
      '학교 얘기는… 잠깐 쉬는 중이라. 컵이나 한 번 더 닦자. 네 수업은 잘 듣고.',
      '마감할 때 듣는 건 좀 느린 거. 하루 종일 빠르게 움직였으니까. 다음 곡까지 듣고 가.',
      '밥은 먹었고? 커피가 밥은 아니야. 나도 알아. …그러니까 두 명분 시키자.',
      '해결해 달라는 말은 아니고, 그냥 말해 봤어. 네가 자꾸 급하게 답 안 해서 말하게 되네.',
      '강 냄새는 계절마다 달라. 조금만 더 걸으면 느껴져. 코 말고, 그냥 기분으로.',
      '지금은 내일 마감까지 생각해. 먼 얘기는 내가 먼저 할게. 그때도 들을 거지?'
    ]
  };
  function encounterMenu(p, ids) {
    if (!ids.length) { confirmActivity(p); return; }
    const buttons = ids.map(id => {
      const talked = s.conversations[id]?.date === s.date;
      const giftReason = Social.giftReason(s, id, null, p.id), canGift = Social.gifts.some(g => s.social.inventory[g.id] > 0);
      const dateReason = Social.dateReason(s, id, 'river', p.id, !!mandatoryAt(2));
      return `<article class="encounter-person" style="--person-color:${W.people[id].color}"><div class="encounter-portrait"><img src="${window.AquaWardrobe.source(s, id, { returnPlace: p.id, background: p.bg })}" alt="${W.people[id].name}"></div><div><small>${W.bondStage(s, id)}</small><h3>${W.people[id].name}</h3><p>“${esc(Social.greeting(s, id))}”</p></div><div class="encounter-actions"><button data-person="${id}" ${talked ? 'disabled' : ''}>잠깐 이야기하기<small>${talked ? '오늘의 대화 완료' : '화제 고르기 · 시간 소모 없음'}</small></button><button data-gift-person="${id}" ${giftReason || !canGift ? 'disabled' : ''}>선물 건네기<small>${esc(giftReason || (canGift ? '가방에서 고르기 · 시간 소모 없음' : '휴대폰 선물 가게에서 구입해요'))}</small></button><button data-date-person="${id}" ${dateReason ? 'disabled' : ''}>같이 시간 보내기<small>${esc(dateReason || '오후 + 노을 · 기력 −15')}</small></button></div></article>`;
    }).join('');
    const group = ids.length === 2 && ids.every(id => s.bond[id] >= (id === 'nari' ? 25 : 15) && s.conversations[id]?.date !== s.date);
    modal(p.name, `<div class="encounter-list">${buttons}</div><div class="modal-grid">${group ? '<button id="group-talk">셋이 이야기하기<small>두 사람과 같은 화제 · 시간 소모 없음</small></button>' : ''}<button id="alone" ${canUse(p) ? 'disabled' : ''}>${esc(p.desc)}<small>${esc(canUse(p) || effectsLabel(p))} · 시간 1칸</small></button><button id="cancel-action">장소 선택으로 돌아가기</button></div>`);
    $('modal-content').querySelectorAll('[data-person]').forEach(button => button.onclick = () => talkMenu(p, ids, button.dataset.person));
    $('modal-content').querySelectorAll('[data-gift-person]').forEach(button => button.onclick = () => giftMenu(p, ids, button.dataset.giftPerson));
    $('modal-content').querySelectorAll('[data-date-person]').forEach(button => button.onclick = () => dateMenu(p, ids, button.dataset.datePerson));
    if ($('group-talk')) $('group-talk').onclick = () => groupTalk(p, ids);
    $('alone').onclick = () => confirmActivity(p);
    $('cancel-action').onclick = closeModal;
    saveAuto();
  }
  function talkMenu(p, ids, id) {
    if (s.conversations[id]?.date === s.date) return;
    const previous = s.conversations[id]?.topics || [];
    const options = talkTopics.map((topic, i) => {
      let rank = taste[id][i];
      if (id === 'nari' && topic === '꿈' && s.date >= '2026-09-01') rank = 0;
      if (previous.includes(topic)) rank = Math.max(0, rank - 1);
      const delta = [-1, 1, 3, 4][rank];
      const response = previous.includes(topic) ? `${{ nari: '…그거, 지난번에도 얘기했지. ', daeun: 'ㅋㅋ 우리 이 얘기 또 한다. ', seojin: '그 얘기, 기억해. ' }[id]}${talkResponses[id][i]}` : talkResponses[id][i];
      return { label: `${topic} 이야기`, effect: { recurring: { [id]: delta }, talk: { id, topic }, attention: { person: id, observers: ids } },
        lines: [{ speaker: W.people[id].short, text: response, cast: ids },
          { text: '짧은 이야기가 끝났다. 아직 이곳에서 할 일을 고를 수 있다.', cast: ids }] };
    });
    closeModal();
    playScene(`talk-${id}`, 'encounter', { returnPlace: p.id, data: {
      title: `${particle(W.people[id].name, '과', '와')} 잠깐`, background: p.bg,
      lines: [{ speaker: W.people[id].short, text: { nari: '…무슨 얘기 할까.', daeun: '오, 너 먼저 말 거니까 좋다. 무슨 얘기?', seojin: '응. 듣고 있어.' }[id], cast: ids }, { choice: options }]
    } });
  }

  function groupTalk(p, ids) {
    if (ids.some(id => s.conversations[id]?.date === s.date)) return;
    const options = talkTopics.map((topic, i) => {
      const recurring = {};
      for (const id of ids) {
        let rank = id === 'nari' && i === 5 && s.date >= '2026-09-01' ? 0 : taste[id][i];
        if (s.conversations[id]?.topics.includes(topic)) rank = Math.max(0, rank - 1);
        recurring[id] = [-1, 1, 3, 4][rank] / 2;
      }
      const reply = ['같은 수업이어도 듣는 사람마다 남는 게 다르다는 얘기가 되었다.', '같은 곡에서 서로 다른 악기를 듣고 있었다. 다음에는 그 부분을 들어 보기로 했다.', '좋아하는 메뉴를 하나씩 적었다. 겹치는 것도, 처음 듣는 것도 있었다.', '누군가는 길게, 누군가는 한 마디로 답했다. 셋 다 서둘러 결론을 내지는 않았다.', '각자 아는 길을 이어 보니 생각보다 가까운 동네가 되었다.', '대답은 전부 달랐다. 나중에 다시 물어봐도 되는 얘기로 남겨 두었다.'][i];
      return { label: `${topic} 이야기`, effect: { recurring, groupTalk: { ids, topic } }, lines: [
        { speaker: W.people[ids[0]].short, text: talkResponses[ids[0]][i], cast: ids },
        { speaker: W.people[ids[1]].short, text: talkResponses[ids[1]][i], cast: ids }, { text: reply, cast: ids }
      ] };
    });
    closeModal(); playScene('group-talk', 'encounter', { returnPlace: p.id, data: {
      title: '셋이서 하는 얘기', background: p.bg, lines: [{ text: '누구 한 사람을 부르는 대신, 두 사람 사이에 자리를 잡았다.', cast: ids }, { choice: options }]
    } });
  }
  function shopMenu() {
    modal('작은 선물 가게', `<div class="shop-heading"><p class="modal-text">다음에 만날 때, 건네고 싶은 것.</p><b>${s.money.toLocaleString()}원</b></div><div class="shop-grid">${Social.gifts.map(g => `<button data-buy="${g.id}" ${s.money < g.price || (s.social.inventory[g.id] || 0) >= 99 ? 'disabled' : ''}><span class="gift-symbol">${g.symbol}</span><strong>${g.name}</strong><small>${g.price.toLocaleString()}원</small><em>가방에 ${s.social.inventory[g.id] || 0}개</em></button>`).join('')}</div><p class="form-note">구입은 시간을 쓰지 않습니다. 선물은 만났을 때 같은 사람에게 7일에 한 번 건넬 수 있어요.</p>`);
    $('modal-content').querySelectorAll('[data-buy]').forEach(button => button.onclick = () => {
      const item = Social.gifts.find(g => g.id === button.dataset.buy);
      modal(item.name, `<p class="modal-text">${esc(item.name)} 한 개를 가방에 넣습니다.</p><p class="cost-summary">${item.price.toLocaleString()}원 · 현재 ${s.money.toLocaleString()}원</p><div class="modal-actions"><button id="buy-cancel" class="option-button">다시 고르기</button><button id="buy-confirm" class="option-button">구입하기</button></div>`);
      let committed = false;
      $('buy-cancel').onclick = shopMenu;
      $('buy-confirm').onclick = () => {
        if (committed) return;
        const result = Social.buy(s, item.id);
        if (!result.ok) { toast(result.reason); return; }
        committed = true; saveAuto(); updateStatus(); shopMenu(); toast(`${particle(item.name, '을', '를')} 가방에 넣었다.`);
      };
    });
  }
  function giftMenu(p, ids, id) {
    const owned = Social.gifts.filter(g => s.social.inventory[g.id] > 0);
    modal(`${W.people[id].name}에게 건넬 선물`, `<p class="modal-text">가방에 담아 둔 것 중에서 골라 주세요.</p><div class="modal-grid">${owned.map(g => `<button data-give="${g.id}">${g.symbol} ${g.name}<small>${s.social.inventory[g.id]}개 보유</small></button>`).join('')}<button id="gift-back">돌아가기</button></div>`);
    $('gift-back').onclick = () => encounterMenu(p, ids);
    $('modal-content').querySelectorAll('[data-give]').forEach(button => button.onclick = () => {
      const item = Social.gifts.find(g => g.id === button.dataset.give);
      modal('작은 마음을 건네기', `<p class="letter-preview">${W.people[id].name}에게 ${particle(item.name, '을', '를')} 건넵니다.</p><p class="cost-summary">가방에서 1개 · 시간과 기력 소모 없음</p><div class="modal-actions"><button id="gift-cancel" class="option-button">다시 고르기</button><button id="gift-confirm" class="option-button">건네기</button></div>`);
      let committed = false;
      $('gift-cancel').onclick = () => giftMenu(p, ids, id);
      $('gift-confirm').onclick = () => {
        if (committed) return;
        const result = Social.give(s, id, item.id, p.id);
        if (!result.ok) { toast(result.reason); return; }
        committed = true;
        const responses = {
          nari: ['…꽃은, 시드는 걸 보면 좀 그래. 그래도 가져갈게.', '…나 주는 거야? 고마워. 잘 쓸게.', '이런 거 생각하고 골랐어? …응, 마음에 들어.', '…이거 필요했는데. 어떻게 알았어? 아, 아니. 진짜 고마워.'],
          daeun: ['앗, 이건 내가 잘 안 쓰는데… 그래도 받아 둘게. 네가 고른 거니까.', '오, 선물? 고마워! 오늘 무슨 날이야?', '이거 나 좋아하는 거잖아. 야, 너 기억력 좋다?', '헐, 내 취향 정확히 맞혔네! 나 지금 표정 관리 안 된다. ㅋㅋ.'],
          seojin: ['…이건 잘 안 쓰는데. 다음엔 네 거 사. 마음은 받았어.', '고마워. 잘 쓸게. 네 건 챙겼고?', '이런 걸 골랐네. …좋다. 고마워.', '…내가 이거 좋아하는 거, 기억했어? 오래 놔둬야겠다.']
        };
        const reactions = Social.attention(s, id, ids);
        closeModal(); playScene(`gift-${id}`, 'encounter', { returnPlace: p.id, data: { title: `손에서 손으로 · ${item.name}`, background: p.bg,
          lines: [{ text: `${particle(item.name, '을', '를')} 건넸다. ${particle(W.people[id].short, '이', '가')} 내 손과 선물을 번갈아 보았다.`, cast: ids },
            ...(result.birthday ? [{ speaker: W.people[id].short, text: '생일인 거… 기억해 줬네. 고마워.', cast: ids }] : []),
            { speaker: W.people[id].short, text: responses[id][result.rank], cast: ids }, ...reactions ] } });
      };
    });
  }
  function dateMenu(p, ids, id) {
    modal(`${particle(W.people[id].name, '과', '와')} 보낼 오후`, `<p class="modal-text">오후부터 노을까지, 둘이 함께 갑니다.</p><div class="date-options">${Social.destinations.map(d => {
      const reason = Social.dateReason(s, id, d.id, p.id, !!mandatoryAt(2));
      return `<button data-destination="${d.id}" ${reason ? 'disabled' : ''}><strong>${d.name}</strong><small>${esc(reason || d.desc)}</small><span>${d.price ? `${d.price.toLocaleString()}원` : '무료'}</span></button>`;
    }).join('')}</div><p class="cost-summary">오후 + 노을 · 기력 −15 · 장소별 비용</p><button id="date-back" class="option-button">돌아가기</button>`);
    $('date-back').onclick = () => encounterMenu(p, ids);
    $('modal-content').querySelectorAll('[data-destination]').forEach(button => button.onclick = () => {
      const d = Social.destinations.find(place => place.id === button.dataset.destination);
      modal('같이 갈까?', `<p class="letter-preview">${particle(W.people[id].name, '과', '와')} ${d.name}.<br>돌아오면 밤이 됩니다.</p><p class="cost-summary">기력 −15 · ${d.price ? `${d.price.toLocaleString()}원` : '무료'} · 오후와 노을 두 칸</p><div class="modal-actions"><button id="date-cancel" class="option-button">다시 고르기</button><button id="date-confirm" class="option-button">같이 가자고 하기</button></div>`);
      let committed = false;
      $('date-cancel').onclick = () => dateMenu(p, ids, id);
      $('date-confirm').onclick = () => {
        if (committed) return;
        const result = Social.invite(s, id, d.id, p.id, !!mandatoryAt(2));
        if (!result.ok) { saveAuto(); toast(result.reason); dateMenu(p, ids, id); return; }
        committed = true;
        const reactions = Social.attention(s, id, ids);
        const witnesses = [...new Set([1, 2].flatMap(slot => W.presentAt({ ...s, slot }, d.place)))];
        reactions.push(...Social.attention(s, id, witnesses, true));
        const data = window.AquaOutings.build(s, result.outing);
        data.lines.unshift(...reactions);
        closeModal(); playScene(`date-${id}-${d.id}`, 'date', { data, outing: result.outing });
      };
    });
  }
  function albumMenu(person = null) {
    const entries = [...s.social.album].reverse().filter(a => !person || a.person === person);
    modal('함께 보낸 날들', `<p class="modal-text">사진보다 오래 남겨 두고 싶은 말.</p><div class="album-tabs"><button data-album="all" ${!person ? 'aria-pressed="true"' : ''}>모두</button>${s.met.map(id => `<button data-album="${id}" ${person === id ? 'aria-pressed="true"' : ''}>${W.people[id].short}</button>`).join('')}</div><div class="album-grid">${entries.map(a => {
      const d = Social.destinations.find(place => place.id === a.destination);
      return `<article class="album-entry" style="--person-color:${W.people[a.person].color}"><small>${esc(W.dateLabel(a.date))} · ${d.name}</small><h3>${particle(W.people[a.person].name, '과', '와')} 보낸 오후</h3><p>“${esc(a.memory || '같이 보낸 시간을 기억해 두기로 했다.')}”</p><span>OUR DAYS · ${String(s.social.album.indexOf(a) + 1).padStart(2, '0')}</span></article>`;
    }).join('') || '<p class="modal-text">아직 함께 보낸 오후가 없습니다. 친구가 되면 만났을 때 약속을 잡아 보세요.</p>'}</div>`);
    $('modal-content').querySelectorAll('[data-album]').forEach(button => button.onclick = () => albumMenu(button.dataset.album === 'all' ? null : button.dataset.album));
  }

  function composeMenu() {
    modal('나의 멜로디 노트', `<p class="modal-text">혼자 적은 멜로디는 내 기록에 남습니다. 누군가 실제로 듣는 순간은 별개의 이야기입니다.</p><div class="form-row"><label for="mood">시작의 분위기</label><select id="mood"><option value="quiet">조용하게 시작</option><option value="bright">조금 밝게 시작</option></select></div><div class="form-row"><label for="ending">마지막 음</label><select id="ending"><option value="open">여운을 남기기</option><option value="short">짧게 마무리</option></select></div><p class="cost-summary">시간 1칸 · 기력 −10 · 감수성 +2 · 지식 +1</p><div class="modal-actions"><button class="option-button" id="compose-cancel">돌아가기</button><button class="option-button" id="compose-confirm">멜로디 기록하기</button></div>`);
    $('compose-cancel').onclick = closeModal;
    $('compose-confirm').onclick = () => {
      const place = places.find(p => p.id === 'studio');
      if (canUse(place)) return;
      s.melodies.push({ date: s.date, mood: $('mood').value, ending: $('ending').value });
      closeModal(); charge(place); step(); toast('멜로디 노트에 오늘의 곡을 남겼다.');
    };
  }
  function letterMenu() {
    const reason = R.letterReason(s), draft = s.letterDraft || { topic: R.topics[0], tone: 'honest' };
    modal('아쿠아 루나 · 사연함', `<p class="modal-text">내 이름 대신 <strong>${esc(s.nickname)}</strong>. 전송하기 전에는 고쳐 쓸 수 있습니다.</p>${reason ? `<p class="form-note">${esc(reason)}</p>` : ''}<div class="form-row"><label for="topic">사연의 주제</label><select id="topic">${R.topics.map(topic => `<option ${topic === draft.topic ? 'selected' : ''}>${topic}</option>`).join('')}</select></div><div class="form-row"><label for="tone">문장의 온도</label><select id="tone"><option value="honest" ${draft.tone === 'honest' ? 'selected' : ''}>솔직하게 쓴 문장</option><option value="plain" ${draft.tone === 'plain' ? 'selected' : ''}>지우고 다시 쓴 문장</option></select></div><blockquote class="letter-preview" id="letter-preview"></blockquote><p class="modal-text">초안을 닫아도 보관됩니다. 전송은 무료이며 밤의 남은 시간을 강제로 끝내지 않습니다.</p><div class="modal-actions"><button id="letter-cancel" class="option-button">초안 보관하고 닫기</button><button id="letter-send" class="option-button" ${reason ? 'disabled' : ''}>이 문장으로 보내기</button></div>`);
    function updateDraft() {
      s.letterDraft = R.draftFor(s, $('topic').value, $('tone').value);
      $('letter-preview').textContent = s.letterDraft.text;
      saveAuto();
    }
    updateDraft(); $('topic').onchange = updateDraft; $('tone').onchange = updateDraft;
    $('letter-cancel').onclick = closeModal;
    $('letter-send').onclick = () => {
      const result = R.send(s, s.letterDraft);
      if (!result.ok) { toast(result.reason); return; }
      closeModal(); showMap(); toast('사연을 보냈다. 이번 주 목요일 밤을 기다린다.');
    };
  }
  function radioStatus() {
    const episode = W.episodeOn(s.date);
    if (episode && s.slot === 3) return s.radio.listened.includes(episode.id) ? '오늘 방송을 들었어요 · 다시 듣기 가능' : R.isHiatus(s, episode) ? '오늘은 지난 방송 다시 듣기' : '오늘 밤 11시 · ON AIR';
    if (s.date < '2026-04-02') return '4월 2일 첫 방송 예정';
    return s.radio.listened.length ? '들은 방송 다시 듣기' : '목요일 밤, 내 방에서';
  }
  function radioMenu() {
    const today = W.episodeOn(s.date), canListen = today && s.slot === 3;
    const archive = W.broadcasts.filter(e => s.radio.listened.includes(e.id));
    modal('심야 라디오 · 아쿠아 루나', `<div class="radio-card"><span class="on-air-label">HYBS · 23:00</span><h3>${esc(radioStatus())}</h3><p>얼굴 없는 사람이 얼굴 모르는 사람들에게.</p></div><div class="modal-grid">${canListen ? `<button id="listen-today">${s.radio.listened.includes(today.id) ? '오늘 방송 다시 듣기' : R.isHiatus(s, today) ? '재방송 듣기' : '오늘 방송 듣기'}</button>` : ''}${archive.map(e => `<button data-episode="${e.id}">${e.special ? '특집' : `${e.number}회`} · ${esc(e.title)}<small>${esc(W.dateLabel(e.date))} · 다시 듣기</small></button>`).join('')}${!canListen && !archive.length ? '<p class="modal-text">아직 보관한 방송이 없습니다. 목요일 밤을 기다려 주세요.</p>' : ''}</div>`);
    if ($('listen-today')) $('listen-today').onclick = () => {
      const replay = s.radio.listened.includes(today.id);
      closeModal(); playScene(today.id, replay ? 'replay' : 'radio', { data: R.build(s, today, replay) });
    };
    $('modal-content').querySelectorAll('[data-episode]').forEach(button => button.onclick = () => {
      const episode = W.broadcasts.find(e => e.id === button.dataset.episode);
      closeModal(); playScene(episode.id, 'replay', { data: R.build(s, episode, true) });
    });
  }

  function showNotes() {
    const cards = s.cards.map(card => `<article class="memory-card"><span>✧</span><h3>${esc(card)}</h3><small>내가 직접 겪은 순간</small></article>`).join('');
    const clues = { changedVoice: '지난 시즌과 다른 목소리', pickListener: '작년의 청취자 피크', sameHabit: '동아리방에서 들은 말버릇', sameBreath: '같은 문장과 숨', thursdaySchedule: '비어 있는 목요일', thursdayRadio: '합주와 방송의 시간', fadingFlowers: '시드는 꽃다발', oneAudience: '관객 한 명', myMelody: '라디오에서 흘러나온 내 멜로디' };
    modal('나의 기록', `<div class="notes-section"><h3>우리 사이</h3>${s.met.length ? s.met.map(id => `<p class="relationship-row" style="--person-color:${W.people[id].color}"><b>${W.people[id].name}</b><span>${W.bondStage(s, id)}${prefs.showBond ? ` · ${s.bond[id]}` : ''}</span></p>`).join('') : '<p class="modal-text">아직 만난 사람이 없다.</p>'}</div><div class="notes-section"><h3>기억 ${s.cards.length}</h3><div class="memory-grid">${cards || '<p class="modal-text">아직 간직한 기억이 없다.</p>'}</div></div><div class="notes-section"><h3>나의 멜로디 노트</h3>${s.melodies.map(m => `<p class="record-row"><small>${esc(W.dateLabel(m.date))}</small>${m.mood === 'quiet' ? '조용한 시작' : '밝은 시작'} · ${m.ending === 'open' ? '대답을 기다리는 마지막 음' : '짧게 닫힌 마지막 음'}</p>`).join('') || '<p class="modal-text">아직 적은 멜로디가 없다.</p>'}</div><div class="notes-section"><h3>보낸 사연</h3>${s.letters.map(letter => `<article class="record-row"><small>${esc(W.dateLabel(letter.date))} · ${esc(letter.topic)}</small><p>${esc(letter.text || '이전 빌드에서 보낸 사연')}</p><span class="letter-state">전송 ✓ · 낭독 ${letter.read ? '✓' : '—'} · 직접 청취 ${letter.heard ? '✓' : '—'}</span></article>`).join('') || '<p class="modal-text">아직 보낸 사연이 없다.</p>'}</div><div class="notes-section"><h3>목요일의 메모</h3><p class="modal-text">끝까지 들은 정규 방송 ${s.radio.listened.length}회${prefs.showBond ? ` · 익명 마음 ${s.radio.anonymous}` : ''}</p>${Object.keys(s.radio.clues).map(key => `<p class="record-row">${esc(clues[key] || '방송에서 들은 작은 단서')}</p>`).join('') || '<p class="modal-text">아직 이어 붙이지 않은 문장들.</p>'}</div>`);
  }
  function calendarMenu(year, month) {
    const current = W.dateObject(s.date);
    year ||= current.getUTCFullYear(); month ||= current.getUTCMonth() + 1;
    const days = W.calendarMonth(year, month), offset = days[0].weekday;
    const cell = day => {
      const seenEpisode = day.episode && s.radio.listened.includes(day.episode.id);
      const birthday = Object.keys(s.social.knownBirthdays).find(id => s.social.knownBirthdays[id] && s.met.includes(id) && Social.birthdays[id] === day.date.slice(5));
      const birthdayLabel = birthday ? `${W.people[birthday].short} 생일` : '';
      const label = [day.holiday, day.event, birthdayLabel, day.episode ? `아쿠아 루나 ${seenEpisode ? '· 청취 완료' : '· 23:00'}` : null].filter(Boolean).join(' · ');
      return `<div class="calendar-day ${day.date === s.date ? 'today' : ''} ${day.holiday ? 'holiday' : ''}" aria-label="${esc(W.dateLabel(day.date) + (label ? ' · ' + label : ''))}"><b>${day.day}</b>${day.holiday ? `<small>${esc(day.holiday)}</small>` : ''}${day.event ? `<small>${esc(day.event)}</small>` : ''}${birthdayLabel ? `<small class="calendar-birthday">✧ ${birthdayLabel}</small>` : ''}${day.episode ? `<span class="calendar-radio">☾ ${seenEpisode ? '들음' : '23:00'}</span>` : ''}</div>`;
    };
    modal('나의 달력', `<div class="calendar-nav"><button id="prev-month" aria-label="이전 달" ${year === 2026 && month === 3 ? 'disabled' : ''}>←</button><h3>${year}년 ${month}월</h3><button id="next-month" aria-label="다음 달" ${year === 2027 && month === 2 ? 'disabled' : ''}>→</button></div><div class="calendar-week">${['일', '월', '화', '수', '목', '금', '토'].map(d => `<span>${d}</span>`).join('')}</div><div class="calendar-grid">${'<div class="calendar-empty"></div>'.repeat(offset)}${days.map(cell).join('')}</div><p class="modal-text">학사 일정과 방송 편성표입니다. 인물의 비밀이나 아직 알지 못한 생일은 표시하지 않습니다.</p>`);
    $('prev-month').onclick = () => calendarMenu(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1);
    $('next-month').onclick = () => calendarMenu(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1);
    $('modal').classList.add('calendar-modal');
  }
  function phoneMenu() {
    if (!s) { toast('이야기를 시작하면 휴대폰이 열려요.'); return; }
    modal('나의 작은 일상', `<p class="phone-date">${esc(W.dateLabel(s.date))} · ${esc(times[s.slot])}</p><div class="phone-app-grid"><button data-app="notes"><span>✧</span>관계와 기억</button><button data-app="calendar"><span>▦</span>달력</button><button data-app="radio"><span>☾</span>아쿠아 루나</button><button data-app="letter"><span>✉</span>사연함</button><button data-app="shop"><span>♢</span>선물 가게</button><button data-app="album"><span>▧</span>함께 보낸 날</button><button data-app="save"><span>◇</span>저장</button><button data-app="settings"><span>⚙</span>설정</button></div>`);
    const actions = { notes: showNotes, calendar: calendarMenu, radio: radioMenu, letter: letterMenu, shop: shopMenu, album: albumMenu, save: slots, settings: settingsMenu };
    $('modal-content').querySelectorAll('[data-app]').forEach(button => button.onclick = () => actions[button.dataset.app]());
  }

  function showTitle() {
    pauseText(); auto = false;
    $('intro').hidden = true; document.body.classList.remove('intro-mode');
    document.body.classList.remove('map-mode'); mapSelection = null;
    $('title').hidden = false; $('map').hidden = true; $('scene').hidden = true; $('status').hidden = true;
    $('cast').replaceChildren(); setBg('night'); $('continue').disabled = !readSave(SAVE_KEY);
  }
  function startForm() {
    modal('당신의 이름', '<p class="modal-text">한여울대학교에서 보낼 새로운 한 해. 원하는 이름을 적어 주세요.</p><label for="player-name">이름 · 최대 6자</label><input class="modal-input" id="player-name" maxlength="6" placeholder="나"><label for="nickname">라디오 별명 · 최대 10자</label><input class="modal-input" id="nickname" maxlength="10" placeholder="물고기"><button class="option-button" id="begin">이야기 시작하기 →</button>');
    $('begin').onclick = () => {
      s = window.AquaState.initial($('player-name').value.trim() || '나', $('nickname').value.trim() || '물고기');
      closeModal(); playScene('intro', 'intro');
    };
  }
  function resume(state) {
    s = state; closeModal();
    if (s.scene) showScene(); else prepare();
    saveAuto();
  }
  function slots() {
    const rows = [1, 2, 3].map(i => {
      const value = readSave(`${SAVE_KEY}-slot-${i}`);
      return `<div class="slot"><span>슬롯 ${i}<small>${value ? `${esc(W.dateLabel(value.date))} · ${esc(times[value.slot])}${value.scene ? ' · 장면 진행 중' : ''}` : '비어 있음'}</small></span><button data-save="${i}" ${s ? '' : 'disabled'}>저장</button><button data-load="${i}" ${value ? '' : 'disabled'}>불러오기</button></div>`;
    }).join('');
    modal('저장과 불러오기', `<p class="modal-text">대사와 선택지의 진행 위치까지 저장됩니다. 파일로 보관하면 다른 실행 환경에서도 가져올 수 있습니다.</p><div class="modal-grid">${rows}</div><div class="modal-actions"><button class="option-button" id="export-save" ${s ? '' : 'disabled'}>파일 내보내기</button><button class="option-button" id="import-save">파일 가져오기</button></div><input type="file" id="save-file" accept=".json,application/json" hidden>`);
    $('modal-content').querySelectorAll('[data-save]').forEach(button => button.onclick = () => {
      if (!s) return;
      try { localStorage.setItem(`${SAVE_KEY}-slot-${button.dataset.save}`, JSON.stringify(s)); slots(); toast('저장했습니다.'); }
      catch { toast('저장 공간이 부족해요. 파일 내보내기로 보관해 주세요.'); }
    });
    $('modal-content').querySelectorAll('[data-load]').forEach(button => button.onclick = () => {
      const state = readSave(`${SAVE_KEY}-slot-${button.dataset.load}`);
      if (state) { resume(state); toast('저장을 불러왔습니다.'); }
    });
    $('export-save').onclick = exportSave;
    $('import-save').onclick = () => $('save-file').click();
    $('save-file').onchange = async event => {
      const file = event.target.files[0]; if (!file) return;
      if (file.size > 2 * 1024 * 1024) { toast('저장 파일의 크기를 확인해 주세요.'); return; }
      try {
        const state = window.AquaState.restore(JSON.parse(await file.text()));
        if (!state) throw Error('Invalid save');
        resume(state); toast('파일의 진행을 불러왔습니다.');
      } catch { toast('이 빌드에서 읽을 수 있는 저장 파일이 아니에요.'); }
      finally { event.target.value = ''; }
    };
  }
  function exportSave() {
    if (!s) return;
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = `AquaLuna-${s.date}-${times[s.slot]}.json`;
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function settingsMenu() {
    modal('읽기와 연출', `<div class="form-row"><label for="text-size">대사 글자 크기</label><select id="text-size">${[20, 24, 28].map(v => `<option value="${v}" ${prefs.textSize === v ? 'selected' : ''}>${v}px</option>`).join('')}</select></div><div class="form-row"><label for="text-speed">대사가 나타나는 속도</label><select id="text-speed">${[[0, '바로 표시'], [26, '천천히'], [50, '빠르게']].map(([v, text]) => `<option value="${v}" ${prefs.textSpeed === v ? 'selected' : ''}>${text}</option>`).join('')}</select></div><div class="form-row"><label for="auto-delay">자동 진행 · 대사 표시 뒤 기다리는 시간</label><select id="auto-delay">${[1.5, 2.5, 4].map(v => `<option value="${v}" ${prefs.autoDelay === v ? 'selected' : ''}>${v}초</option>`).join('')}</select></div><div class="modal-grid"><label class="check-row"><input id="sfx-setting" type="checkbox" ${prefs.sfx ? 'checked' : ''}>선택 효과음</label><label class="check-row"><input id="motion-setting" type="checkbox" ${prefs.reduced ? 'checked' : ''}>움직임 줄이기 · 대사 바로 표시</label><label class="check-row"><input id="bond-setting" type="checkbox" ${prefs.showBond ? 'checked' : ''}>관계 노트에 마음 수치 표시</label><button id="apply-settings">설정 적용</button></div><p class="modal-text">Space / Enter · 대사 완성 또는 넘기기<br>숫자키 · 선택지 고르기 · Esc · 창 닫기</p>`);
    $('apply-settings').onclick = () => {
      prefs.textSize = Number($('text-size').value); prefs.textSpeed = Number($('text-speed').value);
      prefs.autoDelay = Number($('auto-delay').value); prefs.sfx = $('sfx-setting').checked;
      prefs.reduced = $('motion-setting').checked; prefs.showBond = $('bond-setting').checked;
      applyPrefs(); closeModal(); toast('읽기 설정을 적용했습니다.');
    };
  }
  function historyMenu() {
    if (!s) { toast('아직 읽은 대사가 없어요.'); return; }
    modal('대사 기록', `<div class="modal-body">${s.history.map(line => `<div class="history-line"><b>${esc(line.speaker)}</b>${esc(line.text)}</div>`).join('') || '아직 읽은 대사가 없습니다.'}</div>`);
  }
  $('start').onclick = startForm;
  $('continue').onclick = () => { const state = readSave(SAVE_KEY); if (state) resume(state); };
  $('next').onclick = event => { event.stopPropagation(); advance(); };
  $('dialogue').onclick = advance;
  $('intro-next').onclick = advance;
  $('intro-skip').onclick = () => {
    if (s?.scene?.presentation === 'intro' && !$('modal').open) finishScene();
  };
  $('auto').onclick = event => { event.stopPropagation(); auto = !auto; $('auto').textContent = `AUTO ${auto ? 'ON' : 'OFF'}`; $('auto').setAttribute('aria-pressed', String(auto)); scheduleAuto(); };
  $('close').onclick = closeModal;
  $('modal').addEventListener('cancel', () => { setTimeout(scheduleAuto, 0); });
  $('home').onclick = () => { saveAuto(); closeModal(); showTitle(); };
  $('save').onclick = slots; $('history').onclick = historyMenu; $('settings').onclick = settingsMenu;
  $('phone').onclick = phoneMenu; $('end-day').onclick = finishDay;
  $('backup-now').onclick = exportSave;
  document.addEventListener('keydown', event => {
    if ($('modal').open || !s?.scene || ($('scene').hidden && $('intro').hidden) || event.target.closest('input, select, textarea')) return;
    if (event.repeat) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); advance(); }
    else if (/^[1-6]$/.test(event.key)) { event.preventDefault(); choose(Number(event.key) - 1); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pauseText(); if (s?.scene) $('line').textContent = fullText; saveAuto(); }
    else scheduleAuto();
  });
  applyPrefs(); showTitle();
})();
