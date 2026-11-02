// Disposable in-memory fixtures: actual game scenes, never real player saves.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url), C = { structuredClone }; C.window = C; vm.createContext(C);
const html = await fs.readFile(new URL('campus.html', root), 'utf8');
for (const [,path] of html.matchAll(/<script defer src="([^"]+)">/g)) if (!path.endsWith('/game.js')) vm.runInContext(await fs.readFile(new URL(path, root), 'utf8'), C);
const fixtures = {};
for (const item of C.AquaEconomy.clothes) {
  const s = C.AquaState.initial('미리보기', '물고기'), id = item.person;
  Object.assign(s, { date: item.outfit === 'coat' ? '2026-12-05' : '2026-06-06', slot: 1, met: [id], bond: { nari: 50, daeun: 45, seojin: 45 } });
  s.giftClothes[id] = item.outfit;
  C.AquaRelationships.migrate(s);
  const outing = { person: id, destination: 'river', variant: 0, bonus: 0, date: s.date };
  const data = C.AquaOutings.build(s, outing);
  s.scene = { id: `date-${id}-river`, title: data.title, background: data.background, queue: data.lines,
    index: 0, after: 'date', outing, wardrobe: { [id]: C.AquaWardrobe.pick(s, id, { outing }) } };
  if (!C.AquaState.restore(s)) throw new Error(`Invalid preview ${item.id}`);
  fixtures[`${id}-${item.outfit}`] = s;
}
for(const [variant,date] of [['offduty','2026-04-06'],['summer','2026-07-06']]) {
  const s=C.AquaState.initial('미리보기','물고기');Object.assign(s,{date,slot:1,met:['seojin'],bond:{nari:0,daeun:0,seojin:45}});C.AquaRelationships.migrate(s);
  const outing={person:'seojin',destination:'river',variant:0,bonus:0,date};const data=C.AquaOutings.build(s,outing);
  s.scene={id:'date-seojin-river',title:data.title,background:data.background,queue:data.lines,index:0,after:'date',outing,wardrobe:{seojin:C.AquaWardrobe.pick(s,'seojin',{outing})}};
  if(!C.AquaState.restore(s))throw new Error(`Invalid Seojin preview ${variant}`);fixtures[`seojin-${variant}`]=s;
}
for (const [id, date, slot] of [['lastWeek','2027-02-22',0],['winterShowcase','2027-02-13',2],['winterPlans','2027-01-18',0],['nariFebruary','2027-01-20',1],['lunarNewYear','2027-02-06',0],['januaryStart','2027-01-04',0],['seojinJanuary','2027-01-06',1],['seojinMeet','2026-03-11',1],['nariSummer', '2026-07-14', 1], ['nariVoice', '2026-08-18', 2], ['seojinPool', '2026-07-13', 2], ['autumnReturn', '2026-09-01', 0], ['nariCard', '2026-09-07', 1], ['nariFight', '2026-10-20', 1], ['autumnFestival', '2026-10-28', 2], ['chuseokMorning', '2026-09-25', 0], ['seojinConfess', '2026-11-25', 2], ['daeunConfess', '2026-12-18', 2], ['seojinCouple', '2026-11-26', 1]]) {
  const s = C.AquaState.initial('미리보기', '물고기');
  Object.assign(s, { date, slot, met: ['nari', 'daeun', 'seojin'], bond: { nari: 50, daeun: 45, seojin: 45 } });
  s.flags.summerPromiseDaeun = true;
  if (id === 'winterShowcase') { s.seen.push('nariFebruary'); s.flags.nariWinterOwnSong = true; s.flags.winterShowcaseMusic = true; }
  if (id === 'nariFebruary') { s.seen.push('nariJanuary'); s.flags.nariJanuaryListened = true; s.flags.winterShowcaseMusic = true; }
  if (id === 'autumnFestival') Object.assign(s.flags, { originalLyrics: true, frontRowPromise: true, backRowPromise: true, daeunJoinedBand: true });
  if (id === 'chuseokMorning') s.flags.chuseokHome = true;
  if (id === 'daeunConfess' || id === 'seojinCouple') {
    const current = s.date; s.date = '2026-11-25'; C.AquaRomance.answer(s, 'seojin', 'accept'); s.date = current;
  }
  C.AquaRelationships.migrate(s);
  const data = C.AquaStory.build(id, s);
  s.scene = { id, title: data.title, background: data.background, time: data.time, queue: data.lines, index: 0, after: 'event',
    wardrobe: Object.fromEntries(s.met.map(person => [person, C.AquaWardrobe.pick(s, person, { id, background: data.background })])) };
  if (!C.AquaState.restore(s)) throw new Error(`Invalid story preview ${id}`);
  fixtures[`scene-${id}`] = s;
}
for(const date of ['2026-03-09','2026-09-07']) {
  const s=C.AquaState.initial('미리보기','물고기');
  Object.assign(s,{date,slot:0,met:['nari','daeun'],bond:{nari:25,daeun:30,seojin:0},seen:['prologue','entrance','daeunMeet','fair','nariClass']});
  C.AquaRelationships.migrate(s);const data=C.AquaSchool.build(s);
  s.scene={id:data.id,title:data.title,background:data.background,time:0,queue:data.lines,index:0,after:'event',wardrobe:Object.fromEntries(s.met.map(person=>[person,C.AquaWardrobe.pick(s,person,{id:data.id})]))};
  if(!C.AquaState.restore(s))throw new Error(`Invalid school preview ${date}`);
  fixtures[`scene-school-${date}`]=s;
}
for (const [id,date,slot] of [['lastBroadcast','2027-02-25',3],['winterValentine','2027-02-14',0],['holidayXmasNight','2026-12-24',3],['nariNewYear','2027-01-01',1]]) {
  const s=C.AquaState.initial('미리보기','물고기');
  Object.assign(s,{date,slot,met:['nari','daeun','seojin'],bond:{nari:82,daeun:25,seojin:25},knowledge:45,fitness:45,sensitivity:45,cards:['가사 없는 악보','관객 한 명'],seen:['prologue','entrance','firstRadio','nariClass','nariSummer']});
  s.radio.anonymous=30;
  if(id==='nariNewYear') {
    s.date='2026-12-24';C.AquaRomance.answer(s,'nari','pending');s.date=date;
    Object.assign(s.holidays,{nariMetTonight:true,nariOutcome:'pending',nariReplyDate:date,nariDeferredBy:'nari'});
  }
  if(id==='lastBroadcast') { s.flags.nariWinterOwnSong=true; s.radio.listened=['radio-2026-12-24']; }
  if(id==='winterValentine') { s.seen.push('winterShowcase'); s.flags.winterShowcasePerformed=true; s.date='2026-11-25'; C.AquaRomance.answer(s,'seojin','accept'); s.date=date; }
  C.AquaRelationships.migrate(s);C.AquaRadio.air(s);
  const data=id==='holidayXmasNight'?C.AquaHolidays.buildNight(s):id==='winterValentine'?C.AquaWinter.buildValentine(s):id==='lastBroadcast'?C.AquaRadio.build(s,C.AquaWorld.episodeOn(date)):C.AquaStory.build(id,s);
  s.scene={id,title:data.title,background:data.background,time:slot,queue:data.lines,index:0,after:['holidayXmasNight','lastBroadcast'].includes(id)?'radio':'event',radioEpisode:data.radioEpisode||null,
    wardrobe:Object.fromEntries(s.met.map(person=>[person,C.AquaWardrobe.pick(s,person,{id})]))};
  if(!C.AquaState.restore(s))throw new Error(`Invalid holiday preview ${id}`);
  fixtures[`scene-${id}`]=s;
}
{
 const s=C.AquaState.initial('미리보기','물고기');
 Object.assign(s,{date:'2026-11-25',slot:0,met:['seojin'],bond:{nari:0,daeun:0,seojin:80},seen:['lastBroadcast']});
 C.AquaRomance.answer(s,'seojin','accept');s.flags.seojinApplied=true;s.flags.seojinHired=true;s.date='2027-02-26';
 C.AquaRelationships.migrate(s);s.endingId=C.AquaEndings.select(s);const data=C.AquaEndings.build(s,s.endingId);
 s.scene={id:`ending-${s.endingId}`,title:data.title,background:data.background,time:0,queue:data.lines,index:0,after:'ending',wardrobe:{seojin:C.AquaWardrobe.pick(s,'seojin',{id:`ending-${s.endingId}`})}};
 if(!C.AquaState.restore(s))throw new Error('Invalid ending preview');fixtures['scene-endingSeojin']=s;
}
const bootstrap = `/* QA only: no access to the player's persistent saves. */
const wardrobeFixtures = ${JSON.stringify(fixtures)};
const previewParams = new URLSearchParams(location.search);
const fixture = wardrobeFixtures[previewParams.has('scene') ? 'scene-' + previewParams.get('scene') : previewParams.get('outfit')] || wardrobeFixtures['nari-casual'];
const wardrobeMemory = new Map([['aqua-luna-campus-v2', JSON.stringify(fixture)], ['aqua-luna-campus-v2-prefs', JSON.stringify({reduced:true,textSpeed:0})]]);
Object.defineProperty(window, 'localStorage', { value: { getItem:key=>wardrobeMemory.get(key)??null, setItem:(key,value)=>wardrobeMemory.set(key,value) } });
`;
await fs.writeFile(new URL('qa/campus-v2/wardrobe-preview.js', root), bootstrap);
const hash = createHash('sha256').update(bootstrap);
for (const [, path] of html.matchAll(/<script defer src="([^"]+)">/g)) hash.update(await fs.readFile(new URL(path, root)));
hash.update(await fs.readFile(new URL('src/campus-v2/game.css', root)));
const version = hash.digest('hex').slice(0, 12);
const preview = html.replace(/href="src\/campus-v2\/game\.css[^"]*"/, `href="src/campus-v2/game.css?v=${version}"`).replace(/(<script defer src="[^"]+)(")/g, `$1?v=${version}$2`)
  .replace('<head>', `<head><base href="../../"><script src="qa/campus-v2/wardrobe-preview.js?v=${version}"></script>`);
await fs.writeFile(new URL('qa/campus-v2/wardrobe-preview.html', root), preview);
console.log('Created qa/campus-v2/wardrobe-preview.html?outfit=<person>-<outfit>');
