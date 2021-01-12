const electron = require('electron');
const app = electron.app;
const Store = require('electron-store');
const setting = require('../setting.json');
const storeEnum = {
  SET: 'set', GET: 'get', DEL: 'del', SIZE: 'size', CLEAR: 'clear',
};

/**
 * 实例化 存储类
 * @type {ElectronStore<Record<string, unknown>>}
 */
const myStore = new Store({
  name: 'config', // 文件名称,默认 config
  fileExtension: 'json', // 文件后缀,默认json
  cwd: app.getPath('userData'), // 文件位置,尽量不要动
  // encryptionKey: "aes-256-cbc",//对配置文件进行加密
  clearInvalidConfig: true, // 发生 SyntaxError  则清空配置,
});
/**
 * 设置预设配置
 */
(function () {
  if (!myStore.has(setting.disk.key.setting)) {
    myStore.set(setting.disk.key.setting, setting);
    if (!myStore.has(setting.disk.key.link)) {
      myStore.set(setting.disk.key.link, []);
    }
  }
})();

const store = {
  set (key, val) {
    if (setting.disk.key.link === key) {
      let linkArr = Array.from(myStore.get(key));
      if (val.id) {
        for (let i = 0; i < linkArr.length; i++) {
          if (linkArr[i].id === val.id) {
            linkArr[i] = val;
            break;
          }
        }
      } else {
        val.id = linkArr.length === 0 ? '1' : (linkArr.length + 1);
        linkArr.push(val);
      }
      console.log(linkArr);
      myStore.set(key, linkArr);
    } else {
      myStore.set(key, val);
    }
  },

  get (key) {
    return myStore.get(key);
  },

  del (key) {
    if (key.indexOf(setting.disk.key.link) !== -1) {
      let linkArr = myStore.get(setting.disk.key.link);
      if (key.split('.')[1]) {
        for (let i = 0; i < linkArr.length; i++) {
          if (linkArr[i].id == key.split('.')[1]) {
            linkArr.splice(i, 1);
            break;
          }
        }
      }
      myStore.set(setting.disk.key.link, linkArr);
      console.log('S:mysqlCore:del:', setting.disk.key.link, ':id:', key.split('.')[1]);
    } else {
      myStore.del(key);
      console.log('S:mysqlCore:del:', key);
    }
  },

  size () {
    return myStore.size();
  },

  clear () {
    myStore.clear();
  },
};

module.exports = {store, storeEnum};
