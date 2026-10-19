(() => {
  const E = LunaEngine, N = LunaStory, results = [];
  const assert = (value, message) => { if (!value) throw Error(message); };
  const test = (name, run) => { try { run(); results.push('PASS ' + name); } catch (e) { results.push('FAIL ' + name + ': ' + e.stack); } };
  const next = s => E.moveIntro(s, s.intro.step, 'next').state;
  test('New prologue saves and restores every page without spending resources', () => {
    let s = E.makeState({ intro: true });
    const baseline = E.makeState(); delete baseline.intro;
    for (let i = 0; i < N.intro.length; i++) {
      assert(E.introPending(s) && s.intro.step === i, 'wrong page');
      assert(E.storage.save(0, s), 'autosave failed');
      s = E.storage.load(0); assert(s.intro.step === i, 'resume failed');
      s = next(s);
    }
    assert(!E.introPending(s) && E.validate(s), 'completion invalid');
    const after = { ...s }; delete after.intro; after.savedAt = null;
    // Validation normalizes optional story records, so compare normalized base states.
    const expected = E.validate({ ...baseline, intro: null }); delete expected.intro;
    assert(JSON.stringify(after) === JSON.stringify(expected), 'intro changed gameplay');
    assert(!E.act(s, 'work', 'cafe').error, 'daily play did not unlock');
  });
  test('Previous, skip, stale clicks and completed callbacks are safe', () => {
    const start = E.makeState({ intro: true });
    assert(E.moveIntro(start, 0, 'previous').error, 'before first page');
    const first = next(start), snapshot = JSON.stringify(first);
    assert(E.moveIntro(first, 0, 'next').error, 'stale next accepted');
    assert(E.moveIntro(first, 1, 'fake').error, 'unknown action');
    assert(JSON.stringify(first) === snapshot && start.intro.step === 0, 'mutation');
    assert(E.moveIntro(first, 1, 'previous').state.intro.step === 0, 'back failed');
    const skipped = E.moveIntro(first, 1, 'skip').state;
    assert(!E.introPending(skipped) && E.validate(skipped), 'skip failed');
    assert(E.moveIntro(skipped, N.intro.length, 'next').error, 'completed callback accepted');
  });
  test('Pending prologue blocks daily actions, schedules and story starts', () => {
    const s = E.makeState({ intro: true });
    for (const [type,id] of [['work','cafe'],['date','walk'],['rest'],['nextDay'],['train','study'],['equipNeckAccessory','headset']]) assert(E.act(s,type,id).error, type + ' bypassed intro');
    assert(E.setSchedule(s, [{type:'rest',id:'rest'}]).error, 'schedule bypass');
    assert(E.startStory(s,'hello').error, 'story bypass');
  });
  test('Legacy and progressed saves continue without a surprise prologue', () => {
    let s = E.act(E.makeState(),'work','cafe').state; delete s.intro;
    const loaded = E.validate(s);
    assert(loaded && loaded.intro === null && !E.introPending(loaded), 'legacy replay');
    assert(loaded.money === s.money && loaded.journal.length === 1, 'legacy data changed');
    // Saves from the longer 9-page prologue: finished ones stay finished, mid-way ones jump to day one.
    for (const step of [N.intro.length + 1, 9]) {
      const old = E.validate({ ...E.makeState({ intro: true }), intro: { step } });
      assert(old && old.intro.step === N.intro.length && !E.introPending(old), 'old prologue save rejected');
    }
  });
  test('Corrupt progress and contradictory active sessions are rejected', () => {
    const s = E.makeState({ intro: true });
    for (const intro of [{step:-1},{step:Math.max(N.intro.length,9)+1},{step:0.5},{step:'0'},[],{},false]) assert(!E.validate({...s,intro}), 'invalid progress accepted');
    const progressed = E.act(E.makeState(),'work','cafe').state;
    assert(!E.validate({...progressed,intro:{step:0}}), 'progressed save accepted pending intro');
    const story = E.startStory(E.makeState(),'hello').state;
    assert(!E.validate({...story,intro:{step:0}}), 'simultaneous story accepted');
  });
  document.body.dataset.status = results.some(r => r.startsWith('FAIL')) ? 'failed' : 'passed';
  document.getElementById('results').textContent = results.join('\n') + `\n${results.filter(r=>r.startsWith('PASS')).length}/${results.length} passed`;
})();
