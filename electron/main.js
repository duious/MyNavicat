const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const setting = require('../setting.json');
const fontManager = require('./font-manager');
const winState = require('./win-state');
const menu = require('./menus');
const messageTypeEnum = require('./message');

app.dock.bounce('critical');
app.disableHardwareAcceleration();
app.setAboutPanelOptions({
  applicationName: 'MyNavicat',
  applicationVersion: 'v0.0.1',
  copyright: '', version: '0.0.1', credits: '',
  authors: 'duious', website: '', iconPath: `${__dirname}/icons/icon.png`,
});
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
global.APP_ENV = (process.env.NODE_ENV === 'dev') ? 'dev' : 'production';

if (APP_ENV === 'production') {
  require('./update')();
}

let browserWindow;
let webContents;

function createWindow () {
  const lastWinStage = winState.getLastState();
  browserWindow = new BrowserWindow({
    x: !isNaN(lastWinStage.x) ? lastWinStage.x : null,
    y: !isNaN(lastWinStage.y) ? lastWinStage.y : null,
    minWidth: 950,
    width: lastWinStage.width ? lastWinStage.width : 1100,
    minHeight: 510,
    height: lastWinStage.height ? lastWinStage.height : 728,
    backgroundColor: '#00000000',
    useContentSize: false,
    title: setting.appName,
    titleBarStyle: 'hidden',
    icon: `${__dirname}/icons/icon.png`,
    autoHideMenuBar: true,
    type: 'textured',
    vibrancy: 'titlebar',
    visualEffectState: 'followWindow',
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
    },
    skipTaskbar: true,
    // frame: false,
    // transparent: true,
    show: false,
  });
  webContents = browserWindow.webContents;
  winState.watchClose(browserWindow);

  if (APP_ENV === 'production') {
    browserWindow.loadURL(`file://${__dirname}/../dist/index.html#/index/?version=${app.getVersion()}`);
  } else {
    const {default: installExtension, VUEJS_DEVTOOLS} = require('electron-devtools-installer');
    browserWindow.loadURL(`http://localhost:9988/index.html#/index/?version=${app.getVersion()}`);
  }

  browserWindow.webContents.once('dom-ready', () => {
    browserWindow.show();
  });

  browserWindow.on('closed', () => {
    browserWindow = null;
  });
}

app.on('ready', function () {
  app.setName('MyNavicat');
  app.dock.setIcon(`${__dirname}/icons/icon.png`);
  createWindow();
  if (APP_ENV !== 'production') {
    const {default: installExtension, VUEJS_DEVTOOLS} = require('electron-devtools-installer');
    installExtension(VUEJS_DEVTOOLS).then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (browserWindow === null) {
    createWindow();
  }
  active(true);
});

app.on('browser-window-focus', () => {
  if (browserWindow === null) {
    createWindow();
  }
  active(true);
});

app.on('browser-window-blur', () => {
  active(false);
});

function active (flag) {
  let res = {
    channel: setting.path.action.update.active.path,
    res: {active: flag},
  };
  console.log('ipc:res:', res, 'winId:', 1);
  BrowserWindow.fromId(1).webContents.send(res.channel, res);
}
