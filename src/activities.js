/* Seeded, replay-validated date activities. No wall-clock gates or paid retries. */
(() => {
  'use strict';
  const copy=s=>JSON.parse(JSON.stringify(s)), D=LunaData;
  const kinds=['explore','music','memory'];
  const labels={explore:'산책길 탐색',music:'음의 조각',memory:'추억 카드'};
  const levels=12;
  function randomFor(key){let x=2166136261;for(const ch of key)x=Math.imul(x^ch.charCodeAt(0),16777619);return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
  function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  const neighbors=(p,w)=>[p%w?p-1:-1,p%w<w-1?p+1:-1,p>=w?p-w:-1,p<w*(w-1)?p+w:-1].filter(x=>x>=0);
  function toggle(board,index,w){for(const p of [index,...neighbors(index,w)])board[p]=1-board[p];return board;}
  const cache=new Map();
  function puzzle(course,level){
    const key=`${course}:${level}`;if(cache.has(key))return cache.get(key);
    if(!D.dates.some(d=>d.id===course&&d.theme)||!Number.isInteger(level)||level<1||level>levels)return null;
    const round=Math.floor((level-1)/3),kind=kinds[(level-1)%3],r=randomFor('aqualuna-prequel-v1:'+key);
    let p={key,course,level,round,kind,name:labels[kind]};
    if(kind==='explore'){
      const w=7+round*2,board=Array(w*w).fill(1),stack=[w+1];board[w+1]=0;
      while(stack.length){const at=stack.at(-1),x=at%w,y=Math.floor(at/w),options=shuffle([[x+2,y],[x-2,y],[x,y+2],[x,y-2]].filter(([a,b])=>a>0&&a<w-1&&b>0&&b<w-1&&board[b*w+a]),r);
        if(!options.length){stack.pop();continue;}const [nx,ny]=options[0],next=ny*w+nx;board[next]=0;board[((y+ny)/2)*w+(x+nx)/2]=0;stack.push(next);
      }
      const start=w+1,end=(w-2)*w+w-2,roads=board.map((v,i)=>v===0?i:-1).filter(v=>v>=0&&v!==start&&v!==end);
      p={...p,w,board,start,end,treasures:shuffle(roads.slice(),r).slice(0,3+round),limit:roads.length*3+12};
    }else if(kind==='music'){
      const w=Math.min(5,3+round),board=Array(w*w).fill(0);
      shuffle(board.map((_,i)=>i),r).slice(0,3+round*4).forEach(i=>toggle(board,i,w));if(board.every(v=>!v))toggle(board,0,w);
      p={...p,w,board};
    }else{
      const pairs=6+round*2;p={...p,w:4,board:shuffle(Array.from({length:pairs*2},(_,i)=>Math.floor(i/2)),r),pairs};
    }
    cache.set(key,p);return p;
  }
  function initial(p){return{board:[...p.board],pos:p.start,seen:p.kind==='explore'?[p.start,...neighbors(p.start,p.w)]:[],collected:[],open:[],matched:[],turns:0,done:false};}
  function step(p,b,move){
    if(!Number.isInteger(move)||b.done||move<0||move>=p.board.length)return false;
    if(p.kind==='explore'){
      if(b.turns>=p.limit||p.board[move]||!neighbors(b.pos,p.w).includes(move))return false;
      b.pos=move;b.seen=[...new Set([...b.seen,move,...neighbors(move,p.w)])];if(p.treasures.includes(move)&&!b.collected.includes(move))b.collected.push(move);
      b.turns++;b.done=move===p.end&&b.collected.length===p.treasures.length;
    }else if(p.kind==='music'){
      toggle(b.board,move,p.w);b.turns++;b.done=b.board.every(v=>v===0);
    }else{
      if(b.matched.includes(move)||b.open.length===1&&b.open[0]===move)return false;
      if(b.open.length===2)b.open=[];b.open.push(move);
      if(b.open.length===2){b.turns++;if(p.board[b.open[0]]===p.board[b.open[1]]){b.matched.push(...b.open);b.open=[];}}
      b.done=b.matched.length===p.board.length;
    }
    return true;
  }
  function replay(active){const p=puzzle(active?.course,active?.level);if(!p||!Array.isArray(active.moves)||active.moves.length>1000)return null;const b=initial(p);for(const m of active.moves)if(!step(p,b,m))return null;return b;}
  function musicSolution(board,w){
    const n=w*w,rows=board.map((v,i)=>{let bits=v?(1<<n):0;for(const j of [i,...neighbors(i,w)])bits|=1<<j;return bits;});
    const pivots=[];let rank=0;
    for(let col=0;col<n;col++){const at=rows.findIndex((v,i)=>i>=rank&&(v&(1<<col)));if(at<0)continue;[rows[at],rows[rank]]=[rows[rank],rows[at]];for(let i=0;i<n;i++)if(i!==rank&&(rows[i]&(1<<col)))rows[i]^=rows[rank];pivots.push(col);rank++;}
    const solution=[];for(let i=0;i<rank;i++)if(rows[i]&(1<<n))solution.push(pivots[i]);return solution;
  }
  function path(p,from,to){const queue=[from],prev=new Map([[from,null]]);for(let i=0;i<queue.length;i++){const at=queue[i];if(at===to){const result=[];let cur=to;while(prev.get(cur)!==null){result.unshift(cur);cur=prev.get(cur);}return result;}for(const next of neighbors(at,p.w))if(!p.board[next]&&!prev.has(next)){prev.set(next,at);queue.push(next);}}return[];}
  function hint(p,b){
    if(p.kind==='explore'){const targets=p.treasures.filter(t=>!b.collected.includes(t));if(!targets.length)targets.push(p.end);return targets.map(t=>path(p,b.pos,t)).sort((a,b)=>a.length-b.length)[0]?.slice(0,1)||[];}
    if(p.kind==='music')return musicSolution(b.board,p.w).slice(0,1);
    const available=p.board.map((_,i)=>i).filter(i=>!b.matched.includes(i));
    const first=b.open.length===1?b.open[0]:available[0],second=available.find(i=>i!==first&&p.board[i]===p.board[first]);return b.open.length===1?[second]:[first,second];
  }
  const fresh=()=>({wins:[],active:null});
  const progress=s=>s.story.activities||fresh();
  function reason(s,course,level){
    if(!puzzle(course,level))return '알 수 없는 체험이에요.';
    if(progress(s).active)return '진행 중인 체험을 이어가거나 중단해 주세요.';
    if(s.story.active&&(s.story.active.kind!=='date'||s.story.active.id!==course))return '지금 나누는 이야기를 먼저 마쳐 주세요.';
    if(!s.story.exploration?.[course]&&s.story.active?.id!==course)return '이 코스로 외출한 뒤 체험할 수 있어요.';
    if(level>1&&!progress(s).wins.some(w=>w.key===`${course}:${level-1}`))return '앞 체험을 마치면 이어서 열려요.';
    return null;
  }
  function start(s,course,level){const error=reason(s,course,level);if(error)return{state:s,error};const next=copy(s);next.story.activities=copy(progress(s));next.story.activities.active={course,level,moves:[],assisted:false};return{state:next};}
  function move(s,action,expectedLength){
    const current=progress(s).active;if(!current||expectedLength!==current.moves.length)return{state:s,error:'현재 체험의 선택을 눌러 주세요.'};
    const next=copy(s),a=next.story.activities.active,p=puzzle(a.course,a.level);let b=replay(a);
    if(!b)return{state:s,error:'체험을 다시 시작해 주세요.'};
    if(action==='leave'){next.story.activities.active=null;return{state:next};}
    if(action==='undo'){a.moves.pop();return{state:next};}
    if(action==='reset'){a.moves=[];return{state:next};}
    const moves=action==='hint'?hint(p,b):[action];if(!moves.length||a.moves.length+moves.length>1000)return{state:s,error:'처음부터 다시 시도할 수 있어요.'};
    for(const m of moves){if(!step(p,b,m))return{state:s,error:'갈 수 있는 칸을 골라 주세요.'};a.moves.push(m);}
    if(action==='hint')a.assisted=true;
    if(b.done){const prior=next.story.activities.wins.find(w=>w.key===p.key);if(!prior)next.story.activities.wins.push({key:p.key,day:s.day,assisted:a.assisted,moves:a.moves.length});next.story.activities.active=null;return{state:next,completed:{course:a.course,level:a.level,assisted:a.assisted,first:!prior}};}
    return{state:next};
  }
  function validate(g,s){
    if(g===undefined)return fresh();
    if(!g||!Array.isArray(g.wins)||g.wins.length>48*levels||new Set(g.wins.map(w=>w?.key)).size!==g.wins.length)return null;
    for(const win of g.wins){if(!win||typeof win.key!=='string')return null;const [course,l]=win.key.split(':'),level=Number(l),p=puzzle(course,level);if(!p||p.key!==win.key||!Number.isInteger(win.day)||win.day<1||win.day>s.day||typeof win.assisted!=='boolean'||!Number.isInteger(win.moves)||win.moves<1||win.moves>1000||(!s.story.exploration?.[course]&&s.story.active?.id!==course)||(level>1&&!g.wins.some(w=>w.key===`${course}:${level-1}`)))return null;}
    if(g.active!==null){const a=g.active;if(!a||typeof a.assisted!=='boolean'||!replay(a)||replay(a).done||reason({...s,story:{...s.story,activities:{wins:g.wins,active:null}}},a.course,a.level))return null;}
    return copy(g);
  }
  const reflections={
    river:['“갈림길에서 기다려 주니까 놓친 풍경도 다시 볼 수 있었어요.”','“돌아간 길에도 발견한 게 있네요. 짧은 길만 좋은 건 아니에요.”','“갈 곳이 많을수록 쉬는 자리부터 찾게 돼요.”','“끝까지 다녀왔지만, 이 길을 외워야 다음에 만날 수 있는 건 아니죠.”'],
    culture:['“같은 조각을 두 번 봐도 다른 곳이 먼저 보이네요.”','“방금 틀린 선택 덕분에 어디에 있었는지 기억났어요.”','“설명을 읽고 다시 보니까 처음엔 안 보이던 연결이 보여요.”','“다 맞춘 날만 수첩에 남기지 않아도 좋겠어요.”'],
    taste:['“순서를 정하니까 같이 준비하는 기분이 나요.”','“먼저 고른 것을 바꿔도 한 끼는 완성할 수 있네요.”','“잘하는 사람만 움직이면 같이 만든 건 아닌 것 같아요.”','“다음에는 순서를 바꿔도 오늘 배운 건 남겠죠.”'],
    craft:['“손을 멈추고 보는 것도 작업이었네요.”','“다시 할 수 있어서 첫 선택을 덜 무서워하게 돼요.”','“도움을 청하고도 제가 만든 거라고 말할 수 있죠.”','“처음보다 잘하게 됐지만 처음 만든 것도 버리고 싶진 않아요.”'],
    music:['“한 음을 바꾸면 옆의 음도 다르게 들리네요.”','“혼자 있는 음보다 이어지는 곳을 보게 돼요.”','“처음부터 다 알아야 연주하는 건 아니니까요.”','“끝의 모양보다 서로 어떻게 맞췄는지가 기억에 남아요.”'],
    night:['“한 번에 안 보여도 조금씩 익숙해지는 길이 있네요.”','“기억나지 않는다고 우리 시간이 사라진 건 아니죠.”','“잘못 들어온 길에서도 돌아갈 방향은 찾을 수 있네요.”','“이제 돌아가요. 오늘을 다 끝내야 다음 날이 오는 건 아니니까요.”']
  };
  const reflection=(course,level)=>reflections[D.dates.find(d=>d.id===course).theme][Math.floor((level-1)/3)];
  window.LunaActivities={levels,kinds,labels,puzzle,initial,replay,musicSolution,path,hint,fresh,progress,reason,start,move,validate,reflection,neighbors};
})();
