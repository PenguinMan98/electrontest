const electron = require('electron');
const Gun = require('gun');
const { app, BrowserWindow, ipcMain } = electron;
const gun = new Gun('https://gun-gfcvuhvicq.now.sh/gun');
const fiveMinutes = 1000 * 60 * 5;
let mainWindow;

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
  /*gMyself.on((data, key) => {
    console.log('I got me!', data, key);
    let namePrompt = false;

    if(typeof data.name == 'undefined'){
      // My player doesn't exist. Prompt the user for a name.
      console.log('my player has no name...');
      namePrompt = true;
    }else if( data.thisAction - data.lastAction > fiveMinutes ){
      console.log('my player has expired...');
      namePrompt = true;
    }else{
      gMyself.put({'lastAction':data.thisAction});
    }
    if(namePrompt){
      mainWindow.webContents.send('app:promptForName',{'name':data.name});
    }else{
      mainWindow.webContents.send('myself:update',data);
    }
  });*/
  // Listen for hole changes
  gHoles.map((value, key)=>{
    console.log('I got a hole update!',value,key);
    mainWindow.webContents.send('holes:update',{'hole':key,'data' : value});
  });
  // Put my player
  gMoleapp.get('myself').put({'thisAction':Date.now()});

});

/* ipcMain.on / mainWindow.webContents.send */
// Do something when a hole is clicked
ipcMain.on('hole:click',function(event,data){
  console.log('hole clicked', data);
  gHoles.get(data.id).put({'bgColor':data.bgColor});
});
