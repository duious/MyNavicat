import Vue from "vue";
import {ipcRenderer} from 'electron';
import setting from '../setting';

const eventHub = new Vue();

Vue.prototype.$channel = setting.channel;
Vue.prototype.$messages = setting.messages;
Vue.prototype.$action = {
  UPDATE: 'update',
};

let msgCheck = false;
/**
 * 消息总线 收发
 */
Vue.prototype.$messages.send = function (msg) {
  return new Promise((resolve, reject) => {
    /**
     * 发送前预检
     */
    for (const key in Vue.prototype.$channel) {
      if (msg.channel === Vue.prototype.$channel[key]) {
        for (const msgKey in Vue.prototype.$messages[key]) {
          if (msg.messages === Vue.prototype.$messages[key][msgKey]) {
            resolve(msg);
          }
        }
      }
    }
    reject({code: -1, msg: '消息不合规！'});
  }).then(msg => {
    return new Promise((resolve, reject) => {
      msg.resChannel = msg.channel + '/' + new Date().getTime();
      /**
       * 消息总线 接收消息 发送指令 到electron
       * @param msg
       */
      ipcRenderer.send(msg.channel, msg);
      /**
       * 接收 electron指令结果 发送消息 到消息总线
       */
      ipcRenderer.on(msg.resChannel, (event, arg) => {
        console.info('ipc:response:', arg, JSON.parse(JSON.stringify(event)));
        resolve(arg);
      });
      try {
        setTimeout(function () {
          reject({code: -1, msg: '执行超时'})
        }, 3000);
      } catch (e) {
        console.error('ipc:warm:', msg, '执行超时', e)
      }
    });
  });
};

/**
 * 消息总线 收
 */
// Vue.prototype.$messages.$emit = function (...event) {
//   eventHub.$emit(...event);
// };
// Vue.prototype.$messages.$on = function (...event) {
//   eventHub.$on(...event);
// };
ipcRenderer.on(setting.channel.SETTING, (event, arg) => {
  eventHub.$emit(setting.channel.SETTING, arg.res);
});
ipcRenderer.on(setting.channel.SETTING + '/' + 'active', (event, arg) => {
  eventHub.$emit(setting.channel.SETTING + '/' + 'active', arg.res);
});
ipcRenderer.on(setting.channel.STORE + '/' + 'tree', (event, arg) => {
  eventHub.$emit(setting.channel.STORE + '/' + 'tree', arg.res);
});
ipcRenderer.on(setting.channel.ACTION + '/' + 'openLink', (event, arg) => {
  eventHub.$emit(setting.channel.ACTION + '/' + 'openLink', arg.res);
});
ipcRenderer.on(setting.channel.ACTION + '/' + 'openDB', (event, arg) => {
  eventHub.$emit(setting.channel.ACTION + '/' + 'openDB', arg.res);
});

export default {
  /**
   * 消息总线 收
   */
  $emit(...event) {
    eventHub.$emit(...event);
  },
  $on(...event) {
    eventHub.$on(...event);
  },
}