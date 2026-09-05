export const TAU = Math.PI * 2;
export const WORLD = { width: 2600, height: 1600, margin: 60 };

export const WEAPONS = Object.freeze({
  pistol: Object.freeze({ id:'pistol', name:'PULSE PISTOL', damage:22, fireRate:5.5, magazine:12, reserve:72, reload:0.9, speed:1050, spread:0.018, pellets:1, cost:0, color:'#56e8ff' }),
  burst: Object.freeze({ id:'burst', name:'NOVA BURST', damage:15, fireRate:12, magazine:24, reserve:120, reload:1.15, speed:1160, spread:0.035, pellets:1, cost:80, color:'#9b8cff' }),
  scatter: Object.freeze({ id:'scatter', name:'ION SCATTER', damage:9, fireRate:2.1, magazine:8, reserve:48, reload:1.45, speed:900, spread:0.19, pellets:8, cost:115, color:'#ffca61' }),
  rail: Object.freeze({ id:'rail', name:'RAIL LANCE', damage:78, fireRate:0.95, magazine:5, reserve:25, reload:1.65, speed:1800, spread:0.006, pellets:1, cost:190, color:'#ff668f' }),
  pulse: Object.freeze({ id:'pulse', name:'PULSE SMG', damage:12, fireRate:18, magazine:36, reserve:144, reload:1.3, speed:1080, spread:0.055, pellets:1, cost:145, color:'#71ffad' })
});

export const SHOP = Object.freeze([
  { id:'burst', title:'NOVA BURST', text:'Fast controlled fire', cost:80 },
  { id:'scatter', title:'ION SCATTER', text:'Eight-pellet close combat', cost:115 },
  { id:'pulse', title:'PULSE SMG', text:'High-rate suppression', cost:145 },
  { id:'rail', title:'RAIL LANCE', text:'Heavy precision shot', cost:190 },
  { id:'armor', title:'ARMOR CORE', text:'+25 maximum armor', cost:65 },
  { id:'med', title:'MED GEL', text:'+40 health', cost:50 },
  { id:'ammo', title:'AMMO CACHE', text:'+80 reserve ammo', cost:35 }
]);

export const WALLS = Object.freeze([
  {x:250,y:180,w:480,h:70},{x:250,y:1350,w:480,h:70},{x:1870,y:180,w:480,h:70},{x:1870,y:1350,w:480,h:70},
  {x:1040,y:260,w:170,h:360},{x:1390,y:980,w:170,h:360},{x:1120,y:690,w:360,h:180},
  {x:430,y:610,w:250,h:120},{x:1920,y:870,w:250,h:120},{x:790,y:930,w:210,h:130},{x:1600,y:540,w:210,h:130},
  {x:770,y:390,w:120,h:190},{x:1710,y:1030,w:120,h:190}
]);

export const SPAWNS = Object.freeze([
  {x:180,y:800},{x:2420,y:800},{x:780,y:170},{x:1820,y:1430},{x:500,y:1180},{x:2100,y:420}
]);

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const angleTo=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
const circleRect=(cx,cy,r,rect)=>{const x=clamp(cx,rect.x,rect.x+rect.w),y=clamp(cy,rect.y,rect.y+rect.h);return Math.hypot(cx-x,cy-y)<r;};

export function moveCircle(actor, dx, dy){
  actor.x+=dx;
  if(WALLS.some(w=>circleRect(actor.x,actor.y,actor.r,w))) actor.x-=dx;
  actor.y+=dy;
  if(WALLS.some(w=>circleRect(actor.x,actor.y,actor.r,w))) actor.y-=dy;
  actor.x=clamp(actor.x,WORLD.margin,WORLD.width-WORLD.margin);
  actor.y=clamp(actor.y,WORLD.margin,WORLD.height-WORLD.margin);
}

function makeWeapon(id){const w=WEAPONS[id];return {id,mag:w.magazine,reserve:w.reserve,cooldown:0,reloading:0};}

function botName(id){return ['VEX','NYX','RIFT','ECHO','KILO','NOVA'][id%6];}

export function createBot(id,x,y){
  return {id:`bot-${id}`, index:id, name:botName(id), x,y,r:24,hp:100,maxHp:100,armor:25,maxArmor:25,speed:128,angle:0,cooldown:0,think:0,wander:Math.random()*TAU,state:'patrol',respawn:0,flash:0,strafe:1,kills:0};
}

export function createGameState(seed=12345){
  const player={id:'player',name:'PLAYER',x:WORLD.width/2,y:WORLD.height/2,r:25,hp:100,maxHp:100,armor:50,maxArmor:50,speed:245,angle:0,weapon:'pistol',weapons:{pistol:makeWeapon('pistol')},coins:50,kills:0,deaths:0,streak:0,damageDealt:0,aiming:false,flash:0};
  const state={version:2,seed,world:WORLD,player,bots:[],projectiles:[],particles:[],pickups:[],feed:[],score:0,time:600,matchOver:false,paused:false,shopOpen:false,shake:0,killBanner:0};
  [1,2,4,5].forEach((spawnIndex,i)=>{const s=SPAWNS[spawnIndex];state.bots.push(createBot(i,s.x,s.y));});
  state.pickups.push(
    {type:'health',x:1300,y:150,r:18,value:35,phase:0},
    {type:'armor',x:1300,y:1450,r:18,value:30,phase:1},
    {type:'ammo',x:170,y:180,r:18,value:50,phase:2},
    {type:'coins',x:2410,y:1420,r:18,value:25,phase:3}
  );
  return state;
}

export function damageActor(target, amount){
  const absorbed=Math.min(target.armor, amount*0.55);
  target.armor=Math.max(0,target.armor-absorbed);
  const hpDamage=amount-absorbed;
  target.hp=Math.max(0,target.hp-hpDamage);
  target.flash=0.12;
  return hpDamage;
}

function burst(state,x,y,life=.3,count=8,speed=140,color='#fff'){for(let i=0;i<count;i++){const a=Math.random()*TAU,s=speed*(.35+Math.random());state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,maxLife:life,size:1.5+Math.random()*3,color});}}

function addFeed(state,text){state.feed.unshift(text);state.feed.splice(6);}

export function fireWeapon(state,owner,weaponId,angle){
  const gun=owner.weapons?.[weaponId];
  if(!gun||gun.reloading>0||gun.cooldown>0||gun.mag<=0)return false;
  const weapon=WEAPONS[weaponId];
  gun.mag--;gun.cooldown=1/weapon.fireRate;owner.angle=angle;
  const muzzleX=owner.x+Math.cos(angle)*32,muzzleY=owner.y+Math.sin(angle)*32;
  burst(state,muzzleX,muzzleY,0.16,6,110,weapon.color);
  state.shake=Math.max(state.shake,weaponId==='rail'?10:4);
  for(let i=0;i<weapon.pellets;i++){
    const a=angle+(Math.random()-.5)*weapon.spread;
    state.projectiles.push({x:muzzleX,y:muzzleY,vx:Math.cos(a)*weapon.speed,vy:Math.sin(a)*weapon.speed,r:3,life:1.6,damage:weapon.damage,owner:owner.id,color:weapon.color,trail:[]});
  }
  return true;
}

export function reloadWeapon(player){
  const gun=player.weapons[player.weapon],w=WEAPONS[player.weapon];
  if(gun&&!gun.reloading&&gun.mag<w.magazine&&gun.reserve>0)gun.reloading=w.reload;
}

function finishReload(player,id){const gun=player.weapons[id],w=WEAPONS[id];if(!gun)return;const take=Math.min(w.magazine-gun.mag,gun.reserve);gun.mag+=take;gun.reserve-=take;gun.reloading=0;}

function lineClear(a,b){
  const steps=Math.ceil(distance(a,b)/22);
  for(let i=1;i<steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;if(WALLS.some(w=>x>w.x&&x<w.x+w.w&&y>w.y&&y<w.y+w.h))return false;}
  return true;
}

function respawnBot(state,bot){const s=SPAWNS[(bot.index+1)%SPAWNS.length];bot.x=s.x;bot.y=s.y;bot.hp=bot.maxHp;bot.armor=bot.maxArmor;bot.respawn=0;bot.state='patrol';}

function updateBot(state,bot,dt){
  if(bot.respawn>0){bot.respawn-=dt;if(bot.respawn<=0)respawnBot(state,bot);return;}
  bot.cooldown=Math.max(0,bot.cooldown-dt);bot.think-=dt;bot.flash=Math.max(0,bot.flash-dt);
  const p=state.player,d=distance(bot,p),visible=d<850&&lineClear(bot,p);
  if(visible)bot.state=d<240&&bot.hp<40?'retreat':'engage';else if(bot.think<=0)bot.state='patrol';
  let dx=0,dy=0;
  if(bot.state==='engage'||bot.state==='retreat'){
    bot.angle=angleTo(bot,p);const sign=bot.state==='retreat'?-1:1;
    if(d>390){dx=Math.cos(bot.angle);dy=Math.sin(bot.angle);}else if(d<210){dx=-Math.cos(bot.angle);dy=-Math.sin(bot.angle);}else{dx=Math.cos(bot.angle+Math.PI/2)*bot.strafe;dy=Math.sin(bot.angle+Math.PI/2)*bot.strafe;}
    if(visible&&bot.state==='engage'&&bot.cooldown<=0){
      bot.cooldown=.18+Math.random()*.28;bot.strafe=Math.random()<.5?-1:1;
      const a=bot.angle+(Math.random()-.5)*.065;
      state.projectiles.push({x:bot.x+Math.cos(a)*30,y:bot.y+Math.sin(a)*30,vx:Math.cos(a)*720,vy:Math.sin(a)*720,r:3,life:1.8,damage:9,owner:bot.id,color:'#ff6688',trail:[]});
    }
    if(sign<0){dx*=-1;dy*=-1;}
  }else{
    if(bot.think<=0){bot.think=.7+Math.random()*1.8;bot.wander=Math.random()*TAU;}
    dx=Math.cos(bot.wander);dy=Math.sin(bot.wander);
  }
  const len=Math.hypot(dx,dy)||1;moveCircle(bot,dx/len*bot.speed*dt,dy/len*bot.speed*dt);
}

function hitsWall(p){return WALLS.some(w=>p.x>w.x&&p.x<w.x+w.w&&p.y>w.y&&p.y<w.y+w.h);}

function updateProjectiles(state,dt){
  for(let i=state.projectiles.length-1;i>=0;i--){
    const pr=state.projectiles[i];pr.life-=dt;pr.trail.push({x:pr.x,y:pr.y});if(pr.trail.length>7)pr.trail.shift();
    pr.x+=pr.vx*dt;pr.y+=pr.vy*dt;
    if(pr.life<=0||pr.x<0||pr.y<0||pr.x>WORLD.width||pr.y>WORLD.height||hitsWall(pr)){burst(state,pr.x,pr.y,.18,4,80,pr.color);state.projectiles.splice(i,1);continue;}
    if(pr.owner==='player'){
      for(const bot of state.bots){if(bot.respawn>0)continue;if(distance(pr,bot)<=bot.r+pr.r){state.player.damageDealt+=damageActor(bot,pr.damage);burst(state,bot.x,bot.y,.24,10,130,'#ff6688');state.projectiles.splice(i,1);
        if(bot.hp<=0){state.score+=100;state.player.kills++;state.player.streak++;state.player.coins+=15;state.killBanner=1.3;addFeed(state,`PLAYER eliminated ${bot.name}  +100`);bot.respawn=1.4;}break;}}
    }else if(distance(pr,state.player)<=state.player.r+pr.r){damageActor(state.player,pr.damage);burst(state,state.player.x,state.player.y,.22,8,100,'#ff6688');state.shake=Math.max(state.shake,7);state.player.streak=0;state.projectiles.splice(i,1);if(state.player.hp<=0){state.player.deaths++;state.player.x=WORLD.width/2;state.player.y=WORLD.height/2;state.player.hp=state.player.maxHp;state.player.armor=Math.round(state.player.maxArmor*.6);state.player.coins=Math.max(0,state.player.coins-10);addFeed(state,'PLAYER respawned  -10 coins');}}
  }
}

function updatePickups(state,dt){
  for(const item of state.pickups){item.phase+=dt*2;if(distance(item,state.player)<38){let collected=false;if(item.type==='health'){state.player.hp=Math.min(state.player.maxHp,state.player.hp+item.value);collected=true;}if(item.type==='armor'){state.player.armor=Math.min(state.player.maxArmor,state.player.armor+item.value);collected=true;}if(item.type==='ammo'){state.player.weapons[state.player.weapon].reserve+=item.value;collected=true;}if(item.type==='coins'){state.player.coins+=item.value;collected=true;}if(collected){addFeed(state,`Supply acquired: ${item.type.toUpperCase()}`);const s=SPAWNS[Math.floor(Math.random()*SPAWNS.length)];item.x=s.x;item.y=s.y;burst(state,item.x,item.y,.28,10,100,'#6cffae');}}}
}
function updateParticles(state,dt){for(let i=state.particles.length-1;i>=0;i--){const q=state.particles[i];q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.94;q.vy*=.94;if(q.life<=0)state.particles.splice(i,1);}}

export function purchase(state,itemId){
  const item=SHOP.find(x=>x.id===itemId);if(!item||state.player.coins<item.cost)return false;
  state.player.coins-=item.cost;
  if(item.id==='armor'){state.player.maxArmor+=25;state.player.armor=state.player.maxArmor;}
  else if(item.id==='med')state.player.hp=Math.min(state.player.maxHp,state.player.hp+40);
  else if(item.id==='ammo')state.player.weapons[state.player.weapon].reserve+=80;
  else {if(!state.player.weapons[item.id])state.player.weapons[item.id]=makeWeapon(item.id);state.player.weapon=item.id;}
  addFeed(state,`Purchased ${item.title}  -${item.cost}`);return true;
}

export function updateGame(state,input,dt){
  if(state.matchOver||state.paused)return;
  dt=Math.min(Math.max(dt,0),0.033);state.time=Math.max(0,state.time-dt);
  if(state.time<=0){state.matchOver=true;return;}
  const p=state.player;
  for(const id of Object.keys(p.weapons)){const gun=p.weapons[id];gun.cooldown=Math.max(0,gun.cooldown-dt);if(gun.reloading>0){gun.reloading=Math.max(0,gun.reloading-dt);if(gun.reloading===0)finishReload(p,id);}}
  const mx=(input.right?1:0)-(input.left?1:0),my=(input.down?1:0)-(input.up?1:0),len=Math.hypot(mx,my)||1;
  const speed=p.speed*(input.sprint?1.52:1)*(input.aim?0.66:1);moveCircle(p,mx/len*speed*dt,my/len*speed*dt);
  p.angle=Number.isFinite(input.mouseAngle)?input.mouseAngle:p.angle;p.aiming=!!input.aim;p.flash=Math.max(0,p.flash-dt);
  if(input.reload)reloadWeapon(p);
  if(input.fire&&p.weapons[p.weapon].mag===0)reloadWeapon(p);
  if(input.fire)fireWeapon(state,p,p.weapon,p.angle);
  for(const bot of state.bots)updateBot(state,bot,dt);
  updateProjectiles(state,dt);updatePickups(state,dt);updateParticles(state,dt);state.shake=Math.max(0,state.shake-dt*30);state.killBanner=Math.max(0,state.killBanner-dt);
}
