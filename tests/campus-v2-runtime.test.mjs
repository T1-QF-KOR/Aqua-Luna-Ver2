// Runs the actual game.js handlers in a small DOM adapter. This checks gameplay
// integration and persistence; it does not substitute for browser visual QA.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
const sources = await Promise.all(['world', 'encounters', 'wardrobe', 'moods', 'radioEpisodes', 'radio', 'relationships', 'romance', 'economy', 'social', 'dialogue', 'dialogue-compat', 'messages', 'composition', 'dateActivities', 'outings', 'peopleEvents', 'smallEvents', 'state', 'scenes', 'semester', 'school', 'summer', 'autumn', 'winter', 'holidays', 'endings', 'audio', 'game'].map(async name => [name, await fs.readFile(new URL(`src/campus-v2/${name}.js`, root), 'utf8')]));
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
    querySelector(selector) { return selector === '.modal-shell' ? (this.shell ||= { scrollTop: 0, clientHeight: 300, scrollHeight: 900 }) : null; }
    click() { if (!this.disabled) this.onclick?.({ stopPropagation() {} }); }
    focus() { document.activeElement = this; }
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
  const key = (value, focusedControl = false) => {
    let prevented = false;
    listeners.get('keydown')({key:value,repeat:false,preventDefault(){prevented = true;},
      target:{closest(selector){return focusedControl && selector.includes('button, a') ? {} : null;}}});
    return prevented;
  };
  const wheel = deltaY => listeners.get('wheel')({ deltaY });
  return { context, document, ids, saved, click, snapshot, preview, location, choose, finishScene, runTimer, hasTimer, visibility, key, wheel };
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

test('Manual saves protect occupied and unreadable slots until overwrite is confirmed', () => {
  const env = seed({ date: '2026-04-06', slot: 1 });
  const first = `${KEY}-slot-1`, broken = `${KEY}-slot-2`;
  env.click('save');
  dataButton(env, 'save', '1').click();
  const original = env.saved.get(first);
  assert.ok(original, 'empty slot saves immediately');
  env.saved.set(broken, '{unreadable');
  dataButton(env, 'save', '1').click();
  assert.equal(env.saved.get(first), original);
  assert.ok(env.ids.get('modal-content').innerHTML.includes('이 슬롯을 덮어쓸까요?'));
  assert.equal(env.document.activeElement, dataButton(env, 'cancel-save', '1'));
  dataButton(env, 'cancel-save', '1').click();
  assert.equal(env.saved.get(first), original);
  dataButton(env, 'save', '2').click();
  assert.equal(env.saved.get(broken), '{unreadable');
  dataButton(env, 'confirm-save', '2').click();
  assert.equal(JSON.parse(env.saved.get(broken)).date, '2026-04-06');
  dataButton(env, 'save', '1').click();
  dataButton(env, 'confirm-save', '1').click();
  assert.equal(JSON.parse(env.saved.get(first)).date, '2026-04-06');
});
test('Starting a new game preserves existing autosaves until explicitly confirmed', () => {
  const source = mount(), existing = source.context.AquaState.initial('기존', '별명');
  existing.date = '2026-06-10'; existing.slot = 2;
  const original = JSON.stringify(existing), saved = new Map([[KEY, original], [`${KEY}-slot-1`, original]]);
  const env = mount(saved); env.click('start'); env.ids.get('player-name').value = '새 이름';
  env.click('begin');
  assert.equal(env.saved.get(KEY), original); assert.equal(env.ids.get('new-game-confirm').hidden, false);
  assert.equal(env.document.activeElement, env.ids.get('new-game-cancel'));
  env.click('new-game-cancel'); assert.equal(env.saved.get(KEY), original);
  assert.equal(env.ids.get('player-name').value, '새 이름');
  env.click('begin'); env.click('new-game-proceed');
  assert.equal(env.snapshot().name, '새 이름'); assert.equal(env.snapshot().scene.id, 'intro');
  assert.equal(env.saved.get(`${KEY}-slot-1`), original);
  const damaged = mount(new Map([[KEY, '{broken']])); damaged.click('start'); damaged.click('begin');
  assert.equal(damaged.saved.get(KEY), '{broken'); assert.equal(damaged.ids.get('new-game-confirm').hidden, false);
});

test('Soundtrack attribution opens from settings and returns without changing progress', () => {
  const env=seed({date:'2026-04-06',slot:1});const before=env.snapshot();
  env.click('settings');env.click('music-credits');
  assert.equal(env.ids.get('modal-title').textContent,'음악 출처');
  assert.ok(env.ids.get('modal-content').innerHTML.includes('Tanner Helland'));
  assert.ok(env.ids.get('modal-content').innerHTML.includes('creativecommons.org/licenses/by/4.0'));
  env.click('credits-back');assert.equal(env.ids.get('modal-title').textContent,'읽기와 연출');
  assert.equal(env.snapshot().date,before.date);assert.equal(env.snapshot().slot,before.slot);
});
test('The in-game guide explains the daily loop and returns without changing progress', () => {
  const env = seed({ date:'2026-04-06', slot:1 }); const before = env.snapshot();
  env.click('settings'); env.click('game-guide');
  assert.equal(env.ids.get('modal-title').textContent, '한여울에서 보내는 하루');
  assert.ok(env.ids.get('modal-content').innerHTML.includes('방문하기 전에는 만날 사람을 표시하지 않습니다'));
  env.click('guide-back'); assert.equal(env.ids.get('modal-title').textContent, '읽기와 연출');
  assert.deepEqual(env.snapshot(), before);
});
test('Voice volume appears only with a registered voice and persists independently of music', () => {
  const env=seed({date:'2026-04-06',slot:1});
  env.click('settings');assert.equal(env.ids.has('voice-volume'),false);
  env.context.AquaAudio.voiceTracks.sample='assets/audio/voice/sample.ogg';env.click('settings');
  const control=env.ids.get('voice-volume');assert.ok(control);control.value='25';env.ids.get('bgm-volume').value='35';
  let voiceVolume;env.context.AquaAudio.setVoiceVolume=value=>{voiceVolume=value;};env.click('apply-settings');
  const prefs=JSON.parse(env.saved.get(`${KEY}-prefs`));assert.equal(prefs.voiceVolume,.25);assert.equal(prefs.bgmVolume,.35);assert.equal(voiceVolume,.25);
  env.click('settings');assert.equal(env.ids.get('voice-volume').value,'25');
});
test('The dialogue window opacity setting persists and reopens selected', () => {
  const env=seed({date:'2026-04-06',slot:1});
  env.click('settings');assert.equal(env.ids.get('window-alpha').value,'0.93');
  env.ids.get('window-alpha').value='0.62';env.click('apply-settings');
  assert.equal(JSON.parse(env.saved.get(`${KEY}-prefs`)).windowAlpha,.62);
  env.click('settings');assert.equal(env.ids.get('window-alpha').value,'0.62');
});
test('Keyboard interaction unlocks soundtrack without requiring a mouse', () => {
  const env=seed({date:'2026-04-06',slot:1});let unlocks=0;
  env.context.AquaAudio.unlock=()=>{unlocks++;};env.context.AquaAudio.play=()=>{};
  env.key('Tab');env.key('Tab');assert.equal(unlocks,1);
});
test('The mouse wheel acts once per gesture: reads on, opens the backlog at its latest line, and closes it only by a fresh flick at the bottom', () => {
  const setup = mount(), state = setup.context.AquaState.initial('테스트', '물고기');
  state.date = '2026-04-06'; state.slot = 1;
  state.scene = { id:'wheel-check', title:'휠', background:'campus', time:1, after:'event', index:0,
    queue:[{text:'첫 문장'}, {text:'다음 문장'}, {text:'셋째 문장'}, {text:'마지막 문장'}, {text:'남은 문장'}], applied:[], logged:[] };
  const env = mount(new Map([[KEY, JSON.stringify(state)]])); env.click('continue');
  let now = 10000; env.context.Date = class extends Date { static now() { return now; } };
  const modal = env.ids.get('modal'), shell = modal.querySelector('.modal-shell'), index = () => env.snapshot().scene.index;
  env.wheel(1); assert.equal(index(), 1);
  now += 100; env.wheel(1); assert.equal(index(), 1, 'one gesture advances once');
  now += 500; env.wheel(-1); assert.equal(modal.open, true); assert.equal(env.ids.get('modal-title').textContent, '대사 기록');
  assert.equal(shell.scrollTop, shell.scrollHeight); assert.match(env.ids.get('modal-content').innerHTML, /첫 문장/);
  now += 100; env.wheel(1); assert.equal(modal.open, true, 'momentum from the opening gesture keeps the backlog');
  shell.scrollTop = 0; now += 500; env.wheel(1); assert.equal(modal.open, true, 'scrolling above the bottom keeps the backlog');
  shell.scrollTop = 600; now += 500; env.wheel(1); assert.equal(modal.open, false); assert.equal(index(), 1);
  now += 500; env.wheel(1); assert.equal(index(), 2);
  for (let i = 0; i < 16; i++) { now += i ? 50 : 500; env.wheel(7); }
  assert.equal(index(), 3, 'a long continuous scroll is one gesture');
});
test('Lines read and options picked in an earlier run can be skipped and are marked in a new run', () => {
  const fresh = () => { const setup = mount(), state = setup.context.AquaState.initial('테스트', '물고기');
    state.date = '2026-04-06'; state.slot = 1;
    state.scene = { id:'replay-check', title:'다시', background:'campus', time:1, after:'event', index:0,
      queue:[{text:'첫 문장'}, {text:'둘째 문장'}, {choice:[{label:'솔직하게 말한다'}, {label:'웃어넘긴다'}]}, {text:'끝 문장'}], applied:[], logged:[] };
    return JSON.stringify(state); };
  const first = mount(new Map([[KEY, fresh()]])); first.click('continue'); first.click('next'); first.click('next'); first.choose(0);
  const read = first.saved.get(`${KEY}-read`); assert.ok(read);
  const control = mount(new Map([[KEY, fresh()]])); control.click('continue'); control.click('skip'); assert.equal(control.snapshot().scene.index, 0, 'a first run stops at unread lines');
  const second = mount(new Map([[KEY, fresh()], [`${KEY}-read`, read]])); second.click('continue');
  assert.deepEqual(second.snapshot().readLines || {}, {}, 'the new save starts without its own read marks');
  second.click('skip'); assert.equal(second.snapshot().scene.index, 2, 'lines read in any run are skipped');
  const options = second.ids.get('choices').children;
  assert.equal(options[0].classList.contains('picked'), true); assert.match(options[0].innerHTML, /picked-mark/);
  assert.equal(options[1].classList.contains('picked'), false);
});
test('Enter and Space activate focused controls without advancing the scene globally', () => {
  const setup = mount(), state = setup.context.AquaState.initial('테스트', '물고기');
  state.date = '2026-04-06'; state.slot = 1;
  state.scene = { id:'keyboard-check', title:'키보드', background:'campus', time:1, after:'event', index:0,
    queue:[{text:'첫 문장'}, {text:'다음 문장'}], applied:[], logged:[] };
  const env = mount(new Map([[KEY, JSON.stringify(state)]])); env.click('continue');
  for (const input of ['Enter', ' ']) {
    assert.equal(env.key(input, true), false, 'native control activation must not be cancelled');
    assert.equal(env.snapshot().scene.index, 0, 'focused control must not advance dialogue');
  }
  assert.equal(env.key('Enter'), true);
  assert.equal(env.snapshot().scene.index, 1, 'dialogue shortcut remains available outside controls');
});
test('Registered voice follows the displayed line and automatic reading waits until it finishes', () => {
  const setup=mount(),state=setup.context.AquaState.initial('테스트','물고기');
  state.date='2026-04-06';state.slot=1;state.met=['nari'];state.bond.nari=30;
  state.scene={id:'nariShake',title:'떨리는 손',background:'practice',time:1,after:'event',index:0,
    queue:[{speaker:'나리',text:'아, 너구나. 다행이다. 다른 사람이면 숨었을 거야.',cast:['nari'],voiceId:'test-cue'},
      {text:'나리는 손을 폈다.',cast:['nari']}],applied:[],logged:[],lastCast:[]};
  assert.ok(setup.context.AquaState.restore(structuredClone(state)));
  const env=mount(new Map([[KEY,JSON.stringify(state)]])),instances=[];
  env.context.Audio=class { constructor(url){this.url=url;instances.push(this);} play(){this.paused=false;this.plays=(this.plays||0)+1;return Promise.resolve();} pause(){this.paused=true;} };
  env.context.AquaAudio.voiceTracks['test-cue']='assets/audio/voice/test-cue.ogg';
  env.context.AquaAudio.unlock();env.click('continue');
  const voice=instances.find(item=>item.url.endsWith('/test-cue.ogg'));assert.ok(voice);
  env.click('auto');assert.equal(env.hasTimer(2500),false,'automatic reading must wait for voice');
  env.click('settings');assert.ok(voice.paused,'opening a menu pauses the current voice');
  env.visibility(true);env.click('close');assert.ok(voice.paused,'closing a menu in the background must not resume voice');
  assert.equal(env.hasTimer(2500),false);env.visibility(false);assert.equal(voice.paused,false);assert.equal(voice.plays,2);
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
test('F5 keeps one quick save and F9 restores it after confirmation without touching the six slots', () => {
  const env = seed({ date: '2026-04-07', slot: 1, met: [] });
  assert.equal(env.key('F9'), true); assert.equal(env.ids.get('modal').open, false, 'no quick save yet');
  assert.equal(env.key('F5'), true); const quick = JSON.parse(env.saved.get(`${KEY}-quick`)); assert.equal(quick.slot, 1); assert.ok(quick.savedAt);
  env.location('library'); env.click('activity-confirm'); if (env.snapshot().scene) env.finishScene(1); assert.equal(env.snapshot().slot, 2);
  assert.equal(env.key('F9'), true); env.click('load-confirm'); assert.equal(env.snapshot().slot, 1); assert.equal(env.snapshot().energy, 100);
  env.click('save'); assert.equal(env.ids.get('modal-content').querySelectorAll('[data-load]').find(b => b.dataset.load === 'quick').disabled, false);
  assert.ok([1, 2, 3, 4, 5, 6].every(i => !env.saved.has(`${KEY}-slot-${i}`)));
  assert.equal(env.key('F5'), false, 'F5 does nothing while a window is open');
});
test('Canceling a paid activity keeps resources unchanged; manual slots restore a prior time and resources', () => {
  const env = seed({ date: '2026-04-07', slot: 1, met: [] });
  env.location('library'); env.click('activity-cancel'); assert.equal(env.snapshot().energy, 100);
  env.click('save'); env.ids.get('modal-content').querySelectorAll('[data-save]')[0].click(); env.click('close');
  env.location('library'); env.click('activity-confirm'); if(env.snapshot().scene) env.finishScene(1); assert.equal(env.snapshot().energy, 88); assert.equal(env.snapshot().slot, 2);
  env.click('save'); env.ids.get('modal-content').querySelectorAll('[data-load]').find(b=>b.dataset.load==='1').click();
  assert.equal(env.snapshot().slot, 2); assert.equal(env.document.activeElement, env.ids.get('load-cancel'));
  env.click('load-cancel'); assert.equal(env.snapshot().slot, 2);
  env.ids.get('modal-content').querySelectorAll('[data-load]').find(b=>b.dataset.load==='1').click(); env.click('load-confirm');
  assert.equal(env.snapshot().slot, 1); assert.equal(env.snapshot().energy, 100); assert.equal(env.snapshot().knowledge, 20);
});
{
  const env = seed({ date:'2026-04-07', slot:2 }), oldAuto = env.saved.get(KEY);
  const imported = env.context.AquaState.initial('파일', '별명'); imported.date = '2026-04-08'; imported.slot = 1;
  const file = { size:100, text:async () => JSON.stringify(imported) };
  const pick = async () => { const input = env.ids.get('save-file'); await input.onchange({target:{files:[file],value:'chosen'}}); };
  env.click('save'); await pick(); assert.equal(env.saved.get(KEY), oldAuto);
  env.click('load-cancel'); assert.equal(env.saved.get(KEY), oldAuto);
  await pick(); env.click('load-confirm'); assert.equal(env.snapshot().name, '파일'); assert.equal(env.snapshot().date, '2026-04-08');
  console.log('PASS Imported save waits for confirmation and cancellation preserves the current autosave');
}
test('The last broadcast proceeds into an ending that stays complete after reload', () => {
  let env=seed({date:'2027-02-25',slot:3,seen:['lastBroadcast'],met:[],bond:{nari:0,daeun:0,seojin:0}});
  env.click('end-day');assert.equal(env.snapshot().date,'2027-02-26');assert.equal(env.snapshot().scene.id,'ending-far');
  env.click('next');env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().scene.id,'ending-far');
  env.finishScene();assert.equal(env.snapshot().completed,true);assert.ok(env.snapshot().seen.includes('ending-far'));
  const roll=env.ids.get('game').children.at(-1);assert.equal(roll.className,'end-roll');assert.match(roll.innerHTML,/테스트/);
  assert.equal(env.ids.get('modal').open,false,'the credits roll before the closing screen');assert.equal(env.snapshot().flags.endRoll,true);
  assert.equal(env.key('Enter'),true);assert.equal(env.ids.get('modal-title').textContent,'한여울의 첫해를 마치며');
  assert.equal(env.key('Enter'),false,'a finished roll no longer takes keys');
  env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().completed,true);assert.equal(env.snapshot().scene,null);
  assert.equal(env.ids.get('modal-title').textContent,'한여울의 첫해를 마치며');
  env.click('ending-album');assert.equal(env.ids.get('modal-title').textContent,'함께 보낸 날들');
  env.click('album-ending-back');assert.equal(env.ids.get('modal-title').textContent,'한여울의 첫해를 마치며');
  const before=env.snapshot();env.click('ending-replay');assert.equal(env.snapshot().scene.id,'ending-far');
  env=mount(env.saved);env.click('continue');assert.equal(env.snapshot().scene.id,'ending-far');env.finishScene();
  const after=env.snapshot();assert.equal(after.completed,true);assert.deepEqual(after.bond,before.bond);
  assert.deepEqual(after.flags,before.flags);assert.deepEqual(after.cards,before.cards);assert.equal(after.seen.filter(id=>id==='ending-far').length,1);
  assert.equal(env.ids.get('modal-title').textContent,'한여울의 첫해를 마치며');
});
test('Seen endings accumulate in a gallery that survives new games and replays without touching the autosave', () => {
  const GALLERY=`${KEY}-endings`, title=env=>env.ids.get('modal-title').textContent;
  const cards=env=>env.ids.get('modal-content').querySelectorAll('[data-ending]').map(b=>b.dataset.ending);
  let env=seed({date:'2027-02-25',slot:3,seen:['lastBroadcast'],met:[],bond:{nari:0,daeun:0,seojin:0}});
  env.click('end-day');env.finishScene();env.key('Escape');assert.deepEqual(Object.keys(JSON.parse(env.saved.get(GALLERY))),['far']);
  env.click('ending-gallery');assert.equal(title(env),'추억 갤러리');assert.deepEqual(cards(env),['far']);
  assert.ok(env.ids.get('modal-content').innerHTML.includes('1 / 16'));assert.ok(env.ids.get('modal-content').innerHTML.includes('아직 보지 못한 결말'));
  env.click('gallery-ending-back');assert.equal(title(env),'한여울의 첫해를 마치며');
  env.click('close');assert.match(env.ids.get('build-note').textContent,/결말 1 \/ 16/);
  assert.match(env.ids.get('continue').innerHTML,/2월 26일.*결말을 본 기록/);
  const book=env.saved.get(GALLERY);
  env=seed({date:'2027-02-25',slot:3,seen:['lastBroadcast'],met:['nari'],bond:{nari:30,daeun:0,seojin:0}});env.saved.set(GALLERY,book);
  env.click('end-day');const second=env.snapshot().endingId;assert.notEqual(second,'far');env.finishScene();
  assert.deepEqual(Object.keys(JSON.parse(env.saved.get(GALLERY))).sort(),['far',second].sort(),'the ending is kept as soon as the credits start');env.key('Escape');
  env.click('ending-title');env.click('start');env.click('begin');env.click('new-game-proceed');assert.equal(env.snapshot().scene.id,'intro');
  env.click('home');const autosave=env.saved.get(KEY);
  env=mount(env.saved);env.click('gallery');assert.deepEqual(cards(env).sort(),['far',second].sort());
  dataButton(env,'ending','far').click();assert.equal(env.ids.get('modal').open,false);assert.equal(env.ids.get('scene').hidden,false);
  env.click('save');assert.equal(env.ids.get('modal').open,false);
  for(let i=0;i<100&&!env.ids.get('modal').open;i++)env.click('next');
  assert.equal(title(env),'추억 갤러리');assert.equal(env.saved.get(KEY),autosave);
  env.click('close');assert.equal(env.ids.get('modal').open,false);assert.equal(env.ids.get('title').hidden,false);
  env.click('continue');assert.equal(env.snapshot().scene.id,'intro');assert.equal(env.snapshot().completed,false);
});
test('The room shows daylight until night, when the moonlit window returns', () => {
  const env=seed({date:'2026-07-01',slot:0,seen:['prologue','entrance','daeunMeet','fair','seojinMeet','firstRadio','common-exam','festival','common-party','common-vacation']});
  assert.equal(env.snapshot().scene.id,'summerStart');assert.match(env.ids.get('backdrop').dataset.path,/bg-v2\/roomDay\.png$/);
  const night=mount();night.click('start');night.click('begin');night.click('intro-skip');
  assert.match(night.ids.get('backdrop').dataset.path,/bg-v2\/roomDay\.png$/,'Moving-in day starts in daylight');
  for(let i=0;i<20&&!night.ids.get('line').textContent.startsWith('밤.');i++)night.click('next');
  assert.match(night.ids.get('backdrop').dataset.path,/bg-v2\/room\.png$/,'The prologue night returns to the moonlit room');
  const winter=seed({date:'2027-01-04',slot:0,seen:['prologue','entrance','daeunMeet','fair','seojinMeet','firstRadio','common-exam','festival','common-party','common-vacation','summerStart','summerPostcard','summerReturn','autumnReturn','chuseok','lunaLeakStart','lunaLeakExit','autumnFestival','holidayXmasDay','holidayXmasNight','newYearMorning']});
  assert.equal(winter.snapshot().scene.id,'januaryStart');assert.match(winter.ids.get('backdrop').dataset.path,/bg-v2\/roomDayWinter\.png$/,'Winter mornings show a winter window');
});
test('H hides the reading window without advancing, and the next key only brings it back', () => {
  const env=seed({date:'2026-03-05',slot:1,seen:['prologue','entrance'],met:[]});const index=env.snapshot().scene.index;
  assert.equal(env.key('h'),false);assert.ok(env.document.body.classList.contains('ui-hidden'));
  assert.equal(env.key('Enter'),true);assert.ok(!env.document.body.classList.contains('ui-hidden'));assert.equal(env.snapshot().scene.index,index);
  env.key('Enter');assert.equal(env.snapshot().scene.index,index+1);
});
test('An earned illustration stays in the gallery after starting over and opens from the title', () => {
  const setup=mount(),state=setup.context.AquaState.initial('예전');state.date='2026-12-26';state.flags.sawNariChristmas=true;
  let env=mount(new Map([[KEY,JSON.stringify(state)]]));env.click('continue');assert.deepEqual(JSON.parse(env.saved.get(`${KEY}-art`)),['nariChristmas']);
  env.click('home');env.click('start');env.click('begin');env.click('new-game-proceed');env.click('home');
  env=mount(env.saved);env.click('gallery');assert.equal(env.ids.get('modal-title').textContent,'추억 갤러리');
  assert.ok(env.ids.get('modal-content').innerHTML.includes('1 / 3'));dataButton(env,'gallery-art','nariChristmas').click();
  assert.ok(env.ids.get('modal-content').innerHTML.includes('대본을 접은 밤'));env.click('gallery-art-back');assert.equal(env.ids.get('modal-title').textContent,'추억 갤러리');
});
test('A save finished before the gallery existed registers its ending when continued', () => {
  const setup=mount(),state=setup.context.AquaState.initial('예전');state.date='2027-02-26';state.completed=true;state.endingId='solo';
  const env=mount(new Map([[KEY,JSON.stringify(state)]]));env.click('continue');
  const entry=JSON.parse(env.saved.get(`${KEY}-endings`)).solo;assert.equal(entry.name,'예전');assert.equal(entry.data.id,'solo');
});
test('A story moment seen once replays from the gallery with every choice open and leaves the autosave alone', () => {
  const env = seed({ date: '2026-05-20', slot: 1 });
  env.click('end-day'); assert.equal(env.snapshot().scene.id, 'festival');
  const book = JSON.parse(env.saved.get(`${KEY}-scenes`)); assert.ok(book.festival.data.lines.length); assert.equal(book.festival.name, '테스트');
  env.finishScene(1); env.click('home'); const autosave = env.saved.get(KEY);
  env.click('gallery'); assert.match(env.ids.get('modal-content').innerHTML, /명장면 <span>1 \/ 17/);
  dataButton(env, 'memory', 'festival').click(); assert.equal(env.ids.get('modal').open, false); assert.equal(env.ids.get('scene').hidden, false);
  assert.ok(env.document.body.classList.contains('gallery-replay')); assert.match(env.ids.get('scene-label').textContent, /^다시 보기/);
  let choices = 0;
  for (let i = 0; i < 200 && !env.ids.get('modal').open; i++) {
    if (!env.ids.get('choices').hidden) { choices++; assert.ok(env.ids.get('choices').children.every(b => !b.disabled)); env.choose(0); } else env.click('next');
  }
  assert.ok(choices > 0); assert.equal(env.ids.get('modal-title').textContent, '추억 갤러리'); assert.ok(!env.document.body.classList.contains('gallery-replay')); assert.equal(env.saved.get(KEY), autosave);
  assert.equal(Object.keys(JSON.parse(env.saved.get(`${KEY}-scenes`))).length, 1, 'a replay does not record itself again');
});
test('Completed game opens an earned illustration and returns through its album', () => {
  const setup=mount(),state=setup.context.AquaState.initial();state.date='2027-02-26';state.slot=0;
  state.met=['nari'];state.flags.sawNariChristmas=true;state.completed=true;state.endingId='solo';
  assert.ok(setup.context.AquaState.restore(structuredClone(state)));
  const env=mount(new Map([[KEY,JSON.stringify(state)]]));env.click('continue');env.click('ending-album');
  dataButton(env,'art','nariChristmas').click();assert.equal(env.ids.get('modal-title').textContent,'대본을 접은 밤');
  env.click('illustration-album-back');assert.equal(env.ids.get('modal-title').textContent,'함께 보낸 날들');
  env.click('close');assert.equal(env.ids.get('modal-title').textContent,'한여울의 첫해를 마치며');
  assert.equal(env.snapshot().completed,true);
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
  assert.ok(text.includes('아직 지원한 건 아니야')); assert.ok(!text.includes('다음 수업 계획이야'));
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
  assert.ok(env.ids.get('preview-cost').textContent.includes('기본 활동: 알바하기 · 시간 1칸'));
  assert.ok(env.ids.get('preview-cost').textContent.includes('방문 후 상황에 따라 다른 선택이 열릴 수 있어요.'));
  for (const hidden of ['한나리', '오다은', '백서진']) assert.ok(!env.ids.get('preview-cost').textContent.includes(hidden));
  env.preview('roof'); env.click('visit-place'); if(env.snapshot().scene?.id.startsWith('approach-')) env.finishScene(); assert.equal(dataButton(env, 'person', 'nari').disabled, false);
});
test('Unavailable basic work does not imply the cafe itself is closed to visitors', () => {
  const env = seed({ date: '2026-04-06', slot: 1 });
  const before = env.snapshot();
  env.preview('cafe');
  assert.ok(env.ids.get('preview-cost').textContent.includes('기본 활동 안내: 수·금·토에 근무할 수 있어요'));
  assert.ok(!env.ids.get('visit-place').disabled);
  assert.deepEqual(env.snapshot(), before);
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
test('An autumn invitation can be accepted through the phone and fulfilled the next day', () => {
  const env=seed({date:'2026-10-09',slot:3,met:['daeun'],bond:{nari:0,daeun:40,seojin:0}});
  const invite=env.snapshot().messages.appointments.find(item=>item.status==='offered');
  assert.equal(invite.date,'2026-10-10'); assert.equal(invite.place,'river');
  env.click('phone');dataButton(env,'app','calendar').click();
  assert.ok(!env.ids.get('modal-content').innerHTML.includes('다은 · 한강변 산책 · 오후 약속'));
  env.click('close');
  env.click('phone');dataButton(env,'app','messages').click();dataButton(env,'reply',`${invite.id}:accept`).click();
  assert.equal(env.snapshot().messages.appointments.find(item=>item.id===invite.id).status,'accepted');
  env.click('close');env.click('phone');dataButton(env,'app','calendar').click();
  assert.ok(env.ids.get('modal-content').innerHTML.includes('다은 · 한강변 산책 · 오후 약속'));
  env.click('close');env.click('end-day');
  assert.equal(env.snapshot().date,'2026-10-10');assert.equal(env.snapshot().slot,0);
  env.location('room');env.click('activity-confirm');if(env.snapshot().scene)env.finishScene();
  assert.equal(env.snapshot().slot,1);env.preview('river');env.click('visit-place');
  assert.equal(env.snapshot().scene.id,`appointment-${invite.id}`);
  env.finishScene();
  assert.equal(env.snapshot().slot,3);assert.equal(env.snapshot().messages.appointments.find(item=>item.id===invite.id).status,'done');
  assert.equal(env.snapshot().social.album.filter(item=>item.appointmentId===invite.id).length,1);
  env.click('phone');dataButton(env,'app','calendar').click();
  assert.ok(env.ids.get('modal-content').innerHTML.includes('다은 · 한강변 산책 · 오후 완료'));
});
test('Message dates occupy the afternoon and sunset; old conflicting appointments still reach the mandatory event', () => {
  for (const [date, expectedScene, expectedSlot, legacy] of [
    ['2026-04-07', null, 3, false], ['2026-05-20', 'festival', 2, false], ['2026-10-10', null, 3, false],
    ['2026-04-07', null, 3, true], ['2026-05-20', 'festival', 2, true]
  ]) {
    const base = seed({date, slot:1, met:['daeun'], bond:{nari:0,daeun:40,seojin:0}});
    const state = base.snapshot();
    state.messages.appointments.push({id:'test-invite',person:'daeun',date,slot:1,place:'river',status:'accepted',paid:true});
    const env = mount(new Map([[KEY, JSON.stringify(state)]])); env.click('continue');
    env.preview('river'); env.click('visit-place');
    assert.equal(env.snapshot().scene.id, 'appointment-test-invite');
    const saved=env.snapshot(); if(legacy) saved.scene.after='activity';
    const reload=mount(new Map([[KEY,JSON.stringify(saved)]])); reload.click('continue');
    for(let i=0;i<60 && reload.snapshot().scene?.id==='appointment-test-invite';i++) {
      if(reload.snapshot().scene.queue[reload.snapshot().scene.index]?.choice) reload.choose(); else reload.click('next');
    }
    assert.equal(reload.snapshot().slot, expectedSlot);
    assert.equal(reload.snapshot().scene?.id || null, expectedScene);
    assert.equal(reload.snapshot().messages.appointments.find(a=>a.id==='test-invite').status,'done');
    assert.equal(reload.snapshot().social.album.filter(a=>a.appointmentId==='test-invite').length,1);
  }
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
test('Daeun’s introduction switches expression in place and restores it after reload', () => {
  let env = seed({ date: '2026-03-05', slot: 1, seen: ['prologue', 'entrance'], met: [] });
  assert.equal(env.snapshot().scene.id, 'daeunMeet');
  assert.equal(env.snapshot().scene.background, 'classroom', 'The afternoon orientation uses a daytime campus setting');
  const portrait = env.ids.get('cast').children[0];
  assert.equal(portrait.dataset.outfit, 'assets/heroines/daeun-campus-v7.png');
  env.click('next');
  assert.equal(env.ids.get('cast').children[0], portrait, 'Expression does not replay the entry animation');
  assert.equal(portrait.dataset.outfit, 'assets/heroines/daeun-campus-happy-v8.png');
  env = mount(env.saved); env.click('continue');
  assert.equal(env.ids.get('cast').children[0].dataset.outfit, 'assets/heroines/daeun-campus-happy-v8.png');
  env.click('next');
  assert.equal(env.ids.get('cast').children[0].dataset.outfit, 'assets/heroines/daeun-campus-happy-v8.png', 'An untagged cheerful line takes its face from the mood table');
  env.click('next');
  assert.equal(env.ids.get('cast').children[0].dataset.outfit, 'assets/heroines/daeun-campus-v7.png', 'Narration returns to the base face');
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
