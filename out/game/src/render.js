import { CONFIG } from './config.js';
export const CityRenderer = class CityRenderer {
  constructor(canvas) { this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.scale=1; this.ox=0; this.oy=0; this.resize(); window.addEventListener('resize',()=>this.resize()); }
  resize() { const c=this.canvas, r=window.devicePixelRatio||1; c.width=Math.round(innerWidth*r); c.height=Math.round(innerHeight*r); this.scale=Math.min(c.width/CONFIG.width,c.height/CONFIG.height); this.ox=(c.width-CONFIG.width*this.scale)/2; this.oy=(c.height-CONFIG.height*this.scale)/2; }
  frame(fn) { const c=this.ctx; c.setTransform(1,0,0,1,0,0); c.fillStyle='#14272c'; c.fillRect(0,0,this.canvas.width,this.canvas.height); c.setTransform(this.scale,0,0,this.scale,this.ox,this.oy); fn(c); }
  _visible(x,y,w,h,camera) { return x+w>camera.x-CONFIG.width/2-200 && x<camera.x+CONFIG.width/2+200 && y+h>camera.y-CONFIG.height/2-260 && y<camera.y+CONFIG.height/2+260; }
  draw(ctx, world, camera) { this.frame(c=>{ c.save(); camera.apply(c); this._city(c,world,camera);for(const v of world.vehicles)v.draw(c,camera,world);world.player.draw(c,camera,world);if(world.driving)world.driving.draw(c,camera,world); this.drawObjective(c,world,camera); c.restore(); }); }
  _city(c,w,camera) {
    const left=camera.x-CONFIG.width/2-5, top=camera.y-CONFIG.height/2-5;
    c.fillStyle=CONFIG.palette.sea; c.fillRect(left,top,CONFIG.width+10,CONFIG.height+10);
    // West-facing sand shelf and inland green base.
    c.fillStyle=CONFIG.palette.sand; c.fillRect(470,0,92,w.city.height);
    c.fillStyle=CONFIG.palette.grass; c.fillRect(555,0,w.city.width-555,w.city.height);
    c.fillStyle='rgba(255,240,186,.18)'; for(let i=0;i<9;i++){const y=((w.time*22+i*151)%w.city.height); c.fillRect(40+((i*67)%280),y,130,2);}
    c.fillStyle=CONFIG.palette.asphalt; c.lineCap='butt'; for(const r of w.city.roads){ if(!this._visible(Math.min(r.x1,r.x2),Math.min(r.y1,r.y2),Math.abs(r.x2-r.x1)||r.width,Math.abs(r.y2-r.y1)||r.width,camera))continue; c.lineWidth=r.width+10;c.strokeStyle=CONFIG.palette.sidewalk;c.beginPath();c.moveTo(r.x1,r.y1);c.lineTo(r.x2,r.y2);c.stroke();c.lineWidth=r.width;c.strokeStyle=CONFIG.palette.asphalt;c.stroke();c.setLineDash([22,22]);c.lineWidth=2;c.strokeStyle='rgba(243,215,150,.55)';c.stroke();c.setLineDash([]); }
    // Beach palms and their fixed south-east cast shadows.
    for(const p of w.city.palms) if(this._visible(p.x-20,p.y-20,40,40,camera)){c.strokeStyle='rgba(42,43,35,.22)';c.lineWidth=5;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+8,p.y+20);c.stroke();c.strokeStyle='#805b37';c.lineWidth=4;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-3,p.y-24);c.stroke();c.fillStyle='#397c53';for(let a=0;a<5;a++){c.beginPath();c.ellipse(p.x-3+Math.cos(a*1.25)*13,p.y-25+Math.sin(a*1.25)*7,12,4,a*1.25,0,Math.PI*2);c.fill();}}
    const ordered=w.city.buildings.slice().sort((a,b)=>a.y-b.y); for(const b of ordered){if(!this._visible(b.x,b.y-b.height,b.w+b.height*.18,b.d+b.height,camera))continue; const h=b.height*.45, dx=h*.38, dy=h*.52;
      c.fillStyle='rgba(53,43,35,.22)';c.beginPath();c.moveTo(b.x+dx,b.y+dy+b.d);c.lineTo(b.x+b.w+dx,b.y+dy+b.d);c.lineTo(b.x+b.w+dx+h*.65,b.y+dy+b.d+h*.65);c.lineTo(b.x+dx+h*.65,b.y+dy+b.d+h*.65);c.closePath();c.fill();
      c.fillStyle=shade(b.color,.76);c.beginPath();c.moveTo(b.x+b.w,b.y);c.lineTo(b.x+b.w+dx,b.y-dy);c.lineTo(b.x+b.w+dx,b.y+b.d-dy);c.lineTo(b.x+b.w,b.y+b.d);c.closePath();c.fill();
      c.fillStyle=shade(b.color,.63);c.beginPath();c.moveTo(b.x,b.y+b.d);c.lineTo(b.x+b.w,b.y+b.d);c.lineTo(b.x+b.w+dx,b.y+b.d-dy);c.lineTo(b.x+dx,b.y+b.d-dy);c.closePath();c.fill();
      c.fillStyle=b.color;c.fillRect(b.x,b.y-b.height*.12,b.w,b.d);c.fillStyle=b.roof;c.fillRect(b.x-3,b.y-b.height*.12-4,b.w+6,b.d+5);
      if(b.height>60){c.fillStyle='rgba(255,224,157,.65)';for(let wx=b.x+9;wx<b.x+b.w-4;wx+=18)for(let wy=b.y+9;wy<b.y+b.d-4;wy+=20)c.fillRect(wx,wy,4,5);}
    }
    for(const p of w.city.piers){ c.fillStyle='#9c7856';c.fillRect(p.x2,p.y2-7,p.x1-p.x2,p.width); for(let x=p.x2;x<p.x1;x+=28)c.fillRect(x,p.y2-9,5,22); }
    const runway=w.city.runway; c.fillStyle='#55545a';c.fillRect(runway.x,runway.y,runway.w,runway.h);c.fillStyle='#e9dfc3';for(let x=runway.x+20;x<runway.x+runway.w-20;x+=40)c.fillRect(x,runway.y+42,20,5);
    const t=w.city.terminal;c.fillStyle='#bbb29e';c.fillRect(t.x,t.y,t.w,t.h);
  }
  drawObjective(ctx,world) { if(!world.objective)return;const o=world.objective,p=.5+.5*Math.sin(world.time*3);ctx.fillStyle=`rgba(255,200,62,${.11+p*.08})`;ctx.fillRect(o.x-14,o.y-170,28,170);ctx.strokeStyle=`rgba(255,215,95,${.7+p*.3})`;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(o.x,o.y,24+p*11,9+p*4,0,0,Math.PI*2);ctx.stroke(); }
};
function shade(hex,f){const n=parseInt(hex.slice(1),16);return `rgb(${Math.floor((n>>16)*f)},${Math.floor(((n>>8)&255)*f)},${Math.floor((n&255)*f)})`;}
