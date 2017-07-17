const electron = require('electron');
const Gun = require('gun');
const { app, BrowserWindow, ipcMain } = electron;
const gun = new Gun('https://gun-gfcvuhvicq.now.sh/gun');
//const gun = new Gun();
const fiveMinutes = 1000 * 60 * 5;
const sessionId = getId();
let mainWindow, thisAction;
let holes = [];
let moleId = 0;
var appState = 'enter-user';
console.log('my Session Id: ' + sessionId);

/* ==== GUN Aliases ==== */
let gunSuffix = 5;
let gMoleapp = gun.get('moleapp'+gunSuffix);
let gPlayerList = gMoleapp.get('player_list'+gunSuffix);
let gHoles = gMoleapp.get('holes1'+gunSuffix);
let gMoles = gMoleapp.get('moles1'+gunSuffix);
// reset
//gMoles.put({});
//gPlayerList.put({});


//gPlayerList.put({}); // debug clear player list

/* ==== Main program entry point ==== */
app.on('ready', function(){
  /* Create the mainWindow */
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  /* ==== GUN Listeners ==== */
  // Listen for updates to the player_list
  gPlayerList.map( (data, key) => {
    console.log('player list updates received!', data, key);
    if(key == sessionId){
      mainWindow.webContents.send('myself:update',{'player':data, 'sessionId':key});
      if( appState == 'enter-user'){ appState = 'game'; }
    }else{
      mainWindow.webContents.send('player:update',{'player':data, 'sessionId':key});
    }
  });
  // Listen for hole changes
  gHoles.map((value, key)=>{
    console.log('I got a hole update!',value,key);
    mainWindow.webContents.send('holes:update',{'hole':key,'state' : value.state});
  });
  // Listen for mole changes
  gMoles.map((value, key)=>{
    console.log('I got a mole update!',value,key);
    /*mainWindow.webContents.send('mole:update',{
      'id':key,
      'hole':value.hole,
      'createdBy':value.createdBy});*/
  });
});

// When the user submits their username,
ipcMain.on('username:put',function(event,data){
  createPlayer(data.username);
  requestPlayerList();
});
// Do something when a hole is clicked
ipcMain.on('hole:click',function(event,data){
  console.log('hole clicked', data);
   /*if(typeof holes[data.id] == undefined ){ // If I don't know the hole state,
    gHoles.get(data.id).val(function(data){ // get it
      holes[data.id] = data;
      clickHole(data.id); // then update it
    });
  }else{ // otherwise
    clickHole(data.id); // update it
  }*/
});
ipcMain.on('mole:add',function(event,data){
  console.log('Add a mole', data);
  // create a new mole
  gMoles.get(getId()).put({
    'playerClicks':{},
    'createdBy':sessionId,
    'hole':data.hId,
    'expired':false,
    'fastestTime':0,
    'fastestPlayer':0
  });
  // update the hole state to 'mole'
  gHoles.get(data.hId).get('state').put('mole');
});
ipcMain.on('mole:whacked',function(event,data){
  console.log('mole whacked', data);
  /*gMoles.get(data.moleId).val(function(mole){
    console.log('peeking at mole', mole);
    if(mole.fastestTime == 0 || mole.fastestTime < data.myTime){
      mole.fastestTime = data.myTime;
      mole.fastestPlayer = sessionId;
      gMoles.get(data.moleId).put(mole);
    }
  });*/
});
ipcMain.on('mole:expire',function(event,data){
  console.log('mole expired', data);
  /*gMoles.get(data.moleId).val(function(mole){
    console.log('Peeking at Mole', mole);
    if(!mole.expired){
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
    }
  });
  // release the hole
  gHoles.get(data.hole).get('status').put('ready');*/
});

/*==== Helper Functions ====*/
function createPlayer( username ){
  gPlayerList.get(sessionId).put({
    name: username,
    lastAction: Date.now(),
    score: 0
  });
}
function requestPlayerList(){
  gPlayerList.val().map(function(player, id){
    console.log('Getting Players! I got: '+id+' => ',player);
    if( id == sessionId ){
      mainWindow.webContents.send('myself:update',{'player':player, 'sessionId':id});
    }else{
      mainWindow.webContents.send('player:update',{'player':player, 'sessionId':id});
    }
  });
}

function clickHole( holeId ){
  // record that I made an action
  //gPlayerList.get(sessionId).get('lastAction').put(Date.now());
  console.log('handle a hole click', holeId, holes[holeId]);
  /*if(typeof holes[holeId] == "undefined"
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
    gHoles.get(holeId).get('state').put('ready');
  }else{ // if the hole is in any other state,
    console.log('Error, unknown state: ' + holes[holeId].state );
    gHoles.get(holeId).put({  // ready up
      'state':'ready',
    });
  }*/
}

function getId(){
  return parseInt(Math.random() * 1000000000);
}
