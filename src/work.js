/* Cosmetic work vignettes. The engine has already committed each job exactly once. */
(() => {
  'use strict';
  const sprite = 'assets/characters/sulien-sd-work.png';
  const scenes = {
    cafe: { label: '한 잔씩, 따뜻하게', steps: ['주문을 확인해요', '커피를 내리고 있어요', '완성된 음료를 건네요'], prop: '<rect x="170" y="54" width="112" height="100" rx="10" fill="#4d7370"/><rect x="181" y="65" width="90" height="44" rx="5" fill="#253e43"/><circle cx="249" cy="83" r="7" fill="#e9ca91"/><path d="M200 110v16m36-16v16" stroke="#d6e2d9" stroke-width="8"/><rect x="183" y="150" width="90" height="8" rx="4" fill="#aac6b9"/><g class="work-steam" stroke="#e9ead5" fill="none" stroke-width="3"><path d="M148 101q-8-9 0-18t0-18"/><path d="M162 104q-8-9 0-18t0-18"/></g><path d="M133 111h42l-5 35h-32Z" fill="#f4e5c8"/><path d="M174 117h6a10 10 0 0 1 0 20h-8" fill="none" stroke="#f4e5c8" stroke-width="5"/><ellipse cx="154" cy="112" rx="20" ry="4" fill="#926948"/><rect x="18" y="158" width="282" height="12" rx="5" fill="#c7ab84"/><path d="M30 170v45m260-45v45" stroke="#8a7460" stroke-width="10"/>' },
    edit: { label: '장면을 잇는 오후', steps: ['필요한 장면을 골라요', '자막과 음악을 맞춰요', '완성된 영상을 내보내요'], prop: '<rect x="145" y="52" width="139" height="99" rx="8" fill="#40566d"/><rect x="154" y="61" width="121" height="80" rx="3" fill="#142d40"/><rect x="162" y="68" width="58" height="35" rx="3" fill="#52788b"/><path d="m185 77 13 9-13 9Z" fill="#d3e7df"/><path d="M228 72h38m-38 10h27m-27 10h32" stroke="#8cabc2" stroke-width="3"/><g fill="#b3c7e1"><rect x="163" y="111" width="29" height="7" rx="2"/><rect x="196" y="111" width="52" height="7" rx="2"/></g><path d="M163 126h100" stroke="#ba9fc8" stroke-width="6"/><path class="work-playhead" d="M173 107v26" stroke="#e6cf8e" stroke-width="2"/><path d="M211 151v11m-23 0h47" stroke="#738da2" stroke-width="7"/><path d="M145 170h116l13 15H135Z" fill="#b1c0c4"/><rect x="18" y="186" width="282" height="10" rx="5" fill="#a9bbc6"/><path d="M32 196v24m254-24v24" stroke="#627c92" stroke-width="9"/>' },
    event: { label: '분주한 무대 뒤편', steps: ['안내 표지판을 세워요', '필요한 물품을 정리해요', '행사장을 마지막으로 점검해요'], prop: '<path d="M12 21q140 50 290 0" stroke="#bca4a4" fill="none" stroke-width="2"/><g fill="#d6a5a3"><path d="m31 27 17 4-11 20Z"/><path d="m104 40 17 2-9 20Z"/><path d="m183 41 17-2-7 22Z"/><path d="m254 32 17-4-4 23Z"/></g><path d="M248 94v118m-21 0h42" stroke="#a6bdb9" stroke-width="6"/><rect x="207" y="58" width="81" height="49" rx="7" fill="#d9c299"/><path d="M224 82h43m-12-11 12 11-12 11" stroke="#665f64" stroke-width="5" fill="none"/><g class="work-box"><rect x="162" y="144" width="75" height="65" rx="5" fill="#bb997a"/><path d="M191 144v65" stroke="#e7cba2" stroke-width="13"/><path d="M172 187h12m-12 9h18" stroke="#806a59" stroke-width="3"/></g><rect x="236" y="176" width="57" height="39" rx="4" fill="#cca689"/><path d="M264 176v39" stroke="#eed0a5" stroke-width="9"/>' }
  };
  const node = (tag, className, text) => { const n = document.createElement(tag); if (className) n.className = className; if (text !== undefined) n.textContent = text; return n; };
  function build(body, jobs, { reduceMotion, onDone, doneLabel = '일상으로 돌아가기' }) {
    const deck = jobs.filter(j => scenes[j.id]);
    if (!deck.length) return () => {};
    let timer, disposed = false, step = 0, done = false;
    const section = node('section', 'work-vignette'); section.dataset.workJob = deck[0].id;
    const eyebrow = node('small', 'work-eyebrow', 'SD 수련의 작업 노트');
    const title = node('h3', 'work-title'), subtitle = node('p', 'work-subtitle');
    const stage = node('div', 'work-diorama'); stage.setAttribute('aria-hidden', 'true');
    stage.append(node('div', 'work-floor'));
    const character = node('img', 'work-sulien'); character.src = sprite; character.alt = ''; character.draggable = false;
    character.addEventListener('error', () => { character.hidden = true; stage.classList.add('work-art-unavailable'); });
    stage.append(character);
    const props = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); props.setAttribute('viewBox', '0 0 320 230'); props.classList.add('work-props'); stage.append(props);
    const sparkle = node('span', 'work-sparkle', '✦'); stage.append(sparkle);
    const caption = node('p', 'work-caption'); caption.setAttribute('role', 'status');
    const steps = node('ol', 'work-steps');
    const progress = node('progress', 'work-progress'); progress.max = deck.length * 3; progress.value = 0; progress.setAttribute('aria-label', '작업 연출 진행');
    const reward = node('div', 'work-reward'); reward.hidden = true;
    const amount = deck.reduce((sum,j) => sum + j.pay, 0);
    reward.append(node('small', '', '오늘의 노력'), node('strong', '', `+${amount.toLocaleString('ko-KR')}원`), node('p', '', deck.map(j => j.name).join(' · ') + ' 완료'));
    const control = node('button', 'secondary work-continue', '결과 바로 보기'); control.type = 'button';
    section.append(eyebrow, title, subtitle, stage, caption, steps, progress, reward, control); body.append(section);
    function show(index) {
      const job = deck[Math.floor(index / 3)], scene = scenes[job.id], phase = index % 3;
      section.dataset.workJob = job.id;
      title.textContent = scene.label;
      subtitle.textContent = `${job.name}${deck.length > 1 ? ` · ${Math.floor(index / 3) + 1}/${deck.length}` : ''}`;
      // These SVG fragments are authored locally above, never sourced from saves or user input.
      props.innerHTML = scene.prop;
      caption.textContent = scene.steps[phase];
      steps.replaceChildren(...scene.steps.map((text,i) => { const li=node('li', i < phase ? 'done' : i === phase ? 'current' : '', text); if(i === phase) li.setAttribute('aria-current','step'); return li; }));
      progress.value = index + 1;
    }
    function finish() {
      if (disposed || done) return;
      clearTimeout(timer); done = true; section.classList.add('finished');
      show(deck.length * 3 - 1); caption.textContent = '오늘도 수고했어요!';
      steps.querySelectorAll('li').forEach(li => { li.className='done'; li.removeAttribute('aria-current'); });
      reward.hidden = false; control.textContent = doneLabel; control.className = 'primary work-continue';
    }
    function tick() { if(disposed) return; if(++step >= deck.length * 3) finish(); else { show(step); timer=setTimeout(tick,1100); } }
    control.addEventListener('click', () => { if (done) onDone(); else finish(); });
    show(0);
    if (reduceMotion) finish(); else timer = setTimeout(tick,1100);
    return () => { disposed=true; clearTimeout(timer); };
  }
  window.LunaWork = { build, sprite };
})();
