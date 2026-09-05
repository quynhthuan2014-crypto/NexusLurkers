import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameState, damageActor, fireWeapon, purchase, updateGame, moveCircle, WALLS, WORLD } from '../game/game-core.js';

test('creates a valid match state',()=>{
  const s=createGameState(42);
  assert.equal(s.version,2); assert.equal(s.time,600); assert.equal(s.bots.length,4); assert.equal(s.player.weapon,'pistol');
  assert.equal(s.player.weapons.pistol.mag,12); assert.equal(s.pickups.length,4);
});

test('damage uses armor before health',()=>{
  const a={armor:50,hp:100,flash:0};
  const hp=damageActor(a,20);
  assert.equal(a.armor,39); assert.equal(a.hp,91); assert.equal(hp,9);
});

test('fire consumes one shot and creates projectile',()=>{
  const s=createGameState(3); const before=s.player.weapons.pistol.mag;
  assert.equal(fireWeapon(s,s.player,'pistol',0),true); assert.equal(s.player.weapons.pistol.mag,before-1); assert.equal(s.projectiles.length,1);
  assert.equal(fireWeapon(s,s.player,'pistol',0),false);
});

test('shop purchases require enough coins and equip weapons',()=>{
  const s=createGameState(4); s.player.coins=100;
  assert.equal(purchase(s,'burst'),true); assert.equal(s.player.weapon,'burst'); assert.equal(s.player.coins,20);
  assert.equal(purchase(s,'rail'),false); assert.equal(s.player.coins,20);
});

test('movement collides with walls and world bounds',()=>{
  const s=createGameState(5); const a={x:WORLD.margin,y:WORLD.margin,r:25}; moveCircle(a,-1000,0); assert.equal(a.x,WORLD.margin); moveCircle(a,0,-1000); assert.equal(a.y,WORLD.margin);
  const w=WALLS[0]; const b={x:w.x-40,y:w.y+30,r:25}; const before=b.x; moveCircle(b,100,0); assert.equal(b.x,before);
});

test('update clamps extreme delta and advances time',()=>{
  const s=createGameState(6); const before=s.time;
  updateGame(s,{up:false,down:false,left:false,right:false,sprint:false,fire:false,aim:false,mouseAngle:0,reload:false},10);
  assert.equal(s.time,before-0.033); assert.ok(Number.isFinite(s.player.x));
});

test('match ends at zero time',()=>{
  const s=createGameState(7); s.time=.01;
  updateGame(s,{up:false,down:false,left:false,right:false,sprint:false,fire:false,aim:false,mouseAngle:0,reload:false},.1);
  assert.equal(s.matchOver,true); assert.equal(s.time,0);
});
