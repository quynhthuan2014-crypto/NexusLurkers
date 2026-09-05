import { createGameState, updateGame, purchase, WEAPONS, SHOP, WORLD, WALLS } from '../game/game-core.js';

const canvas=document.querySelector('#canvas');
const ctx=canvas.getContext('2d');
const mini=document.querySelector('#mini');
const mctx=mini.getContext('2d');
const launcher=document.querySelector('#launcher');
const game=document.querySelector('#game');
const playBtn=document.querySelector('#playBtn');
const howBtn=document.querySelector('#howBtn');
const help=document.querySelector('#help');
const closeHelp=document.querySelector('#closeHelp');
const exitBtn=document.querySelector('#exitBtn');
const shop=document.querySelector('#shop');
const closeShop=document.querySelector('#closeShop');
const shopItems=document.querySelector('#shopItems');
const banner=document.querySelector('#banner');
const feed=document.querySelector('#feed');
const state=createGameState(1337);
const input={up:false,down:false,left:false,right:false,sprint:false,fire:false,aim:false,reload:false,mouseAngle:0};
let running=false,last=performance.now(),view={x:0,y:0,scale:1};

function resize(){canvas.width=Math.max(1,innerWidth*devicePixelRatio);canvas.height=Math.max(1,innerHeight*devicePixelRatio);canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);mini.width=370;mini.height=230;}
addEventListener('resize',resize);resize();

function setKey(e,down){
  const k=e.key.toLowerCase();
  if(k==='w'||k==='arrowup')input.up=down;
  if(k==='s'||k==='arrowdown')input.down=down;
  if(k==='a'||k==='arrowleft')input.left=down;
  if(k==='d'||k==='arrowright')input.right=down;
  if(k==='shift')input.sprint=down;
  if(k==='r'&&down&&!e.repeat){input.reload=true;setTimeout(()=>input.reload=false,20);}
  if(k==='b'&&down&&!e.repeat){state.shopOpen=!state.shopOpen;shop.classList.toggle('hidden',!state.shopOpen);}
  if(k==='escape'){document.exitPointerLock?.();}
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','shift'].includes(k))e.preventDefault();
}
addEventListener('keydown',e=>setKey(e,true));addEventListener('keyup',e=>setKey(e,false));
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('mousemove',e=>{
  if(!running)return;
  const rect=canvas.getBoundingClientRect();const sx=e.clientX-rect.left,sy=e.clientY-rect.top;
  const px=view.x+(sx-innerWidth/2)/view.scale,py=view.y+(sy-innerHeight/2)/view.scale;
  input.mouseAngle=Math.atan2(py-state.player.y,px-state.player.x);
});
canvas.addEventListener('mousedown',e=>{if(!running)return;if(e.button===0){input.fire=true;canvas.requestPointerLock?.();}if(e.button===2)input.aim=true;});
addEventListener('mouseup',e=>{if(e.button===0)input.fire=false;if(e.button===2)input.aim=false;});

playBtn.onclick=()=>start();
howBtn.onclick=()=>help.showModal();
closeHelp.onclick=()=>help.close();
exitBtn.onclick=()=>stop();
closeShop.onclick=()=>{state.shopOpen=false;shop.classList.add('hidden');};

function renderShop(){shopItems.innerHTML='';for(const item of SHOP){const b=document.createElement('button');b.className='shop-item';b.innerHTML=`<b>${item.title}</b><small>${item.text}</small><span>${item.cost} C</span>`;b.onclick=()=>{if(purchase(state,item.id)){renderShop();}};shopItems.appendChild(b);}}
renderShop();

function start(){launcher.classList.add('hidden');game.classList.remove('hidden');running=true;last=performance.now();canvas.focus();requestAnimationFrame(loop);}
function stop(){running=false;document.exitPointerLock?.();game.classList.add('hidden');launcher.classList.remove('hidden');}

function loop(now){if(!running)return;const dt=Math.min((now-last)/1000,.033);last=now;updateGame(state,{...input,reload:input.reload,aim:input.aim},dt);draw();updateHud();requestAnimationFrame(loop);}

function worldToScreen(x,y){return {x:(x-view.x)*view.scale+innerWidth/2,y:(y-view.y)*view.scale+innerHeight/2};}
function draw(){
  ctx.clearRect(0,0,innerWidth,innerHeight);view.scale=Math.min(innerWidth/WORLD.width*1.15,innerHeight/WORLD.height*1.15);view.scale=Math.max(.55,Math.min(1.05,view.scale));view.x+= (state.player.x-view.x)*.11;view.y+=(state.player.y-view.y)*.11;
  ctx.save();ctx.translate(-view.x*view.scale+innerWidth/2,-view.y*view.scale+innerHeight/2);ctx.scale(view.scale,view.scale);
  drawArena();drawPickups();drawProjectiles();for(const b of state.bots)drawBot(b);drawPlayer();drawParticles();ctx.restore();
  if(state.shake>0){ctx.save();ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake);ctx.restore();}
  drawMinimap();
}
function drawArena(){
  ctx.fillStyle='#071019';ctx.fillRect(0,0,WORLD.width,WORLD.height);
  ctx.strokeStyle='#18334a';ctx.lineWidth=2;for(let x=0;x<=WORLD.width;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,WORLD.height);ctx.stroke();}for(let y=0;y<=WORLD.height;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WORLD.width,y);ctx.stroke();}
  ctx.fillStyle='#0d1826';for(const w of WALLS){ctx.fillRect(w.x,w.y,w.w,w.h);ctx.strokeStyle='#2a4560';ctx.strokeRect(w.x,w.y,w.w,w.h);}
  ctx.strokeStyle='#3ee9ff88';ctx.lineWidth=5;ctx.strokeRect(25,25,WORLD.width-50,WORLD.height-50);
  ctx.fillStyle='#123145';for(const s of [{x:1300,y:150},{x:1300,y:1450},{x:170,y:180},{x:2410,y:1420}]){ctx.beginPath();ctx.arc(s.x,s.y,32,0,Math.PI*2);ctx.fill();}
}
function drawActor(a,player=false){const s=worldToScreen(a.x,a.y);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(a.angle);ctx.shadowBlur=player?22:14;ctx.shadowColor=player?'#63e8ff':'#ff6688';ctx.fillStyle=player?'#55e8ff':'#ff6688';ctx.beginPath();ctx.arc(0,0,a.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#071019';ctx.fillRect(3,-5,a.r+13,10);ctx.fillStyle='#eafaff';ctx.beginPath();ctx.arc(-5,-5,3,0,Math.PI*2);ctx.fill();ctx.restore();
  const bw=56,ratio=Math.max(0,a.hp/a.maxHp);ctx.fillStyle='#101a26';ctx.fillRect(s.x-bw/2,s.y-a.r-12,bw,5);ctx.fillStyle='#65f0b1';ctx.fillRect(s.x-bw/2,s.y-a.r-12,bw*ratio,5);
}
function drawPlayer(){drawActor(state.player,true);}
function drawBot(b){if(b.respawn>0)return;drawActor(b,false);}
function drawProjectiles(){for(const p of state.projectiles){ctx.strokeStyle=p.color;ctx.globalAlpha=.2;ctx.lineWidth=7;ctx.beginPath();if(p.trail.length){ctx.moveTo(p.trail[0].x,p.trail[0].y);ctx.lineTo(p.x,p.y);}ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=p.color;ctx.shadowBlur=14;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}}
function drawPickups(){for(const item of state.pickups){ctx.save();const bob=Math.sin(item.phase)*4;ctx.translate(item.x,item.y+bob);const c={health:'#5cffab',armor:'#65b9ff',ammo:'#ffd45e',coins:'#f5d06d'}[item.type];ctx.shadowBlur=18;ctx.shadowColor=c;ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,0,item.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#08111a';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.type[0].toUpperCase(),0,0);ctx.restore();}}
function drawParticles(){for(const q of state.particles){const a=Math.max(0,q.life/q.maxLife);ctx.globalAlpha=a;ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
function drawMinimap(){mctx.clearRect(0,0,370,230);mctx.fillStyle='#071019';mctx.fillRect(0,0,370,230);const sx=370/WORLD.width,sy=230/WORLD.height;mctx.fillStyle='#18273a';for(const w of WALLS)mctx.fillRect(w.x*sx,w.y*sy,w.w*sx,w.h*sy);mctx.fillStyle='#ff6688';for(const b of state.bots)if(b.respawn<=0)mctx.fillRect(b.x*sx-3,b.y*sy-3,6,6);mctx.fillStyle='#63e8ff';mctx.beginPath();mctx.arc(state.player.x*sx,state.player.y*sy,5,0,Math.PI*2);mctx.fill();}

function updateHud(){
  const p=state.player,g=p.weapons[p.weapon],w=WEAPONS[p.weapon];
  document.querySelector('#hp').textContent=Math.round(p.hp);document.querySelector('#armor').textContent=Math.round(p.armor);document.querySelector('#score').textContent=state.score;document.querySelector('#coins').textContent=p.coins;document.querySelector('#time').textContent=`${String(Math.floor(state.time/60)).padStart(2,'0')}:${String(Math.ceil(state.time%60)).padStart(2,'0')}`;document.querySelector('#weaponName').textContent=w.name;document.querySelector('#ammo').textContent=g.reloading>0?`RELOADING ${g.reloading.toFixed(1)}s`:`${g.mag} / ${g.reserve}`;document.querySelector('#healthBar').style.width=`${Math.max(0,p.hp/p.maxHp)*100}%`;
  document.querySelector('#shopCoins').textContent=`${p.coins} C`;feed.innerHTML=state.feed.map(x=>`<div>${x}</div>`).join('');banner.classList.toggle('hidden',state.killBanner<=0);if(state.matchOver)banner.textContent=`MATCH COMPLETE — ${state.score} SCORE`;
}
