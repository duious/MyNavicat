<template>
  <div class="def-dialog-div">
    <el-dialog :visible.sync="show" custom-class="def-dialog"
               :fullscreen="true" :show-close="false">
      <el-tabs type="card" value="normal">
        <el-tab-pane v-for="(item,index) in tabs" :label="item.label" :name="item.name" :key="index">
          {{item.content}}
          <div v-if="item.name == 'normal'" class="def-dialog-content-div">
            <el-form ref="form" label-width="80px" size="mini">
              <el-form-item label="链接名:">
                <el-input size="mini" clearable v-model="link.name"></el-input>
              </el-form-item>
              <el-form-item label="添加到:">
                <el-input></el-input>
              </el-form-item>
              <el-form-item label="主机:">
                <el-input v-model="link.host"></el-input>
              </el-form-item>
              <el-form-item label="端口:">
                <el-input v-model="link.port"></el-input>
              </el-form-item>
              <el-form-item label="用户名:">
                <el-input v-model="link.user"></el-input>
              </el-form-item>
              <el-form-item label="密码:">
                <el-input show-password v-model="link.password"></el-input>
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="link.remember">保存密码</el-checkbox>
              </el-form-item>
              {{err}}
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="dialog-footer">
        <div class="def-dialog-btn-div">
          <el-button class="def-dialog-btn def-dialog-test" size="mini"
                     @click="testLink">链接测试
          </el-button>
        </div>
        <div class="def-dialog-btn-div">
          <el-button class="def-dialog-btn def-dialog-cancel" size="mini"
                     @click="cancel">取消
          </el-button>
          <el-button class="def-dialog-btn def-dialog-save" size="mini"
                     @click="saveLink">保存
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {ipcRenderer} from "electron";

  export default {
    name: "myDialog",
    data() {
      return {
        show: true,
        tabs: [
          {label: '常规', name: 'normal', content: '',},
          {label: '高级', name: 'senior', content: '',},
          {label: '数据库', name: 'db', content: '',},
          {label: 'SSL', name: 'ssl', content: '',},
          {label: 'SSH', name: 'ssh', content: '',},
          {label: 'HTTP', name: 'http', content: '',},
        ],
        link: {
          name: '127.0.0.1',
          remember: '',
          host: "127.0.0.1",
          port: 3306,
          user: "root",
          password: "HomeBrewMysql!@#123",
          database: 'demo'
        },
        windowId: this.$route.query.id,
      };
    },
    created() {
    },
    mounted() {

    },
    methods: {
      testLink: function () {
        let _this = this;
        let connection = _this.$mysql.createConnection({
          host: _this.link.host,
          user: _this.link.user,
          password: _this.link.password,
          port: _this.link.port,
          database: _this.link.database,
        });
        connection.connect(function (err) {
          if (connection.state === 'connected') {
            _this.$message({message: '链接成功！', type: 'success', offset: 80});
          }
        });

      },
      cancel: function () {

      },
      saveLink: function () {
        let _this = this;
        _this.$messages.send({
          channel: _this.$channel.STORE, messages: _this.$messages.STORE.SET,
          key: 'link', val: _this.link
        }).then(res => {
            _this.$messages.send({
              channel: _this.$channel.WINDOW, messages: _this.$messages.WINDOW.CLOSE,
              id: _this.windowId
            });
          },
          err => {

          }
        )
      }
    },
  }
</script>

<style>
  .def-dialog-div {
  }

  .def-dialog {
    border: 20px solid #363739;
  }

  .def-dialog::before {
    content: ' ';
    height: 1px;
    box-shadow: 0 2px 0 0 #000;
  }

  .def-dialog-btn-div {
    display: flex;
  }

  .def-dialog-btn, .def-dialog-btn:hover {
    background-color: #6f6f6e;
    border-color: #6f6f6e;
    color: #fff;
    padding: 4px 14px;
  }

  .def-dialog-btn:active {
    background-color: #0000ff;
    border-color: #00f;
    color: #fff;
    transition: .1s;
  }

  .def-dialog-test {
    align-self: flex-start;
  }

  .def-dialog-content-div {
    margin: 0 auto;
    width: 400px;
  }

</style>