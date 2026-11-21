import { CityMap } from './city.js';
import {Player} from './player.js';
import {Vehicle,VEHICLE_TYPES} from './vehicles.js';
export const World = class World {
  constructor(rng) { this.rng=rng; this.city=new CityMap(rng); this.time=0; this.objective=null; this.playerStart={x:720,y:880};this.player=new Player(this.playerStart.x,this.playerStart.y);this.vehicles=[];for(let i=0;i<26;i++){const p=this.city.randomRoadPoint(rng);p.x+=rng.range(-18,18);this.vehicles.push(new Vehicle(p.x,p.y,rng.pick(Object.keys(VEHICLE_TYPES)),null,rng.chance(.5)?0:Math.PI));}for(let i=0;i<4;i++)this.vehicles.push(new Vehicle(535,680+i*145,rng.pick(Object.keys(VEHICLE_TYPES)),null,0));this.driving=null;this.heat=0;this.money=500;this.health=100; }
  nearestCar(x,y,maxDist){let best=null,d=maxDist;for(const v of this.vehicles){if(v.driver)continue;const n=Math.hypot(x-v.x,y-v.y);if(n<d){best=v;d=n;}}return best;}
  step(dt,input={down:()=>false,actions:0}) { this.time+=dt;this.player.update(dt,input,this); }
};
