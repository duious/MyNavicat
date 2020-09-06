const {app, BrowserWindow, Menu, MenuItem, ipcMain, ipcRenderer} = require('electron');
const setting = require('../../setting');
const {store, storeEnum} = require('./store');

const messageTypeEnum = {
  DIALOG: 'dialog',
  STORE: 'store',
};

/**
 * 接收页面指令
 * 通过ipcMain.on(@link()setting.js),(event, msg) => {});事件接收页面发送的消息msg，<br>
 * 再通过事件event的响应方法event.reply('async-reply', res);可作出回应res。
 */
ipcMain.on(setting.channel.SETTING, (event, msg) => {
  messageHandel(setting.channel.SETTING, event, msg);
});
ipcMain.on(setting.channel.STORE, (event, msg) => {
  messageHandel(setting.channel.STORE, event, msg);
});
ipcMain.on(setting.channel.WINDOW, (event, msg) => {
  messageHandel(setting.channel.WINDOW, event, msg);
});
ipcMain.on(setting.channel.MENU, (event, msg) => {
  messageHandel(setting.channel.MENU, event, msg);
});

function messageHandel(channel, event, msg) {
  console.log('ipc:req:', msg);
  let result = function (res) {
    res = {req: msg, res: res}
    console.log('ipc:res:', res);
    event.reply(msg.resChannel, res);
  }
  const {menu, menuItems} = require('./menus');
  switch (channel) {
    case setting.channel.SETTING:
      switch (msg.messages) {
        case setting.messages.SETTING.GET:
          result(store.get(msg.key));
          break;
        case setting.messages.SETTING.SET:
          result(store.set(msg.key, msg.val));
          break;
        default:
          result({});
          break;
      }
      break;
    case setting.channel.STORE:
      switch (msg.messages) {
        case setting.messages.STORE.SET:
          store.set(msg.key, msg.val);
          result({});
          break;
        case setting.messages.STORE.GET:
          result(store.get(msg.key));
          break;
        case setting.messages.STORE.DEL:
          store.del(msg.key);
          result({});
          break;
        case setting.messages.STORE.SIZE:
          result({size: store.size()});
          break;
        case setting.messages.STORE.CLEAR:
          store.clear();
          result({});
          break;
        default:
          result({});
          break;
      }
      break;
    case setting.channel.WINDOW:
      switch (msg.messages) {
        case setting.messages.WINDOW.OPEN:
          const myMenu = new Menu()
          for (let i = 0; i < menuItems.file[1].submenu.length; i++) {
            myMenu.append(new MenuItem(menuItems.file[1].submenu[i]));
          }
          myMenu.popup({x: 10, y: 55});
          result({});
          break;
        case setting.messages.WINDOW.CLOSE:
          BrowserWindow.fromId(Number(msg.id)).close();
          let res = {
            channel: setting.channel.STORE + '/' + 'tree',
            res: store.get('link'),
          }
          console.log('ipc:res:', res);
          result({});
          BrowserWindow.fromId(1).webContents.send(res.channel, res);
          break;
        default:
          result({});
          break;
      }
      break;
    case setting.channel.MENU:
      let myMenu;
      switch (msg.messages) {
        case setting.messages.MENU.FILE:
          myMenu = new Menu();
          for (let i = 0; i < menuItems.file[1].submenu.length; i++) {
            myMenu.append(new MenuItem(menuItems.file[1].submenu[i]));
          }
          myMenu.popup({x: 10, y: 55});
          result({});
          break;
        case setting.messages.MENU.LINK:
          myMenu = new Menu();
          for (let i = 0; i < menuItems.link.length; i++) {
            menuItems.link[i].dataId = msg.id;
            myMenu.append(new MenuItem(menuItems.link[i]));
          }
          myMenu.popup({});
          result({});
          break;
        case setting.messages.MENU.DB:
          myMenu = new Menu();
          for (let i = 0; i < menuItems.DB.length; i++) {
            menuItems.DB[i].dataId = msg.id;
            myMenu.append(new MenuItem(menuItems.DB[i]));
          }
          myMenu.popup({});
          result({});
          break;
        default:
          result({});
          break;
      }
      break;
    default:
      result({});
      break;
  }
}

function sendMessages(msg) {
  const {ipcRenderer} = require('electron');
  console.log(ipcRenderer)
  ipcRenderer.sendToHost(msg.channel, {
    req: {channel: msg.channel},
    res: msg.res
  })
}

module.exports = sendMessages



