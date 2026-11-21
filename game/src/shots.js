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
   const v=new Vehicle(669.17,997.22,'sport','#e94f45',-.61);v.speed=0;v.driver='player';v._doorOpen=true;v._coverDoorAngle=50;w.vehicles.push(v);w._shotSpeed=0;
   w.player.x=639.44;w.player.y=1011.67;w.player.angle=-.61;w.player._coverEntering=true;
   const p=w.pedestrians.people[0];p.x=612.22;p.y=987.50;p.run=false;p._recoil=false;p._alarmed=false;p._coverOwnerStagger=true;p.timer=0;p.vx=0;p.vy=0;p.angle=0;
   w.city.looseItems=[];
   // The owner recoils away from the car; this shot has exactly two people.
   w.pedestrians.people=[p];
   w.pedestrians.draw=ctx=>{ctx.save();ctx.translate(p.x,p.y);ctx.scale(2.55,2.55);ctx.scale(1,1);ctx.fillStyle='rgba(30,28,22,.25)';ctx.beginPath();ctx.ellipse(0,2,4,2,0,0,7);ctx.fill();
    ctx.strokeStyle='#418b83';ctx.lineWidth=3.2;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(-2,-2.5);ctx.lineTo(-1.5,-5);ctx.lineTo(-2.5,-7); // shoulders and head lean away from car
    ctx.moveTo(-1.5,-4.5);ctx.lineTo(1,-4);ctx.lineTo(4,-3.5); // car-side arm reaches toward the door
    ctx.moveTo(-1.5,-4.5);ctx.lineTo(-4,-5.5);ctx.lineTo(-6,-7); // far arm flung away
    ctx.moveTo(-2,-2);ctx.lineTo(-4,0);ctx.lineTo(-5.5,1); // trailing leg away from car
    ctx.moveTo(-2,-2);ctx.lineTo(0,0.5);ctx.lineTo(1,2); // planted leg beneath him
    ctx.stroke();ctx.fillStyle='#418b83';ctx.beginPath();ctx.ellipse(-2.5,-6.5,1.2,1.5,-.5,0,7);ctx.fill();ctx.fillStyle='#dbad83';ctx.beginPath();ctx.arc(-3.5,-9.5,1.5,0,7);ctx.fill();ctx.restore();};
   // Keep street furniture and parked cars, with no additional pedestrians.
   dress([[900,900,'sedan','#47747a',0],[1030,1130,'taxi','#e8bc3e',Math.PI/2]],[]);
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
   w.setTimeOfDay('dusk');for(const v of w.vehicles)if(v.type==='police'){v.type='sedan';v.color='#d8d2bd';}w.player.x=578;w.player.y=2040;w.player._cover=true;w._marinaShotMarker=true;w.objective={x:554,y:2074,label:'SURVIVE THE AMBUSH'};const coverCrate=w.city.crates.find(b=>b.x===565&&b.y===2055);if(coverCrate){coverCrate.x=545;coverCrate.w=30;coverCrate.h=28;}
   // Pier-side and road-side teams converge on the marked crate cover.
   const pier=w.gang.spawnGroup(430,2050,3,{faction:'Ambush',color:'#813d4a'});
   pier.members.forEach((p,i)=>{p.x=405+i*24;p.y=2040+i*18;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._flash=true;p._advancing=true;p.cover={x:p.x,y:p.y};});
   const road=w.gang.spawnGroup(820,1880,3,{faction:'Ambush',color:'#813d4a'});
   road.members.forEach((p,i)=>{p.x=820+i*24;p.y=1880+i*18;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._flash=true;p._advancing=true;p.cover={x:p.x,y:p.y};});
   // Two incoming rounds strike the front crate face from distinct bearings.
   w.combat.bullets.push({x:574,y:2051,prevX:420,prevY:2046,vx:0,vy:0,life:1,range:300,owner:'gang'});
   w.combat.bullets.push({x:596,y:2051,prevX:860,prevY:1870,vx:0,vy:0,life:1,range:300,owner:'gang'});
   // Three bright return rounds connect the exposed muzzle to distinct road-side attackers.
   for(const [target,from] of [[road.members[0],[604,2021]],[road.members[1],[604,2021]],[road.members[2],[604,2021]]])w.combat.bullets.push({x:target.x,y:target.y-9,prevX:from[0],prevY:from[1],sx:from[0],sy:from[1],vx:0,vy:0,life:1,range:300,owner:'player',staged:true});
   w.effects.impacts.push({x:604,y:2021},{x:574,y:2051},{x:596,y:2051},{x:road.members[0].x,y:road.members[0].y-9},{x:road.members[1].x,y:road.members[1].y-9},{x:road.members[2].x,y:road.members[2].y-9});
   w.dialogue.play([{who:'ROSA',text:'Danny, get behind the crates! It’s an ambush — they’re coming in from the pier!'}]);w.dialogue.revealAll();w.heat=2;w.wanted.heat=2;w.activities.flags=[];w.activities.cards=[];w.pinCallout('BETRAYAL','SURVIVE THE AMBUSH',{x:640,y:176});game.camera.x=640;game.camera.y=2048;game.camera.zoom=1.45;dress([[465,1950,'sedan','#47747a',Math.PI/2],[790,2180,'pickup','#526d59',Math.PI/2]],[[465,1990],[795,2110],[520,2190]]);
  }
  else if(name==='homecoming'){
   w.setTimeOfDay('dusk');
   // Clear the procedural crowd so the reunion has quiet space around it.
   const pedestrianTemplate=w.pedestrians.people[0];w.pedestrians.people=[];w.vehicles=[];w.traffic.cars=[];w.police.units=[];w.gang.crews=[];
   w.effects.skids=[];w.effects.particles=[];w.effects.impacts=[];w.effects.lightPools=[];w.combat.bullets=[];w.activities.flags=[];w.activities.cards=[];
   // The renderer clamps camera.x to 640 (its half-width); keep the round-37
   // camera setup exactly so the lighthouse remains the screen-space anchor.
   const danny={...pedestrianTemplate,x:445,y:2090,vx:0,vy:0,angle:Math.PI/2,timer:0,run:false,color:'#cf694f',_shotScale:1.4,_homecomingPose:true};
   const mia={...pedestrianTemplate,x:478,y:2090,vx:0,vy:0,angle:-Math.PI/2,timer:0,run:false,color:'#f2a85e',_shotScale:1.4,_homecomingPose:true};
   w.player._homecomingHidden=true;w.pedestrians.people=[danny,mia];
   // Park on the inland shoulder beside the sand staging area.
   const car=new Vehicle(525,2115,'sedan','#e8a078',-Math.PI/2+.22);car.speed=0;car.driver=null;w.vehicles.push(car);
   w.objective={x:mia.x,y:mia.y,label:'TALK TO MIA'};w._shotObjectiveBanner='TALK TO MIA';w._homecomingShotMarkerSuppressed=true;w._homecomingScene=true;
   w.heat=0;w.wanted.heat=0;w.pinCallout('HOMECOMING','CORAL BEACH',{y:176});
   game.camera.x=540;game.camera.y=2040;game.camera.zoom=1.9;
  }
  else if(name==='getaway'){
   w.setTimeOfDay('night');w.vehicles=[];w.traffic.cars=[];w.pedestrians.people=[];
   const x=3985,y=2528,heading=.61,v=new Vehicle(x,y,'sport','#e94f45',heading);v.speed=820;v.driver='player';v._handbrake=true;v._headlights=true;v._groundMarker=true;w.vehicles.push(v);w.driving=v;w.player.x=x;w.player.y=y;
   // Keep the ramp, hero car, and police funnel on one clean apron sightline.
   const ramp={x:4119,y:2470};w.objective={x:ramp.x,y:ramp.y,label:'REACH THE CARGO PLANE'};w._getawayShotMarkerSuppressed=true;w._shotObjectiveBanner='REACH THE CARGO PLANE';w._shotSpeed=122;w.heat=w.wanted.heat=5;
   w.missions.index=5;w.missions.state='active';
   const forward={x:Math.sin(heading),y:-Math.cos(heading)},lateral={x:Math.cos(heading),y:Math.sin(heading)};
   const cops=[[3920,2558],[3865,2506],[3820,2590]];
   w.police.units=[];for(let i=0;i<cops.length;i++){const [cx,cy]=cops[i],a=heading+(i-1)*.13,q=new Vehicle(cx,cy,'police','#e7e4d8',a);q.driver='police';q.speed=95;q._headlights=true;q._braking=true;q._brakeGlow=true;w.vehicles.push(q);w.police.units.push(q);w.effects.lightPool(cx,cy,'rgba(50,105,255,.9)',132);w.effects.lightPool(cx,cy,'rgba(255,44,54,.88)',120);}
   // Paired curved tyre trails and smoke trail the red car through the turn.
   for(let i=0;i<15;i++){const back=30+i*7,side=(i%2?1:-1)*11;w.effects.skid(x-forward.x*back+lateral.x*side,y-forward.y*back+lateral.y*side,heading,30);}
   for(let i=0;i<9;i++)w.effects.particles.push({x:x-forward.x*(25+i*8)+lateral.x*(i%2?10:-10),y:y-forward.y*(25+i*8)+lateral.y*(i%2?10:-10),vx:-forward.x*10,vy:-forward.y*10,life:1.2,size:10+(i%3)*3,color:'rgba(246,244,235,.68)',_smoke:true,angle:heading});
   w.pinCallout('ESCAPE!','SUNSET GETAWAY',{y:176});game.camera.x=4180;game.camera.y=2485;game.camera.zoom=1.5;dress([],[]);
  }
  else if(name==='street'){w.player.x=635;w.player.y=650;w.objective={x:720,y:1250,label:'MEET MIA AT THE GARAGE'};game.camera.x=635;game.camera.y=650;}
  else if(name==='downtown'){const v=new Vehicle(1920,780,'sedan','#42657b',Math.PI/2);v.speed=65;v.driver='player';w.vehicles.push(v);w.driving=v;w.heat=1;w.wanted.heat=1;w.objective={x:2200,y:780,label:'HEAD DOWNTOWN'};game.camera.x=v.x;game.camera.y=v.y;}
  else {game.screen='title';game.camera.x=535;game.camera.y=950;return false;}
  game.camera.clamp(w.city);return true;
 }
};
