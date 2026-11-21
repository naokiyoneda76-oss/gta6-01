import {VEHICLE_TYPES} from './vehicles.js';
import {drawFigure} from './figures.js';
export class Player{
 constructor(x,y){this.x=x;this.y=y;this.angle=0;this.speed=170;this.vx=0;this.vy=0;}
 update(dt,input,world){if(world.driving){if(input.actions&4){const v=world.driving;if(!world.gameStarted||world.missions.state==='available')world.keepGarageCar(v);world.driving=null;v.driver=null;this.x=v.x+Math.cos(v.angle)*34;this.y=v.y+Math.sin(v.angle)*34;return;}const v=world.driving,hb=input.down('Space'),throttle=(input.down('KeyW')?1:0)-(input.down('KeyS')?1:0);v._handbrake=hb;v._hardBrake=throttle<0;v.update(dt,{throttle,steer:(input.down('KeyD')?1:0)-(input.down('KeyA')?1:0),handbrake:hb},world);return;}const dx=(input.down('KeyD')||input.down('ArrowRight')?1:0)-(input.down('KeyA')||input.down('ArrowLeft')?1:0),dy=(input.down('KeyS')||input.down('ArrowDown')?1:0)-(input.down('KeyW')||input.down('ArrowUp')?1:0),m=Math.hypot(dx,dy)||1;this.speed=input.down('ShiftLeft')||input.down('ShiftRight')?300:170;this.vx=dx/m*this.speed;this.vy=dy/m*this.speed;if(dx||dy)this.angle=Math.atan2(dx,-dy);const nx=this.x+this.vx*dt,ny=this.y+this.vy*dt;if(world.city.isLand(nx,ny)&&!world.city.collidesBuilding(nx,ny,8)){this.x=nx;this.y=ny;}if(input.actions&4){const car=world.nearestCar(this.x,this.y,55);if(car){world.driving=car;car.driver='player';car._carjack=true;}}}
 draw(c,cam,world){if(world.driving||this._homecomingHidden)return; if(this._groundMarker){c.save();c.strokeStyle='rgba(255,225,139,.9)';c.lineWidth=1;c.beginPath();c.ellipse(this.x,this.y,14,4,0,0,Math.PI*2);c.stroke();c.restore();} c.save();c.translate(this.x,this.y);if(this._coverEntering){
   // Danny stands north of the flank, bracing on the open door and reaching into the cabin.
   c.rotate(0);
   drawFigure(c,{torso:'#cf694f',skin:'#e8bd91',pants:'#343b40',hair:'#382b26',hairStyle:'short',pose:'car-entry',joints:{head:{x:1.2,y:-11.6},shoulder:[{x:-4.3,y:-10.3},{x:4.7,y:-10.0}],hip:{x:0.3,y:-2.3},elbow:[{x:-7.8,y:-7.6},{x:8.2,y:-6.2}],hand:[{x:-11.0,y:-9.6},{x:10.4,y:-1.8}],knee:[{x:-3.4,y:0.8},{x:5.2,y:1.6}],foot:[{x:-6.8,y:3.4},{x:7.2,y:5.2}]}});
  }else if(this._cover){
   // A larger staged cover pose reads clearly beside the crate at thumbnail size.
   drawFigure(c,{torso:'#cf694f',skin:'#e8bd91',pants:'#343b40',hair:'#382b26',hairStyle:'short',pose:'cover'});
  }else{drawFigure(c,{torso:'#cf694f',skin:'#e8bd91',pants:'#343b40',hair:'#382b26',hairStyle:'short'});c.rotate(this.angle);c.fillStyle='#f7e8c8';c.fillRect(-.65,-14,1.3,4);}c.restore();if(world.nearestCar(this.x,this.y,55)){c.fillStyle='#fff2c9';c.font='bold 16px sans-serif';c.fillText('E',this.x+12,this.y-15);}}
}
