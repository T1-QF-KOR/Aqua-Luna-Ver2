/* Aqua Luna PC runtime. Story effects are committed once per saved line or choice. */
(() => {
  'use strict';
  const W = window.AquaWorld, R = window.AquaRadio, Story = window.AquaStory, Social = window.AquaSocial;
  const $ = id => document.getElementById(id);
  const SAVE_KEY = 'aqua-luna-campus-v2', PREF_KEY = `${SAVE_KEY}-prefs`;
  const times = ['아침', '오후', '노을', '밤'];
  const bg = { room: '../campus-v2/bg-v2/room.png', concert: '../campus-v2/bg-v2/concert.png',
    practice: '../campus-v2/bg-v2/practice.png', rooftop: '../campus-v2/bg-v2/rooftop.png', river: '../campus-v2/bg-v2/river.png',
    cafe: '../campus-v2/bg-v2/cafe.png', campus: '../campus-v2/bg-v2/campus-spring.png',
    campusSummer: '../campus-v2/bg-v2/campus-summer.png', campusAutumn: '../campus-v2/bg-v2/campus-autumn.png',
    campusWinter: '../campus-v2/bg-v2/campus-winter.png', riverSnow: '../campus-v2/bg-v2/riverSnow.png',
    nariChristmas: '../campus-v2/nari-christmas-cg-v2.png',
    seojinFirstSnow: '../campus-v2/seojin-first-snow-cg-v2.png', daeunTermEnd: '../campus-v2/daeun-term-end-cg-v2.png',
    home: '../campus-v2/bg-v2/home.png', homeNight: '../campus-v2/bg-v2/homeNight.png',
    night: '../campus-v2/bg-v2/night.png', karaoke: '../campus-v2/bg-v2/karaoke.png',
    classroom: '../campus-v2/bg-v2/classroom.png', library: '../campus-v2/bg-v2/library.png',
    dining: '../campus-v2/bg-v2/dining.png', radio: '../campus-v2/bg-v2/radio.png' };
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
  const illustrations = { nariChristmas: { person:'nari', flag:'sawNariChristmas', title:'대본을 접은 밤', date:'2026-12-24',
    caption:'외워 둔 문장 대신, 오늘 고른 말.', alt:'성탄 전날 밤 강변 벤치에 앉아 라벤더 니트와 아이보리 코트를 입고 미소 짓는 나리' },
    seojinFirstSnow:{person:'seojin',flag:'sawSeojinFirstSnow',title:'손바닥 위의 첫눈',date:'2026-11-25',caption:'바로 녹아도, 털어 내지 않은 마음.',alt:'긴 흑갈색 머리의 서진이 차콜 코트와 블랙 하이넥 차림으로 첫눈을 손바닥에 받는 강변 장면'},
    daeunTermEnd:{person:'daeun',flag:'sawDaeunTermEnd',title:'숫자보다 먼저 본 얼굴',date:'2026-12-18',caption:'단톡방 밖에서, 너 한 사람에게.',alt:'겨울 강변 난간에서 주황색 더플코트를 입고 휴대폰을 내려둔 채 조용히 바라보는 다은'} };
  let s = null, toastTimer, typingTimer, autoTimer, fullText = '', ctx, mapSelection = null, voicePosition = null;
  let prefs = { sfx: false, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    textSpeed: 26, textSize: 24, autoDelay: 2.5, showBond: false, skipUnread:false, bgmVolume:0.5, voiceVolume:0.8 }, auto = false;
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
    window.AquaAudio.pauseVoice();
    $('modal').classList.remove('calendar-modal');
    $('modal').classList.remove('illustration-modal');
    $('modal').classList.remove('completed-illustration');
    if (s?.scene && !s.scene.queue[s.scene.index]?.choice) $('line').textContent = fullText;
    $('modal-title').textContent = title;
    $('modal-content').innerHTML = html;
    if (!$('modal').open) $('modal').showModal();
  }
  function closeModal() {
    if ($('modal').open) $('modal').close();
    if (!document.hidden) window.AquaAudio.resumeVoice();
    scheduleAuto();
  }
  function setBg(id) {
    if (s && id === 'campus') {
      const month = Number(s.date.slice(5, 7));
      if (month >= 12 || month <= 2) id = 'campusWinter';
      else if (month >= 10 && month <= 11) id = 'campusAutumn';
      else if (s.date >= '2026-05-15' && s.date <= '2026-09-30') id = 'campusSummer';
    }
    if (s && id === 'river' && s.date === '2026-11-25') id = 'riverSnow';
    if (s && (id === 'home' || (id === 'room' && window.AquaAutumn.away(s)))) id = (s.scene?.time ?? s.slot) === 3 ? 'homeNight' : 'home';
    const url = new URL(`assets/environment/${bg[id] || bg.campus}`, document.baseURI).href;
    if ($('backdrop').dataset.path !== url) {
      $('backdrop').style.backgroundImage = `url("${url}")`;
      $('backdrop').dataset.path = url;
    }
  }
  function applyPrefs() {
    document.body.classList.toggle('reduced', !!prefs.reduced);
    document.documentElement.style.setProperty('--reading-size', `${Math.max(20, Math.min(30, prefs.textSize))}px`);
    window.AquaAudio.setVolume(prefs.bgmVolume);
    window.AquaAudio.setVoiceVolume(prefs.voiceVolume);
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
    $('time').textContent = times[s.scene?.time ?? s.slot];
    $('energy').textContent = `기력 ${s.energy}`;
    $('money').textContent = `${s.money.toLocaleString()}원`;
    $('term').textContent = W.holidays[s.date] || W.term(s.date);
  }
  function charge(values) {
    for (const key of Object.keys(statNames)) if (values[key]) { if (window.AquaEconomy.stats.includes(key) && values[key] > 0) { window.AquaEconomy.gain(s, key, values[key]); continue; } s[key] = W.clamp(s[key] + values[key], key === 'money' ? 999999999 : 100); }
  }
  function apply(effect) {
    if (!effect) return;
    const reactions = [];
    if (effect.smallTopic) window.AquaSmallEvents.ensure(s).topic = effect.smallTopic;
    if (effect.clearSmallTopic) window.AquaSmallEvents.ensure(s).topic = null;
    if (effect.meet && !s.met.includes(effect.meet)) s.met.push(effect.meet);
    if (effect.flag) s.flags[effect.flag] = true;
    if (effect.selfChoice) s.flags.nariSelfChoice = (s.flags.nariSelfChoice || 0) + effect.selfChoice;
    if (effect.romance) window.AquaRomance.apply(s, effect.romance);
    if (effect.care) window.AquaRomance.touch(s, effect.care);
    if (effect.card && !s.cards.includes(effect.card)) { s.cards.push(effect.card); toast(`기억을 간직했다 · ${effect.card}`); }
    if (effect.club) s.club = effect.club;
    if (effect.bond) for (const [id, amount] of Object.entries(effect.bond)) window.AquaRelationships.change(s,id,amount);
    if (effect.recurring) for (const [id, amount] of Object.entries(effect.recurring)) W.recurringBond(s, id, amount, effect.talk || effect.groupTalk ? 'chat' : 'recurring');
    if (effect.stats) charge(effect.stats);
    if (effect.anonymous) s.radio.anonymous = W.clamp(s.radio.anonymous + effect.anonymous);
    if (effect.clue) s.radio.clues[effect.clue] = true;
    if (effect.birthday) Social.ensure(s).knownBirthdays[effect.birthday] = true;
    if (effect.radioBreak) {
      const count = Number.isInteger(effect.radioBreak) ? Math.max(1, effect.radioBreak) : 1;
      const upcoming = W.broadcasts.filter(episode => episode.date >= s.date && !episode.protected && !s.radio.aired[episode.id]);
      const last = upcoming[Math.min(count, upcoming.length) - 1];
      if (last && (!s.radio.hiatusUntil || last.date > s.radio.hiatusUntil)) s.radio.hiatusUntil = last.date;
    }
    if (effect.keptIf && s.flags[effect.keptIf]) s.flags.keptAnonymousWords = (s.flags.keptAnonymousWords || 0) + 1;
    if (effect.heardLetter) {
      R.markHeard(s, effect.heardLetter);
    }
    if (effect.talk) {
      const { id, topic, lineId } = effect.talk;
      const record = s.conversations[id] || { date: null, topics: [] };
      record.date = s.date; record.topics = [...record.topics, topic].slice(-2);
      s.conversations[id] = record;
      window.AquaDialogue.commit(s, lineId);
    }
    if (effect.groupTalk) for (const id of effect.groupTalk.ids) {
      const previous = s.conversations[id]?.topics || [];
      s.conversations[id] = { date: s.date, topics: [...previous, effect.groupTalk.topic].slice(-2) };
      window.AquaDialogue.commit(s, effect.groupTalk.lineIds?.[id]);
    }
    if (effect.dateBonus && s.scene?.outing) s.scene.outing.bonus = effect.dateBonus;
    if (effect.datePoints !== undefined && s.scene?.outing) s.scene.outing.points = (s.scene.outing.points || 0) + effect.datePoints;
    if (effect.dateChoice && s.scene?.outing) s.scene.outing.memory = effect.dateChoice;
    if (effect.dateMemory && s.scene?.outing) s.scene.outing.memory = effect.dateMemory;
    if (effect.holiday) reactions.push(...window.AquaHolidays.apply(s, effect.holiday));
    if (effect.schoolFocus) window.AquaSchool.commit(s, effect.schoolFocus);
    if (effect.schoolObservation) window.AquaSchool.observe(s, effect.schoolObservation);
    if (effect.attention) reactions.push(...Social.attention(s, effect.attention.person, effect.attention.observers));
    return reactions;
  }

  function playScene(id, after, options = {}) {
    const data = options.data || Story.build(id, s);
    pauseText();
    window.AquaAudio.stopVoice(); voicePosition = null;
    s.scene = { id, after, title: data.title, background: data.background, time: data.time ?? s.slot, queue: structuredClone(data.lines),
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
    window.AquaAudio.play(sc.radioEpisode ? 'radio' : sc.time===3 ? 'night' : 'campus');
    $('scene-label').textContent = `${W.dateLabel(s.date)}  ·  ${sc.title}`;
    renderLine();
  }
  function renderCast(ids, speaker, expr = null) {
    if (illustrations[s.scene?.illustration]) { $('cast').replaceChildren(); return; }
    const source = id => window.AquaWardrobe.source(s, id, s.scene || {}, speaker?.includes(W.people[id].short) ? expr : null);
    const current = [...$('cast').children].map(img => `${img.dataset.actor}:${img.dataset.outfit}`);
    if (current.join(',') !== ids.map(id => `${id}:${source(id)}`).join(',')) {
      $('cast').replaceChildren();
      ids.filter(id => W.people[id]).forEach(id => {
        const img = document.createElement('img');
        img.className = 'actor'; img.dataset.actor = id;
        img.src = source(id); img.dataset.outfit = source(id); img.alt = '';
        img.onerror = () => {
          if (!img.dataset.fallback) { img.dataset.fallback = 'true'; img.src = window.AquaWardrobe.source(s,id,s.scene || {}); }
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
    if (!auto || !s?.scene || document.hidden || $('modal').open || s.scene.queue[s.scene.index]?.choice || typingTimer || window.AquaAudio.isVoicePlaying()) return;
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
    if (!voicePosition || voicePosition.scene !== sc || voicePosition.index !== sc.index) {
      voicePosition = { scene: sc, index: sc.index };
      if (line?.voiceId && !line.choice) window.AquaAudio.playVoice(line.voiceId, scheduleAuto);
      else window.AquaAudio.stopVoice();
    }
    if (line?.time !== undefined) sc.time = line.time;
    if (line?.background) sc.background = line.background;
    if (line?.title) { sc.title=line.title; $('scene-label').textContent=`${W.dateLabel(s.date)}  ·  ${sc.title}`; }
    if (line && Object.hasOwn(line, 'illustration')) sc.illustration = illustrations[line.illustration] ? line.illustration : null;
    const art = illustrations[sc.illustration];
    document.body.classList.toggle('illustration-mode', !!art);
    $('scene-art').hidden = !art;
    if (art) window.AquaAudio.play(sc.time===3?'night':'campus');
    document.body.classList.toggle('backstage', !!line?.backstage || (sc.id === 'entrance' && sc.index >= 5));
    document.body.classList.toggle('choosing', !!line?.choice);
    setBg(art ? sc.illustration : sc.background); updateStatus();
    if (!line) { finishScene(); return; }
    if (line.dateResult && sc.outing) {line.text=window.AquaDateActivities.finishLine(sc.outing);line.speaker=W.people[sc.outing.person].short;line.expr='smile';sc.outing.result=window.AquaDateActivities.result(sc.outing);sc.outing.bonus={good:4,normal:3,poor:2}[sc.outing.result];}
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
      renderCast(sc.lastCast, line.speaker, line.expr); logLine(line); typeLine(line.text);
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
  function lineKey(sc,line){return `${sc.id}:${line.speaker||''}:${line.text}`;}
  function skipRead(){
    if(!s?.scene || $('modal').open)return;
    let scene=s.scene; let guard=0;
    while(s.scene===scene && guard++<1000){const line=scene.queue[scene.index];if(!line||line.choice)break;
      if(!prefs.skipUnread && !s.readLines?.[lineKey(scene,line)])break;
      pauseText(); $('line').textContent=fullText; advance();
    }
  }
  function advance() {
    if (!s?.scene || $('modal').open || s.scene.queue[s.scene.index]?.choice) return;
    if (typingTimer) { pauseText(); $('line').textContent = fullText; scheduleAuto(); return; }
    const line=s.scene.queue[s.scene.index]; s.readLines ||= {}; s.readLines[lineKey(s.scene,line)]=true;
    beep(); s.scene.index++; renderLine();
  }
  function finishScene() {
    pauseText();
    window.AquaAudio.stopVoice(); voicePosition = null;
    const sc = s.scene;
    if (sc.pendingReward) charge(sc.pendingReward);
    if (sc.id === 'crossRain') s.flags.crossRainDate = s.date;
    if (sc.radioEpisode && !sc.replay) R.finish(s, sc.radioEpisode);
    if (!sc.replay && !s.seen.includes(sc.id) && !/^(talk|gift|date|group)-/.test(sc.id)) s.seen.push(sc.id);
    window.AquaRelationships.finish(s,sc.id);
    if (sc.outing) Social.finishDate(s, sc.outing);
    s.scene = null; $('cast').replaceChildren();
    $('intro').hidden = true; document.body.classList.remove('intro-mode');
    if (sc.after === 'ending') { s.completed = true; showEndingComplete(); }
    else if (sc.after === 'intro') { playScene('prologue', 'prologue'); }
    else if (sc.after === 'visit') { showMap(); const p = places.find(place=>place.id===sc.returnPlace); if(p) locationAction(p); }
    else if (sc.after === 'prologue') { s.date = '2026-03-03'; s.slot = 0; prepare(); }
    else if (sc.after === 'encounter') {
      showMap(); const p = places.find(place => place.id === sc.returnPlace);
      if (p) encounterMenu(p, W.presentAt(s, p.id));
    } else if (sc.after === 'date') { s.slot = 3; prepare(); }
    else if (sc.after === 'radio' || sc.after === 'replay') showMap();
    else if (sc.after === 'stay') { if (s.slot === 3) R.air(s); showMap(); }
    else step();
    saveAuto();
  }

  function mandatoryAt(slot) {
    const event = s.date === '2026-03-03' && slot === 0 ? 'entrance' :
      s.date === '2026-03-05' && slot === 1 ? 'daeunMeet' :
      s.date === '2026-03-10' && slot === 1 ? 'fair' :
      s.date === '2026-04-02' && slot === 3 ? 'firstRadio' :
      s.date === '2026-05-20' && slot === 2 ? 'festival' :
      s.date === '2026-04-19' && slot === 1 ? 'common-exam' :
      s.date === '2026-06-19' && slot === 2 ? 'common-party' :
      s.date === '2026-06-20' && slot === 1 ? 'common-vacation' : window.AquaRomance.mandatory(s, slot) || window.AquaSummer.mandatory(s, slot) || window.AquaAutumn.mandatory(s, slot) || window.AquaWinter.mandatory(s, slot) || window.AquaHolidays.mandatory(s, slot);
    return event && !s.seen.includes(event) ? event : null;
  }
  function prepare() {
    if (s.completed) { showEndingComplete(); return; }
    if (s.date === '2027-02-26' && s.slot === 0) {
      s.endingId ||= window.AquaEndings.select(s);
      playScene(`ending-${s.endingId}`, 'ending', { data: window.AquaEndings.build(s, s.endingId) }); return;
    }
    window.AquaHolidays.morning(s);
    window.AquaRelationships.monday(s);
    window.AquaMessages.morning(s);
    const event = mandatoryAt(s.slot);
    if (event === 'firstRadio') {
      R.air(s); playScene('firstRadio', 'radio', { data: R.build(s, W.episodeOn(s.date)) }); return;
    }
    if (['romanceTalk', 'romanceReview', 'romanceClash'].includes(event)) {
      const build = { romanceTalk: 'buildTalk', romanceReview: 'buildReview', romanceClash: 'buildClash' }[event];
      playScene(`${event}-${s.date}`, s.slot === 3 ? 'stay' : 'event', { data: window.AquaRomance[build](s) }); return;
    }
    if (event === 'recordingNight') { R.air(s); playScene(event, 'radio', { data: R.build(s, W.episodeOn(s.date)) }); return; }
    if (event === 'lastBroadcast') { R.air(s); playScene(event, 'radio', { data: R.build(s, W.episodeOn(s.date)) }); return; }
    if (event === 'holidayPromiseConflict') { playScene(event, 'event', { data: window.AquaHolidays.buildConflict(s) }); return; }
    if (event === 'holidayXmasDay') { playScene(event, 'event', { data: window.AquaHolidays.buildDay(s) }); return; }
    if (event === 'holidayXmasNight') { R.air(s); playScene(event, 'radio', { data: window.AquaHolidays.buildNight(s) }); return; }
    if (event === 'winterValentine') { playScene(event, 'event', { data: window.AquaWinter.buildValentine(s) }); return; }
    if (event?.startsWith('common-')) {playScene(event,'event',{data:window.AquaSmallEvents.commonScene(s,event.slice(7))});return;}
    if (event) { playScene(event, 'event'); return; }
    if (s.slot === 0 && W.hasClass(s.date)) {
      if (window.AquaSchool.available(s)) {
        const data=window.AquaSchool.build(s); playScene(data.id,'event',{data}); return;
      }
      s.slot=1;prepare();return;
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
    if (s.completed) { showEndingComplete(); return; }
    if(s.music?.active){composeMenu();return;}
    // Finishing a day still visits its mandatory story slot before sleeping.
    for (let slot = s.slot; slot <= 3; slot++) if (mandatoryAt(slot)) { s.slot = slot; prepare(); return; }
    if (s.slot < 3) { s.slot = 3; prepare(); return; }
    R.air(s);
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
    if (window.AquaAutumn.away(s) && p.id !== 'room') return '고향에 머무는 동안에는 캠퍼스로 갈 수 없어요';
    if (p.id === 'cafe' && s.workDays.includes(s.date)) return '오늘 근무는 끝났어.';
    if (p.id === 'cafe' && ![1, 2].includes(s.slot)) return '오후 또는 노을에 근무할 수 있어요';
    if (p.id === 'cafe' && s.date < '2026-03-11') return '첫 출근은 3월 11일부터예요';
    if (p.id === 'cafe' && ![3, 5, 6].includes(W.weekday(s.date))) return '수·금·토에 근무할 수 있어요';
    if (p.id === 'radio' && s.club !== 'radio') return '방송국 부원만 도울 수 있어요';
    if (p.energy < 0 && (s.energy < 15 || s.energy < Math.abs(p.energy))) return '기력이 부족해요';
    if (p.money < 0 && s.money < -p.money) return '소지금이 부족해요';
    return '';
  }
  function effectsLabel(p) {
    return Object.keys(statNames).filter(key => p[key]).map(key => key === 'money' ? `${p[key] > 0 ? '+' : '−'}${Math.abs(p[key]).toLocaleString()}원` : window.AquaEconomy.stats.includes(key) ? `${statNames[key]} 연습` : `${statNames[key]} ${p[key] > 0 ? '+' : '−'}${Math.abs(p[key])}`).join(' · ');
  }
  function showMap() {
    document.body.classList.remove('illustration-mode'); $('scene-art').hidden = true;
    window.AquaEncounters.ensurePlan(s);
    pauseText(); $('title').hidden = true; $('scene').hidden = true; $('map').hidden = false;
    $('intro').hidden = true; document.body.classList.remove('intro-mode');
    document.body.classList.add('map-mode');
    $('map').dataset.slot = String(s.slot);
    $('map').dataset.weather = window.AquaEncounters.weather(s);
    $('status').hidden = false; $('cast').replaceChildren();
    const away = window.AquaAutumn.away(s);
    setBg(s.slot === 3 || away ? 'room' : 'campus'); updateStatus(); window.AquaAudio.play(s.slot===3?'night':'campus');
    const afterSchool=s.slot===1&&W.hasClass(s.date);
    $('map-title').textContent = s.slot === 3 ? '하루의 끝' : away ? '고향에서 보내는 연휴' : afterSchool?'수업이 끝나고, 어디로 갈까?':`${times[s.slot]}, 어디로 갈까?`;
    $('map-desc').textContent = away ? '9월 26일까지 고향에 머무릅니다.' : s.slot === 3 ? '내 방에서 보내는 작은 시간.' : afterSchool?'오후와 노을, 장소를 먼저 둘러보고 오늘의 시간을 고르자.':'오늘의 남은 시간을 골라 보자.';
    $('map-weather').textContent = { clear: '맑음', cloudy: '흐림', rain: '비', snow: '눈' }[$('map').dataset.weather];
    $('stats').innerHTML = ['knowledge', 'fitness', 'sensitivity'].map(key => `<span>${statNames[key]} <b>${s[key]}</b></span>`).join('');
    $('locations').replaceChildren();
    const list = s.slot === 3 ? [
      { id: 'letter', name: '라디오 사연', desc: s.letterDraft ? '써 두었던 초안을 이어서' : '보내지 못한 말을 적는 곳' },
      { id: 'listen', name: '아쿠아 루나', desc: radioStatus() },
      { id: 'notes', name: '나의 기록', desc: '관계 · 기억 · 멜로디 · 방송' },
      { id: 'sleep', name: '잠자기', desc: '내일로 · 기력 +50' }
    ] : away ? [{ ...places.find(place => place.id === 'room'), name: '고향의 방', desc: '쉬면서 가족과 시간 보내기' }] : places;
    list.forEach((p, index) => {
      const button = document.createElement('button'); button.className = 'location';
      // The user's explicit no-preview-of-people requirement supersedes older map-hint proposals.
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
      $('preview-title').textContent = away ? '돌아와서 생긴 이야기' : s.slot === 3 ? '오늘도, 여기까지.' : s.slot === 1 && W.hasClass(s.date) ? '수업이 끝난 뒤' : '나에게 남은 시간';
      $('preview-desc').textContent = away ? '익숙한 방에 대학에서 쓰던 공책을 펼쳤다.\n서울의 이야기를 여기에서도 조금 더 쓸 수 있다.' : s.slot === 3 ? '창밖의 불빛이 하나둘 켜졌다.\n아직 잠들기엔 조금 이른 밤.' : s.slot === 1 && W.hasClass(s.date) ? '강의실 밖으로 나오자 익숙한 풍경이 조금 다르게 보였다.\n오늘은 어디에서 어떤 하루를 보내게 될까.' : '서두를 일 없이 풍경을 한 번 더 바라보았다.\n아직 정하지 않은 시간이 내 앞에 남아 있다.';
      $('preview-hint').textContent = s.slot === 3 ? '오른쪽에서 오늘의 마지막 일을 골라 보자.' : '오른쪽에서 가고 싶은 곳을 골라 보자.';
    }
    saveAuto();
  }
  function previewPlace(p) {
    if (s.scene || s.slot === 3 || $('modal').open) return;
    mapSelection = { key: `${s.date}:${s.slot}`, id: p.id };
    setBg(p.bg);
    $('preview-eyebrow').textContent = 'HANYEOUL / A PLACE FOR TODAY';
    $('preview-title').textContent = window.AquaAutumn.away(s) && p.id === 'room' ? '고향의 방' : p.name;
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
    $('preview-desc').textContent = window.AquaAutumn.away(s) && p.id === 'room' ? '예전에 쓰던 책상과 창문.\n나가 보면 이야기를 나눌 가족이 있다.' : descriptions[p.id];
    $('preview-details').hidden = false; $('preview-hint').hidden = true;
    const reason = canUse(p);
    $('preview-cost').textContent = `기본 활동: ${p.desc} · 시간 1칸\n${effectsLabel(p)}${reason ? `\n기본 활동 안내: ${reason}` : ''}\n방문 후 상황에 따라 다른 선택이 열릴 수 있어요.`;
    $('preview-number').textContent = String(places.indexOf(p) + 1).padStart(2, '0');
    $('visit-label').textContent = `${p.name} 방문하기`;
    $('visit-place').onclick = () => { if (!$('modal').open && !s.scene && !$('map').hidden) locationAction(p); };
    [...$('locations').children].forEach(button => button.setAttribute('aria-pressed', String(button.dataset.location === p.id)));
  }
  function locationAction(p) {
    if(s.music?.active){composeMenu();return;}
    if (p.id === 'sleep') { finishDay(); return; }
    if (p.id === 'notes') { showNotes(); return; }
    if (p.id === 'letter') { letterMenu(); return; }
    if (p.id === 'listen') { radioMenu(); return; }
    if (window.AquaAutumn.away(s)) {
      if (p.id === 'room') confirmActivity(p); else toast('고향에 머무는 동안에는 캠퍼스로 갈 수 없어요.');
      return;
    }
    const intro=window.AquaSmallEvents.first(s,p.id);
    if(intro){playScene('visit-'+p.id,'visit',{data:intro,returnPlace:p.id});return;}
    const appointment=window.AquaMessages.due(s,p.id);
    if(appointment){const outing=window.AquaMessages.start(s,appointment.id);if(!outing){toast('약속에 필요한 기력이나 소지금이 부족해요.');return;}playScene('appointment-'+appointment.id,'activity',{data:window.AquaOutings.build(s,outing),outing});return;}
    const special = possibleScene(p.id);
    if (special) {
      if (special.work && canUse(p)) { toast(canUse(p)); return; }
      const reward = {};
      if (special.work) { s.workDays.push(s.date); charge({ energy: p.energy }); reward.money = p.money; }
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
      closeModal(); if (p.id === 'cafe') s.workDays.push(s.date); charge({...p, energy:p.energy+(p.id==='cafe'&&window.AquaRelationships.hasReward(s,'seojin')?6:p.id==='dining'&&window.AquaRelationships.hasReward(s,'daeun')?10:0)}); const small=window.AquaAutumn.away(s)?null:(window.AquaSmallEvents.maybe(s,p.id)||window.AquaSchool.field(s,p.id)); if(small){playScene('small-'+small.id,'activity',{data:small});return;} step(); toast(`${p.desc} · ${effectsLabel(p)}`);
    };
  }

  const talkTopics = ['수업', '음악', '먹는', '요즘 고민', '동네', '꿈'];
  const taste = { nari: [1, 3, 1, 2, 0, 2], daeun: [1, 2, 3, 2, 2, 1], seojin: [0, 2, 1, 3, 2, 1] };
  function encounterMenu(p, ids) {
    if (!ids.length) { confirmActivity(p); return; }
    const approach=ids.map(id=>window.AquaSmallEvents.approach(s,id,p.id)).find(Boolean);
    if(approach){closeModal();playScene(approach.id,'encounter',{returnPlace:p.id,data:approach});return;}
    const buttons = ids.map(id => {
      const talked = s.conversations[id]?.date === s.date;
      const giftReason = Social.giftReason(s, id, null, p.id), canGift = Social.gifts.some(g => s.social.inventory[g.id] > 0);
      const dateReason = Social.dateReason(s, id, 'river', p.id, !!mandatoryAt(2));
      return `<article class="encounter-person" style="--person-color:${W.people[id].color}"><div class="encounter-portrait"><img src="${window.AquaWardrobe.source(s, id, { returnPlace: p.id, background: p.bg })}" alt="${W.people[id].name}"></div><div><small>${W.bondStage(s, id)}</small><h3>${W.people[id].name}</h3><p>“${esc(window.AquaDialogue.greeting(s, id, p.id))}”</p></div><div class="encounter-actions"><button data-person="${id}" ${talked ? 'disabled' : ''}>잠깐 이야기하기<small>${talked ? '오늘의 대화 완료' : '화제 고르기 · 시간 소모 없음'}</small></button>${s.music?.songs.length?`<button data-song-person="${id}">곡 들려주기</button>`:''}<button data-gift-person="${id}" ${giftReason || !canGift ? 'disabled' : ''}>선물 건네기<small>${esc(giftReason || (canGift ? '가방에서 고르기 · 시간 소모 없음' : '휴대폰 선물 가게에서 구입해요'))}</small></button>${p.id === 'concert' ? `<button data-concert-person="${id}" ${s.money < 24000 || s.energy < 15 ? 'disabled' : ''}>같이 공연 보기<small>24,000원 · 시간 1칸</small></button>` : ''}<button data-date-person="${id}" ${dateReason ? 'disabled' : ''}>같이 시간 보내기<small>${esc(dateReason || '오후 + 노을 · 기력 −15')}</small></button></div></article>`;
    }).join('');
    const group = ids.length === 2 && ids.every(id => s.bond[id] >= (id === 'nari' ? 25 : 15) && s.conversations[id]?.date !== s.date);
    modal(p.name, `<div class="encounter-list">${buttons}</div><div class="modal-grid">${group ? '<button id="group-talk">셋이 이야기하기<small>두 사람과 같은 화제 · 시간 소모 없음</small></button>' : ''}<button id="alone" ${canUse(p) ? 'disabled' : ''}>${esc(p.desc)}<small>${esc(canUse(p) || effectsLabel(p))} · 시간 1칸</small></button><button id="cancel-action">장소 선택으로 돌아가기</button></div>`);
    $('modal-content').querySelectorAll('[data-person]').forEach(button => button.onclick = () => talkMenu(p, ids, button.dataset.person));
    $('modal-content').querySelectorAll('[data-song-person]').forEach(b=>b.onclick=()=>songMenu(b.dataset.songPerson,p));
    $('modal-content').querySelectorAll('[data-gift-person]').forEach(button => button.onclick = () => giftMenu(p, ids, button.dataset.giftPerson));
    $('modal-content').querySelectorAll('[data-date-person]').forEach(button => button.onclick = () => dateMenu(p, ids, button.dataset.datePerson));
    $('modal-content').querySelectorAll('[data-concert-person]').forEach(button => button.onclick = () => {
      const id=button.dataset.concertPerson; if (s.money<24000 || s.energy<15 || !W.presentAt(s,'concert').includes(id)) return;
      charge({money:-24000,energy:-8}); closeModal();
      playScene('ticket-'+id,'activity',{data:window.AquaEconomy.ticketScene(id)});
    });
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
      const response = window.AquaDialogue.peekTalk(s, id, i);
      return { label: `${topic} 이야기`, effect: { recurring: { [id]: delta }, talk: { id, topic, lineId: response.key }, attention: { person: id, observers: ids } },
        lines: [{ speaker: W.people[id].short, text: response.text, cast: ids }] };
    });
    const topic=window.AquaSmallEvents.ensure(s).topic, topicEvent=window.AquaPeopleEvents.events.find(x=>x.id===topic);
    if (topic && (!topicEvent || topicEvent.person===id)) options.push({label:topicEvent ? `${topicEvent.title} 이야기` : '오늘 본 것',effect:{recurring:{[id]:1},talk:{id,topic:'오늘 본 것'},clearSmallTopic:true},lines:[{speaker:W.people[id].short,text:topicEvent?.reaction || window.AquaSmallEvents.topics[id],cast:ids,expr:'smile'}]});
    closeModal();
    playScene(`talk-${id}`, 'encounter', { returnPlace: p.id, data: {
      title: `${particle(W.people[id].name, '과', '와')} 잠깐`, background: p.bg,
      lines: [{ speaker: W.people[id].short, text: { nari: '…무슨 얘기 할까.', daeun: '오, 너 먼저 말 거니까 좋다. 무슨 얘기?', seojin: '그래. 오늘은 어떤 얘기로 내 시간 쓸래?' }[id], cast: ids }, { choice: options }]
    } });
  }

  function groupTalk(p, ids) {
    if (ids.some(id => s.conversations[id]?.date === s.date)) return;
    const options = talkTopics.map((topic, i) => {
      const recurring = {};
      const responses = Object.fromEntries(ids.map(id => [id, window.AquaDialogue.peekTalk(s, id, i)]));
      for (const id of ids) {
        let rank = id === 'nari' && i === 5 && s.date >= '2026-09-01' ? 0 : taste[id][i];
        if (s.conversations[id]?.topics.includes(topic)) rank = Math.max(0, rank - 1);
        recurring[id] = [-1, 1, 3, 4][rank] / 2;
      }
      const reply = ['같은 수업이어도 듣는 사람마다 남는 게 다르다는 얘기가 되었다.', '같은 곡에서 서로 다른 악기를 듣고 있었다. 다음에는 그 부분을 들어 보기로 했다.', '좋아하는 메뉴를 하나씩 적었다. 겹치는 것도, 처음 듣는 것도 있었다.', '누군가는 길게, 누군가는 한 마디로 답했다. 셋 다 서둘러 결론을 내지는 않았다.', '각자 아는 길을 이어 보니 생각보다 가까운 동네가 되었다.', '대답은 전부 달랐다. 나중에 다시 물어봐도 되는 얘기로 남겨 두었다.'][i];
      return { label: `${topic} 이야기`, effect: { recurring, groupTalk: { ids, topic, lineIds: Object.fromEntries(ids.map(id => [id, responses[id].key])) } }, lines: [
        { speaker: W.people[ids[0]].short, text: responses[ids[0]].text, cast: ids },
        { speaker: W.people[ids[1]].short, text: responses[ids[1]].text, cast: ids }, { text: reply, cast: ids }
      ] };
    });
    closeModal(); playScene('group-talk', 'encounter', { returnPlace: p.id, data: {
      title: '셋이서 하는 얘기', background: p.bg, lines: [{ text: '누구 한 사람을 부르는 대신, 두 사람 사이에 자리를 잡았다.', cast: ids }, { choice: options }]
    } });
  }
  function shopMenu() {
    modal('작은 선물 가게', `<div class="shop-heading"><p class="modal-text">다음에 만날 때, 건네고 싶은 것.</p><b>${s.money.toLocaleString()}원</b></div><div class="shop-grid">${[...Social.gifts.filter(g => !g.person || s.met.includes(g.person)), ...window.AquaEconomy.equipment.filter(g => !s.equipment.includes(g.id))].map(g => `<button data-buy="${g.id}" ${s.money < g.price || (s.social.inventory[g.id] || 0) >= 99 ? 'disabled' : ''}><span class="gift-symbol">${g.symbol}</span><strong>${g.name}</strong><small>${g.price.toLocaleString()}원</small><em>${g.id === 'recorder' ? '완성곡의 가장 강한 단어 점수 +1' : `가방에 ${s.social.inventory[g.id] || 0}개`}</em></button>`).join('')}</div><p class="form-note">구입은 시간을 쓰지 않습니다. 선물은 만났을 때 같은 사람에게 7일에 한 번 건넬 수 있어요.</p>`);
    $('modal-content').querySelectorAll('[data-buy]').forEach(button => button.onclick = () => {
      const item = [...Social.gifts, ...window.AquaEconomy.equipment].find(g => g.id === button.dataset.buy);
      modal(item.name, `<p class="modal-text">${esc(item.name)} 한 개를 가방에 넣습니다.</p><p class="cost-summary">${item.price.toLocaleString()}원 · 현재 ${s.money.toLocaleString()}원</p><div class="modal-actions"><button id="buy-cancel" class="option-button">다시 고르기</button><button id="buy-confirm" class="option-button">구입하기</button></div>`);
      let committed = false;
      $('buy-cancel').onclick = shopMenu;
      $('buy-confirm').onclick = () => {
        if (committed) return;
        const result = window.AquaEconomy.equipment.includes(item) ? {ok: window.AquaEconomy.buyEquipment(s,item.id), reason:'이미 구입했거나 소지금이 부족해요.'} : Social.buy(s, item.id);
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
          seojin: ['고맙지만 이건 내 취향이 아니야. 다음엔 나한테 먼저 물어봐도 돼.', '나한테 주려고 골랐어? 고마워. 잘 쓸게.', '내 취향 꽤 잘 봤네. 마음에 들어. 고마워.', '이건 정확히 맞혔네. 좋아하는 걸 기억해 주는 사람, 난 꽤 오래 기억해.']
        };
        const reactions = Social.attention(s, id, ids);
        closeModal(); playScene(`gift-${id}`, 'encounter', { returnPlace: p.id, data: { title: `손에서 손으로 · ${item.name}`, background: p.bg,
          lines: [{ text: `${particle(item.name, '을', '를')} 건넸다. ${particle(W.people[id].short, '이', '가')} 내 손과 선물을 번갈아 보았다.`, cast: ids },
            ...(result.birthday ? [{ speaker: W.people[id].short, text: id==='seojin'?'내 생일 챙기려고 준비했네. 오늘은 나도 대놓고 좋아할게. 고마워.':'생일인 거… 기억해 줬네. 고마워.', cast: ids }] : []),
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
    const art = Object.entries(illustrations).filter(([,item])=>s.flags[item.flag] && (!person || item.person===person));
    const gallery = art.length ? `<div class="illustration-grid">${art.map(([id,item])=>`<button data-art="${id}" class="illustration-card"><img src="assets/environment/${bg[id]}" alt="${esc(item.alt)}"><span><small>${esc(W.dateLabel(item.date))} · ${W.people[item.person].short}</small><strong>${item.title}</strong><em>${item.caption}</em></span></button>`).join('')}</div>` : '';
    modal('함께 보낸 날들', `<p class="modal-text">사진보다 오래 남겨 두고 싶은 말.</p><div class="album-tabs"><button data-album="all" ${!person ? 'aria-pressed="true"' : ''}>모두</button>${s.met.map(id => `<button data-album="${id}" ${person === id ? 'aria-pressed="true"' : ''}>${W.people[id].short}</button>`).join('')}</div>${gallery}<div class="album-grid">${entries.map(a => {
      const d = Social.destinations.find(place => place.id === a.destination);
      return `<article class="album-entry" style="--person-color:${W.people[a.person].color}"><small>${esc(W.dateLabel(a.date))} · ${d.name}${a.result ? ` · ${{good:'좋았음',normal:'보통',poor:'아쉬움'}[a.result]}` : ''}</small><h3>${particle(W.people[a.person].name, '과', '와')} 보낸 오후</h3><p>“${esc(a.memory || '같이 보낸 시간을 기억해 두기로 했다.')}”</p><span>OUR DAYS · ${String(s.social.album.indexOf(a) + 1).padStart(2, '0')}</span></article>`;
    }).join('') || '<p class="modal-text">아직 함께 보낸 오후가 없습니다. 친구가 되면 만났을 때 약속을 잡아 보세요.</p>'}</div>${s.completed ? '<button class="option-button" id="album-ending-back">결말 화면으로 돌아가기</button>' : ''}`);
    $('modal-content').querySelectorAll('[data-album]').forEach(button => button.onclick = () => albumMenu(button.dataset.album === 'all' ? null : button.dataset.album));
    $('modal-content').querySelectorAll('[data-art]').forEach(button => button.onclick = () => illustrationMenu(button.dataset.art));
    if (s.completed) $('album-ending-back').onclick = showEndingComplete;
  }

  function illustrationMenu(id) {
    const art=illustrations[id]; if(!art || !s?.flags[art.flag])return;
    modal(art.title, `<figure class="illustration-view"><img src="assets/environment/${bg[id]}" alt="${esc(art.alt)}"><figcaption>${art.caption}</figcaption></figure>${s.completed && !s.scene ? '<button class="option-button" id="illustration-album-back">앨범으로 돌아가기</button>' : ''}`);
    $('modal').classList.add('illustration-modal');
    $('modal').classList.toggle('completed-illustration', !!(s.completed && !s.scene));
    if (s.completed && !s.scene) $('illustration-album-back').onclick = () => albumMenu(art.person);
  }

  function composeMenu() {
    const C=window.AquaComposition,m=C.ensure(s);
    if(!m.active){modal('작곡 노트','<p class="modal-text">네 마디에 남길 단어를 고른다.</p><small>시간 1칸 · 기력 −10 · 시작 후 닫아도 이어 쓸 수 있습니다.</small><button class="option-button" id="compose-confirm">작곡 시작하기</button>');$('compose-confirm').onclick=()=>{if(C.begin(s)){saveAuto();composeMenu();}};return;}
    if(m.active.picks.length<4){modal('작곡 · '+(m.active.picks.length+1)+'번째 마디',`<p class="modal-text">${esc(m.active.picks.join(' · '))}</p><div class="modal-grid">${C.cards(s).map(([word])=>`<button data-word="${word}">${word}</button>`).join('')}</div><small>네 마디를 고르면 조각 하나가 됩니다. 닫았다가 다시 열어도 이어집니다.</small>`);$('modal-content').querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{C.choose(s,b.dataset.word);saveAuto();composeMenu();});return;}
    C.settle(s);saveAuto();const done=m.fragments>=C.required(s);
    modal(done?'곡 완성':'오늘의 조각',`${done?'<label for="song-title">곡 제목</label><input id="song-title" class="modal-input" maxlength="30" placeholder="이름 없는 곡">':`<p class="modal-text">조각 ${m.fragments} / ${C.required(s)}</p>`}<p>${esc(m.words.join(' · '))}</p><button id="music-done" class="option-button">${done?'나의 곡에 보관':'노트 덮기'}</button>`);
    $('music-done').onclick=()=>{if(C.complete(s,$('song-title')?.value)){closeModal();const small=window.AquaSmallEvents.maybe(s,'studio');if(small)playScene('small-'+small.id,'activity',{data:small});else step();}};
  }
  function songMenu(person=null,place=null) {
    const C=window.AquaComposition,m=C.ensure(s);
    modal(person?'곡 들려주기':'나의 곡',`<div class="modal-grid">${m.songs.map(song=>`<button data-song="${song.id}">${esc(song.title)}<small>${song.date} · ${Object.keys(song.heard).map(id=>W.people[id].short).join(', ')||'아직 혼자만 들은 곡'}</small></button>`).join('')||'<p>아직 완성한 곡이 없다.</p>'}${m.active?'<button id="resume-music">작곡 이어 쓰기</button>':''}</div>`);
    if($('resume-music'))$('resume-music').onclick=composeMenu;
    if(person)$('modal-content').querySelectorAll('[data-song]').forEach(b=>b.onclick=()=>{if(!W.presentAt(s,place.id).includes(person))return;const data=C.share(s,b.dataset.song,person);if(data){data.background=place.bg;closeModal();playScene('share-'+b.dataset.song+'-'+person,'encounter',{data,returnPlace:place.id});}});
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
    const love = window.AquaRomance.ensure(s);
    const promise = love.talk ? `<p class="modal-text">${esc(W.dateLabel(love.talk.date))} ${times[love.talk.slot]} · 함께 관계를 이야기하기로 했다.</p>` : love.trial ? `<p class="modal-text">${esc(W.dateLabel(love.trial.until))}까지 시간을 나누고 다시 대답을 듣기로 했다.</p>${love.trial.people.filter(id => id !== love.trial.newPerson).map(id => `<p class="record-row">${W.people[id].short}와 따로 보낸 시간 · ${love.trial.counts[id]} / 2</p>`).join('')}` : '';
    const disclosure = love.mode === 'hidden' && !love.talk && !love.trial ? '<p class="modal-text">서로에게 알리지 않은 교제가 있다.</p><button id="romance-disclose" class="option-button">숨긴 관계를 털어놓을 약속 잡기</button>' : '';
    const holiday = window.AquaHolidays.ensure(s), inviteNames = { offered:'답하지 않은 초대', accepted:'약속함', declined:'이번에는 만나지 않기로 함', considering:'23일까지 답하기로 함', group:'다 같이 보내기로 동의함', missed:'답하지 못한 약속' };
    const holidayNotes = s.date >= '2026-12-07' ? `<div class="notes-section"><h3>12월 24일의 약속</h3>${Object.entries(holiday.invites).filter(([id])=>s.met.includes(id)).map(([id,invite])=>`<p class="record-row">${W.people[id].short} · ${inviteNames[invite.status]}${s.date <= '2026-12-23' ? `<button data-holiday-reply="${id}" ${s.scene?'disabled':''}>${s.scene?'이야기를 마친 뒤 답장하기':'약속 대화 열기'}</button>`:''}</p>`).join('') || '<p class="modal-text">아직 나눈 성탄 약속이 없다.</p>'}</div>` : '';
    const cards = s.cards.map(card => `<article class="memory-card"><span>✧</span><h3>${esc(card)}</h3><small>내가 직접 겪은 순간</small></article>`).join('');
    const clues = { changedVoice: '지난 시즌과 다른 목소리', pickListener: '작년의 청취자 피크', sameHabit: '동아리방에서 들은 말버릇', sameBreath: '같은 문장과 숨', thursdaySchedule: '비어 있는 목요일', thursdayRadio: '합주와 방송의 시간', fadingFlowers: '시드는 꽃다발', oneAudience: '관객 한 명', myMelody: '라디오에서 흘러나온 내 멜로디', recordingOwnVoice: '녹음이 끝난 뒤의 자기 목소리' };
    modal('나의 기록', `<div class="notes-section"><h3>우리 사이</h3>${s.met.length ? s.met.map(id => `<p class="relationship-row" style="--person-color:${W.people[id].color}"><b>${W.people[id].name}</b><span>${W.bondStage(s, id)}${prefs.showBond ? ` · ${s.bond[id]}` : ''}</span></p>`).join('') : '<p class="modal-text">아직 만난 사람이 없다.</p>'}${promise}${disclosure}</div>${holidayNotes}<div class="notes-section"><h3>기억 ${s.cards.length}</h3><div class="memory-grid">${cards || '<p class="modal-text">아직 간직한 기억이 없다.</p>'}</div></div><div class="notes-section"><h3>나의 멜로디 노트</h3>${window.AquaComposition.ensure(s).songs.map(song=>`<p class="record-row"><small>${esc(song.date)}</small>${esc(song.title)} · ${esc(song.words.join(' · '))}</p>`).join('') || (s.melodies.length ? `<p class="record-row">이전 멜로디 기록 ${s.melodies.length}개 보관 중</p>` : '<p class="modal-text">아직 완성한 곡이 없다.</p>')}</div><div class="notes-section"><h3>보낸 사연</h3>${s.letters.map(letter => `<article class="record-row"><small>${esc(W.dateLabel(letter.date))} · ${esc(letter.topic)}</small><p>${esc(letter.text || '이전 빌드에서 보낸 사연')}</p><span class="letter-state">전송 ✓ · 낭독 ${letter.read ? '✓' : '—'} · 직접 청취 ${letter.heard ? '✓' : '—'}</span></article>`).join('') || '<p class="modal-text">아직 보낸 사연이 없다.</p>'}</div><div class="notes-section"><h3>목요일의 메모</h3><p class="modal-text">끝까지 들은 정규 방송 ${s.radio.listened.length}회${prefs.showBond ? ` · 익명 마음 ${s.radio.anonymous}` : ''}</p>${Object.keys(s.radio.clues).map(key => `<p class="record-row">${esc(clues[key] || '방송에서 들은 작은 단서')}</p>`).join('') || '<p class="modal-text">아직 이어 붙이지 않은 문장들.</p>'}</div>`);
    if ($('romance-disclose')) $('romance-disclose').onclick = () => { if (window.AquaRomance.disclose(s)) { saveAuto(); showNotes(); } };
    $('modal-content').querySelectorAll('[data-holiday-reply]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.holidayReply;
      if(s.scene||s.date>'2026-12-23'||!s.met.includes(id)||!holiday.invites[id])return;
      closeModal();playScene(`holidayReply-${id}-${s.date}`,'stay',{data:window.AquaHolidays.buildInvite(s,id,true)});
    });
  }
  function calendarMenu(year, month) {
    const current = W.dateObject(s.date);
    year ||= current.getUTCFullYear(); month ||= current.getUTCMonth() + 1;
    const days = W.calendarMonth(year, month), offset = days[0].weekday;
    const cell = day => {
      const seenEpisode = day.episode && s.radio.listened.includes(day.episode.id);
      const birthday = Object.keys(s.social.knownBirthdays).find(id => s.social.knownBirthdays[id] && s.met.includes(id) && Social.birthdays[id] === day.date.slice(5));
      const birthdayLabel = birthday ? `${W.people[birthday].short} 생일` : '';
      const appointments=window.AquaMessages.ensure(s).appointments.filter(a=>a.date===day.date&&s.met.includes(a.person)&&!['offered','declined'].includes(a.status));
      const holidayPlans = day.date==='2026-12-24' ? Object.entries(window.AquaHolidays.ensure(s).invites).filter(([id,invite])=>s.met.includes(id)&&['accepted','group'].includes(invite.status)).map(([id,invite])=>`${W.people[id].short} · ${id==='nari'?'방송 뒤':'성탄 오후'}${invite.status==='group'?' · 함께':''}`) : [];
      const exam=window.AquaEncounters.exams(day.date)?'시험 기간':'';
      const label = [exam,...appointments.map(a=>`${W.people[a.person].short} · 오후 약속${a.status==='missed'?' · 놓침':''}`),...holidayPlans,day.holiday, day.event, birthdayLabel, day.episode ? `아쿠아 루나 ${seenEpisode ? '· 청취 완료' : '· 23:00'}` : null].filter(Boolean).join(' · ');
      return `<div class="calendar-day ${day.date === s.date ? 'today' : ''} ${day.holiday ? 'holiday' : ''}" aria-label="${esc(W.dateLabel(day.date) + (label ? ' · ' + label : ''))}"><b>${day.day}</b>${day.holiday ? `<small>${esc(day.holiday)}</small>` : ''}${day.event ? `<small>${esc(day.event)}</small>` : ''}${exam?`<small>${exam}</small>`:''}${appointments.map(a=>`<small>${W.people[a.person].short} · 오후${a.status==='missed'?' · 놓침':' 약속'}</small>`).join('')}${holidayPlans.map(plan=>`<small class="calendar-promise">${esc(plan)}</small>`).join('')}${birthdayLabel ? `<small class="calendar-birthday">✧ ${birthdayLabel}</small>` : ''}${day.episode ? `<span class="calendar-radio">☾ ${seenEpisode ? '들음' : '23:00'}</span>` : ''}</div>`;
    };
    modal('나의 달력', `<div class="calendar-nav"><button id="prev-month" aria-label="이전 달" ${year === 2026 && month === 3 ? 'disabled' : ''}>←</button><h3>${year}년 ${month}월</h3><button id="next-month" aria-label="다음 달" ${year === 2027 && month === 2 ? 'disabled' : ''}>→</button></div><div class="calendar-week">${['일', '월', '화', '수', '목', '금', '토'].map(d => `<span>${d}</span>`).join('')}</div><div class="calendar-grid">${'<div class="calendar-empty"></div>'.repeat(offset)}${days.map(cell).join('')}</div><p class="modal-text">학사 일정과 방송 편성표입니다. 인물의 비밀이나 아직 알지 못한 생일은 표시하지 않습니다.</p>`);
    $('prev-month').onclick = () => calendarMenu(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1);
    $('next-month').onclick = () => calendarMenu(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1);
    $('modal').classList.add('calendar-modal');
  }
  function messagesMenu() {
    const M=window.AquaMessages,m=M.ensure(s);
    modal('메시지', `<button class="option-button" id="minjae-hint">민재에게 귀띔 듣기 · 하루 한 번</button><div class="message-list">${[...m.inbox].reverse().map(msg=>`<article class="message-entry"><small>${esc(msg.date)} · ${msg.kind==='band'?'밴드 단톡방':W.people[msg.person]?.name||'민재'}</small><p>${esc(msg.text)}</p>${msg.reply===null?msg.kind==='invite'?`<button data-reply="${msg.id}:accept">약속할게</button><button data-reply="${msg.id}:decline">다음에 꼭</button>`:`<button data-reply="${msg.id}:honest">솔직하게 보내기</button><button data-reply="${msg.id}:plain">지우고 다시 쓰기</button><button data-reply="${msg.id}:none">답하지 않기</button>`:`<p class="message-reply">${esc(msg.replyText||({accept:'약속할게.',decline:'다음에 꼭.'}[msg.reply]||''))}</p>`}</article>`).join('')||'<p>아직 도착한 메시지가 없다.</p>'}</div>`);
    $('minjae-hint').onclick=()=>{const lines=M.hint(s);saveAuto();modal('민재의 귀띔',lines.map(t=>`<p class="modal-text">${esc(t)}</p>`).join('')||'<p>아직 소개할 사람이 없다.</p>');};
    $('modal-content').querySelectorAll('[data-reply]').forEach(button=>button.onclick=()=>{
      const [id,mode]=button.dataset.reply.split(':');const msg=m.inbox.find(x=>x.id===id);
      if(!M.respond(s,id,mode))return;saveAuto();
      if(!['honest','plain'].includes(mode)){messagesMenu();return;}
      const honest=M.reply.honest[window.AquaDialogue.tier(s,msg.person)],plain=msg.replyText;
      modal('답장 보내기','<p class="letter-preview" id="message-draft"></p><small>문장을 고르고 보냈다.</small>');
      const frames=[];for(let i=1;i<=honest.length;i++)frames.push(honest.slice(0,i));
      if(mode==='plain'){for(let i=honest.length-1;i>=0;i--)frames.push(honest.slice(0,i));for(let i=1;i<=plain.length;i++)frames.push(plain.slice(0,i));}
      let i=0;const node=$('message-draft');function tick(){if(!$('modal').open||$('message-draft')!==node)return;node.textContent=frames[i++];if(i<frames.length)setTimeout(tick,prefs.reduced?0:32);else setTimeout(()=>{if($('message-draft')===node&&$('modal').open)messagesMenu();},500);}tick();
    });
  }

  function phoneMenu() {
    if (!s) { toast('이야기를 시작하면 휴대폰이 열려요.'); return; }
    modal('나의 작은 일상', `<p class="phone-date">${esc(W.dateLabel(s.date))} · ${esc(times[s.slot])}</p><div class="phone-app-grid"><button data-app="messages"><span>☏</span>메시지</button><button data-app="songs"><span>♫</span>나의 곡</button><button data-app="notes"><span>✧</span>관계와 기억</button><button data-app="calendar"><span>▦</span>달력</button><button data-app="radio"><span>☾</span>아쿠아 루나</button><button data-app="letter"><span>✉</span>사연함</button><button data-app="shop"><span>♢</span>선물 가게</button><button data-app="album"><span>▧</span>함께 보낸 날</button><button data-app="save"><span>◇</span>저장</button><button data-app="settings"><span>⚙</span>설정</button></div>`);
    const actions = { songs: songMenu, messages: messagesMenu, notes: showNotes, calendar: calendarMenu, radio: radioMenu, letter: letterMenu, shop: shopMenu, album: albumMenu, save: slots, settings: settingsMenu };
    $('modal-content').querySelectorAll('[data-app]').forEach(button => button.onclick = () => actions[button.dataset.app]());
  }

  function showTitle() {
    document.body.classList.remove('illustration-mode'); $('scene-art').hidden = true;
    pauseText(); window.AquaAudio.stopVoice(); voicePosition = null; auto = false;
    $('intro').hidden = true; document.body.classList.remove('intro-mode');
    document.body.classList.remove('map-mode'); mapSelection = null;
    $('title').hidden = false; $('map').hidden = true; $('scene').hidden = true; $('status').hidden = true;
    $('cast').replaceChildren(); setBg('night'); $('continue').disabled = !readSave(SAVE_KEY);
  }
  function showEndingComplete() {
    pauseText(); $('map').hidden = true; $('scene').hidden = true; $('intro').hidden = true;
    $('status').hidden = true; $('title').hidden = true; $('cast').replaceChildren();
    setBg('night');
    modal('한여울의 첫해를 마치며', '<p class="modal-text">한 해의 이야기가 끝났습니다. 함께 보낸 기억을 다시 꺼내 볼 수 있습니다.</p><button class="option-button" id="ending-replay">결말 다시 보기</button><button class="option-button" id="ending-album">앨범 열기</button><button class="option-button" id="ending-title">타이틀로 돌아가기</button>');
    $('ending-replay').onclick = () => {
      const id = s.endingId || window.AquaEndings.select(s);
      const data = window.AquaEndings.build(s, id);
      closeModal(); playScene(`ending-${id}`, 'ending', { data });
    };
    $('ending-album').onclick = () => albumMenu();
    $('ending-title').onclick = () => { closeModal(); showTitle(); };
  }
  function startForm() {
    modal('내 이름', '<p class="modal-text">한여울대학교에서 보낼 새로운 한 해. 원하는 이름을 적어 주세요.</p><label for="player-name">이름 · 최대 6자</label><input class="modal-input" id="player-name" maxlength="6" placeholder="나"><label for="nickname">라디오 별명 · 최대 10자</label><input class="modal-input" id="nickname" maxlength="10" placeholder="물고기"><button class="option-button" id="begin">이야기 시작하기 →</button><div id="new-game-confirm" hidden><p class="modal-text" role="status">새로 시작하면 기존 자동 저장이 바뀝니다. 보관하려면 타이틀에서 이어하기를 선택한 뒤 저장 슬롯이나 파일로 저장해 주세요.</p><div class="modal-actions"><button id="new-game-cancel">돌아가기</button><button id="new-game-proceed">새로 시작하기</button></div></div>');
    const begin = () => {
      s = window.AquaState.initial($('player-name').value.trim() || '나', $('nickname').value.trim() || '물고기');
      closeModal(); playScene('intro', 'intro');
    };
    $('begin').onclick = () => {
      let occupied = true;
      try { occupied = localStorage.getItem(SAVE_KEY) !== null; } catch {}
      if (!occupied) { begin(); return; }
      $('begin').hidden = true; $('new-game-confirm').hidden = false;
      $('new-game-cancel').focus?.();
    };
    $('new-game-cancel').onclick = () => { $('new-game-confirm').hidden = true; $('begin').hidden = false; $('begin').focus?.(); };
    $('new-game-proceed').onclick = begin;
  }
  function resume(state) {
    s = state; closeModal();
    if (s.scene) showScene(); else if (s.completed) showEndingComplete(); else prepare();
    saveAuto();
  }
  function confirmLoad(state, successMessage) {
    let occupied = true;
    try { occupied = localStorage.getItem(SAVE_KEY) !== null; } catch {}
    const load = () => { resume(state); toast(successMessage); };
    if (!occupied && !s) { load(); return; }
    modal('진행 불러오기', '<p class="modal-text">불러오면 현재 진행과 자동 저장이 선택한 기록으로 바뀝니다. 현재 진행을 보관하려면 먼저 슬롯에 저장하거나 파일로 내보내세요.</p><div class="modal-actions"><button id="load-cancel">돌아가기</button><button id="load-confirm">불러오기</button></div>');
    $('load-cancel').onclick = () => slots();
    $('load-confirm').onclick = load;
    $('load-cancel').focus?.();
  }
  function slots(confirmOverwrite = null) {
    const rows = [1, 2, 3].map(i => {
      const key = `${SAVE_KEY}-slot-${i}`, value = readSave(key);
      let occupied = true;
      try { occupied = localStorage.getItem(key) !== null; } catch {}
      const description = value ? `${esc(W.dateLabel(value.date))} · ${esc(times[value.slot])}${value.scene ? ' · 장면 진행 중' : ''}` : occupied ? '읽을 수 없는 저장 기록' : '비어 있음';
      const question = confirmOverwrite === i ? '<small role="status">이 슬롯을 덮어쓸까요?</small>' : '';
      const actions = confirmOverwrite === i
        ? `<button data-confirm-save="${i}">덮어쓰기</button><button data-cancel-save="${i}">취소</button>`
        : `<button data-save="${i}" ${s ? '' : 'disabled'}>저장</button><button data-load="${i}" ${value ? '' : 'disabled'}>불러오기</button>`;
      return `<div class="slot"><span>슬롯 ${i}<small>${description}</small>${question}</span>${actions}</div>`;
    }).join('');
    modal('저장과 불러오기', `<p class="modal-text">대사와 선택지의 진행 위치까지 저장됩니다. 파일로 보관하면 다른 실행 환경에서도 가져올 수 있습니다.</p><div class="modal-grid">${rows}</div><div class="modal-actions"><button class="option-button" id="export-save" ${s ? '' : 'disabled'}>파일 내보내기</button><button class="option-button" id="import-save">파일 가져오기</button></div><input type="file" id="save-file" accept=".json,application/json" hidden>`);
    const writeSlot = index => {
      if (!s) return;
      try { localStorage.setItem(`${SAVE_KEY}-slot-${index}`, JSON.stringify(s)); slots(); toast('저장했습니다.'); }
      catch { toast('저장 공간이 부족해요. 파일 내보내기로 보관해 주세요.'); }
    };
    $('modal-content').querySelectorAll('[data-save]').forEach(button => button.onclick = () => {
      const index = Number(button.dataset.save);
      try { if (localStorage.getItem(`${SAVE_KEY}-slot-${index}`) !== null) { slots(index); return; } }
      catch { slots(index); return; }
      writeSlot(index);
    });
    $('modal-content').querySelectorAll('[data-confirm-save]').forEach(button => button.onclick = () => writeSlot(Number(button.dataset.confirmSave)));
    $('modal-content').querySelectorAll('[data-cancel-save]').forEach(button => button.onclick = () => slots());
    // Default keyboard focus to the non-destructive action after the row changes.
    if (confirmOverwrite !== null) $('modal-content').querySelectorAll('[data-cancel-save]')[0]?.focus?.();
    $('modal-content').querySelectorAll('[data-load]').forEach(button => button.onclick = () => {
      const state = readSave(`${SAVE_KEY}-slot-${button.dataset.load}`);
      if (state) confirmLoad(state, '저장을 불러왔습니다.');
    });
    $('export-save').onclick = exportSave;
    $('import-save').onclick = () => $('save-file').click();
    $('save-file').onchange = async event => {
      const file = event.target.files[0]; if (!file) return;
      if (file.size > 2 * 1024 * 1024) { toast('저장 파일의 크기를 확인해 주세요.'); return; }
      try {
        const state = window.AquaState.restore(JSON.parse(await file.text()));
        if (!state) throw Error('Invalid save');
        confirmLoad(state, '파일의 진행을 불러왔습니다.');
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
    const voiceControl = Object.keys(window.AquaAudio.voiceTracks).length ? `<div class="form-row"><label for="voice-volume">목소리 음량</label><input id="voice-volume" type="range" min="0" max="100" value="${Math.round(prefs.voiceVolume*100)}"></div>` : '';
    modal('읽기와 연출', `<div class="form-row"><label for="text-size">대사 글자 크기</label><select id="text-size">${[20, 24, 28].map(v => `<option value="${v}" ${prefs.textSize === v ? 'selected' : ''}>${v}px</option>`).join('')}</select></div><div class="form-row"><label for="text-speed">대사가 나타나는 속도</label><select id="text-speed">${[[0, '바로 표시'], [26, '천천히'], [50, '빠르게']].map(([v, text]) => `<option value="${v}" ${prefs.textSpeed === v ? 'selected' : ''}>${text}</option>`).join('')}</select></div><div class="form-row"><label for="auto-delay">자동 진행 · 대사 표시 뒤 기다리는 시간</label><select id="auto-delay">${[1.5, 2.5, 4].map(v => `<option value="${v}" ${prefs.autoDelay === v ? 'selected' : ''}>${v}초</option>`).join('')}</select></div><div class="form-row"><label for="bgm-volume">배경 음악 음량</label><input id="bgm-volume" type="range" min="0" max="100" value="${Math.round(prefs.bgmVolume*100)}"></div>${voiceControl}<div class="modal-grid"><label class="check-row"><input id="skip-unread" type="checkbox" ${prefs.skipUnread ? 'checked' : ''}>읽지 않은 대사도 건너뛰기</label><label class="check-row"><input id="sfx-setting" type="checkbox" ${prefs.sfx ? 'checked' : ''}>선택 효과음</label><label class="check-row"><input id="motion-setting" type="checkbox" ${prefs.reduced ? 'checked' : ''}>움직임 줄이기 · 대사 바로 표시</label><label class="check-row"><input id="bond-setting" type="checkbox" ${prefs.showBond ? 'checked' : ''}>관계 노트에 마음 수치 표시</label><button id="apply-settings">설정 적용</button><button id="game-guide">게임 안내</button><button id="music-credits">음악 출처</button></div><p class="modal-text">Space / Enter · 대사 완성 또는 넘기기<br>숫자키 · 선택지 고르기 · Esc · 창 닫기</p>`);
    $('game-guide').onclick = gameGuide;
    $('music-credits').onclick = musicCredits;
    $('apply-settings').onclick = () => {
      prefs.textSize = Number($('text-size').value); prefs.textSpeed = Number($('text-speed').value);
      prefs.autoDelay = Number($('auto-delay').value); prefs.sfx = $('sfx-setting').checked;
      prefs.skipUnread = $('skip-unread').checked; prefs.bgmVolume = Number($('bgm-volume').value)/100;
      if ($('voice-volume')) prefs.voiceVolume = Number($('voice-volume').value)/100;
      prefs.reduced = $('motion-setting').checked; prefs.showBond = $('bond-setting').checked;
      applyPrefs(); closeModal(); toast('읽기 설정을 적용했습니다.');
    };
  }
  function gameGuide() {
    modal('한여울에서 보내는 하루', `<div class="modal-body"><p class="modal-text"><b>학교와 자유 시간</b><br>수업이 있는 날에는 학교 이야기를 먼저 봅니다. 이후 오른쪽에서 장소를 골라 풍경과 기본 활동을 살펴본 다음 방문할 수 있습니다. 주말과 방학은 일정이 다릅니다.</p><p class="modal-text"><b>우연한 만남</b><br>누구를 만날지는 날짜와 시간, 각자의 일정에 따라 달라집니다. 방문하기 전에는 만날 사람을 표시하지 않습니다.</p><p class="modal-text"><b>밤과 휴대폰</b><br>밤에는 라디오를 듣거나 사연을 보내고 하루를 마무리할 수 있습니다. 휴대폰에서 메시지, 달력, 추억과 저장을 열어 보세요.</p><p class="modal-text"><b>조작과 저장</b><br>클릭 또는 Enter·Space로 대사를 진행하고 숫자키로 선택합니다. AUTO는 자동 진행, SKIP은 기본 설정에서 읽은 대사를 건너뜁니다. 저장 메뉴에서 슬롯과 파일 백업을 사용할 수 있습니다.</p></div><button class="option-button" id="guide-back">설정으로 돌아가기</button>`);
    $('guide-back').onclick = settingsMenu;
  }
  function musicCredits() {
    modal('음악 출처', `<p class="modal-text">Music by Tanner Helland · <a href="https://github.com/tannerhelland/free-music" target="_blank" rel="noopener noreferrer">원곡과 제작자</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p><p class="modal-text">Familiar Roads · Leaving Millie (live piano) · A Memory Away</p><p class="modal-text">원본 음원의 파일명만 변경했으며 게임에서 반복 재생합니다. 상세 출처는 함께 제공되는 assets/audio/CREDITS.md에 있습니다.</p><button class="option-button" id="credits-back">설정으로 돌아가기</button>`);
    $('credits-back').onclick = settingsMenu;
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
  $('skip').onclick = event => {event.stopPropagation();skipRead();};
  $('scene-art').onclick = event => { event.stopPropagation(); illustrationMenu(s?.scene?.illustration); };
  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true; window.AquaAudio.unlock();
    if (s) window.AquaAudio.play(s.scene?.radioEpisode ? 'radio' : (s.scene?.time ?? s.slot) === 3 ? 'night' : 'campus');
  }
  document.addEventListener('pointerdown', unlockAudio, {once:true});
  $('auto').onclick = event => { event.stopPropagation(); auto = !auto; $('auto').textContent = `AUTO ${auto ? 'ON' : 'OFF'}`; $('auto').setAttribute('aria-pressed', String(auto)); scheduleAuto(); };
  $('close').onclick = () => { const completed = s?.completed && !s.scene, ending = $('modal-title').textContent === '한여울의 첫해를 마치며'; closeModal(); if (completed) { if (ending) showTitle(); else showEndingComplete(); } };
  $('modal').addEventListener('cancel', event => { if (s?.completed && !s.scene) { const ending = $('modal-title').textContent === '한여울의 첫해를 마치며'; event.preventDefault(); closeModal(); if (ending) showTitle(); else showEndingComplete(); } else setTimeout(() => { if (!document.hidden && !$('modal').open) window.AquaAudio.resumeVoice(); scheduleAuto(); }, 0); });
  $('home').onclick = () => { saveAuto(); closeModal(); showTitle(); };
  $('save').onclick = slots; $('history').onclick = historyMenu; $('settings').onclick = settingsMenu;
  $('phone').onclick = phoneMenu; $('end-day').onclick = finishDay;
  $('backup-now').onclick = exportSave;
  document.addEventListener('keydown', event => {
    unlockAudio();
    if ($('modal').open || !s?.scene || ($('scene').hidden && $('intro').hidden) || event.target.closest('input, select, textarea, [contenteditable="true"]')) return;
    if (event.repeat) return;
    // Let focused controls receive their native keyboard activation instead of
    // treating Enter or Space as a request to advance the dialogue.
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('button, a, [role="button"]')) return;
    if (event.key === 'Control') { event.preventDefault(); skipRead(); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); advance(); }
    else if (/^[1-6]$/.test(event.key)) { event.preventDefault(); choose(Number(event.key) - 1); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pauseText(); window.AquaAudio.pauseVoice(); if (s?.scene) $('line').textContent = fullText; saveAuto(); }
    else { if (!$('modal').open) window.AquaAudio.resumeVoice(); scheduleAuto(); }
  });
  applyPrefs(); showTitle();
})();
