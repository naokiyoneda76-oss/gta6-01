import {ART} from './art.js';
import {LIGHTING,UNIFIED_SHADOWS,drawGroundShadow as drawUnifiedGroundShadow,shade} from './lighting.js';
export const VEHICLE_TYPES={sedan:{name:'Sedan',accel:150,topSpeed:250,grip:7,health:100,colors:[ART.palette.swatches.s37,ART.palette.swatches.s162,ART.palette.swatches.s163,ART.palette.swatches.s164],w:24,l:43,driverDoor:{hingeX:-.45,hingeY:.04,length:.38,width:.33}},sport:{name:'Sport',accel:230,topSpeed:340,grip:8,health:85,colors:[ART.palette.swatches.s165,ART.palette.swatches.s166,ART.palette.swatches.s167],w:23,l:42,driverDoor:{hingeX:-.45,hingeY:-.04,length:.34,width:.52}},pickup:{name:'Pickup',accel:120,topSpeed:205,grip:5,health:120,colors:[ART.palette.swatches.s39,ART.palette.swatches.s168,ART.palette.swatches.s169],w:27,l:48,driverDoor:{hingeX:-.45,hingeY:-.15,length:.34,width:.38}},van:{name:'Delivery Van',accel:105,topSpeed:185,grip:5,health:135,colors:[ART.palette.swatches.s67,ART.palette.swatches.s97,ART.palette.swatches.s121],w:29,l:50},convertible:{name:'Convertible',accel:160,topSpeed:245,grip:7,health:95,colors:[ART.palette.swatches.s65,ART.palette.swatches.s67,ART.palette.swatches.s123],w:24,l:43,driverDoor:{hingeX:-.45,hingeY:.04,length:.38,width:.33}},taxi:{name:'Taxi',accel:135,topSpeed:220,grip:6,health:100,colors:[ART.palette.swatches.s40],w:24,l:43},police:{name:'Police',accel:180,topSpeed:275,grip:7,health:110,colors:[ART.palette.policeBand],w:25,l:45},truck:{name:'Armoured Truck',accel:62,topSpeed:125,grip:4,health:320,colors:[ART.palette.swatches.s170],w:34,l:64}};
export class Vehicle{
 constructor(x,y,type='sedan',color=null,angle=0){this.x=x;this.y=y;this.type=type;this.color=color||VEHICLE_TYPES[type].colors[0];this.angle=angle;this.speed=0;this.driver=null;this.damage=0;this.health=VEHICLE_TYPES[type].health||100;}
 update(dt,control={},world){const t=VEHICLE_TYPES[this.type],th=control.throttle||0,steer=control.steer||0;this.speed+=th*t.accel*dt;if(!th)this.speed*=Math.max(0,1-dt*(control.handbrake?1.5:2.3));this.speed=Math.max(-t.topSpeed*.35,Math.min(t.topSpeed,this.speed));this.angle+=steer*(.35+Math.min(1,Math.abs(this.speed)/100))*dt*Math.sign(this.speed||1)*(control.handbrake?1.45:1);let vx=Math.sin(this.angle)*this.speed,vy=-Math.cos(this.angle)*this.speed;const grip=1-Math.exp(-t.grip*(control.handbrake?.22:1)*dt);const side=vx*Math.cos(this.angle)-vy*Math.sin(this.angle);vx-=Math.cos(this.angle)*side*grip;vy+=Math.sin(this.angle)*side*grip;const nx=this.x+vx*dt,ny=this.y+vy*dt,city=world.city,hit=(x,y)=>city.collidesBuilding(x,y,t.w*.48),clear=(x,y)=>!city.isWater(x,y)&&[-t.l*.42,t.l*.42].every(s=>!hit(x+Math.sin(this.angle)*s,y-Math.cos(this.angle)*s));let blocked=false;for(const s of [-t.l*.42,t.l*.42]){const x=nx+Math.sin(this.angle)*s,y=ny-Math.cos(this.angle)*s;if(hit(x,y)||city.isWater(x,y)){blocked=true;break;}}if(blocked){if(Math.abs(this.speed)>80)this.damage=Math.min(1,this.damage+.012);if(this.driver==='player'&&Math.hypot(vx,vy)>1){const n=Math.hypot(vx,vy);for(let back=4;back<=28;back+=4)if(clear(this.x-vx/n*back,this.y-vy/n*back)){this.x-=vx/n*back;this.y-=vy/n*back;break;}}this.speed=0;}else{this.x=nx;this.y=ny;}}
 draw(c,cam,world,skipGroundShadow=false){
  const t=VEHICLE_TYPES[this.type],hero=this.driver==='player',sc=1;
  if(UNIFIED_SHADOWS&&!skipGroundShadow)drawUnifiedGroundShadow(c,this.x,this.y,t.w*1.12,t.l*.30,.23,.12,world.timeOfDay==='night'?.45:1);
  c.save();c.translate(this.x,this.y);c.scale(sc,sc);c.rotate(this.angle);
  if(!UNIFIED_SHADOWS){c.fillStyle=`rgba(${ART.palette.vehicleShadowRgb},${ART.shadow.vehicleColorAlpha})`;c.beginPath();c.roundRect(2,5+ART.shadow.vehicle.y-8,t.w*.61,t.l*.43,4);c.fill();}
  const truck=this.type==='truck',sport=this.type==='sport',police=this.type==='police'&&(this.driver==='police'||this.driver==='roadblock'),pickup=this.type==='pickup',van=this.type==='van',convertible=this.type==='convertible';
  const baseBody=police?ART.palette.policeBody:this.color, body=LIGHTING?shade(baseBody,1.12):baseBody, dark=LIGHTING?shade(ART.palette.bodyDark,.73):ART.palette.bodyDark, skirt=LIGHTING?shade(ART.palette.skirt,.73):ART.palette.skirt;
  const bx=truck?-t.w/2:-t.w*.46,bw=truck?t.w:t.w*.92,by=-t.l/2,bh=t.l;
  // Four corner tyres and hubs sit just beyond the body edge.
  const wheelY=[-t.l*.34,t.l*.34],wheelX=[-t.w*.48,t.w*.48];
  c.fillStyle=ART.palette.tire;for(const x of wheelX)for(const y of wheelY){c.fillRect(x-2.3,y-4.1,4.6,8.2);c.fillStyle=ART.palette.hub;c.fillRect(x-.8,y-1.3,1.6,2.6);c.fillStyle=ART.palette.tire;}
  c.fillStyle=body;c.strokeStyle=ART.palette.outline;c.lineWidth=ART.outline.world;c.beginPath();c.roundRect(bx,by,bw,bh,truck?2:3);c.fill();c.stroke();
  if(pickup){
   // Open bed behind a forward cab: shaded floor, raised side rails, and tailgate.
   c.fillStyle=dark;c.fillRect(-t.w*.39,t.l*.02,t.w*.78,t.l*.39);
   c.fillStyle=skirt;c.fillRect(-t.w*.34,t.l*.045,t.w*.68,t.l*.31);
   c.fillStyle=body;c.fillRect(-t.w*.48,t.l*.015,t.w*.12,t.l*.39);c.fillRect(t.w*.36,t.l*.015,t.w*.12,t.l*.39);
   c.strokeStyle=ART.palette.outline;c.lineWidth=1;c.strokeRect(-t.w*.39,t.l*.02,t.w*.78,t.l*.39);c.beginPath();c.moveTo(-t.w*.48,t.l*.4);c.lineTo(t.w*.48,t.l*.4);c.stroke();
  }else if(van){
   // Tall delivery box with a short, sloped nose and broad flat windshield.
   c.fillStyle=body;c.beginPath();c.moveTo(-t.w*.46,-t.l*.49);c.lineTo(t.w*.46,-t.l*.49);c.lineTo(t.w*.5,-t.l*.27);c.lineTo(t.w*.5,t.l*.47);c.lineTo(-t.w*.5,t.l*.47);c.lineTo(-t.w*.5,-t.l*.27);c.closePath();c.fill();c.strokeStyle=ART.palette.outline;c.lineWidth=ART.outline.world;c.stroke();
   c.fillStyle=dark;c.fillRect(-t.w*.42,-t.l*.24,t.w*.84,t.l*.68);
   c.fillStyle=body;c.beginPath();c.moveTo(-t.w*.41,-t.l*.27);c.lineTo(t.w*.41,-t.l*.27);c.lineTo(t.w*.36,-t.l*.43);c.lineTo(-t.w*.36,-t.l*.43);c.closePath();c.fill();
  }
  c.fillStyle=skirt;c.fillRect(bx+1,t.l*.37,bw-2,t.l*.1);
  // Body ribs make the truck's cargo box distinct from its forward cab.
  if(truck){c.fillStyle=ART.palette.grassDark;c.fillRect(-t.w*.44,-t.l*.48,t.w*.88,t.l*.43);c.strokeStyle=ART.palette.outline;c.lineWidth=.8;for(let y=-t.l*.43;y<-t.l*.08;y+=5){c.beginPath();c.moveTo(-t.w*.43,y);c.lineTo(t.w*.43,y);c.stroke();}c.fillStyle=body;c.fillRect(-t.w*.49,-t.l*.07,t.w*.98,t.l*.52);c.strokeStyle=ART.palette.outline;c.strokeRect(-t.w*.49,-t.l*.07,t.w*.98,t.l*.52);}
  // Door seams remain visible when closed; an open driver's aperture replaces its side seam.
  if(t.driverDoor){const door=t.driverDoor,L=t.l*door.length,hy=t.l*door.hingeY,y0=hy-L/2,y1=hy+L/2;
   c.strokeStyle=ART.palette.swatches.s171;c.lineWidth=.7;
   for(const side of [-1,1]){const x=side*t.w*.46,open=this._doorOpen&&this.driver==='player'&&side<0;
    if(open){c.fillStyle=ART.palette.doorInterior;c.fillRect(x-side*1.4,y0,t.w*.045,L);}
    else{c.beginPath();c.moveTo(x,y0);c.lineTo(x,y1);c.stroke();c.fillStyle=ART.palette.sandLight;c.fillRect(x-1.3,hy-1.1,2.5,1.1);}
   }
   // Front and rear boundaries complete the two door outlines on both flanks.
   for(const side of [-1,1]){const x=side*t.w*.46;c.beginPath();c.moveTo(x,y0);c.lineTo(x-side*1.2,y0);c.moveTo(x,y1);c.lineTo(x-side*1.2,y1);c.stroke();}
  }
  if(van){c.strokeStyle=ART.palette.outline;c.lineWidth=.8;c.beginPath();c.moveTo(t.w*.47,-t.l*.2);c.lineTo(t.w*.47,t.l*.39);c.moveTo(t.w*.47,t.l*.39);c.lineTo(-t.w*.47,t.l*.39);c.stroke();c.fillStyle=ART.palette.glass;c.fillRect(-t.w*.43,-t.l*.4,t.w*.86,t.l*.12);c.strokeStyle='rgba(230,245,239,.55)';c.beginPath();c.moveTo(-t.w*.3,-t.l*.39);c.lineTo(-t.w*.08,-t.l*.3);c.stroke();}
  // Sedan/sport/pickup glasshouse: windshield, body-colour roof, rear glass.
  const cabTop=truck?-t.l*.08:pickup?-t.l*.44:van?-t.l*.43:-t.l*.34,cabBottom=truck?t.l*.29:pickup?-t.l*.02:van?-t.l*.25:t.l*.23,cabW=truck?t.w*.76:pickup?t.w*.76:van?t.w*.82:t.w*.69;
  c.fillStyle=dark;c.beginPath();c.moveTo(-cabW*.45,cabTop);c.lineTo(cabW*.45,cabTop);c.lineTo(cabW*.5,cabTop+t.l*.18);c.lineTo(-cabW*.5,cabTop+t.l*.18);c.closePath();c.fill();
  if(pickup||van||convertible){c.fillStyle=ART.palette.glass;c.beginPath();c.moveTo(-cabW*.47,cabTop+t.l*.185);c.lineTo(cabW*.47,cabTop+t.l*.185);c.lineTo(cabW*.43,cabBottom-t.l*.1);c.lineTo(-cabW*.43,cabBottom-t.l*.1);c.closePath();c.fill();c.strokeStyle=ART.palette.outline;c.lineWidth=.7;c.stroke();c.strokeStyle='rgba(230,245,239,.55)';c.beginPath();c.moveTo(-cabW*.34,cabTop+t.l*.2);c.lineTo(-cabW*.08,cabTop+t.l*.2);c.stroke();}
  else{const roofColor=this.type==='taxi'?ART.palette.carYellow:police?ART.palette.policeBand:body;c.fillStyle=LIGHTING&&this.type==='taxi'?shade(roofColor,1.12):roofColor;c.beginPath();c.moveTo(-cabW*.47,cabTop+t.l*.185);c.lineTo(cabW*.47,cabTop+t.l*.185);c.lineTo(cabW*.43,cabBottom-t.l*.1);c.lineTo(-cabW*.43,cabBottom-t.l*.1);c.closePath();c.fill();c.strokeStyle=ART.palette.swatches.s172;c.lineWidth=.7;c.stroke();}
  if(LIGHTING){c.strokeStyle='rgba(176,207,218,.40)';c.lineWidth=1.1;c.beginPath();c.moveTo(-cabW*.32,cabTop+(pickup||van||convertible?t.l*.205:t.l*.11));c.lineTo(cabW*.12,cabTop+(pickup||van||convertible?t.l*.205:t.l*.11));c.stroke();c.strokeStyle='rgba(176,207,218,.28)';c.lineWidth=.75;c.beginPath();c.moveTo(cabW*.15,cabTop+t.l*.12);c.lineTo(cabW*.34,cabTop+t.l*.16);c.stroke();}
  c.fillStyle=dark;c.beginPath();c.moveTo(-cabW*.43,cabBottom-t.l*.09);c.lineTo(cabW*.43,cabBottom-t.l*.09);c.lineTo(cabW*.38,cabBottom);c.lineTo(-cabW*.38,cabBottom);c.closePath();c.fill();
  if(convertible){c.fillStyle=ART.palette.boatSeat;c.fillRect(-t.w*.27,-t.l*.08,t.w*.19,t.l*.18);c.fillRect(t.w*.08,-t.l*.08,t.w*.19,t.l*.18);c.fillStyle=dark;c.fillRect(-t.w*.38,-t.l*.16,t.w*.76,2);c.fillRect(-t.w*.38,t.l*.13,t.w*.76,2);}
  // Mirrors, bumpers, lamps, grille and sport spoiler.
  c.fillStyle=ART.palette.outline;c.fillRect(-cabW*.57,cabTop+t.l*.11,2.6,3.4);c.fillRect(cabW*.48,cabTop+t.l*.11,2.6,3.4);
  c.fillStyle=ART.palette.roadDark;c.fillRect(-t.w*.43,-t.l*.51,t.w*.86,2);c.fillRect(-t.w*.43,t.l*.47,t.w*.86,2);
  c.fillStyle=ART.palette.headlight;c.fillRect(-t.w*.43,-t.l*.49,4,2.4);c.fillRect(t.w*.43-4,-t.l*.49,4,2.4);
  c.fillStyle=ART.palette.tailLight;c.fillRect(-t.w*.43,t.l*.43,4,2.5);c.fillRect(t.w*.43-4,t.l*.43,4,2.5);
  c.fillStyle=ART.palette.glass;c.fillRect(-t.w*.2,-t.l*.5,t.w*.4,1.7);
  if(sport){c.fillStyle=ART.palette.tailLight;c.fillRect(-t.w*.44,t.l*.48,t.w*.88,1.5);}
  if(this.type==='taxi'){c.fillStyle=ART.palette.outline;for(let y=-t.l*.3;y<t.l*.34;y+=3){c.fillRect(-t.w*.49,y,2.2,2);c.fillRect(t.w*.49-2.2,y,2.2,2);}c.fillStyle=ART.palette.taxiSign;c.fillRect(-6,-t.l*.08,12,4);c.strokeStyle=ART.palette.outline;c.strokeRect(-6,-t.l*.08,12,4);}
  if(police){c.fillStyle=ART.palette.policeBand;c.fillRect(-t.w*.46,t.l*.03,t.w*.92,t.l*.14);c.fillStyle=ART.palette.outline;c.fillRect(-7,-2,14,4);const blue=Math.floor(world.time*8)%2===0;c.fillStyle=blue?ART.lights.policeBlue:ART.lights.policeRed;c.fillRect(-6,-1.5,6,3);c.fillStyle=blue?ART.lights.policeRed:ART.lights.policeBlue;c.fillRect(0,-1.5,6,3);}
  if(this._braking||this._hardBrake){c.fillStyle=ART.lights.brake;if(this._brakeGlow||world.timeOfDay!=='day'){c.shadowColor=ART.palette.brakeGlow;c.shadowBlur=this._brakeGlow?10:world.timeOfDay==='night'?11:6;}c.fillRect(-t.w*.43,t.l*.43,4,2.5);c.fillRect(t.w*.43-4,t.l*.43,4,2.5);c.shadowBlur=0;}
  if(this._headlights){c.shadowColor=ART.lights.headlight;c.shadowBlur=8;c.fillStyle=ART.lights.headlight;c.fillRect(-t.w*.43,-t.l*.49,4,2.4);c.fillRect(t.w*.43-4,-t.l*.49,4,2.4);c.shadowBlur=0;}
  if(this._crash>0&&Math.floor(world.time*5)%2===0){c.fillStyle=ART.palette.brake;c.fillRect(-t.w*.43,t.l*.43,4,2.5);c.fillRect(t.w*.43-4,t.l*.43,4,2.5);}
  if(hero&&sport){c.fillStyle=ART.palette.swatches.s173;c.fillRect(-t.w*.44,t.l*.48,t.w*.88,1.5);}
  if(this._honk>0){c.save();c.rotate(-this.angle);c.fillStyle=ART.palette.swatches.s174;c.font='bold 14px sans-serif';c.fillText('!',8,-t.l*.65);c.restore();}
  if(Math.abs(this.speed)*.14>120){c.strokeStyle=ART.palette.swatches.s175;c.lineWidth=1;c.beginPath();for(let i=-1;i<=1;i++){c.moveTo(i*7,t.l*.55);c.lineTo(i*11,t.l*.55+18+Math.abs(this.speed)*.03);}c.stroke();}
  if(this.damage>.6){for(let i=0;i<4;i++){c.fillStyle=`rgba(${ART.palette.damageSmokeRgb},${.24+Math.sin(world.time*2+i)*.12})`;c.beginPath();c.arc(Math.sin(world.time+i)*10,-t.l*.5-i*7,Math.min(12,5+i*1.7),0,Math.PI*2);c.fill();}}
  c.restore();
 }
 getDriverDoorWorldPosition(){const t=VEHICLE_TYPES[this.type],d=t.driverDoor;if(!d)return{x:this.x,y:this.y};const L=t.l*d.length,W=t.w*d.width,hy=t.l*d.hingeY,hx=t.w*d.hingeX,center={x:hx-L*.5,y:hy-L/2+W*.5};return{x:this.x+Math.cos(this.angle)*center.x-Math.sin(this.angle)*center.y,y:this.y+Math.sin(this.angle)*center.x+Math.cos(this.angle)*center.y};}
 drawCoverDoor(c){if(!this._doorOpen||this.driver!=='player')return;const t=VEHICLE_TYPES[this.type],door=t.driverDoor;if(!door)return;const L=t.l*door.length,W=t.w*door.width,hy=t.l*door.hingeY,hx=t.w*door.hingeX,y0=hy-L/2,angle=Math.PI/2,dx=-Math.sin(angle)*L,dy=Math.cos(angle)*L,thickness=2.3;c.save();c.translate(this.x,this.y);c.rotate(this.angle);
  // The leaf pivots at the forward end of the aperture and swings fully outboard.
  const x0=hx,y=y0,x1=x0+dx,y2=y+dy;
  c.fillStyle=ART.palette.doorOutline;c.fillRect(Math.min(x0,x1),y,Math.abs(dx)+thickness,W);
  c.fillStyle=this.color;c.fillRect(Math.min(x0,x1),y,Math.abs(dx),W);
  c.strokeStyle=ART.palette.doorOutline;c.lineWidth=1;c.strokeRect(Math.min(x0,x1),y,Math.abs(dx),W);
  c.fillStyle=ART.palette.doorGlass;c.fillRect(Math.min(x0,x1)+Math.abs(dx)*.16,y+W*.16,Math.abs(dx)*.68,W*.68);
  c.fillStyle=ART.palette.swatches.s172;c.fillRect(Math.min(x0,x1),y,Math.max(1,Math.abs(dx)*.14),W);c.restore();}
}
