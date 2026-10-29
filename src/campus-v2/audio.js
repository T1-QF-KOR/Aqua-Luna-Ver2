/* Optional tracks: absent assets and blocked autoplay are intentionally silent. */
(function(root){
 const tracks={campus:'assets/audio/campus.mp3',night:'assets/audio/night.mp3',radio:'assets/audio/radio.mp3'};
 let audio=null,current=null,volume=.5,enabled=false;const known={};
 async function play(id){
  if(!enabled||!tracks[id]||typeof root.Audio!=='function'||typeof root.fetch!=='function')return;
  if(current===id){if(audio)audio.volume=volume;return;}current=id;
  if(audio){audio.pause();audio=null;}
  if(known[id]===false)return;
  try{if(known[id]===undefined){const response=await root.fetch(tracks[id],{method:'HEAD'});known[id]=response.ok;}if(!known[id]||current!==id)return;
   audio=new root.Audio(tracks[id]);audio.loop=true;audio.volume=volume;await audio.play();
  }catch{}
 }
 function unlock(){enabled=true;}
 function setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));if(audio)audio.volume=volume;}
 root.AquaAudio={tracks,play,unlock,setVolume};
})(typeof window!=='undefined'?window:globalThis);
