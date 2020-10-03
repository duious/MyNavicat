const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const setting = require('../setting.json');
const {store, storeEnum} = require('./store');
const winState = require('./win-state');
global.APP_ENV = (process.env.NODE_ENV === 'dev') ? 'dev' : 'production';

let menu = {};
let dialogWin;
let TARGET_ITEM = 'TARGET_ITEM';

function createWindow () {
  const lastWinStage = winState.getLastState();
  dialogWin = new BrowserWindow({
    x: !isNaN(lastWinStage.x) ? lastWinStage.x : null,
    y: !isNaN(lastWinStage.y) ? lastWinStage.y : null,
    minWidth: 720,
    width: 720,
    minHeight: 640,
    height: 640,
    backgroundColor: '#00000000',
    useContentSize: false,
    title: setting.appName,
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
    show: false,
  });

  if (APP_ENV === 'production') {
    dialogWin.loadURL(`file://${__dirname}/index.html#/myDialog/${dialogWin.id}?version=${app.getVersion()}`);
  } else {
    dialogWin.loadURL(`http://localhost:9988/index.html#/myDialog/${dialogWin.id}/${app.getVersion()}`);
  }

  dialogWin.webContents.once('dom-ready', () => {
    dialogWin.show();
  });

  dialogWin.on('closed', () => {
    dialogWin = null;
  });
}

const newLink = [
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
];
const menuItems = {
  file: [
    {label: '新建项目'},
    {
      label: '新建链接',
      role: 'newLink',
      submenu: newLink,
    },
    {
      label: '新建',
      submenu: [
        {label: '查询...'},
        {label: '批处理作业...'},
        {label: '模型...'},
        {type: 'separator'},
      ],
    }, {type: 'separator'},
    {
      label: '最近使用',
      submenu: [
        {label: 'table1'},
        {label: 'table2'},
        {label: 'table3'},
        {type: 'separator'},
        {label: '清除'},
      ],
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
        let req = {
          url: setting.path.menu.open.link.path,
          params: {},
        };
        console.log('S:req:', req);
        BrowserWindow.fromId(1).webContents.send(req.url, req);
      },
    },
    {
      label: '关闭链接',
      click: async () => {
        let req = {
          url: setting.path.menu.close.link.path,
          params: {},
        };
        console.log('S:req:', req);
      },
    }, {type: 'separator'},
    {
      label: '编辑链接',
      click: async () => {
        createWindow();
        dialogWin.webContents.once('dom-ready', () => {
          setTimeout(()=>{
            let res = {
              url: setting.path.action.edit.link.path,
              res: {item: store.get(TARGET_ITEM)},
            };
            console.log('S:req:', res);
            dialogWin.webContents.send(res.url, res);
          }, 300);
        });
      },
    },
    {
      label: '新建链接',
      submenu: newLink,
    },
    {
      label: '删除链接',
      click: async () => {
        store.del(setting.disk.key.link + '.' + store.get(TARGET_ITEM).id);
        let res = {
          url: setting.path.action.update.link.path,
          res: {},
        };
        console.log('S:req:', res);
        BrowserWindow.fromId(1).webContents.send(res.url, res);
      },
    },
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
        let req = {
          url: setting.path.menu.open.db.path,
          params: {},
        };
        console.log('S:req:', req);
        BrowserWindow.fromId(1).webContents.send(req.url, req);
      },
      enabled: true,
    },
    {
      label: '关闭数据库',
      click: async () => {
        let req = {
          url: setting.path.menu.close.db.path,
          params: {},
        };
        console.log('S:req:', req);
        BrowserWindow.fromId(1).webContents.send(req.url, req);
      },
    }, {type: 'separator'},
    {label: '编辑数据库'},
    {label: '新建数据库'},
    {label: '删除数据库'}, {type: 'separator'},
    {label: '新建查询'}, {type: 'separator'},
    {label: '命令行界面'},
    {label: '运行SQL文件'},
    {
      label: '转储SQL文件',
      submenu: [{label: '结构 + 数据'},
        {label: '仅结构'}],
    },
    {label: '打印数据库...'},
    {label: '逆向数据库到模型...'},
    {label: '在数据库中查找...'}, {type: 'separator'},
    {label: '刷新'},
  ],
  table: [
    {
      label: '打开表',
      click: async () => {
        let req = {
          url: setting.path.menu.open.table.path,
          params: {},
        };
        console.log('S:req:', req);
        BrowserWindow.fromId(1).webContents.send(req.url, req);
      },
      enabled: true,
    },
    {label: '设计表'},
    {label: '新建表'},
    {label: '删除表'},
    {label: '清空表'},
    {label: '截断表'},
    {label: '复制表'},
    {label: '设置权限'}, {type: 'separator'},
    {label: '导入向导'},
    {label: '导出向导'}, {type: 'separator'},
    {
      label: '转储SQL文件',
      submenu: [{label: '结构 + 数据'},
        {label: '仅结构'}],
    },
    {label: '打印表'},
    {label: '维护'},
    {label: '逆向表到模型...'}, {type: 'separator'},
    {label: '管理组'},
    {label: '复制'},
    {label: '粘贴'},
    {label: '重命名'}, {type: 'separator'},
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
        {role: 'quit'},
      ],
    },
    {
      label: '文件',
      submenu: menuItems.file,
    },
    {role: 'editMenu', label: '编辑'},
    // { role: 'viewMenu' },
    {
      label: '视窗',
      submenu: [
        ...(
          (APP_ENV === 'production') ? [] : [{role: 'toggledevtools'}]
        ),
        {role: 'togglefullscreen'},
      ],
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
      ],
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
      ],
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
      ],
    },
    {
      label: '帮助',
      submenu: [
        {label: 'MyNavicat Help'},
        {label: '在线文件'}, {type: 'separator'},
        {
          label: '更多',
          // click: async () => {
          //   const {shell} = require('electron')
          //   await shell.openExternal('https://github.com/qishibo/AnotherRedisDesktopManager')
          // }
        },
      ],
    },
  ]));
}

function menuOpen (item) {
  let myMenu; let items;
  switch (item.params) {
    case setting.path.menu.open.params.newLink:
      myMenu = new Menu();
      for (let i = 0; i < newLink.length; i++) {
        myMenu.append(new MenuItem(newLink[i]));
      }
      myMenu.popup({x: 10, y: 55});
      break;
    case setting.path.menu.open.params.link:
      myMenu = new Menu();
      for (let i = 0; i < menuItems.link.length; i++) {
        myMenu.append(new MenuItem(menuItems.link[i]));
      }
      store.set(TARGET_ITEM, item.item);
      myMenu.popup({});
      break;
    case setting.path.menu.open.params.db:
      myMenu = new Menu();
      for (let i = 0; i < menuItems.DB.length; i++) {
        items = menuItems.DB[i];
        if (!item.item.state.linked) {
          [1, 7, 9, 10].indexOf(i) !== -1 ? items.enabled = false : items.enabled = true;
        } else {
          items.enabled = true;
        }
        myMenu.append(new MenuItem(items));
      }
      myMenu.popup({});
      break;
    case setting.path.menu.open.params.table:
      myMenu = new Menu();
      for (let i = 0; i < menuItems.table.length; i++) {
        items = menuItems.table[i];
        if ('' === item.item.type) {
          [2, 6, 9, 10, 12, 14, 17, 22].indexOf(i) === -1 ? items.enabled = false : items.enabled = true;
        } else {
          items.enabled = true;
        }
        myMenu.append(new MenuItem(items));
      }
      myMenu.popup({});
      break;
  }
}

module.exports = {
  menuOpen,
  menu, menuItems,
};
