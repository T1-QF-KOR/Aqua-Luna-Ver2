(() => {
  'use strict';
  const D = window.LunaData;
  const N = window.LunaStory;
  const VERSION = 2;
  const copy = s => JSON.parse(JSON.stringify(s));
  const bounded = n => Math.max(0, Math.min(100, n));
  const makeState = () => ({ version: VERSION, day: 1, ap: D.maxAp, energy: 100, money: D.startingMoney, affection: 0, trust: 0, owned: ['casual'], outfit: 'casual', ownedAccessories: ['none'], legwear: 'none', location: 'practice', memories: [], datesToday: [], journal: [], totalEarned: 0, totalSpent: 0, expenseGoal: null, savedAt: null, story: N.fresh() });
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
    if (state.story.activities?.active) return '진행 중인 체험을 먼저 마치거나 중단해 주세요. 관계와 이야기에서 이어갈 수 있어요.';
    if (state.story.active) return '진행 중인 이야기를 먼저 마쳐 주세요. 관계와 이야기에서 이어갈 수 있어요.';
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
    let title, text, money = 0;
    if (type === 'work') {
      const j = D.jobs.find(x => x.id === id);
      money = j.pay; s.money += money; s.totalEarned += money; s.ap -= j.ap; s.energy -= j.energy;
      title = `${j.name} 완료`; text = `${money.toLocaleString('ko-KR')}원을 벌었어요. 오늘의 노력이 작은 여유가 되었습니다.`;
      s.location = { cafe: 'cafe', edit: 'practice', event: 'concert' }[id];
    } else if (type === 'date') {
      const d = D.dates.find(x => x.id === id);
      money = -d.cost; s.money += money; s.totalSpent += d.cost; s.ap -= d.ap; s.energy -= d.energy;
      s.datesToday.push(id);
      title = `${d.name} 출발`; text = `비용과 시간을 사용했어요. ${N.script('date',id).length}번의 선택을 나누면 관계 변화와 추억이 남습니다.`;
      s.location = d.location;
      s.story.active = { kind: 'date', id, day: s.day, outfit: s.outfit, legwear: s.legwear, time: D.timeForAp(state.ap), choices: [] };
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
    } else if (type === 'equipAccessory') {
      s.legwear = id; title = '스타킹 변경'; text = `${D.accessories.find(x => x.id === id).name}으로 코디를 바꿨어요.`;
    } else if (type === 'rest') {
      const recovery = Math.min(35, 100 - s.energy); s.energy += recovery; s.ap -= 1;
      title = '잠깐의 휴식'; text = `숨을 고르고 기력 ${recovery}을 회복했어요.`;
      s.location = 'rooftop';
    } else {
      s.day += 1; s.ap = D.maxAp; s.energy = bounded(s.energy + 60); s.datesToday = [];
      title = `${s.day}일째의 시작`; text = '새로운 하루가 찾아왔어요. 시간 3칸과 기력을 회복했습니다.';
      s.location = 'practice';
    }
    if (s.expenseGoal?.type === type && s.expenseGoal.id === id) s.expenseGoal = null;
    s.journal.push({ day: s.day, type, title, text, money, outfit: s.outfit });
    s.journal = s.journal.slice(-200);
    return { state: s, result: { title, text, money } };
  }
  function dateWithOutfit(state, id, outfit, legwear) {
    if (!state.owned.includes(outfit) || !state.ownedAccessories.includes(legwear) || outfit !== 'skirt' && legwear !== 'none') return { state, error: '보유한 의상과 어울리는 소품을 골라 주세요.' };
    const error = reason(state, 'date', id);
    if (error) return { state, error };
    return act({ ...state, outfit, legwear }, 'date', id);
  }
  function startStory(state, id) {
    const event = N.available(state).find(e => e.id === id);
    if (!event) return { state, error: '아직 열리지 않았거나 이미 마친 이야기예요.' };
    const s = copy(state);
    s.story.active = { kind: 'event', id, day: s.day, outfit: s.outfit, legwear: s.legwear, time: D.timeForAp(s.ap), choices: [] };
    s.location = event.location;
    return { state: s };
  }
  // expectedStep makes rapid double clicks and stale UI callbacks harmless.
  function chooseStory(state, choiceId, expectedStep) {
    if (state.story.activities?.active) return {state,error:'체험을 마치거나 중단한 뒤 대화를 이어 주세요.'};
    const active = state.story.active, step = active?.choices.length;
    const choice = active && N.script(active.kind,active.id)?.[step]?.choices.find(c => c.id === choiceId);
    if (!choice || expectedStep !== step) return { state, error: '현재 장면의 선택지를 골라 주세요.' };
    const s = copy(state), a = s.story.active;
    a.choices.push(choiceId);
    if (a.choices.length < N.script(a.kind,a.id).length) return { state: s, result: { title: '수련의 대답', text: choice.reply } };
    const choices = a.choices.map((id,i) => N.script(a.kind,a.id)[i].choices.find(c=>c.id===id));
    let affection = 0, trust = 0, kept = false;
    if (a.kind === 'date') {
      const d = D.dates.find(d=>d.id===a.id);
      affection = d.affection + choices.reduce((sum,c)=>sum+(c.affection||0),0);
      trust = d.trust + choices.reduce((sum,c)=>sum+(c.trust||0),0);
      s.story.dateCount++;
      window.LunaCourses?.record(s,a);
      if (a.id === 'walk' && s.story.promise) { s.story.promise = false; s.story.keptPromises++; kept = true; }
      s.memories.push({ day: a.day, date: a.id, outfit: a.outfit, legwear: a.legwear, time: a.time, choices: a.choices, keptPromise: kept });
      s.memories = s.memories.slice(-60);
    } else s.story.completed.push({ id: a.id, choices: a.choices, day: a.day });
    choices.forEach(c => {
      ['preference','boundary','music','relationship'].forEach(key=> { if (c[key]) s.story[key] = c[key]; });
      if (c.promise) s.story.promise = true;
      if (c.relationship === 'considering') s.story.considerAt = s.story.dateCount;
      if (['lovers','friends'].includes(c.relationship)) s.story.commitAt = s.story.dateCount;
    });
    s.affection = bounded(s.affection + affection); s.trust = bounded(s.trust + trust);
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
    if (!Array.isArray(s.journal) || s.journal.length > 200 || !s.journal.every(j => j && int(j.day, 1, s.day) && ['work','date','story','buy','equip','buyAccessory','equipAccessory','rest','nextDay'].includes(j.type) && typeof j.title === 'string' && j.title.length < 120 && typeof j.text === 'string' && j.text.length < 500 && int(j.money, -1e9, 1e9) && outfitIds.includes(j.outfit))) return null;
    const ownedAccessories = s.ownedAccessories === undefined ? ['none'] : s.ownedAccessories;
    const legwear = s.legwear === undefined ? 'none' : s.legwear;
    const location = s.location === undefined ? 'practice' : s.location;
    const memories = s.memories === undefined ? [] : s.memories;
    if (!Array.isArray(ownedAccessories) || !ownedAccessories.includes('none') || new Set(ownedAccessories).size !== ownedAccessories.length || !ownedAccessories.every(a => D.accessories.some(x => x.id === a)) || !ownedAccessories.includes(legwear) || s.outfit !== 'skirt' && legwear !== 'none' || !Object.hasOwn(D.locations, location)) return null;
    if (!Array.isArray(memories) || memories.length > 60 || !memories.every(m => m && int(m.day, 1, s.day) && D.dates.some(d => d.id === m.date) && s.owned.includes(m.outfit) && ownedAccessories.includes(m.legwear) && (m.outfit === 'skirt' || m.legwear === 'none') && (m.time === undefined || D.times.some(t => t.id === m.time)))) return null;
    if (!memories.every(m => m.choices === undefined || Array.isArray(m.choices) && m.choices.length === N.script('date',m.date)?.length && m.choices.every((id,i) => N.script('date',m.date)[i].choices.some(c=>c.id===id)) && typeof m.keptPromise === 'boolean')) return null;
    const story = N.validate(s.story, { ...s, ownedAccessories });
    if (!story) return null;
    if (s.savedAt !== null && (typeof s.savedAt !== 'string' || !Number.isFinite(Date.parse(s.savedAt)))) return null;
    const goal = s.expenseGoal === undefined ? null : s.expenseGoal;
    if (goal !== null && (!expenseItem(goal) || goal.type === 'buy' && s.owned.includes(goal.id))) return null;
    return copy({ version: VERSION, day: s.day, ap: s.ap, energy: s.energy, money: s.money, affection: s.affection, trust: s.trust, owned: s.owned, outfit: s.outfit, ownedAccessories, legwear, location, memories, datesToday: s.datesToday, journal: s.journal, totalEarned: s.totalEarned, totalSpent: s.totalSpent, expenseGoal: goal === null ? null : { type: goal.type, id: goal.id }, savedAt: s.savedAt, story });
  }
  const storage = {
    read(key, fallback = null) { try { const v = localStorage.getItem(`aqualuna.v2.${key}`); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
    write(key, value) { try { localStorage.setItem(`aqualuna.v2.${key}`, JSON.stringify(value)); return true; } catch { return false; } },
    load(slot) { return validate(this.read(`save.${slot}`)); },
    save(slot, state) { const s = validate({ ...state, savedAt: new Date().toISOString() }); return !!s && this.write(`save.${slot}`, s); }
  };
  window.LunaEngine = { makeState, act, reason, validate, storage, planExpense, expenseProgress, dateWithOutfit, startStory, chooseStory };
})();
