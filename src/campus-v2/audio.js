/* Local soundtrack. A user gesture unlocks playback; missing or blocked audio is non-fatal. */
(function(root){
 'use strict';
 const tracks={campus:'assets/audio/campus.mp3',night:'assets/audio/night.mp3',radio:'assets/audio/radio.mp3'};
 // Only shipped and explicitly registered voice files are eligible for playback.
 // The registry remains empty until recordings and their line IDs are approved.
 const voiceTracks=Object.create(null);
 let audio=null,current=null,volume=.5,enabled=false,voice=null,voiceVolume=.8;
 async function play(id){
  if(!enabled||!tracks[id]||typeof root.Audio!=='function')return;
  if(current===id&&audio){audio.volume=volume;return;}
  if(audio)audio.pause();
  const next=new root.Audio(tracks[id]);audio=next;current=id;
  next.loop=true;next.volume=volume;
  try{await next.play();}catch{
   // A late rejection from an older track must not clear the newer selection.
   if(audio===next){audio=null;current=null;}
  }
 }
 function unlock(){enabled=true;}
 function setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));if(audio)audio.volume=volume;}
 function setVoiceVolume(value){voiceVolume=Math.max(0,Math.min(1,Number(value)||0));if(voice)voice.volume=voiceVolume;}
 function stopVoice(){if(!voice)return;const previous=voice;voice=null;previous.onended=null;previous.onerror=null;previous.pause();}
 function isVoicePlaying(){return !!voice;}
 async function playVoice(id,onFinish){
  stopVoice();
  const path=Object.hasOwn(voiceTracks,id)?voiceTracks[id]:null;
  if(!enabled||typeof root.Audio!=='function'||typeof path!=='string'||!/^assets\/audio\/voice\/[a-zA-Z0-9_-]+\.(mp3|ogg|wav)$/.test(path))return;
  const next=new root.Audio(path);voice=next;next.loop=false;next.volume=voiceVolume;
  const finish=()=>{if(voice!==next)return;voice=null;next.onended=null;next.onerror=null;if(typeof onFinish==='function')onFinish();};
  next.onended=finish;next.onerror=finish;
  try{await next.play();}catch{finish();}
 }
 root.AquaAudio={tracks,play,unlock,setVolume,voiceTracks,playVoice,stopVoice,isVoicePlaying,setVoiceVolume};
})(typeof window!=='undefined'?window:globalThis);
