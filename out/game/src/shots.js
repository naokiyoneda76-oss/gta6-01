import {SeededRandom} from './random.js';
import {World} from './world.js';
import {Vehicle,VEHICLE_TYPES} from './vehicles.js';

export const ShotDirector=class ShotDirector{
 stageShot(name,game){
  game.camera._homecomingWestClamp=0;const seed=Number(new URLSearchParams(location.search).get('seed')||1);game.rng=new SeededRandom(seed);game.world=new World(game.rng);const w=game.world;game.screen='play';const dress=(cars,people)=>{for(const [x,y,type,color,a] of cars){const q=new Vehicle(x,y,type,color,a);q.driver='traffic';q.speed=45;w.vehicles.push(q);w.traffic.cars.push(q);}for(const [x,y] of people){const p=w.pedestrians.people[w.pedestrians.people.length-1];const q={...p,x,y,vx:0,vy:0,angle:0,timer:0,run:false};w.pedestrians.people.push(q);}};
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
   // Downtown Palmera curb parking on the north-south street at X=1920.
   // Remove overlapping procedural frontage and furniture so this shot reads as one block.
   w.city.buildings=w.city.buildings.filter(b=>b.x+b.w<1970||b.x>2115||b.y+b.d<710||b.y>880);
   w.city.streetProps=w.city.streetProps.filter(q=>q.x<1830||q.x>2040||q.y<710||q.y>880);
   w.city.parkedCars=w.city.parkedCars.filter(q=>q.x<1820||q.x>2055||q.y<700||q.y>890);
   w.city.palms=w.city.palms.filter(q=>q.x<1800||q.x>2150||q.y<680||q.y>900);
   w.city.buildings.push({x:1925,y:618,w:110,d:62,height:32,kind:'shop',archetype:'shop',name:'PALMERA MARKET',commercial:true,awning:true,color:'#c7b9a0',roof:'#d18b70',district:'downtown',treatment:1,roofProps:2,rotation:0});
   // Keep a clear car-length of kerb around the hero car; traffic remains farther along the block.
   for(const [x,y,type,color] of [[1887,690,'sedan','#47747a'],[1887,900,'pickup','#d8d2bd'],[2010,700,'sedan','#526d59'],[2010,890,'taxi','#e8bc3e']]){const q=new Vehicle(x,y,type,color,0);q._parked=true;w.city.parkedCars.push(q);}
   // The hero car sits at the shop curb, with its driver door opening toward the sidewalk.
   const v=new Vehicle(1955,720,'sport','#e94f45',0);v.speed=0;v.driver='player';v._doorOpen=true;v._coverDoorAngle=-62;v._groundMarker=false;v._handbrake=false;v._coverDoor=true;w.vehicles=[v];w.traffic.cars=[];w.gang.crews=[];w._shotSpeed=0;
   // The frozen door leaf swings screen-left at this heading. Keep both ground
   // anchors beyond its outer edge so the later vehicle draw cannot bury them.
   const opening={world:v.getDriverDoorWorldPosition()},danny={x:opening.world.x-27,y:opening.world.y},owner={x:danny.x-25,y:danny.y+8};
   w.player.x=danny.x;w.player.y=danny.y;w.player.angle=0;w.player._carjackHoldUp=true;w._shotHudMode='pistol';
   const p=w.pedestrians.people[0];p.x=owner.x;p.y=owner.y;p.run=false;p._recoil=false;p._alarmed=false;p._coverOwnerStagger=false;p.pose='idle';p.joints={head:{x:3,y:-14.2},shoulder:[{x:-5,y:-11},{x:4,y:-10}],hip:{x:1,y:-2.2},elbow:[{x:-10,y:-8.2},{x:10,y:-8.2}],hand:[{x:-14,y:-14},{x:14,y:-14}],knee:[{x:-2.3,y:1.1},{x:2.3,y:1.1}],foot:[{x:-2.3,y:3},{x:2.3,y:3}]};p.timer=0;p.vx=0;p.vy=0;p.angle=0;game.camera.x=(danny.x+owner.x)/2+24;game.camera.y=(danny.y+owner.y)/2-6;game.camera.zoom=4.6;
   for(const q of w.city.parkedCars)if(q.color==='#47747a'&&Math.hypot(q.x-owner.x,q.y-owner.y)<100)q.y-=150;w._carjackAnchors={danny,owner,centerDistanceWorld:Math.hypot(danny.x-owner.x,danny.y-owner.y),zoom:4.6};
   // Clear only the local palm crowns whose fronds cross this shot's owner silhouette.
   w.city.palms=w.city.palms.filter(t=>[danny,owner].every(f=>Math.hypot((t.x-3)-f.x,(t.y-32)-f.y)>=56));w.city.streetProps=w.city.streetProps.filter(q=>[danny,owner].every(f=>Math.hypot(q.x-f.x,q.y-f.y)>30));
   w.pedestrians.people=[p];p.color='#C2AA78';p.skin='#dbad83';p.pants='#51483a';p.hair='#302923';p.hairStyle='short';
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
   w.setTimeOfDay('dusk');for(const v of w.vehicles)if(v.type==='police'){v.type='sedan';v.color='#d8d2bd';}w.player.x=610;w.player.y=2110;w.player.angle=-Math.PI/2;w.player._cover=true;w.player._marinaAim=true;w.player._marinaLeanOut=true;w.player._marinaMuzzleFlash=true;w._shotHudMode='pistol';w._marinaShotMarker=true;w._homecomingShotMarkerSuppressed=true;w.objective={x:554,y:2074,label:'SURVIVE THE AMBUSH'};w.city.crates=[{x:563,y:2084,w:30,h:28},{x:550,y:2110,w:23,h:19},{x:550,y:2087,w:23,h:19},{x:550,y:2070,w:23,h:19}];w.city.streetProps=w.city.streetProps.filter(q=>!(q.x>590&&q.x<680&&q.y>1930&&q.y<2190&&q.kind==='planter'));w.city.parkedCars=w.city.parkedCars.filter(q=>!(q.x>535&&q.x<700&&q.y>2030&&q.y<2140));
   // Pier-side and road-side teams converge on the marked crate cover.
   const pier=w.gang.spawnGroup(530,2050,3,{faction:'Ambush',color:'#B65D59'});
   pier.members.forEach((p,i)=>{p.x=510+i*18;p.y=2040+i*18;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._flash=true;p._advancing=true;p.cover={x:p.x,y:p.y};});
   const road=w.gang.spawnGroup(710,2030,3,{faction:'Ambush',color:'#B65D59'});
   road.members.forEach((p,i)=>{p.x=695+i*14;p.y=2018+i*14;p.state='combat';p.angle=Math.atan2(w.player.y-p.y,w.player.x-p.x);p._flash=true;p._advancing=false;p.cover={x:p.x,y:p.y};});
   // Incoming rounds strike the cover; Danny returns one short bright tracer west.
   w.combat.bullets.push({x:590,y:2104,prevX:640,prevY:2104,vx:0,vy:0,life:1,range:300,owner:'gang'});
   w.combat.bullets.push({x:575,y:2100,prevX:610,prevY:2100,sx:610,sy:2100,vx:0,vy:0,life:1,range:300,owner:'player',staged:true});
   w.effects.impacts.push({x:606,y:2103},{x:608,y:2103},{x:600,y:2088},{x:568,y:2092},{x:584,y:2088});
   w.dialogue.active=false;w.heat=2;w.wanted.heat=2;w.activities.flags=[];w.activities.cards=[];w.pinCallout('BETRAYAL','SURVIVE THE AMBUSH',{x:640,y:176});game.camera.x=618;game.camera.y=2070;game.camera.zoom=2.7;dress([[500,1895,'sedan','#47747a',Math.PI/2],[790,2180,'pickup','#526d59',Math.PI/2]],[[465,1990],[795,2110],[520,2190],[340,2290],[385,2320],[430,2295]]);const marinaVan=new Vehicle(650,1915,'van','#477b82',Math.PI/2);marinaVan._parked=true;w.city.parkedCars.push(marinaVan);
   const crouchJoints={head:{x:0,y:-12},shoulder:[{x:-4.5,y:-9},{x:4.5,y:-9}],hip:{x:0,y:-2},elbow:[{x:-7,y:-13},{x:7,y:-13}],hand:[{x:-8,y:-17},{x:8,y:-17}],knee:[{x:-5,y:4},{x:5,y:4}],foot:[{x:-7,y:7},{x:7,y:7}]};
   const nearby=w.pedestrians.people.filter(p=>Math.hypot(p.x-795,p.y-2110)<28).sort((a,b)=>Math.hypot(a.x-795,a.y-2110)-Math.hypot(b.x-795,b.y-2110));
   const cower=nearby[0];if(cower){cower.pose='cover';cower.joints=crouchJoints;cower.run=false;cower.vx=0;cower.vy=0;cower._marinaReaction=true;cower.angle=0;}
   const fleer=nearby[1];if(fleer){fleer.pose='run';fleer.joints=null;fleer.run=true;fleer.vx=34;fleer.vy=24;fleer.angle=Math.PI/4;fleer._marinaReaction=true;}
   // Sparse warm rounds visibly converge on Danny's cover from both ambush angles.
   for(const [sx,sy,ex,ey] of [[536,2061,568,2092],[548,2064,568,2092],[616,2059,584,2088],[619,2066,584,2088]])w.combat.bullets.push({x:ex,y:ey,prevX:sx,prevY:sy,vx:0,vy:0,life:1,range:400,owner:'gang',staged:true});
  }
  else if(name==='homecoming'){
   w.setTimeOfDay('day');w._homecomingMorning=true;
   // Clear the procedural crowd so the reunion has quiet space around it.
   const pedestrianTemplate=w.pedestrians.people[0];w.pedestrians.people=[];w.vehicles=[];w.traffic.cars=[];w.police.units=[];w.gang.crews=[];
   w.effects.skids=[];w.effects.particles=[];w.effects.impacts=[];w.effects.lightPools=[];w.combat.bullets=[];w.activities.flags=[];w.activities.cards=[];
   // Park at the beach boulevard kerb; the reunion stands west of the car on the promenade.
   const car=new Vehicle(598,1000,'sedan','#e8a078',0);car.speed=0;car.driver='player';car._doorOpen=true;
   const doorAnchor=car.getDriverDoorWorldPosition();
   const miaAt={x:566,y:doorAnchor.y+28},dannyAt={x:544,y:doorAnchor.y+28};
   const danny={...pedestrianTemplate,x:dannyAt.x,y:dannyAt.y,vx:0,vy:0,angle:.28,timer:0,run:false,hero:true,color:'#F3E8D2',inner:'#D8C7A7',skin:'#e8bd91',pants:'#30343B',hair:'#302923',_shotScale:1,_homecomingPose:true,pose:'idle',joints:{head:{x:1.5,y:-14.2},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-5.6,y:-7.5},{x:9,y:-12}],hand:[{x:-6,y:-4.1},{x:14,y:-17}],knee:[{x:-2.3,y:1.1},{x:2.3,y:1.1}],foot:[{x:-2.3,y:3},{x:2.3,y:3}]}};
   const mia={...pedestrianTemplate,x:miaAt.x,y:miaAt.y,vx:0,vy:0,angle:-.28,timer:0,run:false,color:'#F06F67',pants:'#51443E',hairStyle:'long',_shotScale:1,_homecomingPose:true,pose:'idle',joints:{head:{x:-2.5,y:-14.2},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-6.2,y:-6.8},{x:6.2,y:-6.8}],hand:[{x:-7.1,y:-2.8},{x:7.1,y:-2.8}],knee:[{x:-3.2,y:1.1},{x:3.2,y:1.1}],foot:[{x:-3.8,y:3},{x:3.8,y:3}]}};
   w.player._homecomingHidden=true;w.pedestrians.people=[danny,mia];w.vehicles.push(car);
   // Keep the ambient crowd on the beach pier decks and boulevard sidewalk.
   dress([],[[350,2027],[390,2028],[400,2189],[535,1900],[535,2260],[460,2268],[490,2325],[420,2380]]);w.pedestrians.people.slice(2).forEach((p,i)=>{p.color=['#4d8290','#d28c59','#718d58','#b86b69','#d7b75f','#568578','#d18c62','#617b9b'][i];p.skin=['#dca77f','#ae7655','#efc8a2','#c88e6d','#e8b88d','#c78f69','#e3b58b','#af795a'][i];p.pants=['#394653','#3b4651','#665342','#34414e','#51443e','#324a48','#55423b','#394754'][i];if(i===4){p.vx=24;p.vy=0;}});
   const promenade={...pedestrianTemplate,x:740,y:2170,vx:18,vy:0,angle:Math.PI/2,timer:0,run:false,pose:'walk',phase:.6,color:'#73808a',skin:'#c78f69',pants:'#394653'};w.pedestrians.people.push(promenade);
   w.objective={x:mia.x,y:mia.y,label:'TALK TO MIA'};w._shotObjectiveBanner='TALK TO MIA';w._homecomingShotMarkerSuppressed=true;w._homecomingScene=true;w._homecomingAnchors={car:{x:car.x,y:car.y,heading:car.angle},door:doorAnchor,danny:dannyAt,mia:miaAt,silhouetteGapWorld:Math.max(0,Math.hypot(dannyAt.x-miaAt.x,dannyAt.y-miaAt.y)-14),zoom:4.2};
   w.heat=0;w.wanted.heat=0;w.pinCallout('HOMECOMING','CORAL BEACH',{y:176});
   w._shotHudMode='unarmed';game.camera.x=555;game.camera.y=1032;game.camera.zoom=4.2;
  }
  else if(name==='getaway'){
   w.setTimeOfDay('night');w._shotHudMode='driving';w._getawayCargoShift=true;w.vehicles=[];w.traffic.cars=[];w.pedestrians.people=[];
   const x=4095,y=2505,heading=.61,v=new Vehicle(x,y,'sport','#f27b68',heading);v.speed=820;v.driver='player';v._handbrake=true;v._headlights=true;v._groundMarker=true;w.vehicles.push(v);w.driving=v;w.player.x=x;w.player.y=y;
   // Keep the ramp, hero car, and police funnel on one clean apron sightline.
   const ramp={x:4119,y:2470};w.objective={x:ramp.x,y:ramp.y,label:'REACH THE CARGO PLANE'};w._getawayShotMarkerSuppressed=true;w._shotObjectiveBanner='REACH THE CARGO PLANE';w._shotSpeed=122;w.heat=w.wanted.heat=5;
   w.missions.index=5;w.missions.state='active';
   const forward={x:Math.sin(heading),y:-Math.cos(heading)},lateral={x:Math.cos(heading),y:Math.sin(heading)};
   const cops=[[4030,2535],[3975,2483],[3930,2567]];
   w.police.units=[];for(let i=0;i<cops.length;i++){const [cx,cy]=cops[i],a=heading+(i-1)*.13,q=new Vehicle(cx,cy,'police','#e7e4d8',a);q.driver='police';q.speed=95;q._headlights=true;q._braking=true;q._brakeGlow=true;w.vehicles.push(q);w.police.units.push(q);const lx=cx+lateral.x*7,ly=cy+lateral.y*7;w.effects.lightPool(lx,ly,'rgba(42,112,255,.58)',70);w.effects.lightPool(cx-lateral.x*7,cy-lateral.y*7,'rgba(255,48,58,.56)',68);}
   w.effects.lightPool(4148,2470,'rgba(255,174,88,.62)',52);w.effects.lightPool(4118,2485,'rgba(255,163,74,.34)',104);
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
