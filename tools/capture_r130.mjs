import {spawn} from 'node:child_process';
import {mkdir,writeFile,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import path from 'node:path';
const root=process.cwd(),out='/home/hatch/workspace/makefun/variants_r130'; await mkdir(out,{recursive:true});
const server=spawn('node',['serve.ts'],{cwd:root,stdio:'ignore'}); let chrome,ws;
try {
 let ready=false;for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:8080');ready=true;break}catch{}await delay(200)} if(!ready)throw Error('server did not start');
 const bin='/home/hatch/.cache/puppeteer/chrome-headless-shell/linux-156.0.8078.47/chrome-headless-shell-linux64/chrome-headless-shell';if(!existsSync(bin))throw Error('required Chrome missing');
 chrome=spawn(bin,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars','--no-proxy-server','--remote-debugging-port=9222','--user-data-dir=/tmp/palmera-r130-chrome','--hatch-webgl-allowed-domains-file=/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt','--hatch-webgl-allowed-domains-sha256=8097045f0459c96c4cdc76e3a1af4e0f43f640b4b59c43d6db35e3641c0264c6','about:blank'],{stdio:'ignore'});
 let tab;for(let i=0;i<100;i++){try{tab=await(await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'})).json();break}catch{}await delay(200)}if(!tab)throw Error('Chrome DevTools did not start');
 ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej});let id=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown'||m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}};
 const call=(method,params={})=>new Promise(resolve=>{const n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}))});await call('Runtime.enable');await call('Log.enable');await call('Page.enable');
 async function capture(q,w,h,name){await call('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});await call('Page.navigate',{url:'http://127.0.0.1:8080/'+q});let done=false;for(let i=0;i<150;i++){await delay(200);const v=await call('Runtime.evaluate',{expression:'window.__shotReady===true',returnByValue:true});if(v.result?.result?.value){done=true;break}}if(!done)throw Error('shot timeout '+q);await delay(150);const im=await call('Page.captureScreenshot',{format:'jpeg',quality:92});const bytes=Buffer.from(im.result.data,'base64');await writeFile(path.join(out,name),bytes);console.log(name+': '+bytes.length+' bytes')}
 const q='?shot=marina&seed=1&cover4=1';await capture(q,1280,800,'cover4_1280.jpg');await capture(q,768,480,'cover4_768.jpg');await capture(q,256,160,'cover4_256.jpg');await capture('?shot=marina&seed=1',768,480,'default_tmp.jpg');await capture(q,768,480,'cover4_tmp.jpg');
 const {execFileSync}=await import('node:child_process');execFileSync('python3',['-c',`from PIL import Image
a=Image.open(${JSON.stringify(path.join(out,'default_tmp.jpg'))}).convert('RGB');b=Image.open(${JSON.stringify(path.join(out,'cover4_tmp.jpg'))}).convert('RGB');o=Image.new('RGB',(a.width+b.width,a.height));o.paste(a,(0,0));o.paste(b,(a.width,0));o.save(${JSON.stringify(path.join(out,'ab_cover_130.jpg'))},quality=92)`]);
 await (await import('node:fs/promises')).unlink(path.join(out,'default_tmp.jpg'));await (await import('node:fs/promises')).unlink(path.join(out,'cover4_tmp.jpg'));console.log('ab_cover_130.jpg: LEFT default, RIGHT cover4');console.log('Console errors: '+JSON.stringify(errors));ws.close();
} finally {if(ws)try{ws.close()}catch{} if(chrome)chrome.kill('SIGTERM');server.kill('SIGTERM');await delay(300)}
