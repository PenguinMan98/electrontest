const electron = require('electron');
const Gun = require('gun');
const { app, BrowserWindow, ipcMain } = electron;
const gun = new Gun('https://gun-gfcvuhvicq.now.sh');

app.on('ready', function(){
  const mainWindow = new BrowserWindow({});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
});

/* ipcMain.on / mainWindow.webContents.send */
ipcMain.on('hole:click',function(event,data){
  console.log('hole clicked', data);
});
