/* NPC clothes follow the setting and season, and stay fixed within a saved scene. */
(function (root) {
  'use strict';
  const catalog = {
    nari: { hoodie: 'nari-v1.png', campus: 'nari-campus-v2.png', stage: 'nari-stage-v2.png',
      casual: 'nari-casual-v3.png', 'suede-mini': 'nari-suede-mini-v3.png', 'utility-cargo': 'nari-utility-cargo-v3.png', 'mini-pleats': 'nari-mini-pleats-v3.png' },
    daeun: { rehearsal: 'daeun-v1.png', campus: 'daeun-campus-v2.png', summer: 'daeun-summer-v2.png',
      'denim-mini': 'daeun-denim-mini-v3.png', 'layered-denim': 'daeun-layered-denim-v3.png', 'quarter-bermuda': 'daeun-quarter-bermuda-v3.png' },
    seojin: { work: 'seojin-v1.png', offduty: 'seojin-offduty-v2.png', summer: 'seojin-summer-v2.png',
      shirt: 'seojin-shirt-v3.png', knit: 'seojin-knit-v3.png', coat: 'seojin-coat-v3.png' }
  };
  // Register an expression only after its illustration ships. Missing variants
  // retain the selected clothes without speculative requests or image flicker.
  const expressions = {};
  function pick(state, id, context = {}) {
    const gift = state.giftClothes?.[id], month = Number(state.date.slice(5, 7));
    const weatherFits = gift === 'coat' ? month >= 11 || month <= 2 : gift === 'quarter-bermuda' ? month >= 5 && month <= 9 : true;
    if (context.outing?.person === id && catalog[id]?.[gift] && weatherFits && state.bond[id] >= (id === 'nari' ? 45 : 35)) return gift;
    const summer = state.date >= '2026-06-01' && state.date <= '2026-09-10';
    const rehearsal = context.returnPlace === 'club' || ['nariShake', 'nariVolume', 'nariHabit', 'nariDemo', 'crossDrum', 'crossThursday'].includes(context.id);
    if (id === 'nari') return ['entrance', 'fair', 'festival'].includes(context.id) ? 'stage' : rehearsal ? 'hoodie' : 'campus';
    if (id === 'daeun') return (rehearsal || ['festival', 'fair'].includes(context.id)) && !context.outing ? 'rehearsal' : summer && root.AquaEncounters.weather(state) !== 'rain' ? 'summer' : 'campus';
    if (id === 'seojin') return !context.outing && (context.background === 'cafe' || context.returnPlace === 'cafe') ? 'work' : summer ? 'summer' : 'offduty';
    return null;
  }
  function source(state, id, context = {}, expr = null) {
    const saved = context.wardrobe?.[id];
    const variant = catalog[id]?.[saved] ? saved : pick(state, id, context);
    const expressionFile = expressions[id]?.[variant]?.[expr];
    return `assets/heroines/${expressionFile || catalog[id]?.[variant] || `${id}-v1.png`}`;
  }
  root.AquaWardrobe = { catalog, expressions, pick, source };
})(typeof window !== 'undefined' ? window : globalThis);
