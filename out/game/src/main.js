import { CONFIG } from './config.js';
import { SeededRandom } from './random.js';
import { InputManager } from './input.js';
import { World } from './world.js';
import { CityRenderer } from './render.js';
import { ChaseCamera } from './camera.js';
import { MenuScreens } from './menus.js';
import { ShotDirector } from './shots.js';
import {Hud} from './hud.js';
export const PalmeraHeatGame = class PalmeraHeatGame {
  constructor(canvas,status) { this.canvas=canvas;this.status=status;const q=new URLSearchParams(location.search);const n=Number.parseInt(q.get('seed')||'1',10);this.rng=new SeededRandom(Number.isFinite(n)?n:1);this.world=new World(this.rng);this.renderer=new CityRenderer(canvas);this.camera=new ChaseCamera();this.input=new InputManager(window);this.menus=new MenuScreens();this.shots=new ShotDirector();this.hud=new Hud();this.screen='title';this.time=0;this.acc=0;this.last=performance.now();this.run(); }
  start() { this.screen='play';this.status.textContent='Palmera Heat. Exploring Palmera City.'; }
  step(dt) { this.time+=dt;if(this.screen==='play'){const actions=this.input.takeActions();this.world.step(dt,{down:k=>this.input.isDown(k),actions});const target=this.world.driving||this.world.player;this.camera.follow(target,dt,this.world.city);}else this.world.step(dt);if(this.screen==='title'){this.camera.x=535+Math.sin(this.time*.12)*120;this.camera.y=950+Math.sin(this.time*.08)*180;}}
  paint() { if(this.screen==='title')this.menus.drawTitle(this.renderer.ctx,this.world,this.renderer,this.camera,this.time);else {this.renderer.draw(this.renderer.ctx,this.world,this.camera);this.renderer.overlay(c=>{this.hud.draw(c,this.world);if(this.screen==='paused')this.menus.drawPause(c);});} }
  run() { const query=new URLSearchParams(location.search);const shot=query.get('shot');if(shot){this.shots.stageShot(shot,this);this.paint();this.paint();window.__shotReady=true;return;}this.status.textContent='PALMERA HEAT. Press Enter to start.';const frame=now=>{requestAnimationFrame(frame);this.acc+=Math.min((now-this.last)/1000,.25);this.last=now;const actions=this.input.takeActions();if((actions&1)&&this.screen==='title')this.start();else if((actions&2)&&this.screen==='play'){this.screen='title';this.status.textContent='Returned to title.';}else if((actions&2)&&this.screen==='paused')this.screen='play';while(this.acc>=CONFIG.STEP){this.step(CONFIG.STEP);this.acc-=CONFIG.STEP;}this.paint();};requestAnimationFrame(frame); }
};
const canvas=document.getElementById('game');const status=document.getElementById('status');new PalmeraHeatGame(canvas,status);
