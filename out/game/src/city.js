import { CONFIG } from './config.js';
export const CityMap = class CityMap {
  constructor(rng) {
    this.width = CONFIG.city.width; this.height = CONFIG.city.height; this.rng = rng; this.roads = []; this.buildings = []; this.districts = []; this.palms = []; this.piers = []; this.boats=[];this.crates=[];this.lots=[];
    this.waterline = 500;
    const d = CONFIG.districts;
    for (const key of Object.keys(d)) this.districts.push({ ...d[key], id: key, x: d[key].rect[0], y: d[key].rect[1], w: d[key].rect[2], h: d[key].rect[3] });
    // Curving beach boulevard and a regular city grid, clipped at the western shore.
    this.roads.push({ x1: 535, y1: 0, x2: 535, y2: this.height, width: 34 });
    for (let x = 720; x < this.width; x += 300) this.roads.push({ x1: x, y1: 0, x2: x, y2: this.height, width: x % 900 === 720 ? 30 : 20 });
    for (let y = 120; y < this.height; y += 300) this.roads.push({ x1: 500, y1: y, x2: this.width, y2: y, width: y % 900 === 120 ? 30 : 20 });
    // A parallel coastal road opens onto the marina and beach neighborhoods.
    this.roads.push({ x1: 635, y1: 0, x2: 635, y2: this.height, width: 18 });
    for (const district of this.districts) this._fillDistrict(district);
    for(const id of ['laspalmas','porto']){const q=this.districts.find(v=>v.id===id);for(let i=0;i<9;i++)if(this.rng.chance(.68)){const x=this.rng.range(q.x+25,q.x+q.w-145),y=this.rng.range(q.y+25,q.y+q.h-125);if(!this._nearRoad(x+60,y+50,120,100))this.lots.push({x,y,w:this.rng.range(76,124),d:this.rng.range(65,102),prop:this.rng.int(0,2)});}}
    for (let y = 60; y < this.height; y += 46) this.palms.push({ x: 482 + this.rng.range(-8, 18), y });
    const las=this.districts.find(q=>q.id==='laspalmas');for(let i=0;i<24;i++)this.palms.push({x:this.rng.range(las.x+12,las.x+las.w-12),y:this.rng.range(las.y+12,las.y+las.h-12)});
    for (let y = 1900; y < 2600; y += 145) this.piers.push({ x1: 500, y1: y, x2: this.rng.range(280, 430), y2: y + this.rng.range(-24, 24), width: 18 });
    for(let i=0;i<11;i++)this.boats.push({x:300+(i%3)*62,y:1800+i*72,a:(i%2?-.12:.1),l:i%3===0?78:48});
    this.buoys=[];for(let i=0;i<12;i++)this.buoys.push({x:190+(i%3)*95,y:1815+i*58});
    for(let i=0;i<7;i++)this.crates.push({x:565+(i%3)*30,y:2055+Math.floor(i/3)*45,w:23,h:19});
    this.runway = { x: 3930, y: 2430, w: 760, h: 90 }; this.terminal = { x: 3700, y: 2160, w: 260, h: 180 };
  }
  _fillDistrict(d) {
    const [minH, maxH] = d.heights; const step = d.kind === 'tower' ? 130 : d.kind === 'house' ? 95 : 120;
    for (let y = d.y + 35; y < d.y + d.h - 50; y += step) for (let x = d.x + 35; x < d.x + d.w - 50; x += step) {
      if (this.buildings.length >= CONFIG.entityCaps.buildings) return;
      const house=d.kind==='house', w = Math.min(house?this.rng.range(44,65):step - 42, d.x + d.w - x - 18), dep = Math.min(house?this.rng.range(42,62):step - 42, d.y + d.h - y - 18);
      if (w < 25 || dep < 25 || this._nearRoad(x + w / 2, y + dep / 2, w, dep)) continue;
      if(d.id==='downtown'&&this.rng.chance(.14))continue;
      const variation=this.rng.range(.76,1.16),height=house?this.rng.range(15,27):this.rng.range(minH,maxH)*variation,base=parseInt(d.color.slice(1),16);
      const color='#'+[16,8,0].map(s=>Math.max(0,Math.min(255,((base>>s)&255)+this.rng.range(-13,13)|0)).toString(16).padStart(2,'0')).join('');
      const neon=d.id==='downtown'&&this.rng.chance(.34)?{count:this.rng.int(1,2),width:this.rng.int(23,39),hue:this.rng.pick(['#ff4fa3','#43dce2','#ffc44d','#a77bff'])}:null;
      const warehouse=(d.id==='porto'||d.id==='airport')&&this.rng.chance(d.id==='porto'?.48:.3),footprint=this.rng.chance(.23)?'L':'rect';this.buildings.push({x,y,w:warehouse?Math.min(step*1.45,d.x+d.w-x-18):w,d:warehouse?Math.max(30,dep*.7):dep,height:warehouse?this.rng.range(22,38):height,kind:warehouse?'warehouse':d.kind,footprint,wing:footprint==='L'?{x:x+w*.48,y:y+dep*.42,w:w*.52,d:dep*.58}:null,shade:this.rng.range(.86,1.12),district:d.id,color,roof:this.rng.pick(['#b6a28a','#8f8577','#c4ad88','#777d79','#a88e78','#d0b68d']),treatment:this.rng.int(0,2),awning:d.id==='coral'&&y<d.y+155,commercial:['coral','downtown','marina','porto'].includes(d.id)&&!house,house,roofProps:!house&&this.rng.chance(.48)?this.rng.int(1,3):0,neon});
    }
  }
  _nearRoad(x, y, w, h) { return this.roads.some(r => r.x1 === r.x2 ? Math.abs(x-r.x1) < w/2+r.width/2+12 : y > r.y1-r.width/2-h/2-12 && y < r.y1+r.width/2+h/2+12); }
  isWater(x, y) { return x < this.waterline && y >= 0 && y < this.height; }
  isLand(x, y) { return x >= this.waterline && x <= this.width && y >= 0 && y <= this.height; }
  collidesBuilding(x, y, r = 0) { return this.buildings.some(b => x+r>b.x && x-r<b.x+b.w && y+r>b.y && y-r<b.y+b.d); }
  randomRoadPoint(rng = this.rng) { const road = rng.pick(this.roads); return road.x1 === road.x2 ? { x: road.x1, y: rng.range(0,this.height) } : { x: rng.range(500,this.width), y: road.y1 }; }
  boulevardView() { return { x: 535, y: 950 }; }
};
