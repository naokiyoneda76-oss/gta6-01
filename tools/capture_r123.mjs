import {spawn, spawnSync} from 'node:child_process';
import {mkdir, readFile, writeFile, readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.resolve(root, '../variants_r123');
const shots = JSON.parse(await readFile(path.join(root, 'shots.json'), 'utf8'));
const server = process.env.CAPTURE_SERVER ? null : spawn('node', ['serve.ts'], {cwd: root, stdio: 'ignore'});
let chrome;
const errors = [];
try {
  await mkdir(outputDir, {recursive: true});
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { await fetch('http://127.0.0.1:8080'); ready = true; break; } catch {}
    await delay(200);
  }
  if (!ready) throw Error('server did not start');
  let bin;
  const shellRoot = path.join(os.homedir(), '.cache/puppeteer/chrome-headless-shell');
  if (existsSync(shellRoot)) {
    for (const version of await readdir(shellRoot)) {
      const candidate = path.join(shellRoot, version, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
      if (existsSync(candidate)) { bin = candidate; break; }
    }
  }
  if (!bin) throw Error(`Puppeteer chrome-headless-shell not found under ${shellRoot}`);
  chrome = spawn(bin, ['--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--no-proxy-server', '--remote-debugging-port=9222', '--user-data-dir='+path.join(os.tmpdir(), 'palmera-r123-chrome'), '--hatch-webgl-allowed-domains-file=/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt', '--hatch-webgl-allowed-domains-sha256=8097045f0459c96c4cdc76e3a1af4e0f43f640b4b59c43d6db35e3641c0264c6', 'about:blank'], {stdio: 'ignore'});
  let tab;
  for (let i = 0; i < 100; i++) {
    try { tab = await (await fetch('http://127.0.0.1:9222/json/new?about:blank', {method:'PUT'})).json(); break; } catch {}
    await delay(200);
  }
  if (!tab) throw Error('Chrome DevTools did not start');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') errors.push('PAGE EXCEPTION '+JSON.stringify(msg.params.exceptionDetails));
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push('PAGE CONSOLE ERROR '+JSON.stringify(msg.params.args));
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const call = (method, params={}) => new Promise(resolve => { const n=++id; pending.set(n, resolve); ws.send(JSON.stringify({id:n, method, params})); });
  await call('Runtime.enable'); await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', {width:1280, height:800, deviceScaleFactor:1, mobile:false});
  for (const shot of shots) {
    const url = new URL(shot.query, 'http://127.0.0.1:8080/');
    url.searchParams.set('figures', '2');
    await call('Page.navigate', {url:url.href});
    let done = false;
    for (let i=0; i<150; i++) {
      await delay(200);
      const v = await call('Runtime.evaluate', {expression:'window.__shotReady===true', returnByValue:true});
      if (v.result?.result?.value) { done=true; break; }
    }
    if (!done) {
      const dbg = await call('Runtime.evaluate', {expression:'JSON.stringify({href:location.href,title:document.title,ready:document.readyState})', returnByValue:true});
      throw Error('shot timeout: '+shot.name+' '+JSON.stringify(dbg.result?.result?.value));
    }
    const img = await call('Page.captureScreenshot', {format:'jpeg', quality:85});
    const full = Buffer.from(img.result.data, 'base64');
    const fullPath = path.join(outputDir, shot.name);
    await writeFile(fullPath, full);
    const judge = await call('Page.captureScreenshot', {format:'jpeg', quality:85, clip:{x:0,y:0,width:1280,height:800,scale:.6}});
    const judgeBytes = Buffer.from(judge.result.data, 'base64');
    const judgePath = path.join(outputDir, 'judge_'+shot.name);
    await writeFile(judgePath, judgeBytes);
    console.log(`${fullPath}: ${full.length} bytes`);
    console.log(`${judgePath}: ${judgeBytes.length} bytes`);
  }
  ws.close();
} finally {
  if (chrome) chrome.kill('SIGTERM');
  if (server) server.kill('SIGTERM');
  await delay(300);
  console.log('CAPTURE_PAGE_ERRORS='+JSON.stringify(errors));
}
