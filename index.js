const electron = require('electron');
const Gun = require('gun');
const { app, BrowserWindow, ipcMain } = electron;
const gun = new Gun('https://gun-gfcvuhvicq.now.sh/gun');
const fiveMinutes = 1000 * 60 * 5;
let mainWindow, thisAction;

/* ==== GUN Aliases ==== */
let gMoleapp = gun.get('moleapp');
let gMyself = gMoleapp.get('myself');
let gPlayerList = gMoleapp.get('player_list');
let gGameData = gMoleapp.get('game_data');
let gHoles = gGameData.get('holes');
let gMoles = gGameData.get('moles');

/* ==== Main program entry point ==== */
app.on('ready', function(){
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  /* ==== GUN Listeners ==== */
  // Listen for updates to the player_list
  /*gPlayerList.on( (data, key) => {
    console.log('player list updates received!', data, key);
  });*/
  // Listen for my player
  gMyself.on((data, key) => {
    console.log('I got me!', data, key);

    mainWindow.webContents.send('myself:update',data);
  });
  // Listen for hole changes
  gHoles.map((value, key)=>{
    console.log('I got a hole update!',value,key);
    mainWindow.webContents.send('holes:update',{'hole':key,'data' : value});
  });

});

// Do something when a hole is clicked
ipcMain.on('myself:put',function(event,data){
  console.log('Setting Username', data);
  gMyself.put({'name':data.username, 'thisAction':Date.now()});
});
ipcMain.on('hole:click',function(event,data){
  console.log('hole clicked', data);
  //gHoles.get(data.id).put({'bgColor':data.bgColor});
});
