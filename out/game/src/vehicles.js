export const VEHICLE_TYPES={sedan:{name:'Sedan',accel:150,topSpeed:250,grip:7,health:100,colors:['#d8d2bd','#42657b','#9f473c','#343b40'],w:24,l:43},sport:{name:'Sport',accel:230,topSpeed:340,grip:8,health:85,colors:['#e94f45','#f3ca4c','#276f75'],w:23,l:42},pickup:{name:'Pickup',accel:120,topSpeed:205,grip:5,health:120,colors:['#b98d5b','#526d59','#d6d0bb'],w:27,l:48},taxi:{name:'Taxi',accel:135,topSpeed:220,grip:6,health:100,colors:['#e8bc3e'],w:24,l:43},police:{name:'Police',accel:180,topSpeed:275,grip:7,health:110,colors:['#e7e4d8'],w:25,l:45},truck:{name:'Armoured Truck',accel:62,topSpeed:125,grip:4,health:320,colors:['#535953'],w:34,l:64}};
export class Vehicle{
 constructor(x,y,type='sedan',color=null,angle=0){this.x=x;this.y=y;this.type=type;this.color=color||VEHICLE_TYPES[type].colors[0];this.angle=angle;this.speed=0;this.driver=null;this.damage=0;this.health=VEHICLE_TYPES[type].health||100;}
 update(dt,control={},world){const t=VEHICLE_TYPES[this.type],th=control.throttle||0,steer=control.steer||0;this.speed+=th*t.accel*dt;if(!th)this.speed*=Math.max(0,1-dt*(control.handbrake?1.5:2.3));this.speed=Math.max(-t.topSpeed*.35,Math.min(t.topSpeed,this.speed));this.angle+=steer*(.35+Math.min(1,Math.abs(this.speed)/100))*dt*Math.sign(this.speed||1)*(control.handbrake?1.45:1);let vx=Math.sin(this.angle)*this.speed,vy=-Math.cos(this.angle)*this.speed;const grip=1-Math.exp(-t.grip*(control.handbrake?.22:1)*dt);const side=vx*Math.cos(this.angle)-vy*Math.sin(this.angle);vx-=Math.cos(this.angle)*side*grip;vy+=Math.sin(this.angle)*side*grip;const nx=this.x+vx*dt,ny=this.y+vy*dt,city=world.city,hit=(x,y)=>city.collidesBuilding(x,y,t.w*.48);let blocked=false;for(const s of [-t.l*.42,t.l*.42]){const x=nx+Math.sin(this.angle)*s,y=ny-Math.cos(this.angle)*s;if(hit(x,y)||city.isWater(x,y)){blocked=true;break;}}if(blocked){if(Math.abs(this.speed)>80)this.damage=Math.min(1,this.damage+.012);this.speed=0;}else{this.x=nx;this.y=ny;}}
 draw(c,cam,world){
  const t=VEHICLE_TYPES[this.type],hero=this.driver==='player',sc=hero?1.35:1;
  c.save();c.translate(this.x,this.y);c.scale(sc,sc);c.rotate(this.angle);
  c.fillStyle=hero?'rgba(12,12,10,.27)':'rgba(25,28,25,.3)';c.beginPath();c.ellipse(2,5,t.w*.67,t.l*.43,0,0,Math.PI*2);c.fill();
  const truck=this.type==='truck',sport=this.type==='sport',police=this.type==='police';
  const body=police?'#273139':this.color, dark='#252a2b', skirt='#393b39';
  const bx=truck?-t.w/2:-t.w*.46,bw=truck?t.w:t.w*.92,by=-t.l/2,bh=t.l;
  // Four corner tyres and hubs sit just beyond the body edge.
  const wheelY=[-t.l*.34,t.l*.34],wheelX=[-t.w*.48,t.w*.48];
  c.fillStyle='#171a1a';for(const x of wheelX)for(const y of wheelY){c.fillRect(x-2.3,y-4.1,4.6,8.2);c.fillStyle='#858782';c.fillRect(x-.8,y-1.3,1.6,2.6);c.fillStyle='#171a1a';}
  c.fillStyle=body;c.strokeStyle='#222625';c.lineWidth=1.1;c.beginPath();c.roundRect(bx,by,bw,bh,truck?2:3);c.fill();c.stroke();
  c.fillStyle=skirt;c.fillRect(bx+1,t.l*.37,bw-2,t.l*.1);
  // Body ribs make the truck's cargo box distinct from its forward cab.
  if(truck){c.fillStyle='#686e68';c.fillRect(-t.w*.44,-t.l*.48,t.w*.88,t.l*.43);c.strokeStyle='#343a36';c.lineWidth=.8;for(let y=-t.l*.43;y<-t.l*.08;y+=5){c.beginPath();c.moveTo(-t.w*.43,y);c.lineTo(t.w*.43,y);c.stroke();}c.fillStyle=body;c.fillRect(-t.w*.49,-t.l*.07,t.w*.98,t.l*.52);c.strokeStyle='#252a28';c.strokeRect(-t.w*.49,-t.l*.07,t.w*.98,t.l*.52);}
  // Side doors and handles, aligned with the matching open-door zone.
  c.strokeStyle='rgba(35,39,38,.8)';c.lineWidth=.7;for(const side of [-1,1]){c.beginPath();c.moveTo(side*t.w*.43,-t.l*.04);c.lineTo(side*t.w*.43,t.l*.3);c.stroke();c.fillStyle='#d2c8ae';c.fillRect(side*(t.w*.43)-1.3,t.l*.13,2.5,1.1);}
  // Sedan/sport/pickup glasshouse: windshield, body-colour roof, rear glass.
  const cabTop=truck?-t.l*.08:-t.l*.34,cabBottom=truck?t.l*.29:t.l*.23,cabW=truck?t.w*.76:t.w*.69;
  c.fillStyle=dark;c.beginPath();c.moveTo(-cabW*.45,cabTop);c.lineTo(cabW*.45,cabTop);c.lineTo(cabW*.5,cabTop+t.l*.18);c.lineTo(-cabW*.5,cabTop+t.l*.18);c.closePath();c.fill();
  c.fillStyle=this.type==='taxi'?'#f0c94e':police?'#e7e4d8':this.color;c.beginPath();c.moveTo(-cabW*.47,cabTop+t.l*.185);c.lineTo(cabW*.47,cabTop+t.l*.185);c.lineTo(cabW*.43,cabBottom-t.l*.1);c.lineTo(-cabW*.43,cabBottom-t.l*.1);c.closePath();c.fill();c.strokeStyle='rgba(35,39,38,.65)';c.lineWidth=.7;c.stroke();
  c.fillStyle=dark;c.beginPath();c.moveTo(-cabW*.43,cabBottom-t.l*.09);c.lineTo(cabW*.43,cabBottom-t.l*.09);c.lineTo(cabW*.38,cabBottom);c.lineTo(-cabW*.38,cabBottom);c.closePath();c.fill();
  // Mirrors, bumpers, lamps, grille and sport spoiler.
  c.fillStyle='#222626';c.fillRect(-cabW*.57,cabTop+t.l*.11,2.6,3.4);c.fillRect(cabW*.48,cabTop+t.l*.11,2.6,3.4);
  c.fillStyle='#77746a';c.fillRect(-t.w*.43,-t.l*.51,t.w*.86,2);c.fillRect(-t.w*.43,t.l*.47,t.w*.86,2);
  c.fillStyle='#fff0c5';c.fillRect(-t.w*.43,-t.l*.49,4,2.4);c.fillRect(t.w*.43-4,-t.l*.49,4,2.4);
  c.fillStyle='#a92d2d';c.fillRect(-t.w*.43,t.l*.43,4,2.5);c.fillRect(t.w*.43-4,t.l*.43,4,2.5);
  c.fillStyle='#414747';c.fillRect(-t.w*.2,-t.l*.5,t.w*.4,1.7);
  if(sport){c.fillStyle='#5d2526';c.fillRect(-t.w*.44,t.l*.48,t.w*.88,1.5);}
  if(this.type==='taxi'){c.fillStyle='#292c29';for(let y=-t.l*.3;y<t.l*.34;y+=3){c.fillRect(-t.w*.49,y,2.2,2);c.fillRect(t.w*.49-2.2,y,2.2,2);}c.fillStyle='#f8d45b';c.fillRect(-6,-t.l*.08,12,4);c.strokeStyle='#3c372a';c.strokeRect(-6,-t.l*.08,12,4);}
  if(police){c.fillStyle='#e7e4d8';c.fillRect(-t.w*.46,t.l*.03,t.w*.92,t.l*.14);c.fillStyle='#30383d';c.fillRect(-7,-2,14,4);const blue=Math.floor(world.time*8)%2===0;c.fillStyle=blue?'#3984ff':'#ff3b3b';c.fillRect(-6,-1.5,6,3);c.fillStyle=blue?'#ff3b3b':'#3984ff';c.fillRect(0,-1.5,6,3);}
  if(this._braking||this._hardBrake){c.fillStyle='#ff3028';if(this._brakeGlow||world.timeOfDay!=='day'){c.shadowColor='#ff2727';c.shadowBlur=this._brakeGlow?10:world.timeOfDay==='night'?11:6;}c.fillRect(-t.w*.43,t.l*.43,4,2.5);c.fillRect(t.w*.43-4,t.l*.43,4,2.5);c.shadowBlur=0;}
  if(this._headlights){c.shadowColor='#fff0b0';c.shadowBlur=8;c.fillStyle='#fff0b0';c.fillRect(-t.w*.43,-t.l*.49,4,2.4);c.fillRect(t.w*.43-4,-t.l*.49,4,2.4);c.shadowBlur=0;}
  if(this._crash>0&&Math.floor(world.time*5)%2===0){c.fillStyle='#ff493c';c.fillRect(-t.w*.43,t.l*.43,4,2.5);c.fillRect(t.w*.43-4,t.l*.43,4,2.5);}
  if(hero){c.strokeStyle='rgba(255,244,205,.98)';c.lineWidth=2;c.beginPath();c.roundRect(bx-1,by-1,bw+2,bh+2,4);c.stroke();
   if(this._doorOpen){c.fillStyle='#181d1e';c.fillRect(-t.w*.49,t.l*.045,t.w*.055,t.l*.265);const a=(this._coverDoorAngle||50)*Math.PI/180,L=48/(3.6*1.35),W=29/(3.6*1.35),dx=-Math.sin(a)*L,dy=-Math.cos(a)*L,hx=-t.w*.45,hy=t.l*.04,px=Math.cos(a),py=Math.sin(a);c.fillStyle=this.color;c.beginPath();c.moveTo(hx,hy);c.lineTo(hx+dx,hy+dy);c.lineTo(hx+dx+px*W,hy+dy+py*W);c.lineTo(hx+px*W,hy+py*W);c.closePath();c.fill();c.strokeStyle='#352b29';c.lineWidth=1;c.stroke();c.fillStyle='rgba(25,32,33,.9)';c.beginPath();c.moveTo(hx+px*.2,hy+py*.2);c.lineTo(hx+dx*.42+px*.2,hy+dy*.42+py*.2);c.lineTo(hx+dx*.42+px*W*.65,hy+dy*.42+py*W*.65);c.lineTo(hx+px*W*.65,hy+py*W*.65);c.closePath();c.fill();c.fillStyle='rgba(28,38,40,.9)';c.beginPath();c.moveTo(hx+px*W*.17,hy+py*W*.17);c.lineTo(hx+dx*.35+px*W*.17,hy+dy*.35+py*W*.17);c.lineTo(hx+dx*.35+px*W*.58,hy+dy*.35+py*W*.58);c.lineTo(hx+px*W*.58,hy+py*W*.58);c.closePath();c.fill();}
   else if(sport){c.fillStyle='#872d2d';c.fillRect(-t.w*.44,t.l*.48,t.w*.88,1.5);}
  }
  if(this._honk>0){c.save();c.rotate(-this.angle);c.fillStyle='#fff3d4';c.font='bold 14px sans-serif';c.fillText('!',8,-t.l*.65);c.restore();}
  if(Math.abs(this.speed)*.14>120){c.strokeStyle='rgba(255,235,198,.36)';c.lineWidth=1;c.beginPath();for(let i=-1;i<=1;i++){c.moveTo(i*7,t.l*.55);c.lineTo(i*11,t.l*.55+18+Math.abs(this.speed)*.03);}c.stroke();}
  if(this.damage>.6){for(let i=0;i<4;i++){c.fillStyle=`rgba(125,126,120,${.24+Math.sin(world.time*2+i)*.12})`;c.beginPath();c.arc(Math.sin(world.time+i)*10,-t.l*.5-i*7,4+i*2,0,Math.PI*2);c.fill();}}
  c.restore();
 }
}
