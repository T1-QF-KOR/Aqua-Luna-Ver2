/* One plausible itinerary per person and time slot. No reroll on preview, return, or reload. */
(function (root) {
  'use strict';
  const W = root.AquaWorld;
  const places = ['class', 'library', 'dining', 'cafe', 'club', 'studio', 'radio', 'roof', 'river', 'concert'];
  const ids = Object.keys(W.people);
  function hash(value) {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 16; h = Math.imul(h, 0x7feb352d); h ^= h >>> 15;
    return h >>> 0;
  }
  function makeSeed() { return Math.floor(Math.random() * 4294967296); }
  function legacySeed(state) { return hash(`campus:${state.name}:${state.nickname}`); }
  function roll(state, key) { return hash(`${state.encounters?.seed ?? legacySeed(state)}:${state.date}:${key}`) / 4294967296; }
  function weather(state) {
    const summer = state.date >= '2026-06-20' && state.date <= '2026-08-31';
    const r = roll(state, 'weather');
    return r < (summer ? .36 : .23) ? 'rain' : r < .58 ? 'cloudy' : 'clear';
  }
  function exams(date) {
    return [['2026-04-20', '2026-04-24'], ['2026-06-15', '2026-06-19'], ['2026-10-19', '2026-10-23'], ['2026-12-14', '2026-12-18']].some(([a, b]) => date >= a && date <= b);
  }
  function concealed(state, id) { return id === 'nari' && W.inTerm(state.date) && W.weekday(state.date) === 4 && state.slot === 2; }
  function routine(state, id) {
    if (state.slot === 3 || concealed(state, id)) return null;
    const schedule = { ...state, met: ids }, day = W.weekday(state.date), wet = weather(state) === 'rain';
    const planned = places.find(place => W.scheduledAt(schedule, place).includes(id));
    const exam = exams(state.date), vacation = !W.inTerm(state.date);
    const attendance = planned ? id === 'seojin' && planned === 'cafe' ? .86 : exam ? .48 : vacation ? .57 : .73 : vacation ? .15 : .24;
    if (roll(state, `${state.slot}:${id}:attendance`) >= attendance) return null;
    if (planned && !(wet && ['roof', 'river'].includes(planned))) {
      // A shift is more predictable than a student's free afternoon; neither is guaranteed.
      if (id === 'seojin' || roll(state, `${state.slot}:${id}:follow-plan`) < (exam ? .48 : .8)) return planned;
    }
    if (id === 'seojin') return wet ? (day === 0 || [3, 5, 6].includes(day) ? 'cafe' : null) : state.slot === 2 ? 'river' : null;
    if (W.holidays[state.date]) return wet ? null : (roll(state, `${state.slot}:${id}:holiday`) < .5 ? 'river' : 'concert');
    if (exam) return 'library';
    const pool = vacation ? (wet ? ['club', 'studio'] : ['club', 'river', 'concert']) :
      state.slot === 0 ? ['class', 'library'] : state.slot === 1 ? (wet ? ['library', 'dining', 'studio'] : ['library', 'dining', 'roof', 'studio']) :
        wet ? ['club', 'cafe', 'studio'] : ['club', 'river', 'studio', 'cafe'];
    return pool[Math.floor(roll(state, `${state.slot}:${id}:detour`) * pool.length)];
  }
  function compute(state) {
    const locations = Object.fromEntries(ids.map(id => [id, routine(state, id)])), scenes = {};
    if (state.slot === 3 || !root.AquaStory) return { locations, scenes };
    if (!state.met.includes('nari') && state.date >= '2026-03-03' && state.date <= '2026-03-07' && !W.holidays[state.date] && !concealed(state, 'nari')) {
      const firstWeek = state.slot === 1 && [2, 4].includes(W.weekday(state.date)) ? ['class', 'roof'] : state.slot === 2 ? ['roof', 'river'] : ['roof'];
      if (roll(state, `${state.slot}:first-week:nari`) < .6) locations.nari = firstWeek[Math.floor(roll(state, `${state.slot}:first-week:place`) * firstWeek.length)];
    }
    const candidates = places.flatMap(place => root.AquaStory.eligible(state, place));
    const reserved = new Set();
    for (const rule of candidates.sort((a, b) => (b.priority || 0) - (a.priority || 0))) {
      const actors = W.routeOwners[rule.id] || [];
      if (actors.some(id => concealed(state, id) || reserved.has(id))) continue;
      if (W.holidays[state.date] && ['class', 'club', 'studio', 'radio', 'roof', 'dining', 'library'].includes(rule.place)) continue;
      if (rule.id === 'crossRain' && weather(state) !== 'rain') continue;
      // Rain is part of the scene itself, never a sunny-day umbrella coincidence.
      if (rule.id === 'seojinRain' && weather(state) !== 'rain') continue;
      const birthday = /Birthday$/.test(rule.id);
      let chance = birthday ? .9 : actors.length > 1 ? .53 : exams(state.date) ? .36 : .62;
      if (!birthday && weather(state) === 'rain' && ['roof', 'river'].includes(rule.place)) chance *= .3;
      if (roll(state, `${state.slot}:story:${rule.id}`) >= chance) continue;
      if (scenes[rule.place]) continue;
      scenes[rule.place] = rule.id;
      for (const id of actors) { locations[id] = rule.place; reserved.add(id); }
    }
    return { locations, scenes };
  }
  function resolve(state) {
    return state.encounters?.plan?.key === `${state.date}:${state.slot}` ? state.encounters.plan : compute(state);
  }
  function ensurePlan(state) {
    if (state.encounters.plan?.key !== `${state.date}:${state.slot}`) state.encounters.plan = { key: `${state.date}:${state.slot}`, ...compute(state) };
    return state.encounters.plan;
  }
  function isAt(state, id, place) { return resolve(state).locations[id] === place; }
  function present(state, place) {
    const plan = resolve(state);
    return state.met.filter(id => plan.locations[id] === place);
  }
  function sceneAvailable(state, rule) { return resolve(state).scenes[rule.place] === rule.id; }
  root.AquaEncounters = { makeSeed, legacySeed, weather, exams, resolve, ensurePlan, isAt, present, sceneAvailable };
})(typeof window !== 'undefined' ? window : globalThis);
