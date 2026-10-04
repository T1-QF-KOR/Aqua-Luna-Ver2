(() => {
  'use strict';
  const D = window.LunaData;
  const VERSION = 2;
  const copy = s => JSON.parse(JSON.stringify(s));
  const bounded = n => Math.max(0, Math.min(100, n));
  const makeState = () => ({ version: VERSION, day: 1, ap: D.maxAp, energy: 100, money: D.startingMoney, affection: 0, trust: 0, owned: ['casual'], outfit: 'casual', datesToday: [], journal: [], totalEarned: 0, totalSpent: 0, expenseGoal: null, savedAt: null });
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
    const item = type === 'work' ? D.jobs.find(x => x.id === id) : type === 'date' ? D.dates.find(x => x.id === id) : type === 'buy' || type === 'equip' ? D.outfits.find(x => x.id === id) : null;
    if (['work', 'date', 'buy', 'equip'].includes(type) && !item) return '알 수 없는 활동입니다.';
    if (type === 'buy' && state.owned.includes(id)) return '이미 보유한 의상입니다.';
    if (type === 'equip' && !state.owned.includes(id)) return '먼저 의상을 구매해 주세요.';
    if (type === 'equip' && state.outfit === id) return '지금 착용 중인 의상입니다.';
    if (type === 'date' && state.datesToday.length) return '데이트는 하루 한 번 할 수 있어요. 다음 날 다시 초대해 주세요.';
    if (type === 'date' && state.trust < item.requiredTrust) return `신뢰 ${item.requiredTrust}부터 함께 갈 수 있어요.`;
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
    } else if (type === 'date') {
      const d = D.dates.find(x => x.id === id);
      money = -d.cost; s.money += money; s.totalSpent += d.cost; s.ap -= d.ap; s.energy -= d.energy;
      s.affection = bounded(s.affection + d.affection); s.trust = bounded(s.trust + d.trust); s.datesToday.push(id);
      title = `${d.name} 완료`; text = `함께 시간을 보냈어요. 호감 +${s.affection - state.affection} · 신뢰 +${s.trust - state.trust}`;
    } else if (type === 'buy') {
      const o = D.outfits.find(x => x.id === id);
      money = -o.cost; s.money += money; s.totalSpent += o.cost; s.owned.push(id);
      title = '옷장에 새로운 의상'; text = `${o.name}를 구매했어요. 옷장에서 갈아입힐 수 있습니다.`;
    } else if (type === 'equip') {
      s.outfit = id; title = '의상 변경'; text = `${D.outfits.find(x => x.id === id).name}를 착용했어요.`;
    } else if (type === 'rest') {
      const recovery = Math.min(35, 100 - s.energy); s.energy += recovery; s.ap -= 1;
      title = '잠깐의 휴식'; text = `숨을 고르고 기력 ${recovery}을 회복했어요.`;
    } else {
      s.day += 1; s.ap = D.maxAp; s.energy = bounded(s.energy + 60); s.datesToday = [];
      title = `${s.day}일째의 시작`; text = '새로운 하루가 찾아왔어요. 시간 3칸과 기력을 회복했습니다.';
    }
    if (s.expenseGoal?.type === type && s.expenseGoal.id === id) s.expenseGoal = null;
    s.journal.push({ day: s.day, type, title, text, money, outfit: s.outfit });
    s.journal = s.journal.slice(-200);
    return { state: s, result: { title, text, money } };
  }
  function validate(s) {
    const int = (v, min, max) => Number.isSafeInteger(v) && v >= min && v <= max;
    if (!s || s.version !== VERSION || !int(s.day, 1, 9999) || !int(s.ap, 0, 3) || !int(s.energy, 0, 100) || !int(s.money, 0, 1e12) || !int(s.affection, 0, 100) || !int(s.trust, 0, 100)) return null;
    if (!int(s.totalEarned, 0, 1e12) || !int(s.totalSpent, 0, 1e12) || s.money !== D.startingMoney + s.totalEarned - s.totalSpent) return null;
    const outfitIds = D.outfits.map(x => x.id);
    if (!Array.isArray(s.owned) || !s.owned.includes('casual') || s.owned.length > outfitIds.length || new Set(s.owned).size !== s.owned.length || !s.owned.every(x => outfitIds.includes(x)) || !s.owned.includes(s.outfit)) return null;
    if (!Array.isArray(s.datesToday) || s.datesToday.length > 1 || !s.datesToday.every(id => D.dates.some(d => d.id === id))) return null;
    if (!Array.isArray(s.journal) || s.journal.length > 200 || !s.journal.every(j => j && int(j.day, 1, s.day) && ['work','date','buy','equip','rest','nextDay'].includes(j.type) && typeof j.title === 'string' && j.title.length < 120 && typeof j.text === 'string' && j.text.length < 500 && int(j.money, -1e9, 1e9) && outfitIds.includes(j.outfit))) return null;
    if (s.savedAt !== null && (typeof s.savedAt !== 'string' || !Number.isFinite(Date.parse(s.savedAt)))) return null;
    const goal = s.expenseGoal === undefined ? null : s.expenseGoal;
    if (goal !== null && (!expenseItem(goal) || goal.type === 'buy' && s.owned.includes(goal.id))) return null;
    return copy({ version: VERSION, day: s.day, ap: s.ap, energy: s.energy, money: s.money, affection: s.affection, trust: s.trust, owned: s.owned, outfit: s.outfit, datesToday: s.datesToday, journal: s.journal, totalEarned: s.totalEarned, totalSpent: s.totalSpent, expenseGoal: goal === null ? null : { type: goal.type, id: goal.id }, savedAt: s.savedAt });
  }
  const storage = {
    read(key, fallback = null) { try { const v = localStorage.getItem(`aqualuna.v2.${key}`); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
    write(key, value) { try { localStorage.setItem(`aqualuna.v2.${key}`, JSON.stringify(value)); return true; } catch { return false; } },
    load(slot) { return validate(this.read(`save.${slot}`)); },
    save(slot, state) { const s = validate({ ...state, savedAt: new Date().toISOString() }); return !!s && this.write(`save.${slot}`, s); }
  };
  window.LunaEngine = { makeState, act, reason, validate, storage, planExpense, expenseProgress };
})();
