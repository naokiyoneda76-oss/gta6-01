export class Effects {
 constructor(world){this.world=world;this.skids=[];this.particles=[];}
 skid(x,y,angle,length=24){this.skids.push({x,y,angle,length});if(this.skids.length>600)this.skids.shift();}
 burst(x,y,n=7){for(let i=0;i<n;i++)this.particles.push({x,y,vx:this.world.rng.range(-75,75),vy:this.world.rng.range(-75,75),life:.45,size:2+this.world.rng.next()*3,color:'#ff9a42'});}
 update(dt){const w=this.world;for(const v of w.vehicles){if(v.driver==='player'&&Math.abs(v.speed)>75&&(v._handbrake||v._hardBrake||v.damage>.4))this.skid(v.x,v.y,v.angle);if(v.damage>.6&&w.rng.chance(.1))this.particles.push({x:v.x,y:v.y-20,vx:w.rng.range(-8,8),vy:-24,life:1.4,size:5,color:'#aaa99b'});}for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.size+=dt*5;}this.particles=this.particles.filter(p=>p.life>0);}
 drawGround(c){c.lineCap='round';for(const s of this.skids){c.save();c.translate(s.x,s.y);c.rotate(s.angle);c.strokeStyle='rgba(25,25,25,.28)';c.lineWidth=3;c.beginPath();c.moveTo(-4,0);c.lineTo(-4,-s.length);c.moveTo(4,0);c.lineTo(4,-s.length);c.stroke();c.restore();}}
 drawAir(c){for(const p of this.particles){c.globalAlpha=Math.max(0,Math.min(1,p.life));c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.size,0,7);c.fill();}c.globalAlpha=1;}
}
