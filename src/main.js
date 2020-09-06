import Vue from 'vue';
import router from '@/router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.css';
import App from './App';
import bus from './bus';

import mysql from 'mysql';
import messages from './message';
import {ipcRenderer} from "electron";
import setting from "../setting";

Vue.prototype.$mysql = mysql;
Vue.prototype.$sqlQuery = function (connection, sql) {
  return new Promise((resolve, reject) => {
    console.log('sql query:', sql);
    connection.query(sql, function (err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      }
    );
  })
};
Vue.prototype.$messages = Object.assign(Vue.prototype.$messages, messages);
// Vue.prototype.$enum = {
//   "message": messageTypeEnum,
//   // "store": storeEnum
// }
// Vue.prototype.$util = util;
// Vue.prototype.$storage = storage;

Vue.use(ElementUI, {size: 'small'});
Vue.config.productionTip = false;


/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  components: {App},
  template: '<App/>',
});
