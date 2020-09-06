// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, MenuItem, systemPreferences, ipcMain} = require('electron');
const setting = require('../../setting');
const fontManager = require('./font-manager');
const winState = require('./win-state');
const menu = require('./menus');
const messageTypeEnum = require('./message');
app.dock.bounce('critical');

global.APP_ENV = (process.env.NODE_ENV === 'dev') ? 'dev' : 'production';

if (APP_ENV === 'production') {
  require('./update')();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let browserWindow;
let webContents;


function createWindow() {
  // get last win stage
  const lastWinStage = winState.getLastState();

  // Create the browser window.
  browserWindow = new BrowserWindow({
    x: !isNaN(lastWinStage.x) ? lastWinStage.x : null,
    y: !isNaN(lastWinStage.y) ? lastWinStage.y : null,
    minWidth: 900,
    width: lastWinStage.width ? lastWinStage.width : 1100,
    minHeight: 510,
    height: lastWinStage.height ? lastWinStage.height : 728,
    backgroundColor: '#00000080',
    icon: `${__dirname}/icons/icon.png`,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
    type: 'textured',
    useContentSize: false,
    frame: false,
    transparent: true,
  });
  webContents = browserWindow.webContents
  winState.watchClose(browserWindow);

  // and load the index.html of the app.
  if (APP_ENV === 'production') {
    // mainWindow.loadFile('index.html');
    browserWindow.loadURL(`file://${__dirname}/index.html?version=${app.getVersion()}`);
  } else {
    browserWindow.loadURL(`http://localhost:9988/?version=${app.getVersion()}`);
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  browserWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    browserWindow = null;
  });

  // const contents = mainWindow.webContents;
  // // contents.openFindWindow();
  // contents.findInPage('133');

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  app.setName('MyNavicat');
  app.dock.setIcon(`${__dirname}/icons/icon.png`)
  createWindow();
  BrowserWindow.addDevToolsExtension(`${__dirname}../../../vue devTools/5.3.3_0/`);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (browserWindow === null) {
    createWindow();
  }
  actived(true);
});

app.on('browser-window-focus', () => {
  if (browserWindow === null) {
    createWindow();
  }
  actived(true);
});

app.on('browser-window-blur', () => {
  actived(false);
});

function actived(flag) {
  let res = {
    channel: setting.channel.SETTING + '/' + 'active',
    res: {active: flag,},
  }
  console.log('ipc:res:', res, 'winId:', 1);
  BrowserWindow.fromId(1).webContents.send(res.channel, res);
}


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

