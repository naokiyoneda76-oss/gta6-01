import {SeededRandom} from './random.js';
import {World} from './world.js';
import {Vehicle} from './vehicles.js';

export const ShotDirector=class ShotDirector{
 stageShot(name,game){
  const seed=Number(new URLSearchParams(location.search).get('seed')||1);game.rng=new SeededRandom(seed);game.world=new World(game.rng);const w=game.world;game.screen='play';
  if(name==='title'){game.screen='title';game.camera.x=535;game.camera.y=950;game.time=8;return false;}
  if(name==='map'){w._showMap=true;w.objective={x:820,y:950,label:'MISSION: MEET MIA'};game.camera.x=535;game.camera.y=950;return true;}
  if(name==='cover'){
   w.setTimeOfDay('day');const x=720,y=1020,v=new Vehicle(x,y,'sport','#e94f45',.78);v.speed=321;v.driver='player';w.vehicles.push(v);w.driving=v;w.player.x=v.x;w.player.y=v.y;
   // One braking car approaches from the coastal boulevard; its lit brakes signal a response, not a collision.
   const brake=new Vehicle(535,936,'sedan','#d8d2bd',0);brake.driver='traffic';brake._braking=true;w.vehicles.push(brake);w.traffic.cars.push(brake);
   const police=new Vehicle(790,1280,'police','#e7e4d8',0);police.driver='police';w.vehicles.push(police);w.police.units.push(police);
   const p=w.pedestrians.people[0];p.x=681;p.y=1001;p.run=true;p._recoil=true;p.timer=2;p.vx=-34;p.vy=-18;p.angle=Math.atan2(p.vx,-p.vy);
   w.objective={x,y,label:'STEAL THE SPORTS CAR'};w.heat=2;w.wanted.heat=2;w.effects.skid(x-33,y+33,.78,34);w.effects.skid(x-22,y+48,.78,32);w.pinCallout('STOLEN!','+ SPORTS CAR',{y:176});game.camera.x=820;game.camera.y=1020;game.camera.zoom=1.4;
  }
  else if(name==='chase'){
   w.setTimeOfDay('night');const x=1250,y=720,v=new Vehicle(x,y,'sport','#e94f45',Math.PI/2-.27);v.speed=785;v.driver='player';v._handbrake=true;w.vehicles.push(v);w.driving=v;w.player.x=x;w.player.y=y;w.objective={x:x+620,y,label:'LOSE THE HEAT'};w.wanted.heat=w.heat=5;
   w.police.units=[];for(const [dx,dy] of [[-100,-17],[-178,18]]){const q=new Vehicle(x+dx,y+dy,'police','#e7e4d8',Math.PI/2);q.driver='police';q.speed=110;w.vehicles.push(q);w.police.units.push(q);w.effects.lightPool(q.x,q.y+12,'rgba(50,105,255,.32)',72);w.effects.lightPool(q.x,q.y+12,'rgba(255,44,54,.28)',58);}
   for(const dy of [-22,22]){const q=new Vehicle(x+300,y+dy,'police','#e7e4d8',Math.PI/2);q.driver='roadblock';q._parked=true;q._crash=2;w.vehicles.push(q);w.police.units.push(q);w.effects.lightPool(q.x,q.y+8,dy<0?'rgba(255,40,50,.42)':'rgba(45,100,255,.42)',94);}
   for(let i=0;i<28;i++)w.effects.skid(x-90+i*7,y+Math.sin(i*.34)*39,Math.PI/2-.27,34);
   for(let i=0;i<7;i++)w.effects.particles.push({x:x-32-i*7,y:y+12+(i%3)*7,vx:-12,vy:8,life:1.2,size:13,color:'rgba(210,207,194,.62)'});
   w.pinCallout('HIGH HEAT!','HEAT LEVEL 5',{y:176});game.camera.x=x+60;game.camera.y=y+66;game.camera.zoom=1.2;
  }
  else if(name==='marina'){
   w.setTimeOfDay('dusk');w.player.x=560;w.player.y=2100;w.player._cover=true;w.gang.spawnGroup(740,2030,3,{faction:'Ambush',color:'#813d4a'}).members.forEach((p,i)=>{p.x=740+i*35;p.y=2020+(i%2)*85;p.state='combat';p.angle=Math.PI;p._flash=i===0;p.cover={x:p.x,y:p.y};});
   w.combat.bullets.push({x:620,y:2082,prevX:580,prevY:2085,vx:0,vy:0,life:1,range:200,owner:'player'});w.combat.bullets.push({x:700,y:2080,prevX:740,prevY:2025,vx:0,vy:0,life:1,range:200,owner:'gang'});w.effects.burst(580,2085,7);
   w.dialogue.play([{who:'ROSA',text:'Danny, get behind the crates! It’s an ambush — they’re coming in from the pier!'}]);w.dialogue.revealAll();w.objective={x:650,y:2100,label:'SURVIVE THE AMBUSH'};w.heat=2;w.wanted.heat=2;w.activities.flags=[];w.activities.cards=[];w.pinCallout('BETRAYAL','SURVIVE THE AMBUSH',{x:640,y:176});game.camera.x=650;game.camera.y=2100;game.camera.zoom=1.2;
  }
  else if(name==='taxi'){
   w.setTimeOfDay('night');const x=1070,y=1020,v=new Vehicle(x,y,'taxi','#e8bc3e',Math.PI/2);v.speed=428;v.driver='player';v.passenger=true;w.vehicles.push(v);w.driving=v;w.player.x=v.x;w.player.y=v.y;
   const oncoming=new Vehicle(x+82,y-5,'sedan','#42657b',Math.PI*1.5);oncoming.speed=-125;oncoming.driver='traffic';w.vehicles.push(oncoming);w.traffic.cars.push(oncoming);
   w.objective={x:x+225,y:y-135,label:'FARE $185  •  ROSA’S HOTEL'};w.pinCallout('NEAR MISS!','+$25',{y:176});game.camera.x=x+35;game.camera.y=y+200;game.camera.zoom=1.15;
  }
  else if(name==='street'){w.player.x=635;w.player.y=650;w.objective={x:720,y:1250,label:'MEET MIA AT THE GARAGE'};game.camera.x=635;game.camera.y=650;}
  else if(name==='downtown'){const v=new Vehicle(1920,780,'sedan','#42657b',Math.PI/2);v.speed=65;v.driver='player';w.vehicles.push(v);w.driving=v;w.heat=1;w.wanted.heat=1;w.objective={x:2200,y:780,label:'HEAD DOWNTOWN'};game.camera.x=v.x;game.camera.y=v.y;}
  else {game.screen='title';game.camera.x=535;game.camera.y=950;return false;}
  game.camera.clamp(w.city);return true;
 }
};
