const vue = require('vue');
import setting from '../setting.json';
import mitt from 'mitt';

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const emitter = mitt();
const message = Object.assign({send: '', receive: '', app: {}}, emitter);
message.$on = message.on;
message.$emit = message.emit;
const debug = false;

/**
 * 消息总线 收发
 * @param {String} url 请求地址
 * @param {Object} params 请求参数
 */
message.send = (url, params) => new Promise((resolve, reject) => {
  // 发送前预检
  url = url.split('/');
    !!setting.path[url[0]] ?
        !!setting.path[url[0]][url[1]] ?
            resolve({url: url.join('/'), params: params}) :
            reject({code: -1, msg: '消息不合规！'}) :
        reject({code: -1, msg: '消息不合规！'});
}).then((req) => new Promise((resolve, reject) => {
    debug ? console.log('C:req:', req) : '';
    req.repUrl = req.url + '/' + new Date().getTime() + Math.random();
    /**
     * 消息总线 接收消息 发送指令 到electron
     * @param msg
     */
    ipcRenderer.send(req.url, req);
    /**
     * 接收 electron指令结果 发送消息 到消息总线
     */
    ipcRenderer.on(req.repUrl, (event, res) => {
      debug ?
          console.info('C:rep:', res, JSON.parse(JSON.stringify(event))) :
          '';
      resolve(res);
    });
    try {
      setTimeout(() => {
        reject({code: -1, msg: '执行超时', req});
      }, 3000);
    } catch (e) {
      console.error('C:warm:', req, '执行超时', e);
    }
}));

/* 消息总线 收 */
/**
 * 应用激活状态
 */
ipcRenderer.on(setting.path.action.update.active.path, (event, arg) => {
  emitMsg(setting.path.action.update.active.path, arg, event);
});
/**
 *打开 选中的 数据库链接
 */
ipcRenderer.on(setting.path.menu.open.link.path, (event, arg) => {
  emitMsg(setting.path.menu.open.link.path, arg, event);
});
/**
 *关闭 选中的 数据库链接
 */
ipcRenderer.on(setting.path.menu.close.link.path, (event, arg) => {
  emitMsg(setting.path.menu.close.link.path, arg, event);
});
/**
 *打开 选中的 库
 */
ipcRenderer.on(setting.path.menu.open.db.path, (event, arg) => {
  emitMsg(setting.path.menu.open.db.path, arg, event);
});
/**
 *关闭 选中的 库
 */
ipcRenderer.on(setting.path.menu.close.db.path, (event, arg) => {
  emitMsg(setting.path.menu.close.db.path, arg, event);
});
/**
 *打开 选中的 表
 */
ipcRenderer.on(setting.path.menu.open.table.path, (event, arg) => {
  emitMsg(setting.path.menu.open.table.path, arg, event);
});
/**
 *关闭 选中的 表
 */
ipcRenderer.on(setting.path.menu.close.table.path, (event, arg) => {
  emitMsg(setting.path.menu.close.table.path, arg, event);
});
/**
 *编辑 选中的 数据库链接
 */
ipcRenderer.on(setting.path.action.edit.link.path, (event, arg) => {
  emitMsg(setting.path.action.edit.link.path, arg, event);
});
/**
 *更新 选中的 数据库链接
 */
ipcRenderer.on(setting.path.action.update.link.path, (event, arg) => {
  emitMsg(setting.path.action.edit.link.path, arg, event);
});
/**
 *更新 选中的 数据库链接
 */
ipcRenderer.on(setting.path.action.update.link.path, (event, arg) => {
  emitMsg(setting.path.action.update.link.path, arg, event);
});

/**
 * 发送内部消息
 * @param url
 * @param req
 * @param event
 */
function emitMsg (url, req, event) {
  debug ? console.info('S:rep:', req, JSON.parse(JSON.stringify(event))) : '';
  message.$emit(url, req);
}

// Vue.prototype.$messages.$emit = function (...event) {
//   eventHub.$emit(...event);
// };
// Vue.prototype.$messages.$on = function (...event) {
//   eventHub.$on(...event);
// };
// ipcRenderer.on(setting.channel.SETTING, (event, arg) => {
//   eventHub.$emit(setting.channel.SETTING, arg.res);
// });
// ipcRenderer.on(setting.channel.STORE + '/' + 'tree', (event, arg) => {
//   eventHub.$emit(setting.channel.STORE + '/' + 'tree', arg.res);
// });
// ipcRenderer.on(setting.channel.ACTION + '/' + 'openLink', (event, arg) => {
//   eventHub.$emit(setting.channel.ACTION + '/' + 'openLink', arg.res);
// });
// ipcRenderer.on(setting.channel.ACTION + '/' + 'delLink', (event, arg) => {
//   eventHub.$emit(setting.channel.ACTION + '/' + 'delLink', arg.res);
// });
// ipcRenderer.on(setting.channel.ACTION + '/' + 'openDB', (event, arg) => {
//   eventHub.$emit(setting.channel.ACTION + '/' + 'openDB', arg.res);
// });

export default {
  install: (app) => {
    message.app = app;
    app.config.globalProperties.$message = message;
    app.provide(message, message);
  },
};
