/* NPC clothes follow the setting and season, and stay fixed within a saved scene. */
(function (root) {
  'use strict';
  const catalog = {
    nari: { hoodie: 'nari-hoodie-v6.png', campus: 'nari-campus-v6.png', stage: 'nari-stage-v6.png',
      casual: 'nari-cardigan-v6.png', 'suede-mini': 'nari-slate-jacket-v6.png', 'utility-cargo': 'nari-pinafore-v6.png', 'mini-pleats': 'nari-lavender-knit-v6.png' },
    daeun: { rehearsal: 'daeun-rehearsal-v7.png', campus: 'daeun-campus-v7.png', summer: 'daeun-summer-v7.png', winter: 'daeun-winter-v7.png',
      'denim-mini': 'daeun-denim-mini-v7.png', 'layered-denim': 'daeun-layered-denim-v7.png', 'quarter-bermuda': 'daeun-quarter-bermuda-v7.png' },
    seojin: { work: 'seojin-work-v5.png', offduty: 'seojin-leather-v5.png', summer: 'seojin-summer-chic-v5.png',
      shirt: 'seojin-blazer-v5.png', knit: 'seojin-asymmetric-knit-v5.png', coat: 'seojin-city-coat-v5.png' }
  };
  // Register an expression only after its illustration ships. Missing variants
  // retain the selected clothes without speculative requests or image flicker.
  const expressions = { nari: { campus: { smile: 'nari-campus-smile-v7.png', sad: 'nari-campus-sad-v7.png', surprised: 'nari-campus-surprised-v7.png', blush: 'nari-campus-blush-v7.png' } },
    seojin: { work: { smile: 'seojin-work-smile-v6.png', sad: 'seojin-work-sad-v6.png', surprised: 'seojin-work-surprised-v6.png', blush: 'seojin-work-blush-v6.png' },
      offduty: { smile: 'seojin-leather-smile-v6.png', sad: 'seojin-leather-sad-v6.png', surprised: 'seojin-leather-surprised-v6.png', blush: 'seojin-leather-blush-v6.png' } },
    daeun: { campus: { happy: 'daeun-campus-happy-v8.png', smile: 'daeun-campus-happy-v8.png', sad: 'daeun-campus-sad-v8.png', surprised: 'daeun-campus-surprised-v8.png', blush: 'daeun-campus-blush-v8.png' },
      winter: { smile: 'daeun-winter-smile-v8.png', sad: 'daeun-winter-sad-v8.png', surprised: 'daeun-winter-surprised-v8.png', blush: 'daeun-winter-blush-v8.png' } } };
  function pick(state, id, context = {}) {
    const gift = state.giftClothes?.[id], month = Number(state.date.slice(5, 7));
    const weatherFits = gift === 'coat' ? month >= 11 || month <= 2 : gift === 'quarter-bermuda' ? month >= 5 && month <= 9 : true;
    if (context.outing?.person === id && catalog[id]?.[gift] && weatherFits && state.bond[id] >= (id === 'nari' ? 45 : 35)) return gift;
    const summer = state.date >= '2026-06-01' && state.date <= '2026-09-10';
    if (id === 'nari' && context.id === 'nariSummer') return 'utility-cargo';
    if (id === 'nari' && context.id === 'nariVoice') return 'casual';
    if (id === 'nari' && context.id === 'autumnFestival') return 'stage';
    if (id === 'nari' && context.id === 'nariCard') return 'suede-mini';
    if (id === 'nari' && ['holidayXmasNight','nariNewYear'].includes(context.id)) return 'mini-pleats';
    if (id === 'seojin' && ['seojinConfess', 'seojinCouple'].includes(context.id)) return 'coat';
    if (id === 'daeun' && ['daeunConfess', 'daeunCouple'].includes(context.id)) return 'winter';
    const rehearsal = context.returnPlace === 'club' || ['nariShake', 'nariVolume', 'nariHabit', 'nariDemo', 'crossDrum', 'crossThursday'].includes(context.id);
    if (id === 'nari') return ['entrance', 'fair', 'festival'].includes(context.id) ? 'stage' : rehearsal ? 'hoodie' : 'campus';
    if (id === 'daeun') return (rehearsal || ['festival', 'fair'].includes(context.id)) && !context.outing ? 'rehearsal' : summer && root.AquaEncounters.weather(state) !== 'rain' ? 'summer' : month >= 11 || month <= 2 ? 'winter' : 'campus';
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
