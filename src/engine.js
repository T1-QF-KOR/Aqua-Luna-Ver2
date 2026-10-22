(() => {
  'use strict';
  const D = window.LunaData;
  const N = window.LunaStory;
  const VERSION = 2;
  const LEGACY_INTRO_PAGES = 9;
  const statNames = { knowledge: '지식', fitness: '체력', sensitivity: '감수성' };
  const training = [
    { id: 'study', name: '공부하기 · 화성학·보컬 이론', stat: 'knowledge', energy: 10, gain: 4 },
    { id: 'exercise', name: '운동하기', stat: 'fitness', energy: 20, gain: 4 },
    { id: 'music', name: '발라드 감상·가사 해석 익히기', stat: 'sensitivity', energy: 10, gain: 4 }
  ];
  const freshGrowth = () => ({ stats: { knowledge: 0, fitness: 0, sensitivity: 0 }, mood: 50, schedule: [] });
  function choiceReason(state, choice) {
    const g = state.growth || freshGrowth();
    if (choice.requireStat && g.stats[choice.requireStat] < choice.requireValue) return `${statNames[choice.requireStat]} ${choice.requireValue} 필요`;
    if (choice.requireMood && g.mood < choice.requireMood) return `수련의 기분 ${choice.requireMood} 필요`;
    return null;
  }
  function scheduleItem(entry) {
    if (!entry || typeof entry !== 'object') return null;
    if (entry.type === 'train') { const t = training.find(t => t.id === entry.id); return t && { ...t, ap: 1 }; }
    if (entry.type === 'work') return D.jobs.find(j => j.id === entry.id);
    if (entry.type === 'rest' && entry.id === 'rest') return { name: '잠깐 쉬기', ap: 1 };
    return null;
  }
  function setSchedule(state, entries) {
    if (introPending(state)) return { state, error: '인트로를 마친 뒤 일정을 정해 주세요.' };
    if (state.story.active || state.story.activities?.active) return { state, error: '진행 중인 이야기나 체험을 먼저 마쳐 주세요.' };
    if (!Array.isArray(entries) || entries.length > 3 || entries.some(e => !scheduleItem(e)) || entries.reduce((n,e) => n + scheduleItem(e).ap, 0) > state.ap) return { state, error: '남은 시간 안에 가능한 일정을 골라 주세요.' };
    const s = copy(state); s.growth.schedule = entries.map(e => ({ type: e.type, id: e.id }));
    return { state: s };
  }
  function runSchedule(state, expected) {
    const entry = state.growth.schedule[0];
    // The UI captures the complete state: a stale click cannot run a second queued task.
    if (expected !== JSON.stringify(state) || !entry) return { state, error: '현재 일정에서 다음 활동을 골라 주세요.' };
    const result = act(state, entry.type, entry.id);
    if (!result.error) result.state.growth.schedule.shift();
    return result;
  }
  // Runs the whole plan in one go; stops at the first blocked entry and keeps what already ran.
  function runAllSchedule(state, expected) {
    if (expected !== JSON.stringify(state) || !state.growth.schedule.length) return { state, error: '현재 일정에서 다음 활동을 골라 주세요.' };
    let s = state; const results = [];
    while (s.growth.schedule.length) {
      const r = runSchedule(s, JSON.stringify(s));
      if (r.error) return results.length ? { state: s, results, stopped: r.error } : { state, error: r.error };
      s = r.state; results.push(r.result);
    }
    return { state: s, results };
  }
  const copy = s => JSON.parse(JSON.stringify(s));
  const bounded = n => Math.max(0, Math.min(100, n));
  // Closeness grows slower as it deepens; fractions carry over so small kindnesses still add up.
  const bondCurve = [[20, 1], [40, 0.5], [60, 0.3], [80, 0.18], [101, 0.1]];
  function grow(s, key, gain) {
    if (!(gain > 0)) return;
    const carry = { affection: 0, trust: 0, ...(s.story.carry || {}) };
    const total = Math.round(gain * bondCurve.find(([max]) => s[key] < max)[1] * 100) + carry[key];
    s[key] = bounded(s[key] + Math.floor(total / 100)); carry[key] = s[key] >= 100 ? 0 : total % 100;
    s.story.carry = carry;
  }
  const trainGain = value => value < 30 ? 4 : value < 60 ? 3 : value < 85 ? 2 : 1;
  // Weekly settlement: a baseline taken each Monday morning, compared on the next Monday.
  const weekMark = s => ({ day: s.day, affection: s.affection, trust: s.trust, earned: s.totalEarned, spent: s.totalSpent, dates: s.story.dateCount, stories: s.story.completed.length });
  function weekSummary(state) {
    const w = state.week || weekMark(state), inWeek = j => j.day >= w.day && j.day <= state.day, count = type => state.journal.filter(j => inWeek(j) && j.type === type).length;
    return { from: w.day, to: state.day, earned: state.totalEarned - w.earned, spent: state.totalSpent - w.spent, dates: state.story.dateCount - w.dates, stories: state.story.completed.length - w.stories, affection: state.affection - w.affection, trust: state.trust - w.trust, gifts: count('gift'), talks: count('talk'), works: count('work'), mood: state.growth.mood };
  }
  // New game+: each ending seen leaves a small head start for the next run.
  const legacyBonus = { lovers: { name: '연인 결말', money: 50000 }, friends: { name: '우정 결말', stats: 6 } };
  const ending = s => N.done(s, 'epilogue') && Object.hasOwn(legacyBonus, s.story.relationship) ? s.story.relationship : null;
  const legacyList = list => Array.isArray(list) ? Object.keys(legacyBonus).filter(k => list.includes(k)) : [];
  function applyLegacy(s) {
    if (!s.ngp || s.ngp.applied) return;
    s.ngp.endings.forEach(k => {
      const b = legacyBonus[k];
      if (b.money) { s.money += b.money; s.totalEarned += b.money; }
      if (b.stats) Object.keys(statNames).forEach(st => { s.growth.stats[st] = bounded(s.growth.stats[st] + b.stats); });
      s.journal.push({ day: s.day, type: 'legacy', title: `지난 회차의 선물 · ${b.name}`, text: b.money ? `${b.name}을 본 기억이 남아 소지금 +${b.money.toLocaleString('ko-KR')}원으로 시작해요.` : `${b.name}을 본 기억이 남아 지식·체력·감수성 +${b.stats}으로 시작해요.`, money: b.money || 0, outfit: s.outfit });
    });
    s.ngp.applied = true; s.week = weekMark(s);
  }
  const makeState = ({ intro = false, legacy = [] } = {}) => {
    const s = { version: VERSION, intro: intro ? { step: 0 } : null, day: 1, ap: D.maxAp, energy: 100, money: D.startingMoney, affection: 0, trust: 0, owned: ['casual'], outfit: 'casual', ownedAccessories: ['none'], legwear: 'none', ownedNeckAccessories: ['headset'], neckAccessory: 'none', location: 'practice', memories: [], datesToday: [], journal: [], totalEarned: 0, totalSpent: 0, expenseGoal: null, savedAt: null, story: N.fresh(), growth: freshGrowth(), lastWeek: null };
    const endings = legacyList(legacy);
    s.ngp = endings.length ? { endings, applied: false } : null;
    s.week = weekMark(s);
    if (!intro) applyLegacy(s);
    return s;
  };
  const introPending = state => !!state.intro && state.intro.step < N.intro.length;
  function moveIntro(state, expectedStep, action) {
    if (!introPending(state) || state.intro.step !== expectedStep || !['next','previous','skip'].includes(action) || action === 'previous' && expectedStep === 0) return { state, error: '현재 인트로 장면에서 이동해 주세요.' };
    const s = copy(state);
    s.intro.step = action === 'skip' ? N.intro.length : expectedStep + (action === 'previous' ? -1 : 1);
    const bonus = !introPending(s) && s.ngp && !s.ngp.applied ? s.ngp.endings.map(k => legacyBonus[k].name) : null;
    if (bonus) applyLegacy(s);
    return { state: s, result: bonus ? { legacy: bonus } : undefined };
  }
  function expenseItem(goal) {
    if (!goal || typeof goal !== 'object') return null;
    const items = goal.type === 'buy' ? D.outfits : goal.type === 'date' ? D.dates : [];
    return items.find(item => item.id === goal.id && item.cost > 0) || null;
  }
  function planExpense(state, goal) {
    const item = expenseItem(goal);
    if (goal !== null && (!item || goal.type === 'buy' && state.owned.includes(goal.id))) return { state, error: '아직 보유하지 않은 의상이나 유료 데이트를 골라 주세요.' };
    return { state: { ...copy(state), expenseGoal: goal === null ? null : { type: goal.type, id: goal.id } } };
  }
  function expenseProgress(state) {
    const item = expenseItem(state.expenseGoal);
    if (!item) return null;
    return { name: item.name, cost: item.cost, shortage: Math.max(0, item.cost - state.money), percent: Math.min(100, Math.floor(state.money / item.cost * 100)), ready: !reason(state, state.expenseGoal.type, item.id), reason: reason(state, state.expenseGoal.type, item.id) };
  }
  function reason(state, type, id) {
    if (introPending(state)) return '인트로를 마치거나 건너뛴 뒤 일상을 시작해 주세요.';
    if (state.story.activities?.active) return '진행 중인 체험을 먼저 마치거나 중단해 주세요. 관계와 이야기에서 이어갈 수 있어요.';
    if (state.story.active) return '진행 중인 이야기를 먼저 마쳐 주세요. 관계와 이야기에서 이어갈 수 있어요.';
    if (type === 'train') {
      const t = training.find(t => t.id === id);
      if (!t) return '알 수 없는 육성 활동입니다.';
      if (state.ap < 1) return '오늘의 시간을 모두 사용했어요.';
      if (state.energy < t.energy) return '기력이 부족해요. 잠시 쉬어 주세요.';
      if (state.growth.stats[t.stat] >= 100) return '이미 충분히 성장한 능력치예요.';
      return null;
    }
    if (type === 'equipNeckAccessory') {
      if (!['none', 'headset'].includes(id)) return '알 수 없는 소품입니다.';
      if (id !== 'none' && !state.ownedNeckAccessories?.includes(id)) return '보유한 소품을 골라 주세요.';
      if ((state.neckAccessory || 'none') === id) return '이미 선택한 코디입니다.';
      return null;
    }
    if (type === 'buyAccessory' || type === 'equipAccessory') {
      const accessory = D.accessories.find(a => a.id === id);
      if (!accessory) return '알 수 없는 소품입니다.';
      if (type === 'buyAccessory') {
        if (state.ownedAccessories.includes(id)) return '이미 보유한 소품입니다.';
        if (state.money < accessory.cost) return `${(accessory.cost - state.money).toLocaleString('ko-KR')}원이 더 필요해요.`;
      } else {
        if (!state.ownedAccessories.includes(id)) return '먼저 소품을 구매해 주세요.';
        if (id !== 'none' && state.outfit !== 'skirt') return '치마 의상을 먼저 입혀 주세요.';
        if (state.legwear === id) return '이미 선택한 코디입니다.';
      }
      return null;
    }
    const item = type === 'work' ? D.jobs.find(x => x.id === id) : type === 'date' ? D.dates.find(x => x.id === id) : type === 'buy' || type === 'equip' ? D.outfits.find(x => x.id === id) : null;
    if (['work', 'date', 'buy', 'equip'].includes(type) && !item) return '알 수 없는 활동입니다.';
    if (type === 'buy' && state.owned.includes(id)) return '이미 보유한 의상입니다.';
    if (type === 'equip' && !state.owned.includes(id)) return '먼저 의상을 구매해 주세요.';
    if (type === 'equip' && state.outfit === id) return '지금 착용 중인 의상입니다.';
    if (type === 'date' && state.datesToday.length) return '데이트는 하루 한 번 할 수 있어요. 다음 날 다시 초대해 주세요.';
    if (type === 'date' && state.trust < item.requiredTrust) return `신뢰 ${item.requiredTrust}부터 함께 갈 수 있어요.`;
    if (type === 'date' && window.LunaCourses?.lockReason(state,item)) return window.LunaCourses.lockReason(state,item);
    if (['work', 'date'].includes(type) && state.ap < item.ap) return '남은 시간이 부족해요. 다음 날을 시작해 주세요.';
    if (['work', 'date'].includes(type) && state.energy < item.energy) return '기력이 부족해요. 잠시 쉬어 주세요.';
    if (['buy', 'date'].includes(type) && state.money < item.cost) return `${(item.cost - state.money).toLocaleString('ko-KR')}원이 더 필요해요.`;
    if (type === 'rest' && state.ap < 1) return '오늘의 시간을 모두 사용했어요.';
    if (type === 'rest' && state.energy === 100) return '기력이 이미 충분해요.';
    if (!['work', 'date', 'buy', 'equip', 'rest', 'nextDay'].includes(type)) return '알 수 없는 행동입니다.';
    if (type === 'nextDay' && state.day >= 9999) return '체험 가능한 날짜를 모두 진행했어요.';
    return null;
  }
  function act(state, type, id) {
    const error = reason(state, type, id);
    if (error) return { state, error };
    const s = copy(state);
    let title, text, money = 0, encounter = null, week = null;
    if (type === 'train') {
      const t = training.find(t => t.id === id), before = s.growth.stats[t.stat];
      const examBonus = D.calendar(s.day).event?.id === 'exam' && t.stat === 'knowledge' ? 2 : 0;
      s.ap--; s.energy -= t.energy; s.growth.stats[t.stat] = bounded(before + trainGain(before) + examBonus);
      title = `${t.name} 완료`; text = `${statNames[t.stat]} +${s.growth.stats[t.stat] - before} · 시간 1칸 · 기력 -${t.energy}`;
      s.location = t.id === 'exercise' ? 'rooftop' : 'practice';
    } else if (type === 'work') {
      const j = D.jobs.find(x => x.id === id);
      money = j.pay; s.money += money; s.totalEarned += money; s.ap -= j.ap; s.energy -= j.energy;
      title = `${j.name} 완료`; text = `${money.toLocaleString('ko-KR')}원을 벌었어요. 오늘의 노력이 작은 여유가 되었습니다.`;
      const stat = { cafe: 'sensitivity', edit: 'knowledge', event: 'fitness' }[id]; s.growth.stats[stat] = bounded(s.growth.stats[stat] + 2); text += ` ${statNames[stat]} +2.`;
      s.location = { cafe: 'cafe', edit: 'practice', event: 'concert' }[id];
      if (workEncounter(state, id)) {
        const scene = N.workScenes[id][s.day % N.workScenes[id].length], before = { affection: s.affection, mood: s.growth.mood };
        grow(s, 'affection', 1); s.growth.mood = bounded(s.growth.mood + 4); s.story.workMet = s.day; s.story.lastMet = s.day;
        text += ' 일하는 중에 수련이 잠깐 들렀어요.';
        encounter = { title: scene.title, line: N.messageText(s, scene.line), face: scene.face, affection: s.affection - before.affection, mood: s.growth.mood - before.mood };
      }
    } else if (type === 'date') {
      const d = D.dates.find(x => x.id === id);
      money = -d.cost; s.money += money; s.totalSpent += d.cost; s.ap -= d.ap; s.energy -= d.energy;
      s.datesToday.push(id);
      title = `${d.name} 출발`; text = `비용과 시간을 사용했어요. ${N.script('date',id).length}번의 선택을 나누면 관계 변화와 추억이 남습니다.`;
      s.location = d.location;
      s.story.active = { kind: 'date', id, day: s.day, outfit: s.outfit, legwear: s.legwear, neckAccessory: s.neckAccessory, time: D.timeForAp(state.ap), choices: [] };
    } else if (type === 'buy') {
      const o = D.outfits.find(x => x.id === id);
      money = -o.cost; s.money += money; s.totalSpent += o.cost; s.owned.push(id);
      title = '옷장에 새로운 의상'; text = `${o.name}를 구매했어요. 옷장에서 갈아입힐 수 있습니다.`;
    } else if (type === 'equip') {
      s.outfit = id; title = '의상 변경'; text = `${D.outfits.find(x => x.id === id).name}를 착용했어요.`;
      if (id !== 'skirt') s.legwear = 'none';
    } else if (type === 'buyAccessory') {
      const a = D.accessories.find(x => x.id === id);
      money = -a.cost; s.money += money; s.totalSpent += a.cost; s.ownedAccessories.push(id);
      title = '옷장에 새로운 소품'; text = `${a.name}을 구매했어요. 치마 의상과 함께 선택할 수 있습니다.`;
    } else if (type === 'equipNeckAccessory') {
      s.neckAccessory = id; title = '헤드셋 변경'; text = id === 'headset' ? '수련의 헤드셋을 착용했어요.' : '헤드셋을 벗었어요.';
    } else if (type === 'equipAccessory') {
      s.legwear = id; title = '스타킹 변경'; text = `${D.accessories.find(x => x.id === id).name}으로 코디를 바꿨어요.`;
    } else if (type === 'rest') {
      const recovery = Math.min(35, 100 - s.energy); s.energy += recovery; s.ap -= 1;
      title = '잠깐의 휴식'; text = `숨을 고르고 기력 ${recovery}을 회복했어요.`;
      s.location = 'rooftop';
    } else {
      s.day += 1; s.ap = D.maxAp; s.energy = bounded(s.energy + 60); s.datesToday = []; s.growth.schedule = [];
      if (s.story) {
        // Yesterday's message moves to the archive; friend and notice messages arrive with the new day.
        const archive = [...(s.story.msgLog || [])];
        if (state.story.message) archive.push({ ...state.story.message, from: 'sulien' });
        s.story.message = N.pickMessage(state, s) || null;
        const friend = N.pickFriend(state, s);
        if (friend?.key === 'heart') s.story.heartHint = Number(friend.arg);
        [friend, N.pickNotice(s)].filter(Boolean).forEach(m => archive.push(m));
        const trimmed = archive.slice(-60); s.story.seen = Math.max(0, (s.story.seen || 0) - (archive.length - trimmed.length)); s.story.msgLog = trimmed;
      }
      // Missing each other lowers only her mood, gently and with a floor; meeting again restores it.
      if (s.story?.lastMet !== undefined && s.day - s.story.lastMet >= 3 && s.growth.mood > 30) s.growth.mood = Math.max(30, s.growth.mood - 5);
      // A very good mood settles a little overnight, so today's care still shows.
      if (s.growth.mood > 70) s.growth.mood = Math.max(70, s.growth.mood - 3);
      title = `${s.day}일째의 시작`; text = '새로운 하루가 찾아왔어요. 시간 3칸과 기력을 회복했습니다.';
      s.location = 'practice';
      if (D.calendar(s.day).weekday === '월') { week = weekSummary(state); s.lastWeek = week; s.week = weekMark(s); }
    }
    if (s.expenseGoal?.type === type && s.expenseGoal.id === id) s.expenseGoal = null;
    s.journal.push({ day: s.day, type, title, text, money, outfit: s.outfit });
    s.journal = s.journal.slice(-200);
    return { state: s, result: { title, text, money, ...(encounter ? { encounter } : {}), ...(week ? { week } : {}) } };
  }
  // Work is not only a grind: on some shifts Sulien drops by. Deterministic, so the preview matches the result.
  const encounterSlot = { cafe: 0, edit: 1, event: 2 };
  const workEncounter = (state, id) => N.done(state, 'hello') && state.story.workMet !== state.day && (state.day * 7 + encounterSlot[id] * 3) % 5 < 2;
  function dateWithOutfit(state, id, outfit, legwear, neckAccessory = state.neckAccessory) {
    if (!['none','headset'].includes(neckAccessory) || neckAccessory !== 'none' && !state.ownedNeckAccessories.includes(neckAccessory)) return { state, error: '보유한 헤드셋을 선택해 주세요.' };
    if (!state.owned.includes(outfit) || !state.ownedAccessories.includes(legwear) || outfit !== 'skirt' && legwear !== 'none') return { state, error: '보유한 의상과 어울리는 소품을 골라 주세요.' };
    const error = reason(state, 'date', id);
    if (error) return { state, error };
    return act({ ...state, outfit, legwear, neckAccessory }, 'date', id);
  }
  function startStory(state, id) {
    if (introPending(state)) return { state, error: '인트로를 먼저 마쳐 주세요.' };
    const event = N.available(state).find(e => e.id === id);
    if (!event) return { state, error: '아직 열리지 않았거나 이미 마친 이야기예요.' };
    const s = copy(state);
    s.story.active = { kind: 'event', id, day: s.day, outfit: s.outfit, legwear: s.legwear, neckAccessory: s.neckAccessory, time: D.timeForAp(s.ap), choices: [] };
    s.location = event.location;
    return { state: s };
  }
  // expectedStep makes rapid double clicks and stale UI callbacks harmless.
  function chooseStory(state, choiceId, expectedStep) {
    if (state.story.activities?.active) return {state,error:'체험을 마치거나 중단한 뒤 대화를 이어 주세요.'};
    const active = state.story.active, step = active?.choices.length;
    const choice = active && N.script(active.kind,active.id)?.[step]?.choices.find(c => c.id === choiceId);
    if (!choice || expectedStep !== step) return { state, error: '현재 장면의 선택지를 골라 주세요.' };
    const locked = choiceReason(state, choice);
    if (locked) return { state, error: locked };
    const s = copy(state), a = s.story.active;
    s.growth.mood = bounded(s.growth.mood + (choice.mood || 0));
    a.choices.push(choiceId);
    if (a.choices.length < N.script(a.kind,a.id).length) return { state: s, result: { title: '수련의 대답', text: choice.reply } };
    const choices = a.choices.map((id,i) => N.script(a.kind,a.id)[i].choices.find(c=>c.id===id));
    let affection = choices.reduce((n,c) => n + (c.affection || 0), 0), trust = choices.reduce((n,c) => n + (c.trust || 0), 0), kept = false;
    if (a.kind === 'date') {
      const d = D.dates.find(d=>d.id===a.id);
      affection = d.affection + choices.reduce((sum,c)=>sum+(c.affection||0),0);
      trust = d.trust + choices.reduce((sum,c)=>sum+(c.trust||0),0);
      s.story.dateCount++;
      window.LunaCourses?.record(s,a);
      if (a.id === 'walk' && s.story.promise) { s.story.promise = false; s.story.keptPromises++; kept = true; }
      s.memories.push({ day: a.day, date: a.id, outfit: a.outfit, legwear: a.legwear, neckAccessory: a.neckAccessory || 'none', time: a.time, choices: a.choices, keptPromise: kept });
      s.memories = s.memories.slice(-60);
    } else s.story.completed.push({ id: a.id, choices: a.choices, day: a.day });
    choices.forEach(c => {
      ['preference','boundary','music','relationship','speech'].forEach(key=> { if (c[key]) s.story[key] = c[key]; });
      if (c.promise) s.story.promise = true;
      if (c.relationship === 'considering') s.story.considerAt = s.story.dateCount;
      if (['lovers','friends'].includes(c.relationship)) s.story.commitAt = s.story.dateCount;
    });
    grow(s, 'affection', affection); grow(s, 'trust', trust);
    if (s.story.lastMet !== undefined && s.day - s.story.lastMet >= 3) s.growth.mood = bounded(s.growth.mood + 8);
    s.story.lastMet = s.day;
    const title = a.kind === 'date' ? `${D.dates.find(d=>d.id===a.id).name} 완료` : N.events.find(e=>e.id===a.id).title;
    const text = `${choice.reply}${a.kind === 'date' ? ` 호감 +${s.affection-state.affection} · 신뢰 +${s.trust-state.trust}${kept ? ' · 산책 약속을 지켰어요.' : ''}` : ''}`;
    s.story.last = { ...a, affection: s.affection-state.affection, trust: s.trust-state.trust };
    s.story.active = null;
    s.journal.push({ day: s.day, type: a.kind === 'date' ? 'date' : 'story', title, text, money: 0, outfit: s.outfit });
    s.journal = s.journal.slice(-200);
    return { state: s, result: { title, text } };
  }
  function validate(s) {
    const int = (v, min, max) => Number.isSafeInteger(v) && v >= min && v <= max;
    if (!s || s.version !== VERSION || !int(s.day, 1, 9999) || !int(s.ap, 0, 3) || !int(s.energy, 0, 100) || !int(s.money, 0, 1e12) || !int(s.affection, 0, 100) || !int(s.trust, 0, 100)) return null;
    if (!int(s.totalEarned, 0, 1e12) || !int(s.totalSpent, 0, 1e12) || s.money !== D.startingMoney + s.totalEarned - s.totalSpent) return null;
    const outfitIds = D.outfits.map(x => x.id);
    if (!Array.isArray(s.owned) || !s.owned.includes('casual') || s.owned.length > outfitIds.length || new Set(s.owned).size !== s.owned.length || !s.owned.every(x => outfitIds.includes(x)) || !s.owned.includes(s.outfit)) return null;
    if (!Array.isArray(s.datesToday) || s.datesToday.length > 1 || !s.datesToday.every(id => D.dates.some(d => d.id === id))) return null;
    if (!Array.isArray(s.journal) || s.journal.length > 200 || !s.journal.every(j => j && int(j.day, 1, s.day) && ['work','date','story','buy','equip','buyAccessory','equipAccessory','equipNeckAccessory','rest','nextDay','train','message','gift','talk','legacy'].includes(j.type) && typeof j.title === 'string' && j.title.length < 120 && typeof j.text === 'string' && j.text.length < 500 && int(j.money, -1e9, 1e9) && outfitIds.includes(j.outfit))) return null;
    const ownedAccessories = s.ownedAccessories === undefined ? ['none'] : s.ownedAccessories;
    const legwear = s.legwear === undefined ? 'none' : s.legwear;
    const ownedNeckAccessories = s.ownedNeckAccessories === undefined ? ['headset'] : s.ownedNeckAccessories;
    const neckAccessory = s.neckAccessory === undefined ? 'none' : s.neckAccessory;
    if (!Array.isArray(ownedNeckAccessories) || ownedNeckAccessories.length !== 1 || ownedNeckAccessories[0] !== 'headset' || !['none', 'headset'].includes(neckAccessory)) return null;
    const validNeck = record => record.neckAccessory === undefined || ['none', 'headset'].includes(record.neckAccessory);
    const location = s.location === undefined ? 'practice' : s.location;
    const memories = s.memories === undefined ? [] : s.memories;
    if (!Array.isArray(ownedAccessories) || !ownedAccessories.includes('none') || new Set(ownedAccessories).size !== ownedAccessories.length || !ownedAccessories.every(a => D.accessories.some(x => x.id === a)) || !ownedAccessories.includes(legwear) || s.outfit !== 'skirt' && legwear !== 'none' || !Object.hasOwn(D.locations, location)) return null;
    if (!Array.isArray(memories) || memories.length > 60 || !memories.every(m => m && validNeck(m) && int(m.day, 1, s.day) && D.dates.some(d => d.id === m.date) && s.owned.includes(m.outfit) && ownedAccessories.includes(m.legwear) && (m.outfit === 'skirt' || m.legwear === 'none') && (m.time === undefined || D.times.some(t => t.id === m.time)))) return null;
    if (!memories.every(m => m.choices === undefined || Array.isArray(m.choices) && m.choices.length === N.script('date',m.date)?.length && m.choices.every((id,i) => N.script('date',m.date)[i].choices.some(c=>c.id===id)) && typeof m.keptPromise === 'boolean')) return null;
    const story = N.validate(s.story, { ...s, ownedAccessories, neckAccessory });
    if (!story) return null;
    // Missing progress belongs to an older save: never inject a prologue into its story.
    // The prologue once had 9 pages; older steps past the current end count as finished.
    if (s.intro !== undefined && s.intro !== null && (typeof s.intro !== 'object' || Array.isArray(s.intro) || !int(s.intro.step, 0, Math.max(N.intro.length, LEGACY_INTRO_PAGES)))) return null;
    const intro = s.intro == null ? null : { step: Math.min(s.intro.step, N.intro.length) };
    if (intro && intro.step < N.intro.length && (s.day !== 1 || s.ap !== D.maxAp || s.energy !== 100 || s.totalEarned !== 0 || s.totalSpent !== 0 || s.journal.length || story.active || story.completed.length || story.dateCount || story.activities?.active)) return null;
    if (s.savedAt !== null && (typeof s.savedAt !== 'string' || !Number.isFinite(Date.parse(s.savedAt)))) return null;
    const growth = s.growth === undefined ? freshGrowth() : s.growth;
    if (!growth || !growth.stats || !Object.keys(statNames).every(k => int(growth.stats[k], 0, 100)) || !int(growth.mood, 0, 100) || !Array.isArray(growth.schedule) || growth.schedule.length > 3 || !growth.schedule.every(e => scheduleItem(e)) || growth.schedule.reduce((n,e) => n + scheduleItem(e).ap, 0) > 3) return null;
    const goal = s.expenseGoal === undefined ? null : s.expenseGoal;
    if (goal !== null && (!expenseItem(goal) || goal.type === 'buy' && s.owned.includes(goal.id))) return null;
    // Older saves have no weekly baseline: the current day becomes the start of the week.
    const week = s.week === undefined ? weekMark({ ...s, story }) : s.week;
    if (!week || !int(week.day, 1, s.day) || !int(week.affection, 0, s.affection) || !int(week.trust, 0, s.trust) || !int(week.earned, 0, s.totalEarned) || !int(week.spent, 0, s.totalSpent) || !int(week.dates, 0, story.dateCount) || !int(week.stories, 0, story.completed.length)) return null;
    const lastWeek = s.lastWeek === undefined ? null : s.lastWeek;
    if (lastWeek !== null && (!lastWeek || !int(lastWeek.from, 1, s.day) || !int(lastWeek.to, lastWeek.from, s.day) || !['earned','spent'].every(k => int(lastWeek[k], 0, 1e12)) || !['dates','stories','affection','trust','gifts','talks','works'].every(k => int(lastWeek[k], 0, 9999)) || !int(lastWeek.mood, 0, 100))) return null;
    const ngp = s.ngp === undefined ? null : s.ngp;
    if (ngp !== null && (!ngp || typeof ngp.applied !== 'boolean' || !Array.isArray(ngp.endings) || !ngp.endings.length || legacyList(ngp.endings).length !== ngp.endings.length || new Set(ngp.endings).size !== ngp.endings.length || !ngp.applied && !(intro && intro.step < N.intro.length))) return null;
    return copy({ version: VERSION, intro, day: s.day, ap: s.ap, energy: s.energy, money: s.money, affection: s.affection, trust: s.trust, owned: s.owned, outfit: s.outfit, ownedAccessories, legwear, ownedNeckAccessories, neckAccessory, location, memories, datesToday: s.datesToday, journal: s.journal, totalEarned: s.totalEarned, totalSpent: s.totalSpent, expenseGoal: goal === null ? null : { type: goal.type, id: goal.id }, savedAt: s.savedAt, story, growth, week: { day: week.day, affection: week.affection, trust: week.trust, earned: week.earned, spent: week.spent, dates: week.dates, stories: week.stories }, lastWeek, ngp: ngp && { endings: [...ngp.endings], applied: ngp.applied } });
  }
  const storage = {
    read(key, fallback = null) { try { const v = localStorage.getItem(`aqualuna.v2.${key}`); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
    write(key, value) { try { localStorage.setItem(`aqualuna.v2.${key}`, JSON.stringify(value)); return true; } catch { return false; } },
    load(slot) { return validate(this.read(`save.${slot}`)); },
    save(slot, state) { const s = validate({ ...state, savedAt: new Date().toISOString() }); return !!s && this.write(`save.${slot}`, s); }
  };
  // Optional reply to the morning message: a small trust gain at most, logged in the journal.
  function replyMessage(state, replyId) {
    const m = state.story.message, msg = m && N.messages[m.key], r = msg?.replies.find(x => x.id === replyId);
    if (!m || m.day !== state.day || m.reply || !r) return { state, error: '답장할 메시지가 없어요.' };
    const s = copy(state); s.story.message.reply = replyId;
    const before = s.trust; grow(s, 'trust', r.trust || 0);
    const text = `나: ${N.messageText(state, r.say)} · 수련: ${N.messageText(state, r.back)}`;
    s.journal.push({ day: s.day, type: 'message', title: '수련과 주고받은 메시지', text, money: 0, outfit: s.outfit });
    s.journal = s.journal.slice(-200);
    return { state: s, result: { title: '메시지 답장', text, trust: s.trust - before } };
  }
  // Small gifts: once a day and cheap. Her taste is hidden until the first time, then kept for the relationship note.
  const tasteEffect = { loved: { affection: 2, mood: 10 }, liked: { affection: 1, mood: 5 }, neutral: { affection: 0, mood: 2 }, disliked: { affection: 0, mood: -5 } };
  function giftReason(state, id) {
    const g = D.gifts.find(x => x.id === id);
    if (!g) return '알 수 없는 선물이에요.';
    if (state.story.active || state.story.activities?.active) return '대화를 마친 뒤 건네 주세요.';
    if (state.story.giftDay === state.day) return '오늘은 이미 선물을 건넸어요.';
    if (state.money < g.cost) return `${(g.cost - state.money).toLocaleString('ko-KR')}원이 부족해요.`;
    return '';
  }
  function giveGift(state, id) {
    const error = giftReason(state, id); if (error) return { state, error };
    const g = D.gifts.find(x => x.id === id), cal = D.calendar(state.day), birthday = cal.birthday, fx = birthday ? { affection: { loved: 5, liked: 3, neutral: 2, disliked: 1 }[g.taste], mood: 15 } : tasteEffect[g.taste], s = copy(state);
    const reunion = s.story.lastMet !== undefined && s.day - s.story.lastMet >= 3, before = { affection: s.affection, mood: s.growth.mood };
    s.money -= g.cost; s.totalSpent += g.cost;
    grow(s, 'affection', fx.affection); s.growth.mood = bounded(s.growth.mood + fx.mood + (reunion ? 8 : 0));
    s.story.giftDay = s.day; s.story.lastMet = s.day; s.story.tastes = { ...(s.story.tastes || {}), [id]: g.taste };
    if (birthday) s.story.birthdays = [...new Set([...(s.story.birthdays || []), cal.year])];
    const lines = birthday ? N.birthdayLines : N.giftLines, title = birthday ? `생일 선물 · ${g.name}` : `선물 · ${g.name}`, text = `${N.messageText(s, lines[g.taste][0])}`;
    s.journal.push({ day: s.day, type: 'gift', title, text, money: -g.cost, outfit: s.outfit });
    s.journal = s.journal.slice(-200);
    return { state: s, result: { title, text, birthday, taste: g.taste, face: lines[g.taste][1], affection: s.affection - before.affection, mood: s.growth.mood - before.mood, reunion } };
  }
  // Short talk: two topics she wants to talk about today, one she'd rather not; mood sets the starting atmosphere.
  const talkTopics = ['music', 'class', 'worry', 'food', 'future', 'small'];
  function talkPlan(state) {
    const d = state.day, T = talkTopics, h1 = T[(d * 7 + state.affection) % 6];
    let h2 = D.calendar(d).event?.id === 'festival' && h1 !== 'small' ? 'small' : T[(d * 3 + 5) % 6]; if (h2 === h1) h2 = T[(T.indexOf(h1) + 2) % 6];
    let cold = state.growth.mood < 35 && ![h1, h2].includes('future') ? 'future' : T[(d * 5 + 2) % 6];
    while ([h1, h2].includes(cold)) cold = T[(T.indexOf(cold) + 1) % 6];
    return { hot: [h1, h2], cold, tension: state.growth.mood >= 65 ? 2 : state.growth.mood >= 35 ? 1 : 0 };
  }
  function talkScore(plan, picks) {
    let t = plan.tension, score = 0; const steps = [];
    picks.forEach(p => {
      const kind = plan.hot.includes(p) ? 'hit' : p === plan.cold ? 'miss' : 'neutral', gain = kind === 'hit' ? 30 + t * 5 : kind === 'neutral' ? 12 + t * 3 : 0;
      if (kind === 'hit') t = Math.min(2, t + 1); if (kind === 'miss') t = Math.max(0, t - 1);
      score = Math.min(100, score + gain); steps.push({ topic: p, kind, gain, tension: t, score });
    });
    return { score, steps, tension: t };
  }
  function talkReason(state) {
    if (state.story.active || state.story.activities?.active) return '진행 중인 대화를 먼저 마쳐 주세요.';
    if (state.story.talkDay === state.day) return '오늘은 이미 이야기를 나눴어요. 내일 또 이야기해요.';
    return '';
  }
  function finishTalk(state, picks, closer = false) {
    const error = talkReason(state); if (error) return { state, error };
    if (!Array.isArray(picks) || picks.length !== 3 || new Set(picks).size !== 3 || !picks.every(p => talkTopics.includes(p))) return { state, error: '화제 세 개를 골라 주세요.' };
    const r = talkScore(talkPlan(state), picks);
    if (closer && r.score < 60) return { state, error: '조금 더 이야기가 무르익어야 해요.' };
    const s = copy(state), hits = r.steps.filter(x => x.kind === 'hit').length, misses = r.steps.filter(x => x.kind === 'miss').length;
    const reunion = s.story.lastMet !== undefined && s.day - s.story.lastMet >= 3, before = { a: s.affection, t: s.trust, m: s.growth.mood };
    s.growth.mood = bounded(s.growth.mood + hits * 3 - misses * 3 + (reunion ? 8 : 0));
    if (r.score >= 60) grow(s, 'affection', 1);
    if (closer) grow(s, 'trust', 1);
    s.story.talkDay = s.day; s.story.lastMet = s.day;
    s.story.talks = [...(s.story.talks || []), { day: s.day, picks: [...picks], score: r.score }].slice(-10);
    const title = '잠깐 나눈 이야기', text = `${picks.map(p => N.talk[p].name).join(' · ')} · 대화 점수 ${r.score}${closer ? ' · 한 걸음 가까워졌어요' : ''}`;
    s.journal.push({ day: s.day, type: 'talk', title, text, money: 0, outfit: s.outfit });
    s.journal = s.journal.slice(-200);
    return { state: s, result: { title, text, score: r.score, affection: s.affection - before.a, trust: s.trust - before.t, mood: s.growth.mood - before.m, reunion } };
  }
  function markMessagesSeen(state) { const s = copy(state); s.story.seen = (s.story.msgLog || []).length; return { state: s }; }
  window.LunaEngine = { runAllSchedule, weekSummary, legacyBonus, ending, legacyList, bondCurve, trainGain, markMessagesSeen, talkTopics, talkPlan, talkScore, talkReason, finishTalk, giftReason, giveGift, replyMessage, makeState, introPending, moveIntro, act, reason, validate, storage, training, statNames, choiceReason, scheduleItem, setSchedule, runSchedule, planExpense, expenseProgress, dateWithOutfit, startStory, chooseStory };
})();
