import {spawn} from 'node:child_process';
import {mkdir,writeFile,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {setTimeout as delay} from 'node:timers/promises';
const out=path.join(os.homedir(),'workspace/makefun/r143_evidence'); await mkdir(out,{recursive:true});
const log=path.join(out,'smoke2.json'), began=Date.now(), events=[], errors=[], held=new Set();
let verdict={}, ws, chrome, stopping=false;
const save=()=>writeFile(log,JSON.stringify({round:143,started:new Date(began).toISOString(),elapsedMs:Date.now()-began,events,verdict,consoleErrors:errors},null,2));
try {
 const cache=path.join(os.homedir(),'.cache/puppeteer'); let bin;
 for(const v of await readdir(path.join(cache,'chrome-headless-shell')).catch(()=>[])){const d=path.join(cache,'chrome-headless-shell',v,'chrome-headless-shell-linux64');if(existsSync(path.join(d,'chrome-headless-shell'))){bin=path.join(d,'chrome-headless-shell');break;}}
 if(!bin) throw Error('chrome-headless-shell missing');
 const profile=await import('node:fs/promises').then(m=>m.mkdtemp(path.join(os.tmpdir(),'r143-smoke-')));
 const port=9437;
 chrome=spawn(bin,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars','--no-proxy-server',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'--window-size=1280,800','--hatch-webgl-allowed-domains-file=/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt','--hatch-webgl-allowed-domains-sha256=8097045f0459c96c4cdc76e3a1af4e0f43f640b4b59c43d6db35e3641c0264c6','about:blank'],{stdio:'ignore'});
 let tab; for(let i=0;i<100;i++){try{tab=await(await fetch(`http://localhost:${port}/json/new?about:blank`,{method:'PUT'})).json();break;}catch{} await delay(200);} if(!tab)throw Error('CDP failed');
 ws=new WebSocket(tab.webSocketDebuggerUrl); await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;}); let id=0;const pending=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'){const x={type:'console',args:m.params.args.map(a=>a.value??a.description??'')};errors.push(x);events.push({t:Date.now()-began,...x});}if(m.method==='Runtime.exceptionThrown'){const x={type:'exception',text:m.params.exceptionDetails.text,exception:m.params.exceptionDetails.exception?.description||'',url:m.params.exceptionDetails.url,line:m.params.exceptionDetails.lineNumber};errors.push(x);events.push({t:Date.now()-began,...x});}if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);p.resolve(m);}};
 const call=(method,params={})=>new Promise(resolve=>{const n=++id,timer=setTimeout(()=>{if(pending.has(n)){pending.delete(n);events.push({t:Date.now()-began,event:'cdp-timeout',method});resolve({error:'cdp-timeout'});}},10000);pending.set(n,{resolve,timer});ws.send(JSON.stringify({id:n,method,params}));});
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
 const vk={Enter:13,KeyE:69,KeyW:87,KeyA:65,KeyS:83,KeyD:68,ShiftLeft:16};
 async function down(k){if(held.has(k))return;held.add(k);await call('Input.dispatchKeyEvent',{type:'keyDown',key:k==='ShiftLeft'?'Shift':k.slice(-1),code:k,windowsVirtualKeyCode:vk[k]||0});}
 async function up(k){if(!held.has(k))return;held.delete(k);await call('Input.dispatchKeyEvent',{type:'keyUp',key:k==='ShiftLeft'?'Shift':k.slice(-1),code:k,windowsVirtualKeyCode:vk[k]||0});}
 async function release(){for(const k of [...held])await up(k);}
 async function key(k,ms=250){await down(k);await delay(ms);await up(k);}
 async function snap(){const r=await call('Runtime.evaluate',{expression:'window.__compass?.()',returnByValue:true});return r.result?.result?.value;}
 async function note(name,data={}){events.push({t:Date.now()-began,event:name,...data});await save();}
 async function assert(name,ok,s){verdict[name]={result:ok?'PASS':'FAIL',counts:s?.crews?.length===undefined?undefined:{crews:s.crews.length,members:s.crews.reduce((n,c)=>n+c.n,0)},snapshot:s};await note('assert',{name,ok,snapshot:s});return ok;}
 async function waitFor(fn,ms,label){const end=Date.now()+ms;let s;while(Date.now()<end){await delay(200);s=await snap();if(s&&fn(s)){await note('waitFor',{label,ok:true,snapshot:s});return s;}}await note('waitFor',{label,ok:false,snapshot:s});return null;}
 async function walkTo(x,y,radius=30,timeout=60000){const end=Date.now()+timeout;let lastX=null,lastY=null,stallSince=Date.now(),axisMode=0,axisFlip=Date.now();while(Date.now()<end){const s=await snap();if(!s||s.driving)return false;if(Math.hypot(x-s.px,y-s.py)<radius){await release();return true;}if(lastX===null||Math.hypot(s.px-lastX,s.py-lastY)>3){lastX=s.px;lastY=s.py;stallSince=Date.now();}const stalled=Date.now()-stallSince>1500;const dx=x-s.px,dy=y-s.py;let useX=true,useY=true;if(stalled){if(Date.now()-axisFlip>800){axisMode=1-axisMode;axisFlip=Date.now();}useX=axisMode===0;useY=axisMode===1;}for(const [k,on] of [['KeyA',useX&&dx< -4],['KeyD',useX&&dx>4],['KeyS',useY&&dy>4],['KeyW',useY&&dy< -4],['ShiftLeft',true]])on?await down(k):await up(k);await delay(200);}await release();return false;}
 const VX=[535,635,720,1020,1320,1620,1920,2220,2520,2820,3120,3420,3720,4020,4320,4620], HY=[120,420,720,1020,1320,1620,1920,2220,2520,2820,3120,3420];
 const nearest=(v,a)=>a.reduce((x,y)=>Math.abs(y-v)<Math.abs(x-v)?y:x);
 async function walkGrid(x,y){const s0=await snap();if(!s0||s0.driving)return false;const vx=nearest(s0.px,VX),hy=nearest(y,HY),tx=nearest(x,VX);for(const [a,b,r] of [[vx,s0.py,26],[vx,hy,26],[tx,hy,26],[x,y,26]]){const s=await snap();if(!s)return false;const d=Math.hypot(a-s.px,b-s.py);if(d<r+4)continue;const ok=await walkTo(a,b,r,Math.min(240000,Math.max(45000,Math.round(d*450))));await note('walkGrid-leg',{x:a,y:b,ok,snapshot:await snap()});if(!ok)return false;}return true;}
 async function skip(){for(let i=0;i<60;i++){const s=await snap();if(!s?.dialogue?.active)break;await key('KeyE');await delay(350);}await delay(300);return snap();}
 async function nav(){await call('Page.navigate',{url:'http://localhost:8080/'});await delay(2200);}
 await nav();let s=await snap(); verdict.title={screen:s?.screen,consoleErrorCount:errors.length};await assert('title',s?.screen==='title'&&errors.length===0,s);
 if(s?.screen==='title'){await key('Enter');await delay(50);const shown=[];for(let i=0;i<30;i++){const q=await snap();if(q?.dialogue?.active)shown.push(q.dialogue.shown);else if(shown.length)break;await delay(100);}while((await snap())?.dialogue?.active)await key('KeyE');const q=await snap();verdict.item3_typewriter={shown,closed:!q?.dialogue?.active};await note('item3-opening-typewriter',{shown,closed:!q?.dialogue?.active});}await skip();s=await snap();
 if(process.env.R143_A_ONLY!=='1'){
 if(s?.money<800){const walked=await walkGrid(4050,1700);await note('m1-walk',{walked,snapshot:await snap()});s=await waitFor(q=>q.money>=800,30000,'M1 money 800');}
 s=await waitFor(q=>q.mIdx===1&&q.mState==='active',30000,'FIRST WHEELS active');if(s){await skip();s=await snap();}
 const baseMembers=s?.crews?.reduce((n,c)=>n+c.n,0);await assert('baseline',s?.crews?.length===1&&baseMembers===2,s);verdict.baseline.counts={crews:s?.crews?.length,members:baseMembers};await save();
 for(let cycle=1;cycle<=2;cycle++){
  s=await snap();if(s?.driving){await key('KeyE',220);await delay(350);}
  const walked=await walkGrid(650,760);await note(`watcher-walk-${cycle}`,{walked,snapshot:await snap()});
  const failed=await waitFor(q=>q.failed,120000,`watcher fail ${cycle}`);await assert(`fail${cycle}`,!!failed,failed||await snap());
  if(!failed)break;
  await key('Enter');await delay(500);
  s=await waitFor(q=>q.mIdx===1&&q.mState==='active',30000,`retry active ${cycle}`);
  if(s){await skip();s=await snap();}
  const members=s?.crews?.reduce((n,c)=>n+c.n,0);await assert(`cleanup${cycle}`,s?.crews?.length===1&&members===2,s);verdict[`cleanup${cycle}`].counts={crews:s?.crews?.length,members};await save();
 }
 }
 // M5 sharp case: use the live mission director, then walk the final 50 units onto its marker.
 await call('Runtime.evaluate',{expression:'(()=>{const w=window.__compass.game.world;w.missions.index=3;w.missions.state="available";w.missions.available();w.player.x=700;w.player.y=2100})()'});
 const approached=await walkTo(650,2100,20,30000);await note('m5-approach',{approached,snapshot:await snap()});
 s=await waitFor(q=>q.mIdx===4&&q.dialogue.active,10000,'SET UP dialogue start');const trace=[];
 if(s){for(let i=0;i<31;i++){const q=await snap();trace.push(q);await delay(200);}const hpOk=trace.every(q=>q.hp===100),bulletsOk=trace.every(q=>q.gangBullets===0),statesOk=trace.every(q=>q.crews.flatMap(c=>c.members).every(m=>m.state!=='combat')),pos0=trace[0].crews.flatMap(c=>c.members).map(m=>[m.x,m.y]),still=trace.every(q=>JSON.stringify(q.crews.flatMap(c=>c.members).map(m=>[m.x,m.y]))===JSON.stringify(pos0));verdict.scenarioA_dialogue={result:hpOk&&bulletsOk&&statesOk&&still?'PASS':'FAIL',samples:trace.length,minHP:Math.min(...trace.map(q=>q.hp)),gangBulletCounts:[...new Set(trace.map(q=>q.gangBullets))],memberStates:[...new Set(trace.flatMap(q=>q.crews.flatMap(c=>c.members.map(m=>m.state))))],membersStationary:still,first:trace[0],last:trace.at(-1)};await note('scenarioA-dialogue-trace',{trace,verdict:verdict.scenarioA_dialogue});}
 await skip();const tw=trace.slice(0,8).map(q=>q.dialogue.shown);await note('scenarioA-typewriter',{shownCounts:tw});
 const after=await waitFor(q=>q.crews.some(c=>c.members.some(m=>['alert','combat'].includes(m.state))),10000,'ambush alert');const p0=await snap();await down('KeyW');await delay(700);await up('KeyW');const p1=await snap();await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:640,y:400});await call('Input.dispatchMouseEvent',{type:'mousePressed',x:640,y:400,button:'left',buttons:1,clickCount:1});await delay(250);await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:640,y:400,button:'left',buttons:0,clickCount:1});await delay(500);const shotTarget=await snap();verdict.scenarioA_after={alert:!!after,moveDelta:Math.hypot(p1.px-p0.px,p1.py-p0.py),playerBullets:shot.playerBullets,hp:shot.hp,states:shot.crews.flatMap(c=>c.members.map(m=>m.state))};await save();
 await key('Escape');await delay(300);const paused=await snap();await key('Escape');await delay(300);const resumed=await snap();await key('Tab');await delay(300);const mapped=await snap();await key('Escape');await delay(300);const closed=await snap();verdict.regression={paused:paused.screen,resumed:resumed.screen,mapOpen:mapped.showMap,mapClosed:closed.showMap};await save();
} catch(e){verdict.fatal=String(e);events.push({t:Date.now()-began,event:'fatal',error:String(e),stack:e.stack});}
finally{for(const k of [...held]){try{await up(k)}catch{}}await save().catch(()=>{});try{ws?.close();}catch{}if(chrome){chrome.kill('SIGTERM');await delay(500);if(chrome.exitCode===null)chrome.kill('SIGKILL');}}
console.log(JSON.stringify({log,verdict,consoleErrorCount:errors.length},null,2));
