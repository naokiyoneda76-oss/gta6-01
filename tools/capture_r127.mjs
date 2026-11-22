import {spawn} from 'node:child_process';
import {mkdir, writeFile, readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import path from 'node:path';
import os from 'node:os';

const root = process.cwd();
const out = path.resolve(root, '../variants_r127');
await mkdir(out, {recursive:true});
const server = spawn('node', ['serve.ts'], {cwd:root, stdio:'ignore'});
let chrome;
try {
  let ready=false;
  for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:8080');ready=true;break;}catch{}await delay(200);}
  if(!ready) throw Error('server did not start');
  let bin;
  const shellRoot=path.join(os.homedir(),'.cache/puppeteer/chrome-headless-shell');
  for(const version of await readdir(shellRoot)){const c=path.join(shellRoot,version,'chrome-headless-shell-linux64','chrome-headless-shell');if(existsSync(c)){bin=c;break;}}
  if(!bin) throw Error('Puppeteer chrome-headless-shell not found');
  chrome=spawn(bin,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars','--no-proxy-server','--remote-debugging-port=9222','--user-data-dir='+path.join(os.tmpdir(),'palmera-r127-chrome'),'--hatch-webgl-allowed-domains-file=/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt','--hatch-webgl-allowed-domains-sha256=8097045f0459c96c4cdc76e3a1af4e0f43f640b4b59c43d6db35e3641c0264c6','about:blank'],{stdio:'ignore'});
  let tab;
  for(let i=0;i<100;i++){try{tab=await(await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'})).json();break;}catch{}await delay(200);}
  if(!tab)throw Error('Chrome DevTools did not start');
  const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
  let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
  const call=(method,params={})=>new Promise(resolve=>{const n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}));});
  await call('Runtime.enable');await call('Page.enable');
  async function capture(query,w,h,name){
    await call('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
    const url=new URL(query,'http://127.0.0.1:8080/');
    await call('Page.navigate',{url:url.href});let done=false;
    for(let i=0;i<150;i++){await delay(200);const v=await call('Runtime.evaluate',{expression:'window.__shotReady===true',returnByValue:true});if(v.result?.result?.value){done=true;break;}}
    if(!done)throw Error('shot timeout: '+query);
    const img=await call('Page.captureScreenshot',{format:'jpeg',quality:90});
    const bytes=Buffer.from(img.result.data,'base64');await writeFile(path.join(out,name),bytes);console.log(`${name}: ${bytes.length} bytes`);
  }
  await capture('?shot=marina&seed=1&cover3=1',1280,800,'cover3_1280.jpg');
  await capture('?shot=marina&seed=1&cover3=1',768,480,'cover3_768.jpg');
  await capture('?shot=marina&seed=1&cover3=1',256,160,'cover3_256.jpg');
  await capture('?shot=marina&seed=1',768,480,'cover_default_768.jpg');
  await capture('?shot=marina&seed=1',256,160,'cover_default_256.jpg');
  await capture('?shot=marina&seed=1',768,480,'ab_default_tmp.jpg');
  await capture('?shot=marina&seed=1&cover3=1',768,480,'ab_cover3_tmp.jpg');
  const {execFileSync}=await import('node:child_process');
  execFileSync('python3',['-c',`from PIL import Image\na=Image.open(${JSON.stringify(path.join(out,'ab_default_tmp.jpg'))}).convert('RGB')\nb=Image.open(${JSON.stringify(path.join(out,'ab_cover3_tmp.jpg'))}).convert('RGB')\nout=Image.new('RGB',(a.width+b.width,max(a.height,b.height)))\nout.paste(a,(0,0));out.paste(b,(a.width,0));out.save(${JSON.stringify(path.join(out,'ab_cover_127.jpg'))},quality=90)`]);
  await (await import('node:fs/promises')).unlink(path.join(out,'ab_default_tmp.jpg'));
  await (await import('node:fs/promises')).unlink(path.join(out,'ab_cover3_tmp.jpg'));
  console.log('ab_cover_127.jpg: LEFT default, RIGHT cover3');
  ws.close();
} finally {if(chrome)chrome.kill('SIGTERM');server.kill('SIGTERM');await delay(300);}
