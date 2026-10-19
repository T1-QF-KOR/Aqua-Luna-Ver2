// Isolated Chromium profile: exercises the handset with real pointer/keyboard input.
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'qa', 'phone');
await fs.mkdir(out, { recursive: true });
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'luna-phone-'));
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2' };
const server = http.createServer(async (req,res) => {
  try {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    const data = await fs.readFile(file.endsWith(path.sep) ? file + 'index.html' : file);
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0,'127.0.0.1',r));
const url = `http://127.0.0.1:${server.address().port}`;
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'], { windowsHide:true, stdio:'ignore' });
const wait = ms => new Promise(r=>setTimeout(r,ms));
let socket, sequence=0;
const pending=new Map(), errors=[], checks=[];
async function until(fn) { for(let i=0;i<150;i++){ const v=await fn(); if(v) return v; await wait(100); } throw Error('Timed out'); }
function send(method,params={}) { return new Promise((resolve,reject)=>{ const id=++sequence; pending.set(id,{resolve,reject}); socket.send(JSON.stringify({id,method,params})); }); }
async function evaluate(expression) { const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; }
async function check(name,expression) { if(!await evaluate(expression)) { await shot('failure'); console.log(await evaluate(`({detail:document.getElementById('results')?.textContent,overflow:[...document.querySelectorAll('#modal-body *')].filter(e=>e.getBoundingClientRect().right>document.getElementById('modal-body').getBoundingClientRect().right).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,60),width:e.getBoundingClientRect().width})).slice(0,20)})`)); throw Error(name); } checks.push(name); console.log('PASS',name); }
async function click(selector) {
  const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}); if(!e)throw Error('Missing '+${JSON.stringify(selector)}); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
  await wait(50);
}
async function shot(name){ await wait(250); const r=await send('Page.captureScreenshot',{format:'png'}); await fs.writeFile(path.join(out,name+'.png'),Buffer.from(r.data,'base64')); }
try {
  const port=await until(async()=>{try{return (await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];}catch{return null;}});
  const tabs=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  socket.addEventListener('message',e=>{const m=JSON.parse(e.data); if(m.id){const p=pending.get(m.id); pending.delete(m.id); m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);} else if(m.method==='Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);});
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:url+'/index.html'});
  await until(()=>evaluate('Boolean(window.LunaEngine && document.readyState === "complete")'));
  await evaluate(`localStorage.setItem('aqualuna.v2.prefs',JSON.stringify({reduceMotion:true,sfx:false,introAuto:false})); LunaEngine.storage.save(0,LunaEngine.makeState());`);
  await send('Page.reload'); await until(()=>evaluate('Boolean(window.LunaEngine && document.readyState === "complete")'));
  await click('#continue-game'); await click('#phone-button');
  await check('Home shows 16 functional apps', '!document.getElementById("phone-home").hidden && document.querySelectorAll("[data-phone-app]").length===16');
  await shot('home-1440');
  const fits=`(()=>{const m=document.getElementById('modal'),b=document.getElementById('modal-body'),r=m.getBoundingClientRect();return m.open && !m.classList.contains('story-stage') && r.width<=421 && r.bottom<=innerHeight && b.scrollWidth<=b.clientWidth+1;})()`;
  for(const app of ['calendar','schedule','budget','shop','wardrobe','album','journal','work','date','story','bond','gift','save','load','settings']) {
    await click(`[data-phone-app="${app}"]`); await check(app+' fits inside the handset',fits);
    if(['shop','wardrobe','calendar','settings'].includes(app)) await shot(app+'-1440');
    await click('#modal-phone-home'); await check(app+' returns to home','!document.getElementById("phone").hidden && !document.getElementById("modal").open');
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
  await shot('home-1280');
  for(const app of ['shop','schedule','settings','calendar']) {await click(`[data-phone-app="${app}"]`);await check(app+' fits at 1280x720',fits);await click('#modal-phone-home');}
  await click('[data-phone-app="story"]'); await click('.story-entry .primary');
  await check('Story leaves handset for the full stage',`document.getElementById('modal').classList.contains('story-stage') && document.getElementById('modal').getBoundingClientRect().width === innerWidth && getComputedStyle(document.getElementById('modal-phone-home')).display === 'none'`);
  await click('#close-modal'); await click('#phone-button'); await click('[data-phone-app="settings"]');
  await check('Utility returns to handset after a story',fits);
  await click('#modal-phone-home');
  // Build a legitimate morning-after save and verify optional reply persistence.
  await evaluate(`(()=>{const E=LunaEngine,N=LunaStory; const finish=s=>{while(s.story.active){const a=s.story.active,c=N.script(a.kind,a.id)[a.choices.length].choices.find(c=>!E.choiceReason(s,c));s=E.chooseStory(s,c.id,a.choices.length).state;}return s;};let s=finish(E.startStory(E.makeState(),'hello').state);s=finish(E.act(s,'date','walk').state);s=E.act(s,'nextDay').state;E.storage.save(0,s);})()`);
  await send('Page.reload'); await until(()=>evaluate('Boolean(window.LunaEngine && document.readyState === "complete")'));
  await click('#continue-game'); await click('#phone-button');
  await check('Unread notification on home','!document.getElementById("phone-notification").hidden');
  await click('[data-phone-app="messages"]'); await click('[data-thread="sulien"]');
  await until(()=>evaluate('Boolean(document.querySelector("[data-message-reply]"))'));
  await click('[data-message-reply="a"]'); await wait(100);
  await check('Reply persists and sticker stays visible','LunaEngine.storage.load(0).story.message.reply === "a" && !!document.querySelector(".phone-sticker") && !document.getElementById("phone").hidden');
  await shot('messages-1280');
  for(const page of ['messages','home']) {await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',windowsVirtualKeyCode:27});await check('Escape returns to '+page,`document.getElementById('phone').dataset.page === '${page}'`);}
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',windowsVirtualKeyCode:27});
  await check('Escape closes handset','document.getElementById("phone").hidden');
  const { workChecks } = await import('./work-browser-cases.mjs');
  await workChecks({ evaluate, check, click, send, wait, until, shot });
  // Existing feature integration suite catches regressions in stories, saves and schedules.
  await send('Page.navigate',{url:url+'/tests/somesome-ui.html'});
  const result=await until(()=>evaluate(`document.body.dataset.status || null`));
  await check('Existing SomeSome UI suite',`document.body.dataset.status === 'passed'`);
  if(errors.length) throw Error(JSON.stringify(errors));
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify({checks,errors,viewports:['1440x900','1280x720'],status:'passed'},null,2));
  console.log('All phone checks passed');
} finally {
  socket?.close(); chrome.kill(); server.close();
}
