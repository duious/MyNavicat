<template>
  <div class="index">
    <component class="header" v-once v-if="''!==component.header" :is="component.header"></component>
    <div class="container">
      <component class="aside" v-once v-if="''!==component.aside" :is="component.aside" :linkArr="linkArr"
                 @getLinkArr="getLinkArr" @connectLink="connectLink" @getConnection="getConnection"></component>
      <component class="main" v-once v-if="''!==component.main" :is="component.main"
                 @getLinkArr="getLinkArr" @connectLink="connectLink" @getConnection="getConnection"></component>
    </div>
    <div class="footer"></div>
  </div>
</template>
<script>
import Header from './Header.vue';
import Aside from './Aside.vue';
import Main from './Main.vue';
import {mysqlCore} from '../mysql-core';
import setting from '../../setting.json';

export default {
  name: 'index',
  components: {'Header': Header, 'Aside': Aside, 'Main': Main},
  data () {
    return {
      store: mysqlCore,
      /**
         *  运行时，所有链接集合
         *  @example: [
         *             {
         *                 "id": 1,                  自增，取自数组长度
         *                 "type": "mysql",          链接类型
         *                 "title": "mylink",        备注名称
         *                 "linkData": {             链接信息
         *                     "database": "demo",   默认库
         *                     "host": "127.0.0.1",  主机地址
         *                     "password": "123",    登陆密码
         *                     "port": 3306,         主机端口
         *                     "user": "root"        登陆用户
         *                 },
         *                 "state": {                当前链接状态
         *                     "clicked": false,     是否选中
         *                     "linked": false,      是否已链接
         *                     "open": false,        是否展开
         *                     "remember": false     是否记住密码
         *                 },
         *                 "children": "",           展开子集合
         *                 "pool": ""                链接池
         *             }
         *  ],
         *  */
      linkArr: [],
      /**
         * 运行时，链接建立后所有可操作库集合
         * @example :[
         *            {
         *              "id": "1.1",                split('.')[1]:自增，取自当前数组长度split('.')[0]:linkArr元素id
         *              "type": "db",               当前库类型
         *              "title":"mysql",            名称，取自库信息-名称
         *              "dbData": {                 当前库信息
         *                  "name":"mysql",         名称
         *                  "character":"utf8mb4",  编码格式
         *                  collation:"utf8mb4_ci",
         *              },
         *              "state": {                  当前库状态
         *                  "clicked": false,       是否选中
         *                  "linked": false,        是否已链接
         *                  "open": false,          是否展开
         *              },
         *              "connection": "",           库链接，使用时从链接池获取更新后使用
         *              "children": ""                 展开的子集合
         *            }
         * ]
         */
      dbArr: [],
      /**
         * 运行时，所有可操作表集合
         * @example :[
         *            {
         *               "id": "1.4.1",       split('.')[2]:自增，取自当前数组长度split('.')[0]:linkArr元素id，split('.')[1]:deArr元素id
         *               "type": "table",     当前表类型：table
         *               "title": "app_grade",当前表名称
         *               "state": {           当前表状态
         *                 "clicked": "",     是否选中
         *                 "linked": "",      是否已链接
         *               },
         *            }
         * ]
         */
      tableArr: [],
      component: {header: '', aside: '', main: ''},
    };
  },
  created () {
    let _this = this;
    _this.$message.send(setting.path.disk.get.path, {key: setting.disk.key.setting}).then((res) => {
    });
    _this.component.header = 'Header';
    _this.component.aside = 'Aside';
    _this.component.main = 'Main';
  },
  methods: {
    /**
       * 将对应下标的链接建立链接
       * @param {number} id linkArr数组内元素的id
       * @param {function} cb 回掉函数，传入{@link dbArr}
       */
    connectLink (id, cb) {
      let _this = this;
      _this.getConnection(id, (id, connection) => {
        // 当前链接包含的库
        _this.$mysql.$query(connection, _this.$mysql.$SQL_DEF.SCHEMA_NAME).then((res) => {
          let dbArrItem = '';
          let resItem = '';
          for (let i = 0; i < res.length; i++) {
            resItem = {
              'id': id + '.' + (i + 1),
              'type': 'db',
              'title': res[i]['SCHEMA_NAME'],
              'dbData': {
                'name': res[i]['SCHEMA_NAME'],
                'character': res[i]['DEFAULT_CHARACTER_SET_NAME'],
                'collation': res[i]['DEFAULT_COLLATION_NAME'],
              },
              'state': {
                'clicked': false,
                'linked': false,
                'open': false,
              },
              'connection': connection,
              'children': '',
            };
            mysqlCore.setDb({id: resItem.id, item: resItem});
            for (let j = 0; j < _this.dbArr.length; j++) {
              if (_this.dbArr[j].id == resItem.id) {
                dbArrItem = j;
                break;
              }
            }
            if ('' === dbArrItem) {
              _this.dbArr.push(resItem);
            } else {
              _this.dbArr[dbArrItem] = resItem;
            }
          }
          cb(_this.dbArr);
          // cb();
        });
        //   .then(() => {
        //   _this.$mysql.$query(connection, _this.$mysql.$SQL_DEF.ALL_DATABASE).then((res) => {
        //     console.log(res);
        //   }).then(() => {
        //     _this.$mysql.$query(connection, _this.$mysql.$SQL_DEF.TABLE_STATE).then((res) => {
        //       console.log(res);
        //     });
        //   });
        // });
      });
    },
    /**
       * 获取对应下标的链接的connection对象
       * @param {String} id linkArr数组内元素的id
       * @param {function} cb 回掉函数，传入{@link linkArr:item:id}子元素ID、{@link connection}链接对象
       */
    getConnection (id, cb) {
      let _this = this;
      let item = mysqlCore.getLink().find((one) => {
        if (one.id == id.split('.')[0]) {
          return one;
        }
      });
        // item.connection = _this.$mysql.createConnection({
        //   host: item.host, user: item.user, password: item.password, port: item.port, database: item.database,
        // });
      let dbItem = _this.dbArr.find((one) => {
        if (one.id == id) {
          return one;
        }
      });
      item.linkData.database = dbItem?.dbData.name;
      item.pool = _this.$mysql.createPool(JSON.parse(JSON.stringify(item.linkData)));
      // console.error(item);
      item.pool.getConnection((err, connection) => {
        if (err) {
          return;
        }
        // item.state.linked = item.state.open = true;
        mysqlCore.setLinkState({id: item.id, stateItem: 'linked', to: true});
        cb(item.id, connection);
      });
    },
  },
};
</script>
<style lang="scss">
  .index, .header, .container, .aside, .main, .footer {
    display: flex;
  }

  .index {
    width: 100%;
    height: 100%;
    /*min-height: 510px;*/
    border: none;
    flex-direction: column;
    justify-content: space-between;
    cursor: default;
    user-select: none;
    -webkit-user-select: none;
    flex: 1 1 auto;

    *:focus {
      outline: none;
    }

    .header {
      height: 77px;
      border-bottom: 1px solid #000;
      flex-direction: column;
      /*background-image: linear-gradient(#444448, #36373a);*/
      background-image: linear-gradient(#515151, #424242); /*8am*/
      -webkit-app-region: drag;
      -webkit-user-select: none;
      /*background-color: #2c2c30; night inactive*/
    }

    .container {
      height: auto;
      min-height: 409px;
      flex: 1 1 auto;
      align-items: stretch;
      border-bottom: 1px solid #000;

      .aside {
        position: relative;;
        height: auto;
        min-height: 100%;
        border-right: 1px solid #000;
        overflow-x: hidden;
        overflow-y: auto;
        flex-grow: 1;
        flex-shrink: 1;
        flex-direction: column;
        justify-content: flex-start;
        color: #fefefe;
        font-size: 13px;
        line-height: 1.7;
      }

      .main {
        width: 100%;
        height: auto;
        flex-direction: column;
        flex: 1 1 auto;
      }
    }

    .footer {
      flex: 0 0 22px;
      height: 22px;
      width: 100%;
    }
  }
</style>
