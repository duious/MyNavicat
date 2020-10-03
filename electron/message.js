const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const setting = require('../setting.json');
const {store, storeEnum} = require('./store');

const messageTypeEnum = {
  DIALOG: 'dialog',
  STORE: 'store',
};

/**
 * 接收页面指令
 * 通过ipcMain.on(@link()setting.json),(event, msg) => {});事件接收页面发送的消息msg，<br>
 * 再通过事件event的响应方法event.reply('async-reply', res);可作出回应res。
 */
ipcMain.on(setting.path.menu.open.path, (event, msg) => {
  messageHandel(setting.path.menu.open.path, event, msg);
});
ipcMain.on(setting.path.disk.get.path, (event, msg) => {
  messageHandel(setting.path.disk.get.path, event, msg);
});
ipcMain.on(setting.path.disk.set.path, (event, msg) => {
  messageHandel(setting.path.disk.set.path, event, msg);
});
ipcMain.on(setting.path.action.close.win.path, (event, msg) => {
  messageHandel(setting.path.action.close.win.path, event, msg);
});

function messageHandel (url, event, msg) {
  url = url.split('/');
  // console.log('S:req:', msg);
  let result = function (res) {
    res = {req: msg, res: res};
    console.log('S:res:', res);
    event.reply(msg.repUrl, res);
  };
  switch (url[0]) {
    // case setting.channel.SETTING:
    //   switch (msg.messages) {
    //     case setting.messages.SETTING.GET:
    //       result(store.get(msg.key));
    //       break;
    //     case setting.messages.SETTING.SET:
    //       result(store.set(msg.key, msg.val));
    //       break;
    //     default:
    //       result({});
    //       break;
    //   }
    //   break;
    case setting.path.disk.path:
      switch (url[0] + '/' + url[1]) {
        case setting.path.disk.set.path:
          store.set(msg.params.key, msg.params.val);
          result({});
          break;
        case setting.path.disk.get.path:
          result(store.get(msg.params.key));
          break;
        //     case setting.messages.STORE.DEL:
        //       store.del(msg.key);
        //       result({});
        //       break;
        //     case setting.messages.STORE.SIZE:
        //       result({size: store.size()});
        //       break;
        //     case setting.messages.STORE.CLEAR:
        //       store.clear();
        //       result({});
        //       break;
        //     default:
        //       result({});
        //       break;
      }
      break;
    // case setting.channel.WINDOW:
    //   switch (msg.messages) {
    //     case setting.messages.WINDOW.OPEN:
    //       const myMenu = new Menu()
    //       for (let i = 0; i < menuItems.file[1].submenu.length; i++) {
    //         myMenu.append(new MenuItem(menuItems.file[1].submenu[i]));
    //       }
    //       myMenu.popup({x: 10, y: 55});
    //       result({});
    //       break;
    //     case setting.messages.WINDOW.CLOSE:
    //       BrowserWindow.fromId(Number(msg.id)).close();
    //       let res = {
    //         channel: setting.channel.STORE + '/' + 'tree',
    //         res: store.get('link'),
    //       }
    //       console.log('ipc:res:', res);
    //       result({});
    //       BrowserWindow.fromId(1).webContents.send(res.channel, res);
    //       break;
    //     default:
    //       result({});
    //       break;
    //   }
    //   break;
    case setting.path.menu.path:
      switch (url[0] + '/' + url[1]) {
        case setting.path.menu.open.path:
          const {menuOpen} = require('./menus');
          menuOpen(msg.params);
          result({});
          break;
        // case setting.messages.MENU.FILE:
        //   myMenu = new Menu();
        //   for (let i = 0; i < menuItems.file[1].submenu.length; i++) {
        //     myMenu.append(new MenuItem(menuItems.file[1].submenu[i]));
        //   }
        //   myMenu.popup({x: 10, y: 55});
        //   result({});
        //   break;
        // case setting.messages.MENU.LINK:
        //   myMenu = new Menu();
        //   for (let i = 0; i < menuItems.link.length; i++) {
        //     menuItems.link[i].dataId = msg.id;
        //     myMenu.append(new MenuItem(menuItems.link[i]));
        //   }
        //   myMenu.popup({});
        //   result({});
        //   break;
        // case setting.messages.MENU.DB:
        //   myMenu = new Menu();
        //   for (let i = 0; i < menuItems.DB.length; i++) {
        //     menuItems.DB[i].dataId = msg.id;
        //     myMenu.append(new MenuItem(menuItems.DB[i]));
        //   }
        //   myMenu.popup({});
        //   result({});
        //   break;
        default:
          result({});
          break;
      }
      break;
    case setting.path.action.path:
      switch (url[0] + '/' + url[1]) {
        case setting.path.action.close.path:
          switch (url[0] + '/' + url[1] + '/' + url[2]) {
            case setting.path.action.close.win.path:
              BrowserWindow.fromId(Number(msg.params.id)).close();
              if (msg.params.action) {
                let res = {
                  url: setting.path.action.update.link.path,
                  res: store.get('link'),
                };
                console.log('S:req:', res);
                BrowserWindow.fromId(1).webContents.send(res.url, res);
              } else {
                result({});
              }
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
      break;
    default:
      result({});
      break;
  }
}

function sendMessages (msg) {
  const electron = require('electron');
  electron.ipcRenderer.sendToHost(msg.channel, {
    req: {channel: msg.channel},
    res: msg.res,
  });
}

module.exports = sendMessages;


