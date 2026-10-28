/* NPC clothes follow the setting and season, and stay fixed within a saved scene. */
(function (root) {
  'use strict';
  const catalog = {
    nari: { hoodie: 'nari-v1.png', campus: 'nari-campus-v2.png', stage: 'nari-stage-v2.png' },
    daeun: { rehearsal: 'daeun-v1.png', campus: 'daeun-campus-v2.png', summer: 'daeun-summer-v2.png' },
    seojin: { work: 'seojin-v1.png', offduty: 'seojin-offduty-v2.png', summer: 'seojin-summer-v2.png' }
  };
  function pick(state, id, context = {}) {
    const summer = state.date >= '2026-06-01' && state.date <= '2026-09-10';
    const rehearsal = context.returnPlace === 'club' || ['nariShake', 'nariVolume', 'nariHabit', 'nariDemo', 'crossDrum', 'crossThursday'].includes(context.id);
    if (id === 'nari') return ['entrance', 'fair', 'festival'].includes(context.id) ? 'stage' : rehearsal ? 'hoodie' : 'campus';
    if (id === 'daeun') return (rehearsal || ['festival', 'fair'].includes(context.id)) && !context.outing ? 'rehearsal' : summer && root.AquaEncounters.weather(state) !== 'rain' ? 'summer' : 'campus';
    if (id === 'seojin') return !context.outing && (context.background === 'cafe' || context.returnPlace === 'cafe') ? 'work' : summer ? 'summer' : 'offduty';
    return null;
  }
  function source(state, id, context = {}) {
    const variant = context.wardrobe?.[id] || pick(state, id, context);
    return `assets/heroines/${catalog[id]?.[variant] || `${id}-v1.png`}`;
  }
  root.AquaWardrobe = { catalog, pick, source };
})(typeof window !== 'undefined' ? window : globalThis);
