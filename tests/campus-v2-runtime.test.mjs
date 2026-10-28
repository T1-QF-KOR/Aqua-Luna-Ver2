// Runs the actual game.js handlers in a small DOM adapter. This checks gameplay
// integration and persistence; it does not substitute for browser visual QA.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
const sources = await Promise.all(['world', 'encounters', 'wardrobe', 'radio', 'social', 'outings', 'state', 'scenes', 'semester', 'game'].map(async name => [name, await fs.readFile(new URL(`src/campus-v2/${name}.js`, root), 'utf8')]));
const KEY = 'aqua-luna-campus-v2';
class ClassList {
  values = new Set();
  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) { const result = force ?? !this.values.has(value); result ? this.add(value) : this.remove(value); return result; }
}
function mount(saved = new Map()) {
  const ids = new Map(), listeners = new Map();
  class Element {
    constructor(tag = 'div') { this.tagName = tag; this.children = []; this.dataset = {}; this.style = { setProperty() {} }; this.classList = new ClassList(); this.hidden = false; this.disabled = false; this.open = false; this.value = ''; this.textContent = ''; }
    set innerHTML(value) {
      for (const child of this.children) if (child.id) ids.delete(child.id);
      this.children = [];
      this.html = value;
      for (const match of value.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/g)) {
        const child = new Element(match[1]), attrs = match[2];
        for (const attr of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) {
          const [, key, v] = attr;
          if (key.startsWith('data-')) child.dataset[key.slice(5).replace(/-([a-z])/g, (_, a) => a.toUpperCase())] = v;
          else child[key] = v;
        }
        child.disabled = /\bdisabled\b/.test(attrs); child.hidden = /\bhidden\b/.test(attrs);
        if (child.id) ids.set(child.id, child);
        this.children.push(child);
      }
      for (const select of value.matchAll(/<select id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
        const options = [...select[2].matchAll(/<option([^>]*)>([^<]*)<\/option>/g)];
        const chosen = options.find(o => /\bselected\b/.test(o[1])) || options[0];
        if (chosen) ids.get(select[1]).value = chosen[1].match(/value="([^"]*)"/)?.[1] ?? chosen[2];
      }
    }
    get innerHTML() { return this.html || ''; }
    replaceChildren(...children) { this.children = children; }
    append(child) { this.children.push(child); }
    addEventListener(name, fn) { this[name] = fn; }
    setAttribute(name, value) { this[name] = value; }
    showModal() { this.open = true; }
    close() { this.open = false; }
    closest() { return null; }
    click() { if (!this.disabled) this.onclick?.({ stopPropagation() {} }); }
    querySelectorAll(selector) {
      const attr = selector.match(/^\[data-([^\]]+)\]$/)?.[1]?.replace(/-([a-z])/g, (_, a) => a.toUpperCase());
      return attr ? this.children.filter(child => child.dataset[attr] !== undefined) : [];
    }
  }
  const body = new Element('body');
  for (const match of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*\bid="([^"]+)"[^>]*)>/g)) {
    const node = new Element(match[1]); node.id = match[3]; node.hidden = /\bhidden\b/.test(match[2]); ids.set(node.id, node);
  }
  const document = { body, documentElement: new Element('html'), baseURI: 'file:///test/AquaLuna/campus.html', hidden: false,
    getElementById: id => ids.get(id) || null, createElement: tag => new Element(tag),
    addEventListener: (name, fn) => listeners.set(name, fn) };
  let timer = 0; const timers = new Map();
  const context = { document, structuredClone, console, URL, Blob,
    matchMedia: () => ({ matches: true }),
    setTimeout: (fn, delay) => { timers.set(++timer, { fn, delay }); return timer; },
    clearTimeout: id => timers.delete(id),
    localStorage: { getItem: k => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, v) } };
  context.window = context;
  vm.createContext(context);
  for (const [name, source] of sources) vm.runInContext(source, context, { filename: `${name}.js` });
  const click = id => { const node = ids.get(id); assert.ok(node, `Missing #${id}`); node.click(); };
  const snapshot = () => JSON.parse(saved.get(KEY));
  function preview(id) { const node = ids.get('locations').children.find(n => n.dataset.location === id); assert.ok(node, `Missing location ${id}`); node.click(); }
  function location(id) { preview(id); if (snapshot().slot !== 3) click('visit-place'); }
  function choose(index = 0) { const b = ids.get('choices').children[index]; assert.ok(b, `Missing choice ${index}`); b.click(); }
  function finishScene(choice = 0) {
    for (let i = 0; i < 100 && snapshot().scene; i++) {
      if (snapshot().scene.queue[snapshot().scene.index]?.choice) choose(choice); else click('next');
    }
    assert.equal(snapshot().scene, null);
  }
  const runTimer = delay => { const entry = [...timers].find(([, t]) => t.delay === delay); assert.ok(entry, `Missing ${delay}ms timer`); timers.delete(entry[0]); entry[1].fn(); };
  const hasTimer = delay => [...timers.values()].some(t => t.delay === delay);
  const visibility = hidden => { document.hidden = hidden; listeners.get('visibilitychange')(); };
  return { context, ids, saved, click, snapshot, preview, location, choose, finishScene, runTimer, hasTimer, visibility };
}
function seed(change, requirements = {}) {
  const env = mount(), state = env.context.AquaState.initial('테스트', '물고기');
  Object.assign(state, { date: '2026-04-06', slot: 3, met: ['nari', 'daeun', 'seojin'],
    bond: { nari: 12, daeun: 20, seojin: 20 }, knowledge: 20, fitness: 15, sensitivity: 20,
    seen: ['prologue', 'entrance', 'daeunMeet', 'fair', 'seojinMeet', 'firstRadio'], flags: { heardLastSeason: true } }, change);
  // Select a deterministic itinerary for this scenario, using the real encounter rules.
  let found = false;
  for (let candidate = 0; candidate < 10000; candidate++) {
    state.encounters.seed = candidate;
    const plan = env.context.AquaEncounters.resolve(state);
    if (Object.entries(requirements.at || {}).every(([id, place]) => plan.locations[id] === place) &&
      Object.entries(requirements.scene || {}).every(([place, id]) => plan.scenes[place] === id)) { found = true; break; }
  }
  assert.ok(found, 'No itinerary satisfies the test scenario');
  const saved = new Map([[KEY, JSON.stringify(state)]]), runtime = mount(saved);
  runtime.click('continue'); return runtime;
}
const checks = [];
function test(name, fn) { fn(); checks.push(name); console.log(`PASS ${name}`); }

test('A new game opens with a dated intro, then enters the original move-in prologue without spending a day', () => {
  const env = mount(); env.click('start'); env.click('begin');
  let state = env.snapshot();
  assert.equal(state.scene.id, 'intro'); assert.equal(state.scene.presentation, 'intro');
  assert.equal(state.date, '2026-03-02'); assert.equal(state.slot, 0);
  assert.equal(env.ids.get('intro').hidden, false); assert.equal(env.ids.get('scene').hidden, true);
  assert.equal(env.ids.get('intro-text').textContent, '나는 한여울대학교에 들어왔다.');
  env.click('intro-next'); env.click('intro-next');
  assert.equal(env.snapshot().scene.index, 2);
  env.click('intro-next'); state = env.snapshot();
  assert.equal(state.scene.id, 'prologue'); assert.equal(state.scene.index, 0);
  assert.equal(state.date, '2026-03-02'); assert.equal(state.money, 150000); assert.equal(state.energy, 100);
  assert.equal(env.ids.get('intro').hidden, true); assert.equal(env.ids.get('scene').hidden, false);
  assert.equal(env.ids.get('line').textContent, '상자 세 개, 이불 한 채, 전기포트 하나. 그게 내 서울 살림의 전부였다.');
});
test('An intro save resumes its current page; skipping bypasses only the intro and preserves the first story choice', () => {
  let env = mount(); env.click('start'); env.click('begin'); env.click('intro-next');
  env = mount(env.saved); env.click('continue');
  assert.equal(env.snapshot().scene.index, 1); assert.equal(env.ids.get('intro').hidden, false);
  assert.ok(env.ids.get('intro-text').textContent.includes('작곡 전공'));
  env.click('intro-skip');
  assert.equal(env.snapshot().scene.id, 'prologue'); assert.equal(env.snapshot().scene.index, 0);
  assert.equal(env.snapshot().flags.heardLastSeason, undefined);
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  assert.equal(env.ids.get('choices').children.length, 2);
  env.choose(0);
  for (let i = 0; i < 20 && env.snapshot().scene?.id === 'prologue'; i++) env.click('next');
  assert.equal(env.snapshot().flags.heardLastSeason, true);
  assert.equal(env.snapshot().date, '2026-03-03'); assert.equal(env.snapshot().scene.id, 'entrance');
});
test('The short intro advances automatically, pauses in menus and background, and respects reduced motion', () => {
  const env = mount(new Map([[`${KEY}-prefs`, JSON.stringify({ reduced: false })]]));
  env.click('start'); env.click('begin'); assert.equal(env.hasTimer(4200), true);
  env.click('save'); assert.equal(env.hasTimer(4200), false);
  env.click('close'); env.runTimer(4200); assert.equal(env.snapshot().scene.index, 1);
  env.visibility(true); assert.equal(env.hasTimer(6200), false);
  env.visibility(false); env.runTimer(6200); assert.equal(env.snapshot().scene.index, 2);
  env.runTimer(6200); assert.equal(env.snapshot().scene.id, 'prologue');
  const reduced = mount(); reduced.click('start'); reduced.click('begin');
  assert.equal(reduced.hasTimer(4200), false); reduced.click('intro-next');
  assert.equal(reduced.snapshot().scene.index, 1);
});

test('Actual runtime keeps draft cancellation separate from sending, then reads and hears the letter exactly once', () => {
  const env = seed();
  env.location('letter'); env.ids.get('topic').value = '신경 쓰이는 사람'; env.ids.get('topic').onchange();
  const draft = env.snapshot().letterDraft;
  assert.equal(draft.target, 'daeun'); env.click('letter-cancel');
  assert.equal(env.snapshot().letters.length, 0); assert.equal(env.snapshot().radio.anonymous, 0);
  env.location('letter'); assert.equal(env.ids.get('topic').value, '신경 쓰이는 사람');
  env.click('letter-send'); assert.equal(env.snapshot().letters.length, 1);
  assert.equal(env.snapshot().slot, 3); assert.equal(env.snapshot().radio.anonymous, 4);
  for (let i = 0; i < 6; i++) env.click('end-day');
  let state = env.snapshot(); assert.equal(state.date, '2026-04-09'); assert.equal(state.slot, 3);
  assert.equal(state.letters[0].read, true); assert.equal(state.letters[0].heard, false);
  assert.equal(state.bond.nari, 11); assert.equal(state.radio.anonymous, 6);
  env.location('listen'); env.click('listen-today'); env.finishScene();
  state = env.snapshot(); assert.equal(state.letters[0].heard, true); assert.equal(state.radio.listened.length, 1);
  const before = { bond: state.bond, radio: state.radio, letters: state.letters };
  env.location('listen'); env.click('listen-today'); env.finishScene();
  state = env.snapshot(); assert.deepEqual({ bond: state.bond, radio: state.radio, letters: state.letters }, before);
});
test('Saving and reloading the actual first-work scene preserves charged energy and pays pending wages once at completion', () => {
  let env = seed({ date: '2026-03-11', slot: 1, met: ['nari', 'daeun'], energy: 100, bond: { nari: 12, daeun: 20, seojin: 0 } }, { at: { seojin: 'cafe' } });
  env.location('cafe'); assert.equal(env.snapshot().energy, 78); assert.equal(env.snapshot().money, 150000);
  env = mount(env.saved); env.click('continue');
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env.choose(0); assert.equal(env.snapshot().bond.seojin, 4);
  env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.equal(env.snapshot().money, 182000); assert.equal(env.snapshot().energy, 78); assert.equal(env.snapshot().slot, 2);
  env = mount(env.saved); env.click('continue'); assert.equal(env.snapshot().money, 182000);
});
test('An actual heroine conversation returns to the same time and consumes its daily opportunity once', () => {
  const env = seed({ date: '2026-04-03', slot: 1, energy: 100 }, { at: { nari: 'roof' } });
  env.location('roof'); env.ids.get('modal-content').querySelectorAll('[data-person]')[0].click();
  env.click('next'); env.choose(1); env.finishScene();
  const state = env.snapshot(); assert.equal(state.slot, 1); assert.equal(state.energy, 100); assert.equal(state.money, 150000);
  assert.equal(state.bond.nari, 14); assert.equal(state.conversations.nari.date, '2026-04-03');
  assert.equal(env.ids.get('modal-content').querySelectorAll('[data-person]')[0].disabled, true);
});
test('Ending daytime visits the mandatory festival first, and the unchosen heroine receives no invented reward', () => {
  let env = seed({ date: '2026-05-20', slot: 1 });
  env.click('end-day'); assert.equal(env.snapshot().scene.id, 'festival');
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env.choose(1); const bond = env.snapshot().bond.daeun;
  env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.equal(env.snapshot().bond.daeun, bond); assert.equal(bond, 26);
  assert.equal(env.snapshot().bond.nari, 12); assert.equal(env.snapshot().bond.seojin, 20);
  assert.equal(env.snapshot().date, '2026-05-20'); assert.equal(env.snapshot().slot, 3);
  assert.equal(env.snapshot().money, 150000);
});
test('Canceling a paid activity keeps resources unchanged; manual slots restore a prior time and resources', () => {
  const env = seed({ date: '2026-04-07', slot: 1 });
  env.location('library'); env.click('activity-cancel'); assert.equal(env.snapshot().energy, 100);
  env.click('save'); env.ids.get('modal-content').querySelectorAll('[data-save]')[0].click(); env.click('close');
  env.location('library'); env.click('activity-confirm'); assert.equal(env.snapshot().energy, 88); assert.equal(env.snapshot().slot, 2);
  env.click('save'); env.ids.get('modal-content').querySelectorAll('[data-load]')[0].click();
  assert.equal(env.snapshot().slot, 1); assert.equal(env.snapshot().energy, 100); assert.equal(env.snapshot().knowledge, 20);
});
test('June content checkpoint never masquerades as a completed full-game ending', () => {
  const env = seed({ date: '2026-06-30', slot: 3 });
  env.click('end-day'); assert.equal(env.snapshot().date, '2026-06-30'); assert.equal(env.snapshot().completed, false);
  assert.ok(env.ids.get('modal-content').innerHTML.includes('제작 중'));
});
test('The three-person work event commits one shift, one salary, and only the authored shared rewards', () => {
  const env = seed({ date: '2026-05-27', slot: 2, energy: 100 }, { at: { nari: 'cafe' }, scene: { cafe: 'crossRain' } });
  env.location('cafe');
  assert.equal(env.snapshot().scene.id, 'crossRain');
  assert.equal(env.snapshot().energy, 78); assert.equal(env.snapshot().money, 150000);
  assert.ok(env.snapshot().scene.queue.some(l => l.cast?.length === 3));
  env.finishScene(2);
  assert.equal(env.snapshot().money, 182000); assert.equal(env.snapshot().energy, 78);
  assert.equal(env.snapshot().slot, 3); assert.equal(env.snapshot().bond.nari, 13);
  assert.equal(env.snapshot().bond.daeun, 22); assert.equal(env.snapshot().bond.seojin, 22);
});
const dataButton = (env, attribute, value) => {
  const button = env.ids.get('modal-content').querySelectorAll(`[data-${attribute}]`).find(b => b.dataset[attribute.replace(/-([a-z])/g, (_, a) => a.toUpperCase())] === value);
  assert.ok(button, `Missing ${attribute}=${value}`); return button;
};
test('The location panel conceals people and previewing changes only the scenery until the player visits', () => {
  const env = seed({ date: '2026-04-03', slot: 1 }, { at: { nari: 'roof' } });
  const before = env.snapshot();
  const labels = env.ids.get('locations').children.map(b => b.innerHTML).join('');
  for (const name of ['한나리', '오다은', '백서진', '♪', '★']) assert.ok(!labels.includes(name));
  env.preview('roof'); assert.equal(env.ids.get('preview-title').textContent, '옥상 정원');
  assert.ok(env.ids.get('backdrop').dataset.path.endsWith('rooftop-day.png'));
  assert.equal(env.ids.get('modal').open, false); assert.deepEqual(env.snapshot(), before);
  assert.ok(!env.ids.get('preview-desc').textContent.includes('나리'));
  env.preview('cafe'); assert.equal(env.ids.get('preview-title').textContent, '강변 카페');
  assert.ok(env.ids.get('backdrop').dataset.path.endsWith('cafe-day.png')); assert.deepEqual(env.snapshot(), before);
  env.preview('roof'); env.click('visit-place'); assert.equal(dataButton(env, 'person', 'nari').disabled, false);
});
test('Buying and giving a gift use separate confirmations, with no time charge and no duplicated item after reload', () => {
  let env = seed({ date: '2026-04-03', slot: 1 }, { at: { nari: 'roof' } });
  env.click('phone'); dataButton(env, 'app', 'shop').click(); dataButton(env, 'buy', 'picks').click();
  env.click('buy-cancel'); assert.equal(env.snapshot().money, 150000); assert.equal(env.snapshot().social.inventory.picks, undefined);
  dataButton(env, 'buy', 'picks').click(); const buy = env.ids.get('buy-confirm'); buy.click(); buy.click();
  assert.equal(env.snapshot().money, 142000); assert.equal(env.snapshot().social.inventory.picks, 1);
  env.click('close'); env.location('roof'); dataButton(env, 'gift-person', 'nari').click(); dataButton(env, 'give', 'picks').click();
  env.click('gift-cancel'); assert.equal(env.snapshot().social.inventory.picks, 1);
  dataButton(env, 'give', 'picks').click(); const give = env.ids.get('gift-confirm'); give.click(); give.click();
  assert.equal(env.snapshot().social.inventory.picks, 0); assert.equal(env.snapshot().bond.nari, 15);
  env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.equal(env.snapshot().money, 142000); assert.equal(env.snapshot().slot, 1); assert.equal(env.snapshot().energy, 100);
  assert.equal(env.snapshot().social.gifts.length, 1); assert.equal(dataButton(env, 'gift-person', 'nari').disabled, true);
});
test('An actual paid date resumes mid-choice, advances exactly two slots, and adds its selected memory once', () => {
  let env = seed({ date: '2026-04-03', slot: 1 }, { at: { daeun: 'river' } });
  env.location('river'); dataButton(env, 'date-person', 'daeun').click(); dataButton(env, 'destination', 'concert').click();
  env.click('date-cancel'); assert.equal(env.snapshot().money, 150000); assert.equal(env.snapshot().energy, 100);
  dataButton(env, 'destination', 'concert').click(); const confirm = env.ids.get('date-confirm'); confirm.click(); confirm.click();
  assert.equal(env.snapshot().money, 126000); assert.equal(env.snapshot().energy, 85); assert.equal(env.snapshot().social.album.length, 0);
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env = mount(env.saved); env.click('continue'); env.choose(0);
  const memory = env.snapshot().scene.outing.memory; assert.ok(memory.includes('나 여기'));
  env = mount(env.saved); env.click('continue'); env.finishScene();
  let state = env.snapshot(); assert.equal(state.slot, 3); assert.equal(state.date, '2026-04-03'); assert.equal(state.bond.daeun, 27);
  assert.equal(state.social.album.length, 1); assert.equal(state.social.album[0].memory, memory);
  env = mount(env.saved); env.click('continue'); state = env.snapshot();
  assert.equal(state.money, 126000); assert.equal(state.energy, 85); assert.equal(state.bond.daeun, 27); assert.equal(state.social.album.length, 1);
  env.click('phone'); dataButton(env, 'app', 'album').click(); assert.ok(env.ids.get('modal-content').innerHTML.includes(memory));
});
test('A mandatory evening prevents a date and a shared conversation uses both daily talks without jealousy', () => {
  const blocked = seed({ date: '2026-05-20', slot: 1, bond: { nari: 30, daeun: 20, seojin: 20 } }, { at: { nari: 'studio' } });
  blocked.location('studio'); assert.equal(dataButton(blocked, 'date-person', 'nari').disabled, true);
  assert.ok(blocked.ids.get('modal-content').innerHTML.includes('먼저 정해진 약속'));
  const env = seed({ date: '2026-04-10', slot: 2, bond: { nari: 30, daeun: 40, seojin: 20 }, seen: ['prologue', 'entrance', 'fair', 'daeunMeet', 'nariShake', 'nariVolume', 'nariHabit', 'crossDrum'] }, { at: { nari: 'club', daeun: 'club' } });
  env.location('club'); env.click('group-talk'); env.click('next'); env.choose(1); env.finishScene();
  const state = env.snapshot(); assert.equal(state.slot, 2); assert.equal(state.energy, 100);
  assert.equal(state.conversations.nari.date, state.date); assert.equal(state.conversations.daeun.date, state.date);
  assert.deepEqual(state.social.jealousy, {}); assert.equal(dataButton(env, 'person', 'nari').disabled, true);
});
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
await fs.writeFile(new URL('qa/campus-v2/runtime-results.json', root), JSON.stringify({ date, passed: true, checks, runtime: 'Node VM + DOM adapter; real production game handlers; no browser layout or native file picker' }, null, 2) + '\n');
console.log(`${checks.length}/${checks.length} passed`);
