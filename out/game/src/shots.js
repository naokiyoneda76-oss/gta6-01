import {SeededRandom} from './random.js';
import {World} from './world.js';
import {Vehicle} from './vehicles.js';

export const ShotDirector=class ShotDirector{
 stageShot(name,game){
  const seed=Number(new URLSearchParams(location.search).get('seed')||1);game.rng=new SeededRandom(seed);game.world=new World(game.rng);const w=game.world;game.screen='play';const dress=(cars,people)=>{for(const [x,y,type,color,a] of cars){const q=new Vehicle(x,y,type,color,a);q.driver='traffic';q.speed=45;w.vehicles.push(q);w.traffic.cars.push(q);}for(const [x,y] of people){const p=w.pedestrians.people[w.pedestrians.people.length-1];const q={...p,x,y,vx:0,vy:0,angle:0,timer:0,run:false};w.pedestrians.people.push(q);}};
  if(name==='title'){game.screen='title';game.camera.x=535;game.camera.y=950;game.time=8;return false;}
  if(name==='map'){w._showMap=true;w.objective={x:820,y:950,label:'MISSION: MEET MIA'};game.camera.x=535;game.camera.y=950;return true;}
  if(name==='cover'){
   w.setTimeOfDay('day');const x=750,y=1020,v=new Vehicle(x,y,'sport','#e94f45',.78);v.speed=321;v.driver='player';w.vehicles.push(v);w.driving=v;w.player.x=v.x;w.player.y=v.y;
   // One braking car approaches from the coastal boulevard; its lit brakes signal a response, not a collision.
   const brake=new Vehicle(535,936,'sedan','#d8d2bd',0);brake.driver='traffic';brake._braking=true;w.vehicles.push(brake);w.traffic.cars.push(brake);
   const police=new Vehicle(1110,1000,'police','#e7e4d8',0);police.driver='police';police._headlights=true;w.vehicles.push(police);w.police.units.push(police);
   const p=w.pedestrians.people[0];p.x=686;p.y=1065;p.run=false;p._recoil=false;p._alarmed=true;p.timer=2;p.vx=0;p.vy=0;p.angle=0;
   // Enlarge only the staged owner; keep every other pedestrian at the shared crowd scale.
   const drawCrowd=w.pedestrians.draw.bind(w.pedestrians);w.pedestrians.draw=(ctx)=>{const people=w.pedestrians.people;w.pedestrians.people=people.filter(q=>q!==p);drawCrowd(ctx);w.pedestrians.people=people;ctx.save();ctx.translate(p.x,p.y+Math.sin(w.time*8+p.x)*1.4);ctx.scale(2.1,2.1);ctx.fillStyle='rgba(30,28,22,.25)';ctx.beginPath();ctx.ellipse(0,2,4,2,0,0,7);ctx.fill();ctx.fillStyle=p.color;ctx.fillRect(-2,-8,4,8);ctx.fillStyle='#dbad83';ctx.beginPath();ctx.arc(0,-10,2.5,0,7);ctx.fill();ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-1,-6);ctx.lineTo(-6,-12);ctx.lineTo(-7,-16);ctx.moveTo(1,-6);ctx.lineTo(7,-12);ctx.lineTo(8,-16);ctx.moveTo(-1,0);ctx.lineTo(-4,4);ctx.moveTo(1,0);ctx.lineTo(5,3);ctx.stroke();ctx.restore();};
   dress([[890,900,'sedan','#47747a',0],[980,1130,'taxi','#e8bc3e',Math.PI/2]],[[600,1000],[620,1040],[585,1060]]);
   // Stage FIRST WHEELS after the steal: its target ring now points to Mia's garage.
   w.missions.index=1;w.missions.state='active';w.missions.car=v;w.objective={x:4050,y:1700,label:'DELIVER THE CAR'};w.heat=2;w.wanted.heat=2;for(let i=0;i<7;i++){w.effects.skid(x-72+i*8,y+70-i*7,.78,26);w.effects.skid(x-86+i*8,y+84-i*7,.78,25);}for(let i=0;i<12;i++)w.effects.particles.push({x:x-18-i*5,y:y+8+i*1.3,vx:-8,vy:3,life:1,size:7+(i%4)*2,color:'rgba(250,249,242,.62)',_smoke:true});w.pinCallout('STOLEN!','+ SPORTS CAR',{y:176});game.camera.x=690;game.camera.y=1020;game.camera.zoom=2.2;
  }
  else if(name==='chase'){
   w.setTimeOfDay('night');const x=1250,y=720,v=new Vehicle(x,y,'sport','#e94f45',Math.PI/2-.27);v.speed=785;v.driver='player';v._handbrake=true;w.vehicles.push(v);w.driving=v;w.player.x=x;w.player.y=y;w.objective={x:x+620,y,label:'LOSE THE HEAT'};w.wanted.heat=w.heat=5;
   const heading=v.angle,forward={x:Math.sin(heading),y:-Math.cos(heading)},lateral={x:Math.cos(heading),y:Math.sin(heading)};
   w.police.units=[];for(const [back,side] of [[48,0],[105,-17],[220,18]]){const q=new Vehicle(x-forward.x*back+lateral.x*side,y-forward.y*back+lateral.y*side,'police','#e7e4d8',heading);q.driver='police';q.speed=110;w.vehicles.push(q);w.police.units.push(q);w.effects.lightPool(q.x,q.y+12,'rgba(50,105,255,.82)',110);w.effects.lightPool(q.x,q.y+12,'rgba(255,44,54,.78)',102);if(back===48){q._headlights=true;w.effects.lightPool(q.x,y+12,'rgba(50,105,255,.52)',130);}}
   for(const side of [-1,1]){const q=new Vehicle(x+220,y+side*14,'police','#e7e4d8',Math.PI/2);q.driver='roadblock';q._parked=true;q._headlights=true;q._crash=2;w.vehicles.push(q);w.police.units.push(q);w.effects.lightPool(q.x,q.y+8,side<0?'rgba(255,40,50,.88)':'rgba(45,100,255,.86)',132);}
   for(let i=0;i<28;i++)w.effects.skid(x-90+i*7,y+Math.sin(i*.34)*39,Math.PI/2-.27,34);
   for(let i=0;i<11;i++)w.effects.particles.push({x:x-32-i*7,y:y+12+(i%3)*7,vx:-12,vy:8,life:1.35,size:12+(i%4)*2,color:'rgba(246,244,235,.62)',_smoke:true,angle:heading});
   w.pinCallout('HIGH HEAT!','HEAT LEVEL 5',{y:176});game.camera.x=x+60;game.camera.y=y+66;game.camera.zoom=1.2;dress([[1120,790,'sedan','#d8d2bd',heading],[1370,650,'pickup','#526d59',heading]],[[1080,610],[1430,740],[1190,850]]);
  }
  else if(name==='marina'){
   w.setTimeOfDay('dusk');for(const v of w.vehicles)if(v.type==='police'){v.type='sedan';v.color='#d8d2bd';}w.player.x=600;w.player.y=2104;w.player._cover=true;w.player._groundMarker=true;w.objective=null;
   // Pier-side and road-side teams converge on the marked crate cover.
   const pier=w.gang.spawnGroup(430,2050,3,{faction:'Ambush',color:'#813d4a'});
   pier.members.forEach((p,i)=>{p.x=405+i*24;p.y=2040+i*18;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._flash=true;p._advancing=true;p.cover={x:p.x,y:p.y};});
   const road=w.gang.spawnGroup(760,1910,3,{faction:'Ambush',color:'#813d4a'});
   road.members.forEach((p,i)=>{p.x=740+i*24;p.y=1895+i*18;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._flash=true;p._advancing=true;p.cover={x:p.x,y:p.y};});
   // Two incoming rounds strike the front crate face from distinct bearings.
   w.combat.bullets.push({x:574,y:2051,prevX:490,prevY:2075,vx:0,vy:0,life:1,range:200,owner:'gang'});
   w.combat.bullets.push({x:596,y:2051,prevX:650,prevY:1982,vx:0,vy:0,life:1,range:200,owner:'gang'});
   // Danny returns a round toward the road-side attackers.
   w.combat.bullets.push({x:710,y:1960,prevX:610,prevY:2090,vx:0,vy:0,life:1,range:200,owner:'player'});
   w.effects.impacts.push({x:574,y:2051},{x:596,y:2051},{x:610,y:2090,muzzle:true});w.effects.burst(574,2051,10);w.effects.burst(596,2051,10);w.effects.burst(610,2090,5);
   w.dialogue.play([{who:'ROSA',text:'Danny, get behind the crates! It’s an ambush — they’re coming in from the pier!'}]);w.dialogue.revealAll();w.objective={x:600,y:2104,label:'SURVIVE THE AMBUSH'};w.heat=2;w.wanted.heat=2;w.activities.flags=[];w.activities.cards=[];w.pinCallout('BETRAYAL','SURVIVE THE AMBUSH',{x:640,y:176});game.camera.x=640;game.camera.y=2048;game.camera.zoom=1.45;dress([[465,1950,'sedan','#47747a',Math.PI/2],[790,2180,'pickup','#526d59',Math.PI/2]],[[465,1990],[795,2110],[520,2190]]);
  }
  else if(name==='taxi'){
   w.setTimeOfDay('day');const x=1020,y=1300;
   // A broad staged boulevard segment gives the complete manoeuvre room on asphalt.
   const road=w.city.roads.find(r=>r.x1===r.x2&&r.x1===1020);if(road)road.width=150;
   const v=new Vehicle(x,y,'taxi','#e8bc3e',.62);v.speed=428;v.driver='player';v.passenger=true;v._handbrake=true;w.vehicles.push(v);w.driving=v;w.player.x=v.x;w.player.y=v.y;
   // Taxi cuts diagonally across the oncoming lane; the sedan is still straight and braking.
   const oncoming=new Vehicle(x-33,y-40,'sedan','#42657b',Math.PI);oncoming.speed=-125;oncoming.driver='traffic';oncoming._braking=true;w.effects.skids.push(
    {curve:[[x-66,y+53],[x-48,y+42],[x-31,y+25],[x-16,y+6]],width:2.3},
    {curve:[[x-60,y+62],[x-42,y+51],[x-25,y+34],[x-10,y+15]],width:2.3},
    {x:x-33,y:y-62,angle:0,length:48},
    {x:x-25,y:y-62,angle:0,length:48}
   );w.vehicles.push(oncoming);w.traffic.cars.push(oncoming);
   // Small smoke puffs sit at the taxi's two rear wheels.
   for(let i=0;i<5;i++){const side=i%2?1:-1;w.effects.particles.push({x:x-Math.sin(.62)*24+Math.cos(.62)*side*10,y:y+Math.cos(.62)*24+Math.sin(.62)*side*10,vx:-4+i*1.5,vy:2,life:.8,size:5+i%2*2,color:'rgba(245,244,235,.72)',_smoke:true});}
   w.objective=null;w._shotObjectiveBanner="FARE $185 • ROSA'S HOTEL";dress([],[[855,1240],[850,1330],[1225,1280],[1200,1340]]);w.pinCallout('NEAR MISS!','+$25',{y:176});game.camera.x=x;game.camera.y=y;game.camera.zoom=2;
  }
  else if(name==='street'){w.player.x=635;w.player.y=650;w.objective={x:720,y:1250,label:'MEET MIA AT THE GARAGE'};game.camera.x=635;game.camera.y=650;}
  else if(name==='downtown'){const v=new Vehicle(1920,780,'sedan','#42657b',Math.PI/2);v.speed=65;v.driver='player';w.vehicles.push(v);w.driving=v;w.heat=1;w.wanted.heat=1;w.objective={x:2200,y:780,label:'HEAD DOWNTOWN'};game.camera.x=v.x;game.camera.y=v.y;}
  else {game.screen='title';game.camera.x=535;game.camera.y=950;return false;}
  game.camera.clamp(w.city);return true;
 }
};
