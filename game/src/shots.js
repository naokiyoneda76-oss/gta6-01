import {SeededRandom} from './random.js';
import {World} from './world.js';
import {Vehicle} from './vehicles.js';

export const ShotDirector=class ShotDirector{
 stageShot(name,game){
  const seed=Number(new URLSearchParams(location.search).get('seed')||1);game.rng=new SeededRandom(seed);game.world=new World(game.rng);const w=game.world;game.screen='play';const dress=(cars,people)=>{for(const [x,y,type,color,a] of cars){const q=new Vehicle(x,y,type,color,a);q.driver='traffic';q.speed=45;w.vehicles.push(q);w.traffic.cars.push(q);}for(const [x,y] of people){const p=w.pedestrians.people[w.pedestrians.people.length-1];const q={...p,x,y,vx:0,vy:0,angle:0,timer:0,run:false};w.pedestrians.people.push(q);}};
  if(name==='title'){game.screen='title';game.camera.x=535;game.camera.y=950;game.time=8;return false;}
  if(name==='map'){w._showMap=true;w.objective={x:820,y:950,label:'MISSION: MEET MIA'};game.camera.x=535;game.camera.y=950;return true;}
  if(name==='cover'){
   w.setTimeOfDay('day');game.camera.zoom=3.6;game.camera.x=640;game.camera.y=1000;
   // FIRST WHEELS catches the handoff itself: a parked car and two distinct, staged poses.
   const v=new Vehicle(669.17,997.22,'sport','#e94f45',-.61);v.speed=0;v.driver='player';v._doorOpen=true;v._coverDoorAngle=60;w.vehicles.push(v);w._shotSpeed=0;
   w.player.x=637.22;w.player.y=1012.50;w.player.angle=-.61;w.player._coverEntering=true;
   const p=w.pedestrians.people[0];p.x=612.22;p.y=987.50;p.run=false;p._recoil=false;p._alarmed=false;p._coverOwnerStagger=true;p.timer=0;p.vx=0;p.vy=0;p.angle=0;
   w.city.looseItems=[];
   const drawCrowd=w.pedestrians.draw.bind(w.pedestrians);w.pedestrians.draw=(ctx)=>{const people=w.pedestrians.people;w.pedestrians.people=people.filter(q=>q!==p);drawCrowd(ctx);w.pedestrians.people=people;ctx.save();ctx.translate(p.x,p.y);ctx.scale(2.55,2.55);ctx.rotate(-.42);ctx.fillStyle='rgba(30,28,22,.25)';ctx.beginPath();ctx.ellipse(0,1,2,1,0,0,7);ctx.fill();ctx.fillStyle=p.color;ctx.beginPath();ctx.ellipse(0,-3,1,-0+4,0,0,7);ctx.fill();ctx.fillStyle='#dbad83';ctx.beginPath();ctx.arc(0,-8,1.3,0,7);ctx.fill();ctx.strokeStyle=p.color;ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-.4,-5);ctx.lineTo(-1.4,-4);ctx.lineTo(-2.2,-3);ctx.moveTo(.4,-5);ctx.lineTo(1.5,-3.5);ctx.lineTo(3.8,-2.5);ctx.moveTo(-.4,0);ctx.lineTo(-1.4,1);ctx.lineTo(-2.2,2);ctx.moveTo(.4,0);ctx.lineTo(1.4,1);ctx.lineTo(2.4,1.7);ctx.stroke();ctx.restore();};
   // Surrounding boulevard life stays well clear of the theft action.
   dress([[900,900,'sedan','#47747a',0],[1030,1130,'taxi','#e8bc3e',Math.PI/2]],[[590,1080],[610,1110],[570,1130]]);
   w.missions.index=1;w.missions.state='active';w.missions.car=v;w.objective=null;w._shotObjectiveBanner='GET IN THE CAR';w.heat=2;w.wanted.heat=2;
   w.effects.skids=[];w.effects.particles=w.effects.particles.filter(q=>!q._smoke);w.pinCallout('STOLEN!','FIRST WHEELS',{y:176});
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
   w.setTimeOfDay('dusk');for(const v of w.vehicles)if(v.type==='police'){v.type='sedan';v.color='#d8d2bd';}w.player.x=554;w.player.y=2074;w.player._cover=true;w._marinaShotMarker=true;w.objective={x:554,y:2074,label:'SURVIVE THE AMBUSH'};const coverCrate=w.city.crates.find(b=>b.x===565&&b.y===2055);if(coverCrate){coverCrate.x=545;coverCrate.w=30;coverCrate.h=28;}
   // Pier-side and road-side teams converge on the marked crate cover.
   const pier=w.gang.spawnGroup(430,2050,3,{faction:'Ambush',color:'#813d4a'});
   pier.members.forEach((p,i)=>{p.x=405+i*24;p.y=2040+i*18;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._flash=true;p._advancing=true;p.cover={x:p.x,y:p.y};});
   const road=w.gang.spawnGroup(820,1880,3,{faction:'Ambush',color:'#813d4a'});
   road.members.forEach((p,i)=>{p.x=820+i*24;p.y=1880+i*18;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._flash=true;p._advancing=true;p.cover={x:p.x,y:p.y};});
   // Two incoming rounds strike the front crate face from distinct bearings.
   w.combat.bullets.push({x:574,y:2051,prevX:420,prevY:2046,vx:0,vy:0,life:1,range:300,owner:'gang'});
   w.combat.bullets.push({x:596,y:2051,prevX:860,prevY:1870,vx:0,vy:0,life:1,range:300,owner:'gang'});
   // Three bright return rounds connect the exposed muzzle to distinct road-side attackers.
   for(const [target,from] of [[road.members[0],[580,2055]],[road.members[1],[580,2055]],[road.members[2],[580,2055]]])w.combat.bullets.push({x:target.x,y:target.y-9,prevX:from[0],prevY:from[1],sx:from[0],sy:from[1],vx:0,vy:0,life:1,range:300,owner:'player',staged:true});
   w.effects.impacts.push({x:574,y:2051},{x:596,y:2051},{x:road.members[0].x,y:road.members[0].y-9},{x:road.members[1].x,y:road.members[1].y-9},{x:road.members[2].x,y:road.members[2].y-9});
   w.dialogue.play([{who:'ROSA',text:'Danny, get behind the crates! It’s an ambush — they’re coming in from the pier!'}]);w.dialogue.revealAll();w.heat=2;w.wanted.heat=2;w.activities.flags=[];w.activities.cards=[];w.pinCallout('BETRAYAL','SURVIVE THE AMBUSH',{x:640,y:176});game.camera.x=640;game.camera.y=2048;game.camera.zoom=1.45;dress([[465,1950,'sedan','#47747a',Math.PI/2],[790,2180,'pickup','#526d59',Math.PI/2]],[[465,1990],[795,2110],[520,2190]]);
  }
  else if(name==='taxi'){
   w.setTimeOfDay('day');const x=1020,y=1300;
   // A broad staged boulevard segment gives the complete manoeuvre room on asphalt.
   const road=w.city.roads.find(r=>r.x1===r.x2&&r.x1===1020);if(road)road.width=150;
   const v=new Vehicle(x,y,'taxi','#e8bc3e',.62);v.speed=428;v.driver='player';v.passenger=true;v._handbrake=true;w.vehicles.push(v);w.driving=v;w.player.x=v.x;w.player.y=v.y;
   // Preserve the direct collision line while leaving a thumbnail-readable gap.
   const flank={x:Math.cos(v.angle),y:Math.sin(v.angle)},sedanHeading=Math.atan2(-flank.x,flank.y),sedanOffset=16.2+21.5+25;
   const oncoming=new Vehicle(x+flank.x*sedanOffset,y+flank.y*sedanOffset,'sedan','#42657b',sedanHeading);oncoming.speed=-125;oncoming.driver='traffic';oncoming._braking=true;oncoming._brakeGlow=true;w.effects.skids.push(
    {curve:[[x-66,y+53],[x-48,y+42],[x-31,y+25],[x-16,y+6]],width:2.3},
    {curve:[[x-60,y+62],[x-42,y+51],[x-25,y+34],[x-10,y+15]],width:2.3},
    {x:oncoming.x-flank.x*25,y:oncoming.y-flank.y*25,angle:sedanHeading,length:48,width:3.8,color:'rgba(9,12,14,.92)'},
    {x:oncoming.x-flank.x*25+flank.y*8,y:oncoming.y-flank.y*25-flank.x*8,angle:sedanHeading,length:48,width:3.8,color:'rgba(9,12,14,.92)'}
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
