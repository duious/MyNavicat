const {app,} = require('electron');
const Store = require('electron-store');
const setting = require('../../setting');
const storeEnum = {
  SET: 'set', GET: 'get', DEL: 'del', SIZE: 'size', CLEAR: 'clear',
};

/**
 * 实例化 存储类
 * @type {ElectronStore<Record<string, unknown>>}
 */
const myStore = new Store({
  name: "config",//文件名称,默认 config
  fileExtension: "json",//文件后缀,默认json
  cwd: app.getPath('userData'),//文件位置,尽量不要动
  // encryptionKey: "aes-256-cbc",//对配置文件进行加密
  clearInvalidConfig: true, // 发生 SyntaxError  则清空配置,
});
/**
 * 设置预设配置
 */
(function () {
  if (!myStore.has("setting")) {
    myStore.set('setting', setting);
    if (!myStore.has('link')) {
      myStore.set('link', []);
    }
  }
})();

const store = {
  set(key, val) {
    if ('link' === key) {
      let linkArr = Array.from(myStore.get(key));
      if (val.id) {
        for (let i = 0; i < linkArr.length; i++) {
          if (linkArr[i].id === val.id) {
            linkArr[i] = val;
            break;
          }
        }
      } else {
        val.id = linkArr.length || 0;
        linkArr.push(val)
      }
      myStore.set(key, linkArr);
    } else {
      myStore.set(key, val);
    }
  },

  get(key) {
    return myStore.get(key);
  },

  del(key) {
    myStore.del(key);
  },

  size() {
    return myStore.size();
  },

  clear() {
    myStore.clear();
  }
};

module.exports = {store, storeEnum};