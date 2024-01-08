const electron = require('electron')
const checkInternetConnection = require('./utils/helpers/checkNetwork.js')
const dotenv = require('dotenv')

const path = require('path')
const fs = require('fs')
const https = require('https')

const isURLValid = require('./utils/helpers/isURLValid.js')

// project setup
  // electron-reloader for fast development
  try {
    require('electron-reloader')(module)
  } catch (error) {
    console.log('- convert ES => commonjs error:  '+error);
  }

  dotenv.config({ path: path.resolve(__dirname,'../','.env')});
//

// variables and functions and configuration
const { app, BrowserWindow, Menu, shell , ipcMain } = electron;

const staticLoadFileUrl = path.join(__dirname,'static','index','index.html')
const staticLoadOfflineUrl = path.join(__dirname,'static','offline','index.html')
const staticLoadLoadingUrl = path.join(__dirname,'static','loading','index.html')
const mainWindowLogoUrl = path.join(__dirname,'assets','images','cf_purple.png')

const WEBSITE = process.env.WEBSITE || 'https://localhost'
const MODE = process.env.MODE || 'DEVELOPMENT'
let window;

// functions
function shouldBlockNewWindow(url) {
  if(!url.include(WEBSITE)){
    return false;  
  }
}

function updateMenu(url) {
  let menuTemplate = [
    {
      label: 'İleri',
      accelerator: 'CmdOrCtrl+Right',
      //icon: path.resolve('src/assets/images/next-icon.png'),
      click: () => {
        if (window && window.webContents.canGoForward()) {
          window.webContents.goForward();
        }
      }
    }
  ]

  // mode selection
  if(MODE === 'DEVELOPMENT'){
    menuTemplate.push({
      label:'devTools',
      click:()=>{
        window.webContents.toggleDevTools()
      }
    })
  }
  
  if(MODE === 'PRODUCTION'){}

  // Eğer URL example.com ise, geri tuşunu menüye ekle
  const fullURL = new URL('/', WEBSITE).toString();
  if (url !== fullURL) {
    
    menuTemplate.push({
      label: 'Geri',
      accelerator: 'CmdOrCtrl+Left',
      //icon: path.resolve('src/assets/images/back-icon.png'),
      click: () => {
        if (window && window.webContents.canGoBack()) {
          window.webContents.goBack();
      }
    }
    });
  }

  menuTemplate.reverse();
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  
}

const windowMain = () => {
    createWindow({
        settings: {
            title:'Çizgiflix',
            width: 1000,
            height: 1800,
            backgroundColor:"#111",
            webPreferences: {
                nodeIntegration: false,
                contextIsolation:false,
                devTools: true,
                preload: path.join(__dirname, 'static','preload.js'),
            },
            frame: true,
            show: false, 
            center: true,
            icon: mainWindowLogoUrl,
        },
        url:WEBSITE
    });
}

const urlView = (url) => {

    if(url && isURLValid(url)){

        const request = https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
  
        response.on('end', () => {
          if (response.statusCode === 200) {
            // ileride buraya loading işlemi yapılabilir aşşağıda file load ediliyor

            window.loadURL(url);
          } else {
            window.loadFile(staticLoadFileUrl);
          }
        });
      });
  
      request.on('error', (error) => {
        window.loadFile(staticLoadFileUrl);
      });
  
      request.end();

    }else{
      window.loadFile(staticLoadFileUrl);
    }
}

const createWindow = async ({ settings , url , windowFullSizeStart = true, }) => { // => burada window objesi üzerinden dönüyo olaylar ilerde instance ile genel bir yönetim yapılabilir.
  window = new BrowserWindow({
    ...settings,
  });

  Menu.setApplicationMenu(null);

  // fullwide window function
  if(windowFullSizeStart){window.maximize()}

  // webview => request the site 
  if(url && windowFullSizeStart){

    // İnternet bağlantısı varsa ana sayfayı yükle, yoksa offline sayfasını yükle
      if(await checkInternetConnection()){
        console.log('- system online')
        urlView(url)
      }else{
        console.log('- system offline')
        urlView('null')
        window.loadFile(staticLoadOfflineUrl);
      }
    //

  }

  // ipcMain two-binding browse and electron
  ipcMain.handle('getInjectScriptContent', async () => {
    try {
      const scriptPath = path.join(__dirname, 'static/extensions/inject-script.js');
      const scriptContent = await fs.promises.readFile(scriptPath, 'utf-8');
      return scriptContent;
    } catch (error) {
      console.error('Inject script içeriği alınamadı:', error);
      throw error;
    }
  });

  // bir navigate işlemi olduğu sırada navigate change özel eventi
  window.webContents.on('will-navigate', async (event, url) => {

    // Kendi domain dışındaki linkleri aç
    const allowedDomain = new URL(WEBSITE).hostname;
    const urlDomain = new URL(url).hostname;

    if (urlDomain !== allowedDomain) {
      console.log('- baska bir domaine yonlendiriliyor:', url);
      event.preventDefault();
      try {
        await shell.openExternal(url);
      } catch (error) {
        console.error('- hata:', error.message);
      }
    }
  });

  window.webContents.on('new-window', (event, url) => {
    if (shouldBlockNewWindow(url)) {
      event.preventDefault();
    }
  });

  window.webContents.on('did-navigate', (event, url) => {
    updateMenu(url);
  });

  // window close function
  window.on('closed', () => {
    window = null;
  });
};

// app initialization , begining
app.on('ready', () => {
    console.log('- project is started');
    windowMain()
    if(window){
      window.loadFile(staticLoadLoadingUrl)
    }
});

app.on('window-all-closed', () => { // => macOS full close 
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
  
app.on('activate', () => { // => macOS full open
    if (BrowserWindow.getAllWindows().length === 0) {
        // Uygulama penceresi kapalıysa, yeni bir pencere oluşturun
        windowMain();
    }
});
