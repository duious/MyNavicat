<template>
  <el-aside class="aside-left">
    <el-tree class="sources-div" :data="sources" :props="defaultProps"
             highlight-current :expand-on-click-node="false" :indent=10
             @node-click="handleNodeClick" @node-contextmenu="openMenu"
    ></el-tree>
  </el-aside>
</template>
<script type="text/javascript">
  export default {
    data() {
      return {
        sources: [
          // {
          //   label: '127.0.0.1', iconFile: 'el-icon-platform-eleme',
          //   children: [
          //     {
          //       label: '127.0.0.1', iconFile: 'fa fa-qq',
          //       children: [
          //         {label: '127.0.0.1', iconFile: 'fa fa-qq',},
          //       ],
          //     },
          //   ],
          // },
          // {label: '10.130.0.191', iconFile: 'fa fa-qq',}
        ],
        defaultProps: {
          children: 'children',
          label: 'label',
          iconFile: 'iconFile',
        },
        contextmenuId: '', contextmenuDB: '',
      };
    },
    created() {
      let _this = this;
      _this.$messages.send({
        channel: _this.$channel.STORE, messages: _this.$messages.SETTING.GET,
        key: 'link'
      }).then(res => {
          _this.loadData(res.res);
        },
        err => {
          console.error(err);
        }
      );
      _this.$messages.$on(_this.$channel.STORE + '/' + 'tree', (res) => {
        _this.loadData(res.res);
      });
      _this.$messages.$on(_this.$channel.ACTION + '/' + 'openLink', (res) => {
        _this.openLink();
      });
      _this.$messages.$on(_this.$channel.ACTION + '/' + 'openDB', (res) => {
        _this.openDB();
      });
    },
    components: {},
    methods: {
      handleNodeClick(data) {
        console.log(data);
      },
      loadData(data) {
        let _this = this;
        _this.sources.length = 0
        if (data) {
          for (let i = 0; i < data.length; i++) {
            _this.$set(_this.sources, i, {
              label: data[i].name, iconFile: 'fa fa-qq', data: data[i],
            });
          }
        }
      },
      openMenu(event, data) {
        let _this = this;
        if (data.data && data.data.id) {
          _this.contextmenuId = data.data.id;
          _this.$messages.send({
            channel: _this.$channel.MENU, messages: _this.$messages.MENU.LINK,
            name: 'newLink',
          });
        }
        _this.contextmenuDB = data.SCHEMA_NAME;
        _this.$messages.send({
          channel: _this.$channel.MENU, messages: _this.$messages.MENU.DB,
          name: 'newDB',
        });
      },
      openLink() {
        let _this = this, linkData = '', index;
        for (let i = 0; i < _this.sources.length; i++) {
          if (_this.sources[i].data.id === _this.contextmenuId) {
            linkData = _this.sources[i];
            index = i;
            break;
          }
        }
        if ('' === linkData) {
          console.log(linkData);
          return;
        }
        let connection = _this.$mysql.createConnection({
          host: linkData.data.host,
          user: linkData.data.user,
          password: linkData.data.password,
          port: linkData.data.port,
          database: linkData.data.database,
        });
        connection.connect(function (err) {
          if (connection.state === 'connected') {
            linkData.connection = connection;
            _this.$set(_this.sources, index, {
              label: _this.sources[index].label, iconFile: _this.sources[index].iconFile, data: linkData,
            });
            _this.getDBInfo(index, linkData.connection);
          }
        });
      },
      getDBInfo(index, connection) {
        let _this = this;
        connection.query("SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA;",
          function (err, result) {
            if (err) {
              console.log('[SELECT ERROR] - ', err.message);
              return;
            }
            let children = [], item = {};
            for (let i = 0; i < result.length; i++) {
              item = result[i];
              console.log(item);
              item.label = item['SCHEMA_NAME'];
              item.iconFile = 'fa fa-qq';
              children.push(item);
            }
            _this.$set(_this.sources[index], 'children', children);
            console.log(result);
          }
        );
      },
      openDB() {
        let _this = this, linkData = '',  connection = '';
        for (let i = 0; i < _this.sources.length; i++) {
          if (_this.sources[i].data && _this.sources[i].data.data &&
            _this.sources[i].data.data.id === _this.contextmenuId) {
            linkData = _this.sources[i].data;
            connection = linkData.connection;
            break;
          }
        }
        if ('' === connection) {
          console.log(connection);
          return;
        }
        Promise.all([_this.$sqlQuery(connection, "SHOW FULL TABLES WHERE Table_type != 'VIEW';"),
          _this.$sqlQuery(connection, "SHOW TABLE STATUS;"),]).then(res => {
          console.log(res);
          _this.$messages.$emit(_this.$channel.ACTION + '/' + 'reload', res);
        });
      },
    },
  };
</script>
<style type="text/css">
  .sources-div {
    width: 100%;
    background-color: transparent;
  }

  .el-tree-node {
    color: #fefefe;
  }

  .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: #1b6cd4;
  }

  .el-tree-node:focus > .el-tree-node__content, .el-tree-node:hover > .el-tree-node__content {
    background-color: transparent;
  }
</style>
