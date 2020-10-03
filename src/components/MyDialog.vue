<template>
  <div class="dialog-div">
    <div class="dialog-header">
      <div class="dialog-btn-group">
        <input class="dialog-btn" v-for="(item,index) in options" type="button"
               :value="item.title" :class="item.clicked?'clicked':''"
               @click="tabClick(item,index)"/>
      </div>
    </div>
    <div class="dialog-main">
      <div class="dialog-form icon-div">
        <div class="icon" v-html="icon.icon"></div>
        <div :class="connection.state === 'disconnected' ? 'error' : connection.state === 'connected' ? 'success' : ''"
             v-html="connection.state === 'disconnected' ? icon.error : connection.state === 'connected' ? icon.success : ''"
             class="icon"></div>
        <div class="icon" v-html="icon.db"></div>
      </div>
      <div class="dialog-form" v-show="'normal' === clicked.type">
        <div class="dialog-form-item">
          <span>链接名</span>
          <label>
            <input type="text" v-model="link.title" placeholder="链接备注"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>添加到</span>
          <label>
            <input type="text"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>主机</span>
          <label>
            <input type="text" v-model="link.linkData.host" placeholder="IP地址/域名"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>端口</span>
          <label>
            <input type="text" v-model="link.linkData.port" placeholder="数据库端口，默认3670"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>用户名</span>
          <label>
            <input type="text" v-model="link.linkData.user" placeholder="登陆用户名"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>密码</span>
          <label>
            <input type="password" v-model="link.linkData.password" placeholder="登陆密码"/>
          </label>
        </div>
        <div class="dialog-form-item">
          <span>保存密码</span>
          <label>
            <input type="text" v-model="link.linkData.remember"/>
          </label>
        </div>
      </div>
    </div>
    <div class="dialog-footer">
      <div class="dialog-btn-group">
        <input class="dialog-btn" type="button" value="链接测试" @click="connectionTest">
      </div>
      <div class="dialog-btn-group">
        <input class="dialog-btn" type="button" value="取消" @click="connectionCancel">
        <input class="dialog-btn" type="button" value="保存" @click="connectionSave">
      </div>
    </div>
  </div>
</template>
<script>
import setting from '../../setting.json';

export default {
  name: 'myDialog',
  props: ['id'],
  data () {
    return {
      options: [
        {title: '常规', type: 'normal', clicked: true},
        {title: '高级', type: 'senior'},
        {title: '数据库', type: 'db'},
        {title: 'SSL', type: 'SSL'},
        {title: 'SSH', type: 'SSH'},
        {title: 'HTTP', type: 'HTTP'},
      ],
      clicked: {},
      link: {
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
      connection: '',
      icon: setting.icon.base,
    };
  },
  created () {
    let _this = this;
    _this.clicked = _this.options[0];
    // 响应：编辑链接
    _this.$message.$on(setting.path.action.edit.link.path, (res) => {
      console.error(res);
      _this.link = res.res.item;
    });
  },
  methods: {
    tabClick (item, index) {
      let _this = this;
      for (let i = 0; i < _this.options.length; i++) {
        _this.options[i].clicked = false;
      }
      item.clicked = true;
      _this.connection = {};
      _this.clicked = item;
    },
    connectionTest () {
      let _this = this;
      _this.connection = '';
      _this.connection = _this.$mysql.createConnection(_this.link.linkData);
      _this.connection.connect({}, function (err) {
        if (_this.connection.state === 'connected') {
          _this.$message({message: '链接成功！', type: 'success', offset: 80});
        } else {
          console.log(err);
        }
      });
    },
    connectionCancel () {
      let _this = this;
      _this.$message.send(setting.path.action.close.win.path, {id: _this.id});
    },
    connectionSave () {
      let _this = this;
      // 保存配置
      _this.$message.send(setting.path.disk.set.path, {
        key: setting.disk.key.link,
        val: JSON.parse(JSON.stringify(_this.link)),
      }).then((res) => {
        _this.$message.send(setting.path.action.close.win.path, {id: _this.$route.params.id, action: 'update'});
      });
    },
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

          .icon {
            min-width: 80px;
            width: auto;
            transition: .3s;

            &:nth-child(2) {
              display: grid;
              width: 120px;
              height: 2px;
              margin: 0 10px;
              background-color: #adadad;
              place-items: center center;
            }
          }

          .icon.error {
            background-color: #f00;
            transition: .3s;
          }

          .icon.success {
            background-color: #00ff00;
            transition: .3s;
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

            & span {
              width: 65px;
              font-size: 12px;
              line-height: 2.2;
            }

            & label input[type='text'], & label input[type='password'] {
              width: 300px;
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
