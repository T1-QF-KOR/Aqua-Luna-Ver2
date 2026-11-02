(function (root) {
  'use strict';
  const W = root.AquaWorld;
  function initial(name = '나', nickname = '물고기') {
    return { version: 7, date: '2026-03-02', slot: 0, money: 150000, energy: 100,
      knowledge: 0, fitness: 0, sensitivity: 0, name, nickname, club: null,
      readLines: {}, smallEvents: root.AquaSmallEvents.ensure({}), music: root.AquaComposition.ensure({}), messages: root.AquaMessages.ensure({}), relationships: root.AquaRelationships.ensure({}), dialogueHistory: {}, greetingCache: {}, growth: {}, equipment: [], giftClothes: {}, workDays: [], met: [], bond: { nari: 0, daeun: 0, seojin: 0 }, flags: {}, cards: [],
      melodies: [], letters: [], history: [], seen: [], scene: null, completed: false,
      conversations: {}, radio: { listened: [], aired: {}, clues: {}, anonymous: 0,
        honestCount: 0, hiatusUntil: null }, letterDraft: null, social: root.AquaSocial.initial(),
      encounters: { seed: root.AquaEncounters.makeSeed() }, dialogue: root.AquaDialogue.initial(), romance: root.AquaRomance.initial(), holidays: root.AquaHolidays.initial() };
  }
  function validLines(lines, depth = 0) {
    return depth < 6 && Array.isArray(lines) && lines.length <= 1000 && lines.every(line =>
      line && typeof line === 'object' && (typeof line.text === 'string' ||
        (Array.isArray(line.choice) && line.choice.length > 0 && line.choice.length <= 6 &&
          line.choice.every(option => typeof option.label === 'string' && validLines(option.lines || [], depth + 1)))));
  }
  function restore(input) {
    if (!input || ![1, 2, 3, 4, 5, 6, 7].includes(input.version) || !W.validDate(input.date) ||
      input.date < '2026-03-02' || input.date > '2027-02-26' ||
      !Number.isInteger(input.slot) || input.slot < 0 || input.slot > 3 ||
      !Array.isArray(input.met) || input.met.some(id => !W.people[id]) ||
      !Array.isArray(input.seen) || !input.bond || !Array.isArray(input.history)) return null;
    for (const key of ['money', 'energy', 'knowledge', 'fitness', 'sensitivity']) {
      if (!Number.isFinite(input[key]) || input[key] < 0 || (key !== 'money' && input[key] > 100)) return null;
    }
    if (Object.keys(W.people).some(id => !Number.isFinite(input.bond[id]) || input.bond[id] < 0 || input.bond[id] > 100)) return null;
    if (input.scene && (!validLines(input.scene.queue) || !Number.isInteger(input.scene.index) ||
      input.scene.index < 0 || input.scene.index >= input.scene.queue.length)) return null;
    const state = { ...initial(), ...structuredClone(input), version: 7 };
    if (!root.AquaRomance.valid(state, state.romance)) return null;
    if (!root.AquaHolidays.valid(state, state.holidays)) return null;
    state.encounters = input.encounters || { seed: root.AquaEncounters.legacySeed(input) };
    if (!state.encounters || !Number.isInteger(state.encounters.seed) || state.encounters.seed < 0 || state.encounters.seed > 4294967295) return null;
    const plan = state.encounters.plan;
    if (plan && (!plan.locations || !plan.scenes || typeof plan.key !== 'string' || !/^\d{4}-\d{2}-\d{2}:[0-3]$/.test(plan.key) ||
      Object.keys(W.people).some(id => plan.locations[id] !== null && !['class', 'library', 'dining', 'cafe', 'club', 'studio', 'radio', 'roof', 'river', 'concert'].includes(plan.locations[id])) ||
      Object.values(plan.scenes).some(id => typeof id !== 'string'))) return null;
    state.name = typeof state.name === 'string' ? state.name.slice(0, 6) || '나' : '나';
    state.nickname = typeof state.nickname === 'string' ? state.nickname.slice(0, 10) || '물고기' : '물고기';
    for (const key of ['cards', 'melodies', 'letters']) if (!Array.isArray(state[key])) return null;
    state.flags = state.flags && typeof state.flags === 'object' ? state.flags : {};
    state.conversations ||= {};
    state.workDays ||= [];
    if (!Array.isArray(state.workDays) || state.workDays.some(d => !W.validDate(d))) return null;
    if (input.version < 3 && state.scene?.pendingReward?.money === 32000 && !state.workDays.includes(state.date)) state.workDays.push(state.date);
    if (input.version < 3 && state.seen.includes('crossRain')) state.flags.crossRainDate ||= state.date;
    const social = { ...root.AquaSocial.initial(), ...(state.social || {}) };
    const object = value => value && typeof value === 'object' && !Array.isArray(value);
    if (input.dialogue !== undefined && !object(input.dialogue)) return null;
    state.dialogue = { ...root.AquaDialogue.initial(), ...(state.dialogue || {}) };
    if (!object(state.dialogue.recent) || Object.values(state.dialogue.recent).some(date => !W.validDate(date) || date > state.date)) return null;
    const session = state.dialogue.greetingSession;
    if (session !== null && (!object(session) || !/^\d{4}-\d{2}-\d{2}:[0-3]$/.test(session.key) || !object(session.items) || Object.values(session.items).some(text => typeof text !== 'string' || text.length > 500))) return null;
    if (input.social !== undefined && !object(input.social)) return null;
    for (const key of ['inventory', 'lastGift', 'lastMet', 'knownBirthdays', 'jealousy', 'witnessGreeting']) if (!object(social[key])) return null;
    if (Object.entries(social.inventory).some(([id, count]) => !root.AquaSocial.gifts.some(g => g.id === id) || !Number.isInteger(count) || count < 0 || count > 99)) return null;
    for (const key of ['lastGift', 'lastMet']) if (Object.entries(social[key]).some(([id, date]) => !W.people[id] || !W.validDate(date) || date > state.date)) return null;
    for (const key of ['knownBirthdays', 'witnessGreeting']) if (Object.entries(social[key]).some(([id, value]) => !W.people[id] || typeof value !== 'boolean')) return null;
    if (Object.entries(social.jealousy).some(([id, record]) => !W.people[id] || !object(record) || typeof record.aware !== 'boolean' || typeof record.upset !== 'boolean' ||
      (record.date !== null && (!W.validDate(record.date) || record.date > state.date)))) return null;
    if (social.nariRadioPending !== null && (!object(social.nariRadioPending) || !W.validDate(social.nariRadioPending.date) || social.nariRadioPending.date > state.date || typeof social.nariRadioPending.witness !== 'boolean')) return null;
    const validOuting = entry => entry && W.people[entry.person] && W.validDate(entry.date) && entry.date <= state.date &&
      root.AquaSocial.destinations.some(d => d.id === entry.destination) && Number.isInteger(entry.variant) && entry.variant >= 0 && entry.variant < 4 &&
      Number.isFinite(entry.bonus) && entry.bonus >= 0 && entry.bonus <= 4 &&
      (entry.memory === undefined || (typeof entry.memory === 'string' && entry.memory.length <= 2000)) &&
      (!entry.routeId || (entry.routeId === 'nariRoom' && entry.person === 'nari' && entry.destination === 'karaoke'));
    if (!Array.isArray(social.album) || social.album.some(a => !validOuting(a) || a.key !== `${a.date}:${a.person}:${a.destination}`) ||
      new Set(social.album.map(a => a.key)).size !== social.album.length ||
      !Array.isArray(social.gifts) || social.gifts.some(g => !g || !W.people[g.person] || !W.validDate(g.date) || g.date > state.date || typeof g.birthday !== 'boolean' || !root.AquaSocial.gifts.some(item => item.id === g.item)) ||
      !Array.isArray(social.karaokeInvites) || social.karaokeInvites.some(date => !W.validDate(date) || date > state.date)) return null;
    if (state.scene?.outing && (!validOuting(state.scene.outing) || !['date','activity'].includes(state.scene.after) || state.slot !== 1 || state.scene.outing.date !== state.date)) return null;
    state.social = social;
    state.radio = { ...initial().radio, ...(state.radio || {}) };
    if (!Array.isArray(state.radio.listened) || !state.radio.aired || !state.radio.clues) return null;
    // Nari's garments were redesigned or recolored at the user's request. Keep a saved
    // date's frozen narration consistent with the replacement illustration.
    if (state.scene) {
      const renamed = { '큰 후드 · 와이드 팬츠': 'clothes-nari-casual', '카키 야상 · 카고 팬츠': 'clothes-nari-utility-cargo',
        '갈색 재킷 · 미니스커트 · 부츠': 'clothes-nari-suede-mini', '버건디 니트 · 플리츠 미니': 'clothes-nari-mini-pleats',
        '하늘색 셔츠 · 검정 슬랙스':'clothes-seojin-shirt', '크림 니트 · 검정 바지':'clothes-seojin-knit', '남색 롱코트 · 회색 목도리':'clothes-seojin-coat' };
      const text = value => typeof value === 'string' ? Object.entries(renamed).reduce((out, [old, id]) => out.replaceAll(old, root.AquaEconomy.clothes.find(item => item.id === id).name), value) : value;
      const refresh = lines => lines.forEach(line => {
        if (typeof line.text === 'string') line.text = text(line.text);
        for (const choice of line.choice || []) { choice.label = text(choice.label); refresh(choice.lines || []); }
      });
      refresh(state.scene.queue);
    }
    state.letters = state.letters.map(letter => {
      const topic = letter.topic === '마음속 고민' ? '고민' : letter.topic;
      const fallback = root.AquaRadio.draftFor(state, root.AquaRadio.topics.includes(topic) ? topic : root.AquaRadio.topics[0], letter.tone === 'plain' ? 'plain' : 'honest');
      return { ...fallback, id: `letter-${letter.week}`, alias: state.nickname, readAt: null, heardAt: null, ...letter };
    });
    // The first development build stopped after April 2; this is a content checkpoint, not an ending.
    if (input.version === 1 && state.completed && state.flags.firstRadio) {
      state.completed = false;
      state.slot = 3;
      const episode = W.episodeOn('2026-04-02');
      state.radio.listened.push(episode.id);
      state.radio.aired[episode.id] = { date: episode.date, rerun: false, letterIds: [] };
    }
    if (input.version < 3 || !input.relationships) root.AquaRelationships.migrate(state);
    state.history = state.history.filter(line => line && typeof line.text === 'string').slice(-120);
    return state;
  }
  root.AquaState = { initial, restore };
})(typeof window !== 'undefined' ? window : globalThis);
