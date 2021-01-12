<template>
  <div class="dialog-div">
    <div class="dialog-header">
      <component v-if="''!==component"
                 :is="component"
                 :tabsArr="tabs"
                 @tabsItemClick="tabsItemClick"
                 :key="'0-Tabs'"></component>
    </div>
    <div class="dialog-main">
      <div class="dialog-form icon-div"
           :style="{'grid-template-columns': (ssh.checked || http.checked) ? '14.3% 28.6% 14.3% 28.6% 14.2%' : '25% 50% 25%'}">
        <div class="icon">
          <div v-html="icon.icon" style="zoom: 0.88;height: 70px;"></div>
          <div>{{ title }}</div>
        </div>
        <div class="icon">
          <div class="lock" v-html="icon.lock" v-show="ssl.checked || ssh.checked"></div>
          <div class="msg" :class="getConnectionClass()"
               v-html="getConnectionIcon()"
               @click.stop="showErrorMsg()">
          </div>
          <div class="line" :class="getConnectionClass()"></div>
        </div>
        <div class="icon" v-show="ssh.checked || http.checked">
          <div v-html="icon.ssh"></div>
          <div v-if="ssh.checked">SSH服务器</div>
          <div v-if="http.checked">HTTP服务器</div>
        </div>
        <div class="icon" v-show="ssh.checked || http.checked">
          <div class="lock" v-html="icon.lock" v-show="ssl.checked"></div>
          <div class="msg" :class="getConnectionClass()"
               v-html="getConnectionIcon()"
               @click.stop="showErrorMsg()">
          </div>
          <div class="line" :class="getConnectionClass()"></div>
        </div>
        <div class="icon">
          <div v-html="icon.db"></div>
          <div>数据库</div>
        </div>
      </div>
      <table class="dialog-form msg-div"
             :style="{'opacity': connection.errorMessage?.show === true ? 1 : 0}">
        <tr>
          <td class="msg-code">{{ connection.errorMessage?.code }}：</td>
          <td class="msg-errno">{{ connection.errorMessage?.errno }}</td>
        </tr>
        <tr>
          <td rowspan="2" class="msg-sqlMessage">{{ connection.errorMessage?.sqlMessage }}</td>
        </tr>
      </table>
      <div class="dialog-form" v-show="'normal' === type">
        <div class="dialog-form-item">
          <span>链接名</span>
          <label>
            <input type="text" v-model="linkData.title" placeholder="链接备注"/>
          </label>
        </div>
        <div class="dialog-form-item" v-if="false">
          <span>添加到</span>
          <label>
            <select>
              <option></option>
            </select>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>主机</span>
          <label>
            <input type="text" v-model="linkData.linkData.host" placeholder="IP地址/域名"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>端口</span>
          <label>
            <input type="text" v-model="linkData.linkData.port" placeholder="数据库端口，默认3670"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>用户名</span>
          <label>
            <input type="text" v-model="linkData.linkData.user" placeholder="登陆用户名"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>密码</span>
          <label>
            <input type="password" v-model="linkData.linkData.password" placeholder="登陆密码"/>
          </label>
        </div>
        <div class="dialog-form-item" v-if="false">
          <span>保存密码</span>
          <label>
            <input type="checkbox" v-model="linkData.linkData.remember"/>
          </label>
        </div>
      </div>
      <div class="dialog-form" v-show="'ssl' === type">
        <div class="dialog-form-item">
          <label>
            <input type="checkbox" v-model="ssl.checked"/>&nbsp;&nbsp;使用SSL
          </label>
        </div>
        <div class="dialog-form-item">
          <span>客户端密钥</span>
          <label :disabled="!ssl.checked">
            <input type="text" :value="ssl.customerKey" placeholder="" :disabled="!ssl.checked"/>
            <div class="file-selector" :disabled="!ssl.checked"
                 @click.stop="choiceFile('ssl', 'customerKey')">...</div>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>客户端证书</span>
          <label :disabled="!ssl.checked">
            <input type="text" v-model="ssl.customerCA" placeholder="" :disabled="!ssl.checked"/>
            <div class="file-selector" :disabled="!ssl.checked"
                 @click.stop="choiceFile('ssl', 'customerCA')">...</div>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>CA证书</span>
          <label :disabled="!ssl.checked">
            <input type="text" v-model="ssl.CA" placeholder="" :disabled="!ssl.checked"/>
            <div class="file-selector" :disabled="!ssl.checked"
                 @click.stop="choiceFile('ssl', 'CA')">...</div>
          </label>
        </div>
        <div class="dialog-form-item">
          <span></span>
          <label :disabled="!ssl.checked">
            <input type="checkbox" v-model="ssl.validateCA"/>验证针对CA的服务器证书
          </label>
        </div>
        <div class="dialog-form-item">
          <span>Cipher</span>
          <label :disabled="!ssl.checked">
            <input type="password" v-model="ssl.cipher" placeholder="" :disabled="!ssl.checked"/>
          </label>
        </div>
      </div>
      <div class="dialog-form" v-show="'ssh' === type">
        <div class="dialog-form-item">
          <label>
            <input type="checkbox" v-model="ssh.checked"/>&nbsp;&nbsp;使用SSH通道
          </label>
        </div>
        <div class="dialog-form-item">
          <span>主机</span>
          <label :disabled="!ssh.checked">
            <input type="text" v-model="ssh.host" placeholder="" :disabled="!ssh.checked"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>端口</span>
          <label :disabled="!ssh.checked">
            <input type="text" v-model="ssh.port" placeholder="22" :disabled="!ssh.checked"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>用户名</span>
          <label :disabled="!ssh.checked">
            <input type="text" v-model="ssh.username" placeholder="" :disabled="!ssh.checked"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>验证方法</span>
          <label :disabled="!ssh.checked">
            <select v-model="ssh.validateType" :disabled="!ssh.checked">
              <option value="password" selected>密码</option>
              <option value="publicKey">公钥</option>
            </select>
          </label>
        </div>
        <div class="dialog-form-item" v-if="ssh.validateType === 'password'">
          <span>密码</span>
          <label :disabled="!ssh.checked">
            <input type="password" v-model="ssh.password" placeholder="" :disabled="!ssh.checked"/>
          </label>
        </div>
        <div class="dialog-form-item" v-if="ssh.validateType === 'publicKey'">
          <span>私钥</span>
          <label :disabled="!ssh.checked">
            <input type="text" v-model="ssh.privateKey" placeholder="" :disabled="!ssh.checked"/>
            <div class="file-selector" :disabled="!ssh.checked"
                 @click.stop="choiceFile('ssh', 'privateKey')">...</div>
          </label>
        </div>
        <div class="dialog-form-item" v-if="ssh.validateType === 'publicKey'">
          <span>密码短语</span>
          <label :disabled="!ssh.checked">
            <input type="text" v-model="ssh.passphrase" placeholder="" :disabled="!ssh.checked"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span></span>
          <label :disabled="!ssh.checked">
            <input type="checkbox" v-model="ssh.remember" :disabled="!ssh.checked"/>保存{{ ssh.validateType === 'password' ? '密码' : '密码短语' }}
          </label>
        </div>
        <div class="dialog-form-item">
          <span></span>
          <label :disabled="!ssh.checked">
            <input type="checkbox" v-model="ssh.zip" :disabled="!ssh.checked"/>启用压缩
          </label>
        </div>
      </div>
      <div class="dialog-form" v-show="'http' === type">
        <div class="dialog-form-item">
          <label :disabled="ssh.checked || ssl.checked">
            <input type="checkbox" v-model="http.checked" :disabled="ssh.checked || ssl.checked"/>&nbsp;&nbsp;使用HTTP通道
          </label>
        </div>
        <div class="dialog-form-item">
          <span>网址</span>
          <label :disabled="!http.checked">
            <input type="text" v-model="http.url" placeholder="" :disabled="!http.checked"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span></span>
          <label :disabled="!http.checked">
            <input type="checkbox" v-model="http.author" :disabled="!http.checked"/>使用验证
          </label>
        </div>
        <div class="dialog-form-item">
          <span>用户名</span>
          <label :disabled="!http.author">
            <input type="text" v-model="ssh.userName" placeholder="" :disabled="!http.author"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>密码</span>
          <label :disabled="!http.author">
            <input type="text" v-model="ssh.password" placeholder="" :disabled="!http.author"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span></span>
          <label :disabled="!http.author">
            <input type="checkbox" v-model="http.remember" :disabled="!http.author"/>记住密码
          </label>
        </div>
        <div class="dialog-form-item">
          <label :disabled="!http.checked">
            <input type="checkbox" v-model="http.base64" :disabled="!http.checked"/>使用Base64编码
          </label>
        </div>
      </div>
    </div>
    <div class="dialog-footer">
      <div class="dialog-btn-group">
        <input class="dialog-btn" type="button" value="链接测试" @click="connectionTest()">
      </div>
      <div class="dialog-btn-group">
        <input class="dialog-btn" type="button" value="取消" @click="connectionCancel()">
        <input class="dialog-btn" type="button" value="保存" @click="connectionSave()">
      </div>
    </div>
  </div>
</template>
<script>
import {reactive, toRefs, watch} from 'vue';

const fs = require('fs');
const mysql = require('mysql');
import {msg} from '../message';
import setting from '../../setting.json';
import Tabs from './Tabs.vue';
/**
 * myDialog
 * @description @Components {@link myDialog} 组件
 * @description @:id {@link id} props:当前窗口下标
 */
export default {
  name: 'myDialog',
  components: {'Tabs': Tabs},
  props: ['id'],
  /**
   * @param {Object} props 组件入参
   * @return {Object} Object
   */
  setup (props) {
    /**
     * header数据
     * @property {String} title header居中展示的名字
     * @property {Array} options 数据库功能项即其它功能数组
     * @property {Object} icon 功能项使用的图标
     */
    let myDialogData = reactive({
      title: document.title,
      /**
       * 标签页 数组
       * @example
       */
      tabs: [
        {
          tabHead: {title: '常规', clicked: true, type: 'normal'},
          tabBody: {
            slot: {component: '', tableData: {}},
          },
        },
        // {
        //   tabHead: {title: '高级', clicked: false, type: 'senior'},
        //   tabBody: {
        //     slot: {component: '', tableData: {}},
        //   },
        // },
        // {
        //   tabHead: {title: '数据库', clicked: false, type: 'db'},
        //   tabBody: {
        //     slot: {component: '', tableData: {}},
        //   },
        // },
        {
          tabHead: {title: 'SSL', clicked: false, type: 'ssl'},
          tabBody: {
            slot: {component: '', tableData: {}},
          },
        },
        {
          tabHead: {title: 'SSH', clicked: false, type: 'ssh'},
          tabBody: {
            slot: {component: '', tableData: {}},
          },
        },
        // {
        //   tabHead: {title: 'HTTP', clicked: false, type: 'http'},
        //   tabBody: {
        //     slot: {component: '', tableData: {}},
        //   },
        // },
      ],
      type: 'normal',
      linkData: {
        'id': '',
        'type': setting.dist.link.type.mysql,
        'title': '',
        'linkData': {
          'database': 'mysql',
          'host': 'localhost',
          'password': '',
          'port': 3306,
          'user': 'root',
        },
        'state': {
          'clicked': false,
          'linked': false,
          'open': false,
          'remember': false,
        },
        'children': '',
        'pool': '',
      },
      ssl: {
        'checked': false,
        'customerKey': '',
        'customerCA': '',
        'CA': '',
        'validateCA': '',
        'cipher': '',
      },
      ssh: {
        'checked': false,
        'host': '',
        'port': '',
        'username': '',
        'validateType': 'password',
        'password': '',
        'privateKey': '',
        'passphrase': '',
        'remember': true,
        'zip': true,
      },
      http: {
        checked: false,
        url: '',
        author: false,
        userName: '',
        password: '',
        remember: true,
        base64: false,
      },
      component: 'Tabs',
      connection: {state: '', errorMessage: {}},
      icon: Object.assign({}, setting.icon.base, {'lock': setting.icon.action.lock['18']}),
    });
    let SSHInstance = '';
    // let HTTPProxy = '';
    // 响应：更新链接列表
    msg.on(setting.path.action.edit.link.path, (res) => {
      console.error(res);
      myDialogData.linkData = res.res.item;
    });
    /**
     * tab 组件按钮点击事件
     * @param {Object} item 点击的对象
     * @param {Event} event 点击事件
     */
    const tabsItemClick = (item, event) => {
      myDialogData.type = item.type;
      myDialogData.connection = {state: ''};
      event.preventDefault();
    };
    /**
     * 获取链接状态-类名
     * @return {string} 类名
     */
    const getConnectionClass = () => {
      switch (myDialogData.connection.state) {
        case 'connected':
          return 'success';
        case 'authenticated':
          return 'success';
        case 'disconnected':
          return 'error';
        case 'error':
          return 'error';
        default:
          return '';
      }
    };
    /**
     * 获取链接状态-icon
     * @return {string} dom节点
     */
    const getConnectionIcon = () => {
      switch (myDialogData.connection.state) {
        case 'connected':
          return myDialogData.icon.success;
        case 'authenticated':
          return myDialogData.icon.success;
        case 'disconnected':
          return myDialogData.icon.error;
        case 'error':
          return myDialogData.icon.error;
        default:
          return '';
      }
    };
    /**
     * 测试数据库链接
     * @return {Object}
     */
    const connectionTest = () => {
      myDialogData.connection = {state: ''};
      let mysqlConfig = {};
      // todo
      if (myDialogData.ssl.checked) {
        if (myDialogData.ssl.CA === '') {
          document.querySelectorAll('.dialog-form')[3].
              querySelectorAll('.dialog-form-item')[3].
              querySelector('input').focus();
          choiceFile('ssl', 'CA');
          return false;
        }
        mysqlConfig.ca = fs.readFileSync(myDialogData.ssl.CA);
      }
      // todo
      if (myDialogData.ssh.checked) {
        if (myDialogData.ssh.host === '') {
          document.querySelectorAll('.dialog-form')[4].
              querySelectorAll('.dialog-form-item')[1].
              querySelector('input').focus();
          return false;
        }
        if (myDialogData.ssh.username === '') {
          document.querySelectorAll('.dialog-form')[4].
              querySelectorAll('.dialog-form-item')[3].
              querySelector('input').focus();
          return false;
        }
        if (myDialogData.ssh.validateType === 'password') {
          if (myDialogData.ssh.password === '') {
            document.querySelectorAll('.dialog-form')[4].
                querySelectorAll('.dialog-form-item')[5].
                querySelector('input').focus();
            return false;
          }
        }
        if (myDialogData.ssh.validateType === 'publicKey') {
          if (myDialogData.ssh.privateKey === '') {
            document.querySelectorAll('.dialog-form')[4].
                querySelectorAll('.dialog-form-item')[5].
                querySelector('input').focus();
            return false;
          }
          myDialogData.ssh.privateKey = fs.readFileSync(myDialogData.ssh.privateKey);
          if (myDialogData.ssh.passphrase === '') {
            document.querySelectorAll('.dialog-form')[4].
                querySelectorAll('.dialog-form-item')[6].
                querySelector('input').focus();
            return false;
          }
        }
        myDialogData.ssh.port = myDialogData.ssh.port || 22;
        const SSHClient = require('ssh2');
        /**
         *
         */
        SSHInstance = new SSHClient();
        SSHInstance.connect(myDialogData.ssh);
        SSHInstance.on('error', (err) => {
          console.log(err);
          SSHInstance.end();
        });
        SSHInstance.on('connect', () => {
          console.log('connect');
        });
        SSHInstance.on('ready', () => {
          console.log('success');
        });
        console.log('ssh');
      }
      // todo
      if (myDialogData.http.checked) {
        // const httpProxy = require('http-proxy');
        // const HTTPProxy = httpProxy.createProxyServer();
      }
      mysqlConfig = Object.assign(mysqlConfig, JSON.parse(JSON.stringify(myDialogData.linkData.linkData)));
      new Promise((resolve, reject) => {
        let pool = mysql.createPool(mysqlConfig);
        console.log(pool);
        pool.getConnection((err, connection) => {
          if (err) {
            reject(err);
          }
          resolve(connection);
        });
      }).then((connection) => {
        myDialogData.connection = connection;
      }).catch((err) => {
        if (typeof err === 'object' && err['code'].toLowerCase().indexOf('error') !== -1) {
          myDialogData.connection.state = 'error';
          myDialogData.connection.errorMessage = Object.assign({}, err);
        }
      });
    };
    /**
     * 展示错误信息
     */
    const showErrorMsg = () => {
      if (myDialogData.connection.state === 'error') {
        myDialogData.connection.errorMessage.show = !myDialogData.connection.errorMessage.show;
      }
    };
    /**
     * 弹出按文件选择窗
     * @param {String} type 选择的协议类型
     * @param {String} key 对应的名称
     */
    const choiceFile = (type, key) => {
      let params = {winId: props.id, title: 'asd', filters: [{name: 'All Files', extensions: ['*']}]};
      switch (type) {
        case 'ssl':
          if (!myDialogData[type].checked) {
            return;
          }
          switch (key) {
            case 'customerKey':
              break;
            case 'customerCA':
              break;
            case 'CA':
              break;
          }
          break;
        case 'ssh':
          if (!myDialogData[type].checked) {
            return;
          }
          switch (key) {
            case 'privateKey':
              break;
          }
          break;
      }
      msg.send(setting.path.disk.choice.path, params).then((res) => {
        if (res.res) {
          myDialogData[type][key] = res.res[0];
        }
      });
    };
    /**
     * 取消新建数据库链接并关闭窗口
     */
    const connectionCancel = () => {
      msg.send(setting.path.action.close.win.path, {id: props.id});
    };
    /**
     * 保持新建的数据库链接
     */
    const connectionSave = () => {
      // 保存配置
      msg.send(setting.path.disk.set.path, {
        key: setting.disk.key.link,
        val: JSON.parse(JSON.stringify(myDialogData.linkData)),
      }).then(() => {
        msg.send(setting.path.action.close.win.path, {id: props.id, action: 'update'});
      });
    };
    watch(() => [myDialogData.ssl.checked, myDialogData.ssh.checked], () => {
      myDialogData.connection = {state: ''};
    });
    return {
      ...toRefs(myDialogData),
      tabsItemClick,
      getConnectionClass,
      getConnectionIcon,
      choiceFile,
      connectionTest,
      connectionCancel,
      connectionSave,
      showErrorMsg,
    };
  },
};
</script>
<style scoped lang="scss">
  #app {
    background-color: transparent;

    .dialog-div, .dialog-header, .dialog-main, .dialog-form, .dialog-form-item, .dialog-footer, .dialog-btn-group, .dialog-btn {
      display: flex;
    }

    .dialog-div {
      min-width: 680px;
      width: auto;
      min-height: 580px;
      height: auto;
      margin: 0 0 0 0;
      padding: 20px;
      box-shadow: inset 0 1px 0 0 #000;
      flex: 1 0 auto;
      flex-direction: column;
      justify-content: space-between;

      .dialog-header, .dialog-main {
        background-color: #1e1e1e;
      }

      .dialog-header {
        justify-content: center;
        height: 32px;
        margin-bottom: 1px;

        .dialog-btn-group {
          justify-content: center;
          align-items: center;

          .dialog-btn {
            background-color: transparent;
            border: none;
            color: #fefefe;
            min-width: 36px;
            width: auto;

            &:not(:last-child) {
              margin-right: 4px;
            }
          }

          .clicked {
            background-color: #0f7bff;
            border-radius: 2px;
            opacity: 1;
            transition: .1s;
          }
        }
      }

      .dialog-main {
        flex: 1 1 auto;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

        .icon-div {
          display: grid;
          height: 120px;
          grid-template-columns: 25% 50% 25%;
          place-items: center center;
          transition: .3s;

          .icon {
            position: relative;
            width: auto;
            font-size: 12px;
            text-align: center;
            color: #adadad;
            transition: .3s;
            min-width: 68px;

            &:nth-child(2), &:nth-child(4) {
              display: grid;
              place-items: center center;
            }

            .lock {
              position: absolute;
              top: -28px;
            }

            .line {
              width: 90px;
              height: 2px;
              margin: 0 10px;
              background-color: #adadad;
            }

            .msg {
              position: absolute;
              width: 14px;
              height: 14px;
              border-radius: 7px;
              line-height: 1.7;
            }

            .error {
              background-color: #f00;
              transition: .3s;
            }

            .success {
              background-color: #00ff00;
              transition: .3s;
            }
          }

        }

        .msg-div {
          width: 260px;
          color: #666;
          font-size: 12px;
          position: fixed;
          top: 120px;
          left: 33%;
          background-color: #363636;
          border-radius: 8px;
          padding: 6px !important;
          user-select: text;
          transition: .3s;

          &, .msg-code, .msg-errno, .msg-sqlMessage, tr, td {
            display: flex;
            overflow: hidden;
            outline: none;
            padding: 0;
          }

          tr {
            flex-direction: row;
            border: none;

            td {
              border: none;
              width: auto;
            }
          }

          .msg-code {
            width: auto;
            color: #f00;
          }

          .msg-errno {
            width: auto;
          }

          .msg-sqlMessage {

          }
        }

        .dialog-form {
          flex-direction: column;
          justify-content: center;
          transition: .2s;

          .dialog-form-item {
            width: 360px;
            height: auto;
            line-height: 20px;
            color: #fefefe;
            margin: 2px 0;
            overflow: hidden;
            font-size: 12px;

            span {
              width: 65px;
              font-size: 12px;
              line-height: 2.2;
            }

            label {
              position: relative;

              &[disabled='true'] {
                opacity: 0.5;
              }
            }

            label input[type='text'], & label input[type='password'], & label select {
              width: 280px;
              height: 20px;
              background-color: #292929;
              border: 1px solid #3e3e3e;
              border-radius: 2px;
              color: #fefefe;
              transition: .6s;
              padding: 0 0 0 0;
              margin: 2px 4px;

              &:focus {
                border-color: #1f5a8f;
                outline: 0;
                -webkit-box-shadow: inset 0 2px 2px rgba(0, 0, 0, .075), 0 0 8px rgba(43, 128, 255, 0.6);
                box-shadow: inset 0 2px 2px rgba(0, 0, 0, .075), 0 0 8px rgba(43, 128, 255, 0.6);
                transition: .3s;
              }
            }

            label input[type='checkbox'] {
              position: relative;
              line-height: 20px;
              height: 14px;
              color: #1e1e1e;
              transition: .6s;
              padding: 0 0 0 0;
              margin: 0 4px;
              vertical-align: sub;
              background: #1e1e1e;
            }

            label input[type='checkbox']:after {
              width: 12px;
              height: 12px;
              position: absolute;
              top: 0;
              left: 0;
              content: " ";
              background-color: #1e1e1e;
              color: #fff;
              display: inline-block;
              visibility: visible;
              border-radius: 4px;
              border: 1px solid #eee;
              padding: 0 0 0 0;
            }

            label input[type='checkbox']:checked:after {
              content: "✓︎";
              font-weight: bold;
              font-size: 14px;
              line-height: 12px;
            }

            .file-selector {
              position: absolute;
              width: 20px;
              height: 20px;
              top: 3px;
              right: 5px;
              background-color: #3e3e3e;
              font-weight: bold;
              text-align: center;

              &:active {
                opacity: 0.5
              }

              &[disabled='true'] {
                opacity: 1;
              }
            }
          }
        }
      }

      .dialog-footer {
        height: 40px;
        flex-direction: row;
        justify-content: space-between;

        .dialog-btn-group {
          align-self: flex-end;

          .dialog-btn {
            background-color: #696969;
            color: #fefefe;
            border: none;
            border-radius: 2px;
            transition: .4s;

            &:active {
              background-image: linear-gradient(#4e4fed, #4027d2);
            }
          }

          &:first-child .dialog-btn {
            width: 78px;
          }
        }
      }
    }

    .dialog-btn-group {
      .dialog-btn {
        height: 20px;
        line-height: 1.6;
        font-size: 12px;
        width: 50px;
        text-align: center;
        margin: 0 auto;
        display: block;

        &:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }
</style>
