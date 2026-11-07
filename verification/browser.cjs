const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
function executable(){
 if(process.env.WORKSHOP_BROWSER_EXECUTABLE)return process.env.WORKSHOP_BROWSER_EXECUTABLE;
 if(fs.existsSync(chromium.executablePath()))return chromium.executablePath();
 const cache=path.join(os.homedir(),'.cache','ms-playwright');
 if(fs.existsSync(cache))for(const dir of fs.readdirSync(cache).filter(n=>/^chromium-\d+$/.test(n)).sort().reverse()){
  for(const suffix of ['chrome-linux64/chrome','chrome-linux/chrome']){
   const binary=path.join(cache,dir,suffix);if(fs.existsSync(binary))return binary;
  }
 }
 const candidates=[
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
 ];
 for(const c of candidates)if(fs.existsSync(c))return c;
 throw Error('No installed Chromium. Set WORKSHOP_BROWSER_EXECUTABLE or install the Playwright Chromium browser.');
}
module.exports.launch=()=>chromium.launch({headless:true,executablePath:executable(),args:[
 '--no-sandbox','--ignore-gpu-blocklist','--use-angle='+(process.env.WORKSHOP_BROWSER_ANGLE||'gl'),
 ...(process.env.WORKSHOP_BROWSER_ANGLE==='swiftshader'?['--enable-unsafe-swiftshader']:[])
]});
