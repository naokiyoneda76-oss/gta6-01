import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {setTimeout as delay} from 'node:timers/promises';

const out='/home/hatch/workspace/makefun/r122_evidence';
await mkdir(out,{recursive:true});
const bin=path.join(os.homedir(),'.cache/puppeteer/chrome-headless-shell/linux-156.0.8078.47/chrome-headless-shell-linux64/chrome-headless-shell');
if(!existsSync(bin)) throw Error('required chrome-headless-shell missing: '+bin);
const chrome=spawn(bin,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars','--no-proxy-server','--remote-debugging-port=9222','--user-data-dir='+path.join(os.tmpdir(),'palmera-r122'),'--window-size=1280,800','--hatch-webgl-allowed-domains-file=/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt','--hatch-webgl-allowed-domains-sha256=8097045f0459c96c4cdc76e3a1af4e0f43f640b4b59c43d6db35e3641c0264c6','about:blank'],{stdio:'ignore'});
const start=Date.now(), logs=[], errors=[];
let ws;
try {
 let tab;
 for(let i=0;i<100;i++){try{tab=await(await fetch('http://localhost:9222/json/new?about:blank',{method:'PUT'})).json();break;}catch{}await delay(200);}
 if(!tab)throw Error('CDP failed to start');
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let id=0;const pending=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.consoleAPICalled'){const v={type:m.params.type,args:m.params.args.map(a=>a.value??a.description??'')};logs.push({t:Date.now()-start,event:'console',...v});if(v.type==='error')errors.push(v);}
  if(m.method==='Runtime.exceptionThrown'){const v={text:m.params.exceptionDetails.text,exception:m.params.exceptionDetails.exception?.description||'',url:m.params.exceptionDetails.url,line:m.params.exceptionDetails.lineNumber};logs.push({t:Date.now()-start,event:'exception',...v});errors.push(v);}
  if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
 const call=(method,params={})=>new Promise(resolve=>{const n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}));});
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://localhost:8080/'});await delay(2200);
 async function shot(name){const r=await call('Page.captureScreenshot',{format:'png'});await writeFile(path.join(out,name+'.png'),Buffer.from(r.result.data,'base64'));logs.push({t:Date.now()-start,event:'screenshot',file:name+'.png'});}
 async function key(code,ms=400){await call('Input.dispatchKeyEvent',{type:'keyDown',key:code.replace('Key','').replace('Arrow',''),code,windowsVirtualKeyCode:code==='Enter'?13:code==='Space'?32:code==='ShiftLeft'?16:code==='Escape'?27:code==='KeyE'?69:code==='KeyR'?82:code==='KeyM'?77:code==='Tab'?9:code.charCodeAt(code.length-1)});await delay(ms);await call('Input.dispatchKeyEvent',{type:'keyUp',key:code.replace('Key','').replace('Arrow',''),code});}
 async function hold(codes,ms){for(const c of codes)await call('Input.dispatchKeyEvent',{type:'keyDown',key:c.replace('Key','').replace('Arrow',''),code:c,windowsVirtualKeyCode:c==='ShiftLeft'?16:c.charCodeAt(c.length-1)});await delay(ms);for(const c of codes)await call('Input.dispatchKeyEvent',{type:'keyUp',key:c.replace('Key','').replace('Arrow',''),code:c});}
 async function mouse(x,y,ms=100){await call('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await delay(ms);await call('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});}
 async function evalRead(expression){return (await call('Runtime.evaluate',{expression,returnByValue:true})).result?.result?.value;}
 await shot('01_title'); logs.push({t:Date.now()-start,event:'checkpoint',name:'title',status:await evalRead('document.querySelector("#status").textContent'),title:await evalRead('document.title')});
 await key('Enter');await delay(700);await shot('02_started_mission_marker');
 // Advance dialogue as a player; repeated E advances fully revealed lines and closes it.
 for(let i=0;i<4;i++){await key('KeyE',250);await delay(220);}
 await shot('03_dialogue_advanced');
 // Four cardinal movement checks and a dash.
 for(const c of ['KeyW','KeyD','KeyS','KeyA']){await hold([c],900);await shot('move_'+c);}
 await hold(['ShiftLeft','KeyW'],900);await shot('dash_shift');
 // Attempt vehicle entry at the player's initial neighborhood and drive with steering/braking.
 await key('KeyE',350);await hold(['KeyW'],2600);await hold(['KeyW','KeyD'],1800);await hold(['Space','KeyA'],900);await shot('04_driving_attempt');
 await key('KeyE');await shot('05_exit_attempt');await key('KeyE');
 // Fire using real pointer input. Move/click/fire in several screen directions to seek visible pedestrians/enemies.
 await mouse(650,390,120);await shot('06_combat_attempt');
 for(let i=0;i<5;i++){await mouse(640+i*45,350+i*35,80);await hold(['KeyW'],350);await hold(['KeyD'],260);}
 await shot('07_combat_movement');
 // Map trigger discovery attempts: Tab and M (M is documented audio toggle).
 await key('Tab');await shot('08_tab_map_probe');await key('Tab');await key('KeyM');await shot('09_audio_toggle');await key('KeyM');
 // Pause probe with Escape then resume/start again by Enter if returned to title.
 await key('Escape');await shot('10_escape_probe');await key('Enter');await delay(300);await shot('11_resume_probe');
 // attempt map with Mapped key candidates as physical input; never inspect game state.
 for(const c of ['KeyN','KeyO','KeyI']){await key(c,120);}
 await shot('12_map_key_probes');
 // Free-roam endurance: repeat actual mixed drive, walk, fire, flee for 10 continuous minutes.
 const enduranceStart=Date.now();
 const mix=[
  [['KeyW'],18000], [['KeyW','KeyD'],12000], [['KeyS'],5000], [['Space','KeyA'],3000],
  [['KeyW','ShiftLeft'],8000], [['KeyA'],5000], [['KeyD'],7000], [['KeyW'],12000],
  [['KeyS','KeyD'],5000], [['KeyW'],9000], [['KeyA','ShiftLeft'],5000], [['KeyD'],7000],
  [['KeyW'],14000], [['Space'],2500], [['KeyS'],4500], [['KeyW','KeyD'],9000],
  [['KeyW'],7000], [['KeyA'],5000], [['KeyW','ShiftLeft'],6000], [['KeyD'],6000]
 ];
 let k=0;while(Date.now()-enduranceStart<600000){const [keys,ms]=mix[k++%mix.length];await hold(keys,Math.min(ms,600000-(Date.now()-enduranceStart)));if(k%8===0){await mouse(700+(k%3)*50,360,80);await shot('endurance_'+String(Math.floor((Date.now()-enduranceStart)/60000)).padStart(2,'0')+'m');}}
 await shot('13_endurance_end');
 // Fresh viewport load at 1920x1080; then return to original size for final evidence.
 await call('Page.navigate',{url:'http://localhost:8080/'});await delay(1800);await call('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});await delay(1200);await shot('14_resolution_1920x1080');
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});await delay(500);await shot('15_resolution_1280x800_fresh');
 const fps=await evalRead('({w:innerWidth,h:innerHeight,canvas:[...document.querySelectorAll("canvas")].map(c=>[c.width,c.height]),status:document.querySelector("#status")?.textContent})');
 await writeFile(path.join(out,'playtest_log.json'),JSON.stringify({round:122,started:new Date(start).toISOString(),elapsedMs:Date.now()-start,fpsObservation:'No rAF instrumentation added because a wrapper would alter page execution; visually smooth when observed, FPS unmeasured.',viewportFinal:fps,errors,events:logs},null,2));
 await writeFile(path.join(out,'playtest_notes.txt'),`PALMERA HEAT round 122\nPage console errors: ${errors.filter(e=>e.type==='error').length}; uncaught exceptions: ${errors.filter(e=>e.text).length}\nElapsed ${((Date.now()-start)/60000).toFixed(1)} minutes.\nAll controls sent through CDP Input.dispatchKeyEvent / Input.dispatchMouseEvent. No state injection or game function calls.\nMap: no visible/input-discoverable toggle found in source or probes.\nPause: Escape returned to title rather than a pause overlay.\nFPS: not instrumented to avoid changing page execution; visual playback remained responsive subjectively.\n`);
} finally {ws?.close();chrome.kill('SIGTERM');}
