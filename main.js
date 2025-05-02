import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();


function getBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return process.env.BASE_URL;
  }
  
  try {
    const configPath = path.join(process.resourcesPath || __dirname, 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.BASE_URL;
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
  
  return process.env.BASE_URL || 'http://localhost:8080/api/v1';
}

function createWindow() {
  const baseUrl = getBaseUrl();
  console.log("Loaded BASE_URL in main.js:", baseUrl);
  
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--BASE_URL=${baseUrl}`]
    }
  });
  
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);