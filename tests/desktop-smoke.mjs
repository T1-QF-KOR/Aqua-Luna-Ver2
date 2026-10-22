// Exercise the packaged release EXE in WebView2 with a separate, disposable save profile.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)), out=path.join(root,'qa','desktop-smoke');
await fs.mkdir(out,{recursive:true});
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'aqualuna-webview-test-'));
const probe=net.createServer(); await new Promise(r=>probe.listen(0,'127.0.0.1',r)); const port=probe.address().port; await new Promise(r=>probe.close(r));
const app=spawn(path.join(root,'dist','AquaLuna','AquaLuna.exe'),[],{windowsHide:!process.argv.includes('--visible'),stdio:'ignore',env:{...process.env,WEBVIEW2_USER_DATA_FOLDER:profile,WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:`--remote-debugging-port=${port} --remote-debugging-address=127.0.0.1`}});
app.on('exit',(code,signal)=>console.log('Test app exit',code,signal));
console.log('Test profile',profile,'CDP port',port);
let socket,id=0; const pending=new Map(),errors=[],network=[],checks=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<200;i++){const v=await fn();if(v)return v;await wait(100);}throw Error('Timed out waiting for packaged app');}
function send(method,params={}){return new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout '+method));},15000);pending.set(n,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});socket.send(JSON.stringify({id:n,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function check(name,expression){if(!await evaluate(expression))throw Error(name);checks.push(name);console.log('PASS',name);}
async function click(selector){const p=await evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(selector)});if(!b)throw Error('Missing target');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,button:'left',clickCount:1,...p});await wait(80);}
async function key(key,code){await send('Input.dispatchKeyEvent',{type:'keyDown',key,windowsVirtualKeyCode:code});await send('Input.dispatchKeyEvent',{type:'keyUp',key,windowsVirtualKeyCode:code});await wait(100);}
async function shot(name){await wait(300);const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));}
try{
  let lastTargets='';
  const target=await until(async()=>{try{const tabs=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();const summary=JSON.stringify(tabs.map(t=>({type:t.type,url:t.url})));if(summary!==lastTargets){console.log('WebView targets',summary);lastTargets=summary;}return tabs.find(t=>t.type==='page'&&t.url.startsWith('https://aqualuna.example/'));}catch{return null;}});
  if(!(await fs.readdir(profile)).length)throw Error('Isolated profile was not created');
  socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(p)m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Network.responseReceived'&&m.params.response.status>=400)network.push({url:m.params.response.url,status:m.params.response.status});else if(m.method==='Network.loadingFailed'&&!m.params.canceled)network.push(m.params.errorText);});
  await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
  await until(()=>evaluate('Boolean(window.LunaWork && document.readyState === "complete")'));
  await check('Packaged WebView2 boots with isolated empty save profile','!document.getElementById("title-screen").hidden && localStorage.length===0');
  const browser=await send('Browser.getVersion'),initialViewport=await evaluate('({width:innerWidth,height:innerHeight,ratio:devicePixelRatio})');
  await evaluate(`localStorage.setItem('aqualuna.v2.prefs',JSON.stringify({reduceMotion:true,sfx:false,introAuto:false}));`);
  await send('Page.reload');await until(()=>evaluate('Boolean(window.LunaWork && document.readyState === "complete")'));
  await click('#new-game');await check('Packaged new game opens prologue','!document.getElementById("intro-screen").hidden');await click('#intro-skip');
  await click('#phone-button');await check('Release includes all 16 phone apps','document.querySelectorAll("[data-phone-app]").length===16');await shot('phone');
  await click('[data-phone-app="work"]');await click('[data-action-id="cafe"]');await click('.confirm-actions .primary');
  await until(()=>evaluate('document.querySelector(".work-sulien")?.naturalWidth > 0'));
  await check('Release SD asset loads and wages persist once','document.querySelector(".work-vignette").classList.contains("finished") && LunaEngine.storage.load(0).money===125000');await shot('work');await click('.work-continue');
  await key('F5',116);await check('Release F5 saves','LunaEngine.storage.load("quick").money===125000');
  await click('#rest-button');await key('F9',120);await check('Release F9 restores time and energy','LunaEngine.storage.load(0).ap===2 && LunaEngine.storage.load(0).energy===80');
  await key('F11',122);await shot('fullscreen');await key('F11',122);
  await check('Fullscreen round trip preserves game state','LunaEngine.storage.load(0).money===125000 && !document.getElementById("play-screen").hidden');
  await send('Page.reload');await until(()=>evaluate('Boolean(window.LunaWork && document.readyState === "complete")'));await click('#continue-game');
  await check('Release reload resumes the saved session','LunaEngine.storage.load(0).money===125000 && document.getElementById("money").textContent.includes("125,000")');
  await check('Phone frame stays within native WebView2 viewport',`(()=>{document.getElementById('phone-button').click();const r=document.getElementById('phone').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})()`);
  if(errors.length||network.length)throw Error(JSON.stringify({errors,network}));
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify({status:'passed',checks,browser,initialViewport,errors,network,profile,executable:'dist/AquaLuna/AquaLuna.exe'},null,2));
}catch(e){if(socket?.readyState===WebSocket.OPEN)await shot('failure').catch(()=>{});await fs.writeFile(path.join(out,'results.json'),JSON.stringify({status:'failed',checks,errors,network,error:String(e)},null,2));throw e;}
finally{socket?.close();app.kill();}
