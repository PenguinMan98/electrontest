const electron = require('electron');
const Gun = require('gun');
const { app, BrowserWindow, ipcMain } = electron;
const gun = new Gun('https://gun-gfcvuhvicq.now.sh/gun');
//const gun = new Gun();
const fiveMinutes = 1000 * 60 * 5;
const sessionId = getId();
let mainWindow, thisAction;
let holes = [];
let moleId = 1;
console.log('my Session Id: ' + sessionId);

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
  gPlayerList.map( (data, key) => {
    // console.log('player list updates received!', data, key);
    if(key == sessionId){
      mainWindow.webContents.send('myself:update',{'player':data, 'sessionId':key});
    }else{
      mainWindow.webContents.send('player:update',{'player':data, 'sessionId':key});
    }
  });

  // Listen for hole changes
  gHoles.map((value, key)=>{
    holes[key] = value;
    mainWindow.webContents.send('holes:update',{'hole':key,'status' : value.status});
  });
  gMoles.map((value, key)=>{
    // console.log('I got a mole update!',value,key);
    mainWindow.webContents.send('mole:update',{
      'id':key,
      'hole':value.hole,
      'createdBy':value.createdBy});
  });
});

// Do something when a hole is clicked
ipcMain.on('username:put',function(event,data){
  gPlayerList.get(sessionId).put({
    name: data.username,
    lastAction: Date.now(),
    score: 0
  })
});
ipcMain.on('player_list:get',function(event,data){
  gPlayerList.val(function(player_list){
    var i;
    for( i in player_list ){
      gPlayerList.get(i).val(function(player){
        console.log('sending player to be rendered', player);
        if( i == sessionId ){
          mainWindow.webContents.send('myself:update',{'player':player, 'sessionId':i});
        }else{
          mainWindow.webContents.send('player:update',{'player':player, 'sessionId':i});
        }
      });
    }
  });
});
ipcMain.on('hole:click',function(event,data){
  if(typeof holes[data.id] == undefined ){ // If I don't know the hole state,
    gHoles.get(data.id).val(function(data){ // get it
      holes[data.id] = data;
      clickHole(data.id); // then update it
    });
  }else{ // otherwise
    clickHole(data.id); // update it
  }
  //gHoles.get(data.id).put({'bgColor':data.bgColor});
});
ipcMain.on('mole:whacked',function(event,data){
  //console.log('mole whacked', data);
  gMoles.get(data.moleId).val(function(mole){
    console.log('peeking at mole', mole);
    if(mole.fastestTime == 0 || mole.fastestTime < data.myTime){
      mole.fastestTime = data.myTime;
      mole.fastestPlayer = sessionId;
      gMoles.get(data.moleId).put(mole);
    }
  });
});
ipcMain.on('mole:expire',function(event,data){
  console.log('mole expired', data);
  gMoles.get(data.moleId).val(function(mole){
    console.log('Peeking at Mole', mole);
    if(mole.fastestPlayer == sessionId){ // I was fastest!
      // adjust score
      gPlayerList.get(sessionId).val(function(player){
        player.score += 1;
        gPlayerList.get(sessionId).put(player);
      });
    }
    mole.expired = true;
    console.log('mole',mole, data);
    gMoles.get(data.moleId).put(mole);
  });
  // release the hole
  gHoles.get(data.hole).get('status').put('ready');
});

function clickHole( holeId ){
  if(typeof holes[holeId] == "undefined"
    || typeof holes[holeId].state == "undefined"
    || holes[holeId].state == 'ready' ){ // This hole is new or ready.  Create a mole.
    let moleId = getId();
    gHoles.get(holeId).put({
      'state':'mole',
    });
    gMoles.get(moleId).put({
      'playerClicks':{},
      'createdBy':sessionId,
      'hole':holeId,
      'expired':false,
      'fastestTime':0,
      'fastestPlayer':0
    });
  }else if(holes[holeId].state == 'mole'){  // if there is a mole,
    //clickMole(holeId);
  }else{ // if the hole is in any other state,
    console.log('Error, unknown state: ' + holes[holeId].state );
    gHoles.get(holeId).put({  // ready up
      'state':'ready',
    });
  }
}

function getId(){
  return parseInt(Math.random() * 1000000000);
}
