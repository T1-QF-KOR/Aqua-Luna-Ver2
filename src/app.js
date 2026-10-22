(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const D = window.LunaData, E = window.LunaEngine, N = window.LunaStory, C = window.LunaCourses, A = window.LunaActivities;
  const won = amount => `${amount.toLocaleString('ko-KR')}원`;
  const el = (tag, className, text) => { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; };
  const button = (label, className, action) => { const b = el('button', className, label); b.addEventListener('click', action); return b; };
  let state = E.makeState(), active = false, hasSession = false, unsaved = false, toastTimer, lastFocus, modalRevision = 0;
  let shopCategory = 'all';
  let disposeWork = () => {};
  function stopWorkPresentation() { disposeWork(); disposeWork = () => {}; }
  let choosing = true, reveal = null, touches = 0, touchDay = 0, bondShown = 0, storyLog = [], logged = new WeakSet();
  let courseTheme = 'all', courseStatus = 'all', courseSearch = '';
  const storedPrefs = E.storage.read('prefs', {});
  const prefs = { portrait: storedPrefs?.portrait !== false, reduceMotion: storedPrefs?.reduceMotion === true, textSize: ['normal','large','largest'].includes(storedPrefs?.textSize) ? storedPrefs.textSize : 'normal', volume: Number.isFinite(storedPrefs?.volume) ? Math.max(0, Math.min(100, storedPrefs.volume)) : 25, introAuto: storedPrefs?.introAuto !== false, sfx: storedPrefs?.sfx !== false, blip: storedPrefs?.blip !== false, autoSpeed: ['slow','normal','fast'].includes(storedPrefs?.autoSpeed) ? storedPrefs.autoSpeed : 'normal', boxAlpha: Number.isFinite(storedPrefs?.boxAlpha) ? Math.max(40, Math.min(100, storedPrefs.boxAlpha)) : 88 };
  const autoPace = ms => ms * { slow: 1.6, normal: 1, fast: .55 }[prefs.autoSpeed];
  let audioContext, audioGain, musicTimer, soundOn = false, noteIndex = 0;
  function toast(text) { clearTimeout(toastTimer); ($('modal').open ? $('modal') : $('game')).append($('toast')); $('toast').textContent = text; $('toast').hidden = false; toastTimer = setTimeout(() => $('toast').hidden = true, 3600); }
  function applyPrefs() { $('game').classList.toggle('portrait-off', !prefs.portrait); $('game').classList.toggle('reduced-motion', prefs.reduceMotion); $('game').dataset.textSize = prefs.textSize; document.documentElement.style.setProperty('--vn-box', `rgba(11,22,34,${prefs.boxAlpha / 100})`); if (audioGain && audioContext) audioGain.gain.setTargetAtTime(prefs.volume / 100 * .13, audioContext.currentTime, .2); }
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
  // Small synthesized effects on their own context, so the music toggle never mutes them.
  let sfxContext, lastBlip = 0;
  function sfx(kind) {
    if (!prefs.sfx || !prefs.volume || document.hidden) return;
    try {
      if (!sfxContext) sfxContext = new (window.AudioContext || window.webkitAudioContext)();
      if (sfxContext.state === 'suspended') sfxContext.resume();
      const c = sfxContext, t = c.currentTime, out = c.createGain(); out.gain.value = prefs.volume / 100; out.connect(c.destination);
      const tone = (freq, start, dur, peak, type = 'sine') => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0, t + start); g.gain.linearRampToValueAtTime(peak, t + start + .012); g.gain.exponentialRampToValueAtTime(.0001, t + start + dur); o.connect(g); g.connect(out); o.start(t + start); o.stop(t + start + dur + .05); };
      const noise = (dur, peak, freq) => { const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); n.buffer = b; f.type = 'lowpass'; f.frequency.value = freq; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur); n.connect(f); f.connect(g); g.connect(out); n.start(t); };
      if (kind === 'blip') { if (performance.now() - lastBlip < 60) return; lastBlip = performance.now(); tone(1250 + Math.random() * 120, 0, .035, .035, 'triangle'); }
      else if (kind === 'select') { tone(660, 0, .09, .08); tone(990, .06, .14, .07); }
      else if (kind === 'heart') { [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, i * .07, .5, .09)); }
      else if (kind === 'trust') { tone(784, 0, .4, .08); tone(1175, .1, .5, .07); }
      else if (kind === 'phone') { tone(1568, 0, .12, .1); tone(2093, .13, .22, .1); }
      else if (kind === 'chord') { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * .05, 2.2, .06)); }
      else if (kind === 'bell') { tone(2637, 0, .6, .05); tone(3136, .09, .7, .04); }
      else if (kind === 'wind') noise(2.4, .05, 500);
      else if (kind === 'page') noise(.25, .06, 2500);
    } catch { /* audio is optional */ }
  }
  document.addEventListener('visibilitychange', async () => { if (audioContext && soundOn) { try { if (document.hidden) await audioContext.suspend(); else await audioContext.resume(); } catch { /* Next explicit toggle can recover audio. */ } } });
  function warnBeforeExit(event) { if (unsaved) { event.preventDefault(); event.returnValue = ''; } }
  const legacyEndings = () => E.legacyList(E.storage.read('legacy', {})?.endings);
  function persist() {
    // An ending reached in this run is remembered outside the save slots for the next new game.
    const end = E.ending(state), known = end ? legacyEndings() : [];
    if (end && !known.includes(end)) E.storage.write('legacy', { endings: E.legacyList([...known, end]) });
    unsaved = !E.storage.save(0, state);
    $('save-status').hidden = !unsaved;
    if (unsaved) window.addEventListener('beforeunload', warnBeforeExit);
    else window.removeEventListener('beforeunload', warnBeforeExit);
    return !unsaved;
  }
  function showTitle() {
    showScene('pier', 'casual', 'none', 'night', 'none');
    stopCinema(); closePhone(); active = false; $('game').className = 'game title-mode'; applyPrefs(); $('title-screen').hidden = false; $('title-caption').hidden = false; $('title-footer').hidden = false; $('play-screen').hidden = true; $('intro-screen').hidden = true;
    const legacy = legacyEndings().map(k => E.legacyBonus[k].name);
    $('title-screen').querySelector('.chapter-preview').replaceChildren(el('span', '', '☾'), document.createTextNode(legacy.length ? ` 회차 보너스 준비 · ${legacy.join(' · ')} — 새로운 일상에 적용돼요` : ' 새로운 일상 · 우리가 친구가 되기까지'));
    const saved = hasSession ? state : E.storage.load(0); $('continue-game').disabled = !saved; $('continue-note').textContent = saved ? `${E.introPending(saved) ? `인트로 ${saved.intro.step + 1}/${N.intro.length}` : `${saved.day}일째 · ${won(saved.money)}`}${unsaved ? ' · 저장 필요' : ''}` : '아직 저장된 하루가 없어요';
  }
  function begin(loaded) {
    state = loaded || E.makeState({ intro: true, legacy: legacyEndings() }); active = true; hasSession = true; $('game').className = 'game play-mode'; applyPrefs(); $('title-screen').hidden = true; $('title-caption').hidden = true; $('title-footer').hidden = true; $('play-screen').hidden = false;
    bondShown = N.bondLevel(state); render(); persist();
    if (E.introPending(state)) return;
    setChoosing(true);
    $('work-button').focus({ preventScroll: true });
    if (state.story.active || A.progress(state).active) storyScene();
  }
  // Cinematic prologue: every memory gets its own backdrop (crossfade + slow camera drift), a chapter card,
  // and film subtitles that type in and move on by themselves. Click / SPACE hurries along; page logic is unchanged.
  const introScenes = [
    { bg: ['sulien-room'], tint: 'winter' }, { bg: ['practice-day'], tint: 'memory' }, { bg: ['rooftop-day', 'rooftop'], tint: 'dusk' },
    { bg: ['cafe-day', 'pier-afternoon', 'pier-evening'], tint: 'memory' }, { bg: ['practice-day'], tint: 'present' }
  ];
  const cine = { step: -1, timer: 0, layer: 0, bg: '', card: false, typingUntil: 0 };
  const lineChars = line => line.querySelectorAll('.ch').length;
  function typeset(p, text) { [...text].forEach((c, i) => { const ch = el('span', 'ch', c); ch.style.setProperty('--i', i); p.append(ch); }); return p; }
  function stopCinema() { clearTimeout(cine.timer); cine.step = -1; cine.card = false; $('game').classList.remove('cine-carding'); }
  function cineArm(delay) {
    clearTimeout(cine.timer);
    if (!prefs.introAuto) return;
    cine.timer = setTimeout(function tick() {
      if ($('intro-screen').hidden) return;
      if ($('modal').open || document.hidden) { cine.timer = setTimeout(tick, 800); return; }
      advanceReveal();
    }, autoPace(delay));
  }
  function cineBackdrop(name) {
    if (cine.bg === name) return;
    cine.bg = name; cine.layer ^= 1;
    const layers = $('intro-screen').querySelectorAll('.cine-layer'), next = layers[cine.layer], prev = layers[cine.layer ^ 1];
    next.style.backgroundImage = `url("assets/environment/${name}.png")`;
    next.classList.remove('on', 'drift-a', 'drift-b'); void next.offsetWidth;
    next.classList.add('on', cine.step % 2 ? 'drift-a' : 'drift-b'); prev.classList.remove('on');
  }
  function cineLine() {
    const r = reveal; if (!r || r.box !== $('intro-lines')) return;
    const scene = introScenes[cine.step] || introScenes[0], line = r.lines[r.index];
    cineBackdrop(scene.bg[Math.min(scene.bg.length - 1, Math.floor(r.index * scene.bg.length / r.lines.length))]);
    if (cine.card) return;
    const chars = lineChars(line), typing = prefs.reduceMotion ? 0 : chars * 38;
    line.classList.toggle('typed', !typing);
    cine.typingUntil = Date.now() + typing;
    cineArm(typing + 1700 + chars * 45);
  }
  function endCard() {
    cine.card = false; $('game').classList.remove('cine-carding');
    const line = reveal?.lines[reveal.index]; if (line) { line.classList.remove('typed'); line.style.display = 'none'; void line.offsetWidth; line.style.display = ''; }
    cineLine();
  }
  function cineHurry() {
    if (!reveal || reveal.box !== $('intro-lines')) return false;
    if (cine.card) { clearTimeout(cine.timer); endCard(); return true; }
    const line = reveal.lines[reveal.index];
    if (Date.now() < cine.typingUntil && !line.classList.contains('typed')) { line.classList.add('typed'); cine.typingUntil = 0; cineArm(1500 + lineChars(line) * 40); return true; }
    return false;
  }
  function introScene() {
    const step = state.intro.step, page = N.intro[step];
    $('game').className = 'game intro-mode'; applyPrefs();
    $('play-screen').hidden = true; $('intro-screen').hidden = false;
    if (cine.step === step) return;
    cine.step = step;
    $('intro-time').textContent = page.time; $('intro-title').textContent = page.title;
    $('intro-card-time').textContent = page.time; $('intro-card-title').textContent = page.title;
    $('intro-card-number').textContent = step === N.intro.length - 1 ? 'NOW' : `MEMORY ${String(step + 1).padStart(2,'0')}`;
    const scene = introScenes[step] || introScenes[0];
    $('intro-screen').dataset.tint = scene.tint;
    $('intro-lines').replaceChildren();
    page.lines.forEach(([speaker, text]) => {
      const who = speaker.replace('플레이어', '나');
      if (speaker) { const line = el('div', `intro-dialogue${speaker.includes('메시지') ? ' cine-msg' : ''}${speaker.startsWith('플레이어') ? ' mine' : ''}`); line.dataset.speaker = who; line.append(el('small', '', who), typeset(el('p', 'intro-line'), text)); $('intro-lines').append(line); }
      else $('intro-lines').append(typeset(el('p', 'intro-line narration'), text));
    });
    startReveal($('intro-lines'), [...$('intro-lines').children], $('intro-speaker'), () => $('intro-next').click());
    reveal.onShow = cineLine; reveal.hurry = cineHurry;
    $('intro-progress').textContent = `${String(step + 1).padStart(2,'0')} / ${String(N.intro.length).padStart(2,'0')}`;
    $('intro-previous').disabled = step === 0;
    $('intro-next').textContent = step === N.intro.length - 1 ? '일상 시작하기 →' : '다음 장면 →';
    $('intro-previous').onclick = () => introMove(step, 'previous');
    $('intro-next').onclick = () => introMove(step, 'next');
    $('intro-skip').onclick = () => introMove(step, 'skip');
    const path = D.characterImage('casual', 'none', page.expression, 'none');
    if ($('character').getAttribute('src') !== path) { $('character').hidden = false; $('character').src = path; }
    $('character').alt = '대학 시절의 수련';
    $('character').classList.remove('cine-enter'); void $('character').offsetWidth; $('character').classList.add('cine-enter');
    cine.card = !prefs.reduceMotion; $('game').classList.toggle('cine-carding', cine.card);
    $('intro-card').classList.remove('show'); void $('intro-card').offsetWidth; $('intro-card').classList.toggle('show', cine.card);
    cineLine();
    if (cine.card) { clearTimeout(cine.timer); cine.timer = setTimeout(endCard, step === 0 ? 3400 : 2600); }
    $('intro-title').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  function introMove(step, action) {
    const result = E.moveIntro(state, step, action);
    if (result.error) return;
    state = result.state; render(); persist();
    if (!E.introPending(state)) { setChoosing(true); $('story-button').focus({ preventScroll: true }); }
    if (result.result?.legacy) toast(`지난 회차의 선물 · ${result.result.legacy.join(' · ')} 보너스를 받았어요.`);
  }
  function render() {
    if (E.introPending(state)) { introScene(); return; }
    stopCinema();
    $('intro-screen').hidden = true; $('play-screen').hidden = false;
    $('game').className = 'game play-mode'; applyPrefs();
    showScene(state.location, state.outfit, state.legwear);
    $('day-number').textContent = String(state.day).padStart(2, '0'); $('log-day').textContent = String(state.day).padStart(2, '0');
    const cal = D.calendar(state.day); $('weekday').textContent = `${cal.label} · ${cal.termLabel}${cal.term && cal.event && cal.event.id !== 'start' ? ' · ' + cal.event.name : ''}${cal.birthday ? ' · 수련의 생일' : ''}`;
    $('money').replaceChildren(document.createTextNode(state.money.toLocaleString('ko-KR')), el('small', '', '원'));
    $('ap').textContent = '◆ '.repeat(state.ap) + '◇ '.repeat(3 - state.ap); $('ap').setAttribute('aria-label', `남은 시간 ${state.ap}칸`);
    $('energy-number').textContent = state.energy; $('energy-bar').style.width = `${state.energy}%`; $('affection').textContent = state.affection; $('trust').textContent = state.trust;
    $('equipped-name').textContent = `${outfitLabel(state.outfit, state.legwear)} · 헤드셋 ${state.neckAccessory === 'headset' ? '착용' : '미착용'}`;
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
    const time = D.timeForAp(state.ap), today = recent.at(-1);
    $('speaker').textContent = today ? 'SYSTEM' : '수련';
    $('dialogue-sub').textContent = `${D.locations[state.location].name} · DAY ${state.day} · ${timeLabel(time)}`;
    const apart = state.story.lastMet !== undefined ? state.day - state.story.lastMet : 0;
    if (!today) { $('message-title').textContent = `DAY ${state.day}`; $('message-text').textContent = D.calendar(state.day).birthday && N.done(state, 'hello') ? N.messageText(state, N.birthdayGreeting) : apart >= 3 ? N.messageText(state, N.reunionLines[state.day % N.reunionLines.length]) : greeting(time); }
    $('sulien-status').textContent = `수련 · ${N.doing[state.location]?.[time] || '오늘을 보내는 중'} · ${N.moodLabel(state.growth.mood)}`;
    $('affection').closest('.bond-detail').dataset.level = `인연 Lv.${N.bondLevel(state)}`;
    const level = N.bondLevel(state);
    if (bondShown && level > bondShown && !$('modal').open) { bondShown = level; setTimeout(() => stageCard(`인연 Lv.${level}`, 'BOND'), 400); } else if (!bondShown || level < bondShown) bondShown = level;
    $('choice-time').textContent = timeLabel(time);
    $('choice-desc').textContent = state.ap ? `남은 시간 ${state.ap}칸 · 기력 ${state.energy}. 고른 일에 따라 시간이 흐르고 수련과의 하루가 쌓입니다.` : '오늘 쓸 수 있는 시간을 모두 썼어요. 수련과 인사하고 하루를 마무리해요.';
    setChoosing(choosing);
    phoneCheck();
  }
  const greetings = {
    morning: ['좋은 아침이에요. 오늘은 뭐부터 해 볼까요?', '어제 늦게 잤어요? 눈이 조금 졸려 보여요.'],
    afternoon: ['벌써 오후네요. 남은 시간은 어떻게 쓸까요?', '점심은 먹었어요? 저는 방금 커피 한 잔 했어요.'],
    evening: ['노을이 예쁘네요. 오늘 하루는 어땠어요?', '저녁 바람이 좋아요. 조금 더 같이 있을래요?'],
    night: ['늦었네요. 오늘은 여기까지 할까요?', '오늘도 고마웠어요. 내일 또 봐요.']
  };
  const casualGreetings = {
    morning: ['좋은 아침. 오늘은 뭐부터 할까?', '어제 늦게 잤지? 눈이 좀 졸려 보여.'],
    afternoon: ['벌써 오후네. 남은 시간 뭐 하고 싶어?', '점심은 먹었어? 난 방금 커피 마셨어.'],
    evening: ['노을 예쁘다. 오늘 하루 어땠어?', '저녁 바람 좋다. 조금 더 같이 있을래?'],
    night: ['늦었다. 오늘은 여기까지 할까?', '오늘도 고마웠어. 내일 또 보자.']
  };
  function greeting(time) { const set = state.story.speech === 'casual' ? casualGreetings : greetings, lines = set[time] || set.morning; return lines[state.day % lines.length]; }
  function setChoosing(on, focus) {
    choosing = !!on;
    if (!$('choice-card')) return;
    $('choice-card').hidden = !choosing; $('dialogue').hidden = choosing; if (choosing) closePhone();
    $('game').classList.toggle('choosing', choosing && $('game').classList.contains('play-mode'));
    if (!focus) return;
    if (choosing) [...$('choice-card').querySelectorAll('.daily-actions button')].find(b => !b.disabled)?.focus({ preventScroll: true });
    else $('dialogue-next').focus({ preventScroll: true });
  }
  // Visual-novel reading: one line at a time; the last advance hands off to `done`.
  function startReveal(box, lines, tag, done, extra) {
    reveal = { box, lines, tag, done, extra, index: 0 };
    showLine();
  }
  function showLine() {
    const r = reveal; if (!r) return;
    r.lines.forEach((line, i) => line.classList.toggle('line-hidden', i !== r.index));
    const line = r.lines[r.index], last = r.index >= r.lines.length - 1;
    if (r.tag) { const who = line?.dataset.speaker || ''; r.tag.textContent = who; r.tag.hidden = !who; }
    r.box.classList.toggle('reveal-done', last);
    r.extra?.forEach(e => e.classList.toggle('line-hidden', !last));
    r.onShow?.();
    r.box.closest('.vn-box')?.querySelector('.vn-progress')?.replaceChildren(document.createTextNode(`${Math.min(r.index + 1, r.lines.length)} / ${r.lines.length}`));
  }
  function advanceReveal() {
    const r = reveal; if (!r || !r.box.isConnected) return false;
    if (r.hurry?.()) return true;
    if (r.index < r.lines.length - 1) { r.index += 1; showLine(); return true; }
    if (r.done) { r.done(); return true; }
    return false;
  }
  // ---------- main screen: Sulien answers in the dialogue box ----------
  function sayOnStage(text, face, title = '') {
    if (!active || $('play-screen').hidden) return;
    setChoosing(false);
    $('speaker').textContent = '수련'; $('message-title').textContent = title; $('message-text').textContent = text;
    $('dialogue').classList.remove('said'); void $('dialogue').offsetWidth; $('dialogue').classList.add('said');
    if (face) { const path = D.sceneCharacter(state.outfit, state.legwear, face, state.neckAccessory); if ($('character').getAttribute('src') !== path) $('character').src = path; }
  }
  function touchSulien() {
    if (touchDay !== state.day) { touchDay = state.day; touches = 0; }
    touches += 1;
    const m = state.growth.mood, set = touches > 3 ? N.touchLines.again : m >= 65 ? N.touchLines.high : m >= 35 ? N.touchLines.mid : N.touchLines.low;
    const line = set[(state.day + touches) % set.length];
    sayOnStage(line[N.speechIndex(state)], line[2]); sfx('select');
  }
  const tasteName = { loved: '아주 좋아함 ♡', liked: '좋아함', neutral: '보통', disliked: '별로' };
  function giftMenu() {
    openModal('작은 선물', body => {
      const given = state.story.giftDay === state.day;
      body.append(el('p', 'modal-description', given ? '오늘은 이미 선물을 건넸어요. 내일 다시 골라 보세요.' : `하루 한 번 건넬 수 있어요. 수련의 반응으로 취향을 알아 가세요. 현재 ${won(state.money)}`));
      const list = el('div', 'choice-list gift-list');
      D.gifts.forEach(g => {
        const known = state.story.tastes?.[g.id], card = el('article', `activity-card gift-card${known ? ' known ' + known : ''}`);
        const info = el('div'); info.append(el('h3', '', g.name), el('p', '', g.desc), el('div', 'costs', `${won(g.cost)} · ${known ? '수련: ' + tasteName[known] : '아직 반응을 몰라요'}`));
        const reason = E.giftReason(state, g.id), act = el('div', 'card-action'), b = button('건네기', 'primary', () => giveGift(g.id));
        b.disabled = !!reason; b.dataset.giftId = g.id; act.append(b); if (reason) act.append(el('span', 'blocked-reason', reason));
        card.append(el('span', 'card-icon', g.icon), info, act); list.append(card);
      });
      body.append(list);
    });
  }
  function giveGift(id) {
    const result = E.giveGift(state, id);
    if (result.error) { toast(result.error); return; }
    state = result.state; render(); persist(); closeModal();
    const r = result.result, back = r.reunion ? `${N.messageText(state, N.reunionLines[0]).split('…')[0]}… ` : '';
    sayOnStage(`${back}${r.text}`, r.face, r.title); if (r.birthday) setTimeout(() => stageCard('수련의 생일', 'BIRTHDAY'), 900);
    showReaction({ affection: r.affection, mood: r.mood });
  }
  function relationshipNote() {
    openModal('관계 노트 · 수련', body => {
      const level = N.bondLevel(state), toNext = level >= 10 ? 0 : level * 20 - (state.affection + state.trust);
      body.append(el('p', 'profile-quote', '무대 위의 이름보다 먼저, 당신의 친구였던 수련.'));
      const bond = el('section', 'note-bond'); const bar = el('span', 'note-bar'); const fill = el('i'); fill.style.width = `${level >= 10 ? 100 : 100 - toNext * 5}%`; bar.append(fill);
      bond.append(el('strong', '', `인연 Lv.${level}`), el('span', '', `${N.stage(state)}${state.story.speech === 'casual' ? ' · 말을 놓은 사이' : ''}`), bar, el('small', '', level >= 10 ? '가장 깊은 인연이에요.' : `다음 단계까지 호감·신뢰 합계 ${toNext}`));
      body.append(bond);
      // Her heart, in words: four steps from friend to almost-a-confession (no percentages).
      const h = N.heart(state), meter = el('section', 'note-heart'), steps = el('ol', 'heart-steps');
      N.heartStages.forEach((st, i) => steps.append(el('li', i < h.index || h.final ? 'past' : i === h.index ? 'now' : '', st.name)));
      if (h.final) steps.append(el('li', 'now final', h.name));
      meter.append(el('h3', '', '수련의 마음'), steps, el('p', 'heart-note', `${h.name} · ${h.note}`));
      if (h.index === 3 && !h.final && state.story.relationship !== 'considering') {
        const ready = el('ul', 'heart-ready');
        [['함께한 외출', state.story.dateCount, 12], ['호감', state.affection, 40], ['신뢰', state.trust, 40]].forEach(([k, v, need]) => ready.append(el('li', v >= need ? 'met' : '', `${k} ${Math.min(v, need)} / ${need}`)));
        meter.append(ready);
      }
      body.append(meter);
      const project = el('section', 'note-section acoustic-project');
      project.append(el('h3', '', '함께 만드는 발라드 데모'));
      N.acousticProject(state).forEach(step => {
        const item = el('div', 'acoustic-project-step');
        item.append(el('p', '', `${step.complete ? '✓' : step.ready ? '♪' : '○'} ${step.title}`));
        if (!step.complete) item.append(el('p', 'muted-note', step.hint));
        if (step.ready) item.append(button('함께 작업하기', 'secondary', () => beginStory(step.id)));
        project.append(item);
      });
      const demo = state.story.completed.find(e => e.id === 'acoustic-demo');
      if (demo) project.append(el('p', 'muted-note', demo.choices[0] === 'private' ? '데모는 둘만 듣는 파일로 보관했어요. 공유는 수련이 다시 결정해요.' : '수련이 먼저 하윤에게 데모를 들려주기로 했어요.'));
      body.append(project);
      const next = N.events.find(e => !N.done(state, e.id) && !e.ready(state));
      if (next) body.append(el('p', 'story-hint', `다음 이야기의 단서 · ${next.hint}`));
      const tastes = el('section', 'note-section'); tastes.append(el('h3', '', '알게 된 취향'));
      const known = D.gifts.filter(g => state.story.tastes?.[g.id]);
      if (known.length) { const ul = el('ul', 'note-tastes'); known.forEach(g => ul.append(el('li', state.story.tastes[g.id], `${g.icon} ${g.name} — ${tasteName[state.story.tastes[g.id]]}`))); tastes.append(ul); }
      tastes.append(el('p', 'muted-note', `${known.length} / ${D.gifts.length} · 작은 선물로 알아 갈 수 있어요. 좋아하는 것: 발라드 감상과 노래 부르기, 조용한 카페`));
      body.append(tastes);
      const memory = el('section', 'note-section'); memory.append(el('h3', '', '함께한 기록'));
      const firstDate = state.memories[0], list = el('dl', 'profile-list');
      [['함께한 외출', `${state.story.dateCount}회`], ['지킨 약속', `${state.story.keptPromises}번`], ['함께 읽은 이야기', `${state.story.completed.length}편`], ['최근 나눈 이야기', state.story.talks?.length ? state.story.talks.slice(-3).reverse().map(t => `${t.day}일째 ${t.score}점`).join(' · ') : '아직 없어요'], ['첫 외출', firstDate ? `${firstDate.day}일째 · ${D.dates.find(d => d.id === firstDate.date)?.name || ''}` : '아직 없어요'], ['요즘의 수련', `${N.doing[state.location]?.[D.timeForAp(state.ap)] || ''} · ${N.moodLabel(state.growth.mood)}`]].forEach(([k, v]) => list.append(el('dt', '', k), el('dd', '', v)));
      memory.append(list); body.append(memory);
      const profileList = el('dl', 'profile-list'); [['시점','Aqua Luna 본편 이전'],['소속','엔터테인먼트 입사 전 · 소속 없음'],['전공','실용음악과 · 보컬 전공'],['좋아하는 장르','발라드'],['주로 부르는 장르','발라드'],['당신과의 관계','같은 실용음악과 보컬 전공·같은 학년의 대학 친구'],['지금의 일상','발라드 실기곡을 연습하며 보컬 데모·작은 라이브를 준비하는 중'],['성격','차분함 · 깊은 감수성 · 말보다 행동'],['호감',`${state.affection} / 100`],['신뢰',`${state.trust} / 100`],['현재 의상',D.outfits.find(o => o.id === state.outfit).name]].forEach(([k,v]) => profileList.append(el('dt','',k), el('dd','',v)));
      const details = el('details', 'note-profile'); details.append(el('summary', '', '수련 프로필'), profileList); details.open = true; body.append(details);
    });
  }
  // ---------- short talk: three topics, read her mood (Amagami-style, small) ----------
  const tensionName = ['어색함', '보통', '분위기 좋음'];
  function talkScene() {
    const reason = E.talkReason(state); if (reason) { toast(reason); return; }
    const plan = E.talkPlan(state), picks = [], T = N.talk, pair = x => N.messageText(state, x);
    let busy = false;
    openModal('잠깐 이야기', body => {
      const layout = el('div', 'story-layout'), prose = el('div', 'story-prose vn-box talk-box');
      layout.append(artScene(state.location, state.outfit, state.legwear, 'neutral', D.timeForAp(state.ap), state.neckAccessory), prose); body.append(layout);
      const hud = el('div', 'talk-hud'); hud.append(el('span', 'talk-turn', '1 / 3'), el('span', 'talk-tension', tensionName[plan.tension]));
      const gauge = el('span', 'talk-gauge'); const fill = el('i'); gauge.append(fill, el('b', 'talk-mark')); hud.append(gauge, el('span', 'talk-score', '0'));
      const topics = el('div', 'talk-topics'); E.talkTopics.forEach(id => { const b = button(T[id].name, 'talk-topic', () => pickTopic(id, b)); b.dataset.talkTopic = id; topics.append(b); });
      const end = el('div', 'talk-end'); end.hidden = true;
      body.append(hud, topics, end);
    });
    const m = $('modal'); m.classList.add('story-stage', 'talk-stage');
    const body = $('modal-body'), art = body.querySelector('.art-scene'), prose = body.querySelector('.talk-box');
    const bg = el('div', 'vn-bg'); bg.style.backgroundImage = art.style.backgroundImage; art.prepend(bg); art.querySelector('img')?.classList.add('vn-face');
    const ctx = { art, outfit: state.outfit, legwear: state.legwear, neck: state.neckAccessory, face: '' };
    const tag = el('span', 'vn-speaker'), line = el('p', 'story-text'), hint = el('p', 'story-inner talk-hint');
    prose.append(tag, el('small', 'vn-sub', `잠깐 이야기 · ${D.locations[state.location].name} · DAY ${state.day}`), line, hint);
    const say = (who, text, face) => {
      tag.textContent = who; tag.hidden = !who; prose.classList.toggle('is-me', who === '나'); prose.classList.toggle('is-narration', !who);
      line.textContent = ''; typeset(line, text); line.classList.remove('typed'); line.style.display = 'none'; void line.offsetWidth; line.style.display = '';
      if (face && face !== ctx.face) setFace(ctx, face);
      if (who === '수련' && prefs.blip) sfx('blip');
    };
    setFace(ctx, 'neutral');
    say('수련', pair(T[plan.hot[0]].opener), plan.tension === 2 ? 'smile' : plan.tension === 0 ? 'thoughtful' : 'neutral');
    hint.textContent = N.bondLevel(state) >= 4 || state.growth.stats.sensitivity >= 20 ? T[plan.hot[1]].hint : ''; hint.hidden = !hint.textContent;
    const hud = body.querySelector('.talk-hud'), endBox = body.querySelector('.talk-end');
    const update = r => {
      hud.querySelector('.talk-turn').textContent = `${Math.min(3, picks.length + 1)} / 3`;
      hud.querySelector('.talk-tension').textContent = tensionName[r.tension]; hud.dataset.tension = r.tension;
      hud.querySelector('.talk-gauge i').style.width = `${r.score}%`; hud.querySelector('.talk-score').textContent = String(r.score);
      hud.classList.toggle('ready', r.score >= 60);
    };
    update({ tension: plan.tension, score: 0 });
    function pickTopic(id, b) {
      if (busy || picks.length >= 3 || picks.includes(id)) return;
      busy = true; picks.push(id); b.disabled = true; b.classList.add('used'); hint.hidden = true;
      say('나', pair(T[id].say)); sfx('select');
      setTimeout(() => {
        if (!b.isConnected) return;
        const r = E.talkScore(plan, picks), step = r.steps.at(-1), react = T[id][step.kind];
        b.classList.add(step.kind); say('수련', pair(react[0]), react[1]); update(r);
        if (step.gain) { const pop = el('span', `talk-pop ${step.kind}`, `+${step.gain}`); hud.append(pop); setTimeout(() => pop.remove(), 1400); }
        sfx(step.kind === 'hit' ? 'heart' : step.kind === 'miss' ? 'page' : 'trust');
        busy = false;
        if (picks.length === 3) showEnd(r);
      }, prefs.reduceMotion ? 0 : 900);
    }
    function showEnd(r) {
      body.querySelectorAll('.talk-topic').forEach(x => { x.disabled = true; });
      endBox.hidden = false; endBox.replaceChildren();
      const close = state.story.relationship === 'lovers' ? N.talkClose.lovers : N.talkClose.friend;
      if (r.score >= 60) endBox.append(button(`한 걸음 · ${close.label}`, 'primary talk-closer', () => finish(true, close)));
      endBox.append(button('오늘은 여기까지', 'secondary', () => finish(false, close)));
    }
    function finish(closer, close) {
      const result = E.finishTalk(state, picks, closer);
      if (result.error) { toast(result.error); return; }
      state = result.state; render(); persist();
      endBox.replaceChildren();
      const fx = { affection: result.result.affection, trust: result.result.trust, mood: result.result.mood };
      if (closer) { say('나', pair(close.say)); setTimeout(() => { if (prose.isConnected) { say('수련', pair(close.reply[0]), close.reply[1]); setCam('lean'); showReaction(fx); } }, prefs.reduceMotion ? 0 : 1000); }
      else { const end = result.result.score >= 60 ? N.talkClose.good : N.talkClose.quiet; say('수련', pair(end[0]), end[1]); showReaction(fx); }
      endBox.append(button('일상으로 돌아가기', 'secondary', () => { closeModal(); setChoosing(false); }));
    }
  }
  // ---------- phone messages: arrive in the morning, optional to answer ----------
  let phoneShown = '', phoneTimers = [], phonePage = 'home';
  function syncPhone() {
    const count = unreadCount();
    document.querySelectorAll('.phone-clock').forEach(x => x.textContent = ({ morning: '09:00', afternoon: '14:00', evening: '18:00', night: '21:00' })[D.timeForAp(state.ap)] || '09:00');
    $('phone-date').textContent = D.calendar(state.day).label;
    $('phone-button').classList.toggle('unread', count > 0);
    const badge = document.querySelector('[data-phone-app="messages"] .phone-app-badge');
    if (badge) { badge.hidden = !count; badge.textContent = count; }
    $('phone-notification').hidden = !count;
    $('phone-notification').textContent = `✉ 새 메시지 ${count}개 · 확인하기`;
  }
  function openPhoneHome() {
    if ($('modal').open) closeModal();
    if (active && choosing) setChoosing(false);
    phoneTimers.forEach(clearTimeout); phoneTimers = [];
    phonePage = 'home'; $('phone').hidden = false; $('phone').dataset.page = 'home';
    $('phone-home').hidden = false;
    ['phone-list', 'phone-thread', 'phone-replies', 'phone-back', 'phone-avatar'].forEach(id => $(id).hidden = true);
    $('phone-name').textContent = 'LUNA'; $('phone-time').textContent = '나의 작은 일상';
    syncPhone(); $('phone-close').focus({ preventScroll: true });
  }
  function phoneBack() { if (phonePage === 'thread') openMessenger(); else if (phonePage === 'messages') openPhoneHome(); else closePhone(); }
  const pendingMessage = () => { const m = state.story?.message; return m && m.day === state.day && N.messages[m.key] ? m : null; };
  function phoneCheck() {
    const m = pendingMessage();
    syncPhone();
    if (!m || m.reply || phoneShown === `${m.day}:${m.key}` || !active || $('play-screen').hidden) return;
    phoneShown = `${m.day}:${m.key}`;
    phoneTimers.push(setTimeout(() => { if (!$('modal').open && !$('play-screen').hidden && !choosing && $('phone').hidden) { openPhoneHome(); sfx('phone'); } else phoneShown = ''; }, 900));
  }
  const unreadCount = () => { const m = pendingMessage(), seen = state.story?.seen || 0; return (m && !m.reply ? 1 : 0) + (state.story?.msgLog || []).filter((x, i) => x.from !== 'sulien' && i >= seen).length; };
  const threads = { sulien: { name: '수련', avatar: '수' }, friend: { name: '하윤 · 같은 과 친구', avatar: '하' }, notice: { name: '연습실 · 학과 알림', avatar: '✉' } };
  function phoneHeader(who) { phonePage = who ? 'thread' : 'messages'; $('phone').dataset.page = phonePage; $('phone-home').hidden = true; $('phone-avatar').hidden = false; const t = threads[who]; $('phone-name').textContent = t ? t.name : '메시지'; $('phone-avatar').textContent = t ? t.avatar : '✉'; $('phone-back').hidden = false; $('phone-list').hidden = !!who; $('phone-thread').hidden = !who; $('phone-replies').hidden = !who; }
  function markSeen() { const r = E.markMessagesSeen(state); state = r.state; persist(); syncPhone(); }
  function openMessenger() {
    phoneTimers.forEach(clearTimeout); phoneTimers = [];
    $('phone').hidden = false; phoneHeader(''); $('phone-time').textContent = `${D.calendar(state.day).label}`;
    const list = $('phone-list'), log = state.story.msgLog || [], seen = state.story.seen || 0, m = pendingMessage(); list.replaceChildren();
    Object.entries(threads).forEach(([who, t]) => {
      const entries = log.filter(x => x.from === who), last = who === 'sulien' && m ? m : entries.at(-1);
      const preview = !last ? '아직 메시지가 없어요.' : who === 'sulien' ? N.messageText(state, N.messages[last.key].lines.at(-1), last.place) : N.logText(last);
      const unread = who === 'sulien' ? (m && !m.reply ? 1 : 0) : log.filter((x, i) => x.from === who && i >= seen).length;
      const row = button('', `phone-row${unread ? ' unread' : ''}`, () => openThread(who)); row.dataset.thread = who;
      const text = el('span', 'phone-row-text'); text.append(el('b', '', t.name), el('small', '', preview));
      row.append(el('span', 'phone-avatar', t.avatar), text, el('span', 'phone-row-meta', unread ? String(unread) : last ? `${last.day}일` : ''));
      list.append(row);
    });
    markSeen();
  }
  function openThread(who) {
    if (who === 'sulien') { openPhone(true); return; }
    phoneTimers.forEach(clearTimeout); phoneTimers = []; phoneHeader(who);
    const thread = $('phone-thread'); thread.replaceChildren(); $('phone-replies').replaceChildren();
    let lastDay = 0;
    (state.story.msgLog || []).filter(x => x.from === who).slice(-12).forEach(x => { if (x.day !== lastDay) { thread.append(el('p', 'phone-day', `${D.calendar(x.day).label}`)); lastDay = x.day; } thread.append(el('p', 'phone-bubble', N.logText(x))); });
    if (!thread.children.length) thread.append(el('p', 'phone-day', '아직 메시지가 없어요.'));
    thread.scrollTop = thread.scrollHeight;
  }
  // After you answer, she follows up with a sticker, as people do in a messenger.
  function stickerEl(key, old) { const [icon, label] = N.sticker(key), s = el('p', `phone-sticker${old ? ' old' : ''}`); s.setAttribute('aria-label', `이모티콘 · ${label}`); s.append(el('span', '', icon), el('small', '', label)); return s; }
  function closePhone() { phoneTimers.forEach(clearTimeout); phoneTimers = []; const hadFocus = $('phone').contains(document.activeElement); $('phone').hidden = true; if (hadFocus && active) $('phone-button').focus({ preventScroll: true }); }
  function openPhone(fromList) {
    const m = pendingMessage();
    const thread = $('phone-thread'), replies = $('phone-replies');
    phoneTimers.forEach(clearTimeout); phoneTimers = [];
    thread.replaceChildren(); replies.replaceChildren(); $('phone').hidden = false; phoneHeader('sulien');
    let lastDay = 0;
    (state.story.msgLog || []).filter(x => x.from === 'sulien').slice(-4).forEach(x => {
      const old = N.messages[x.key]; if (!old) return;
      if (x.day !== lastDay) { thread.append(el('p', 'phone-day', D.calendar(x.day).label)); lastDay = x.day; }
      old.lines.forEach(l => thread.append(el('p', 'phone-bubble old', N.messageText(state, l, x.place))));
      const r = x.reply && old.replies.find(y => y.id === x.reply); if (r) { thread.append(el('p', 'phone-bubble mine old', N.messageText(state, r.say))); thread.append(el('p', 'phone-bubble old', N.messageText(state, r.back))); thread.append(stickerEl(x.key, true)); }
    });
    if (!m) { if (!thread.children.length) thread.append(el('p', 'phone-day', '아직 메시지가 없어요.')); thread.scrollTop = thread.scrollHeight; return; }
    thread.append(el('p', 'phone-day', D.calendar(m.day).label));
    const msg = N.messages[m.key];
    $('phone-time').textContent = `DAY ${state.day} · 오전 8:${String(10 + state.day % 40).padStart(2, '0')}`;
    const later = (ms, fn) => phoneTimers.push(setTimeout(fn, prefs.reduceMotion ? 0 : ms));
    const bubble = (text, mine) => { thread.querySelector('.phone-typing')?.remove(); const b = el('p', `phone-bubble${mine ? ' mine' : ''}`, text); thread.append(b); thread.scrollTop = thread.scrollHeight; return b; };
    const typing = () => { const t = el('p', 'phone-typing'); t.append(el('i'), el('i'), el('i')); thread.append(t); };
    const text = pair => N.messageText(state, pair, m.place);
    if (m.reply) { msg.lines.forEach(l => bubble(text(l))); const r = msg.replies.find(x => x.id === m.reply); bubble(text(r.say), true); bubble(text(r.back)); thread.append(stickerEl(m.key)); thread.scrollTop = thread.scrollHeight; return; }
    typing();
    msg.lines.forEach((l, i) => later(900 + i * 1300, () => { bubble(text(l)); sfx('phone'); if (i < msg.lines.length - 1) typing(); }));
    later(900 + msg.lines.length * 1300, () => {
      msg.replies.forEach(r => { const b = button(r.label, 'phone-reply', () => {
        const result = E.replyMessage(state, r.id); if (result.error) { toast(result.error); return; }
        replies.replaceChildren(); bubble(text(r.say), true); sfx('select');
        state = result.state; persist(); render();
        typing(); later(1100, () => { bubble(text(r.back)); sfx('phone'); if (result.result.trust) showReaction({ trust: result.result.trust }); later(700, () => { thread.append(stickerEl(m.key)); thread.scrollTop = thread.scrollHeight; }); });
      }); b.dataset.messageReply = r.id; replies.append(b); });
      replies.append(button('나중에 답하기', 'phone-later', closePhone));
    });
  }
  // ---------- calendar: the days we've spent, school events, her birthday ----------
  function calendarView(year, month) {
    const now = D.calendar(state.day); year = year || now.year; month = month || now.month;
    openModal(`${year}년 ${month}월`, body => {
      const nav = el('div', 'cal-nav'), prevM = month === 1 ? [year - 1, 12] : [year, month - 1], nextM = month === 12 ? [year + 1, 1] : [year, month + 1];
      const prev = button('‹ 이전 달', 'secondary', () => calendarView(...prevM)), next = button('다음 달 ›', 'secondary', () => calendarView(...nextM));
      prev.disabled = D.dayOf(prevM[0], prevM[1], 31) < 1; next.disabled = D.dayOf(nextM[0], nextM[1], 1) > state.day + 62;
      nav.append(prev, el('span', '', `오늘 · ${now.label} · ${now.termLabel}`), next); body.append(nav);
      const grid = el('div', 'cal-grid'); ['일','월','화','수','목','금','토'].forEach(w => grid.append(el('span', 'cal-head', w)));
      const first = D.dayOf(year, month, 1), lead = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(), days = new Date(Date.UTC(year, month, 0)).getUTCDate();
      for (let i = 0; i < lead; i++) grid.append(el('span', 'cal-cell empty'));
      const detail = el('div', 'cal-detail');
      for (let d = 1; d <= days; d++) {
        const day = first + d - 1, cal = day >= 1 ? D.calendar(day) : null, past = day >= 1 && day <= state.day;
        const marks = [];
        if (past) {
          if (state.memories.some(m => m.day === day) || state.journal.some(j => j.day === day && j.type === 'date')) marks.push(['date', '♡']);
          if (state.story.completed.some(e => e.day === day)) marks.push(['story', '★']);
          if (state.journal.some(j => j.day === day && (j.type === 'gift' || j.type === 'talk'))) marks.push(['gift', '◇']);
          if (state.journal.some(j => j.day === day && j.type === 'message')) marks.push(['msg', '✉']);
        }
        const cell = button('', `cal-cell${day === state.day ? ' today' : ''}${past ? ' past' : ''}${cal?.birthday ? ' birthday' : ''}${cal?.event ? ' ev-' + cal.event.id : ''}`, () => {
          detail.replaceChildren(el('h3', '', cal ? `${cal.label}${cal.birthday ? ' · 수련의 생일' : ''}${cal.event ? ' · ' + cal.event.name : ''}` : ''));
          const rows = state.journal.filter(j => j.day === day && j.type !== 'nextDay');
          if (!past) detail.append(el('p', 'muted-note', day < 1 ? '이야기가 시작되기 전이에요.' : '아직 오지 않은 날이에요.'));
          else if (!rows.length) detail.append(el('p', 'muted-note', '조용히 지나간 하루예요.'));
          rows.forEach(j => { const r = el('p', 'cal-entry'); r.append(el('b', '', j.title), document.createTextNode(` ${j.text}`)); detail.append(r); });
        });
        cell.disabled = day < 1; cell.append(el('b', '', String(d)));
        if (cal?.birthday) cell.append(el('small', 'cal-tag', '수련 생일'));
        else if (cal?.event && (D.calendar(day - 1).event?.name !== cal.event.name || cal.weekday === '월')) cell.append(el('small', 'cal-tag', cal.event.name));
        if (marks.length) { const m = el('span', 'cal-marks'); marks.forEach(([k, t]) => m.append(el('i', k, t))); cell.append(m); }
        grid.append(cell);
      }
      body.append(grid, el('p', 'muted-note cal-legend', '♡ 데이트 · ★ 이야기 · ◇ 선물·대화 · ✉ 메시지. 날짜를 누르면 그날의 기록을 볼 수 있어요.'), detail);
    });
  }
  function openModal(title, build) {
    stopWorkPresentation();
    modalRevision += 1;
    if (!$('modal').open) lastFocus = document.activeElement;
    closePhone(); syncPhone();
    delete $('modal').dataset.interior; $('modal').classList.remove('story-stage','vn-hide'); $('modal').classList.add('phone-app-screen'); $('modal').querySelector('.vn-log')?.remove();
    $('modal-title').previousElementSibling.textContent = active ? `수련과 보내는 하루 · DAY ${String(state.day).padStart(2,'0')}` : 'AQUA LUNA';
    $('modal-title').textContent = title; $('modal-body').replaceChildren(); build($('modal-body'));
    if (!$('modal').open) $('modal').showModal(); $('modal').scrollTop = 0; $('modal-body').scrollTop = 0; $('close-modal').focus({ preventScroll: true });
  }
  function closeModal() { stopWorkPresentation(); modalRevision += 1; $('modal').close(); }
  $('modal').addEventListener('close', () => { if (!$('modal').open) stopWorkPresentation(); });
  $('modal').addEventListener('close', () => { if (!$('modal').open && active && !$('play-screen').hidden && $('intro-screen').hidden) { const level = N.bondLevel(state); if (bondShown && level > bondShown) { bondShown = level; setTimeout(() => stageCard(`인연 Lv.${level}`, 'BOND'), 500); } } });
  $('modal').addEventListener('close', () => { if (!$('modal').open) { $('game').append($('toast')); if (lastFocus && lastFocus.isConnected && !lastFocus.closest('[hidden]')) lastFocus.focus({ preventScroll: true }); } });
  $('modal').addEventListener('click', e => { if ($('modal').classList.contains('vn-hide')) { e.stopPropagation(); hideStage(false); return; } }, true);
  $('modal').addEventListener('click', e => { if (e.target !== $('modal')) return; const r = $('modal').getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeModal(); });
  function confirm(title, text, label, yes, back) {
    openModal(title, body => { body.append(el('p', 'modal-description', text)); const actions = el('div', 'confirm-actions'); actions.append(button('돌아가기', 'secondary', () => back ? back() : closeModal()), button(label, 'primary', () => { closeModal(); yes(); })); body.append(actions); });
  }
  function doAction(type, id, keepWardrobe = false) {
    const result = E.act(state, type, id);
    if (result.error) { toast(result.error); return; }
    state = result.state; render(); persist();
    if (keepWardrobe) { wardrobe(); toast(result.result.title); } else { setChoosing(false); closeModal(); toast(result.result.title); if (active && !$('play-screen').hidden) $('dialogue-next').focus({ preventScroll: true }); }
    if (type === 'work') showWorkPresentation([id]);
    if (result.result.encounter) showEncounter(result.result.encounter);
    if (result.result.week) weekReport(result.result.week);
  }
  function showEncounter(enc) { sayOnStage(enc.line, enc.face, enc.title); showReaction({ affection: enc.affection, mood: enc.mood }); }
  function showWorkPresentation(ids, returnToSchedule = false) {
    const jobs = ids.map(id => D.jobs.find(j => j.id === id)).filter(Boolean);
    if (!jobs.length) return;
    openModal(jobs.length > 1 ? '오늘의 작업 노트' : jobs[0].name, body => {
      disposeWork = window.LunaWork.build(body, jobs, {
        reduceMotion: prefs.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        doneLabel: returnToSchedule ? '일정으로 돌아가기' : '일상으로 돌아가기',
        onDone: () => { closeModal(); if (returnToSchedule) schedulePlanner(); }
      });
    });
  }
  // ---------- weekly settlement: every Monday morning, last week on one card ----------
  const weekComment = w => !w.dates && !w.talks && !w.gifts ? '이번 주에 수련 얼굴 거의 못 봤지? 연습실에서 네 자리 자꾸 쳐다보더라.'
    : w.affection + w.trust >= 6 ? '너네 이번 주 분위기 좋던데? 수련이 계속 웃고 다녀.'
    : w.earned > 0 && !w.dates ? '돈은 열심히 모았네 ㅋㅋ 이번 주엔 수련이랑 어디 좀 가.' : '평범하지만 괜찮은 한 주였네. 다음 주도 화이팅.';
  function weekReport(w = state.lastWeek) {
    if (!w) return;
    openModal('지난 한 주의 결산', body => {
      $('modal').dataset.interior = 'room';
      body.append(el('p', 'modal-description', `${D.calendar(w.from).label} ~ ${D.calendar(w.to).label} · ${w.to - w.from + 1}일 동안 쌓인 기록이에요.`));
      const grid = el('div', 'week-grid');
      [['번 돈', won(w.earned), 'money'], ['쓴 돈', won(w.spent), 'money'], ['함께한 외출', `${w.dates}회`, 'date'], ['함께 읽은 이야기', `${w.stories}편`, 'story'], ['선물 · 대화', `${w.gifts} · ${w.talks}`, 'gift'], ['일한 횟수', `${w.works}번`, 'work'], ['♡ 호감', `+${w.affection}`, 'heart'], ['◇ 신뢰', `+${w.trust}`, 'trust']]
        .forEach(([k, v, kind], i) => { const tile = el('div', `week-tile ${kind}`); tile.style.setProperty('--i', i); tile.append(el('small', '', k), el('strong', '', v)); grid.append(tile); });
      const h = N.heart(state), mind = el('p', 'week-heart'); mind.append(el('b', '', `수련의 마음 · ${h.name}`), el('span', '', N.moodLabel(w.mood)));
      const friend = el('p', 'week-friend'); friend.append(el('b', '', '하윤'), document.createTextNode(weekComment(w)));
      body.append(grid, mind, friend, button('이번 주도 시작하기', 'primary', () => { closeModal(); phoneCheck(); }));
    });
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
      $('modal').dataset.interior = 'room';
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
  function showScene(location, outfit, legwear, time = D.timeForAp(state.ap), neck = state.neckAccessory) {
    const place = D.locations[location];
    document.querySelector('.scenery').style.backgroundImage = `${active ? 'linear-gradient(180deg,rgba(6,12,22,.3),rgba(6,12,22,.02) 40%,rgba(6,12,22,.35))' : 'linear-gradient(90deg,rgba(8,17,30,.65),rgba(11,19,31,.06))'},url("${D.sceneImage(location, time)}")`;
    $('game').dataset.time = time;
    $('location-name').textContent = `${place.name} · ${timeLabel(time)}`;
    const path = D.sceneCharacter(outfit, legwear, 'neutral', neck);
    if ($('character').getAttribute('src') !== path) { $('character').hidden = false; $('character').src = path; }
    $('character').alt = `${outfitLabel(outfit, legwear)} 차림의 수련`;
    $('character').classList.toggle('full-body', D.characterFraming(path) === 'full');
  }
  function artScene(location, outfit, legwear, expression = 'neutral', time = D.timeForAp(state.ap), neck = state.neckAccessory) {
    const stage = el('div', 'art-scene'); stage.dataset.face = expression;
    stage.dataset.framing = D.characterFraming(D.characterImage(outfit, legwear, expression, neck));
    stage.style.backgroundImage = `url("${D.sceneImage(location, time)}")`;
    const img = el('img'); img.src = D.characterImage(outfit, legwear, expression, neck); img.alt = `${outfitLabel(outfit, legwear)} 차림의 수련`; img.loading = 'lazy';
    stage.append(img); return stage;
  }
  function fittingScene(outfit, legwear) {
    const stage = artScene('practice', outfit, legwear);
    stage.style.backgroundImage = `url("${D.interiors.fitting}")`;
    return stage;
  }
  function shop() {
    openModal('망원동 의상 상점', body => {
      $('modal').dataset.interior = 'fitting';
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
        preview.append(fittingScene(accessory ? 'skirt' : item.id, accessory ? item.id : 'none'),el('span','preview-label','전신 크게 보기 ↗'));card.append(preview);
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
      $('modal').dataset.interior = 'fitting';
      const layout=el('div','dressing-layout product-detail'),controls=el('div','dressing-controls');
      layout.append(fittingScene(accessory?'skirt':item.id,accessory?item.id:'none'),controls);body.append(layout);
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
  function schedulePlanner() {
    openModal('능력치와 오늘의 일정', body => {
      $('modal').dataset.interior = 'room';
      const g = state.growth;
      body.append(el('p','modal-description',`${state.day}일째 · 남은 시간 ${state.ap}칸 · 기력 ${state.energy} · 수련의 기분 ${g.mood}/100`));
      const stats = el('div','growth-stats');
      Object.entries(E.statNames).forEach(([key,name]) => stats.append(el('p','',`${name} ${g.stats[key]} / 100`)));
      body.append(stats, el('p','muted-note','공부·운동·음악 감상은 능력치 +4, 아르바이트는 관련 능력치 +2. 능력치 8과 2일째부터 새 이야기가 열리고, 12부터 특별한 대화를 선택할 수 있어요.'));
      const guide = el('ul','stat-guide'); [['fitness','물길과 바람 · 도시의 빈 시간 · 달빛 부두 산책'],['knowledge','책과 그림 · 손으로 남긴 하루 · 공연'],['sensitivity','식탁의 온도 · 작은 음악 여행 · 카페, 그리고 잠깐 이야기의 속마음 힌트(20)']].forEach(([k,t]) => { const li = el('li'); li.append(el('span',`stat-chip ${k}`,E.statNames[k]), document.createTextNode(` ${g.stats[k]} — 데이트 특별 선택지: ${t}. 코스 순서에 따라 10·16·22·28이 필요해요.`)); guide.append(li); }); body.append(guide);
      const options = [...E.training.map(t => ({type:'train',id:t.id,name:`${t.name} · 시간 1 · 기력 -${t.energy}`})), ...D.jobs.map(j=>({type:'work',id:j.id,name:`${j.name} · 시간 ${j.ap} · 기력 -${j.energy} · ${won(j.pay)}`})),{type:'rest',id:'rest',name:'잠깐 쉬기 · 시간 1 · 기력 +35'}];
      const choices = el('div','growth-options');
      options.forEach(o => { const b=button(`${o.name} 예약`,'secondary',()=>{
        const r=E.setSchedule(state,[...state.growth.schedule,{type:o.type,id:o.id}]);
        if(r.error){toast(r.error);return;} state=r.state;persist();schedulePlanner();
      }); b.disabled=!!E.setSchedule(state,[...g.schedule,{type:o.type,id:o.id}]).error; choices.append(b); });
      body.append(choices,el('h3','','오늘의 계획'));
      g.schedule.forEach((entry,i)=>body.append(el('p','',`${i+1}. ${E.scheduleItem(entry).name}`)));
      if(!g.schedule.length)body.append(el('p','muted-note','활동을 예약한 뒤 하나씩 실행해 주세요. 예약에는 시간이나 비용이 들지 않아요.'));
      if(g.schedule.length){
        const expected=JSON.stringify(state),first=g.schedule[0],blocked=E.reason(state,first.type,first.id);
        const run=button('다음 일정 실행','primary',()=>{const r=E.runSchedule(state,expected);if(r.error){toast(r.error);return;}state=r.state;render();persist();if(first.type==='work') showWorkPresentation([first.id],true); else schedulePlanner();if(r.result.encounter){toast(`${r.result.encounter.title} · 수련이 잠깐 들렀어요`);showReaction({affection:r.result.encounter.affection,mood:r.result.encounter.mood});}});
        run.disabled=!!blocked;body.append(run);
        // One click for the whole plan; stops at the first entry that can no longer run.
        const all=button(`남은 일정 ${g.schedule.length}개 모두 실행`,'secondary',()=>{const r=E.runAllSchedule(state,expected);if(r.error){toast(r.error);return;}state=r.state;render();persist();closeModal();setChoosing(false);
          toast(`일정 ${r.results.length}개를 마쳤어요${r.stopped?` · 멈춘 이유: ${r.stopped}`:''}`);const met=r.results.find(x=>x.encounter);if(met)showEncounter(met.encounter);
          const worked=g.schedule.slice(0,r.results.length).filter(x=>x.type==='work').map(x=>x.id);if(worked.length)showWorkPresentation(worked,true);});
        all.dataset.scheduleAll='';all.disabled=!!blocked||g.schedule.length<2;body.append(all);if(blocked)body.append(el('p','blocked-reason',blocked));
        const clear=button('예약 비우기','secondary',()=>{const r=E.setSchedule(state,[]);if(r.error){toast(r.error);return;}state=r.state;persist();schedulePlanner();});clear.disabled=!!E.setSchedule(state,[]).error;body.append(clear);
      }
      body.append(el('p','muted-note','실행할 때 실제 시간과 기력을 확인합니다. 다른 활동으로 자원이 줄면 예약이 막힐 수 있으며, 다음 날에는 남은 예약이 비워집니다.'),button('열린 이야기 확인','secondary',storyHub));
    });
  }
  function dressingRoom() {
    openModal('수련의 옷장', body => {
      $('modal').dataset.interior = 'room';
      body.append(el('p', 'modal-description', '보유한 옷과 소품을 직접 입혀 주세요. 갈아입기는 무료이며 시간을 사용하지 않아요.'));
      const layout = el('div', 'dressing-layout'), controls = el('div', 'dressing-controls');
      layout.append(fittingScene(state.outfit, state.legwear), controls); body.append(layout);
      controls.append(el('small', 'product-kind', '지금 입고 있는 코디'), el('h3', '', outfitLabel(state.outfit, state.legwear)), el('h4', '', '의상'));
      D.outfits.filter(o => state.owned.includes(o.id)).forEach(o => {
        const b = button(`${state.outfit === o.id ? '✓ ' : ''}${o.name}${state.outfit === o.id ? ' · 착용 중' : ' · 갈아입기'}`, 'wardrobe-option', () => doAction('equip', o.id, true));
        b.disabled = state.outfit === o.id; b.dataset.outfitId = o.id; controls.append(b);
      });
      controls.append(el('h4', '', '수련의 헤드셋 · 기본 보유'));
      const headsetIcon=el('img','accessory-icon');headsetIcon.src=D.neckAccessories[0].image;headsetIcon.alt='수련의 검은색 헤드셋';controls.append(headsetIcon,el('p','muted-note','모든 의상에서 자유롭게 착용하거나 벗을 수 있어요. 비용과 시간을 사용하지 않아요.'));
      [['none','헤드셋 벗기'],['headset','헤드셋 착용']].forEach(([id,name])=>{
        const b=button(name,'wardrobe-option',()=>doAction('equipNeckAccessory',id,true));
        b.disabled=!!E.reason(state,'equipNeckAccessory',id);b.setAttribute('aria-pressed',String(state.neckAccessory===id));b.dataset.neckAccessory=id;controls.append(b);
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
    let outfit = state.outfit, legwear = state.legwear, neck = state.neckAccessory;
    openModal(`${item.name} · 외출 준비`, body => {
      body.append(el('p', 'modal-description', `${timeLabel(D.timeForAp(state.ap))}에 출발해요. 장소와 코디를 확인해 주세요. ${won(item.cost)} · 시간 ${item.ap}칸 · 기력 ${item.energy}. 출발 전까지 돈과 시간이 줄지 않아요.`));
      const layout = el('div', 'dressing-layout'), preview = artScene(item.location, outfit, legwear), controls = el('div', 'dressing-controls');
      layout.append(preview, controls); body.append(layout);
      controls.append(el('small', 'product-kind', D.locations[item.location].name), el('h3', '', '오늘, 함께할 모습'));
      const outfitSelect = el('select'), accessorySelect = el('select'); outfitSelect.id = 'date-outfit'; accessorySelect.id = 'date-accessory';
      function field(text, select) { const label = el('label', 'dress-field', text); label.append(select); controls.append(label); }
      D.outfits.filter(o => state.owned.includes(o.id)).forEach(o => { const option = el('option', '', o.name); option.value = o.id; outfitSelect.append(option); }); outfitSelect.value = outfit;
      field('의상 선택', outfitSelect); field('스타킹 선택', accessorySelect);
      const neckSelect=el('select');neckSelect.id='date-neck';[['none','미착용'],['headset','수련의 헤드셋']].forEach(([id,name])=>{const option=el('option','',name);option.value=id;neckSelect.append(option);});neckSelect.value=neck;field('헤드셋',neckSelect);neckSelect.addEventListener('change',()=>{neck=neckSelect.value;refresh();});
      const caption = el('p', 'muted-note'); controls.append(caption);
      function refresh() {
        accessorySelect.replaceChildren();
        D.accessories.filter(a => state.ownedAccessories.includes(a.id) && (outfit === 'skirt' || a.id === 'none')).forEach(a => { const option = el('option', '', a.name); option.value = a.id; accessorySelect.append(option); });
        if (outfit !== 'skirt') legwear = 'none'; accessorySelect.value = legwear; accessorySelect.disabled = outfit !== 'skirt';
        preview.dataset.framing = 'full';
        preview.querySelector('img').src = D.characterImage(outfit, legwear, 'neutral', neck); preview.querySelector('img').alt = outfitLabel(outfit, legwear); caption.textContent = outfitLabel(outfit, legwear);
      }
      outfitSelect.addEventListener('change', () => { outfit = outfitSelect.value; refresh(); }); accessorySelect.addEventListener('change', () => { legwear = accessorySelect.value; refresh(); }); refresh();
      controls.append(el('p', 'date-total', `데이트 후 잔액 ${won(state.money - item.cost)} · 시간 ${state.ap - item.ap}칸 · 기력 ${state.energy - item.energy}\n호감 ${state.affection} → ${Math.min(100,state.affection+item.affection)} · 신뢰 ${state.trust} → ${Math.min(100,state.trust+item.trust)}`));
      controls.append(button('데이트 진행 · 이 차림으로 출발', 'primary', () => {
        const result = E.dateWithOutfit(state, item.id, outfit, legwear, neck);
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
      [...state.memories].reverse().forEach(m => { const date = D.dates.find(d => d.id === m.date), card = el('article', 'memory-card'); card.append(artScene(date.location, m.outfit, m.legwear, 'neutral', m.time || 'night', m.neckAccessory || 'none'), el('small', 'product-kind', `${m.day}일째 · ${timeLabel(m.time)}${m.time ? ' 출발' : ''}`), el('h3', '', date.name), el('p', '', outfitLabel(m.outfit, m.legwear))); if (m.choices) { card.append(el('p','memory-choice',m.choices.map((id,i)=>N.script('date',m.date)[i].choices.find(c=>c.id===id).label).join(' → '))); card.append(button('그날의 대화 다시 읽기','secondary',()=>readMemory(m))); } if(m.keptPromise) card.append(el('small','', '함께 정한 산책 약속을 지킨 날')); grid.append(card); }); body.append(grid);
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
      const neck = select('gallery-neck', '헤드셋', [['none','미착용'],['headset','착용']], 'none');
      function refresh() {
        fill(accessory, D.accessories.filter(a => outfit.value === 'skirt' || a.id === 'none').map(a => [a.id,a.name]), accessory.value);
        accessory.disabled = outfit.value !== 'skirt';
        fill(expression, D.availableExpressions(outfit.value).map(e => [e.id,e.name]), expression.value);
        preview.style.backgroundImage = `url("${D.sceneImage(place.value, time.value)}")`;
        preview.dataset.framing = D.characterFraming(D.characterImage(outfit.value, accessory.value, expression.value, neck.value));
        const img = preview.querySelector('img'); img.src = D.characterImage(outfit.value, accessory.value, expression.value, neck.value);
        img.alt = `수련 · ${outfitLabel(outfit.value, accessory.value)} · ${D.expressions.find(e => e.id === expression.value).name}`;
      }
      [place,time,outfit,accessory,expression,neck].forEach(input => input.addEventListener('change', refresh)); refresh();
      const layout = el('div', 'gallery-layout'); layout.append(preview, controls);
      body.append(layout, el('p', 'muted-note', '카페·연습실은 낮과 저녁 배경, 공연장은 공용 실내 배경을 사용해요.'), button('추억 앨범으로', 'secondary', album));
    });
  }
  function wardrobe() {
    dressingRoom();
  }
  function readMemory(m,back=album) {
    openModal('그날의 대화', body => {
      body.append(artScene(D.dates.find(d=>d.id===m.date).location,m.outfit,m.legwear,'smile',m.time,m.neckAccessory || 'none'));
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
      const expression=n.expression || (['score','boundary','repair'].includes(a.id)?'thoughtful':'neutral');
      layout.append(artScene(state.location,a.outfit,a.legwear,expression,a.time,a.neckAccessory || 'none'),prose); body.append(layout);
      if (step) { const prev=nodes[step-1].choices.find(c=>c.id===a.choices[step-1]); prose.append(...choiceLines(prev,expression)); }
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
      prose.append(...sceneLines(n,expression));
      if(n.choices.some(c=>c.mood))prose.append(el('p','muted-note',`수련의 기분 ${state.growth.mood}/100 · 말에 따라 기분과 관계가 달라집니다.`));
      const choices=el('div','story-choices');
      n.choices.forEach(c=> { const b=button(c.label,'secondary',()=> {
        const stageBefore=N.stage(state), speechBefore=state.story.speech||'polite', moodBefore=state.growth.mood;
        const result=E.chooseStory(state,c.id,step);
        if(result.error) { toast(result.error); return; }
        state=result.state; render(); persist(); sfx('select');
        const fx={affection:c.affection||0,trust:c.trust||0,mood:state.growth.mood-moodBefore};
        if(state.story.active) { storyScene(); showReaction(fx); }
        else { storyResult({fx,card:N.stage(state)!==stageBefore?N.stage(state):(state.story.speech||'polite')!==speechBefore?'말을 놓은 사이':''}); }
      }); const blocked=E.choiceReason(state,c); b.disabled=!!blocked; if(blocked)b.textContent+=` · ${blocked}`; if(c.requireStat){ b.classList.add('stat-choice'); b.prepend(el('span',`stat-chip ${c.requireStat}`,E.statNames[c.requireStat])); } b.dataset.storyChoice=c.id; choices.append(b); }); prose.append(choices);
      body.append(el('p','muted-note','닫아도 현재 선택은 저장됩니다. 관계와 이야기에서 이어 읽을 수 있어요. 진행 중에는 다른 활동과 다음 날 이동을 잠시 기다려 주세요.'));
      body.append(button('저장 메뉴','secondary',()=>slots('save')));
      if(a.kind==='date'&&D.dates.find(d=>d.id===a.id)?.theme)body.append(button('둘이 체험하기 · 탐색과 퍼즐','secondary',()=>activityMenu(a.id)));
    });
    stageStory(a.kind==='date'?'함께하는 외출':'수련의 이야기');
    // A new scene is a new reading position; announce its text, without moving to a choice.
    const text=$('modal-body').querySelector('.story-text'), reading=$('modal').classList.contains('story-stage')?text.closest('.story-prose'):text; text.tabIndex=-1; reading.tabIndex=-1; reading.focus({preventScroll:true});
  }
  // ---------- visual-novel story stage ----------
  // Lines carry who / text / cues (face, cam, bg, sfx). Old paragraph scripts are split at the quotes so
  // Sulien's words always get her name tag; faces fall back to simple word hints.
  const faceHints = [[/웃|미소|반가|웃음/, 'smile'], [/놀라|깜짝/, 'surprised'], [/붉|부끄|수줍/, 'shy'], [/걱정|미안|불안|아끼/, 'worried'], [/장난|농담/, 'playful'], [/망설|고민|생각|조용히|머뭇/, 'thoughtful']];
  const hintFace = text => faceHints.find(([re]) => re.test(text))?.[1];
  const speakerName = who => ({ '수련': '수련', '나': '나', '속': '속마음', '기억': '기억' })[who] ?? '';
  function lineEl(who, text, cue = {}) {
    const kind = who === '수련' ? 'story-text story-line' : who === '나' ? 'story-player' : who === '속' ? 'story-inner' : who === '기억' ? 'story-recall' : 'story-text narration';
    const p = el('p', kind, text); p.dataset.speaker = speakerName(who);
    ['face','cam','bg','sfx'].forEach(k => { if (cue[k]) p.dataset[k] = cue[k]; });
    return p;
  }
  function splitText(text) {
    const out = []; let last = 0;
    text.replace(/“([^”]*)”/g, (m, quote, at) => { const before = text.slice(last, at).trim(); if (before) out.push(['', before]); if (quote.trim()) out.push(['수련', quote.trim()]); last = at + m.length; return m; });
    const rest = text.slice(last).trim(); if (rest) out.push(['', rest]);
    return out.map(([who, t]) => [who, t, hintFace(t) ? { face: hintFace(t) } : {}]);
  }
  const sceneLines = n => (n.lines || splitText(n.text)).map(([who, text, cue]) => lineEl(who, text, cue));
  function choiceLines(c) {
    const player = c.say ? lineEl('나', c.say) : c.say === '' ? null : lineEl('나', c.label);
    if (player && !c.say) player.classList.add('action');
    return [player, ...(c.react || splitText(c.reply)).map(([who, text, cue]) => lineEl(who, text, cue))].filter(Boolean);
  }
  function stageStory(kind, sub, done) {
    const body=$('modal-body'), prose=body.querySelector('.story-prose'), choices=body.querySelector('.story-choices');
    if(!prose) return;
    $('modal').classList.add('story-stage');
    const tools=el('div','story-tools'); [...body.children].filter(c=>c.matches('button,.muted-note,.story-progress')).forEach(c=>tools.append(c));
    const bar=el('div','vn-toolbar'), autoBtn=button(prefs.autoRead?'자동 ON':'자동','vn-tool',()=>toggleAuto(autoBtn));
    autoBtn.setAttribute('aria-pressed',String(!!prefs.autoRead));
    bar.append(button('기록','vn-tool',showLog),autoBtn,button('건너뛰기','vn-tool',skipToChoice),button('숨기기','vn-tool',()=>hideStage(true)));
    tools.prepend(bar); body.append(tools);
    const lines=[...prose.children].filter(c=>c.matches('p')&&!c.classList.contains('muted-note'));
    lines.forEach(line=>{ if(line.dataset.speaker===undefined) line.dataset.speaker=line.classList.contains('story-recall')?'기억':''; });
    // Resolve the face for every line once: explicit cue, otherwise keep the previous face.
    const art=body.querySelector('.art-scene'), a=state.story.active||state.story.last||{};
    let face=art?.dataset.face||'neutral'; lines.forEach(line=>{ face=line.dataset.face||face; line.dataset.face=face; });
    lines.forEach(line=>{ const text=line.textContent; line.textContent=''; typeset(line,text); });
    prose.classList.add('vn-box');
    const tag=el('span','vn-speaker'), subLine=el('small','vn-sub',sub||`${kind} · ${D.locations[state.location].name} · DAY ${state.day}`);
    const foot=el('div','vn-foot'); foot.append(el('span','vn-progress'),el('span','vn-hint','클릭하거나 SPACE를 눌러 계속하기'),button('CONTINUE ◇','vn-next',()=>advanceReveal()));
    prose.prepend(tag,subLine); prose.append(foot);
    if (art) { const bg=el('div','vn-bg'); bg.style.backgroundImage=art.style.backgroundImage; art.prepend(bg); art.querySelector('img')?.classList.add('vn-face'); }
    const ctx={art,outfit:a.outfit||state.outfit,legwear:a.legwear||state.legwear,neck:a.neckAccessory||'none',face:'',typingUntil:0,blip:0};
    const firstImg=art?.querySelector('img.vn-face'); if(firstImg&&lines[0]){ ctx.face=lines[0].dataset.face; firstImg.src=D.sceneCharacter(ctx.outfit,ctx.legwear,ctx.face,ctx.neck); art.dataset.framing=D.characterFraming(firstImg.getAttribute('src')); }
    const extra=[choices,...prose.querySelectorAll('.muted-note'),...body.querySelectorAll('.story-summary-card')].filter(Boolean);
    if(!lines.length){ extra.forEach(e=>e.classList.remove('line-hidden')); return; }
    startReveal(prose,lines,tag,done||null,extra);
    reveal.onShow=()=>stageLine(ctx); reveal.hurry=()=>{ const line=reveal.lines[reveal.index]; if(Date.now()<ctx.typingUntil&&!line.classList.contains('typed')){ line.classList.add('typed'); ctx.typingUntil=0; clearInterval(ctx.blip); return true; } return false; };
    stageLine(ctx);
    prose.addEventListener('click',e=>{ if(!e.target.closest('button')) advanceReveal(); });
  }
  function stageLine(ctx) {
    const r=reveal; if(!r) return; const line=r.lines[r.index]; if(!line) return;
    const {face,cam,bg,sfx:sound}=line.dataset;
    r.box.classList.toggle('is-narration',!line.dataset.speaker); r.box.classList.toggle('is-inner',line.classList.contains('story-inner')); r.box.classList.toggle('is-me',line.dataset.speaker==='나');
    if(ctx.art&&face&&face!==ctx.face) setFace(ctx,face);
    if(cam) setCam(cam);
    if(bg&&ctx.art) setBackdrop(ctx.art,bg);
    if(sound) sfx(sound);
    const chars=line.querySelectorAll('.ch').length, typing=prefs.reduceMotion?0:chars*26;
    line.classList.toggle('typed',!typing); line.style.display='none'; void line.offsetWidth; line.style.display='';
    ctx.typingUntil=Date.now()+typing; clearInterval(ctx.blip);
    if(!logged.has(line)){ logged.add(line); storyLog.push([line.dataset.speaker||'',line.textContent]); storyLog=storyLog.slice(-120); }
    clearTimeout(ctx.autoTimer); if(prefs.autoRead&&r.index<r.lines.length-1) ctx.autoTimer=setTimeout(()=>{ if(reveal===r&&!$('modal').classList.contains('vn-hide')) advanceReveal(); },autoPace(typing+1500+chars*35));
    if(typing&&prefs.blip&&line.dataset.speaker){ sfx('blip'); ctx.blip=setInterval(()=>{ if(Date.now()>=ctx.typingUntil||!line.isConnected){clearInterval(ctx.blip);return;} sfx('blip'); },85); }
  }
  function toggleAuto(b) {
    prefs.autoRead=!prefs.autoRead; savePrefs(); b.textContent=prefs.autoRead?'자동 ON':'자동'; b.setAttribute('aria-pressed',String(prefs.autoRead));
    if(prefs.autoRead&&reveal&&reveal.index<reveal.lines.length-1) setTimeout(()=>advanceReveal(),900);
  }
  function skipToChoice() { const r=reveal; if(!r||r.index>=r.lines.length-1) return; r.index=r.lines.length-1; showLine(); r.hurry?.(); }
  function hideStage(on) { $('modal').classList.toggle('vn-hide',on); }
  function showLog() {
    const old=$('modal').querySelector('.vn-log'); if(old){ old.remove(); return; }
    const panel=el('div','vn-log'); panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','대사 기록');
    const head=el('div','vn-log-head'); head.append(el('strong','','대사 기록'),button('닫기','vn-tool',()=>panel.remove()));
    const list=el('div','vn-log-list'); storyLog.forEach(([who,text])=>{ const row=el('p',who?'':'narration'); if(who) row.append(el('b','',who)); row.append(document.createTextNode(text)); list.append(row); });
    panel.append(head,list); $('modal').append(panel); list.scrollTop=list.scrollHeight;
  }
  function setFace(ctx, face) {
    ctx.face=face;
    const path=D.sceneCharacter(ctx.outfit,ctx.legwear,face,ctx.neck), old=ctx.art.querySelector('img.vn-face:not(.leaving)');
    if(old&&old.getAttribute('src')===path) return;
    const img=el('img','vn-face'); img.src=path; img.alt=old?.alt||'수련'; ctx.art.dataset.framing=D.characterFraming(path);
    if(old){ img.classList.add('entering'); old.after(img); old.classList.add('leaving'); requestAnimationFrame(()=>img.classList.remove('entering')); setTimeout(()=>old.remove(),320); } else ctx.art.append(img);
  }
  function setCam(cam) {
    const d=$('modal'), distance=['close','lean','back','away'];
    if(cam==='shake'||cam==='black'){ d.classList.remove(`cam-${cam}`); void d.offsetWidth; d.classList.add(`cam-${cam}`); setTimeout(()=>d.classList.remove(`cam-${cam}`),cam==='black'?1600:600); return; }
    if(cam==='blur'){ d.classList.add('cam-blur'); return; }
    distance.forEach(k=>d.classList.remove(`cam-${k}`)); d.classList.remove('cam-blur');
    if(distance.includes(cam)) d.classList.add(`cam-${cam}`);
  }
  function setBackdrop(art, name) {
    const url=`url("assets/environment/${name}.png")`, top=art.querySelector('.vn-bg:last-of-type');
    if(top&&top.style.backgroundImage.includes(`${name}.png`)) return;
    const bg=el('div','vn-bg entering'); bg.style.backgroundImage=url; if(top) top.after(bg); else art.prepend(bg);
    requestAnimationFrame(()=>bg.classList.remove('entering'));
  }
  // Choice feedback: Sulien's face answers first (next line), the numbers float up beside her.
  function showReaction(fx) {
    const parts=[]; if(fx.affection>0) parts.push(['heart',`♡ 호감 +${fx.affection}`]); if(fx.trust>0) parts.push(['trust',`◇ 신뢰 +${fx.trust}`]);
    if(fx.mood) parts.push([fx.mood>0?'mood':'mood down',`기분 ${fx.mood>0?'+':'−'}${Math.abs(fx.mood)}`]);
    if(!parts.length) return;
    const host=$('modal').open?$('modal'):$('game'), box=el('div','vn-react'); box.setAttribute('role','status');
    parts.forEach(([k,t],i)=>{ const b=el('span',`vn-react-item ${k}`,t); b.style.animationDelay=`${i*180}ms`; box.append(b); });
    host.append(box); setTimeout(()=>box.remove(),2600);
    sfx(fx.affection>0?'heart':fx.trust>0?'trust':'select');
  }
  function stageCard(title, small) {
    const host=$('modal').open?$('modal'):$('game'), card=el('div','vn-stage-card'); card.setAttribute('role','status');
    card.append(el('small','',small||'RELATIONSHIP'),el('strong','',title),el('span','','두 사람의 거리가 바뀌었어요'));
    const done=()=>{ card.remove(); host.classList.remove('carding'); };
    card.addEventListener('click',done); host.classList.add('carding'); host.append(card); sfx('chord'); setTimeout(done,3600);
  }
  function storyResult(opts={}) {
    const last=state.story.last;
    const nodes=N.script(last.kind,last.id), finalChoice=nodes[last.choices.length-1].choices.find(c=>c.id===last.choices.at(-1));
    openModal('함께 남긴 한 페이지',body=> {
      body.append(el('small','story-progress',N.stage(state)));
      const layout=el('div','story-layout'), prose=el('div','story-prose');
      if(opts.fx){ layout.append(artScene(state.location,last.outfit,last.legwear,'neutral',last.time,last.neckAccessory||'none'),prose); prose.append(...choiceLines(finalChoice)); body.append(layout); }
      const card=el('div','story-summary-card');
      card.append(el('span','eyebrow',last.kind==='date'?'오늘의 외출':'이야기 한 장'),el('h3','',last.kind==='date'?D.dates.find(d=>d.id===last.id).name:N.events.find(e=>e.id===last.id).title));
      last.choices.forEach((id,i)=> { const c=nodes[i].choices.find(c=>c.id===id); card.append(el('p','story-player',c.label),el('p','story-reply',c.reply)); });
      if(last.kind==='date') card.append(el('p','story-outcome',`호감 +${last.affection} · 신뢰 +${last.trust} · 코디와 대화를 추억 앨범에 남겼어요.`));
      else if(last.id.startsWith('growth-')) card.append(el('p','story-outcome',`호감 +${last.affection} · 신뢰 +${last.trust} · 수련의 기분 ${state.growth.mood}/100`));
      else if(last.affection||last.trust) card.append(el('p','story-outcome',`호감 +${last.affection} · 신뢰 +${last.trust}`));
      const course=last.kind==='date'&&D.dates.find(d=>d.id===last.id&&d.theme);
      if(course){card.append(el('p','story-outcome',`탐방 기록 · ${course.souvenir} · ${C.visited(state,course.theme)}/8곳`),button('탐방 수첩 확인','secondary',courseBook));}
      const next=N.available(state)[0], actions=el('div','summary-actions');
      if(next) actions.append(button(`새 이야기 · ${next.title}`,'primary',()=>beginStory(next.id)));
      actions.append(button('일상으로 돌아가기','secondary',closeModal),button('관계와 이야기','secondary',storyHub));
      card.append(actions); body.append(card);
    });
    if(!opts.fx) return;
    stageStory('함께 남긴 한 페이지',`${N.stage(state)} · DAY ${state.day}`);
    showReaction(opts.fx);
    const showCard=()=>{ if(opts.card) stageCard(opts.card); };
    if(reveal&&reveal.lines.length>1){ const prior=reveal.onShow; reveal.onShow=()=>{ prior?.(); if(reveal.index===reveal.lines.length-1){ showCard(); opts.card=''; } }; } else setTimeout(showCard,600);
    const reading=$('modal-body').querySelector('.story-prose'); if(reading){ reading.tabIndex=-1; reading.focus({preventScroll:true}); }
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
      summary.append(el('p','muted-note','버츄얼 아이돌 연습생이 되기 전의 대학 시절. 당신과 수련은 같은 전공·같은 학년의 친구입니다. 기본 관계 이야기는 무료 산책으로, 탐방 이야기는 서로 다른 코스를 경험하며 열려요.'));
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
      if (state.lastWeek) body.append(button('지난주 결산 다시 보기', 'secondary', () => weekReport()));
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
      body.append(el('p', 'modal-description', '행동할 때마다 자동 저장됩니다. 수동 저장은 세 칸을 사용할 수 있어요. 게임 중 F5는 빠른 저장, F9는 빠른 불러오기예요. 브라우저 데이터를 지우기 전에는 파일로 내보내 주세요.'));
      const list = el('div', 'choice-list');
      for (const i of save ? [1, 2, 3] : ['quick', 0, 1, 2, 3]) {
        const saved = E.storage.load(i), label = i === 'quick' ? '빠른 저장 (F5)' : i === 0 ? '자동 저장' : `기억 ${String(i).padStart(2,'0')}`;
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
  function guide() { openModal('작은 일상을 쌓는 방법', body => { const list = el('ol', 'guide'); ['PC 전용 게임입니다. 1280 × 720 이상의 브라우저 화면에서 마우스와 키보드를 사용해 주세요. Tab으로 이동, Enter로 선택, Esc로 창을 닫습니다. 산책길 탐색은 방향키 또는 WASD로 이동합니다.', '하루에 시간 3칸이 주어집니다. 일과 데이트는 시간과 기력을 사용합니다.', '일하기로 주인공의 돈을 벌어요. 급여는 활동 완료 즉시 소지금에 더해집니다.', '상점에서 의상과 스타킹을 산 뒤 수련의 옷장에서 직접 입혀 주세요. 구매는 호감을 직접 올리지 않습니다.', '데이트는 하루 한 번. 장소를 고르고 보유한 코디를 확인한 뒤 출발하세요. 추억 앨범에 그날의 모습이 남아요.', '탐방 데이트 도중 또는 탐방 수첩에서 둘이 체험하기를 여세요. 산책길 탐색·음의 조각·추억 카드가 코스마다 12단계씩 있습니다.', '체험은 선택 사항이며 추가 비용이나 시간 제한이 없습니다. 힌트와 되돌리기로 편하게 진행해도 이야기 결말에는 불이익이 없어요.', '쉬면 시간 1칸으로 기력 35를 회복합니다. 다음 날에는 시간 3칸과 기력 60을 회복합니다.', '활동은 자동 저장됩니다. 저장 메뉴에서 수동 저장과 파일 내보내기를 사용할 수 있어요. F5는 빠른 저장, F9는 빠른 불러오기입니다.', '매주 월요일 아침에는 지난 한 주의 결산이 도착해요. 일하는 날에는 가끔 수련이 들르기도 합니다. 관계 노트의 ‘수련의 마음’에서 두 사람의 거리를 확인하세요.', '결말을 본 뒤 새로운 일상을 시작하면 결말에 따라 회차 보너스를 받아요.'].forEach(t => list.append(el('li', '', t))); body.append(list, el('p', 'muted-note', '관계와 이야기에서 열린 장면과 다음 단서를 확인하세요. 기본 옷과 무료 산책으로 관계를 진전할 수 있어요. 고백은 연인·우정·보류 중 직접 선택합니다.'));
    }); }
  function settings() { openModal('환경 설정', body => {
    const textLabel=el('label','settings-row','본문 글자 크기'), select=el('select'); select.id='text-size'; [['normal','기본'],['large','크게'],['largest','아주 크게']].forEach(([value,text])=>{const option=el('option','',text);option.value=value;select.append(option);}); select.value=prefs.textSize; select.addEventListener('change',()=>{prefs.textSize=select.value;savePrefs();}); textLabel.append(select); body.append(textLabel,el('p','reading-sample','선택한 하루가 차곡차곡 쌓입니다. 편안한 크기로 이야기를 읽어 보세요.'));
    [['보조 일러스트 표시', 'portrait'], ['화면 움직임 줄이기', 'reduceMotion'], ['효과음 (선택·호감·메시지)', 'sfx'], ['대사 글자 소리', 'blip']].forEach(([text,key]) => { const label = el('label', 'settings-row', text); const input = el('input'); input.type = 'checkbox'; input.checked = prefs[key]; input.addEventListener('change', () => { prefs[key] = input.checked; savePrefs(); }); label.append(input); body.append(label); });
    const speedLabel = el('label', 'settings-row', '자동 진행 속도'), speed = el('select'); speed.id = 'auto-speed'; [['slow','느리게'],['normal','보통'],['fast','빠르게']].forEach(([value,text]) => { const option = el('option','',text); option.value = value; speed.append(option); }); speed.value = prefs.autoSpeed; speed.addEventListener('change', () => { prefs.autoSpeed = speed.value; savePrefs(); }); speedLabel.append(speed); body.append(speedLabel);
    const boxLabel = el('label', 'settings-row', '대사창 불투명도'), box = el('input'); box.id = 'box-alpha'; box.type = 'range'; box.min = 40; box.max = 100; box.value = prefs.boxAlpha; box.setAttribute('aria-label', '대사창 불투명도'); box.addEventListener('input', () => { prefs.boxAlpha = Number(box.value); savePrefs(); }); boxLabel.append(box); body.append(boxLabel);
    const label = el('label', 'settings-row', '배경음 크기'); const input = el('input'); input.type = 'range'; input.min = 0; input.max = 100; input.value = prefs.volume; input.setAttribute('aria-label', '배경음 크기'); input.addEventListener('input', () => { prefs.volume = Number(input.value); savePrefs(); }); label.append(input); body.append(label, el('p', 'settings-note', '상단 음표 버튼으로 배경음을 켜거나 끌 수 있어요. 음원 파일 없이 합성한 잔잔한 선율입니다.\n모든 활동은 버튼으로 선택합니다. Tab으로 이동하고 Enter로 선택하며, Esc로 창을 닫을 수 있어요. 게임 중 F5는 빠른 저장, F9는 빠른 불러오기입니다.'));
    if (!active) body.append(button('저장 파일 불러오기', 'secondary', () => slots('load')));
  }); }
  function legacyProfile() { openModal('수련 · 水蓮', body => { body.append(el('p', 'profile-quote', '무대 위의 이름보다 먼저, 당신의 친구였던 수련.')); const list = el('dl', 'profile-list'); [['시점','Aqua Luna 본편 이전'],['소속','엔터테인먼트 입사 전 · 소속 없음'],['전공','실용음악과 · 보컬 전공'],['좋아하는 장르','발라드'],['주로 부르는 장르','발라드'],['당신과의 관계','같은 실용음악과 보컬 전공·같은 학년의 대학 친구'],['지금의 일상','발라드 실기곡을 연습하며 보컬 데모·작은 라이브를 준비하는 중'],['좋아하는 것','발라드 감상과 노래 부르기, 조용한 카페'],['성격','차분함 · 깊은 감수성 · 말보다 행동'],['호감',`${state.affection} / 100`],['신뢰',`${state.trust} / 100`],['현재 의상',D.outfits.find(o => o.id === state.outfit).name]].forEach(([k,v]) => list.append(el('dt','',k), el('dd','',v))); body.append(list, el('p','muted-note','Aqua Luna의 세계관과 수련의 기본 성격을 잇는 과거 이야기입니다. 현재 관계: ' + N.stage(state) + ' · 관계와 이야기에서 함께한 선택과 다음 단서를 확인해 보세요.')); }); }
  $('new-game').addEventListener('click', () => hasSession || E.storage.load(0) ? confirm('새로운 일상', unsaved ? '현재 저장되지 않은 진행이 있습니다. 필요한 경우 먼저 파일로 보관해 주세요. 새로 시작하면 현재 진행이 바뀝니다.' : '새로 시작하면 자동 저장 기록이 바뀝니다. 수동 저장 기록은 유지됩니다.', '새로 시작', () => begin()) : begin());
  $('continue-game').addEventListener('click', () => { const saved = hasSession ? state : E.storage.load(0); if (saved) begin(saved); else toast('불러올 수 있는 자동 저장이 없어요.'); });
  $('brand').addEventListener('click', () => { if (active) { persist(); showTitle(); } });
  $('home-button').addEventListener('click', () => { persist(); showTitle(); });
  $('intro-home').addEventListener('click', () => { persist(); showTitle(); $('continue-game').focus({ preventScroll: true }); });
  $('intro-save').addEventListener('click', () => slots('save'));
  $('sound').addEventListener('click', toggleSound); $('settings').addEventListener('click', settings); $('guide-button').addEventListener('click', guide);
  $('work-button').addEventListener('click', () => activities('work')); $('date-button').addEventListener('click', () => activities('date')); $('wardrobe-button').addEventListener('click', wardrobe); $('bond-button').addEventListener('click', relationshipNote);
  $('budget-button').addEventListener('click', budgetPlanner);
  $('schedule-button').addEventListener('click', schedulePlanner);
  $('shop-button').addEventListener('click', shop);
  $('album-button').addEventListener('click', album);
  $('story-button').addEventListener('click', storyHub);
  $('backup-button').addEventListener('click', exportSave);
  $('rest-button').addEventListener('click', () => doAction('rest')); $('next-day').addEventListener('click', () => state.ap ? confirm('하루 마무리', `남은 시간 ${state.ap}칸을 사용하지 않고 다음 날로 갈까요?`, '다음 날로', () => doAction('nextDay')) : doAction('nextDay'));
  $('journal-button').addEventListener('click', journal); $('save-button').addEventListener('click', () => slots('save')); $('load-button').addEventListener('click', () => slots('load')); $('close-modal').addEventListener('click', closeModal);
  $('character').addEventListener('error', () => { $('character').hidden = true; });
  $('dialogue').addEventListener('click', () => setChoosing(true, true));
  $('choice-close').addEventListener('click', () => setChoosing(false, true));
  $('sulien-touch').addEventListener('click', touchSulien); $('gift-button').addEventListener('click', giftMenu); $('talk-button').addEventListener('click', talkScene);
  $('phone-button').replaceChildren(document.createTextNode('휴대폰 '), el('i', '', '●'));
  $('phone-button').setAttribute('aria-label', '휴대폰 열기');
  const phoneApps = [
    ['messages', '메시지', '✉', openMessenger, 'mint'], ['calendar', '달력', '▦', () => calendarView(), 'peach'],
    ['schedule', '능력치·일정', '✓', schedulePlanner, 'blue'], ['budget', '저축 목표', '₩', budgetPlanner, 'gold'],
    ['shop', '상점', '♧', shop, 'peach'], ['wardrobe', '옷장', '♧', wardrobe, 'lavender'],
    ['album', '앨범', '▧', album, 'blue'], ['journal', '기록', '≡', journal, 'gold'],
    ['work', '일하기', '▣', () => activities('work'), 'blue'], ['date', '데이트', '♡', () => activities('date'), 'peach'],
    ['story', '이야기', '☾', storyHub, 'lavender'], ['bond', '우리 사이', '♥', relationshipNote, 'mint'],
    ['gift', '선물', '◇', giftMenu, 'gold'], ['save', '저장', '↓', () => slots('save'), 'mint'],
    ['load', '불러오기', '↺', () => slots('load'), 'blue'], ['settings', '설정', '⚙', settings, 'lavender']
  ];
  phoneApps.forEach(([id, label, icon, action, color]) => {
    const app = button('', 'phone-app', action); app.dataset.phoneApp = id;
    const tile = el('span', `phone-app-icon ${color}`, icon); tile.setAttribute('aria-hidden', 'true');
    const iconPath = { shop:'M5 7h14l1 14H4L5 7ZM8 8V6a4 4 0 0 1 8 0v2', wardrobe:'m8 3-5 3-2 5 4 2 2-3v11h10V10l2 3 4-2-2-5-5-3a4 4 0 0 1-8 0Z', album:'M3 3h18v18H3ZM3 16l5-5 5 6 3-3 5 6M15 7h2' }[id];
    if (iconPath) { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), path = document.createElementNS(svg.namespaceURI, 'path'); svg.setAttribute('viewBox', '0 0 24 24'); path.setAttribute('d', iconPath); svg.append(path); tile.replaceChildren(svg); }
    if (id === 'messages') { const badge = el('b', 'phone-app-badge'); badge.hidden = true; tile.append(badge); }
    app.append(tile, el('span', '', label)); $('phone-apps').append(app);
  });
  $('phone-close').addEventListener('click', closePhone); $('phone-button').addEventListener('click', openPhoneHome); $('phone-back').addEventListener('click', phoneBack);
  $('phone-home-button').addEventListener('click', openPhoneHome); $('phone-notification').addEventListener('click', openMessenger);
  $('modal-phone-home').addEventListener('click', () => { closeModal(); if (active && !$('play-screen').hidden) openPhoneHome(); });
  $('calendar-button').addEventListener('click', () => calendarView());
  $('intro-screen').addEventListener('click', e => { if (!e.target.closest('button,.intro-top')) advanceReveal(); });
  const showAuto = () => { $('intro-auto').textContent = `자동 재생 ${prefs.introAuto ? 'ON' : 'OFF'}`; $('intro-auto').setAttribute('aria-pressed', String(prefs.introAuto)); };
  showAuto();
  $('intro-auto').addEventListener('click', () => { prefs.introAuto = !prefs.introAuto; savePrefs(); showAuto(); if (prefs.introAuto && !cine.card) cineArm(1200); else if (!prefs.introAuto) clearTimeout(cine.timer); });
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const typing = e.target.closest?.('input,select,textarea'), onButton = e.target.closest?.('button');
    const advanceKey = e.key === ' ' || (e.key === 'Enter' && !onButton);
    // Quick save / load (F5 / F9). In a browser this also stops F5 from reloading the page mid-play.
    if ((e.key === 'F5' || e.key === 'F9') && hasSession && !typing) {
      e.preventDefault();
      if (e.key === 'F5') { toast(E.storage.save('quick', state) ? `빠른 저장 · ${state.day}일째` : '빠른 저장에 실패했어요. 파일 내보내기를 사용해 주세요.'); return; }
      const fresh = E.storage.load('quick');
      if (!fresh) { toast('빠른 저장 기록이 없어요. F5로 먼저 저장해 주세요.'); return; }
      if ($('modal').open) closeModal();
      closePhone(); begin(fresh); toast(`빠른 저장을 불러왔어요 · ${fresh.day}일째`); return;
    }
    if ($('modal').open && $('modal').classList.contains('story-stage') && !typing) {
      const k = e.key.toLowerCase();
      if (k === 'h') { e.preventDefault(); hideStage(!$('modal').classList.contains('vn-hide')); return; }
      if ($('modal').classList.contains('vn-hide')) { e.preventDefault(); hideStage(false); return; }
      if (k === 'l') { e.preventDefault(); showLog(); return; }
      if (k === 'a') { e.preventDefault(); const b=[...$('modal').querySelectorAll('.vn-tool')].find(x=>x.textContent.startsWith('자동')); if(b) toggleAuto(b); return; }
    }
    if ($('modal').open) {
      if ($('modal').classList.contains('story-stage') && advanceKey && !typing && (!onButton || e.target.classList.contains('vn-next'))) { if (advanceReveal()) e.preventDefault(); }
      return;
    }
    if (typing) return;
    if (!$('phone').hidden) {
      if (e.key === 'Escape') { e.preventDefault(); phoneBack(); }
      return;
    }
    if (!$('intro-screen').hidden && (advanceKey && (!onButton || e.target.id === 'intro-next'))) { e.preventDefault(); advanceReveal(); return; }
    if (!active || $('play-screen').hidden) return;
    if (!choosing && (advanceKey || (e.key === 'Enter' && e.target.id === 'dialogue-next'))) { e.preventDefault(); setChoosing(true, true); }
    else if (choosing && e.key === 'Escape') { e.preventDefault(); setChoosing(false, true); }
  });
  showTitle();
})();
