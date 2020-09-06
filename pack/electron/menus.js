const {app, BrowserWindow, Menu, systemPreferences, ipcMain, dialog, ipcRenderer} = require('electron');
const setting = require('../../setting');
const winState = require('./win-state');
global.APP_ENV = (process.env.NODE_ENV === 'dev') ? 'dev' : 'production';

let menu;
let dialogWin;

function createWindow() {
// get last win stage
  const lastWinStage = winState.getLastState();
  dialogWin = new BrowserWindow({
    x: !isNaN(lastWinStage.x) ? lastWinStage.x : null,
    y: !isNaN(lastWinStage.y) ? lastWinStage.y : null,
    minWidth: 720,
    width: 720,
    minHeight: 640,
    height: 640,
    backgroundColor: '#00000080',
    icon: `${__dirname}/icons/icon.png`,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
    type: 'textured',
  })

// and load the index.html of the app.
  if (APP_ENV === 'production') {
    // mainWindow.loadFile('index.html');
    dialogWin.loadURL(`file://${__dirname}/index.html#/myDialog?version=${app.getVersion()}&id=${dialogWin.id}`);
  } else {
    dialogWin.loadURL(`http://localhost:9988/index.html#/myDialog?version=${app.getVersion()}&id=${dialogWin.id}`);
  }

// Open the DevTools.
// mainWindow.webContents.openDevTools();

// Emitted when the window is closed.
  dialogWin.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    dialogWin = null;
  });

}

const menuItems = {
  file: [
    {label: '新建项目'},
    {
      label: '新建链接',
      role: 'newLink',
      submenu: [
        {
          label: 'MySQL...',
          click: async () => {
            createWindow();
          },
        },
        {label: 'PostgreSQL...'},
        {label: 'Oracle...'},
        {label: 'SQLite...'},
        {label: 'SQL Server...'},
        {label: 'MariaDB...'},
        {label: 'MongoDB...'}, {type: 'separator'},
      ]
    },
    {
      label: '新建',
      submenu: [
        {label: '查询...'},
        {label: '批处理作业...'},
        {label: '模型...'},
        {type: 'separator'},
      ]
    }, {type: 'separator'},
    {
      label: '最近使用',
      submenu: [
        {label: 'table1'},
        {label: 'table2'},
        {label: 'table3'},
        {type: 'separator'},
        {label: '清除'},
      ]
    }, {type: 'separator'},
    {label: '导入链接...'},
    {label: '导出链接...'}, {type: 'separator'},
    {label: '关闭窗口'},
    {label: '关闭选项卡'}, {type: 'separator'},
  ],
  link: [
    {
      label: '打开链接',
      click: async () => {
        let res = {
          channel: setting.channel.ACTION + '/' + 'openLink',
          res: {},
        }
        console.log('ipc:res:', res);
        BrowserWindow.fromId(1).webContents.send(res.channel, res);
      },
    },
    {label: '关闭链接'}, {type: 'separator'},
    {label: '编辑链接'},
    {label: '新建链接'},
    {label: '删除链接'},
    {label: '复制链接'},
    {label: '复制链接到...'},
    {label: '移动链接到...'}, {type: 'separator'},
    {label: '新建数据库'},
    {label: '新建查询'}, {type: 'separator'},
    {label: '命令行界面'},
    {label: '运行SQL文件'},
    {label: '刷新'}, {type: 'separator'},
    {label: '管理组'},
    {label: '色彩'},
    {label: '颜色'}, {type: 'separator'},
    {label: '刷新'},
  ],
  DB: [
    {
      label: '打开数据库',
      click: async () => {
        let res = {
          channel: setting.channel.ACTION + '/' + 'openDB',
          res: {},
        }
        console.log('ipc:res:', res);
        BrowserWindow.fromId(1).webContents.send(res.channel, res);
      },
    },
    {label: '关闭数据库'}, {type: 'separator'},
    {label: '编辑数据库'},
    {label: '新建数据库'},
    {label: '删除数据库'}, {type: 'separator'},
    {label: '新建查询'}, {type: 'separator'},
    {label: '命令行界面'},
    {label: '运行SQL文件'},
    {
      label: '转储SQL文件',
      submenu: [{label: '结构 + 数据'},
        {label: '仅结构'},]
    },
    {label: '打印数据库...'},
    {label: '逆向数据库到模型...'},
    {label: '在数据库中查找...'}, {type: 'separator'},
    {label: '刷新'},
  ],
};

// for mac copy paset shortcut
if (process.platform === 'darwin') {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    // { role: 'appMenu' },
    {
      label: 'MyNavicat',
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services'},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    },
    {
      label: '文件',
      submenu: menuItems.file
    },
    {role: 'editMenu', label: '编辑'},
    // { role: 'viewMenu' },
    {
      label: '视窗',
      submenu: [
        ...(
          (APP_ENV === 'production') ? [] : [{role: 'toggledevtools'}]
        ),
        {role: 'togglefullscreen'}
      ]
    },
    {
      label: '收藏夹',
      submenu: [
        {role: 'minimize'},
        {role: 'zoom'},
        {type: 'separator'},
        {role: 'front'},
        {type: 'separator'},
        // { role: 'window' }
      ]
    },
    {
      label: '工具',
      submenu: [
        {role: 'minimize'},
        {role: 'zoom'},
        {type: 'separator'},
        {role: 'front'},
        {type: 'separator'},
        // { role: 'window' }
      ]
    },
    {
      label: '窗口',
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'zoom'},
        {type: 'separator'},
        {role: 'front'},
        {type: 'separator'},
        // { role: 'window' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {label: 'MyNavicat Help'},
        {label: '在线文件'}, {type: 'separator'},
        {
          label: '更多',
          click: async () => {
            const {shell} = require('electron')
            await shell.openExternal('https://github.com/qishibo/AnotherRedisDesktopManager')
          }
        }
      ]
    }
  ]));
}

module.exports = {
  menu, menuItems,
}