import {SeededRandom} from './random.js';
import {World} from './world.js';
import {Vehicle,VEHICLE_TYPES} from './vehicles.js';

export const ShotDirector=class ShotDirector{
  stageShot(name,game){
  game.camera._homecomingWestClamp=0;const params=new URLSearchParams(location.search),seed=Number(params.get('seed')||1),variant=params.get('variant')||'',cover5=params.get('cover5')==='1',cover2=params.get('cover2')==='1'&&!cover5,cover4=params.get('cover4')==='1',cover3=!cover2&&(cover4||params.get('cover3')!=='0');game.rng=new SeededRandom(seed);game.world=new World(game.rng);const w=game.world;w._stagedShot=true;w._fxLegacy=params.get('fx')==='0';game.screen='play';const dress=(cars,people)=>{for(const [x,y,type,color,a] of cars){const q=new Vehicle(x,y,type,color,a);q.driver='traffic';q.speed=45;w.vehicles.push(q);w.traffic.cars.push(q);}for(const [x,y] of people){const p=w.pedestrians.people[w.pedestrians.people.length-1];const q={...p,x,y,vx:0,vy:0,angle:0,timer:0,run:false};w.pedestrians.people.push(q);}};
  if(name==='title'){game.screen='title';game.camera.x=535;game.camera.y=950;game.time=8;return false;}
  if(name==='map'){w._showMap=true;w.objective={x:820,y:950,label:'MISSION: MEET MIA'};game.camera.x=535;game.camera.y=950;return true;}
  if(name==='styletest'){
   w.setTimeOfDay('day');w._styleTest=true;w.vehicles=[];w.traffic.cars=[];w.pedestrians.people=[];w.gang.crews=[];w.city.buildings=[];w.city.parkedCars=[];w.city.streetProps=[];w.city.palms=[];w.city.roads=[];
   w.player.x=610;w.player.y=1040;w.player.angle=0;w.player._homecomingHidden=false;w.player._coverEntering=false;w.player._cover=false;
   const npc={x:568,y:1037,vx:30,vy:0,angle:0,timer:0,run:false,color:'#4b8290',skin:'#dca77f',pants:'#394653',hair:'#302923',hairStyle:'long'};w.pedestrians.people=[npc];
   const hero=new Vehicle(690,1080,'sport','#e94f45',-.15),taxi=new Vehicle(825,1150,'taxi','#e8bc3e',.1);hero.driver='player';w.vehicles.push(hero,taxi);
   // Single two-lane carriageway, with paved sidewalks and a visible loading forecourt.
   w.city.roads.push({x1:500,y1:1120,x2:1100,y2:1120,width:160});w.city.palms.push({x:520,y:1015},{x:1080,y:1015});
   w.city.buildings.push(
    {x:520,y:920,w:250,d:58,height:24,kind:'shop',archetype:'shop',name:'PALM MARKET',commercial:true,awning:true,color:'#c7b9a0',roof:'#d18b70',district:'coral',treatment:1,roofProps:2},
    {x:850,y:910,w:128,d:82,height:48,kind:'hotel',archetype:'hotel',name:'HOTEL',commercial:true,footprint:'L',wing:{x:978,y:950,w:54,d:42},awning:true,color:'#e4c7a0',roof:'#9f7966',district:'coral',treatment:0,roofProps:3}
   );
   w.city.lots.push({x:520,y:985,w:250,d:60,type:'plaza',cars:0},{x:1065,y:1000,w:142,d:100,type:'parking',cars:3});
   // A paved loop serves the hotel entrance; the parking court sits clear beside it.
   w._styleHotelForecourt={x:850,y:992,w:210,h:48};
   w._styleHotelDrive={x:1000,y:1017,rx:45,ry:21};w._styleHotelIsland={x:982,y:1013,w:36,h:8};
   w._styleCrates=[{x:700,y:1028,w:18,h:18},{x:724,y:1032,w:18,h:18}];game.camera.x=842;game.camera.y=1060;game.camera.zoom=1.55;w.objective=null;w.heat=0;w.wanted.heat=0;return true;
  }
  if(name==='cover'){
   w.setTimeOfDay('day');game.camera.zoom=2.7;game.camera.x=1982.5;game.camera.y=783;
   // Widen the arterial slightly in this framing so the verification point at
   // the right curb remains on asphalt; the sidewalk still clears the shop.
   const arterial=w.city.roads.find(r=>r.x1===1920&&r.x2===1920);if(arterial)arterial.width=120;
   // Downtown Palmera curb parking on the north-south street at X=1920.
   // Remove overlapping procedural frontage and furniture so this shot reads as one block.
   w.city.buildings=w.city.buildings.filter(b=>b.x+b.w<1970||b.x>2115||b.y+b.d<710||b.y>880);
   w.city.streetProps=w.city.streetProps.filter(q=>q.x<1830||q.x>2040||q.y<710||q.y>880);
   w.city.parkedCars=w.city.parkedCars.filter(q=>q.x<1820||q.x>2055||q.y<700||q.y>890);
   w.city.palms=w.city.palms.filter(q=>q.x<1800||q.x>2150||q.y<680||q.y>900);
   // Round-108 south-facing storefront restored, shifted east beyond the
   // current arterial sidewalk (right extent 1962 + 40u; parcel starts 2002).
   w.city.buildings.push({x:2002,y:618,w:110,d:62,height:32,kind:'shop',archetype:'shop',name:'PALMERA MARKET',commercial:true,awning:true,color:'#c7b9a0',roof:'#d18b70',district:'downtown',treatment:1,roofProps:2,rotation:0});
   // Keep a clear car-length of kerb around the hero car; traffic remains farther along the block.
   for(const [x,y,type,color] of [[1887,690,'sedan','#47747a'],[1887,900,'pickup','#d8d2bd'],[2018,560,'sedan','#526d59'],[2010,890,'taxi','#e8bc3e']]){const q=new Vehicle(x,y,type,color,0);q._parked=true;w.city.parkedCars.push(q);}
   // The hero car sits at the shop curb, with its driver door opening toward the sidewalk.
   const v=new Vehicle(1955,720,'sport','#e94f45',0);v.speed=0;v.driver='player';v._doorOpen=true;v._coverDoorAngle=-62;v._groundMarker=false;v._handbrake=false;v._coverDoor=true;w.vehicles=[v];w.traffic.cars=[];w.gang.crews=[];w._shotSpeed=0;
   // The frozen door leaf swings screen-left at this heading. Keep both ground
   // anchors beyond its outer edge so the later vehicle draw cannot bury them.
   const opening={world:v.getDriverDoorWorldPosition()},danny={x:opening.world.x-27,y:opening.world.y},owner={x:danny.x-25,y:danny.y+8};
   // ITEM 5 — carjack causality: bring Danny slightly closer to the open door.
   // At zoom 4.6, +5.5 world units is approximately 25 screen pixels.
   danny.x+=5.5;
   w.player.x=danny.x;w.player.y=danny.y;w.player.angle=0;w.player._carjackHoldUp=true;w._shotHudMode='pistol';
   const p=w.pedestrians.people[0];p.x=owner.x;p.y=owner.y;p.run=false;p._recoil=false;p._alarmed=false;p._coverOwnerStagger=false;p.pose='idle';p.joints={head:{x:4.2,y:-14.8},shoulder:[{x:-5,y:-11},{x:4,y:-10}],hip:{x:1,y:-2.2},elbow:[{x:-10,y:-8.2},{x:10.5,y:-9.4}],hand:[{x:-14,y:-14},{x:15,y:-16}],knee:[{x:-3.2,y:1.1},{x:2.3,y:1.1}],foot:[{x:-4.2,y:3},{x:2.3,y:3}]};p.timer=0;p.vx=0;p.vy=0;p.angle=0;game.camera.x=(danny.x+owner.x)/2+24;game.camera.y=(danny.y+owner.y)/2-6;game.camera.zoom=4.6;
   for(const q of w.city.parkedCars)if(q.color==='#47747a'&&Math.hypot(q.x-owner.x,q.y-owner.y)<100)q.y-=150;w._carjackAnchors={danny,owner,centerDistanceWorld:Math.hypot(danny.x-owner.x,danny.y-owner.y),zoom:4.6};const edgeVehicle=new Vehicle(1815,danny.y+68,'pickup','#526d59',0);edgeVehicle._parked=true;w.vehicles.push(edgeVehicle);w.city.parkedCars.push(edgeVehicle);
   // ITEM 1 — grounded, restrained carjack witness reactions.
   const witnessPose={head:{x:0,y:-14.2},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:0,y:-7.2},{x:6,y:-11.5}],hand:[{x:-2,y:-6},{x:3,y:-14}],knee:[{x:-2.3,y:1.1},{x:2.3,y:1.1}],foot:[{x:-3,y:4.5},{x:3,y:4.5}]};
   const rightWitness={...p,x:2020,y:danny.y-29,vx:0,vy:0,run:false,angle:0,timer:0,pose:'idle',joints:witnessPose,color:'#4b8290',skin:'#dca77f',pants:'#394653',hairStyle:'long',_recoil:false};
   const leftWitness={...p,x:10000,y:danny.y+47,vx:0,vy:0,run:false,angle:0,timer:0,pose:'walk',joints:null,color:'#718d58',skin:'#efc8a2',pants:'#665342',hairStyle:'short',_recoil:false};w.pedestrians.people=[p,rightWitness,leftWitness];
   // Clear only the local palm crowns whose fronds cross this shot's owner silhouette.
   w.city.palms=w.city.palms.filter(t=>[danny,owner].every(f=>Math.hypot((t.x-3)-f.x,(t.y-32)-f.y)>=56));w.city.streetProps=w.city.streetProps.filter(q=>[danny,owner].every(f=>Math.hypot(q.x-f.x,q.y-f.y)>30));
   w.pedestrians.people=[p,rightWitness,leftWitness];p.color='#C2AA78';p.skin='#dbad83';p.pants='#51483a';p.hair='#302923';p.hairStyle='short';
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
   w.setTimeOfDay('dusk');for(const v of w.vehicles)if(v.type==='police'){v.type='sedan';v.color='#d8d2bd';}w.player.x=670;w.player.y=2065+(cover4&&!cover5?22:0); // cover4 moves Danny south by 22 world units so his muzzle line clears the crate stack.
   w.player.angle=-Math.PI/2;w.player._cover=true;w.player._marinaAim=true;w.player._marinaLeanOut=true;w.player._marinaMuzzleFlash=true;w.player._marinaCover2Joints={head:{x:0,y:-14.2},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-10,y:-8.2},{x:-11,y:-10.5}],hand:[{x:-6,y:-4.1},{x:-23,y:-13.5}],knee:[{x:-2.3,y:1.1},{x:2.3,y:1.1}],foot:[{x:-2.3,y:3},{x:2.3,y:3}]};w._shotHudMode='pistol';w._marinaShotMarker=true;w._homecomingShotMarkerSuppressed=true;w.objective={x:554,y:2029,label:'SURVIVE THE AMBUSH'};w.city.crates=[{x:623,y:2039,w:30,h:28},{x:610,y:2065,w:23,h:19},{x:610,y:2042,w:23,h:19},{x:610,y:2025,w:23,h:19}];w.city.streetProps=w.city.streetProps.filter(q=>!(q.x>590&&q.x<680&&q.y>1930&&q.y<2190&&q.kind==='planter'));w.city.parkedCars=w.city.parkedCars.filter(q=>!(q.x>535&&q.x<700&&q.y>2030&&q.y<2140));
   // Pier-side and road-side teams converge on the marked crate cover.
   const pier=w.gang.spawnGroup(530,1950,3,{faction:'Ambush',color:'#B65D59'});
   pier.members.forEach((p,i)=>{p.x=525+i*18;p.y=1995+i*18;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._marinaWeapon=true;p._marinaAimTarget={x:i===2?628:644,y:i===2?2047:2043};p._marinaAimAngle=Math.atan2(p._marinaAimTarget.y-p.y,p._marinaAimTarget.x-p.x);p._flash=i===0;p._advancing=true;p.cover={x:p.x,y:p.y};});
   const road=w.gang.spawnGroup(710,1930,3,{faction:'Ambush',color:'#B65D59'});
   road.members.forEach((p,i)=>{p.x=695+i*14;p.y=1973+i*14;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._marinaWeapon=true;p._marinaAimTarget={x:i===2?628:644,y:i===2?2047:2043};p._marinaAimAngle=Math.atan2(p._marinaAimTarget.y-p.y,p._marinaAimTarget.x-p.x);p._flash=i===0;p._coverRightFiring=i<2;p._advancing=false;p.cover={x:p.x,y:p.y};});road.members[0].y+=34; // round-113 staging; preserve member 0
   road.members[1].y+=26; // title clearance; capture can tune this world-space offset
   road.members[2].y+=8; // clear the subtitle band at the right edge
   if(cover2){
    const poses=[
     {head:{x:1,y:-14},shoulder:[{x:-4.2,y:-10.5},{x:4.5,y:-10.1}],hip:{x:.8,y:-2.2},elbow:[{x:-7,y:-9},{x:9,y:-8}],hand:[{x:-5,y:-7},{x:15,y:-7}],knee:[{x:-4,y:0},{x:3,y:1}],foot:[{x:-7,y:3},{x:7,y:4}]},
     {head:{x:-1,y:-12},shoulder:[{x:-4.5,y:-9},{x:4.5,y:-9}],hip:{x:0,y:-2},elbow:[{x:-8,y:-11},{x:7,y:-11}],hand:[{x:-9,y:-14},{x:8,y:-14}],knee:[{x:-5,y:2},{x:5,y:5}],foot:[{x:-8,y:4},{x:8,y:5}]},
     {head:{x:0,y:-13},shoulder:[{x:-4.5,y:-10},{x:4.5,y:-10}],hip:{x:0,y:-2},elbow:[{x:-8,y:-9},{x:8,y:-9}],hand:[{x:-10,y:-7},{x:10,y:-7}],knee:[{x:-5,y:0},{x:5,y:0}],foot:[{x:-10,y:4},{x:10,y:4}]},
     {head:{x:-1,y:-14},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-8,y:-8},{x:8,y:-9}],hand:[{x:-13,y:-6},{x:13,y:-8}],knee:[{x:-3,y:1},{x:4,y:1}],foot:[{x:-7,y:4},{x:8,y:4}]},
     {head:{x:0,y:-14},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-8,y:-8},{x:8,y:-8}],hand:[{x:-13,y:-6},{x:13,y:-6}],knee:[{x:-5,y:1},{x:5,y:1}],foot:[{x:-9,y:4},{x:9,y:4}]},
     {head:{x:1,y:-11},shoulder:[{x:-4.5,y:-9},{x:4.5,y:-9}],hip:{x:0,y:-2},elbow:[{x:-8,y:-7},{x:8,y:-7}],hand:[{x:-12,y:-5},{x:12,y:-5}],knee:[{x:-6,y:-1},{x:4,y:0}],foot:[{x:-10,y:4},{x:7,y:5}]}
    ];
    [...road.members,...pier.members].forEach((p,i)=>{p.joints=poses[i];p._cover2Weapon=true;p._cover2Firing=i<2||i===3;p._weaponAngle=Math.atan2(2050-p.y,650-p.x);p._cover2Pose=['run','cover','aim','walk','aim','cover'][i];});
    const ally={...pier.members[0],x:649,y:2085,state:'combat',color:'#398F91',joints:{head:{x:0,y:-13},shoulder:[{x:-4.5,y:-10},{x:4.5,y:-10}],hip:{x:0,y:-2},elbow:[{x:-7,y:-8},{x:7,y:-9}],hand:[{x:4,y:-9},{x:13,y:-8}],knee:[{x:-5,y:3},{x:5,y:5}],foot:[{x:-8,y:5},{x:6,y:5}]},_cover2Weapon:true,_cover2Firing:true,_weaponAngle:Math.atan2(1995-2085,735-649),_cover2Ally:true,_cover2Pose:'cover'};
    const support={faction:'Support',color:'#398F91',members:[ally]};w.gang.crews.push(support);
    w.player._marinaCover2Joints={head:{x:1,y:-14},shoulder:[{x:-4.8,y:-10.5},{x:3.8,y:-10.8}],hip:{x:0,y:-2.2},elbow:[{x:-10,y:-8.2},{x:-11,y:-9.7}],hand:[{x:-6,y:-4.1},{x:-23,y:-10.8}],knee:[{x:-4,y:1},{x:3,y:0}],foot:[{x:-7,y:4},{x:4,y:3}]};
    for(const p of [road.members[0],road.members[1],pier.members[0],ally]){const j=p.joints,a=p._weaponAngle||p._marinaAimAngle,h={x:j.hand[1].x* .8715,y:j.hand[1].y*.8715},m={x:p.x+h.x+Math.cos(a)*10,y:p.y+h.y+Math.sin(a)*10};w.combat.bullets.push({x:m.x+Math.cos(a)*25,y:m.y+Math.sin(a)*25,prevX:m.x,prevY:m.y,vx:0,vy:0,life:1,range:300,owner:'gang',staged:true,tapered:true,coverRightTracer:true});}
   }
   if(cover3){
    // Round 127: grounded road-side poses; support shoes sit at the person shadow anchor (4,6).
    const roadPoses=[
     {head:{x:-1,y:-14},shoulder:[{x:-5,y:-10.5},{x:4,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-7,y:-8},{x:7,y:-8}],hand:[{x:-5,y:-6},{x:11,y:-6}],knee:[{x:-4,y:-1},{x:5,y:2}],foot:[{x:-4,y:6},{x:4,y:6}]},
     {head:{x:0,y:-14},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-7,y:-8},{x:7,y:-8}],hand:[{x:-5,y:-6},{x:10,y:-6}],knee:[{x:-5,y:2},{x:5,y:2}],foot:[{x:-4,y:6},{x:4,y:6}]},
     {head:{x:5.5,y:-14},shoulder:[{x:-.5,y:-10.5},{x:7.5,y:-10.5}],hip:{x:2.5,y:-2.2},elbow:[{x:-4,y:-8},{x:10,y:-8}],hand:[{x:-2,y:-6},{x:13,y:-6}],knee:[{x:-1,y:-1},{x:6,y:2}],foot:[{x:-3,y:6},{x:4,y:6}]}
    ];
    road.members.forEach((p,i)=>{p.joints=roadPoses[i];p._cover3Weapon=true;});
   }
   if(cover5)road.members.forEach((p,i)=>{p._marinaAimTarget={x:670,y:2065+(i===0?12:0)};});
   for(const p of [...pier.members,...road.members])p._marinaAimAngle=Math.atan2(p._marinaAimTarget.y-p.y,p._marinaAimTarget.x-p.x);
   // Left group keeps one round; the right group fires two brighter, longer tapered rounds.
   if(!cover2){const members=[pier.members[0],road.members[0],road.members[1]];if(w._fxLegacy){for(const p of members){const a=p._marinaAimAngle,anchor=p._cover3Weapon?p.joints.hand[1]:{x:8,y:-4.5},hx=anchor.x*.8715,hy=anchor.y*.8715,muzzle={x:p.x+hx*Math.cos(a)-hy*Math.sin(a)+10*Math.cos(a),y:p.y+hx*Math.sin(a)+hy*Math.cos(a)+10*Math.sin(a)},length=p._coverRightFiring?29.5:25;if(cover4&&p===road.members[1]){const x=660,y=2094;w.combat.bullets.push({x,y,prevX:x-Math.cos(a)*length,prevY:y-Math.sin(a)*length,vx:0,vy:0,life:1,range:300,owner:'gang',staged:true,tapered:true,coverRightTracer:true});}else w.combat.bullets.push({x:muzzle.x+Math.cos(a)*length,y:muzzle.y+Math.sin(a)*length,prevX:muzzle.x,prevY:muzzle.y,vx:0,vy:0,life:1,range:300,owner:'gang',staged:true,tapered:true,coverRightTracer:!!p._coverRightFiring});}}else{for(const [i,p] of members.entries()){const a=p._marinaAimAngle,[x,y,length]=cover4&&i===2?[660,2094,29.5]:i===0?[644,2043,25]:i===1?[640,2034,29.5]:[655,2075,29.5];w.combat.bullets.push({x,y,prevX:x-Math.cos(a)*length,prevY:y-Math.sin(a)*length,vx:0,vy:0,life:1,range:300,owner:'gang',staged:true,tapered:true,coverRightTracer:i>0});}}}
   if(cover5){w.combat.bullets=w.combat.bullets.filter(b=>!(b.owner==='gang'&&b.staged&&b.coverRightTracer));for(const [p,end] of [[road.members[0],{x:670,y:2077}],[road.members[1],{x:674,y:2065}]]){const a=Math.atan2(end.y-p.y,end.x-p.x),length=29.5;w.combat.bullets.push({x:end.x,y:end.y,prevX:end.x-Math.cos(a)*length,prevY:end.y-Math.sin(a)*length,vx:0,vy:0,life:1,range:300,owner:'gang',staged:true,tapered:true,coverRightTracer:true});}const a=2.72,hand={x:23,y:-13.5},muzzle={x:w.player.x+hand.x-10*Math.cos(a),y:w.player.y+hand.y-10*Math.sin(a)},length=9;w.player._marinaCover5=true;w.player._marinaCover2Joints={...w.player._marinaCover2Joints,head:{...w.player._marinaCover2Joints.head,x:-w.player._marinaCover2Joints.head.x},shoulder:w.player._marinaCover2Joints.shoulder.map(p=>({x:-p.x,y:p.y})),elbow:w.player._marinaCover2Joints.elbow.map(p=>({x:-p.x,y:p.y})),hand:w.player._marinaCover2Joints.hand.map(p=>({x:-p.x,y:p.y}))};w.combat.bullets.push({x:muzzle.x- length*Math.cos(a),y:muzzle.y-length*Math.sin(a),prevX:muzzle.x,prevY:muzzle.y,vx:0,vy:0,life:1,range:300,owner:'player',staged:true,tapered:true});}else if(cover4){const a=.42,hand={x:-23,y:-13.5},muzzle={x:w.player.x+hand.x*Math.cos(a)-hand.y*Math.sin(a)-10*Math.cos(a),y:w.player.y+hand.x*Math.sin(a)+hand.y*Math.cos(a)-10*Math.sin(a)},length=9;w.combat.bullets.push({x:muzzle.x-length*Math.cos(a),y:muzzle.y-length*Math.sin(a),prevX:muzzle.x,prevY:muzzle.y,vx:0,vy:0,life:1,range:300,owner:'player',staged:true,tapered:true});}else w.combat.bullets.push(w._fxLegacy?{x:635,y:2055,prevX:670,prevY:2055,sx:670,sy:2055,vx:0,vy:0,life:1,range:300,owner:'player',staged:true}:{x:633,y:2045,prevX:642,prevY:2049,sx:670,sy:2055,vx:0,vy:0,life:1,range:300,owner:'player',staged:true,tapered:true});
   if(w._fxLegacy)w.effects.impacts.push({x:628,y:2047},{x:644,y:2043},{x:628,y:2047},{x:644,y:2043});else w.effects.impacts.push({x:644,y:2043});
   if(w._fxLegacy){w.effects.lightPool(650,2059,'rgba(255,166,91,.055)',44);w.effects.lightPool(628,2047,'rgba(255,151,76,.035)',38);}else w.effects.lightPool(644,2043,'rgba(255,151,76,.025)',9);
   w.dialogue.active=false;w.heat=2;w.wanted.heat=2;w.activities.flags=[];w.activities.cards=[];w.pinCallout('BETRAYAL','SURVIVE THE AMBUSH',{x:640,y:176});game.camera.x=648;game.camera.y=2045;game.camera.zoom=2.7;dress([[500,1850,'sedan','#47747a',Math.PI/2],[745,2165,'pickup','#526d59',Math.PI/2]],[[465,1945],[795,2110],[520,2145],[340,2245],[385,2275],[430,2250]]);const marinaVan=new Vehicle(650,1870,'van','#477b82',Math.PI/2);marinaVan._parked=true;w.city.parkedCars.push(marinaVan);
   const crouchJoints={head:{x:0,y:-12},shoulder:[{x:-4.5,y:-9},{x:4.5,y:-9}],hip:{x:0,y:-2},elbow:[{x:-7,y:-13},{x:7,y:-13}],hand:[{x:-8,y:-17},{x:8,y:-17}],knee:[{x:-5,y:4},{x:5,y:4}],foot:[{x:-7,y:7},{x:7,y:7}]};
   w._marinaFreight={barrels:[{x:686,y:2140},{x:694,y:2142},{x:690,y:2149},{x:698,y:2151}],pallet:{x:682,y:2170},van:{x:691,y:2117,angle:.20}};
   const apronVan=new Vehicle(691,2117,'van','#477b82',.20);apronVan._parked=true;w.city.parkedCars.push(apronVan);
   {const [px,py]=variant==='B1'?[758,2108]:[745,2097],angle=-1.12,police=new Vehicle(px,py,'police','#e7e4d8',angle);police.driver='police';police._headlights=true;w.vehicles.push(police);w.police.units.push(police);const lx=Math.cos(angle)*7,ly=Math.sin(angle)*7;w.effects.lightPool(px+lx,py+ly,'rgba(42,112,255,.14)',48);w.effects.lightPool(px-lx,py-ly,'rgba(255,48,58,.14)',48);}
   w.city.crates.push({x:681,y:2140,w:21,h:17},{x:681,y:2123,w:21,h:17},{x:690,y:2180,w:19,h:16},{x:690,y:2164,w:19,h:16},{x:699,y:2180,w:19,h:16});
   // ITEM 3 — lift the lower right cover crate to separate it from the flash.
   // At marina zoom 2.7, 7 world units is approximately 19 screen pixels.
   w.city.crates[w.city.crates.length-1].y-=7;
   const nearby=w.pedestrians.people.filter(p=>Math.hypot(p.x-795,p.y-2110)<28).sort((a,b)=>Math.hypot(a.x-795,a.y-2110)-Math.hypot(b.x-795,b.y-2110));
   const cower=nearby[0];if(cower){cower.pose='cover';cower.joints=crouchJoints;cower.run=false;cower.vx=0;cower.vy=0;cower._marinaReaction=true;cower.angle=0;}
   const fleer=nearby[1];if(fleer){fleer.pose='run';fleer.joints=null;fleer.run=true;fleer.vx=34;fleer.vy=24;fleer.angle=Math.PI/4;fleer._marinaReaction=true;}
   // Sparse warm rounds visibly converge on Danny's cover from both ambush angles.
  }
  else if(name==='homecoming'){
   w.setTimeOfDay('day');w._homecomingMorning=true;
   // Clear the procedural crowd so the reunion has quiet space around it.
   const pedestrianTemplate=w.pedestrians.people[0];w.pedestrians.people=[];w.vehicles=[];w.traffic.cars=[];w.police.units=[];w.gang.crews=[];
   w.effects.skids=[];w.effects.particles=[];w.effects.impacts=[];w.effects.lightPools=[];w.combat.bullets=[];w.activities.flags=[];w.activities.cards=[];
   // Park at the beach boulevard kerb; the reunion stands west of the car on the promenade.
   const car=new Vehicle(598,1000,'sedan','#e8a078',0);car.speed=0;car.driver='player';car._doorOpen=true;
   const doorAnchor=car.getDriverDoorWorldPosition();
   const miaAt={x:564,y:doorAnchor.y+28},dannyAt={x:544,y:doorAnchor.y+28};
   // ITEM 4 — lower Danny's contacting hand onto Mia's shoulder and lean Mia
   // slightly toward him; their world positions and 25.2px silhouette gap stay fixed.
   const danny={...pedestrianTemplate,x:dannyAt.x,y:dannyAt.y,vx:0,vy:0,angle:.28,timer:0,run:false,hero:true,color:'#F3E8D2',inner:'#D8C7A7',skin:'#e8bd91',pants:'#30343B',hair:'#302923',_shotScale:1,_homecomingPose:true,pose:'idle',joints:{head:{x:1.5,y:-14.2},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-5.6,y:-7.5},{x:11,y:-11.5}],hand:[{x:-6,y:-4.1},{x:17,y:-15}],knee:[{x:-2.3,y:1.1},{x:2.3,y:1.1}],foot:[{x:-2.3,y:3},{x:4.2,y:3}]}};
   const mia={...pedestrianTemplate,x:miaAt.x,y:miaAt.y,vx:0,vy:0,angle:.34,timer:0,run:false,color:'#F06F67',pants:'#51443E',hairStyle:'long',_shotScale:1,_homecomingPose:true,pose:'idle',joints:{head:{x:-1.5,y:-14.2},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-6.2,y:-6.8},{x:6.2,y:-5.2}],hand:[{x:-7.1,y:-2.8},{x:10,y:-1.5}],knee:[{x:-3.2,y:1.1},{x:3.2,y:1.1}],foot:[{x:-3.8,y:3},{x:3.8,y:3}]}};
   w.player._homecomingHidden=true;w.pedestrians.people=[danny,mia];w.vehicles.push(car);
   // Two quiet passersby add life while leaving a clear pocket around the reunion.
   dress([],[[680,1004],[570,1090]]);const npc1=w.pedestrians.people[2],npc2=w.pedestrians.people[3];Object.assign(npc1,{color:'#4b8290',skin:'#dca77f',pants:'#394653',pose:'walk',angle:0,vx:14,vy:0});
   // ITEM 2 — keep the sea-facing green passerby upright, facing west toward
   // the water, with relaxed arms and a grounded idle pose.
   Object.assign(npc2,{color:'#718d58',skin:'#efc8a2',pants:'#665342',pose:'idle',angle:0,run:false,vx:0,vy:0,joints:{head:{x:-1.5,y:-14.2},shoulder:[{x:-5.2,y:-10.5},{x:3.8,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-5.6,y:-7.5},{x:5.6,y:-7.5}],hand:[{x:-6,y:-4.1},{x:6,y:-4.1}],knee:[{x:-3.2,y:1.1},{x:2.3,y:1.1}],foot:[{x:-4.2,y:3},{x:2.3,y:3}]}});
   w.city.streetProps=w.city.streetProps.filter(q=>q.x<400||q.x>720||q.y<900||q.y>1160);w.city.streetProps.push({x:536,y:1090,kind:'bench',angle:0},{x:579,y:1068,kind:'lamp'});
   w.objective={x:mia.x,y:mia.y,label:'TALK TO MIA'};w._shotObjectiveBanner='TALK TO MIA';w._homecomingShotMarkerSuppressed=true;w._homecomingScene=true;w._homecomingAnchors={car:{x:car.x,y:car.y,heading:car.angle},door:doorAnchor,danny:dannyAt,mia:miaAt,silhouetteGapWorld:Math.max(0,Math.hypot(dannyAt.x-miaAt.x,dannyAt.y-miaAt.y)-14),zoom:4.7};
   w.heat=0;w.wanted.heat=0;w.pinCallout('HOMECOMING','CORAL BEACH',{y:176});
   w._shotHudMode='unarmed';game.camera.x=(dannyAt.x+miaAt.x)/2;game.camera.y=dannyAt.y;game.camera.zoom=4.7;
  }
  else if(name==='getaway'){
   w.setTimeOfDay('night');w._shotHudMode='driving';w._getawayCargoShift=true;w.vehicles=[];w.traffic.cars=[];w.pedestrians.people=[];
   const heading=.61,forward={x:Math.sin(heading),y:-Math.cos(heading)},advance=18,x=4095+forward.x*advance,y=2505+forward.y*advance,v=new Vehicle(x,y,'sport','#f27b68',heading);v.speed=820;v.driver='player';v._handbrake=true;v._headlights=true;v._groundMarker=true;w.vehicles.push(v);w.driving=v;w.player.x=x;w.player.y=y;
   // Keep the ramp, hero car, and police funnel on one clean apron sightline.
   const ramp={x:4119,y:2470};w.objective={x:ramp.x,y:ramp.y,label:'REACH THE CARGO PLANE'};w._getawayShotMarkerSuppressed=true;w._shotObjectiveBanner='REACH THE CARGO PLANE';w._shotSpeed=122;w.heat=w.wanted.heat=5;
   w.missions.index=5;w.missions.state='active';
   const lateral={x:Math.cos(heading),y:Math.sin(heading)};
   const cops=[[4030+Math.sin(heading-.13)*18,2535-Math.cos(heading-.13)*18],[3975,2483],[3930,2567]];
   w.police.units=[];for(let i=0;i<cops.length;i++){const [cx,cy]=cops[i],a=heading+(i-1)*.13,q=new Vehicle(cx,cy,'police','#e7e4d8',a);q.driver='police';q.speed=95;q._headlights=true;q._braking=true;q._brakeGlow=true;w.vehicles.push(q);w.police.units.push(q);const lx=cx+lateral.x*7,ly=cy+lateral.y*7;w.effects.lightPool(lx,ly,'rgba(42,112,255,.14)',48);w.effects.lightPool(cx-lateral.x*7,cy-lateral.y*7,'rgba(255,48,58,.14)',48);}
   w.effects.lightPool(cops[0][0],cops[0][1],'rgba(255,48,58,.20)',55);w.effects.lightPool(4045.3,2526.1,'rgba(42,112,255,.20)',55);w.effects.lightPool(3975,2483,'rgba(255,48,58,.20)',55);w.effects.lightPool(3968,2476,'rgba(42,112,255,.20)',55);w.effects.lightPool(3930,2567,'rgba(255,48,58,.20)',55);w.effects.lightPool(3937,2574,'rgba(42,112,255,.20)',55);
   // Paired curved tyre trails and smoke trail the red car through the turn.
   for(let i=0;i<15;i++){const back=30+i*7,side=(i%2?1:-1)*11;w.effects.skid(x-forward.x*back+lateral.x*side,y-forward.y*back+lateral.y*side,heading,30);}
   for(let i=0;i<9;i++)w.effects.particles.push({x:x-forward.x*(25+i*8)+lateral.x*(i%2?10:-10),y:y-forward.y*(25+i*8)+lateral.y*(i%2?10:-10),vx:-forward.x*10,vy:-forward.y*10,life:1.2,size:10+(i%3)*3,color:'rgba(246,244,235,.68)',_smoke:true,angle:heading});
   w.pinCallout('ESCAPE!','SUNSET GETAWAY',{y:176});game.camera.x=4180;game.camera.y=2485;game.camera.zoom=1.5;dress([],[[4020,2260],[4060,2272]]);w.pedestrians.people.forEach((p,i)=>{p.color=i?'#e1b957':'#4b8290';p.skin=i?'#bd8663':'#e2b28c';p.pants=i?'#3d4346':'#51443f';});
  }
  else if(name==='street'){w.player.x=635;w.player.y=650;w.objective={x:720,y:1250,label:'MEET MIA AT THE GARAGE'};game.camera.x=635;game.camera.y=650;}
  else if(name==='downtown'){const v=new Vehicle(1920,780,'sedan','#42657b',Math.PI/2);v.speed=65;v.driver='player';w.vehicles.push(v);w.driving=v;for(const [x,y,type,color,a] of [[1840,750,'pickup','#b98d5b',0],[2000,820,'van','#477b82',Math.PI]]){const q=new Vehicle(x,y,type,color,a);q._parked=true;w.city.parkedCars.push(q);}w.heat=1;w.wanted.heat=1;w.objective={x:2200,y:780,label:'HEAD DOWNTOWN'};game.camera.x=v.x;game.camera.y=v.y;}
  else {game.screen='title';game.camera.x=535;game.camera.y=950;return false;}
  return true;
 }
};
