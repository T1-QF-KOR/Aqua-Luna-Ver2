import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),C={structuredClone};C.window=C;vm.createContext(C);
const html=await fs.readFile(new URL('campus.html',root),'utf8');
for(const [,path] of html.matchAll(/<script defer src="([^"]+)">/g)) if(!path.endsWith('/game.js')) vm.runInContext(await fs.readFile(new URL(path,root),'utf8'),C);
const S=C.AquaState,L=C.AquaRomance,E=C.AquaEndings;
const initial=()=>{const s=S.initial();s.date='2026-12-20';s.met=['nari','daeun','seojin'];s.bond={nari:80,daeun:80,seojin:80};return s;};
const check=(s,id)=>{s.date='2027-02-26';assert.equal(E.select(s),id);const data=E.build(s);assert.equal(data.id,id);assert.ok(data.lines.length>=5);assert.ok(data.lines.some(l=>l.text.includes('결말 ·')));assert.ok(S.restore(JSON.parse(JSON.stringify(s))));return data;};
for(const who of ['daeun','seojin']) {const s=initial();assert.ok(L.answer(s,who,'accept'));check(s,`${who}-love`);}
{
 const s=initial();L.answer(s,'nari','accept');check(s,'nari-love');
 Object.assign(s.flags,{nariSelfChoice:3,nariIdentityShared:true});s.cards=['가사 없는 악보','멘트 수첩','관객 한 명','두 장의 종이'];
 let lines=check(s,'nari-true').lines.map(line=>line.text).join(' ');
 assert.ok(!lines.includes('내가 고른 얘기, 끝까지 들어 준다고 했잖아'));assert.ok(lines.includes('이번에는 완성되기 전에'));
 assert.ok(!lines.includes('어젯밤 방송, 끝까지 들어 줘서'));assert.ok(lines.includes('먼저 네 얼굴 보고 말하고 싶었어'));
 s.radio.listened.push('radio-2027-02-25');lines=check(s,'nari-true').lines.map(line=>line.text).join(' ');
 assert.ok(lines.includes('어젯밤 방송, 끝까지 들어 줘서'));assert.ok(!lines.includes('먼저 네 얼굴 보고 말하고 싶었어'));
 s.flags.nariDecisionTrusted=true;lines=check(s,'nari-true').lines.map(line=>line.text).join(' ');
 assert.ok(lines.includes('내가 고른 얘기, 끝까지 들어 준다고 했잖아'));assert.ok(!lines.includes('이번에는 완성되기 전에'));
}
for(const who of ['nari','daeun','seojin']){const s=initial();L.answer(s,who,'friend');check(s,`${who}-friend`);}
{
 const s=initial();L.answer(s,'daeun','accept');
 let text=check(s,'daeun-love').lines.map(l=>l.text).join(' ');
 assert.ok(!text.includes('겨울 합주 때'));assert.ok(!text.includes('맨 뒤에서 손 흔든'));
 s.flags.backRowKept=true;text=check(s,'daeun-love').lines.map(l=>l.text).join(' ');
 assert.ok(text.includes('맨 뒤에서 손 흔든'));assert.ok(!text.includes('겨울 합주 때'));
 s.flags.daeunWinterSpace=true;text=check(s,'daeun-love').lines.map(l=>l.text).join(' ');
 assert.ok(text.includes('겨울 합주 때'));assert.ok(!text.includes('맨 뒤에서 손 흔든'));
}
{
 const s=initial();L.answer(s,'seojin','friend');
 let text=check(s,'seojin-friend').lines.map(l=>l.text).join(' ');
 assert.ok(!text.includes('주차장에서 5번 레인'));assert.ok(!text.includes('마감 음악 한 곡만'));
 s.seen.push('seojinPlaylist');text=check(s,'seojin-friend').lines.map(l=>l.text).join(' ');
 assert.ok(text.includes('마감 음악 한 곡만'));
 s.flags.seojinPoolWaited=true;text=check(s,'seojin-friend').lines.map(l=>l.text).join(' ');
 assert.ok(text.includes('주차장에서 5번 레인'));assert.ok(!text.includes('마감 음악 한 곡만'));
}
{
 const s=initial();L.answer(s,'nari','friend');
 let text=check(s,'nari-friend').lines.map(l=>l.text).join(' ');
 assert.ok(!text.includes('맨 앞줄에 있었잖아'));assert.ok(!text.includes('약속 아니고 초대'));
 s.flags.frontRowKept=true;text=check(s,'nari-friend').lines.map(l=>l.text).join(' ');
 assert.ok(text.includes('맨 앞줄에 있었잖아'));assert.ok(text.includes('약속 아니고 초대'));
 s.flags.originalLyrics=true;text=check(s,'nari-friend').lines.map(l=>l.text).join(' ');
 assert.ok(!text.includes('지우지 않은 첫 줄'));
 s.flags.autumnFestivalSeen=true;text=check(s,'nari-friend').lines.map(l=>l.text).join(' ');
 assert.ok(text.includes('지우지 않은 첫 줄'));
}
{
 const s=initial();L.answer(s,'nari','accept');s.flags.nariSummerEncore=true;
 const text=check(s,'nari-love').lines.map(l=>l.text).join(' ');
 assert.ok(text.includes('혼자 듣고 있었는데'));assert.ok(!text.includes('맨 앞줄에 있었잖아'));
}
{
 const s=initial();s.radio.anonymous=30;
 let text=check(s,'reflection').lines.map(line=>line.text).join(' ');
 assert.ok(text.includes('귀를 기울였다'));assert.ok(!text.includes('내 이야기를 보냈다'));
 s.date='2026-04-06';s.slot=3;
 assert.ok(C.AquaRadio.send(s,C.AquaRadio.draftFor(s,'고민','honest')).ok);
 text=check(s,'reflection').lines.map(line=>line.text).join(' ');
 assert.ok(text.includes('내 이야기를 보냈다'));assert.ok(!text.includes('귀를 기울였다'));
}
{
 const s=initial();s.bond.nari=0;check(s,'far');s.radio.anonymous=10;check(s,'solo');
}
{
 const s=initial();L.answer(s,'nari','accept');L.answer(s,'daeun','disclose');s.date=s.romance.talk.date;assert.ok(L.agree(s));check(s,'pair');
 s.date='2027-02-26';s.bond.nari=50;check(s,'together');
}
{
 const s=initial();L.answer(s,'nari','accept');L.answer(s,'daeun','hide');check(s,'unresolved');s.flags.equivocated=true;check(s,'empty');
}
{
 const s=initial();for(const who of ['nari','daeun','seojin'])assert.ok(L.answer(s,who,'pending'));s.flags.valentineFair=true;check(s,'fair');
}
{
 const s=initial();L.answer(s,'nari','accept');L.answer(s,'daeun','disclose');s.date=s.romance.talk.date;assert.ok(L.agree(s));
 L.answer(s,'seojin','disclose');s.date=s.romance.talk.date;assert.ok(L.agree(s));s.flags.valentineTogether=true;check(s,'full');
}
{
 const s=initial();L.answer(s,'seojin','accept');const text=check(s,'seojin-love').lines.map(x=>x.text).join(' ');
 assert.ok(text.includes('지원은 아직 안 했어'));assert.ok(!text.includes('수업은 계속할'));
}
console.log('PASS relationship-dependent endings, consent, career continuity and save restore');
