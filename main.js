const electron = require('electron')
const { Menu, ipcMain } = electron
const fs = require('graceful-fs');

// Module to control application life.
const app = electron.app

app.commandLine.appendSwitch('--enable-precise-memory-info');

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
/*
// main menu for mac
const template = [
{
    label: 'Deepnest',
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
*/

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
var backgroundWindows = [];

// single instance
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

if (shouldQuit) {
  app.quit()
}

function createMainWindow() {
	
  // Create the browser window.
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  
  var frameless = process.platform == 'darwin';
  //var frameless = true;
  
  mainWindow = new BrowserWindow({width: Math.ceil(width*0.9), height: Math.ceil(height*0.9), frame: !frameless, show: false})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './main/index.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  mainWindow.setMenu(null);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  }) 
}

let winCount = 0;

function createBackgroundWindows() {
	//busyWindows = [];
	// used to have 8, now just 1 background window
	if(winCount < 1){
		var back = new BrowserWindow({
			show: false
		});
		
		//back.webContents.openDevTools();
		
		back.loadURL(url.format({
			pathname: path.join(__dirname, './main/background.html'),
			protocol: 'file:',
			slashes: true
		}));
		
		backgroundWindows[winCount] = back;
		
		back.once('ready-to-show', () => {
		  //back.show();
		  winCount++;
		  createBackgroundWindows();
		});
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	createMainWindow();
	mainWindow.once('ready-to-show', () => {
	  mainWindow.show();
	  createBackgroundWindows();
	})
	mainWindow.on('closed', () => {
	  app.quit();
	});
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', function(){
	var p = path.join(__dirname, './nfpcache')
	  if( fs.existsSync(p) ) {
		fs.readdirSync(p).forEach(function(file,index){
		  var curPath = p + "/" + file;
		  fs.unlinkSync(curPath);
		});
	}
});

//ipcMain.on('background-response', (event, payload) => mainWindow.webContents.send('background-response', payload));
//ipcMain.on('background-start', (event, payload) => backgroundWindows[0].webContents.send('background-start', payload));

ipcMain.on('background-start', function(event, payload){
	console.log('starting background!');
	for(var i=0; i<backgroundWindows.length; i++){
		if(backgroundWindows[i] && !backgroundWindows[i].isBusy){
			backgroundWindows[i].isBusy = true;
			backgroundWindows[i].webContents.send('background-start', payload);
			break;
		}
	}
});

ipcMain.on('background-response', function(event, payload){
	for(var i=0; i<backgroundWindows.length; i++){
		if(backgroundWindows[i].webContents == event.sender){
			mainWindow.webContents.send('background-response', payload);
			backgroundWindows[i].isBusy = false;
			break;
		}
	}
});

ipcMain.on('background-progress', function(event, payload){
	mainWindow.webContents.send('background-progress', payload);
});

ipcMain.on('background-stop', function(event){
	for(var i=0; i<backgroundWindows.length; i++){
		if(backgroundWindows[i]){
			backgroundWindows[i].destroy();
			backgroundWindows[i] = null;
		}
	}
	winCount = 0;
	
	createBackgroundWindows();
	
	console.log('stopped!', backgroundWindows);
});

ipcMain.on('login-success', function(event, payload){
	mainWindow.webContents.send('login-success', payload);
});

ipcMain.on('purchase-success', function(event){
	mainWindow.webContents.send('purchase-success');
});