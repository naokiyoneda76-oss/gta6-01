import { CONFIG } from './config.js';
export const CityMap = class CityMap {
  constructor(rng) {
    this.width = CONFIG.city.width; this.height = CONFIG.city.height; this.rng = rng; this.roads = []; this.buildings = []; this.districts = []; this.palms = []; this.piers = []; this.boats=[];this.crates=[];this.lots=[];this.parkedCars=[];this.streetProps=[];
    this.waterline = 500;
    const d = CONFIG.districts;
    for (const key of Object.keys(d)) this.districts.push({ ...d[key], id: key, x: d[key].rect[0], y: d[key].rect[1], w: d[key].rect[2], h: d[key].rect[3] });
    // Curving beach boulevard and a regular city grid, clipped at the western shore.
    this.roads.push({ x1: 535, y1: 0, x2: 535, y2: this.height, width: 34 });
    for (let x = 720; x < this.width; x += 300) this.roads.push({ x1: x, y1: 0, x2: x, y2: this.height, width: x === 1920 ? 84 : x % 900 === 720 ? 30 : 20 });
    for (let y = 120; y < this.height; y += 300) this.roads.push({ x1: 500, y1: y, x2: this.width, y2: y, width: y % 900 === 120 ? 30 : 20 });
    // A parallel coastal road opens onto the marina and beach neighborhoods.
    this.roads.push({ x1: 635, y1: 0, x2: 635, y2: this.height, width: 84 });
    this._buildMarinaRoads();
    // Shot-district surface footprints are authored alongside the road graph.
    this.shotGround={coral:{shore:470,sandEnd:524,promenadeEnd:577,road:{x:619,width:100},median:{x:611,y1:900,y2:1008,y3:1032,y4:1110,w:16},park:{x:684,y:930,w:74,h:130}},downtown:{road:{x:1920,width:84},parking:38,sidewalk:40,park:{x:2050,y:742,w:50,h:86}},airport:{apron:{x:3860,y:2350,w:600,h:320}}};
    for (const district of this.districts) this._fillDistrict(district);
    for(const id of ['coral','downtown','marina','porto','laspalmas','airport']){const q=this.districts.find(v=>v.id===id);for(let i=0;i<12;i++)if(this.rng.chance(.77)){const x=this.rng.range(q.x+12,q.x+q.w-120),y=this.rng.range(q.y+12,q.y+q.h-100),w=this.rng.range(76,124),depth=this.rng.range(65,102);if(!this._nearRoad(x+w/2,y+depth/2,w,depth)&&!this.buildings.some(b=>x<b.x+b.w&&x+w>b.x&&y<b.y+b.d&&y+depth>b.y))this.lots.push({x,y,w,d:depth,type:this.rng.pick(['parking','plaza','yard','construction']),cars:this.rng.int(2,5)});}}
    // Sidewalk furniture and curb parking use stable road coordinates, leaving the carriageway clear.
    const tryPark=(car)=>{const dims={sedan:[24,43],pickup:[27,48],van:[29,50],convertible:[24,43],taxi:[24,43]},[w,l]=dims[car.type]||dims.sedan,hw=(car.angle===0? w:l)/2,hh=(car.angle===0?l:w)/2;if(this.buildings.some(b=>car.x+hw>b.x&&car.x-hw<b.x+b.w&&car.y+hh>b.y&&car.y-hh<b.y+b.d))return;if(this.parkedCars.some(v=>Math.abs(v.x-car.x)<(v.angle===0?12:24)+hw&&Math.abs(v.y-car.y)<(v.angle===0?24:12)+hh))return;this.parkedCars.push(car);};
    for(const r of this.roads){if(r.groundProfile==='marina')continue;if(r.x1===r.x2){for(let y=180;y<this.height-60;y+=330){this.streetProps.push({x:r.x1+r.width*.5+13,y,kind:this.rng.pick(['bench','planter','postbox','bin','bus'])});if(r.width>=30&&this.rng.chance(.55))tryPark({x:r.x1-r.width*.5-18,y:y+42,type:this.rng.pick(['sedan','pickup','taxi','van','convertible']),color:this.rng.pick(['#47747a','#d8d2bd','#b98d5b','#e8bc3e']),angle:0});}}else{for(let x=720;x<this.width-80;x+=420)if(this.rng.chance(.65)){this.streetProps.push({x,y:r.y1-r.width*.5-13,kind:this.rng.pick(['bench','planter','postbox','bin','bus'])});if(r.width>=30&&this.rng.chance(.5))tryPark({x:x+43,y:r.y1-r.width*.5-18,type:this.rng.pick(['sedan','pickup','van','convertible']),color:this.rng.pick(['#47747a','#d8d2bd','#b98d5b']),angle:Math.PI/2});}}}
    for (let y = 60; y < this.height; y += 46) this.palms.push({ x: 482 + this.rng.range(-8, 18), y });
    const las=this.districts.find(q=>q.id==='laspalmas');for(let i=0;i<24;i++)this.palms.push({x:this.rng.range(las.x+12,las.x+las.w-12),y:this.rng.range(las.y+12,las.y+las.h-12)});
    for (let y = 1900; y < 2600; y += 145) this.piers.push({ x1: 500, y1: y, x2: this.rng.range(280, 430), y2: y + this.rng.range(-24, 24), width: 18 });
    for(let i=0;i<14;i++)this.boats.push({x:300+(i%4)*58,y:1780+i*61,a:(i%2?-.12:.1),l:i%3===0?78:48});
    this.buoys=[];for(let i=0;i<12;i++)this.buoys.push({x:190+(i%3)*95,y:1815+i*58});
    // Irregular marina freight pile; the front crate remains beside Danny's cover.
    for(const [x,y] of [[565,2055],[647,2053],[560,2082],[617,2080],[649,2088],[566,2114],[594,2110],[624,2118],[651,2112],[700,2100]])this.crates.push({x,y,w:23,h:19});
    this.runway = { x: 3930, y: 2430, w: 760, h: 90 }; this.terminal = { x: 3700, y: 2160, w: 260, h: 180 };
  }
  _buildMarinaRoads() {
    const marina=this.districts.find(d=>d.id==='marina'),y0=marina.y,y1=marina.y+marina.h,x0=500,x1=marina.x+marina.w,out=[];
    for(const r of this.roads){const vertical=r.x1===r.x2;if(vertical&&r.y1===0&&r.y2===this.height&&r.x1>=x0&&r.x1<=x1){if(r.x1===635){out.push({...r,y2:y0},{...r,y1:y1});continue;}out.push({...r,y2:y0},{...r,y1:y0,y2:y1,width:84,groundProfile:'marina'},{...r,y1:y1});}else if(!vertical&&r.x1===500&&r.x2===this.width&&r.y1>=y0&&r.y1<=y1){if(r.y1===2220){out.push({...r,x2:x0},{...r,x1:x1});continue;}out.push({...r,x2:x0},{...r,x1:x0,x2:x1,width:84,groundProfile:'marina'},{...r,x1:x1});}else out.push(r);}
    this.roads=out;this.marinaGround={x:marina.x,y:marina.y,w:marina.w,h:marina.h,sidewalk:30,parking:22,cargo:{x:535,y:1988,w:235,h:215}};
  }
  _fillDistrict(d) {
    const [minH, maxH] = d.heights; const step = d.kind === 'tower' ? 130 : d.kind === 'house' ? 95 : 120;
    for (let y = d.y + 35; y < d.y + d.h - 50; y += step) for (let x = d.x + 35; x < d.x + d.w - 50; x += step) {
      if (this.buildings.length >= CONFIG.entityCaps.buildings) return;
      const house=d.kind==='house', w = Math.min(house?this.rng.range(44,65):step - 42, d.x + d.w - x - 18), dep = Math.min(house?this.rng.range(42,62):step - 42, d.y + d.h - y - 18);
      if (w < 25 || dep < 25 || this._nearRoad(x + w / 2, y + dep / 2, w, dep) || this.buildings.some(b=>x<b.x+b.w&&x+w>b.x&&y<b.y+b.d&&y+dep>b.y)) continue;
      if(d.id==='downtown'&&this.rng.chance(.14))continue;
      const variation=this.rng.range(.76,1.16),height=house?this.rng.range(15,27):this.rng.range(minH,maxH)*variation,base=parseInt(d.color.slice(1),16);
      const color='#'+[16,8,0].map(s=>Math.max(0,Math.min(255,((base>>s)&255)+this.rng.range(-13,13)|0)).toString(16).padStart(2,'0')).join('');
      const neon=d.id==='downtown'&&this.rng.chance(.34)?{count:this.rng.int(1,2),width:this.rng.int(23,39),hue:this.rng.pick(['#ff4fa3','#43dce2','#ffc44d','#a77bff'])}:null;
      const warehouse=(d.id==='porto'||d.id==='airport')&&this.rng.chance(d.id==='porto'?.22:.15),footprint=this.rng.chance(.23)?'L':'rect';let kind=warehouse?'warehouse':d.kind,archetype=house?'house':d.kind==='tower'?(this.rng.chance(.45)?'apartment':'tower'):(['coral','downtown','marina','porto'].includes(d.id)&&this.rng.chance(.52)?'shop':'office');const record={x,y,w:warehouse?Math.min(step*1.2,d.x+d.w-x-18):w,d:warehouse?Math.max(30,dep*.7):dep,height:warehouse?this.rng.range(22,38):archetype==='apartment'?this.rng.range(75,115):height,kind,archetype,footprint,wing:footprint==='L'?{x:x+w*.48,y:y+dep*.42,w:w*.52,d:dep*.58}:null,shade:this.rng.range(.86,1.12),district:d.id,color,roof:this.rng.pick(['#b6a28a','#8f8577','#c4ad88','#777d79','#a88e78','#d0b68d']),treatment:this.rng.int(0,2),awning:d.id==='coral'&&y<d.y+155,commercial:['coral','downtown','marina','porto'].includes(d.id)&&!house,house,roofProps:this.rng.int(1,3),storefronts:archetype==='shop'?this.rng.int(3,5):0,neon};
      // The frontage points toward the nearest street edge: south=0, west=90, north=180, east=270.
      let frontage=null,frontageDistance=Infinity;
      for(const road of this.roads){const vertical=road.x1===road.x2;if(vertical){const side=x+w/2<road.x1?1:-1,edge=road.x1+side*road.width/2,dist=Math.abs((side>0?x+w:x)-edge);if(dist<frontageDistance){frontageDistance=dist;frontage=side>0?270:90;}}else{const side=y+dep/2<road.y1?1:-1,edge=road.y1+side*road.width/2,dist=Math.abs((side>0?y+dep:y)-edge);if(dist<frontageDistance){frontageDistance=dist;frontage=side>0?0:180;}}}
      record.rotation=d.id==='airport'?0:(frontage||0);this.buildings.push(record);
      if(house){const count=this.rng.int(1,3);for(let i=0;i<count;i++){const hx=x+9+(i%2)*43,hy=y+Math.floor(i/2)*43;if(hx+38<d.x+d.w-10&&hy+36<d.y+d.h-10)this.buildings.push({...record,x:hx,y:hy,w:38,d:36,height:this.rng.range(15,24),roofProps:1,roof:this.rng.pick(['#b6a28a','#c4ad88','#a88e78','#d0b68d'])});}}
    }
  }
  _nearRoad(x, y, w, h) { return this.roads.some(r => r.x1 === r.x2 ? Math.abs(x-r.x1) < w/2+r.width/2+12 : y > r.y1-r.width/2-h/2-12 && y < r.y1+r.width/2+h/2+12); }
  isWater(x, y) { return x < this.waterline && y >= 0 && y < this.height; }
  isLand(x, y) { return x >= this.waterline && x <= this.width && y >= 0 && y <= this.height; }
  collidesBuilding(x, y, r = 0) { return this.buildings.some(b => x+r>b.x && x-r<b.x+b.w && y+r>b.y && y-r<b.y+b.d); }
  randomRoadPoint(rng = this.rng) { const road = rng.pick(this.roads); return road.x1 === road.x2 ? { x: road.x1, y: rng.range(0,this.height) } : { x: rng.range(500,this.width), y: road.y1 }; }
  boulevardView() { return { x: 535, y: 950 }; }
};
