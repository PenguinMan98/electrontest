const electron = require('electron');
const Gun = require('gun');
const { app, BrowserWindow, ipcMain } = electron;
const gun = new Gun('https://gun-gfcvuhvicq.now.sh/gun');
const fiveMinutes = 1000 * 60 * 5;
let mainWindow, thisAction;
let sessionID = parseInt(Math.random() * 1000000000 );

/* ==== GUN Aliases ==== */
let gMoleapp = gun.get('moleapp');
//let gMyself = gMoleapp.get('myself');
let gPlayerList = gMoleapp.get('player_list');
let gGameData = gMoleapp.get('game_data');
let gHoles = gGameData.get('holes');
let gMoles = gGameData.get('moles');

//gPlayerList.put({}); // debug clear player list

/* ==== Main program entry point ==== */
app.on('ready', function(){
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  /* ==== GUN Listeners ==== */
  // Listen for updates to the player_list
  gPlayerList.map().val((value, key)=>{
    console.log('playerList Update', value, key);
    mainWindow.webContents.send('player:update',{
      name: value.name,
      score: value.score,
      playerId: key,
      mySessionId: sessionID
    });
  });
  // Listen for my player
  /*gMyself.on((data, key) => {
    console.log('I got me!', data, key);
    // when I've loaded myself,
    gPlayerList.get(sessionID).put({
      'name': data.name,
      'lastAction': Date.now()
    });

    mainWindow.webContents.send('myself:update',data);
  });*/
  // Listen for hole changes
  gHoles.map((value, key)=>{
    console.log('I got a hole update!',value,key);
    mainWindow.webContents.send('holes:update',{'hole':key,'data' : value});
  });

});

// Do something when my username is set
ipcMain.on('myself:put',function(event,data){
  console.log('Setting Username', data);
  //gMyself.put({'name':data.username});
  gPlayerList.get(sessionID).put({
    'name': data.username,
    'lastAction': Date.now(),
    'score': 0,
    'sessionId': sessionID
  });
});
// Do something when a playerlist is requested
ipcMain.on('playerlist:get',function(event,data){
  console.log('playerlist requested', data);
  gPlayerList.val((data)=>{
    console.log('gPlayerList should be here',data);
  });
});
// Do something when a hole is clicked
ipcMain.on('hole:click',function(event,data){
  console.log('hole clicked', data);
  //gHoles.get(data.id).put({'bgColor':data.bgColor});
});
