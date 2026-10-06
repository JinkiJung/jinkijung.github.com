import { damageEnemyOnce } from './enemyDamage';
import { combatTutorial } from './combatTutorial';
import { createEvidence } from '../leaderboard/evidence';
import type { RankedRun } from '../leaderboard/client';
import type { Completion } from '../leaderboard/protocol';
import { drawEnemySprite, randomEnemySkin, JUGGERNAUT_SKIN } from './enemySprite';
import { createBonuses, type BonusKind } from './bonus';
import { drawPlayerSprite, playerFrame } from './playerSprite';
import { createRun } from './run';
import { oilChargeTravel } from './charger';
import { penaltyAt, penaltyInput, PENALTY_LABELS } from './penalties';
import { chargeTravel, chargeKnockback, createChargePlanner, chargerMilestones, CHARGER_HP, CHARGER_RADIUS } from './charger';
import { collideSpikes, drawShuriken } from './spikes';
import { createWeapons, OIL_SIZE, burnTick, piercedEnemies, mineFuse, triggersMine, SPECS, drawWeapon, spikeMotion, type Weapon } from './weapons';
import { createPits, crossesPit, playerCrossesPit, FALL_DURATION } from './pits';
import { createConcretePlates } from './concrete';
import { createScore } from './score';
import { createRespawnPicker, enemySpawnClear } from './respawn';
import { createDeathMarks } from './death';
import { createImpacts } from './impact';
import { createStruggle } from './struggle';
import { meleeFan, meleeHitsBody, recoilStep, MELEE_COOLDOWN } from './melee';
import { keyFacing, cardinalFacing, heldFacing } from './facing';
import { onIce, surfaceMotion, enemySurfaceMotion, resetOilMotion, resolveSurfaceCollision } from './ice';
import { followPage } from './camera';
import { drawMovementHint, drawCombatHint } from './movementHint';
import { TextNavigation, moveBody, routeWaypoint, type Point } from './navigation';
import { GlassRenderer } from './GlassRenderer';
import { hitTextMask, segmentCircle, reflectText, safeMuzzle } from './textCollision';
import type { captureGameWorld } from './stages';

type Bullet = { x: number; y: number; vx: number; vy: number; life: number; enemy: boolean; bounces: number; trailX: number; trailY: number; damage: number; spike: boolean; selfSafe: number; piercing: boolean; hitMask: Set<number> };
type Spark = Bullet & { color: string };
export type GameControls = { developer:boolean; weapon:Weapon; preview:boolean; paused?:boolean; finish?:()=>void; touchInput?: (code:string,down:boolean)=>void };
export type Stats = { playerNearTop?:boolean; completion?:Completion; lives:number; ended:boolean; seconds:number; completedAt:string; fps: number; broken: number; total: number; hp: number; penalty: string; weapon: Weapon; score: number; kills: number; enemies: number };

export function startGame(surface: HTMLCanvasElement, actors: HTMLCanvasElement, snapshot: Awaited<ReturnType<typeof captureGameWorld>>, onStats: (stats: Stats) => void, onError: () => void, getControls:()=>GameControls, rankedRun: RankedRun) {
  const { width: w, height: h, viewportHeight: viewH } = snapshot;
  let cameraY = Math.max(0, Math.min(h - viewH, snapshot.initialScrollY));
  const glass = new GlassRenderer(surface, snapshot.tiles, w, h, snapshot.targets, viewH, snapshot.iceRegions, snapshot.stageFloors, snapshot.careerRegions, snapshot.penaltyRegions);
  const ctx = actors.getContext('2d')!;
  const ratio = Math.min(devicePixelRatio, 1.5);
  actors.width = Math.round(w * ratio); actors.height = Math.round(viewH * ratio);
  ctx.scale(ratio, ratio);
  const player = { x: w / 2, y: cameraY + viewH * .62, angle: -Math.PI / 2, step: 0, burnTime: 0, vx: 0, vy: 0 };
  const keys = new Set<string>();
  const bullets: Bullet[] = Array.from({ length: 64 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, enemy: false, bounces: 0, trailX: 0, trailY: 0, damage: 1, piercing: false, hitMask: new Set<number>(), spike: false, selfSafe: 0 }));
  const sparks: Spark[] = Array.from({ length: 320 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, enemy: false, bounces: 0, trailX: 0, trailY: 0, damage: 1, piercing: false, hitMask: new Set<number>(), spike: false, selfSafe: 0, color: '#fff' }));
  const controller = new AbortController(), opts = { signal: controller.signal };
  let queuedShot = false, queuedMelee = false, queuedStruggle = false;
  const struggle = createStruggle();
  let knockPlayerOwned = true;
  let meleeCooldown = 0, swingLife = 0, knockTime = 0, knockX = 0, knockY = 0;
  const swingHits = new Set<number>();
  let swingRebounded = false;
  let swing: { x: number; y: number; rays: { dx: number; dy: number }[] } | null = null;
  let paused = false, lastShot = 0, frame = 0, last = performance.now(), lastReport = last, frames = 0;
  const pits = createPits(snapshot.pits,ctx=>drawPlayerSprite(ctx),(ctx,skin)=>drawEnemySprite(ctx,skin));
  const concrete = createConcretePlates(snapshot.concretePlates);
  const weapons = createWeapons(snapshot.careerRegions);
  let flame: {x:number;y:number;rays:{dx:number;dy:number}[];life:number} | null = null;
  const evidence = createEvidence(glass.totalArea);
  glass.onDestroy = (id, area, owner) => evidence.destroy(id, area, owner);
  const score = createScore(evidence);
  const bonuses=createBonuses();
  const awardBonus=(x:number,y:number,kind:BonusKind)=>{if(!run.ended){score.bonus(kind);bonuses.add(x,y,kind);}};
  const playerDestruction = (destroy: () => void) => {
    const before = glass.brokenCount;
    glass.attributed('player', destroy); score.glass(before, glass.brokenCount);
  };
  const impacts = createImpacts();
  const deathMarks = createDeathMarks();
  let hurtFlash = 0;
  let recoil = 0, hp = 5, kills = 0, invulnerable = 0;
  const enemies = Array.from({ length: 4 }, (_, i) => ({ skin:randomEnemySkin(), x: i % 2 ? w - 45 : 45, y: cameraY + 110 + i * (viewH - 180) / 4, hp: 3, cooldown: 1 + i * .5, respawn: 0, phase: i * 1.7, path: [] as Point[], planIn: i * .18, visible: false, vx: 0, vy: 0, hitFlash: 0, stagger: 0, burnTime: 0, charger: false, maxHp: 3, chargeAngle: 0, chargeOily: false, chargeOilDeflected:false, chargeState: 0, chargeTimer: .8, trailTimer: 0, knockTime: 0, knockX: 0, knockY: 0, chargeHits: new Set<object>() }));
  const textHit = (x: number, y: number, dx: number, dy: number) => hitTextMask(snapshot.textMask, snapshot.textCanvas.width, snapshot.textCanvas.height, snapshot.textCanvas.width / w, snapshot.textCanvas.height / h, x, y, dx, dy);

  const muzzleHit = (x: number, y: number, dx: number, dy: number) => Math.min(textHit(x, y, dx, dy), concrete.hitTest(x, y, dx, dy).t);

  const navigation = new TextNavigation(w, h, snapshot.textMask, snapshot.textCanvas.width, snapshot.textCanvas.height);
  const pickRespawn = createRespawnPicker(navigation, snapshot.pits);
  Object.assign(player, navigation.nearestFree(player));
  const pickEnemySpawn=()=>pickRespawn(cameraY,viewH,Math.random,undefined,p=>enemySpawnClear(p,player));
  enemies.forEach(enemy => {
    const preferred=navigation.nearestFree(enemy);
    const spawn=enemySpawnClear(preferred,player)?preferred:pickEnemySpawn();
    if(spawn)Object.assign(enemy,spawn);
    else {enemy.hp=0;enemy.respawn=.5;}
  });

  const run=createRun(()=>getControls().developer);
  let completedAt="", respawnPending=false;
  let playerFalling = 0;
  const finishRun = () => {
    if (rankedRun.completion) return;
    if (getControls().developer) rankedRun.markDeveloper();
    run.finish();
    const completion = rankedRun.finish(score.points, evidence.snapshot());
    completedAt = completion.completedAt;
    keys.clear(); queuedShot = queuedMelee = queuedStruggle = false;
    onStats({ fps: 0, broken: glass.brokenArea, total: glass.totalArea, hp, penalty: '', weapon: weapons.equipped, score: score.points, kills, enemies: enemies.filter(e => e.hp > 0).length, lives: run.lives, ended: true, seconds: Math.floor(completion.playDurationSeconds), completedAt, completion });
  };
  getControls().finish = finishRun;
  const diePlayer = (leaveMark = true) => {
    if(run.ended)return;
    if(!respawnPending){
      respawnPending=true;
      if(run.die()){
        hp=0;finishRun();
        return;
      }
    }
    if (leaveMark) deathMarks.add(player.x, player.y, true);
    resetOilMotion(player);hp = 5; player.burnTime = 0; invulnerable = 3; weapons.reset(); flame = null;
    struggle.reset(); queuedStruggle = false; knockTime = 0;
    swingLife = 0; queuedMelee = false; player.vx = 0; player.vy = 0;
    const bounds={top:cameraY+viewH*.15,bottom:cameraY+viewH*.85};
    const spawn=pickRespawn(cameraY,viewH,Math.random,bounds,p=>glass.canStand(p.x,p.y) && !weapons.burning(p.x,p.y))
      ?? pickRespawn(cameraY,viewH,Math.random,bounds,p=>!weapons.burning(p.x,p.y));
    if(spawn){
      Object.assign(player,spawn);respawnPending=false;
      // If this viewport has no exposed ground, clear a safe landing footprint.
      glass.openFootprint(spawn.x,spawn.y,34);
    } else {playerFalling=.1;hp=0;}
    keys.clear(); queuedShot = false;
  };

  const prepareGround = (from: Point, to: Point) => {
    glass.openFootprint(from.x, from.y);
    glass.openFootprint(to.x, to.y);
    return glass.canStand(to.x, to.y);
  };
  const playerRecoilGround = (from: Point, to: Point) => {
    let clear = false;
    playerDestruction(() => { clear = prepareGround(from, to); });
    return clear;
  };
  let hintIn = 0, trapped = true;

  const pressKey = (code:string, repeat=false) => {
    if(run.ended || (getControls().preview || getControls().paused) || playerFalling>0)return;
    const facing=keyFacing(code);
    if(facing===undefined && code!=='KeyX' && code!=='KeyZ')return;
    if(!keys.has(code)){
      combatTutorial.press(code);
      if(facing!==undefined){
        player.angle=facing;
        if(struggle.press(facing,performance.now(),repeat))queuedStruggle=true;
      }else if(code==='KeyX')queuedShot=true;
      else queuedMelee=true;
    }
    keys.add(code);
  };
  const releaseKey = (code:string) => {
    keys.delete(code);
    if(keyFacing(code)!==undefined)player.angle=heldFacing(keys,player.angle);
  };
  getControls().touchInput=(code,down)=>down?pressKey(code):releaseKey(code);
  window.addEventListener('keydown', e => {
    if(e.target instanceof HTMLElement && e.target.closest('input,select,button,textarea'))return;
    if(keyFacing(e.code)===undefined && e.code!=='KeyX' && e.code!=='KeyZ')return;
    e.preventDefault();pressKey(e.code,e.repeat);
  },opts);
  window.addEventListener('keyup',e=>releaseKey(e.code),opts);
  const resetInput = () => { keys.clear(); struggle.reset(); queuedStruggle = false; queuedShot = false; queuedMelee = false; swingLife = 0; knockTime = 0; knockX = knockY = 0; player.vx = 0; player.vy = 0; };
  window.addEventListener('blur', resetInput, opts);
  window.addEventListener('focusin', e=>{if(e.target instanceof HTMLElement && e.target.closest('input,select,button,textarea'))resetInput();},opts);
  surface.addEventListener('webglcontextlost', e => { e.preventDefault(); onError(); }, opts);

  let chargersAdded = 0, shake = 0;
  const chargeJobs = new Map<typeof enemies[number], Generator<null,Point[]>>();
  let chargePlanner: ReturnType<typeof createChargePlanner> | null = null, chargePlanTime = 0, chargePlanCamera = -1;
  const total = glass.totalArea;
  const burst = (x: number, y: number, welding = false, incoming = 0, light = false) => {
    if (y < cameraY - 40 || y > cameraY + viewH + 40) return;
    let count = 0;
    for (const p of sparks) if (!p.life) {
      const angle = welding ? incoming + Math.PI + (Math.random() - .5) * 2.8 : Math.random() * Math.PI * 2, speed = welding ? 130 + Math.random() * 500 : 60 + Math.random() * 220;
      p.x = x; p.y = y; p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed;
      p.life = light ? .1 + Math.random() * .16 : .2 + Math.random() * (welding ? .55 : .3); p.color = welding ? (count % 3 === 0 ? '#fff' : count % 3 === 1 ? '#ffd36a' : '#ff952f') : count % 3 ? '#bdfff3' : '#fff';
      if (++count === (light ? (welding ? 8 : 6) : (welding ? 18 : 14))) break;
    }
  };

  const hurtEnemy = (enemy: typeof enemies[number], damage: number, playerOwned = true, collision = false) => {
    if(run.ended || enemy.hp<=0)return;
    damageEnemyOnce(enemy, damage, () => {
      if(playerOwned){kills++;score.kill(enemy.charger);}
      else if(collision && !enemy.charger)awardBonus(enemy.x,enemy.y,'collision');
    });enemy.hitFlash=.11;
    impacts.add(enemy.x,enemy.y,'shot');

  };

  function tick(now: number) {
    const dt = Math.min((now - last) / 1000, .035); last = now;
    if(run.ended || getControls().preview || getControls().paused){keys.clear();queuedShot=queuedMelee=queuedStruggle=false;lastReport=now;frames=0;frame=requestAnimationFrame(tick);return;}
    if (getControls().developer) rankedRun.markDeveloper();
    run.advance(dt);
    chargePlanTime-=dt;
    pits.update(dt); shake=Math.max(0,shake-dt);
    if (playerFalling > 0) {
      playerFalling = Math.max(0, playerFalling - dt);
      if (!playerFalling) diePlayer(false);
      if (run.ended) return;
    }
    concrete.update(dt, (strip, playerOwned) => {
      const before = glass.brokenCount;
      glass.attributed(playerOwned ? 'slab' : 'npc', () => glass.crushStrip(strip));
      score.glass(before, glass.brokenCount, playerOwned);
    });
    const bridges = concrete.supportRegions();
    if (flame) flame.life = Math.max(0, flame.life - dt);
    weapons.update(dt, player, !playerFalling, (index) => glass.careerUnlocked(index), (x,y) => navigation.clearShot(player,{x,y}));
    if(getControls().developer)weapons.equip(getControls().weapon);
    if(run.ended){frame=requestAnimationFrame(tick);return;}
    impacts.update(dt);bonuses.update(dt);
    deathMarks.update(dt);
    hurtFlash = Math.max(0, hurtFlash - dt);
    for (const enemy of enemies) {
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      enemy.stagger = Math.max(0, enemy.stagger - dt);
    }
    meleeCooldown = Math.max(0, meleeCooldown - dt);
    swingLife = Math.max(0, swingLife - dt);
    if (queuedMelee) {
      queuedMelee = false;
      if (!meleeCooldown) {
        swingLife = .18; swingHits.clear(); swingRebounded = false;
        meleeCooldown = MELEE_COOLDOWN;
      }
    }
    if (queuedStruggle) {
      queuedStruggle = false;
      const beforeArea=glass.brokenArea;
      playerDestruction(() => glass.openFootprint(player.x, player.y, 34));
      if(glass.brokenArea>beforeArea)combatTutorial.spaceOpened();
      hintIn = 0;
    }
    let mx = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
    let my = Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'));
    const penalty=penaltyAt(player.x,player.y,snapshot.penaltyRegions,(x,y)=>glass.canStand(x,y,1));
    const input=penaltyInput(mx,my,penalty);mx=input.x;my=input.y;
    if(penalty && (mx || my))player.angle=cardinalFacing(mx,my);
    if(penalty?.kind==='no-fire')queuedShot=false;
    const length = Math.hypot(mx, my);
    if (length) { mx /= length; my /= length;  }
    const recoiling = knockTime > 0;
    const playerOily=weapons.oily(player.x,player.y);
    let playerMotion;
    if (playerFalling > 0) playerMotion = { x: 0, y: 0 };
    else if (knockTime > 0) {
      const kick = recoilStep(knockX, knockY, Math.min(dt, knockTime));
      knockTime = Math.max(0, knockTime - dt); knockX = kick.vx; knockY = kick.vy;
      playerMotion = kick;
    } else playerMotion = surfaceMotion(player, mx * 270, my * 270, (penalty?.kind==='ice' || onIce(player.x, player.y, snapshot.iceRegions)), dt, playerOily);
    const playerBeforeX = player.x, playerBeforeY = player.y;
    moveBody(navigation, player, playerMotion.x, playerMotion.y, recoiling ? (knockPlayerOwned ? playerRecoilGround : prepareGround) : (_from, to) => glass.canStand(to.x, to.y));
    const playerMoving=!playerFalling && !recoiling && Math.hypot(player.x-playerBeforeX,player.y-playerBeforeY)>.01;
    player.step=playerMoving?player.step+dt:0;
    resolveSurfaceCollision(player,playerMotion,{x:player.x-playerBeforeX,y:player.y-playerBeforeY},playerOily && !recoiling && !playerFalling);
    if (!playerFalling && playerCrossesPit(playerBeforeX, playerBeforeY, player.x, player.y, snapshot.pits, bridges, recoiling, knockTime)) {
      pits.fall(player.x, player.y, true, player.angle, recoiling ? player.x : playerBeforeX, recoiling ? player.y : playerBeforeY);
      playerFalling = FALL_DURATION; hp = 0; keys.clear();
      queuedShot = queuedMelee = queuedStruggle = false;
      swingLife = knockTime = 0; player.vx = player.vy = 0;
    }
    // The active hitbox and its visual use the same current player pose.
    if (swingLife > 0) {
      const attack = meleeFan(player.x, player.y, player.angle, textHit);
      swing = { x: player.x, y: player.y, rays: attack.rays };
      playerDestruction(() => glass.shatterFan(player.x, player.y, attack.rays));
      for (const index of concrete.meleeHits(player.x, player.y, attack.rays)) {
        if (concrete.topple(index, true)) score.topple();
      }
      enemies.forEach((enemy, index) => {
        if (enemy.hp <= 0 || swingHits.has(index) || !meleeHitsBody(player.x, player.y, attack.rays, enemy.x, enemy.y, enemy.charger?26:17)) return;
        swingHits.add(index); damageEnemyOnce(enemy, 2.5, () => { kills++; score.kill(enemy.charger); }); burst(enemy.x, enemy.y);
        enemy.hitFlash = .16; enemy.stagger = .055;
        impacts.add(enemy.x, enemy.y, 'melee');

      });
      if (attack.impact && !swingRebounded) {
        swingRebounded = true;
        burst(attack.impact.x, attack.impact.y, true, player.angle);
        knockX = -Math.cos(player.angle) * 520; knockY = -Math.sin(player.angle) * 520;
        knockTime = .32; knockPlayerOwned = true; player.vx = player.vy = 0;
      }
    }
    hintIn -= dt;
    if (knockTime > 0 || Math.hypot(player.x - playerBeforeX, player.y - playerBeforeY) > .01) trapped = false;
    else if (hintIn <= 0) {
      const exits = [{x:player.x+28,y:player.y},{x:player.x-28,y:player.y},{x:player.x,y:player.y+28},{x:player.x,y:player.y-28}].filter(p => navigation.canMove(player,p));
      trapped = !glass.canStand(player.x, player.y) || (exits.length > 0 && exits.every(p => !glass.canStand(p.x,p.y)));
      hintIn = .15;
    }
    if(!playerFalling)cameraY = followPage(cameraY, player.y, viewH, h, dt);
    invulnerable = Math.max(0, invulnerable - dt);
    while(chargersAdded < chargerMilestones(kills)) {
      chargersAdded++;
      enemies.push({...enemies[0],charger:true,maxHp:CHARGER_HP,hp:0,respawn:.1,path:[],chargeHits:new Set<object>(),knockTime:0,knockX:0,knockY:0,chargeState:0,chargeOily:false,chargeOilDeflected:false,chargeTimer:.8,trailTimer:0,vx:0,vy:0});
    }
    for (const enemy of enemies) {
      if (enemy.hp <= 0) {
        enemy.respawn -= dt;
        if (enemy.respawn <= 0) { const spawn = pickEnemySpawn(); if (!spawn) { enemy.respawn = .5; continue; } Object.assign(enemy, spawn); if(!enemy.charger)enemy.skin=randomEnemySkin(); enemy.path = []; enemy.planIn = 0; enemy.visible = false; enemy.vx = 0; enemy.vy = 0; resetOilMotion(enemy);enemy.knockTime=0;enemy.chargeHits.clear();enemy.hp = enemy.maxHp; enemy.chargeState=0;enemy.chargeOily=false;enemy.chargeOilDeflected=false;enemy.chargeTimer=.8; enemy.burnTime = 0; enemy.hitFlash = 0; enemy.stagger = 0; enemy.cooldown = 1.5; }
        continue;
      }
      if(enemy.knockTime>0){
        const kick=recoilStep(enemy.knockX,enemy.knockY,Math.min(dt,enemy.knockTime));
        enemy.knockTime=Math.max(0,enemy.knockTime-dt);enemy.knockX=kick.vx;enemy.knockY=kick.vy;
        const next=chargeTravel(enemy.x,enemy.y,Math.atan2(kick.y,kick.x),Math.hypot(kick.x,kick.y),(x,y)=>{
          const radius=enemy.charger?26:18;
          if(!navigation.free({x,y},radius) || concrete.hitTest(x-radius,y,2*radius,0).t!==Infinity || concrete.hitTest(x,y-radius,0,2*radius).t!==Infinity)return false;
          glass.openFootprint(x,y,radius+3);return true;
        });
        enemy.x=next.x;enemy.y=next.y;
        if(!enemy.knockTime && crossesPit(enemy.x,enemy.y,enemy.x,enemy.y,snapshot.pits,bridges)){
          pits.fall(enemy.x,enemy.y,false,enemy.charger?enemy.chargeAngle:0,enemy.x,enemy.y,enemy.charger?JUGGERNAUT_SKIN:enemy.skin);enemy.hp=0;enemy.respawn=4;
        }
        continue;
      }
      if(enemy.charger){
        if(enemy.y < cameraY || enemy.y > cameraY+viewH)continue;
        const radius=CHARGER_RADIUS;
        const free=(x:number,y:number)=>x>=radius && x<=w-radius && y>=cameraY+radius && y<=cameraY+viewH-radius &&
          navigation.free({x,y},radius) &&
          concrete.hitTest(x-radius,y,2*radius,0).t===Infinity && concrete.hitTest(x,y-radius,0,2*radius).t===Infinity;
        const routeFree=(x:number,y:number)=>free(x,y) && !crossesPit(x,y,x,y,snapshot.pits,bridges);
        if(!chargePlanner || chargePlanTime<=0 || Math.abs(cameraY-chargePlanCamera)>16){
          chargePlanner=createChargePlanner(w,cameraY,cameraY+viewH,routeFree);
          chargePlanTime=.75;chargePlanCamera=cameraY;
        }
        if(enemy.chargeState===0){
          enemy.planIn-=dt;
          if(enemy.planIn<=0){
            enemy.visible=!playerFalling && chargePlanner.clear(enemy,player);
            if(enemy.visible){enemy.path=[];chargeJobs.delete(enemy);}
            else if(!chargeJobs.has(enemy))chargeJobs.set(enemy,chargePlanner.beginRoute({...enemy},{...player}));
            enemy.planIn=.65+enemy.phase%1*.2;
          }
          if(enemy.visible && !playerFalling && chargePlanner.clear(enemy,player)){
            enemy.chargeAngle=Math.atan2(player.y-enemy.y,player.x-enemy.x);
            enemy.chargeState=1;enemy.chargeTimer=.8;enemy.path=[];
          } else {
            enemy.visible=false;
            while(enemy.path.length && Math.hypot(enemy.path[0].x-enemy.x,enemy.path[0].y-enemy.y)<3)enemy.path.shift();
            const waypoint=enemy.path[0];
            if(waypoint){
              const angle=Math.atan2(waypoint.y-enemy.y,waypoint.x-enemy.x);
              const next=chargeTravel(enemy.x,enemy.y,angle,Math.min(95*dt,Math.hypot(waypoint.x-enemy.x,waypoint.y-enemy.y)),(x,y)=>{
                if(!routeFree(x,y))return false;
                glass.openFootprint(x,y,radius+3);return true;
              });
              enemy.x=next.x;enemy.y=next.y;enemy.chargeAngle=angle;
              if(next.hit){enemy.path=[];enemy.planIn=0;}
            }
          }
        } else if(enemy.chargeState===1){
          enemy.chargeTimer-=dt;if(enemy.chargeTimer<=0){enemy.chargeState=2;enemy.chargeOily=false;enemy.chargeOilDeflected=false;enemy.chargeHits.clear();}
        } else if(enemy.chargeState===2){
          const beforeX=enemy.x,beforeY=enemy.y;
          const next=oilChargeTravel(enemy,enemy.x,enemy.y,620*dt,(x,y)=>{
            if(!free(x,y))return false;
            glass.openFootprint(x,y,radius+3);return true;
          },(x,y)=>weapons.oily(x,y));
          enemy.x=next.x;enemy.y=next.y;
          enemy.trailTimer-=dt;
          if(enemy.trailTimer<=0){
            enemy.trailTimer=.04;
            let count=0;
            for(const p of sparks)if(!p.life){
              const side=(Math.random()-.5)*radius*2;
              p.x=enemy.x-Math.cos(enemy.chargeAngle)*20-Math.sin(enemy.chargeAngle)*side;
              p.y=enemy.y-Math.sin(enemy.chargeAngle)*20+Math.cos(enemy.chargeAngle)*side;
              p.vx=-Math.cos(enemy.chargeAngle)*100;p.vy=-Math.sin(enemy.chargeAngle)*100;
              p.life=.16+Math.random()*.15;p.color=count%2?'#ff813d':'#ffd57a';if(++count===4)break;
            }
          }
          const contacts=(target:Point,targetRadius:number)=>!enemy.chargeHits.has(target) &&
            segmentCircle(beforeX,beforeY,enemy.x-beforeX,enemy.y-beforeY,target.x,target.y,radius+targetRadius)<=1 && navigation.clearShot(enemy,target);
          if(!playerFalling && !invulnerable && contacts(player,16)){
            enemy.chargeHits.add(player);
            hp=Math.max(0,hp-2);invulnerable=1;hurtFlash=.24;impacts.add(player.x,player.y,'player');
            if(!hp) { diePlayer(); if(run.ended)return; }
            else {
              const kick=chargeKnockback(enemy.chargeAngle,{x:beforeX,y:beforeY},player);
              knockX=kick.vx;knockY=kick.vy;knockTime=.32;knockPlayerOwned=false;player.vx=player.vy=0;
            }
          }
          for(const target of enemies)if(target!==enemy && target.hp>0 && contacts(target,target.charger?26:17)){
            enemy.chargeHits.add(target);hurtEnemy(target,2,false,true);
            if(target.hp>0){
              const kick=chargeKnockback(enemy.chargeAngle,{x:beforeX,y:beforeY},target);
              target.knockX=kick.vx;target.knockY=kick.vy;target.knockTime=.32;target.vx=target.vy=0;
              target.path=[];target.planIn=0;target.chargeState=0;chargeJobs.delete(target);
            }
          }
          if(crossesPit(beforeX,beforeY,enemy.x,enemy.y,snapshot.pits,bridges)){
            damageEnemyOnce(enemy, enemy.hp, () => {
              if(enemy.chargeOilDeflected)awardBonus(enemy.x,enemy.y,'oilPit');
              pits.fall(enemy.x,enemy.y,false,enemy.chargeAngle,beforeX,beforeY,JUGGERNAUT_SKIN);
            });
          } else if(next.hit){
            burst(enemy.x+Math.cos(enemy.chargeAngle)*radius,enemy.y+Math.sin(enemy.chargeAngle)*radius,true,enemy.chargeAngle);
            shake=.18;enemy.chargeState=3;enemy.chargeTimer=.65;
          }
        } else {enemy.chargeTimer-=dt;if(enemy.chargeTimer<=0){enemy.chargeState=0;enemy.planIn=0;}}
        if(enemy.chargeState!==2 && !playerFalling && !invulnerable && Math.hypot(player.x-enemy.x,player.y-enemy.y)<radius+16 && enemy.hp>0){
          hp=Math.max(0,hp-2);invulnerable=1;hurtFlash=.24;impacts.add(player.x,player.y,'player');if(!hp)diePlayer();if(run.ended)return;
        }
        continue;
      }
      const enemyOily = weapons.oily(enemy.x, enemy.y);
      if (enemy.stagger > 0 && !enemyOily) continue;
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      enemy.phase += dt;
      enemy.planIn -= dt;
      if (enemy.planIn <= 0) {
        enemy.visible = navigation.firingLane(enemy, player);
        enemy.path = !enemy.visible || distance > 180 ? navigation.findRoute(enemy, player) : [];
        enemy.planIn = .75;
      }
      let vx = 0, vy = 0;
      // Keep following a route until the next visibility check, even inside the
      // normal attack radius: cover must not cause the old stand-and-fire loop.
      const waypoint = routeWaypoint(navigation, enemy, enemy.path);
      if (waypoint) {
        const distanceToWaypoint = Math.hypot(waypoint.x - enemy.x, waypoint.y - enemy.y);
        const speed = Math.min(100, distanceToWaypoint * 3);
        vx = (waypoint.x - enemy.x) / distanceToWaypoint * speed;
        vy = (waypoint.y - enemy.y) / distanceToWaypoint * speed;
      } else if (enemy.visible) {
        const advance = distance > 150 ? 65 : distance < 60 ? -25 : 0;
        vx = Math.cos(angle) * advance;
        vy = Math.sin(angle) * advance;
      }
      const beforeX = enemy.x, beforeY = enemy.y;
      const enemyMotion = enemySurfaceMotion(enemy, vx, vy, angle, onIce(enemy.x, enemy.y, snapshot.iceRegions), dt, enemyOily);
      moveBody(navigation, enemy, enemyMotion.x, enemyMotion.y, prepareGround);
      if (crossesPit(beforeX, beforeY, enemy.x, enemy.y, snapshot.pits, bridges)) {
        pits.fall(enemy.x, enemy.y, false, cardinalFacing(player.x - enemy.x, player.y - enemy.y), beforeX, beforeY, enemy.skin);
        enemy.hp = 0; enemy.respawn = 4; enemy.vx = enemy.vy = 0;
        continue;
      }
      resolveSurfaceCollision(enemy,enemyMotion,{x:enemy.x-beforeX,y:enemy.y-beforeY},enemyOily);
      if ((vx || vy) && enemy.x === beforeX && enemy.y === beforeY) enemy.planIn = Math.min(enemy.planIn, .1);
      enemy.cooldown -= dt;
      // Keep firing while flanking; projectile collision handles text cover.
      if (enemy.cooldown <= 0 && enemy.stagger <= 0) {
        const angle = cardinalFacing(player.x - enemy.x, player.y - enemy.y);
        const shot = bullets.find((b, i) => i >= 32 && !b.life);
        if (shot) {
          Object.assign(shot, safeMuzzle(enemy.x, enemy.y, angle, 22, muzzleHit));
          shot.vx = Math.round(Math.cos(angle)) * 420; shot.vy = Math.round(Math.sin(angle)) * 420; shot.life = 3; shot.damage = 1; shot.spike = false; shot.piercing = false; shot.hitMask.clear(); shot.enemy = true; shot.bounces = 0; shot.trailX = shot.x; shot.trailY = shot.y;
        }
        enemy.cooldown = 1.4 + Math.random() * .7;
      }
    }
    // One bounded search slice per frame, round-robin across all Juggernauts.
    const job=chargeJobs.entries().next().value;
    if(job){
      const [enemy,task]=job;chargeJobs.delete(enemy);
      if(enemy.hp>0 && enemy.chargeState===0){
        const result=task.next();
        if(result.done)enemy.path=result.value;else chargeJobs.set(enemy,task);
      }
    }
    recoil = Math.max(0, recoil - dt * 9);
    const spec = SPECS[weapons.equipped];
    if (!playerFalling && penalty?.kind!=='no-fire' && (queuedShot || keys.has('KeyX')) && now - lastShot > spec.delay) {
      const type = weapons.equipped;
      if (type === 'firegun') {
        const attack = meleeFan(player.x, player.y, player.angle, muzzleHit, 96, Math.PI / 5);
        weapons.ignite(player.x,player.y,attack.rays,(dx,dy)=>glass.hitTest(player.x,player.y,dx,dy).t);
        flame = {x:player.x,y:player.y,rays:attack.rays,life:.1};
        for (const enemy of enemies) if (enemy.hp>0 && meleeHitsBody(player.x,player.y,attack.rays,enemy.x,enemy.y,enemy.charger?26:17)) {
          const obstacle=glass.hitTest(player.x,player.y,enemy.x-player.x,enemy.y-player.y);
          if(obstacle.t===Infinity) hurtEnemy(enemy,spec.damage);
        }
        playerDestruction(()=>glass.shatterFan(player.x,player.y,attack.rays,96));
        for(const index of concrete.meleeHits(player.x,player.y,attack.rays))if(concrete.topple(index,true))score.topple();
      } else if (type === 'mine' || type === 'oil') {
        const point = safeMuzzle(player.x,player.y,player.angle,type==='oil'?64:28,muzzleHit);
        if(navigation.free(point) && !crossesPit(point.x,point.y,point.x,point.y,snapshot.pits,bridges)) {
          if(type==='mine')weapons.placeMine(point.x,point.y);
          else {
            playerDestruction(() => glass.crushStrip({x:point.x-OIL_SIZE/2,y:point.y-OIL_SIZE/2,w:OIL_SIZE,h:OIL_SIZE,id:-1}));
            weapons.placeOil(point.x,point.y);
          }
        }
      } else {
        const available = bullets.filter((b,i)=>i<32 && !b.life);
        if(available.length>=spec.angles.length)spec.angles.forEach((offset,i)=>{
          const angle=player.angle+offset,bullet=available[i];
          Object.assign(bullet,safeMuzzle(player.x,player.y,angle,27,muzzleHit));
          bullet.vx=Math.cos(angle)*spec.speed;bullet.vy=Math.sin(angle)*spec.speed;
          bullet.life=spec.life;bullet.damage=spec.damage;bullet.spike=type==='spike';bullet.selfSafe=.12;bullet.piercing=type==='shotgun';bullet.hitMask.clear();
          bullet.enemy=false;bullet.bounces=0;bullet.trailX=bullet.x;bullet.trailY=bullet.y;
        });
      }
      recoil=1;lastShot=now;queuedShot=false;
    }
    const playerBurn=burnTick(player.burnTime,dt,!playerFalling && weapons.burning(player.x,player.y));
    player.burnTime=playerBurn.elapsed;
    if(playerBurn.damage){
      hp=Math.max(0,hp-playerBurn.damage);hurtFlash=.24;impacts.add(player.x,player.y,'player');
      if(hp<=0)diePlayer();if(run.ended)return;
    }
    for(const enemy of enemies){
      const burn=burnTick(enemy.burnTime,dt,enemy.hp>0 && weapons.burning(enemy.x,enemy.y));
      enemy.burnTime=burn.elapsed;
      if(burn.damage)hurtEnemy(enemy,burn.damage);
    }
    let steppedOnMine = false;
    for(let i=weapons.mines.length-1;i>=0;i--) {
      const mine=weapons.mines[i];
      const clear = (from: Point, to: Point) => navigation.clearShot(from, to);
      const playerTriggered = triggersMine(mine, player, !playerFalling && !steppedOnMine, clear, 26);
      if(!mineFuse(mine.life).expired && !playerTriggered && !enemies.some(e=>triggersMine(mine,e,e.hp>0,clear)))continue;
      steppedOnMine ||= playerTriggered;
      weapons.mines.splice(i,1);weapons.explode(mine.x,mine.y);burst(mine.x,mine.y);
      for(const e of enemies)if(e.hp>0 && Math.hypot(e.x-mine.x,e.y-mine.y)<88 && navigation.clearShot(mine,e))hurtEnemy(e,4);
      const blast=meleeFan(mine.x,mine.y,0,muzzleHit,88,Math.PI);
      playerDestruction(()=>glass.shatterFan(mine.x,mine.y,blast.rays,88));
      for(const index of concrete.meleeHits(mine.x,mine.y,blast.rays))if(concrete.topple(index,true))score.topple();
    }
    // Mine contact is lethal even during bullet-hit/respawn invulnerability.
    if (steppedOnMine) diePlayer();
    if (run.ended) return;
    for (const b of bullets) if (b.life) {
      b.selfSafe=Math.max(0,b.selfSafe-dt);
      b.trailX = b.x; b.trailY = b.y;
      const motion = b.spike ? spikeMotion(b.vx,b.vy,dt) : {x:b.vx*dt,y:b.vy*dt,vx:b.vx,vy:b.vy};
      b.vx=motion.vx;b.vy=motion.vy;
      const dx = motion.x, dy = motion.y;
      const glassHit = b.bounces && !b.spike && !b.piercing ? { t: Infinity, id: -1 } : glass.hitTest(b.x, b.y, dx, dy);
      const letter = textHit(b.x, b.y, dx, dy);
      const plate = concrete.hitTest(b.x, b.y, dx, dy);
      if(b.piercing && !b.enemy) {
        const hits=piercedEnemies(b.x,b.y,dx,dy,Math.min(glassHit.t,letter,plate.t),b.hitMask,enemies);
        for(const i of hits){b.hitMask.add(i);const enemy=enemies[i];burst(enemy.x,enemy.y);hurtEnemy(enemy,b.damage);}
      }
      let actorHit = Infinity, enemyIndex = -1;
      if ((b.enemy || (b.spike && !b.selfSafe)) && !playerFalling) actorHit = segmentCircle(b.x, b.y, dx, dy, player.x, player.y, 16);
      if (!b.enemy && !b.piercing) enemies.forEach((enemy, i) => {
        if (enemy.hp <= 0) return;
        const t = segmentCircle(b.x, b.y, dx, dy, enemy.x, enemy.y, enemy.charger?26:17);
        if (t < actorHit) { actorHit = t; enemyIndex = i; }
      });
      const hit = Math.min(glassHit.t, letter, actorHit, plate.t);
      if (hit !== Infinity) {
        const x = b.x + dx * hit, y = b.y + dy * hit;
        if (plate.t <= hit) {
          if (concrete.topple(plate.index, !b.enemy)) {
            impacts.add(x, y, 'shot');
            if (!b.enemy) score.topple();
          }
          b.life = 0;
        }
        else if (letter <= hit) {
          burst(x, y, true, Math.atan2(b.vy, b.vx), true);
          if (!b.bounces || b.spike) {
            const speed = Math.hypot(b.vx, b.vy) || 1;
            const reflected = reflectText(snapshot.textMask, snapshot.textCanvas.width, snapshot.textCanvas.height, snapshot.textCanvas.width / w, snapshot.textCanvas.height / h, x, y, b.vx, b.vy);
            // Back out on the incoming side before the next swept collision.
            b.x = x - b.vx / speed * 2; b.y = y - b.vy / speed * 2;
            b.vx = reflected.vx / (b.spike ? .65 : 1); b.vy = reflected.vy / (b.spike ? .65 : 1);
            b.bounces++; b.life = b.spike ? Math.max(0,b.life-dt) : Math.min(b.life, .28);
            continue;
          }
        }
        else if (actorHit <= hit) {
          burst(x, y);
          if ((b.enemy || (b.spike && enemyIndex < 0)) && !invulnerable) {
            hp=Math.max(0,hp-b.damage); invulnerable = 1; hurtFlash = .24; impacts.add(player.x, player.y, 'player');
            if (hp <= 0) diePlayer();
            if (run.ended) return;
          } else if (!b.enemy && enemyIndex >= 0) {
            hurtEnemy(enemies[enemyIndex], b.damage);
          }
        } else {
          const before = glass.brokenCount;
          glass.attributed(b.enemy ? 'npc' : 'player', () => glass.shatter(glassHit.id, x, y));
          score.glass(before, glass.brokenCount, !b.enemy);
          burst(x, y, false, 0, true);
          if (b.spike) {
            const speed=Math.hypot(b.vx,b.vy)||1;
            b.x=x-b.vx/speed*2;b.y=y-b.vy/speed*2;
            const reflected=glass.reflectShard(glassHit.id,x,y,b.vx,b.vy);
            b.vx=reflected.vx;b.vy=reflected.vy;b.bounces++;b.life=Math.max(0,b.life-dt);
            continue;
          }
        }
        b.life = 0;
      } else {
        b.x += dx; b.y += dy; b.life = Math.max(0, b.life - dt);
        if (b.spike) {
          if(b.x<0 || b.x>w){b.vx=-b.vx;b.x=Math.max(0,Math.min(w,b.x));}
          if(b.y<0 || b.y>h){b.vy=-b.vy;b.y=Math.max(0,Math.min(h,b.y));}
        } else if (b.x < 0 || b.x > w || b.y < 0 || b.y > h) b.life = 0;
      }
    }
    const spikes=bullets.filter(b=>b.life>0 && b.spike);
    for(let pass=0;pass<12;pass++){
      let touching=false;
      for(let i=0;i<spikes.length;i++)for(let j=i+1;j<spikes.length;j++)
        touching=collideSpikes(spikes[i],spikes[j],pass===0)||touching;
      if(!touching)break;
    }
    const shakeX=shake>0?Math.sin(now*.09)*3*shake/.18:0,shakeY=shake>0?Math.cos(now*.12)*2*shake/.18:0;
    const transform=shake>0?`translate(${shakeX}px, ${shakeY}px)`:'';
    surface.style.transform=transform;actors.style.transform=transform;
    glass.render(dt, cameraY);
    ctx.clearRect(0, 0, w, viewH);
    ctx.save(); ctx.translate(0, -cameraY);
    weapons.draw(ctx,now/1000,cameraY,viewH);
    for (const tile of snapshot.tiles) {
      if (tile.y + tile.height < cameraY || tile.y > cameraY + viewH) continue;
      ctx.drawImage(tile.textCanvas, 0, tile.y, w, tile.height);
    }
    pits.draw(ctx, cameraY, viewH);
    concrete.draw(ctx, cameraY, viewH);
    deathMarks.draw(ctx, cameraY, viewH);
    if (swing && swingLife > 0) {
      ctx.beginPath(); ctx.moveTo(swing.x, swing.y);
      for (const ray of swing.rays) ctx.lineTo(swing.x + ray.dx, swing.y + ray.dy);
      ctx.closePath(); ctx.globalAlpha = swingLife / .18;
      ctx.fillStyle = '#a5ffe64d'; ctx.strokeStyle = '#dbfff4'; ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
    }
    if(flame && flame.life>0){
      ctx.save();ctx.globalAlpha=flame.life/.1*.6;ctx.fillStyle='#ff922e';ctx.strokeStyle='#ffe6a1';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(flame.x,flame.y);for(const r of flame.rays)ctx.lineTo(flame.x+r.dx,flame.y+r.dy);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    }
    ctx.lineCap = 'round';
    for (const enemy of enemies) if (enemy.hp > 0) {
      if(enemy.charger){
        if(enemy.chargeState===1){
          ctx.save();ctx.strokeStyle='#ffb369aa';ctx.lineWidth=2;ctx.setLineDash([8,7]);
          ctx.beginPath();ctx.moveTo(enemy.x,enemy.y);ctx.lineTo(enemy.x+Math.cos(enemy.chargeAngle)*Math.hypot(w,viewH),enemy.y+Math.sin(enemy.chargeAngle)*Math.hypot(w,viewH));ctx.stroke();ctx.restore();
        }
        ctx.save();ctx.translate(enemy.x,enemy.y);
        // Ground shadow stays centered beneath the body, independent of facing.
        ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,27,25,0,0,Math.PI*2);ctx.fill();
        ctx.rotate(enemy.chargeAngle);
        drawEnemySprite(ctx,JUGGERNAUT_SKIN,enemy.hitFlash>0);
        ctx.restore();ctx.fillStyle='#542a2b';ctx.fillRect(enemy.x-24,enemy.y-35,48,4);ctx.fillStyle='#ffc47b';ctx.fillRect(enemy.x-24,enemy.y-35,48*enemy.hp/enemy.maxHp,4);
        continue;
      }
      ctx.save(); ctx.translate(enemy.x, enemy.y);
      ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(2, 12, 20, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(cardinalFacing(player.x - enemy.x, player.y - enemy.y));
      drawEnemySprite(ctx,enemy.skin,enemy.hitFlash>0);
      ctx.fillStyle = '#492528'; ctx.fillRect(9, 5, 18, 6);
      ctx.restore();
      ctx.fillStyle = '#542a2b'; ctx.fillRect(enemy.x - 15, enemy.y - 23, 30, 3);
      ctx.fillStyle = '#ff976d'; ctx.fillRect(enemy.x - 15, enemy.y - 23, enemy.hp * 10, 3);
    }

    for (const b of bullets) if (b.life) {
      if(b.spike){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(now*.012);drawShuriken(ctx);ctx.restore();}
      ctx.strokeStyle = b.bounces ? '#ffdf80' : b.enemy ? '#ff8057' : '#d1fff0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.trailX, b.trailY); ctx.stroke();
    }
    for (const p of sparks) if (p.life) {
      p.life = Math.max(0, p.life - dt); p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 280 * dt;
      if (!p.life || p.y < cameraY - 20 || p.y > cameraY + viewH + 20 || p.x < -20 || p.x > w + 20) continue;
      ctx.globalAlpha = Math.min(1, p.life * 6); ctx.strokeStyle = p.color; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .018, p.y - p.vy * .018); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    // Approved overhead pixel hero; weapons remain aligned with the firing direction.
    if (!playerFalling) {
      ctx.save(); ctx.translate(player.x, player.y);
      const damageTint = invulnerable > 0 || hurtFlash > 0;
      if (damageTint) ctx.globalAlpha = .5 + Math.sin(now * .025) * .3;
      ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(2, 10, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(player.angle);
      drawPlayerSprite(ctx,playerFrame(playerMoving,player.step),damageTint);
      if(weapons.equipped!=='pistol'){ctx.save();ctx.translate(16-recoil*3,9);ctx.scale(.65,.65);drawWeapon(ctx,weapons.equipped);ctx.restore();}
      else {
      ctx.fillStyle = damageTint ? '#773a40' : '#263a44'; ctx.fillRect(8 - recoil * 3, 7, 21, 6);
      ctx.fillStyle = damageTint ? '#ffc3b9' : '#defff4'; ctx.fillRect(17 - recoil * 3, 7, 9, 2);
      }
      if (recoil > .5 && !['oil','mine','firegun'].includes(weapons.equipped)) {
        ctx.fillStyle = '#fff4b5'; ctx.beginPath(); ctx.moveTo(29, 5); ctx.lineTo(43 + recoil * 5, 10); ctx.lineTo(29, 15); ctx.fill();
      }
      ctx.restore();
      // World-space HP stays upright and follows the player through camera scrolling.
      ctx.save(); ctx.translate(player.x, player.y - 33);
      ctx.fillStyle = '#10251ee6'; ctx.beginPath(); ctx.roundRect(-25, -15, 50, 24, 5); ctx.fill();
      ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#e7fff4';
      ctx.fillText(`HP ${hp}/5`, 0, -4);
      ctx.fillStyle = '#38413c'; ctx.fillRect(-19, 1, 38, 4);
      ctx.fillStyle = hp <= 2 ? '#ff8177' : '#8be9bc'; ctx.fillRect(-19, 1, 38 * hp / 5, 4);
      ctx.restore();
    }
    impacts.draw(ctx);
    bonuses.draw(ctx,cameraY,viewH,w);
    ctx.restore();
    if (hurtFlash > 0) {
      ctx.save(); ctx.globalAlpha = hurtFlash / .24 * .16;
      const rim = ctx.createRadialGradient(w / 2, viewH / 2, Math.min(w, viewH) * .3, w / 2, viewH / 2, Math.hypot(w, viewH) / 2);
      rim.addColorStop(0, '#d8554400'); rim.addColorStop(1, '#d85544');
      ctx.fillStyle = rim; ctx.fillRect(0, 0, w, viewH); ctx.restore();
    }
    if(combatTutorial.hint && !playerFalling)drawCombatHint(ctx,player.x,player.y-cameraY-18,now/1000,w,combatTutorial.hint);
    else if (trapped && !playerFalling) drawMovementHint(ctx, player.x, player.y - cameraY - 18, now / 1000, w);
    frames++;
    if (!run.ended && now - lastReport >= 500) {
      onStats({ playerNearTop: !playerFalling && (player.y-cameraY) < viewH*.2, lives:run.lives,ended:run.ended,seconds:Math.floor(rankedRun.elapsed),completedAt, fps: Math.round(frames * 1000 / (now - lastReport)), broken: glass.brokenArea, total, hp, penalty: penalty ? PENALTY_LABELS[penalty.kind] : '', weapon: weapons.equipped, score: score.points, kills, enemies: enemies.filter(e => e.hp > 0).length });
      frames = 0; lastReport = now;
    }
    frame = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', () => {
    resetInput();
    if (document.hidden) { cancelAnimationFrame(frame); paused = true; }
    else if (paused) { paused = false; last = lastReport = performance.now(); frames = 0; frame = requestAnimationFrame(tick); }
  }, opts);
  frame = requestAnimationFrame(tick);
  return () => { getControls().touchInput=undefined; getControls().finish=undefined; controller.abort(); cancelAnimationFrame(frame); resetInput(); surface.style.transform=actors.style.transform=''; glass.dispose(); };
}
