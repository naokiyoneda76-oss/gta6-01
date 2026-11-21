import { CONFIG } from './config.js';
export const ChaseCamera = class ChaseCamera {
  constructor() { this.x = 535; this.y = 950; this.shake = 0; this.offsetX = 0; this.offsetY = 0; }
  follow(target, dt, city) { const tx = target.x + (target.vx || 0) * .18, ty = target.y + (target.vy || 0) * .18; this.x += (tx-this.x)*Math.min(1,dt*5); this.y += (ty-this.y)*Math.min(1,dt*5); this.clamp(city); if (this.shake > 0) this.shake = Math.max(0,this.shake-dt*20); }
  clamp(city) { this.x = Math.max(CONFIG.width/2, Math.min(city.width-CONFIG.width/2,this.x)); this.y = Math.max(CONFIG.height/2, Math.min(city.height-CONFIG.height/2,this.y)); }
  addShake(mag) { this.shake = Math.max(this.shake, mag); }
  apply(ctx) { this.offsetX = this.shake ? Math.sin(this.shake*41)*this.shake : 0; this.offsetY = this.shake ? Math.cos(this.shake*37)*this.shake : 0;ctx.translate(CONFIG.width/2,CONFIG.height/2);ctx.scale(this.zoom||1,this.zoom||1);ctx.translate(-this.x+this.offsetX,-this.y+this.offsetY); }
};
