import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=await fs.readFile(new URL('../src/campus-v2/audio.js',import.meta.url),'utf8');
const instances=[];
class FakeAudio {
 constructor(url){this.url=url;this.paused=false;instances.push(this);}
 play(){return new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;});}
 pause(){this.paused=true;}
}
const context={Audio:FakeAudio};context.window=context;vm.createContext(context);vm.runInContext(source,context);
const a=context.AquaAudio;
await a.play('campus');assert.equal(instances.length,0,'locked until user interaction');
a.unlock();a.setVolume(0.35);let p=a.play('campus');assert.equal(instances[0].url,'assets/audio/campus.mp3');
assert.equal(instances[0].loop,true);assert.equal(instances[0].volume,0.35);instances[0].resolve();await p;
await a.play('campus');assert.equal(instances.length,1,'same track does not restart');
a.setVolume(2);assert.equal(instances[0].volume,1);a.setVolume(-1);assert.equal(instances[0].volume,0);
const old=a.play('night');assert.ok(instances[0].paused);const newer=a.play('radio');assert.ok(instances[1].paused);
instances[1].reject(new Error('previous playback failed'));await old;instances[2].resolve();await newer;
await a.play('radio');assert.equal(instances.length,3,'stale failure does not clear current music');
const failed=a.play('night');instances[3].reject(new Error('temporarily blocked'));await failed;
const retried=a.play('night');assert.equal(instances.length,5,'failed playback can be retried');instances[4].resolve();await retried;
await a.playVoice('unregistered');assert.equal(instances.length,5,'unregistered cues never request a file');
a.voiceTracks.sample='assets/audio/voice/sample.ogg';a.setVoiceVolume(.65);a.setVolume(.6);
let finished=0;const firstVoice=a.playVoice('sample',()=>finished++);const v1=instances[5];
assert.equal(v1.url,'assets/audio/voice/sample.ogg');assert.equal(v1.loop,false);assert.equal(v1.volume,.65);assert.ok(a.isVoicePlaying());
assert.equal(instances[4].paused,false,'voice does not interrupt background music');
assert.ok(Math.abs(instances[4].volume-.21)<1e-9,'music lowers under audible voice');
a.setVoiceVolume(0);assert.equal(instances[4].volume,.6,'muted voice does not lower music');
a.setVoiceVolume(.65);assert.ok(Math.abs(instances[4].volume-.21)<1e-9);
v1.resolve();await firstVoice;v1.onended();assert.equal(finished,1);assert.equal(a.isVoicePlaying(),false);assert.equal(instances[4].volume,.6);
const oldVoice=a.playVoice('sample',()=>finished++);const v2=instances[6];const newerVoice=a.playVoice('sample',()=>finished++);const v3=instances[7];
assert.ok(v2.paused);v2.reject(new Error('stale rejection'));await oldVoice;assert.equal(finished,1);
v3.resolve();await newerVoice;v3.onended();assert.equal(finished,2);
const stopped=a.playVoice('sample',()=>finished++);const v4=instances[8];a.stopVoice();v4.resolve();await stopped;
assert.equal(a.isVoicePlaying(),false);assert.equal(finished,2);
a.voiceTracks.unsafe='https://example.com/voice.mp3';await a.playVoice('unsafe');assert.equal(instances.length,9,'only local registered paths are allowed');
const interrupted=a.playVoice('sample',()=>finished++);const v5=instances[9],rejectBeforePause=v5.reject;
a.pauseVoice();assert.ok(v5.paused);assert.ok(a.isVoicePlaying(),'paused voice still blocks automatic advance');assert.equal(instances[4].volume,.6);
a.resumeVoice();assert.ok(Math.abs(instances[4].volume-.21)<1e-9);rejectBeforePause(new Error('old play was interrupted by pause'));await interrupted;
assert.ok(a.isVoicePlaying(),'late rejection from the paused attempt cannot cancel the resumed voice');
v5.resolve();await Promise.resolve();v5.onended();assert.equal(finished,3);assert.equal(a.isVoicePlaying(),false);
const switchingVoice=a.playVoice('sample');const v6=instances[10];v6.resolve();await switchingVoice;
const switchingMusic=a.play('radio');const newMusic=instances[11];assert.ok(Math.abs(newMusic.volume-.21)<1e-9,'new track stays lowered while voice plays');
newMusic.resolve();await switchingMusic;a.stopVoice();assert.equal(newMusic.volume,.6);
// A media error can also occur after play() has already resolved. The same
// track must be eligible for a retry, and an old error must not clear it.
const staleError=newMusic.onerror;newMusic.onerror();
const retryAfterError=a.play('radio');const recovered=instances[12];
assert.ok(recovered,'a post-start media error allows the same track to retry');
staleError();recovered.resolve();await retryAfterError;
await a.play('radio');assert.equal(instances.length,13,'stale errors must not interrupt the recovered track');
console.log('PASS soundtrack unlock, file playback without fetch, volume, transitions and retry');
