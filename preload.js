const { contextBridge } = require('electron');


const baseArg = process.argv.find(arg => arg.startsWith('--base_url='));
const BASE_URL = baseArg ? baseArg.replace('--base_url=', '') : '';
console.log("Parsed BASE_URL in preload.js:", BASE_URL); 

contextBridge.exposeInMainWorld('env', {
  BASE_URL,
});
