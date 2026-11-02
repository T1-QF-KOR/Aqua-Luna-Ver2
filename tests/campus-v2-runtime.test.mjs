// Runs the actual game.js handlers in a small DOM adapter. This checks gameplay
// integration and persistence; it does not substitute for browser visual QA.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
const sources = await Promise.all(['world', 'encounters', 'wardrobe', 'radioEpisodes', 'radio', 'relationships', 'romance', 'economy', 'social', 'dialogue', 'dialogue-compat', 'messages', 'composition', 'dateActivities', 'outings', 'peopleEvents', 'smallEvents', 'state', 'scenes', 'semester', 'school', 'summer', 'autumn', 'winter', 'holidays', 'endings', 'audio', 'game'].map(async name => [name, await fs.readFile(new URL(`src/campus-v2/${name}.js`, root), 'utf8')]));
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
  function location(id) { preview(id); if (snapshot().slot !== 3) click('visit-place'); if(snapshot().scene?.id.startsWith('approach-')) finishScene(); }
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
  const key = value => listeners.get('keydown')({key:value,repeat:false,preventDefault(){},target:{closest(){return null;}}});
  return { context, ids, saved, click, snapshot, preview, location, choose, finishScene, runTimer, hasTimer, visibility, key };
}
function seed(change, requirements = {}) {
  const env = mount(), state = env.context.AquaState.initial('테스트', '물고기');
  Object.assign(state, { date: '2026-04-06', slot: 3, met: ['nari', 'daeun', 'seojin'],
    bond: { nari: 12, daeun: 20, seojin: 20 }, knowledge: 20, fitness: 15, sensitivity: 20,
    seen: ['prologue', 'entrance', 'daeunMeet', 'fair', 'seojinMeet', 'firstRadio'], flags: { heardLastSeason: true } }, change);
  env.context.AquaRelationships.migrate(state);
  state.smallEvents.visited=Object.keys(env.context.AquaSmallEvents.places);
  // Select a deterministic itinerary for this scenario, using the real encounter rules.
  let found = false;
  for (let candidate = 0; candidate < 10000; candidate++) {
    state.encounters.seed = candidate;
    const plan = env.context.AquaEncounters.resolve(state);
    if (Object.entries(requirements.at || {}).every(([id, place]) => plan.locations[id] === place) &&
      Object.entries(requirements.scene || {}).every(([place, id]) => plan.scenes[place] === id) &&
      (!requirements.smallAbsent || !env.context.AquaSmallEvents.maybe(structuredClone(state),requirements.smallAbsent))) { found = true; break; }
  }
  assert.ok(found, 'No itinerary satisfies the test scenario');
  const saved = new Map([[KEY, JSON.stringify(state)]]), runtime = mount(saved);
  runtime.click('continue'); return runtime;
}
const dataButton = (env, attribute, value) => {
  const button = env.ids.get('modal-content').querySelectorAll(`[data-${attribute}]`).find(b => b.dataset[attribute.replace(/-([a-z])/g, (_, a) => a.toUpperCase())] === value);
  assert.ok(button, `Missing ${attribute}=${value}`); return button;
};
const checks = [];
function test(name, fn) { fn(); checks.push(name); console.log(`PASS ${name}`); }

test('Soundtrack attribution opens from settings and returns without changing progress', () => {
  const env=seed({date:'2026-04-06',slot:1});const before=env.snapshot();
  env.click('settings');env.click('music-credits');
  assert.equal(env.ids.get('modal-title').textContent,'음악 출처');
  assert.ok(env.ids.get('modal-content').innerHTML.includes('Tanner Helland'));
  assert.ok(env.ids.get('modal-content').innerHTML.includes('creativecommons.org/licenses/by/4.0'));
  env.click('credits-back');assert.equal(env.ids.get('modal-title').textContent,'읽기와 연출');
  assert.equal(env.snapshot().date,before.date);assert.equal(env.snapshot().slot,before.slot);
});
test('Keyboard interaction unlocks soundtrack without requiring a mouse', () => {
  const env=seed({date:'2026-04-06',slot:1});let unlocks=0;
  env.context.AquaAudio.unlock=()=>{unlocks++;};env.context.AquaAudio.play=()=>{};
  env.key('Tab');env.key('Tab');assert.equal(unlocks,1);
});
test('Registered voice follows the displayed line and automatic reading waits until it finishes', () => {
  const setup=mount(),state=setup.context.AquaState.initial('테스트','물고기');
  state.date='2026-04-06';state.slot=1;state.met=['nari'];state.bond.nari=30;
  state.scene={id:'nariShake',title:'떨리는 손',background:'practice',time:1,after:'event',index:0,
    queue:[{speaker:'나리',text:'아, 너구나. 다행이다. 다른 사람이면 숨었을 거야.',cast:['nari'],voiceId:'test-cue'},
      {text:'나리는 손을 폈다.',cast:['nari']}],applied:[],logged:[],lastCast:[]};
  assert.ok(setup.context.AquaState.restore(structuredClone(state)));
  const env=mount(new Map([[KEY,JSON.stringify(state)]])),instances=[];
  env.context.Audio=class { constructor(url){this.url=url;instances.push(this);} play(){return Promise.resolve();} pause(){this.paused=true;} };
  env.context.AquaAudio.voiceTracks['test-cue']='assets/audio/voice/test-cue.ogg';
  env.context.AquaAudio.unlock();env.click('continue');
  const voice=instances.find(item=>item.url.endsWith('/test-cue.ogg'));assert.ok(voice);
  env.click('auto');assert.equal(env.hasTimer(2500),false,'automatic reading must wait for voice');
  voice.onended();assert.equal(env.hasTimer(2500),true,'automatic reading resumes when voice ends');
  env.runTimer(2500);assert.equal(env.snapshot().scene.index,1);
  assert.equal(env.context.AquaAudio.isVoicePlaying(),false);
});
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
test('An approaching heroine begins a scene once and returns to the encounter without affection gain', () => {
  const env=seed({date:'2026-04-03',slot:1,bond:{nari:0,daeun:0,seojin:0}},{at:{nari:'roof'}}),before=env.snapshot();
  env.preview('roof');env.click('visit-place');assert.ok(env.snapshot().scene.id.startsWith('approach-nari'));
  assert.ok(Object.keys(env.snapshot().flags).some(k=>k.startsWith('approach:2026-04-03:nari:')));env.finishScene();
  assert.equal(env.snapshot().bond.nari,before.bond.nari);assert.equal(env.snapshot().slot,before.slot);
  assert.ok(env.ids.get('modal-content').querySelectorAll('[data-person]').some(b=>b.dataset.person==='nari'));env.click('cancel-action');env.location('roof');
  assert.equal(env.snapshot().scene,null);assert.ok(env.ids.get('modal-content').querySelectorAll('[data-person]').some(b=>b.dataset.person==='nari'));
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
  const env = seed({ date: '2026-04-07', slot: 1, met: [] });
  env.location('library'); env.click('activity-cancel'); assert.equal(env.snapshot().energy, 100);
  env.click('save'); env.ids.get('modal-content').querySelectorAll('[data-save]')[0].click(); env.click('close');
  env.location('library'); env.click('activity-confirm'); if(env.snapshot().scene) env.finishScene(1); assert.equal(env.snapshot().energy, 88); assert.equal(env.snapshot().slot, 2);
  env.click('save'); env.ids.get('modal-content').querySelectorAll('[data-load]')[0].click();
  assert.equal(env.snapshot().slot, 1); assert.equal(env.snapshot().energy, 100); assert.equal(env.snapshot().knowledge, 20);
});
test('The last broadcast proceeds into an ending that stays complete after reload', () => {
  let env=seed({date:'2027-02-25',slot:3,seen:['lastBroadcast'],met:[],bond:{nari:0,daeun:0,seojin:0}});
  env.click('end-day');assert.equal(env.snapshot().date,'2027-02-26');assert.equal(env.snapshot().scene.id,'ending-far');
  env.click('next');env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().scene.id,'ending-far');
  env.finishScene();assert.equal(env.snapshot().completed,true);assert.ok(env.snapshot().seen.includes('ending-far'));
  assert.equal(env.ids.get('modal-title').textContent,'한여울의 첫해를 마치며');
  env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().completed,true);assert.equal(env.snapshot().scene,null);
  assert.equal(env.ids.get('modal-title').textContent,'한여울의 첫해를 마치며');
});
test('An old January checkpoint continues into the new winter story and preserves the choice after reload', () => {
  let env = seed({ date: '2027-01-03', slot: 3, money: 234567 });
  env.click('end-day'); assert.equal(env.snapshot().date, '2027-01-04'); assert.equal(env.snapshot().scene.id, 'januaryStart');
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env.choose(1); env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.equal(env.snapshot().flags.januaryContact, true); assert.equal(env.snapshot().money, 234567);
  assert.ok(env.snapshot().seen.includes('januaryStart')); assert.equal(env.snapshot().slot, 1);
});
test('The prior checkpoint opens a winter chapter that remembers January and survives reload', () => {
  let env = seed({ date: '2027-01-17', slot: 3, flags: { januaryMusic: true } });
  env.click('end-day'); assert.equal(env.snapshot().scene.id, 'winterPlans');
  assert.ok(env.snapshot().scene.queue.some(line => line.text?.includes('의자를 끄는 소리')));
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env.choose(0); env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.equal(env.snapshot().flags.winterShowcaseMusic, true); assert.ok(env.snapshot().cards.includes('완성하지 않아도 되는 초대'));
  assert.equal(env.snapshot().date, '2027-01-18'); assert.equal(env.snapshot().slot, 1);
});
test('Lunar New Year morning occurs before skipping the holiday and respects the Chuseok history', () => {
  let env = seed({ date: '2027-02-05', slot: 3, flags: { chuseokHome: true } });
  env.click('end-day'); assert.equal(env.snapshot().scene.id, 'lunarNewYear');
  assert.ok(env.snapshot().scene.queue.some(line => line.text?.includes('직접 받아 온')));
  assert.ok(!env.snapshot().scene.queue.some(line => line.text?.includes('추석에도 서울')));
  env.finishScene(1); assert.ok(env.snapshot().flags.lunarAskedHome); assert.ok(env.snapshot().seen.includes('lunarNewYear'));
});
test('Winter vacation advances day by day from the old checkpoint to the new one', () => {
  const env = seed({ date: '2027-01-17', slot: 3 });
  for (let i = 0; i < 100 && env.snapshot().date < '2027-02-13'; i++) {
    if (env.snapshot().scene) env.finishScene();
    else env.click('end-day');
  }
  assert.equal(env.snapshot().date, '2027-02-13');
  assert.ok(env.snapshot().seen.includes('winterPlans')); assert.ok(env.snapshot().seen.includes('lunarNewYear'));
  assert.equal(env.snapshot().completed, false);
});
test('The old February checkpoint reaches the showcase and a performance choice survives reload once', () => {
  let env = seed({ date: '2027-02-07', slot: 3, flags: { winterShowcaseMusic: true, nariWinterOwnSong: true, lunarSharedPlans: true },
    seen: ['prologue','entrance','daeunMeet','fair','firstRadio','nariJanuary','nariFebruary'] });
  for (let i = 0; i < 50 && env.snapshot().date < '2027-02-13'; i++) {
    if (env.snapshot().scene) env.finishScene(); else env.click('end-day');
  }
  env.click('end-day'); assert.equal(env.snapshot().scene.id, 'winterShowcase');
  const text = env.snapshot().scene.queue.map(line => line.text || '').join(' ');
  assert.ok(text.includes('의자 소리')); assert.ok(text.includes('후렴 전까지')); assert.ok(text.includes('엄마에게'));
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env.choose(0); env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.ok(env.snapshot().flags.winterShowcasePerformed); assert.ok(env.snapshot().cards.includes('끝나지 않은 곡들의 밤'));
  assert.ok(env.snapshot().seen.includes('winterShowcase')); assert.equal(env.snapshot().slot, 3);
});
test('The showcase never invents an encounter with Nari or Daeun', () => {
  const env = seed({ date: '2027-02-13', slot: 1, met: [], seen: [], flags: {} });
  env.click('end-day'); assert.equal(env.snapshot().scene.id, 'winterShowcase');
  const text = JSON.stringify(env.snapshot().scene.queue);
  assert.ok(!text.includes('나리')); assert.ok(!text.includes('다은'));
  env.finishScene(1); assert.ok(env.snapshot().flags.winterShowcaseAttended); assert.ok(!env.snapshot().flags.winterShowcasePerformed);
});
test('The previous checkpoint starts Valentine and a partner moment resumes without repeated rewards', () => {
  const state = { date:'2027-02-13', slot:3, seen:['winterShowcase'], flags:{winterShowcasePerformed:true}, bond:{nari:20,daeun:20,seojin:60} };
  let env = seed(state);
  const saved = env.context.AquaState.restore(env.snapshot()); env.context.AquaRomance.answer(saved,'seojin','accept');
  env.saved.set(KEY,JSON.stringify(saved)); env = mount(env.saved); env.click('continue'); env.click('end-day');
  assert.equal(env.snapshot().scene.id,'winterValentine');
  assert.ok(env.snapshot().scene.queue.some(line=>line.text?.includes('여덟 마디')));
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  const choices=env.snapshot().scene.queue[env.snapshot().scene.index].choice;
  const index=choices.findIndex(item=>item.label.includes('서진'));
  assert.ok(choices[index].lines.some(line=>line.text?.includes('좋아하는 사람')));
  env.choose(index); const bond=env.snapshot().bond.seojin;
  env=mount(env.saved);env.click('continue');env.finishScene();
  assert.equal(env.snapshot().bond.seojin,bond);assert.ok(env.snapshot().flags.valentineSeojin);
  assert.equal(env.snapshot().romance.status.seojin,'lover');assert.ok(env.snapshot().seen.includes('winterValentine'));
});
test('Valentine permits solitude without introducing unknown heroines or suggesting a relationship', () => {
  const env=seed({date:'2027-02-13',slot:3,met:[],seen:['winterShowcase'],flags:{winterShowcaseAttended:true}});
  env.click('end-day');assert.equal(env.snapshot().scene.id,'winterValentine');
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');
  const choices=env.snapshot().scene.queue[env.snapshot().scene.index].choice;
  assert.equal(choices.length,1);assert.ok(choices[0].label.includes('혼자'));
  env.finishScene();assert.ok(env.snapshot().flags.valentineAlone);assert.deepEqual(env.snapshot().met,[]);
});
test('Three pending answers allow an honest Valentine conversation without inventing romantic consent', () => {
  let env=seed({date:'2027-02-13',slot:3,seen:['winterShowcase'],bond:{nari:80,daeun:80,seojin:80}});
  const state=env.context.AquaState.restore(env.snapshot());state.date='2026-12-20';
  for(const person of ['nari','daeun','seojin'])assert.ok(env.context.AquaRomance.answer(state,person,'pending'));
  state.date='2027-02-13';env.saved.set(KEY,JSON.stringify(state));env=mount(env.saved);env.click('continue');env.click('end-day');
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');
  const choices=env.snapshot().scene.queue[env.snapshot().scene.index].choice;
  const choice=choices.findIndex(item=>item.label.includes('세 사람에게 솔직하게'));assert.ok(choice>=0);
  env.choose(choice);env.finishScene();assert.ok(env.snapshot().flags.valentineFair);
  assert.deepEqual(Object.values(env.snapshot().romance.status),['pending','pending','pending']);
  assert.equal(env.context.AquaEndings.select(env.snapshot()),'fair');
});
test('The previous checkpoint reaches the last week without sending an unconfirmed letter', () => {
  const env=seed({date:'2027-02-14',slot:3,seen:['winterValentine'],flags:{winterShowcasePerformed:true}});
  for(let i=0;i<50&&env.snapshot().date<'2027-02-22';i++){
    if(env.snapshot().scene)env.finishScene();else env.click('end-day');
  }
  assert.equal(env.snapshot().scene.id,'lastWeek');
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');
  env.choose(0);env.finishScene();assert.ok(env.snapshot().flags.lastWeekWrite);assert.equal(env.snapshot().letters.length,0);
});
test('A final-week letter is read and heard once during the mandatory last broadcast across reload', () => {
  let env=seed({date:'2027-02-24',slot:3,flags:{nariWinterOwnSong:true},seen:['winterShowcase','winterValentine','lastWeek']});
  env.location('letter');env.click('letter-send');assert.equal(env.snapshot().letters.length,1);
  env.click('end-day');assert.equal(env.snapshot().date,'2027-02-25');env.click('end-day');
  assert.equal(env.snapshot().scene.id,'lastBroadcast');let state=env.snapshot();
  assert.equal(state.letters[0].read,true);assert.equal(state.letters[0].heard,false);
  assert.ok(state.scene.queue.some(line=>line.text?.includes('다 쓰지 못한 노래')));
  env=mount(env.saved);env.click('continue');env.finishScene();state=env.snapshot();
  assert.equal(state.letters[0].heard,true);assert.equal(state.radio.listened.filter(id=>id==='radio-2027-02-25').length,1);
  assert.ok(state.seen.includes('lastBroadcast'));assert.equal(state.completed,false);
  env.click('end-day');assert.equal(env.snapshot().date,'2027-02-26');assert.ok(env.snapshot().scene.id.startsWith('ending-'));
});
test('Seojin’s January encounter respects her application history and persists its choice once', () => {
  let env = seed({ date: '2027-01-06', slot: 1, bond: { nari: 12, daeun: 20, seojin: 50 }, flags: {} }, { scene: { cafe: 'seojinJanuary' } });
  env.location('cafe'); assert.equal(env.snapshot().scene.id, 'seojinJanuary');
  const text = env.snapshot().scene.queue.map(line => line.text || '').join(' ');
  assert.ok(text.includes('아직 지원한 건 아니야')); assert.ok(!text.includes('첫 수업 계획이야'));
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env.choose(0); const bond = env.snapshot().bond.seojin;
  env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.equal(env.snapshot().bond.seojin, bond); assert.ok(env.snapshot().flags.seojinJanuaryAsked);
  assert.ok(env.snapshot().cards.includes('수심 1m')); assert.ok(!env.snapshot().flags.seojinHired);
});
test('Nari’s follow-up requires the previous meeting and remembers the player’s actual choice', () => {
  let env = seed({ date: '2027-01-20', slot: 1, bond: { nari: 70, daeun: 20, seojin: 20 },
    flags: { nariJanuaryListened: true, winterShowcaseMusic: true },
    seen: ['prologue','entrance','daeunMeet','fair','firstRadio','nariJanuary'] }, { scene: { club: 'nariFebruary' } });
  env.location('club'); assert.equal(env.snapshot().scene.id, 'nariFebruary');
  const lines = env.snapshot().scene.queue.map(line => line.text || '').join(' ');
  assert.ok(lines.includes('질문 두 개')); assert.ok(lines.includes('후보라고 적은 곡'));
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env.choose(0); const bond = env.snapshot().bond.nari;
  env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.equal(env.snapshot().bond.nari, bond); assert.ok(env.snapshot().flags.nariWinterOwnSong);
  assert.ok(env.snapshot().cards.includes('두 번째 질문의 답'));
});
test('A June checkpoint save continues into the summer chapter without resetting the player', () => {
  let env = seed({ date: '2026-06-30', slot: 3, money: 234567 });
  env.click('end-day'); assert.equal(env.snapshot().date, '2026-07-01'); assert.equal(env.snapshot().scene.id, 'summerStart');
  env = mount(env.saved); env.click('continue'); env.finishScene(1);
  assert.equal(env.snapshot().flags.summerPeoplePlan, true); assert.equal(env.snapshot().slot, 1);
  assert.equal(env.snapshot().money, 234567); assert.ok(env.snapshot().seen.includes('summerStart'));
});
test('Pressing for the radio secret changes the next actual broadcast and the penalty survives reload once', () => {
  let env = seed({ date: '2026-08-12', slot: 2, bond: { nari: 50, daeun: 20, seojin: 20 },
    radio: { listened: ['radio-2026-04-02','radio-2026-04-09','radio-2026-04-16'], aired: {}, clues: { sameHabit: true }, anonymous: 10, honestCount: 0, hiatusUntil: null } }, { scene: { river: 'nariVoice' } });
  env.location('river'); assert.equal(env.snapshot().scene.id, 'nariVoice');
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  assert.equal(env.snapshot().flags.knowsLuna, true); env.choose(2);
  assert.equal(env.snapshot().bond.nari, 47); assert.equal(env.snapshot().radio.hiatusUntil, '2026-09-03');
  env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.equal(env.snapshot().bond.nari, 47); assert.ok(env.snapshot().seen.includes('nariVoice'));
  const future = env.snapshot(); future.date = '2026-09-03'; future.slot = 3;
  assert.equal(env.context.AquaRadio.air(future).rerun, true);
  future.date = '2026-09-10'; assert.equal(env.context.AquaRadio.air(future).rerun, false);
});
test('Respecting the private voice keeps the next broadcast live and does not manufacture a shared melody', () => {
  const env = seed({ date: '2026-08-12', slot: 2, bond: { nari: 50, daeun: 20, seojin: 20 },
    radio: { listened: ['radio-2026-04-02','radio-2026-04-09','radio-2026-04-16'], aired: {}, clues: { sameHabit: true }, anonymous: 10, honestCount: 0, hiatusUntil: null } }, { scene: { river: 'nariVoice' } });
  env.location('river'); assert.ok(!env.snapshot().scene.queue.some(line => line.text?.includes('내가 들려줬던')));
  env.finishScene(1); const state = env.snapshot();
  assert.equal(state.flags.lunaPrivacyKept, true); assert.equal(state.radio.hiatusUntil, null); assert.equal(state.bond.nari, 54);
  state.date='2026-09-03';state.slot=3;assert.equal(env.context.AquaRadio.air(state).rerun,false);
});
test('Exposing an anonymous letter changes the pool conversation instead of awarding the same intimacy', () => {
  const env = seed({ date: '2026-07-13', slot: 2, bond: { nari: 12, daeun: 20, seojin: 60 }, flags: { recognizedSeojinLetter: true } }, { scene: { river: 'seojinPool' } });
  env.location('river'); while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  assert.equal(env.ids.get('choices').children.length,2);env.choose(1);
  assert.equal(env.snapshot().flags.seojinLetterExposed,true);env.finishScene(0);
  assert.equal(env.snapshot().bond.seojin,60);assert.ok(env.snapshot().cards.includes('주차장이 된 수영장'));
  assert.ok(env.snapshot().history.some(line=>line.text.includes('들었다고 다 아는 건 아니야')));
  assert.ok(!env.snapshot().history.some(line=>line.text.includes('이모 말고는 네가 처음')));
});
test('Summer birthdays teach the calendar only when heard and never duplicate gifts or wages on reload', () => {
  for (const [person, date, slot, place, scene, card] of [
    ['daeun', '2026-07-28', 1, 'river', 'daeunBirthday', '초 하나'],
    ['seojin', '2026-08-19', 2, 'cafe', 'seojinBirthday', '사장님의 케이크']
  ]) {
    let env = seed({ date, slot }, { scene: { [place]: scene } });
    assert.ok(!env.snapshot().social.knownBirthdays[person]);
    const before = env.snapshot().money;
    env.location(place); assert.equal(env.snapshot().scene.id, scene);
    while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
    assert.equal(env.snapshot().social.knownBirthdays[person], true);
    env.choose(0); const bond = env.snapshot().bond[person];
    env = mount(env.saved); env.click('continue'); env.finishScene();
    assert.equal(env.snapshot().bond[person], bond);
    assert.equal(env.snapshot().money, before + (person === 'seojin' ? 32000 : 0));
    assert.equal(env.snapshot().cards.filter(value => value === card).length, 1);
    env = mount(env.saved); env.click('continue');
    assert.equal(env.snapshot().money, before + (person === 'seojin' ? 32000 : 0));
    assert.equal(env.snapshot().social.knownBirthdays[person], true);
  }
});
test('The last summer promise changes the following school scene and does not invite unknown characters', () => {
  let env=seed({date:'2026-08-31',slot:2}); assert.equal(env.snapshot().scene.id,'summerReturn');
  env.finishScene(1);assert.equal(env.snapshot().flags.summerPromiseDaeun,true);env.click('end-day');
  assert.equal(env.snapshot().scene.id,'autumnReturn');
  assert.ok(env.snapshot().scene.queue.some(line=>line.text?.includes('다은의 자리에')));
  assert.ok(!env.snapshot().scene.queue.some(line=>line.text?.includes('나리가 접힌 종이')));
  env=mount(env.saved);env.click('continue');env.finishScene();assert.equal(env.snapshot().flags.returnedForAutumn,true);
  const unknown=seed({date:'2026-08-31',slot:2,met:[]});
  while(!unknown.snapshot().scene.queue[unknown.snapshot().scene.index]?.choice)unknown.click('next');
  assert.equal(unknown.ids.get('choices').children.length,1);assert.ok(unknown.ids.get('choices').children[0].innerHTML.includes('내 이름'));
});
test('Nari’s career decision is recorded once and boundary choices suspend exactly three unprotected broadcasts', () => {
  let env = seed({ date: '2026-09-07', slot: 1, bond: { nari: 50, daeun: 20, seojin: 20 } }, { scene: { roof: 'nariCard' } });
  env.location('roof'); while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env.choose(0); assert.equal(env.snapshot().flags.knowsOffer, true); assert.equal(env.snapshot().flags.nariSelfChoice, 1);
  env = mount(env.saved); env.click('continue'); env.finishScene(); assert.equal(env.snapshot().flags.nariSelfChoice, 1);
  env = seed({ date: '2026-09-14', slot: 1, bond: { nari: 50, daeun: 20, seojin: 20 }, flags: { questionedRadio: true, boothPeeked: true } }, { scene: { class: 'nariAngry' } });
  env.location('class'); assert.ok(!env.snapshot().scene.queue.some(line => line.text?.includes('부스 커튼.')));
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  env.choose(1); assert.equal(env.snapshot().radio.hiatusUntil, '2026-10-01'); assert.equal(env.snapshot().bond.nari, 44);
  env = mount(env.saved); env.click('continue'); env.finishScene(); assert.equal(env.snapshot().bond.nari, 44);
  const future = env.snapshot();
  for (const date of ['2026-09-17', '2026-09-24', '2026-10-01', '2026-10-08']) {
    future.date = date; future.slot = 3;
    assert.equal(env.context.AquaRadio.air(future).rerun, date !== '2026-10-08');
  }
});
test('The closed radio booth reveals no portrait and respecting its curtain does not invent knowledge of Luna', () => {
  for (const choice of [0, 1]) {
    const env = seed({ date: '2026-09-10', slot: 1, club: 'radio', bond: { nari: 40, daeun: 20, seojin: 20 } }, { scene: { radio: 'nariStudio' } });
    env.location('radio'); assert.ok(env.snapshot().scene.queue.every(line => !line.cast?.length));
    env.finishScene(choice); assert.equal(!!env.snapshot().flags.knowsLuna, choice === 1);
    assert.equal(!!env.snapshot().flags.curtainKept, choice === 0);
    assert.equal(!!env.snapshot().radio.clues.boothVoice, choice === 0);
  }
});
test('Going home removes campus meetings and wages for three days, preserves the holiday radio and returns on Sunday', () => {
  let env = seed({ date: '2026-09-24', slot: 0 });
  assert.equal(env.snapshot().scene.id, 'chuseok'); const money = env.snapshot().money;
  env.finishScene(0); assert.equal(env.snapshot().flags.chuseokHome, true);
  assert.ok(env.ids.get('backdrop').dataset.path.endsWith('/campus-v2/bg-v2/home.png'));
  env = mount(env.saved); env.click('continue');
  for (let count = 0; count < 30 && env.snapshot().date < '2026-09-27'; count++) {
    const state = env.snapshot();
    if (state.scene) { env.finishScene(); continue; }
    assert.equal(env.context.AquaWorld.presentAt(state, 'cafe').length, 0);
    assert.deepEqual(Object.values(env.context.AquaEncounters.resolve(state).locations), [null, null, null]);
    if (state.slot === 3) {
      assert.ok(env.ids.get('backdrop').dataset.path.endsWith('/campus-v2/bg-v2/homeNight.png'));
      if (state.date === '2026-09-24') {
        const data = env.context.AquaRadio.build(state, env.context.AquaWorld.episodeOn(state.date));
        assert.ok(data.lines[0].text.includes('고향의 옛 방'));
      }
      env.click('end-day');
    } else {
      assert.deepEqual(env.ids.get('locations').children.map(button => button.dataset.location), ['room']);
      env.location('room'); env.click('activity-confirm');
    }
  }
  assert.equal(env.snapshot().date, '2026-09-27'); assert.equal(env.snapshot().scene.id, 'chuseokReturn');
  env.finishScene(); assert.ok(env.ids.get('locations').children.length > 1);
  assert.ok(env.ids.get('backdrop').dataset.path.endsWith('/campus-v2/bg-v2/campus-summer.png'));
  assert.equal(env.snapshot().money, money); assert.ok(!env.snapshot().workDays.includes('2026-09-25'));
  for (const id of ['chuseokMorning', 'chuseokPacking', 'chuseokReturn']) assert.ok(env.snapshot().seen.includes(id));
  const stayed = seed({ date: '2026-09-24', slot: 0 }); stayed.finishScene(1);
  assert.ok(!stayed.context.AquaAutumn.away(stayed.snapshot())); assert.ok(stayed.ids.get('locations').children.some(button => button.dataset.location === 'cafe'));
});
test('Campus artwork follows the season without changing a location preview’s time or itinerary', () => {
  for (const [date, file] of [['2026-04-07', 'campus-spring.png'], ['2026-07-14', 'campus-summer.png'], ['2026-10-06', 'campus-autumn.png'], ['2026-12-07', 'campus-winter.png']]) {
    const env = seed({ date, slot: 1 });
    assert.ok(env.ids.get('backdrop').dataset.path.endsWith('/campus-v2/bg-v2/' + file));
    const before = env.snapshot(); env.preview('library');
    assert.equal(env.snapshot().slot, before.slot); assert.deepEqual(env.snapshot().encounters, before.encounters);
    assert.ok(env.ids.get('backdrop').dataset.path.endsWith('/campus-v2/bg-v2/library.png'));
  }
});
test('The festival fulfills actual promises and only offers the drummer’s route after she joined the band', () => {
  let env = seed({ date: '2026-10-28', slot: 2, flags: { originalLyrics: true, frontRowPromise: true, backRowPromise: true, filmDaeunPromise: true, daeunJoinedBand: true } });
  assert.equal(env.snapshot().scene.id, 'autumnFestival');
  while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
  assert.equal(env.snapshot().flags.frontRowKept, true); assert.equal(env.snapshot().flags.backRowKept, true); assert.equal(env.snapshot().flags.filmedDaeun, true);
  assert.equal(env.ids.get('choices').children.length, 3); env.choose(1);
  env = mount(env.saved); env.click('continue'); env.finishScene();
  assert.equal(env.snapshot().flags.autumnWithDaeun, true); assert.ok(env.snapshot().seen.includes('autumnFestival'));
  assert.ok(env.snapshot().history.some(line => line.text.includes('약속했잖아. 손 흔든')));
  const state = env.snapshot(); state.date = '2026-10-29'; state.slot = 3;
  const broadcast = env.context.AquaRadio.build(state, env.context.AquaWorld.episodeOn(state.date));
  assert.ok(broadcast.lines.some(line => line.effect?.clue === 'festivalHoarseVoice'));
  const unknown = seed({ date: '2026-10-28', slot: 2, met: [], flags: {} });
  while (!unknown.snapshot().scene.queue[unknown.snapshot().scene.index]?.choice) unknown.click('next');
  assert.equal(unknown.ids.get('choices').children.length, 1);
});
test('Seojin’s own application follows reconciliation while an unresolved conversation retains a real choice to wait', () => {
  for (const reconciled of [false, true]) {
    const env = seed({ date: '2026-10-06', slot: 1, seen: ['seojinPool', 'seojinFight'], bond: { nari: 12, daeun: 20, seojin: 60 }, flags: { seojinReconciled: reconciled } }, { scene: { river: 'seojinDream' } });
    env.location('river');
    assert.equal(env.snapshot().scene.queue.some(line => line.text?.includes('내가 찾았어.')), reconciled);
    while (!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice) env.click('next');
    assert.equal(env.ids.get('choices').children.length, reconciled ? 3 : 2);
    env.choose(1); env.finishScene();
    assert.equal(!!env.snapshot().flags.seojinApplied, reconciled);
    assert.equal(!!env.snapshot().flags.seojinConsidering, !reconciled);
  }
});
test('Seojin’s actual confession persists accept, friend and pending answers without inventing a job application', () => {
  for (const [choice,status] of [[0,'lover'],[1,'friend'],[2,'pending']]) {
    let env=seed({date:'2026-11-25',slot:2,bond:{nari:12,daeun:20,seojin:65}});
    assert.equal(env.snapshot().scene.id,'seojinConfess'); assert.ok(!env.snapshot().scene.queue.some(line=>line.text?.includes('나 합격했어')));
    assert.ok(env.ids.get('backdrop').dataset.path.endsWith('/campus-v2/bg-v2/riverSnow.png'));
    assert.ok(env.context.AquaWardrobe.source(env.snapshot(),'seojin',env.snapshot().scene).endsWith('seojin-city-coat-v5.png'));
    while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');
    env.choose(choice); assert.equal(env.snapshot().romance.status.seojin,status);
    env=mount(env.saved);env.click('continue');env.finishScene();
    assert.equal(env.snapshot().romance.status.seojin,status); assert.equal(env.snapshot().romance.history.length,1);
    assert.ok(!env.snapshot().flags.seojinHired); assert.equal(env.snapshot().slot,3);
  }
});
test('The recording dawn charges class once and its protected night broadcast resumes without duplicate rewards', () => {
  let env=seed({date:'2026-11-19',slot:0,bond:{nari:50,daeun:20,seojin:20},flags:{knowsOffer:true},
    radio:{listened:['radio-2026-04-02'],aired:{},clues:{},anonymous:10,honestCount:0,hiatusUntil:'2026-12-17'}});
  assert.equal(env.snapshot().scene.id,'nariRecord'); const charged=env.snapshot().growth.knowledge;assert.ok(charged>0);assert.equal(env.snapshot().energy,95);
  env=mount(env.saved);env.click('continue');env.finishScene(0);assert.equal(env.snapshot().growth.knowledge,charged);assert.equal(env.snapshot().energy,95);
  env.click('end-day');assert.equal(env.snapshot().scene.id,'recordingNight');
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');
  const before=env.snapshot().bond.nari;env.choose(0);env=mount(env.saved);env.click('continue');env.finishScene();
  assert.equal(env.snapshot().bond.nari,before+3);assert.equal(env.snapshot().radio.aired['radio-2026-11-19'].rerun,false);
  assert.ok(env.snapshot().radio.listened.includes('radio-2026-11-19'));assert.equal(env.snapshot().slot,3);
  const replay=env.context.AquaRadio.build(env.snapshot(),env.context.AquaWorld.episodeOn('2026-11-19'),true);
  assert.ok(replay.lines.every(line=>!line.choice&&!line.effect));
});
test('Each winter confession reveals its own illustration only in the actual scene, and gallery filters preserve the saved moment', () => {
  for(const [date,person,id,art,flag] of [['2026-11-25','seojin','seojinConfess','seojinFirstSnow','sawSeojinFirstSnow'],['2026-12-18','daeun','daeunConfess','daeunTermEnd','sawDaeunTermEnd']]) {
    let env=seed({date,slot:2,bond:{nari:12,daeun:65,seojin:65}});
    assert.equal(env.snapshot().scene.id,id);assert.equal(env.snapshot().flags[flag],undefined);
    for(let i=0;i<30&&!env.snapshot().flags[flag];i++)env.click('next');
    assert.equal(env.snapshot().scene.illustration,art);assert.equal(env.ids.get('cast').children.length,0);
    const index=env.snapshot().scene.index;env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().scene.index,index);assert.equal(env.snapshot().scene.illustration,art);
    env.click('phone');dataButton(env,'app','album').click();assert.equal(env.ids.get('modal-content').querySelectorAll('[data-art]').length,1);
    dataButton(env,'album','nari').click();assert.equal(env.ids.get('modal-content').querySelectorAll('[data-art]').length,0);
    dataButton(env,'album',person).click();dataButton(env,'art',art).click();assert.equal(env.ids.get('modal').classList.contains('illustration-modal'),true);
    env.click('close');assert.equal(env.snapshot().scene.index,index);
  }
  const unknown=seed({date:'2026-12-18',slot:2,met:[],bond:{nari:0,daeun:0,seojin:0}});unknown.finishScene();
  assert.equal(unknown.snapshot().flags.sawDaeunTermEnd,undefined);
});
test('A second confession schedules consent, conditional consent or a real refusal according to the existing relationship', () => {
  for(const [bond,outcome] of [[85,'open'],[65,'trial'],[50,'single']]) {
    const prep=mount(),s=prep.context.AquaState.initial();s.met=['nari','daeun','seojin'];s.date='2026-11-25';
    prep.context.AquaRomance.answer(s,'seojin','accept');
    let env=seed({date:'2026-12-18',slot:2,romance:s.romance,bond:{nari:12,daeun:85,seojin:bond}});
    assert.equal(env.snapshot().scene.id,'daeunConfess');
    while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');env.choose(0);
    while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');env.choose(0);
    assert.equal(env.snapshot().romance.status.daeun,'proposed');env=mount(env.saved);env.click('continue');env.finishScene();
    env.click('end-day');env.click('end-day');assert.equal(env.snapshot().scene.id,'romanceTalk-2026-12-19');
    env.finishScene(0);const after=env.snapshot();
    assert.equal(after.romance.mode,outcome==='open'?'open':'single');
    assert.equal(after.romance.status.daeun,outcome==='open'?'lover':outcome==='trial'?'proposed':'friend');
    assert.equal(!!after.romance.trial,outcome==='trial');
    env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().romance.status.daeun,after.romance.status.daeun);
  }
});
test('The relationship notebook can schedule honest disclosure without granting consent on the button click', () => {
  const prep=mount(),s=prep.context.AquaState.initial();s.met=['nari','daeun','seojin'];s.date='2026-11-25';
  prep.context.AquaRomance.answer(s,'seojin','accept');s.date='2026-12-18';prep.context.AquaRomance.answer(s,'daeun','hide');
  const env=seed({date:s.date,slot:3,romance:s.romance,bond:{nari:12,daeun:85,seojin:85}});
  env.click('phone');env.ids.get('modal-content').children.find(button=>button.dataset.app==='notes').click();env.click('romance-disclose');
  assert.equal(env.snapshot().romance.mode,'hidden');assert.equal(env.snapshot().romance.talk.date,'2026-12-19');
  assert.ok(env.ids.get('modal-content').innerHTML.includes('함께 관계를 이야기하기로'));
  env.click('close');env.click('end-day');env.click('end-day');env.finishScene(0);assert.equal(env.snapshot().romance.mode,'open');
});
test('A witnessed hidden relationship reaches its actual clash scene and settling it stays on the same night', () => {
  const prep=mount(),s=prep.context.AquaState.initial();s.met=['nari','daeun','seojin'];s.date='2026-11-25';
  prep.context.AquaRomance.answer(s,'seojin','accept');s.date='2026-12-18';prep.context.AquaRomance.answer(s,'daeun','hide');
  prep.context.AquaRomance.witness(s,'daeun',['seojin']);
  let env=seed({date:s.date,slot:3,romance:s.romance,bond:{nari:12,daeun:85,seojin:85}});
  assert.equal(env.snapshot().scene.id,'romanceClash-2026-12-18');
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');env.choose(0);
  env=mount(env.saved);env.click('continue');env.finishScene();
  assert.equal(env.snapshot().date,'2026-12-18');assert.equal(env.snapshot().slot,3);assert.equal(env.snapshot().romance.mode,'single');
  assert.equal(env.snapshot().romance.clashes.length,1);assert.equal(env.snapshot().romance.status.seojin,'friend');assert.equal(env.snapshot().romance.status.daeun,'lover');
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


test('A heroine-specific event card reaches the matching conversation and is consumed once', () => {
  const env=seed({date:'2026-04-03',slot:1,smallEvents:{visited:Object.keys(mount().context.AquaSmallEvents.places),seen:['n01'],topic:'n01'}},{at:{nari:'roof'}});
  env.location('roof');dataButton(env,'person','nari').click();env.click('next');
  const card=env.ids.get('choices').children.findIndex(x=>x.innerHTML.includes('날아간 악보 이야기'));assert.ok(card>=0);env.choose(card);
  assert.equal(env.snapshot().smallEvents.topic,null);assert.ok(env.snapshot().scene.queue.some(line=>line.text==='그날 악보 모서리 아직 접혀 있어. 펴지 말까 생각 중이야.'));
  env.finishScene();assert.equal(env.snapshot().smallEvents.topic,null);
});
test('The location panel conceals people and previewing changes only scenery', () => {
  const env = seed({ date: '2026-04-03', slot: 1 }, { at: { nari: 'roof' } });
  const before = env.snapshot();
  const labels = env.ids.get('locations').children.map(b => b.innerHTML).join('');
  for (const hidden of ['한나리', '오다은', '백서진', '♪', '★']) assert.ok(!labels.includes(hidden));
  env.preview('roof'); assert.equal(env.ids.get('preview-title').textContent, '옥상 정원');
  assert.ok(env.ids.get('backdrop').dataset.path.endsWith('bg-v2/rooftop.png'));
  assert.equal(env.ids.get('modal').open, false); assert.deepEqual(env.snapshot(), before);
  assert.ok(!env.ids.get('preview-desc').textContent.includes('나리'));
  env.preview('cafe'); assert.equal(env.ids.get('preview-title').textContent, '강변 카페');
  assert.ok(env.ids.get('backdrop').dataset.path.endsWith('bg-v2/cafe.png')); assert.deepEqual(env.snapshot(), before);
  env.preview('roof'); env.click('visit-place'); if(env.snapshot().scene?.id.startsWith('approach-')) env.finishScene(); assert.equal(dataButton(env, 'person', 'nari').disabled, false);
});
test('Map conceals known and unknown people even when a cross scene is available', () => {
  const unknown=seed({date:'2026-04-03',slot:1,met:[]});const labels=unknown.ids.get('locations').children.map(b=>b.innerHTML).join('');
  assert.ok(!labels.includes('♪'));for(const name of ['한나리','오다은','백서진'])assert.ok(!labels.includes(name));
  const env=seed({date:'2026-05-27',slot:2,energy:100},{at:{nari:'cafe'},scene:{cafe:'crossRain'}});
  const cafe = env.ids.get('locations').children.find(b=>b.dataset.location==='cafe').innerHTML;
  for (const hidden of ['한나리', '오다은', '백서진', '♪', '★']) assert.ok(!cafe.includes(hidden));
});
test('A pending relationship event cannot reveal its character through a location preview', () => {
  const env = seed({ date: '2026-06-02', slot: 1, sensitivity: 0,
    bond: { nari: 44, daeun: 20, seojin: 20 },
    relationships: { pending: { nari: 'nariDemo' }, unlocked: [], chatGain: {}, decayWeeks: [], rewards: [] } },
    { at: { nari: 'studio' } });
  env.preview('studio');
  assert.equal(env.ids.get('preview-hint').hidden, true);
  assert.ok(!env.ids.get('preview-desc').textContent.includes('나리'));
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
  const memory = env.snapshot().scene.outing.memory; assert.ok(memory.includes('오다은'));
  env = mount(env.saved); env.click('continue'); env.finishScene();
  let state = env.snapshot(); assert.equal(state.slot, 3); assert.equal(state.date, '2026-04-03'); assert.equal(state.bond.daeun, 26);
  assert.equal(state.social.album.length, 1); assert.equal(state.social.album[0].memory, '마지막 곡 얘기를 나누자.');
  env = mount(env.saved); env.click('continue'); state = env.snapshot();
  assert.equal(state.money, 126000); assert.equal(state.energy, 85); assert.equal(state.bond.daeun, 26); assert.equal(state.social.album.length, 1);
  env.click('phone'); dataButton(env, 'app', 'album').click(); assert.ok(env.ids.get('modal-content').innerHTML.includes(state.social.album[0].memory));
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
test('Skip stops at unread lines and retains read history across saves', () => {
  const env = mount(); env.click('start'); env.click('begin'); env.click('intro-skip');
  const before=env.snapshot(); assert.equal(before.scene.index,0); env.click('skip'); assert.equal(env.snapshot().scene.index,0);
  env.click('next'); assert.equal(env.snapshot().scene.index,1); const saved=env.snapshot();
  assert.ok(Object.keys(saved.readLines).length); saved.scene.index=0;
  env.saved.set(KEY,JSON.stringify(saved)); const reloaded=mount(env.saved);reloaded.click('continue');reloaded.click('skip');
  assert.equal(reloaded.snapshot().scene.index,1);
});
test('Christmas meets Nari only after the player goes, preserves its illustration and chosen memory across saves, and never repeats affection', () => {
  let env=seed({date:'2026-12-24',slot:2,bond:{nari:82,daeun:20,seojin:20},knowledge:45,fitness:45,sensitivity:45,cards:['가사 없는 악보'],radio:{listened:[],aired:{},clues:{},anonymous:30,honestCount:0,hiatusUntil:null}});
  assert.equal(env.snapshot().scene.id,'holidayXmasDay');
  for(let i=0;i<100&&env.snapshot().scene?.id==='holidayXmasDay';i++){if(env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.choose(0);else env.click('next');}
  assert.equal(env.snapshot().scene.id,'holidayXmasNight');
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');
  assert.equal(env.snapshot().flags.sawNariChristmas,undefined);env.choose(0);env.click('next');
  let state=env.snapshot();assert.equal(state.flags.sawNariChristmas,true);assert.equal(state.scene.illustration,'nariChristmas');assert.equal(env.ids.get('cast').children.length,0);
  assert.equal(env.context.document.body.classList.contains('illustration-mode'),true);
  const at=state.scene.index,bond=state.bond.nari;
  env.click('scene-art');assert.equal(env.ids.get('modal').classList.contains('illustration-modal'),true);assert.ok(env.ids.get('modal-content').innerHTML.includes('nari-christmas-cg-v2.png'));
  env.click('close');assert.equal(env.snapshot().scene.index,at);assert.equal(env.snapshot().bond.nari,bond);
  env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().scene.illustration,'nariChristmas');
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');env.choose(0);
  state=env.snapshot();assert.equal(state.holidays.nariMemory,'가사 없는 악보');assert.ok(env.ids.get('line').textContent.includes('가사 없는 악보'));
  const recalledBond=state.bond.nari;env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().bond.nari,recalledBond);
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');env.choose(0);env.finishScene();
  state=env.snapshot();assert.equal(state.romance.status.nari,'lover');assert.equal(state.radio.listened.filter(id=>id===env.context.AquaWorld.episodeOn('2026-12-24').id).length,1);assert.equal(state.slot,3);
  assert.equal(env.context.document.body.classList.contains('illustration-mode'),false);
  env.click('phone');dataButton(env,'app','album').click();dataButton(env,'art','nariChristmas').click();
  assert.equal(env.ids.get('modal-title').textContent,'대본을 접은 밤');
  assert.equal(env.snapshot().date,'2026-12-24');assert.equal(env.snapshot().bond.nari,state.bond.nari);
});
test('Declining the riverside meeting leaves the illustration locked, including after listening to the archived Christmas broadcast', () => {
  const env=seed({date:'2026-12-24',slot:3,bond:{nari:82,daeun:20,seojin:20}});
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');env.choose(1);env.finishScene();
  assert.equal(env.snapshot().flags.sawNariChristmas,undefined);assert.equal(env.snapshot().holidays.nariOutcome,'missed');
  const replay=env.context.AquaRadio.build(env.snapshot(),env.context.AquaWorld.episodeOn('2026-12-24'),true);
  assert.equal(replay.lines.some(line=>line.illustration||line.effect?.flag==='sawNariChristmas'),false);
  env.click('phone');dataButton(env,'app','album').click();assert.equal(env.ids.get('modal-content').querySelectorAll('[data-art]').length,0);
});
test('A known holiday invitation can be answered from notes without spending a slot; the calendar records the promise while the map keeps people concealed', () => {
  const context=mount().context,h=context.AquaHolidays.initial();h.invites.nari={status:'considering',date:'2026-12-20',rewarded:false};
  const env=seed({date:'2026-12-20',slot:3,holidays:h});
  env.click('phone');dataButton(env,'app','notes').click();dataButton(env,'holidayReply','nari').click();
  assert.equal(env.snapshot().scene.after,'stay');env.finishScene();
  let state=env.snapshot();assert.equal(state.date,'2026-12-20');assert.equal(state.slot,3);assert.equal(state.holidays.invites.nari.status,'accepted');
  const bond=state.bond.nari;env.click('phone');dataButton(env,'app','calendar').click();
  assert.ok(env.ids.get('modal-content').innerHTML.includes('나리 · 방송 뒤'));env.click('close');
  env.click('phone');dataButton(env,'app','notes').click();dataButton(env,'holidayReply','nari').click();env.finishScene();
  assert.equal(env.snapshot().bond.nari,bond);assert.equal(env.snapshot().slot,3);
  assert.ok(!env.ids.get('locations').children.some(b=>/나리|다은|서진/.test(b.textContent+b.innerHTML)));
});
test('A school day starts with its authored chapter, charges class once across reload, and opens the full location panel in the afternoon', () => {
  let env=seed({date:'2026-03-09',slot:0},{at:{daeun:'class',nari:null}});
  let state=env.snapshot();assert.equal(state.scene.id,'school-2026-03-09');assert.equal(state.slot,0);assert.equal(state.energy,95);
  const growth=state.growth.knowledge;assert.ok(growth>0);assert.ok(state.scene.queue.some(line=>line.text?.includes('다은')));assert.ok(!state.scene.queue.some(line=>line.cast?.includes('nari')||line.cast?.includes('seojin')));
  env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().growth.knowledge,growth);assert.equal(env.snapshot().energy,95);
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');env.choose(1);env.finishScene();
  state=env.snapshot();assert.equal(state.flags.schoolSpringFocus,'rhythm');assert.equal(state.date,'2026-03-09');assert.equal(state.slot,1);assert.ok(state.seen.includes('school-2026-03-09'));
  assert.equal(env.ids.get('map-title').textContent,'수업이 끝나고, 어디로 갈까?');assert.ok(env.ids.get('locations').children.length>=9);
  const plan=JSON.stringify(state.encounters.plan);env.preview('river');assert.equal(env.snapshot().slot,1);assert.equal(JSON.stringify(env.snapshot().encounters.plan),plan);
  assert.ok(!env.ids.get('locations').children.some(b=>/나리|다은|서진/.test(b.innerHTML)));
});
test('After school, a quiet chosen location has its own story, costs exactly one slot, and the note returns in a later class', () => {
  const env=seed({date:'2026-03-09',slot:1,met:[],seen:['school-2026-03-09'],flags:{schoolSpringFocus:'melody'}},{smallAbsent:'room'});
  env.location('room');const before=env.snapshot();env.click('activity-confirm');
  let state=env.snapshot();assert.equal(state.scene.id,'small-school-outside-2026-03-09');assert.equal(state.slot,1);assert.equal(state.energy,Math.min(100,before.energy+30));
  assert.ok(state.scene.queue.every(line=>!line.cast?.length));
  while(!env.snapshot().scene.queue[env.snapshot().scene.index]?.choice)env.click('next');env.choose(0);env.finishScene();
  state=env.snapshot();assert.equal(state.slot,2);assert.equal(state.flags.schoolObservation,'room');assert.equal(state.cards.filter(card=>card==='강의실 밖의 첫 구절').length,1);
  assert.equal(env.context.AquaSchool.field(state,'river'),null);
  const next={...state,date:'2026-03-16',slot:0};const chapter=env.context.AquaSchool.build(next);assert.ok(chapter.lines.some(line=>line.text?.includes('전에 수업 뒤에 다녀온 내 방')));
});
test('Ending Sunday reaches the next school story, while holidays and vacations retain free mornings and reveal no unintroduced classmates', () => {
  const env=seed({date:'2026-03-08',slot:3,met:[]});env.click('end-day');assert.equal(env.snapshot().scene.id,'school-2026-03-09');
  assert.ok(env.snapshot().scene.queue.every(line=>!line.cast?.length));
  for(const date of ['2026-05-05','2026-07-13','2026-03-14']){
    const free=seed({date,slot:0,met:[]});assert.equal(free.snapshot().slot,0);assert.ok(!free.snapshot().scene?.id.startsWith('school-'));assert.equal(free.snapshot().energy,100);
  }
});
test('A balanced player reaches a real ending through 362 days using actual game handlers', () => {
  const env=mount();env.click('start');env.click('begin');env.click('intro-skip');
  const days=new Set(),actions=new Set(),activities=['library','river','club'];let iterations=0;
  while(iterations++<30000){const state=env.snapshot();days.add(state.date);
    if(state.completed&&!state.scene)break;
    if(state.scene){const line=state.scene.queue[state.scene.index];if(line?.choice){const index=env.ids.get('choices').children.findIndex(b=>!b.disabled);assert.ok(index>=0,`${state.date}: no available scene choice`);env.choose(index);}else env.click('next');continue;}
    if(env.ids.get('modal').open){const children=env.ids.get('modal-content').children;const find=id=>children.find(x=>x.id===id);
      const person=children.find(x=>x.dataset.person&&!x.disabled);
      if(person){person.click();continue;}
      const alone=find('alone');if(alone&&!alone.disabled){alone.click();continue;}
      const confirm=find('activity-confirm');if(confirm){confirm.click();continue;}
      const cancel=find('cancel-action')||find('activity-cancel');if(cancel){cancel.click();env.location('room');continue;}
      throw new Error(`Unhandled modal at ${state.date} slot ${state.slot}: ${env.ids.get('modal-title').textContent}`);
    }
    if(state.slot===3){env.click('end-day');continue;}
    const date=env.context.AquaWorld.dateObject(state.date),weekday=date.getUTCDay();
    const work=state.date>='2026-03-11'&&[3,6].includes(weekday)&&state.slot===2&&!state.workDays.includes(state.date)&&state.energy>=22;
    const place=env.context.AquaAutumn.away(state)||state.energy<22?'room':work?'cafe':activities[(date.getUTCDate()+state.slot)%3];actions.add(place);env.location(place);
  }
  assert.ok(iterations<30000,'Autoplay reached the end without stalling');assert.equal(days.size,362);for(const place of ['cafe','club','library','river'])assert.ok(actions.has(place));
  const final=env.snapshot();assert.equal(final.date,'2027-02-26');assert.equal(final.completed,true);assert.ok(final.endingId);assert.ok(final.seen.includes('festival'));assert.ok(final.workDays.length>0);
  for(const id of ['summerStart','summerPostcard','summerReturn','autumnReturn','chuseok','chuseokMorning','chuseokPacking','chuseokReturn','lunaLeakStart','lunaLeakExit','autumnFestival','holidayXmasDay','holidayXmasNight','newYearMorning','januaryStart','winterPlans','lunarNewYear','winterShowcase','winterValentine','lastWeek','lastBroadcast'])assert.ok(final.seen.includes(id), `Missing chapter transition ${id}`);
  assert.ok(final.seen.includes('recordingNight')); assert.ok(final.seen.includes('daeunConfess') || final.seen.includes('winterTermEnd'));
});
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
await fs.writeFile(new URL('qa/campus-v2/runtime-results.json', root), JSON.stringify({ date, passed: true, checks, runtime: 'Node VM + DOM adapter; real production game handlers; no browser layout or native file picker' }, null, 2) + '\n');
console.log(`${checks.length}/${checks.length} passed`);
