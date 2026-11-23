import {spawn} from 'node:child_process';
import {mkdir,writeFile,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {setTimeout as delay} from 'node:timers/promises';

// Round 141 worker driver (tooling only). Fixes vs playtest_r141_batch.mjs:
// walkTo W/S corrected (S=+y/south, W=-y/north per player.js), enterCar skips
// dialogue first, phases enter a car before any driveTo, correct mission
// indices (0 HOMECOMING RUN, 1 FIRST WHEELS, 2 BEACH RUN, 3 HEAVY METAL,
// 4 SET UP, 5 SUNSET GETAWAY).
const phase=process.argv[2];
if(!['w1','w1b','w1c','w2','wR','wR2','wR3','wR4','w3','w4','w5'].includes(phase)) throw Error('Usage: node tools/playtest_r141_worker.mjs <w1|w1b|w1c|w2|wR|wR2|wR3|wR4|w3|w4|w5>');
const out='/home/hatch/workspace/makefun/r141_evidence'; await mkdir(out,{recursive:true});
const log=path.join(out,`r141_worker_${phase}.json`), cache=path.join(os.homedir(),'.cache/puppeteer');
let bin; for(const v of await readdir(path.join(cache,'chrome-headless-shell')).catch(()=>[])){const d=path.join(cache,'chrome-headless-shell',v,'chrome-headless-shell-linux64');if(existsSync(path.join(d,'chrome-headless-shell'))){bin=path.join(d,'chrome-headless-shell');break;}} if(!bin) throw Error('chrome-headless-shell missing');
const profile='/home/hatch/workspace/makefun/r141_profile';
const port=9225+['w1','w2','w3','w4','w5'].indexOf(phase);
const chrome=spawn(bin,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars','--no-proxy-server','--remote-debugging-port='+port,'--user-data-dir='+profile,'--window-size=1280,800','--hatch-webgl-allowed-domains-file=/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt','--hatch-webgl-allowed-domains-sha256=8097045f0459c96c4cdc76e3a1af4e0f43f640b4b59c43d6db35e3641c0264c6','about:blank'],{stdio:'ignore'});
const began=Date.now(),events=[],errors=[],held=new Set(); let verdict={},ws;
const save=async()=>writeFile(log,JSON.stringify({phase,started:new Date(began).toISOString(),elapsedMs:Date.now()-began,events,verdict:{...verdict,consoleErrors:errors.length},consoleErrors:errors},null,2));
let tab; for(let i=0;i<100;i++){try{tab=await(await fetch(`http://localhost:${port}/json/new?about:blank`,{method:'PUT'})).json();break;}catch{} await delay(200);} if(!tab)throw Error('CDP failed');
ws=new WebSocket(tab.webSocketDebuggerUrl); await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;}); let id=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'){const x={type:m.params.type,args:m.params.args.map(a=>a.value??a.description??'')};errors.push(x);events.push({t:Date.now()-began,event:'console',...x});}if(m.method==='Runtime.exceptionThrown'){const x={text:m.params.exceptionDetails.text,exception:m.params.exceptionDetails.exception?.description||'',url:m.params.exceptionDetails.url,line:m.params.exceptionDetails.lineNumber};errors.push(x);events.push({t:Date.now()-began,event:'exception',...x});}if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);p.resolve(m);}};
const call=(method,params={})=>new Promise(resolve=>{const n=++id;const timer=setTimeout(()=>{if(pending.has(n)){pending.delete(n);events.push({t:Date.now()-began,event:'cdp-timeout',method});resolve({error:'cdp-timeout'});}},10000);pending.set(n,{resolve,timer});ws.send(JSON.stringify({id:n,method,params}));});
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
const vk={Enter:13,Escape:27,Tab:9,ShiftLeft:16,Space:32,KeyE:69,KeyR:82,KeyW:87,KeyA:65,KeyS:83,KeyD:68,KeyQ:81,Digit2:50};
async function down(code){if(held.has(code))return;held.add(code);await call('Input.dispatchKeyEvent',{type:'keyDown',key:code==='ShiftLeft'?'Shift':code.replace(/^Key/,'').replace(/^Digit/,''),code,windowsVirtualKeyCode:vk[code]||0});}
async function up(code){if(!held.has(code))return;held.delete(code);await call('Input.dispatchKeyEvent',{type:'keyUp',key:code==='ShiftLeft'?'Shift':code.replace(/^Key/,'').replace(/^Digit/,''),code,windowsVirtualKeyCode:vk[code]||0});}
async function releaseAll(){for(const k of [...held])await up(k);}
async function key(code,ms=250){await down(code);await delay(ms);await up(code);}
async function hold(keys,ms){for(const k of keys)await down(k);await delay(ms);for(const k of keys)await up(k);}
async function click(x,y,ms=60){await call('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});await call('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await delay(ms);await call('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});}
async function read(expr='window.__compass?.()'){const r=await call('Runtime.evaluate',{expression:expr,returnByValue:true});return r.result?.result?.value;}
const snap=()=>read();
async function logEvent(name,data={}){events.push({t:Date.now()-began,event:name,...data});await save();}
async function nav(){await call('Page.navigate',{url:'http://localhost:8080/'});await delay(2000);}
async function poll(ms=200){await delay(ms);return snap();}
async function waitFor(fn,timeout,label){const end=Date.now()+timeout;let s;while(Date.now()<end){s=await poll();if(s&&fn(s)){await logEvent('waitFor',{label,ok:true,snapshot:s});return s;}}await logEvent('waitFor',{label,ok:false,snapshot:s});return null;}
const pos=s=>s?.driving?{x:s.driving.x,y:s.driving.y,sp:s.driving.sp,a:s.driving.a}:{x:s?.px,y:s?.py,sp:0,a:0};
function dist(a,x,y){return Math.hypot(a.x-x,a.y-y)}
function angleTo(a,x,y){return Math.atan2(x-a.x,-(y-a.y));}
function diff(a,b){return (a-b+Math.PI*3)%(Math.PI*2)-Math.PI;}
async function turnTo(angle,{tol=.07,timeout=15000}={}){const end=Date.now()+timeout;while(Date.now()<end){const s=await snap();if(!s?.driving)return false;const d=diff(angle,s.driving.a);if(Math.abs(d)<=tol){await up('KeyA');await up('KeyD');await up('KeyW');return true;}await down('KeyW');await down(d>0?'KeyD':'KeyA');await up(d>0?'KeyA':'KeyD');await delay(120);await up('KeyW');}await releaseAll();return false;}
async function driveTo(x,y,{radius=55,timeout=120000}={}){const end=Date.now()+timeout;let slowSince=null,shuffles=0;while(Date.now()<end){const s=await snap();if(!s)return false;if(!s.driving){await logEvent('driveTo-no-car',{x,y,snapshot:s});return false;}const p=pos(s),d=dist(p,x,y);if(d<radius){await up('KeyW');await up('KeyA');await up('KeyD');const stopEnd=Date.now()+5000;while(Date.now()<stopEnd){const q=await snap();if(!q?.driving||Math.abs(q.driving.sp)<15)break;await key('KeyS',130);await delay(100);}await logEvent('driveTo-arrived',{x,y,distance:d,snapshot:await snap()});return true;}if(Math.abs(p.sp)>=8)slowSince=null;else if(slowSince===null)slowSince=Date.now();const desired=angleTo(p,x,y),ad=diff(desired,s.driving.a);if(Math.abs(ad)>.10){await down(ad>0?'KeyD':'KeyA');await up(ad>0?'KeyA':'KeyD');}else{await up('KeyA');await up('KeyD');}if(d<160&&Math.abs(p.sp)>150){await up('KeyW');await key('KeyS',90);}else await down('KeyW');if(slowSince!==null&&Date.now()-slowSince>3500){shuffles++;const away=shuffles%2?'KeyD':'KeyA';await releaseAll();await hold(['KeyS',away],850);await hold(['KeyW',away],850);await releaseAll();slowSince=null;await logEvent('driveTo-shuffle',{x,y,n:shuffles,snapshot:await snap()});}await delay(200);}await releaseAll();await logEvent('driveTo-timeout',{x,y,snapshot:await snap()});return false;}
async function walkTo(x,y,{radius=30,timeout=60000}={}){const end=Date.now()+timeout;let lastX=null,lastY=null,stallSince=Date.now(),axisMode=0,axisFlip=Date.now();while(Date.now()<end){const s=await snap();if(!s)return false;if(s.driving)return false;if(Math.hypot(x-s.px,y-s.py)<radius){await releaseAll();return true;}if(lastX===null||Math.hypot(s.px-lastX,s.py-lastY)>3){lastX=s.px;lastY=s.py;stallSince=Date.now();}const stalled=Date.now()-stallSince>1500;const dx=x-s.px,dy=y-s.py;let useX=true,useY=true;if(stalled){if(Date.now()-axisFlip>800){axisMode=1-axisMode;axisFlip=Date.now();}useX=axisMode===0;useY=axisMode===1;}for(const [k,on] of [['KeyA',useX&&dx<-4],['KeyD',useX&&dx>4],['KeyS',useY&&dy>4],['KeyW',useY&&dy<-4],['ShiftLeft',true]])on?await down(k):await up(k);await delay(200);}await releaseAll();await logEvent('walkTo-timeout',{x,y,snapshot:await snap()});return false;}
async function creepTo(x,y,{axis='both',pulses=60}={}){for(let i=0;i<pulses;i++){const s=await snap();if(!s?.driving)return false;const dx=x-s.driving.x,dy=y-s.driving.y;if((axis==='x'?Math.abs(dx)<10:axis==='y'?Math.abs(dy)<7:Math.abs(dx)<10&&Math.abs(dy)<7)){await up('KeyW');await up('KeyS');return true;}const a=angleTo(pos(s),x,y),d=diff(a,s.driving.a);if(Math.abs(d)>.2){await down(d>0?'KeyD':'KeyA');await up(d>0?'KeyA':'KeyD');}else{await up('KeyA');await up('KeyD');}await key(dx*Math.sin(s.driving.a)+dy*(-Math.cos(s.driving.a))>0?'KeyW':'KeyS',120);await delay(80);}return false;}
async function skipDialogue(){for(let i=0;i<40;i++){const s=await snap();if(!s?.dlg)break;await key('KeyE',250);await delay(350);}await delay(300);const s=await snap();if(s?.dlg){await key('KeyE',250);await delay(300);}return snap();}
async function enterCar(){let s=await snap();if(s?.driving)return true;if(s?.dlg)await skipDialogue();for(let attempt=1;attempt<=6;attempt++){s=await snap();if(s?.driving)return true;if(s?.dlg){await skipDialogue();s=await snap();}const parked=(s?.cars||[]).filter(c=>c.drv==null).sort((a,b)=>((a.t==='sport'?0:1)-(b.t==='sport'?0:1))||(a.d-b.d));const car=parked[0];if(!car){await logEvent('enterCar-no-parked',{attempt,snapshot:s});await delay(500);continue;}if(attempt%2===0){await walkTo(car.x,s.py,{radius:24,timeout:45000});}await walkTo(car.x,car.y,{radius:22,timeout:90000});const near=await snap(),distance=Math.hypot(near.px-car.x,near.py-car.y);await logEvent('enterCar-approach',{attempt,car,distance,snapshot:near});if(distance>=50)continue;await key('KeyE',250);await delay(450);const after=await snap();if(after?.driving){await logEvent('enterCar-ok',{attempt,snapshot:after});return true;}}await logEvent('enterCar-fail',{snapshot:await snap()});return false;}
async function exitCar(){await key('KeyE',220);await delay(350);return snap();}
async function assert(name,ok,s,extra={}){if(s===undefined)s=await snap();verdict[name]={result:ok?'PASS':'FAIL',...extra,snapshot:s};await logEvent('assert',{name,ok,...extra,snapshot:s});return ok;}
async function startGame(reset=false){await nav();let s=await snap();if(s?.screen==='title'){if(reset){await key('KeyR',200);await delay(400);}await key('Enter',250);await delay(800);}await skipDialogue();s=await snap();if(reset&&s&&s.money!==500){await logEvent('reset-unexpected',{snapshot:s});}return s;}
async function driveRoute(points,{radius=60,timeout=240000}={}){let ok=true;for(const [x,y] of points){const r=await driveTo(x,y,{radius,timeout});await logEvent('driveRoute-leg',{x,y,ok:r,snapshot:await snap()});if(!r)ok=false;}return ok;}
const VX=[535,635,720,1020,1320,1620,1920,2220,2520,2820,3120,3420,3720,4020,4320,4620];
const HY=[120,420,720,1020,1320,1620,1920,2220,2520,2820,3120,3420];
const snapTo=(v,list)=>list.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a);
async function driveGrid(x,y,{finalRadius=55}={}){const s0=await snap();if(!s0?.driving)return false;const p0=pos(s0);const vx1=snapTo(p0.x,VX),hy2=snapTo(y,HY),vx2=snapTo(x,VX);const legs=[[vx1,p0.y,30],[vx1,hy2,30],[vx2,hy2,30],[x,y,finalRadius]];for(const [lx,ly,lr] of legs){const s=await snap();if(!s?.driving)return false;const d=Math.hypot(lx-pos(s).x,ly-pos(s).y);if(d<lr+5)continue;const ok=await driveTo(lx,ly,{radius:lr,timeout:Math.min(300000,Math.max(60000,Math.round(d*900)))});await logEvent('driveGrid-leg',{x:lx,y:ly,ok,snapshot:await snap()});if(!ok)return false;}return true;}
async function walkGrid(x,y,{finalRadius=26}={}){const s0=await snap();if(!s0||s0.driving)return false;const vx1=snapTo(s0.px,VX),hy2=snapTo(y,HY),vx2=snapTo(x,VX);const legs=[[vx1,s0.py,26],[vx1,hy2,26],[vx2,hy2,26],[x,y,finalRadius]];for(const [lx,ly,lr] of legs){const s=await snap();if(!s||s.driving)return false;const d=Math.hypot(lx-s.px,ly-s.py);if(d<lr+4)continue;const ok=await walkTo(lx,ly,{radius:lr,timeout:Math.min(240000,Math.max(45000,Math.round(d*450)))});await logEvent('walkGrid-leg',{x:lx,y:ly,ok,snapshot:await snap()});if(!ok)return false;}return true;}
async function provokeFail(tag){for(let i=0;i<10;i++){const s=await snap();if(!s||s.failed)return true;if((s.heat||0)>=2||(s.policeN||0)>0)break;await click(1240,60,50);await delay(900);}const f=await waitFor(q=>q.failed,150000,'provoked fail '+tag);return !!f;}

try {
 if(phase==='w1c'){
  let s=await startGame(false);
  await assert('freshStart',!!s&&s.money===500&&s.mIdx===0,s);
  await assert('enterCarSpawn',await enterCar(),await snap());
  // WEDGE (driveTo-only staging): approach the west face (x=3745) along y=2340
  await driveTo(3600,2340,{radius:20,timeout:120000});await driveTo(3728,2340,{radius:10,timeout:60000});
  await hold(['KeyW'],900);const wc0=await snap();await hold(['KeyW'],600);const wc1=await snap();const wedged=!!wc1?.driving&&Math.hypot(wc1.driving.x-wc0.driving.x,wc1.driving.y-wc0.driving.y)<2;await hold(['KeyS'],800);const wc2=await snap();const escD=wc2?.driving?Math.hypot(wc2.driving.x-wc1.driving.x,wc2.driving.y-wc1.driving.y):0;
  await assert('wedge',wedged&&escD>40,wc2,{wedged,escapeDist:escD,contact:wc1,before:wc0});
  // M1 via spawn point
  await driveTo(3830,2250,{radius:40,timeout:120000});await driveTo(4050,1700,{radius:60,timeout:240000});const m1s=await waitFor(q=>q.money>=800,8000,'M1 money');
  await assert('m1',!!m1s,m1s||await snap());
 } else if(phase==='w1b'){
  let s=await startGame(false);
  await assert('freshStart',!!s&&s.money===500&&s.mIdx===0,s);
  await assert('enterCarSpawn',await enterCar(),await snap());
  // WEDGE REGRESSION (precise staging): west face of building x3745-3823 y2305-2383, centre y=2340
  await driveTo(3700,2340,{radius:15,timeout:120000});await creepTo(3700,2340,{});await turnTo(Math.PI/2);await hold(['KeyW'],900);const wc0=await snap();await hold(['KeyW'],600);const wc1=await snap();const wedged=!!wc1?.driving&&Math.hypot(wc1.driving.x-wc0.driving.x,wc1.driving.y-wc0.driving.y)<2;await hold(['KeyS'],800);const wc2=await snap();const escD=wc2?.driving?Math.hypot(wc2.driving.x-wc1.driving.x,wc2.driving.y-wc1.driving.y):0;
  await assert('wedge',wedged&&escD>40,wc2,{wedged,escapeDist:escD,contact:wc1,before:wc0});
  // M1 via the spawn-road waypoint
  await driveRoute([[4018,2250],[4050,1700]],{radius:60,timeout:240000});const m1s=await waitFor(q=>q.money>=800,8000,'M1 money');
  await assert('m1',!!m1s,m1s||await snap());
 } else if(phase==='w1'){
  let s=await startGame(true);
  await assert('freshStart',!!s&&s.money===500&&s.mIdx===0,s);
  await key('Escape',160);const paused=(await snap())?.screen==='paused';await key('Escape',160);const playing=(await snap())?.screen==='play';await key('Tab',160);const mapOn=(await snap())?.map===true;await key('Tab',160);const mapOff=(await snap())?.map===false;await assert('pauseTab',paused&&playing&&mapOn&&mapOff,await snap(),{paused,playing,mapOn,mapOff});
  await assert('enterCarSpawn',await enterCar(),await snap());
  // FIX 2 TRAP: building x3865-3943 y2545-2623; park facing west, cy in [2638,2652], cx in [3908,3932]
  await driveTo(4018,2645,{radius:30,timeout:90000});await creepTo(4018,2645,{axis:'y'});
  let trapOK=false;const attempts=[];
  const parks=[[3920,2645],[3912,2642],[3928,2648],[3916,2645],[3924,2641],[3908,2649]];
  for(let i=0;i<parks.length;i++){const [tx,ty]=parks[i];await turnTo(4.71);await driveTo(tx,ty,{radius:16,timeout:60000});await creepTo(tx,ty,{});const ex=await read('window.__exit?.()');const cs=await snap();attempts.push({park:[tx,ty],car:cs?.driving,exit:ex});await logEvent('fix2-attempt',{attempt:i+1,exit:ex,snapshot:cs});if(ex?.exitInB){trapOK=true;break;}await driveTo(4018,2645,{radius:24,timeout:30000});}
  if(trapOK){const p0=await snap();await exitCar();const out0=await snap();await hold(['KeyA'],600);const after=await snap();const moved=Math.hypot(after.px-(out0?.px??0),after.py-(out0?.py??0));trapOK=out0?.pInB===false&&moved>20;await logEvent('fix2-exit',{before:p0,afterOut:out0,afterWalk:after,moved});}
  await assert('fix2Trap',trapOK,await snap(),{attempts});
  // NORMAL EXIT on open ground
  if(!(await snap())?.driving)await enterCar();
  await driveTo(4300,2900,{radius:40,timeout:120000});const n0=await snap();await exitCar();const n1=await snap();const nd=n0?.driving?Math.hypot(n1.px-n0.driving.x,n1.py-n0.driving.y):-1;
  await assert('normalExit',!n1?.driving&&n1?.pInB===false&&nd>=24&&nd<=44,n1,{dist:nd,before:n0});
  // WEDGE REGRESSION: west face of building x3745-3823 y2305-2383
  if(!(await snap())?.driving)await enterCar();
  await driveTo(3700,2340,{radius:35,timeout:120000});await turnTo(Math.PI/2);await hold(['KeyW'],1200);const wc0=await snap();await hold(['KeyW'],600);const wc1=await snap();const wedged=!!wc1?.driving&&Math.hypot(wc1.driving.x-wc0.driving.x,wc1.driving.y-wc0.driving.y)<2;await hold(['KeyS'],800);const wc2=await snap();const escD=wc2?.driving?Math.hypot(wc2.driving.x-wc1.driving.x,wc2.driving.y-wc1.driving.y):0;
  await assert('wedge',wedged&&escD>40,wc2,{wedged,escapeDist:escD,contact:wc1});
  // M1 HOMECOMING RUN completion
  await driveTo(4050,1700,{radius:60,timeout:180000});const m1s=await waitFor(q=>q.money>=800,8000,'M1 money');
  await assert('m1',!!m1s,m1s||await snap());
 } else if(phase==='wR'){
  let s=await startGame(false);
  if(!s||s.money<800){await walkGrid(4050,1700,{finalRadius:40});s=await waitFor(q=>q.money>=800,20000,'M1 on foot');await assert('m1rebuild',!!s,s||await snap());}
  s=await waitFor(q=>q.mState==='active'&&q.mIdx===1,20000,'FIRST WHEELS active');await skipDialogue();s=await snap();
  const base={crews:s.crews?.length,members:s.crews?.reduce((n,c)=>n+c.n,0),sportNear:s.sportNear,carAt:s.carAt};
  await assert('baseline',base.crews===1&&base.members===2&&base.sportNear>=1,s,{base});
  for(let cycle=1;cycle<=2;cycle++){
   s=await snap();if(s?.driving)await exitCar();
   await walkGrid(650,760,{finalRadius:25});
   const f=await waitFor(q=>q.failed,120000,'watcher fail '+cycle);await assert('fail'+cycle,!!f,f||await snap());
   if(f){await key('Enter',250);await waitFor(q=>q.mState==='active'&&q.mIdx===1,25000,'retry active '+cycle);await skipDialogue();s=await snap();
    await assert('cleanup'+cycle,s.crews.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2&&s.sportNear===base.sportNear,s,{base});}
  }
  let done=false;
  for(let attempt=0;attempt<4&&!done;attempt++){
   s=await snap();if(s.failed){await key('Enter',250);await waitFor(q=>q.mState==='active',25000,'completion retry');await skipDialogue();s=await snap();await assert('cleanupCompletion'+attempt,s.crews.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2,s);}
   const goal=(await snap())?.carAt;if(!goal){await logEvent('m2-no-carAt',{snapshot:s});break;}
   s=await snap();
   let swapped=!!(s?.driving&&Math.hypot(s.driving.x-goal.x,s.driving.y-goal.y)<15);
   if(!swapped){
    if(s?.driving)await exitCar();
    await walkGrid(goal.x,goal.y,{finalRadius:16});
    for(let i=0;i<6;i++){await walkTo(goal.x,goal.y,{radius:13,timeout:20000});await key('KeyE',200);await delay(350);s=await snap();if(s?.dlg){await skipDialogue();s=await snap();}if(s?.driving&&Math.hypot(s.driving.x-goal.x,s.driving.y-goal.y)<15){swapped=true;break;}if(s?.driving){await exitCar();}}
   }
   await logEvent('m2-swap',{swapped,goal,snapshot:await snap()});
   if(swapped){await driveGrid(4050,1700,{finalRadius:70});const ps=await waitFor(q=>q.money>=1400,8000,'M2 money');if(ps){await assert('m2',true,ps);done=true;}}
   if(!done)await logEvent('m2-attempt-failed',{attempt,snapshot:await snap()});
  }
  if(!verdict.m2)await assert('m2',false,await snap());
 } else if(phase==='wR2'){
  let s=await startGame(false);
  if(s.mState==='available'){await walkGrid(4050,1700,{finalRadius:40});}
  s=await waitFor(q=>q.mState==='active'&&q.mIdx===1,25000,'FIRST WHEELS active');await skipDialogue();s=await snap();
  await assert('baseline',s.crews?.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2&&s.sportNear>=1,s);
  let done=false;
  for(let attempt=0;attempt<3&&!done;attempt++){
   s=await snap();if(s.failed){await key('Enter',250);await waitFor(q=>q.mState==='active',25000,'completion retry');await skipDialogue();s=await snap();await assert('cleanupR2_'+attempt,s.crews.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2,s);}
   const goal=(await snap())?.carAt;if(!goal){await logEvent('m2-no-carAt',{snapshot:s});break;}
   s=await snap();
   let swapped=!!(s?.driving&&Math.hypot(s.driving.x-goal.x,s.driving.y-goal.y)<15);
   if(!swapped){
    if(s?.driving)await exitCar();
    await walkGrid(goal.x,goal.y,{finalRadius:16});
    for(let i=0;i<6;i++){await walkTo(goal.x,goal.y,{radius:13,timeout:20000});await key('KeyE',200);await delay(350);s=await snap();if(s?.dlg){await skipDialogue();s=await snap();}if(s?.driving&&Math.hypot(s.driving.x-goal.x,s.driving.y-goal.y)<15){swapped=true;break;}if(s?.driving){await exitCar();}}
   }
   await logEvent('m2-swap',{swapped,goal,snapshot:await snap()});
   if(swapped){
    await driveTo(635,2520,{radius:35,timeout:300000});
    await driveTo(4320,2520,{radius:35,timeout:300000});
    await driveTo(4320,1620,{radius:35,timeout:300000});
    await driveTo(4050,1700,{radius:70,timeout:180000});
    const ps=await waitFor(q=>q.money>=1400,8000,'M2 money');if(ps){await assert('m2',true,ps);done=true;}
   }
   if(!done)await logEvent('m2-attempt-failed',{attempt,snapshot:await snap()});
  }
  if(!verdict.m2)await assert('m2',false,await snap());
 } else if(phase==='wR3'){
  let s=await startGame(false);
  if(s.mState==='available'){await walkGrid(4050,1700,{finalRadius:40});}
  s=await waitFor(q=>q.mState==='active'&&q.mIdx===1,25000,'FIRST WHEELS active');await skipDialogue();s=await snap();
  await assert('baseline',s.crews?.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2&&s.sportNear>=1,s);
  let done=false;
  for(let attempt=0;attempt<2&&!done;attempt++){
   s=await snap();if(s.failed){await key('Enter',250);await waitFor(q=>q.mState==='active',25000,'completion retry');await skipDialogue();s=await snap();await assert('cleanupR3_'+attempt,s.crews.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2,s);}
   const goal=(await snap())?.carAt;if(!goal){await logEvent('m2-no-carAt',{snapshot:s});break;}
   s=await snap();
   let swapped=!!(s?.driving&&Math.hypot(s.driving.x-goal.x,s.driving.y-goal.y)<15);
   if(!swapped){
    if(s?.driving)await exitCar();
    await walkGrid(goal.x,goal.y,{finalRadius:16});
    for(let i=0;i<6;i++){await walkTo(goal.x,goal.y,{radius:13,timeout:20000});await key('KeyE',200);await delay(350);s=await snap();if(s?.dlg){await skipDialogue();s=await snap();}if(s?.driving&&Math.hypot(s.driving.x-goal.x,s.driving.y-goal.y)<15){swapped=true;break;}if(s?.driving){await exitCar();}}
   }
   await logEvent('m2-swap',{swapped,goal,snapshot:await snap()});
   if(swapped){
    for(const [hx,hy] of [[635,2520],[1200,2520],[1800,2520],[2400,2520],[3000,2520],[3600,2520],[4200,2520],[4320,2100],[4320,1620],[4050,1700]]){
     const rr=hy===1700?70:40;await driveTo(hx,hy,{radius:rr,timeout:150000});const q=await snap();if(q?.failed)break;if(q?.money>=1400)break;
    }
    const ps=await waitFor(q=>q.money>=1400,8000,'M2 money');if(ps){await assert('m2',true,ps);done=true;}
   }
   if(!done)await logEvent('m2-attempt-failed',{attempt,snapshot:await snap()});
  }
  if(!verdict.m2)await assert('m2',false,await snap());
 } else if(phase==='wR4'){
  let s=await startGame(false);
  if(s.mState==='available'){await walkGrid(4050,1700,{finalRadius:40});}
  s=await waitFor(q=>q.mState==='active'&&q.mIdx===1,25000,'FIRST WHEELS active');await skipDialogue();s=await snap();
  await assert('baseline',s.crews?.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2&&s.sportNear>=1,s);
  const FULLHOPS=[[635,2520],[1200,2520],[1800,2520],[2400,2520],[3000,2520],[3600,2520],[4200,2520],[4320,2100],[4320,1620],[4020,1620],[4050,1700]];
  const TAILHOPS=[[4320,1620],[4020,1620],[4050,1700]];
  let done=false;
  for(let attempt=0;attempt<3&&!done;attempt++){
   s=await snap();if(s.failed){await key('Enter',250);await waitFor(q=>q.mState==='active',25000,'completion retry');await skipDialogue();s=await snap();await assert('cleanupR4_'+attempt,s.crews.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2,s);}
   const goal=(await snap())?.carAt;if(!goal){await logEvent('m2-no-carAt',{snapshot:s});break;}
   s=await snap();
   let swapped=!!(s?.driving&&Math.hypot(s.driving.x-goal.x,s.driving.y-goal.y)<15);
   if(!swapped){
    if(s?.driving)await exitCar();
    await walkGrid(goal.x,goal.y,{finalRadius:16});
    for(let i=0;i<6;i++){await walkTo(goal.x,goal.y,{radius:13,timeout:20000});await key('KeyE',200);await delay(350);s=await snap();if(s?.dlg){await skipDialogue();s=await snap();}if(s?.driving&&Math.hypot(s.driving.x-goal.x,s.driving.y-goal.y)<15){swapped=true;break;}if(s?.driving){await exitCar();}}
   }
   await logEvent('m2-swap',{swapped,goal,snapshot:await snap()});
   if(swapped){
    const cur=await snap();const hops=(cur?.driving&&cur.driving.x>3000)?TAILHOPS:FULLHOPS;
    for(const [hx,hy] of hops){const rr=hy===1700?70:40;await driveTo(hx,hy,{radius:rr,timeout:150000});const q=await snap();if(q?.failed||q?.money>=1400)break;}
    const ps=await waitFor(q=>q.money>=1400,8000,'M2 money');if(ps){await assert('m2',true,ps);done=true;}
   }
   if(!done)await logEvent('m2-attempt-failed',{attempt,snapshot:await snap()});
  }
  if(!verdict.m2)await assert('m2',false,await snap());
 } else if(phase==='w2'){
  let s=await startGame(false);
  if(s.mState==='available'){await enterCar();await driveGrid(4050,1700,{finalRadius:60});}
  s=await waitFor(q=>q.mState==='active'&&q.mIdx===1,20000,'FIRST WHEELS active');await skipDialogue();s=await snap();
  const base={crews:s.crews?.length,members:s.crews?.reduce((n,c)=>n+c.n,0),sportNear:s.sportNear,carAt:s.carAt};
  await assert('baseline',base.crews===1&&base.members===2&&base.sportNear>=1,s,{base});
  for(let cycle=1;cycle<=2;cycle++){
   s=await snap();if(s?.driving)await exitCar();
   await walkGrid(650,760,{finalRadius:25});
   const f=await waitFor(q=>q.failed,120000,'watcher fail '+cycle);await assert('fail'+cycle,!!f,f||await snap());
   if(f){await key('Enter',250);await waitFor(q=>q.mState==='active'&&q.mIdx===1,25000,'retry active '+cycle);await skipDialogue();s=await snap();
    await assert('cleanup'+cycle,s.crews.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2&&s.sportNear===base.sportNear,s,{base});}
  }
  let done=false;
  for(let attempt=0;attempt<4&&!done;attempt++){
   s=await snap();if(s.failed){await delay(3200);await key('Enter',250);await waitFor(q=>q.mState==='active',25000,'completion retry');await skipDialogue();s=await snap();await assert('cleanupCompletion'+attempt,s.crews.length===1&&s.crews.reduce((n,c)=>n+c.n,0)===2,s);}
   const goal=(await snap())?.carAt;if(!goal){await logEvent('m2-no-carAt',{snapshot:s});break;}
   s=await snap();if(s?.driving)await exitCar();
   await walkGrid(goal.x,goal.y,{finalRadius:16});
   let swapped=false;for(let i=0;i<6;i++){await walkTo(goal.x,goal.y,{radius:13,timeout:20000});await key('KeyE',200);await delay(350);s=await snap();if(s?.dlg){await skipDialogue();s=await snap();}if(s?.driving&&Math.hypot(s.driving.x-goal.x,s.driving.y-goal.y)<15){swapped=true;break;}if(s?.driving){await exitCar();}}
   await logEvent('m2-swap',{swapped,goal,snapshot:await snap()});
   if(swapped){await driveGrid(4050,1700,{finalRadius:70});const ps=await waitFor(q=>q.money>=1400,8000,'M2 money');if(ps){await assert('m2',true,ps);done=true;}}
   if(!done)await logEvent('m2-attempt-failed',{attempt,snapshot:await snap()});
  }
  if(!verdict.m2)await assert('m2',false,await snap());
 } else if(phase==='w3'){
  let s=await startGame(false);
  await assert('precondition',s.money===1400&&s.mIdx===1,s);
  await walkGrid(650,1940,{finalRadius:40});
  s=await waitFor(q=>q.mState==='active'&&q.mIdx===2,20000,'BEACH RUN active');await skipDialogue();
  await walkTo(650,1940,{radius:25,timeout:30000});await waitFor(q=>q.pkgs>=1,10000,'package 1');
  await call('Page.reload',{ignoreCache:true});await delay(2500);s=await snap();if(s?.screen==='title'){await key('Enter',250);await delay(800);}await skipDialogue();s=await snap();
  await assert('saveLoad',s.money===1400&&s.mIdx===1,s,{money:s.money,mIdx:s.mIdx});
  await walkGrid(650,1940,{finalRadius:40});
  s=await waitFor(q=>q.mState==='active'&&q.mIdx===2,20000,'BEACH RUN re-active');await skipDialogue();
  const legs=[];for(const [x,y,n] of [[650,1940,1],[650,2240,2],[650,2510,3]]){const t=Date.now();await walkTo(x,y,{radius:25,timeout:40000});await waitFor(q=>q.pkgs>=n||q.mState!=='active',8000,'package '+n);legs.push(Date.now()-t);await logEvent('package-leg',{n,ms:legs.at(-1),snapshot:await snap()});}
  s=await snap();await assert('m3',s.money>1400,s,{legs,money:s.money});
 } else if(phase==='w4'){
  let s=await startGame(false);const money0=s.money;
  await enterCar();await driveGrid(2350,2320,{finalRadius:55});
  s=await waitFor(q=>q.mState==='active'&&q.mIdx===3,20000,'HEAVY METAL active');await skipDialogue();s=await snap();
  await assert('m4Start',!!s?.truck&&s.salas===3,s);
  let done=false;
  for(let attempt=0;attempt<3&&!done;attempt++){
   s=await snap();if(s.failed){await key('Enter',250);await waitFor(q=>q.mState==='active'&&q.mIdx===3,20000,'M4 retry');await skipDialogue();s=await snap();await assert('m4Cleanup'+attempt,!!s.truck&&s.salas===3,s);}
   const chaseEnd=Date.now()+150000;let stopped=false;
   while(Date.now()<chaseEnd){s=await snap();if(!s?.truck||s.failed)break;if(s.truck.sp===0&&s.truck.dmg>=.36){stopped=true;break;}if(!s.driving){await enterCar();s=await snap();if(!s?.driving)break;}await driveTo(s.truck.x,s.truck.y,{radius:30,timeout:15000});}
   await logEvent('m4-chase',{attempt,stopped,snapshot:await snap()});
   s=await snap();
   if(stopped&&s.truck&&!s.truck.looted){await exitCar();await walkTo(s.truck.x,s.truck.y,{radius:50,timeout:60000});await waitFor(q=>q.truck?.looted,30000,'truck looted');}
   s=await snap();
   if(s?.truck?.looted){if(!s.driving)await enterCar();await driveGrid(1200,1200,{finalRadius:80});await driveGrid(3500,900,{finalRadius:80});await waitFor(q=>q.heat===0,240000,'heat clear');}
   s=await snap();if(s.money>=money0+1500){await assert('m4',true,s,{money0});done=true;}
   else await logEvent('m4-attempt-failed',{attempt,snapshot:s});
  }
  if(!verdict.m4)await assert('m4',false,await snap(),{money0});
 } else if(phase==='w5'){
  let s=await startGame(false);const money0=s.money;
  await enterCar();await driveGrid(650,2100,{finalRadius:60});
  s=await waitFor(q=>q.mState==='active'&&q.mIdx===4,20000,'SET UP active');await skipDialogue();
  const progress={ambushStarted:!!s,kills:0,waveReached:0,chaseReached:false};
  let done=false;
  for(let attempt=0;attempt<3&&!done;attempt++){
   s=await snap();if(s.failed){await key('Enter',250);await waitFor(q=>q.mState==='active'&&q.mIdx===4,20000,'M5 retry');await skipDialogue();s=await snap();const near=s.crews.filter(c=>c.members.some(m=>Math.hypot(m.x-650,m.y-2100)<500));await assert('m5Cleanup'+attempt,near.length===1&&near[0].n===3,s);}
   const combatEnd=Date.now()+300000;let prevAlive=null;
   while(Date.now()<combatEnd){s=await snap();if(!s||s.failed||s.phase!=='ambush')break;progress.waveReached=Math.max(progress.waveReached,s.wave||0);
    const members=s.crews.flatMap(c=>c.members).filter(m=>Math.hypot(m.x-650,m.y-2100)<600);
    const alive=members.filter(m=>m.hp>0);
    if(prevAlive!==null&&alive.length<prevAlive)progress.kills+=prevAlive-alive.length;
    prevAlive=alive.length;
    if(!alive.length){await delay(300);continue;}
    const target=alive.sort((a,b)=>Math.hypot(a.x-s.px,a.y-s.py)-Math.hypot(b.x-s.px,b.y-s.py))[0];
    const td=Math.hypot(target.x-s.px,target.y-s.py);
    if(s.hp<40){await walkTo(650,1780,{radius:50,timeout:15000});await delay(2500);continue;}
    if(td>320){await walkTo(target.x,target.y,{radius:280,timeout:10000});s=await snap();}
    if(s.ammo&&s.ammo.mag===0&&!s.ammo.reload){await key('KeyR',120);await delay(1100);s=await snap();}
    const cam=s.cam||{x:s.px,y:s.py};
    await click(640+(target.x-cam.x),400+(target.y-cam.y),60);await delay(350);
   }
   await logEvent('m5-ambush-progress',{attempt,progress,snapshot:await snap()});
   s=await snap();
   if(s?.phase==='chase'){progress.chaseReached=true;
    if(!s.driving)await enterCar();
    const chaseEnd=Date.now()+180000;
    while(Date.now()<chaseEnd){s=await snap();if(!s||s.failed)break;if(s.mState!=='active'){break;}if(s.flee){if(!s.driving)await enterCar();await driveTo(s.flee.x,s.flee.y,{radius:35,timeout:20000});}else await delay(300);}
    s=await snap();if(s&&!s.failed&&s.mState!=='active'){await assert('m5',true,s,{progress});done=true;}
   }
   if(!done)await logEvent('m5-attempt-failed',{attempt,progress,snapshot:await snap()});
  }
  if(!verdict.m5)await assert('m5',false,await snap(),{progress,money0});
  s=await snap();
  if(verdict.m5?.result==='PASS'){await enterCar();await driveGrid(4050,2190,{finalRadius:55});s=await waitFor(q=>q.mState==='active'&&q.mIdx===5,20000,'SUNSET GETAWAY active');await skipDialogue();const mBefore=(await snap())?.money;await driveTo(4300,2470,{radius:80,timeout:300000});s=await snap();await assert('m6',!!s&&(s.ended||s.money>=mBefore+2500),s,{moneyBefore:mBefore});}
 }
} catch(e){events.push({t:Date.now()-began,event:'fatal',error:String(e),stack:e.stack});verdict.fatal={result:'FAIL',error:String(e),snapshot:await snap().catch(()=>null)};}
finally {await releaseAll().catch(()=>{});await save();ws?.close();chrome.kill('SIGTERM');}
console.log(JSON.stringify({phase,verdict:{...verdict,consoleErrors:errors.length},log},null,2));
