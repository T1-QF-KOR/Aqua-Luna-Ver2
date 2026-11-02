/* Explicit romantic decisions. Affection alone never creates a relationship. */
(function (root) {
  'use strict';
  const W = root.AquaWorld, ids = Object.keys(W.people);
  const states = ['unresolved', 'friend', 'pending', 'lover', 'proposed'];
  function initial() { return { status: Object.fromEntries(ids.map(id => [id, 'unresolved'])), since: {}, delayedUntil: {}, mode: 'single', talk: null, trial: null, clashDue: null, clashes: [], wounds: [], history: [] }; }
  function ensure(s) { return s.romance ||= initial(); }
  function lovers(s) { return ids.filter(id => ensure(s).status[id] === 'lover'); }
  function isLover(s, id) { return ensure(s).status[id] === 'lover'; }
  function stage(s, id) {
    const r = ensure(s), status = r.status[id];
    return status === 'lover' ? r.mode === 'open' ? '함께 합의한 연인' : '연인' :
      status === 'friend' ? '친구로 대답한 사이' : status === 'pending' ? '대답을 기다리는 사이' : status === 'proposed' ? '함께 이야기하기로 한 사이' : null;
  }
  function record(s, person, answer) {
    const r = ensure(s), key = `${s.date}:${person}:${answer}`;
    if (!r.history.some(entry => entry.key === key)) r.history.push({ key, date: s.date, person, answer });
    r.history = r.history.slice(-100);
  }
  function touch(s, id) { if (s.met.includes(id)) root.AquaSocial.ensure(s).lastMet[id] = s.date; }
  function set(s, id, status) { const r = ensure(s); if (r.status[id] !== status) r.since[id] = s.date; r.status[id] = status; touch(s, id); }
  function canConfess(s, id) {
    const r = ensure(s);
    return s.met.includes(id) && r.status[id] === 'unresolved' && !r.talk && !r.trial && r.mode !== 'hidden' && s.bond[id] >= (lovers(s).length ? 70 : 55);
  }
  function answer(s, id, choice, expected = 'unresolved') {
    const r = ensure(s);
    if (!ids.includes(id) || !s.met.includes(id) || r.status[id] !== expected) return false;
    if (choice === 'friend') set(s, id, 'friend');
    else if (choice === 'pending') { set(s, id, 'pending'); r.delayedUntil[id] = W.addDays(s.date, 14); }
    else if (choice === 'accept' && !lovers(s).length && !r.talk) set(s, id, 'lover');
    else if (['disclose', 'hide'].includes(choice) && lovers(s).length && !r.talk && !r.trial && r.mode !== 'hidden') {
      const existing = lovers(s);
      set(s, id, choice === 'disclose' ? 'proposed' : 'lover');
      if (choice === 'hide') r.mode = 'hidden';
      else r.talk = { date: id === 'nari' && s.date >= '2026-12-24' && s.date <= '2027-01-01' ? '2027-01-02' : W.addDays(s.date, 1), slot: id === 'nari' && s.date >= '2026-12-24' && s.date <= '2027-01-01' ? 1 : 2,
        people: [...existing, id], newPerson: id, fromHidden: false };
    } else return false;
    if (choice !== 'pending') delete r.delayedUntil[id];
    record(s, id, choice); return true;
  }
  function resolvePending(s, id, choice) { return ['accept','friend','disclose'].includes(choice) && answer(s, id, choice, 'pending'); }
  function endRelationship(s, id) {
    const r = ensure(s);
    if (!isLover(s, id) || lovers(s).length !== 1 || r.talk || r.trial) return false;
    set(s, id, 'friend'); root.AquaRelationships.change(s, id, -15);
    if (!r.wounds.includes(id)) r.wounds.push(id);
    record(s, id, 'ended'); r.mode = 'single'; return true;
  }
  function disclose(s) {
    const r = ensure(s), people = lovers(s);
    if (r.mode !== 'hidden' || r.talk || r.trial || people.length < 2) return false;
    r.talk = { date: W.addDays(s.date, 1), slot: 2, people, newPerson: people.slice().sort((a,b) => r.since[b].localeCompare(r.since[a]))[0], fromHidden: true };
    return true;
  }
  function repeatingFactor(s, id) {
    const r = ensure(s);
    return (r.status[id] === 'pending' && s.date > r.since[id] && s.date <= r.delayedUntil[id]) ||
      (r.trial && id !== r.trial.newPerson && r.trial.people.includes(id) && s.date <= r.trial.until) ? .5 : 1;
  }
  function consentLevel(s, talk = ensure(s).talk) {
    if (!talk || talk.people.length < 2) return 'no';
    const r = ensure(s), existing = talk.people.filter(id => id !== talk.newPerson), extra = talk.fromHidden ? 10 : 0;
    if (r.clashes.length > (talk.fromHidden ? 1 : 0) || s.flags.equivocated || existing.some(id => (s.social.jealousy[id]?.upset && !talk.fromHidden) || s.bond[id] < 55 + extra)) return 'no';
    return existing.every(id => s.bond[id] >= 70 + extra) ? 'yes' : 'trial';
  }
  function commitOpen(s, people) {
    const r = ensure(s);
    for (const id of people) { set(s, id, 'lover'); record(s, id, 'agreed'); }
    r.mode = 'open'; r.talk = null; r.trial = null; r.clashDue = null;
  }
  function agree(s) {
    const r = ensure(s);
    if (consentLevel(s) !== 'yes') return false;
    commitOpen(s, r.talk.people); return true;
  }
  function beginTrial(s) {
    const r = ensure(s);
    if (consentLevel(s) !== 'trial') return false;
    const talk = r.talk;
    r.trial = { ...talk, start: s.date, until: W.addDays(s.date, 14), counts: Object.fromEntries(talk.people.map(id => [id, 0])) };
    r.talk = null; return true;
  }
  function noteDate(s, id) {
    touch(s, id); const t = ensure(s).trial;
    if (t && t.people.includes(id) && s.date >= t.start && s.date <= t.until) t.counts[id] = Math.min(2, t.counts[id] + 1);
  }
  function trialReady(s) { const t = ensure(s).trial; return !!t && t.people.filter(id => id !== t.newPerson).every(id => t.counts[id] >= 2); }
  function finishTrial(s) {
    if (!trialReady(s)) return false;
    commitOpen(s, ensure(s).trial.people); return true;
  }
  function chooseOnly(s, chosen, loss = 15, chosenLoss = 0) {
    const r = ensure(s), people = r.talk?.people || r.trial?.people || ids.filter(id => ['lover', 'proposed'].includes(r.status[id]));
    if (!people.includes(chosen)) return false;
    for (const id of people) {
      set(s, id, id === chosen ? 'lover' : 'friend');
      if (id !== chosen) { root.AquaRelationships.change(s, id, -loss); if (!r.wounds.includes(id)) r.wounds.push(id); }
      record(s, id, id === chosen ? 'chosen' : 'parted');
    }
    if (chosenLoss) root.AquaRelationships.change(s, chosen, -chosenLoss);
    r.mode = 'single'; r.talk = r.trial = r.clashDue = null; return true;
  }
  function witness(s, chosen, observers) {
    const r = ensure(s);
    if (r.mode !== 'hidden' || !isLover(s, chosen) || !observers.some(id => id !== chosen && isLover(s, id)) || r.clashes.includes(s.date)) return;
    r.clashDue ||= { date: s.date, people: lovers(s) };
  }
  function settleClash(s, choice) {
    const r = ensure(s), due = r.clashDue;
    if (!due) return false;
    if (!r.clashes.includes(s.date)) r.clashes.push(s.date);
    if (ids.includes(choice)) return chooseOnly(s, choice, 20, 10);
    for (const id of due.people) root.AquaRelationships.change(s, id, choice === 'honest' ? -15 : -10);
    if (choice === 'honest') {
      if (due.people.every(id => s.bond[id] >= 60)) r.talk = { date: W.addDays(s.date, 1), slot: 2, people: due.people, newPerson: due.people.at(-1), fromHidden: true };
      else { for (const id of due.people) { set(s, id, 'friend'); if (!r.wounds.includes(id)) r.wounds.push(id); } r.mode = 'single'; }
    } else s.flags.equivocated = true;
    r.clashDue = null; return true;
  }
  function mandatory(s, slot) {
    const r = ensure(s);
    if (r.clashDue && slot === 3) return 'romanceClash';
    if (r.talk && s.date >= r.talk.date && slot === r.talk.slot) return 'romanceTalk';
    if (r.trial && slot === 2 && (trialReady(s) || s.date > r.trial.until)) return 'romanceReview';
    return null;
  }
  const n = (text, cast = []) => ({ text, cast });
  const say = (id, text, cast) => ({ speaker: W.people[id].short, text, cast: cast || [id] });
  const option = (label, romance, lines) => ({ label, effect: { romance }, lines });
  function keepChoices(s, people) {
    return people.map(id => option(`${W.people[id].short}와의 관계를 이어 간다고 분명히 말한다`, { action: 'choose', person: id }, [
      say(id, { nari: '…내가 듣고 싶던 말이야. 다른 사람에게도 똑같이 분명하게 말해 줘.', daeun: '응. 나도 내가 고른 거야. 다른 사람 얘기도 끝까지 듣고 가자.', seojin: '알았어. 대신 여기서 한 말, 밖에서도 바꾸지 마.' }[id], people),
      n('나는 고르지 않은 사람에게도 직접 대답했다. 다른 사람의 사정이나 숫자로 설명하지 않았다.', people)]));
  }
  function buildTalk(s) {
    const t = ensure(s).talk, people = t.people, level = consentLevel(s);
    const lines = [n('약속한 시간에 카페 창가 자리에 모였다. 내가 먼저 말을 꺼냈다. 한 사람에게 말하지 않은 마음이 있다고.', people),
      n(t.fromHidden ? '이미 사귀고 있었다는 것까지 말했다. 처음부터 이야기하지 않은 건 내 선택이었다.' : '아직 함께 정한 것은 없었다. 내가 원하는 것과 각자가 원하는 것을 여기서 듣기로 했다.', people)];
    for (const id of people) lines.push(say(id, {
      nari: '남한테 말 못 하는 걸 또 만드는 건 싫어. 내 얘기는 내가 해도 돼야 해.',
      daeun: '다 좋아한다는 말만 하면 쉬워. 그다음에 누구한테 먼저 연락할지는 어떻게 할 건데?',
      seojin: '거짓말은 안 돼. 시간을 나누는 건 얘기해 볼 수 있어도, 숨기는 건 다른 문제야.'
    }[id], people));
    if (level === 'yes') lines.push(n('각자가 필요한 규칙을 이야기했다. 연락 순서를 나눌 것, 약속을 바꾸기 전에 알릴 것, 목요일 밤을 남겨 둘 것. 모두 자기 말로 동의했다.', people));
    else if (level === 'trial') lines.push(n('아직 바로 동의할 수 없다는 답이 나왔다. 두 주 동안 기존 연인과 두 번씩 따로 시간을 보내고 다시 묻기로 했다. 새 관계도 그 대답 전까지 확정하지 않기로 했다.', people));
    else lines.push(n('지금은 동의할 수 없다는 답을 들었다. 나는 고개를 끄덕였다. 같이 있는 자리에 나왔다고 해서 교제에 동의한 것은 아니었다.', people));
    const choices = [];
    if (level === 'yes') choices.push(option('모두가 말한 규칙에 동의하고 함께 만나기로 한다', { action: 'agree' }, [n('우리는 다음 약속부터 따로 정했다. 한 번의 대답으로 매일의 대화가 필요 없어지지는 않았다.', people)]));
    if (level === 'trial') choices.push(option('두 주 뒤 다시 대답을 듣기로 한다', { action: 'trial' }, [n('나는 기한과 약속을 휴대폰에 적었다. 기다리게 하는 동안에도 누구와 어떤 사이인지 분명하게 말하기로 했다.', people)]));
    choices.push(...keepChoices(s, people)); lines.push({ choice: choices });
    return { title: '셋이서 하는 얘기', background: 'cafe', lines };
  }
  function buildReview(s) {
    const t = ensure(s).trial, ready = trialReady(s), people = t.people;
    return { title: '미뤄 둔 합의', background: 'cafe', lines: [
      n('다시 같은 자리에 모였다. 이번에는 지난 두 주 동안 실제로 어떻게 지냈는지부터 이야기했다.', people),
      n(ready ? '약속한 개인 시간을 지켰다. 누구와 보내는 시간인지 숨기지 않고, 다음 약속도 각자에게 물었다.' : '약속한 시간을 다 지키지 못했다. 사정이 있었다는 말 뒤에, 기다린 시간이 없어지는 것은 아니었다.', people),
      { choice: [...(ready ? [option('각자의 동의를 다시 확인하고 함께 만나기로 한다', { action: 'review' }, [n('우리는 다시 자기 말로 동의했다. 시험 기간에 지킨 약속을 앞으로도 지키기로 했다.', people)])] : []), ...keepChoices(s, people)] }
    ] };
  }
  function buildClash(s) {
    const people = ensure(s).clashDue.people;
    return { title: '숨긴 말이 마주친 밤', background: 'cafe', time: 3, lines: [
      n('함께 있던 모습을 본 뒤 연락이 왔다. 나는 두 사람과 같은 자리에 앉았다. 둘은 서로가 아니라 나를 보고 있었다.', people),
      n('사귀고 있다는 말을 한 사람에게는 하지 않았다. 우연히 마주친 것이 문제를 만든 건 아니었다.', people),
      { choice: [
        ...people.map(id => option(`${W.people[id].short}를 선택하고 두 사람에게 사실대로 말한다`, { action: 'clash', answer: id }, [n('한 사람에게 끝내는 대답을 했다. 남은 사람의 손도 바로 잡을 수는 없었다.', people)])),
        option('“둘 다 좋아해. 숨긴 건 잘못했어.”', { action: 'clash', answer: 'honest' }, [n('설명은 끝까지 했지만 용서를 요구하지 않았다. 지금은 각자가 대답을 정할 시간이었다.', people)]),
        option('“조금 복잡한 일이야. 나중에 얘기하면 안 될까.”', { action: 'clash', answer: 'evade' }, [n('아무도 대답하지 않았다. 미룬 말이 이번에는 침묵으로 돌아왔다.', people)])
      ] }
    ] };
  }
  function apply(s, effect) {
    if (effect.action === 'answer') return answer(s, effect.person, effect.answer);
    if (effect.action === 'agree') return agree(s);
    if (effect.action === 'trial') return beginTrial(s);
    if (effect.action === 'review') return finishTrial(s);
    if (effect.action === 'choose') return chooseOnly(s, effect.person);
    if (effect.action === 'clash') return settleClash(s, effect.answer);
    return false;
  }
  function valid(s, r) {
    const object = x => x && typeof x === 'object' && !Array.isArray(x);
    const date = d => W.validDate(d) && d >= '2026-03-02' && d <= '2027-02-26';
    const people = list => Array.isArray(list) && list.length >= 2 && list.length <= 3 && new Set(list).size === list.length && list.every(id => s.met.includes(id));
    const scheduled = t => object(t) && date(t.date) && [1,2].includes(t.slot) && people(t.people) && t.people.includes(t.newPerson) && typeof t.fromHidden === 'boolean';
    if (!object(r) || !object(r.status) || ids.some(id => !states.includes(r.status[id]) || (r.status[id] !== 'unresolved' && !s.met.includes(id))) ||
      !object(r.since) || !object(r.delayedUntil) || ['since','delayedUntil'].some(key => Object.entries(r[key]).some(([id,d]) => !ids.includes(id) || !date(d))) ||
      ids.some(id => r.status[id] !== 'unresolved' && (!date(r.since[id]) || r.since[id] > s.date)) ||
      ids.some(id => r.status[id] === 'pending' && !date(r.delayedUntil[id])) || !['single','open','hidden'].includes(r.mode) ||
      !Array.isArray(r.clashes) || r.clashes.some(d => !date(d) || d > s.date) || new Set(r.clashes).size !== r.clashes.length ||
      !Array.isArray(r.wounds) || r.wounds.some(id => !s.met.includes(id)) || !Array.isArray(r.history) || r.history.length > 100 ||
      r.history.some(h => !object(h) || !date(h.date) || h.date > s.date || !s.met.includes(h.person) || typeof h.answer !== 'string' || h.key !== `${h.date}:${h.person}:${h.answer}`) ||
      (r.talk !== null && !scheduled(r.talk)) ||
      (r.trial !== null && (!scheduled(r.trial) || !date(r.trial.start) || !date(r.trial.until) || r.trial.start > s.date || r.trial.until < r.trial.start || !object(r.trial.counts) || r.trial.people.some(id => !Number.isInteger(r.trial.counts[id]) || r.trial.counts[id] < 0 || r.trial.counts[id] > 2))) ||
      (r.clashDue !== null && (!object(r.clashDue) || !date(r.clashDue.date) || r.clashDue.date > s.date || !people(r.clashDue.people)))) return false;
    const current = ids.filter(id => r.status[id] === 'lover'), proposed = ids.filter(id => r.status[id] === 'proposed');
    if ((r.mode !== 'single' && current.length < 2) || (r.mode === 'single' && current.length > 1 && !r.talk && !r.trial) ||
      (proposed.length && (!r.talk && !r.trial)) || (r.talk && r.trial) ||
      (r.talk && r.talk.people.some(id => !['lover','proposed'].includes(r.status[id]))) || (r.trial && r.trial.people.some(id => !['lover','proposed'].includes(r.status[id])))) return false;
    return true;
  }
  function greeting(s, id) {
    const status = ensure(s).status[id];
    return status === 'lover' ? { nari: '…보고 싶었어. 이건 외워 온 말 아니야.', daeun: '왔네! 오늘은 여자친구라고 불러도 되는 날이다ㅋㅋ', seojin: '왔네. 오늘은 내가 먼저 보고 싶었어. 너는?' }[id] :
      status === 'pending' ? { nari: '…왔네. 오늘은 그냥 이야기하자.', daeun: '나 대답 재촉하러 온 거 아냐. 그냥 네 얼굴 보러.', seojin: '왔네. 오늘 할 얘기는 오늘 얘기만 하자.' }[id] :
      status === 'friend' ? { nari: '안녕. 오늘은 어떤 음악 듣고 왔어?', daeun: '야 왔냐ㅋㅋ 친구라고 밥 약속까지 잊진 마라.', seojin: '왔어, 알바생. 오늘은 무슨 얘기 할래?' }[id] : null;
  }
  root.AquaRomance = { initial, ensure, lovers, isLover, stage, canConfess, answer, resolvePending, endRelationship, disclose, repeatingFactor, consentLevel, agree, beginTrial, noteDate, trialReady, finishTrial, chooseOnly, witness, settleClash, mandatory, buildTalk, buildReview, buildClash, apply, valid, greeting, touch };
})(typeof window !== 'undefined' ? window : globalThis);
