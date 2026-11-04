/* Local soundtrack. A user gesture unlocks playback; missing or blocked audio is non-fatal. */
(function(root){
 'use strict';
 const tracks={campus:'assets/audio/campus.mp3',night:'assets/audio/night.mp3',radio:'assets/audio/radio.mp3'};
 // Only shipped and explicitly registered voice files are eligible for playback.
 // The registry remains empty until recordings and their line IDs are approved.
 const voiceTracks=Object.create(null);
 let audio=null,current=null,volume=.5,enabled=false,voice=null,voiceVolume=.8,voicePaused=false,voiceAttempt=0;
 const musicLevel=()=>volume * (voice && !voicePaused && voiceVolume > 0 ? .35 : 1);
 function updateMusicLevel(){if(audio)audio.volume=musicLevel();}
 function discardMusic(track){if(audio===track){audio=null;current=null;}track.onerror=null;}
 async function play(id){
  if(!enabled||!tracks[id]||typeof root.Audio!=='function')return;
  if(current===id&&audio){updateMusicLevel();return;}
  if(audio){audio.onerror=null;audio.pause();}
  const next=new root.Audio(tracks[id]);audio=next;current=id;
  next.loop=true;next.volume=musicLevel();next.onerror=()=>discardMusic(next);
  try{await next.play();}catch{
   // A late rejection from an older track must not clear the newer selection.
   discardMusic(next);
  }
 }
 function unlock(){enabled=true;}
 function setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));updateMusicLevel();}
 function setVoiceVolume(value){voiceVolume=Math.max(0,Math.min(1,Number(value)||0));if(voice)voice.volume=voiceVolume;updateMusicLevel();}
 function stopVoice(){if(!voice)return;const previous=voice;voice=null;voicePaused=false;voiceAttempt++;previous.onended=null;previous.onerror=null;previous.pause();updateMusicLevel();}
 function isVoicePlaying(){return !!voice;}
 async function startVoice(next){const attempt=++voiceAttempt;try{await next.play();}catch{if(voice===next&&!voicePaused&&attempt===voiceAttempt)next.onerror?.();}}
 function pauseVoice(){if(!voice||voicePaused)return;voicePaused=true;voiceAttempt++;voice.pause();updateMusicLevel();}
 function resumeVoice(){if(!voice||!voicePaused)return;voicePaused=false;updateMusicLevel();void startVoice(voice);}
 async function playVoice(id,onFinish){
  stopVoice();
  const path=Object.hasOwn(voiceTracks,id)?voiceTracks[id]:null;
  if(!enabled||typeof root.Audio!=='function'||typeof path!=='string'||!/^assets\/audio\/voice\/[a-zA-Z0-9_-]+\.(mp3|ogg|wav)$/.test(path))return;
  const next=new root.Audio(path);voice=next;voicePaused=false;next.loop=false;next.volume=voiceVolume;updateMusicLevel();
  const finish=()=>{if(voice!==next)return;voice=null;voicePaused=false;voiceAttempt++;next.onended=null;next.onerror=null;updateMusicLevel();if(typeof onFinish==='function')onFinish();};
  next.onended=finish;next.onerror=finish;
  await startVoice(next);
 }
 root.AquaAudio={tracks,play,unlock,setVolume,voiceTracks,playVoice,stopVoice,pauseVoice,resumeVoice,isVoicePlaying,setVoiceVolume};
})(typeof window!=='undefined'?window:globalThis);
