import {spawn} from 'node:child_process';
import {spawnSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const shots=JSON.parse(await readFile(path.join(root,'shots.json'),'utf8'));
const server=spawn('node',['serve.ts'],{cwd:root,stdio:'ignore'});let chrome;
try{let ready=false;for(let i=0;i<100;i++){try{await fetch('http://localhost:8080');ready=true;break;}catch{}await delay(200);}if(!ready)throw Error('server did not start');
 let bin=process.env.CHROME_BIN; if(!bin){for(const c of ['google-chrome','google-chrome-stable','chromium','chromium-browser']){try{const r=spawnSync('which',[c],{encoding:'utf8'});if(r.status===0){bin=r.stdout.trim();break;}}catch{}}}if(!bin){for(const p of [path.join(os.homedir(),'.cache/puppeteer/chrome'),path.join(os.homedir(),'.cache/selenium/chrome')])if(existsSync(p)){const {readdir}=await import('node:fs/promises');const walk=async d=>{for(const e of await readdir(d,{withFileTypes:true})){const q=path.join(d,e.name);if(e.isDirectory()){const f=await walk(q);if(f)return f;}else if(e.name==='chrome'&&q.includes('chrome'))return q;}};bin=await walk(p);if(bin)break;}}if(!bin)throw Error('Chrome not found; set CHROME_BIN');
 chrome=spawn(bin,['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9222','--user-data-dir='+path.join(os.tmpdir(),'palmera-chrome'),'about:blank'],{stdio:'ignore'});
 let tab;for(let i=0;i<100;i++){try{const a=await(await fetch('http://localhost:9222/json/new?about:blank',{method:'PUT'})).json();tab=a;break;}catch{}await delay(200);}if(!tab)throw Error('Chrome DevTools did not start');const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};const call=(method,params={})=>new Promise(resolve=>{const n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}));});await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});await mkdir(path.join(root,'screenshots'),{recursive:true});
 for(const s of shots){await call('Page.navigate',{url:'http://localhost:8080/'+s.query});let done=false;for(let i=0;i<150;i++){await delay(200);const v=await call('Runtime.evaluate',{expression:'window.__shotReady===true',returnByValue:true});if(v.result?.result?.value){done=true;break;}}if(!done)throw Error('shot timeout: '+s.name);const img=await call('Page.captureScreenshot',{format:'jpeg',quality:85});const bytes=Buffer.from(img.result.data,'base64');await writeFile(path.join(root,'screenshots',s.name),bytes);console.log(`${s.name}: ${bytes.length} bytes`);}
 ws.close();
}finally{if(chrome)chrome.kill('SIGTERM');server.kill('SIGTERM');}
