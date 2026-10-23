// Refresh the four approved everyday scripts from the playable source.
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),context={};context.window=context;vm.createContext(context);
for(const name of ['data','story','courses','journeys'])vm.runInContext(await fs.readFile(new URL(`src/${name}.js`,root),'utf8'),context);
const D=context.LunaData,N=context.LunaStory;
const lines=rows=>rows.map(([who,text])=>who?`**${who}**: ${text}`:text).join('\n\n');
const effects=c=>Object.entries(c).filter(([k])=>!['id','label','say','react','reply'].includes(k)).map(([k,v])=>`${k}: ${v}`).join(' · ')||'추가 효과 없음';
function script(nodes){return nodes.map((n,i)=>`### 장면 ${i+1}\n\n${n.lines?lines(n.lines):n.text}\n\n${n.choices.map(c=>`- **${c.id} · ${c.label}**\n\n${c.say?`  나: ${c.say}\n\n`:''}  ${c.react?lines(c.react).replaceAll('\n\n','\n\n  '):c.reply}\n\n  기록·효과: ${effects(c)}`).join('\n\n')}`).join('\n\n');}
let base='# 기본 데이트 · 실행 대본\n\n2026-10-23 · 통학·학식·알바·데이트 적용본. [시나리오 목차](README.md) · [적용 전후 보고서](../../reports/CAMPUS_LIFE_APPLIED_2026-10-23.md)\n\n금액은 게임 내 가상 가격이며 두 사람 합계다. 선택 ID를 유지해 기존 저장을 이어 간다. 수치 효과는 기본 보상에 더해진다. 말투 전면 개편은 별도 검토안이며 현재 실행본의 관계 단계별 말투 규칙을 유지한다.\n';
for(const id of ['walk','cafe','concert','lunch']){const d=D.dates.find(d=>d.id===id);base+=`\n## ${d.name} · \`${id}\`\n\n${d.description}\n\n비용 ${d.cost.toLocaleString('ko-KR')}원 · 시간 ${d.ap}칸 · 기력 ${d.energy} · 기본 호감 +${d.affection} / 신뢰 +${d.trust}\n\n${script(N.dates[id])}\n`;}
await fs.writeFile(new URL('GDD/시나리오/02_기본_데이트.md',root),base);
let life='# 통학·학식·알바 생활 장면 · 실행 대본\n\n2026-10-23 · 이번에 승인된 네 가지 생활 요소만 반영한 실행본. [기본 데이트 4종](02_기본_데이트.md) · [적용 전후 보고서](../../reports/CAMPUS_LIFE_APPLIED_2026-10-23.md)\n\n## 도입부\n\n';
for(const n of N.intro.slice(3))life+=`### ${n.title}\n\n${lines(n.lines)}\n\n`;
for(const id of ['hello','space','invite','epilogue']){const e=N.events.find(e=>e.id===id);life+=`## ${e.title} · \`${id}\`\n\n${script(e.nodes)}\n\n`;}
life+='## 근무 중 짧은 안부\n\n교대·휴식에 방해되지 않는 짧은 인사 또는 메시지다. 영상 편집 외주는 원격 메시지로 연출한다. 존댓말 / 기존 말 놓기 이후 반말을 함께 적는다.\n\n';
for(const [id,rows] of Object.entries(N.workScenes)){life+=`### ${D.jobs.find(j=>j.id===id).name}\n\n`;for(const r of rows)life+=`**${r.title}**\n\n- 수련: ${r.line[0]}\n- 말 놓기 이후: ${r.line[1]}\n\n`;}
life+='## 학식 다음 날 메시지\n\n';for(const pair of N.messages.lunch.lines)life+=`- 수련: ${pair[0]} / ${pair[1]}\n`;for(const r of N.messages.lunch.replies)life+=`\n- 답장 ${r.id}: ${r.say[0]} / ${r.say[1]}\n- 응답: ${r.back[0]} / ${r.back[1]}\n`;
await fs.writeFile(new URL('GDD/시나리오/13_대학생_생활_대사.md',root),life);
// Replace only the four changed chapters in the older collected script.
const mainUrl=new URL('GDD/시나리오/01_주요_이야기_전체.md',root);let main=await fs.readFile(mainUrl,'utf8');
for(const id of ['hello','space','invite','epilogue']){const e=N.events.find(e=>e.id===id),head=`## ${e.title} · \`${id}\``,start=main.indexOf(head);if(start<0)throw Error('Missing chapter '+id);let end=main.indexOf('\n## ',start+head.length);if(end<0)end=main.length;main=main.slice(0,start)+`${head}\n\n개방 안내: ${e.hint}\n\n${script(e.nodes)}\n`+main.slice(end);}
await fs.writeFile(mainUrl,main);
console.log(JSON.stringify({baseDates:4,lifeMainChapters:4,totalDates:D.dates.length,totalEvents:N.events.length}));
