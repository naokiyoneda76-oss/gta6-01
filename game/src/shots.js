import {SeededRandom} from './random.js';
import {World} from './world.js';
import {Vehicle} from './vehicles.js';

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
   w.setTimeOfDay('day');game.camera.zoom=3.8;game.camera.x=642;game.camera.y=1008;
   // FIRST WHEELS catches the handoff itself: a parked car and two distinct, staged poses.
   const v=new Vehicle(650,1020,'sport','#e94f45',Math.PI/2);v.speed=0;v.driver='player';v._doorOpen=true;v._coverDoorAngle=62;v._groundMarker=false;v._handbrake=false;v._coverDoor=true;w.vehicles=[v];w.traffic.cars=[];w.gang.crews=[];w._shotSpeed=0;
   w.player.x=634;w.player.y=1005;w.player.angle=0;w.player._coverEntering=true;w._shotHudMode='pistol';
   const p=w.pedestrians.people[0];p.x=614;p.y=982;p.run=false;p._recoil=false;p._alarmed=false;p._coverOwnerStagger=true;p.pose='car-entry';p.joints={head:{x:-3.5,y:-15.4},shoulder:[{x:-6.3,y:-10.8},{x:2.8,y:-10.1}],hip:{x:2.4,y:-1.8},elbow:[{x:-9.4,y:-16.2},{x:8.4,y:-10.8}],hand:[{x:-5.1,y:-20.2},{x:13.7,y:-11.1}],knee:[{x:-5.4,y:1.1},{x:5.1,y:-.2}],foot:[{x:-8.3,y:-1.2},{x:9.6,y:2.0}]};p.timer=0;p.vx=0;p.vy=0;p.angle=0;
   w.city.looseItems=[];
   // The owner recoils away from the car; this shot has exactly two people.
   w.pedestrians.people=[p];
   p.color='#418b83';p.skin='#dbad83';p.pants='#394653';p.hair='#302923';p.hairStyle='short';
   // The cover frame is reserved for the staged car and its two figures.
   // Camera.apply uses CONFIG's logical view divided by this zoom.
   const halfW=1280/(2*game.camera.zoom),halfH=800/(2*game.camera.zoom),left=game.camera.x-halfW,right=game.camera.x+halfW,top=game.camera.y-halfH,bottom=game.camera.y+halfH;
   w.city.parkedCars=w.city.parkedCars.filter(q=>q.x<left-16||q.x>right+16||q.y<top-16||q.y>bottom+16);
   w.city.streetProps=w.city.streetProps.filter(q=>q.x<left-18||q.x>right+18||q.y<top-24||q.y>bottom+12);
   w.city.palms=w.city.palms.filter(q=>q.x<left-18||q.x>right+18||q.y<top-24||q.y>bottom+12);
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
   w.setTimeOfDay('dusk');for(const v of w.vehicles)if(v.type==='police'){v.type='sedan';v.color='#d8d2bd';}w.player.x=578;w.player.y=2040;w.player._cover=true;w.player._marinaAim=true;w._shotHudMode='pistol';w._marinaShotMarker=true;w._homecomingShotMarkerSuppressed=true;w.objective={x:554,y:2074,label:'SURVIVE THE AMBUSH'};const coverCrate=w.city.crates.find(b=>b.x===565&&b.y===2055);if(coverCrate){coverCrate.x=545;coverCrate.w=30;coverCrate.h=28;}
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
   w.dialogue.play([{who:'ROSA',text:'Danny, get behind the crates! It’s an ambush — they’re coming in from the pier!'}]);w.dialogue.revealAll();w.heat=2;w.wanted.heat=2;w.activities.flags=[];w.activities.cards=[];w.pinCallout('BETRAYAL','SURVIVE THE AMBUSH',{x:640,y:176});game.camera.x=640;game.camera.y=2010;game.camera.zoom=1.6;dress([[465,1950,'sedan','#47747a',Math.PI/2],[790,2180,'pickup','#526d59',Math.PI/2]],[[465,1990],[795,2110],[520,2190],[340,2290],[385,2320],[430,2295]]);
  }
  else if(name==='homecoming'){
   w.setTimeOfDay('dusk');
   // Clear the procedural crowd so the reunion has quiet space around it.
   const pedestrianTemplate=w.pedestrians.people[0];w.pedestrians.people=[];w.vehicles=[];w.traffic.cars=[];w.police.units=[];w.gang.crews=[];
   w.effects.skids=[];w.effects.particles=[];w.effects.impacts=[];w.effects.lightPools=[];w.combat.bullets=[];w.activities.flags=[];w.activities.cards=[];
   // Stage the reunion on the promenade where the clamped camera can frame it.
   const danny={...pedestrianTemplate,x:652,y:2104,vx:0,vy:0,angle:Math.PI/2,timer:0,run:false,color:'#418b83',pants:'#394653',_shotScale:1,_homecomingPose:true,pose:'idle',joints:{head:{x:0,y:-14.2},shoulder:[{x:-4.5,y:-10.5},{x:4.5,y:-10.5}],hip:{x:0,y:-2.2},elbow:[{x:-5.6,y:-7.5},{x:7,y:-13.5}],hand:[{x:-6,y:-4.1},{x:5,y:-17}],knee:[{x:-2.3,y:1.1},{x:2.3,y:1.1}],foot:[{x:-2.3,y:3},{x:2.3,y:3}]}};
   const mia={...pedestrianTemplate,x:672,y:2116,vx:0,vy:0,angle:-Math.PI/2,timer:0,run:false,color:'#f2a85e',hairStyle:'long',_shotScale:1,_homecomingPose:true,pose:'walk',phase:1.4};
   w.player._homecomingHidden=true;w.pedestrians.people=[danny,mia];
   // Mia's sedan is parked on the inland shoulder beside her.
   const car=new Vehicle(692,2122,'sedan','#e8a078',.22);car.speed=0;car.driver=null;w.vehicles.push(car);
   // Keep the ambient crowd on the beach pier decks and boulevard sidewalk.
   dress([],[[350,2027],[390,2028],[400,2189],[535,1900],[535,2260],[460,2268],[490,2325],[420,2380]]);w.pedestrians.people.slice(2).forEach((p,i)=>{p.color=['#4d8290','#d28c59','#718d58','#b86b69','#d7b75f','#568578','#d18c62','#617b9b'][i];p.skin=['#dca77f','#ae7655','#efc8a2','#c88e6d','#e8b88d','#c78f69','#e3b58b','#af795a'][i];p.pants=['#394653','#3b4651','#665342','#34414e','#51443e','#324a48','#55423b','#394754'][i];if(i===4){p.vx=24;p.vy=0;}});
   w.objective={x:mia.x,y:mia.y,label:'TALK TO MIA'};w._shotObjectiveBanner='TALK TO MIA';w._homecomingShotMarkerSuppressed=true;w._homecomingScene=true;
   w.heat=0;w.wanted.heat=0;w.pinCallout('HOMECOMING','CORAL BEACH',{y:176});
   w._shotHudMode='unarmed';game.camera.x=672;game.camera.y=2100;game.camera.zoom=3.2;
  }
  else if(name==='getaway'){
   w.setTimeOfDay('night');w._shotHudMode='driving';w.vehicles=[];w.traffic.cars=[];w.pedestrians.people=[];
   const x=4095,y=2505,heading=.61,v=new Vehicle(x,y,'sport','#e94f45',heading);v.speed=820;v.driver='player';v._handbrake=true;v._headlights=true;v._groundMarker=true;w.vehicles.push(v);w.driving=v;w.player.x=x;w.player.y=y;
   // Keep the ramp, hero car, and police funnel on one clean apron sightline.
   const ramp={x:4119,y:2470};w.objective={x:ramp.x,y:ramp.y,label:'REACH THE CARGO PLANE'};w._getawayShotMarkerSuppressed=true;w._shotObjectiveBanner='REACH THE CARGO PLANE';w._shotSpeed=122;w.heat=w.wanted.heat=5;
   w.missions.index=5;w.missions.state='active';
   const forward={x:Math.sin(heading),y:-Math.cos(heading)},lateral={x:Math.cos(heading),y:Math.sin(heading)};
   const cops=[[4030,2535],[3975,2483],[3930,2567]];
   w.police.units=[];for(let i=0;i<cops.length;i++){const [cx,cy]=cops[i],a=heading+(i-1)*.13,q=new Vehicle(cx,cy,'police','#e7e4d8',a);q.driver='police';q.speed=95;q._headlights=true;q._braking=true;q._brakeGlow=true;w.vehicles.push(q);w.police.units.push(q);w.effects.lightPool(cx,cy,'rgba(50,105,255,.9)',132);w.effects.lightPool(cx,cy,'rgba(255,44,54,.88)',120);}
   // Paired curved tyre trails and smoke trail the red car through the turn.
   for(let i=0;i<15;i++){const back=30+i*7,side=(i%2?1:-1)*11;w.effects.skid(x-forward.x*back+lateral.x*side,y-forward.y*back+lateral.y*side,heading,30);}
   for(let i=0;i<9;i++)w.effects.particles.push({x:x-forward.x*(25+i*8)+lateral.x*(i%2?10:-10),y:y-forward.y*(25+i*8)+lateral.y*(i%2?10:-10),vx:-forward.x*10,vy:-forward.y*10,life:1.2,size:10+(i%3)*3,color:'rgba(246,244,235,.68)',_smoke:true,angle:heading});
   w.pinCallout('ESCAPE!','SUNSET GETAWAY',{y:176});game.camera.x=4180;game.camera.y=2485;game.camera.zoom=1.5;dress([],[[4020,2260],[4060,2272]]);w.pedestrians.people.forEach((p,i)=>{p.color=i?'#e1b957':'#4b8290';p.skin=i?'#bd8663':'#e2b28c';p.pants=i?'#3d4346':'#51443f';});
  }
  else if(name==='street'){w.player.x=635;w.player.y=650;w.objective={x:720,y:1250,label:'MEET MIA AT THE GARAGE'};game.camera.x=635;game.camera.y=650;}
  else if(name==='downtown'){const v=new Vehicle(1920,780,'sedan','#42657b',Math.PI/2);v.speed=65;v.driver='player';w.vehicles.push(v);w.driving=v;w.heat=1;w.wanted.heat=1;w.objective={x:2200,y:780,label:'HEAD DOWNTOWN'};game.camera.x=v.x;game.camera.y=v.y;}
  else {game.screen='title';game.camera.x=535;game.camera.y=950;return false;}
  game.camera.clamp(w.city);return true;
 }
};
