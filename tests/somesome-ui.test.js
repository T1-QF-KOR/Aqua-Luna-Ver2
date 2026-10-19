(async () => {
  // On-screen checks for the systems adapted from the 「썸썸 편의점」 study.
  const frame = document.getElementById('app');
  if (!frame.contentWindow.LunaEngine || frame.contentDocument.readyState !== 'complete') await new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
  let w, d, E, N, D;
  const results = [], errors = [];
  const bind = () => { w = frame.contentWindow; d = frame.contentDocument; E = w.LunaEngine; N = w.LunaStory; D = w.LunaData; w.addEventListener('error', e => errors.push(e.message)); };
  bind();
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const assert = (ok, text) => { if (!ok) throw new Error(text); };
  const $ = id => d.getElementById(id), click = id => { assert($(id), 'Missing ' + id); $(id).click(); };
  const modalButton = text => { const b = [...$('modal-body').querySelectorAll('button')].find(b => b.textContent.includes(text)); assert(b && !b.disabled, `Missing or disabled modal button: ${text}`); b.click(); };
  const read = () => E.storage.load(0);
  const reload = async () => { await new Promise(resolve => { frame.addEventListener('load', resolve, { once: true }); w.location.reload(); }); bind(); };
  const key = k => d.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true }));
  const finish = s => { while (s.story.active) { const a = s.story.active, c = N.script(a.kind, a.id)[a.choices.length].choices.find(c => !E.choiceReason(s, c)); s = E.chooseStory(s, c.id, a.choices.length).state; } return s; };
  const startFrom = async s => { w.localStorage.clear(); w.localStorage.setItem('aqualuna.v2.prefs', JSON.stringify({ reduceMotion: true })); assert(E.storage.save(0, s), 'seed save'); await reload(); click('continue-game'); await wait(50); };
  try {
    // 1. New game+: the title announces the bonus and the intro hands it over.
    w.localStorage.clear(); w.localStorage.setItem('aqualuna.v2.legacy', JSON.stringify({ endings: ['lovers', 'friends'] }));
    await reload();
    assert(d.querySelector('.chapter-preview').textContent.includes('회차 보너스 준비 · 연인 결말 · 우정 결말'), 'title shows the head start');
    click('new-game'); click('intro-skip'); await wait(50);
    assert(read().money === 130000 && Object.values(read().growth.stats).every(v => v === 6) && $('toast').textContent.includes('지난 회차의 선물'), 'bonus applied after the intro');
    results.push('PASS new game+ notice on title, bonus after the intro');

    // 2. Relationship note: her heart in four steps.
    w.localStorage.removeItem('aqualuna.v2.legacy'); click('home-button'); click('new-game'); if ($('modal').open) modalButton('새로 시작'); click('intro-skip'); await wait(50);
    assert(read().money === 80000 && read().ngp === null, 'plain new game');
    click('bond-button');
    const steps = [...d.querySelectorAll('.heart-steps li')];
    assert(steps.length === 4 && steps[0].classList.contains('now') && steps.map(li => li.textContent).join() === '편한 친구,신경 쓰이는 사이,썸,고백 직전', 'four steps, first is now');
    assert($('modal-body').querySelector('.heart-note').textContent.includes('편한 친구'), 'heart note');
    click('close-modal'); results.push('PASS heart stage meter in the relationship note');

    // 3. Settings: auto speed and dialogue box opacity.
    click('settings'); assert($('auto-speed') && $('box-alpha'), 'new settings');
    $('auto-speed').value = 'fast'; $('auto-speed').dispatchEvent(new w.Event('change', { bubbles: true }));
    $('box-alpha').value = 60; $('box-alpha').dispatchEvent(new w.Event('input', { bubbles: true }));
    assert(d.documentElement.style.getPropertyValue('--vn-box').includes('0.6'), 'box opacity applied');
    assert(E.storage.read('prefs').autoSpeed === 'fast' && E.storage.read('prefs').boxAlpha === 60, 'prefs saved');
    click('close-modal'); results.push('PASS auto speed and dialogue opacity settings');

    // 4. Quick save / quick load.
    key('F5'); assert(E.storage.load('quick')?.money === 80000 && $('toast').textContent.includes('빠른 저장'), 'F5 saves');
    click('work-button'); modalButton('+75,000'); modalButton('일 시작하기'); assert(read().money === 155000, 'worked');
    key('F9'); await wait(50); assert(read().money === 80000 && $('toast').textContent.includes('빠른 저장을 불러왔어요'), 'F9 restores');
    click('load-button'); assert($('modal-body').textContent.includes('빠른 저장 (F5)'), 'quick slot listed'); click('close-modal');
    results.push('PASS F5 quick save, F9 quick load, quick slot in the load list');

    // 5. Run the whole schedule in one click.
    click('schedule-button');
    ['공부하기', '운동하기', '잠깐 쉬기'].forEach(t => { const b = [...$('modal-body').querySelectorAll('.growth-options button')].find(b => b.textContent.startsWith(t)); assert(b && !b.disabled, 'reserve ' + t); b.click(); });
    const all = $('modal-body').querySelector('[data-schedule-all]'); assert(all && !all.disabled && all.textContent.includes('3개'), 'run-all button');
    all.click(); await wait(50);
    assert(!$('modal').open && read().ap === 0 && !read().growth.schedule.length && $('toast').textContent.includes('일정 3개'), 'all three ran');
    results.push('PASS run-all schedule');

    // 6. Monday morning settlement card (day 8), reopened from the journal.
    for (let i = 0; i < 7; i++) { if ($('modal').open) click('close-modal'); click('next-day'); if ($('modal').open && $('modal-title').textContent === '하루 마무리') modalButton('다음 날로'); }
    assert(read().day === 8 && $('modal').open && $('modal-title').textContent === '지난 한 주의 결산', 'settlement opens on Monday');
    assert(d.querySelectorAll('.week-tile').length === 8 && $('modal-body').querySelector('.week-friend').textContent.startsWith('하윤'), 'tiles and friend comment');
    assert($('modal').scrollWidth <= $('modal').clientWidth + 1 && $('modal').getBoundingClientRect().bottom <= w.innerHeight + 1, 'card fits the screen');
    modalButton('이번 주도 시작하기'); assert(!$('modal').open, 'closes');
    click('journal-button'); modalButton('지난주 결산 다시 보기'); assert($('modal-title').textContent === '지난 한 주의 결산', 'reopen from journal'); click('close-modal');
    results.push('PASS weekly settlement card and journal recall');

    // 7. Sulien drops by at work: the main stage shows her line.
    let s = finish(E.startStory(E.makeState(), 'hello').state), enc = null;
    for (let i = 0; i < 10 && !enc; i++) { enc = E.act(s, 'work', 'cafe').result?.encounter; if (!enc) s = E.act(s, 'nextDay').state; }
    assert(enc, 'found a drop-in day');
    await startFrom(s);
    click('work-button'); modalButton('+45,000'); modalButton('일 시작하기');
    assert($('speaker').textContent === '수련' && $('message-title').textContent === enc.title && $('message-text').textContent === enc.line, 'drop-in shown on stage');
    assert(read().story.workMet === read().day, 'saved');
    results.push('PASS work drop-in scene on the main stage');

    // 8. Messenger: after replying, she sends a sticker.
    s = finish(E.startStory(E.makeState(), 'hello').state); s = finish(E.act(s, 'date', 'walk').state); s = E.act(s, 'nextDay').state;
    assert(s.story.message?.key === 'walk', 'walk message pending');
    await startFrom(s);
    click('phone-button'); d.querySelector('[data-phone-app="messages"]').click(); d.querySelector('[data-thread="sulien"]').click(); await wait(50);
    const reply = d.querySelector('[data-message-reply="a"]'); assert(reply, 'reply button'); reply.click(); await wait(50);
    const sticker = d.querySelector('#phone-thread .phone-sticker'); assert(sticker && sticker.textContent.includes('🌙') && sticker.getAttribute('aria-label').includes('이모티콘'), 'sticker after reply');
    results.push('PASS messenger sticker after a reply');

    assert(errors.length === 0, errors.join('\n'));
    results.push(`PASS ${w.innerWidth}px runtime without errors`);
    w.localStorage.clear();
    document.body.dataset.status = 'passed';
  } catch (e) { results.push('FAIL ' + e.stack); document.body.dataset.status = 'failed'; }
  document.getElementById('results').textContent = results.join('\n');
})();
