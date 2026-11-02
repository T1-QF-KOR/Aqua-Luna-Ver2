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
a.voiceTracks.sample='assets/audio/voice/sample.ogg';a.setVoiceVolume(.65);
let finished=0;const firstVoice=a.playVoice('sample',()=>finished++);const v1=instances[5];
assert.equal(v1.url,'assets/audio/voice/sample.ogg');assert.equal(v1.loop,false);assert.equal(v1.volume,.65);assert.ok(a.isVoicePlaying());
assert.equal(instances[4].paused,false,'voice does not interrupt background music');
v1.resolve();await firstVoice;v1.onended();assert.equal(finished,1);assert.equal(a.isVoicePlaying(),false);
const oldVoice=a.playVoice('sample',()=>finished++);const v2=instances[6];const newerVoice=a.playVoice('sample',()=>finished++);const v3=instances[7];
assert.ok(v2.paused);v2.reject(new Error('stale rejection'));await oldVoice;assert.equal(finished,1);
v3.resolve();await newerVoice;v3.onended();assert.equal(finished,2);
const stopped=a.playVoice('sample',()=>finished++);const v4=instances[8];a.stopVoice();v4.resolve();await stopped;
assert.equal(a.isVoicePlaying(),false);assert.equal(finished,2);
a.voiceTracks.unsafe='https://example.com/voice.mp3';await a.playVoice('unsafe');assert.equal(instances.length,9,'only local registered paths are allowed');
console.log('PASS soundtrack unlock, file playback without fetch, volume, transitions and retry');
