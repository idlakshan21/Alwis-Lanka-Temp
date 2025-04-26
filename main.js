import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


console.log("BASE_URL loaded from .env:", process.env.BASE_URL);

function createWindow() {
  const baseUrl = process.env.BASE_URL; 
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
