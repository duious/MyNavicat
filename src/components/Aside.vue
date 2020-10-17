<template>
  <div class="resize" :style="{'flex-basis': dragState.width + 'px'}" ref="asideEl"
        @mousedown="handleMouseDown($event)">
      <component v-if="''!==component" :treeArr="linkArr" :is="component"
                 @linkClick="linkClick" @linkContextMenu="linkContextMenu"></component>
  </div>
</template>
<script>
import {ref, reactive, computed, nextTick} from 'vue';
import {mysqlCore} from '../mysql-core';
import {query, SQL_DEF} from '../util-mysql';
import setting from '../../setting.json';
import Tree from './Tree.vue';

export default {
  components: {'Tree': Tree},
  data () {
    return {
      /**
         * 同 {@link ../ Index组件data.linkArr}
         */
      linkArr: [],
      focusItem: {
        'id': '1.1', 'type': 'db', 'title': '',
        'dbData': {
          'name': '',
          'character': '',
          'collation': '',
        },
        'state': {
          'clicked': false,
          'linked': false,
          'open': false,
        },
        'connection': '', 'children': '',
      },
      component: '',
      dragging: false,
      dragState: {startMouseLeft: '', startLeft: '', width: 200},
    };
  },
  created () {
    let _this = this;
    _this.initLinkList();
    // 响应：更新链接列表
    _this.$message.$on(setting.path.action.update.link.path, () => {
      _this.$emit('getLinkArr', _this.updateLinkList);
    });
    // 响应：打开选中的链接
    _this.$message.$on(setting.path.menu.open.link.path, () => {
      _this.connectionOpen();
    });
    // 响应：关闭选中的链接
    _this.$message.$on(setting.path.menu.close.link.path, () => {
      _this.connectionClose();
    });
    // 响应：打开选中的库
    _this.$message.$on(setting.path.menu.open.db.path, () => {
      _this.dbOpen();
    });
    // 响应：关闭选中的库
    _this.$message.$on(setting.path.menu.close.db.path, () => {
      _this.dbClose();
    });
    // 响应：打开选中的表
    _this.$message.$on(setting.path.menu.open.table.path, () => {
      _this.tableOpen();
    });
    // 响应：关闭选中的表
    _this.$message.$on(setting.path.menu.close.table.path, () => {
      _this.tableClose();
    });
  },
  methods: {
    /**
       * 初始化：获取当前存储的所有链接
       */
    initLinkList () {
      let _this = this;
      _this.$message.send(setting.path.disk.get.path, {key: setting.disk.key.link}).then((res) => {
        mysqlCore.resetLink();
        for (let i = 0; i < res.res.length; i++) {
          mysqlCore.setLink({index: i, item: res.res[i]});
        }
        _this.updateLinkList();
      });
    },
    /**
       * 更新链接列表
       * @param {Array} linkArr
       */
    updateLinkList () {
      let _this = this;
      _this.component = '';
      _this.linkArr = computed(() => mysqlCore.getLink());
      _this.component = 'Tree';
    },
    /**
       * 左键单击链接元素
       * @param {Object} item 链接对象
       * @param {number} index 所在数组下标
       */
    linkClick (item, index) {
      let _this = this;
      _this.resetLinkClicked(_this.linkArr);
      item.state.clicked = true;
    },
    /**
       * 右键单击链接元素
       * @param {Object} item 链接对象
       * @param {number} index 所在数组下标
       */
    linkContextMenu (item, index) {
      let _this = this;
      _this.resetLinkClicked(_this.linkArr);
      _this.focusItem.item = item;
      item.state.clicked = true;
      _this.focusItem.index = index;
      let postItem = {
        id: item.id, title: item.title, state: item.state, type: item.type,
      };
      if (String(_this.focusItem.item.id).indexOf('.') === -1) {
        _this.$message.send(setting.path.menu.open.path, {
          params: setting.path.menu.open.params.link,
          item: JSON.parse(JSON.stringify(postItem)),
        });
      } else {
          item.type === 'db' ?
              _this.$message.send(setting.path.menu.open.path, {
                params: setting.path.menu.open.params.db,
                item: JSON.parse(JSON.stringify(postItem)),
              }) :
              _this.$message.send(setting.path.menu.open.path, {
                params: setting.path.menu.open.params.table,
                item: JSON.parse(JSON.stringify(postItem)),
              });
      }
      postItem = '';
    },
    /**
       * 重置链接点击状态
       * @param {Array} linkArr
       */
    resetLinkClicked (linkArr) {
      let _this = this;
      linkArr.filter((one) => {
          one.state.clicked ? one.state.clicked = false : '';
          one.children && 0 < one.children.length ? _this.resetLinkClicked(one.children) : '';
      });
    },
    /**
       * 建立链接
       */
    connectionOpen () {
      let _this = this;
      let focusId = _this.focusItem.item.id.split('.')[0];
      mysqlCore.getConnection({id: focusId}).then((connection) => {
        query(connection, SQL_DEF.SCHEMA_NAME).then((res) => {
          let resItem = '';
          _this.focusItem.item.children = [];
          for (let i = 0; i < res.length; i++) {
            resItem = {
              'id': focusId + '.' + (i + 1),
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
            _this.focusItem.item.children.push(resItem);
            mysqlCore.setDb({id: focusId, item: resItem});
          }
          mysqlCore.setLinkState({id: focusId, stateItem: 'open', to: true});
          _this.updateLinkList();
        });
      });
    },
    /**
       * 断开链接
       */
    connectionClose () {
      let _this = this;
      mysqlCore.closeLink({id: _this.focusItem.item.id});
      mysqlCore.setLinkState({id: _this.focusItem.item.id, stateItem: ['linked', 'open'], to: false});
      _this.updateLinkList();
    },
    /**
       * 初始化 数据库 库内表 列表
       * @param {Object} item 选中的库
       * @param {Array} res 返回的结果
       */
    initDBTable (item, res) {
      let addTable = (item, dbItem) => {
        let id = dbItem.id = item.id + '.' + (item.children.length === 0 ? '1' : item.children.length + 1);
        item.children?.map((one) => {
          if (one.title === dbItem.title) {
            dbItem.id = one.id;
            one = dbItem;
          }
          return one;
        });
          id === dbItem.id ? item.children.push(dbItem) : '';
          mysqlCore.setTable({id: dbItem.id, item: dbItem});
      };
      for (let i = 0; i < res.length; i++) {
        switch (res[i]['TABLE_TYPE']) {
          case 'BASE TABLE':
            addTable(item.children[0], {
              id: '', type: setting.dist.table.type.table.val, title: res[i]['TABLE_NAME'],
              state: {clicked: false, open: false},
            });
            break;
          case 'VIEW':
            addTable(item.children[1], {
              id: '', type: setting.dist.table.type.views.val, title: res[i]['TABLE_NAME'],
              state: {clicked: false, open: false},
            });
            break;
          case 'SYSTEM VIEW':
            addTable(item.children[1], {
              id: '', type: setting.dist.table.type.views.val, title: res[i]['TABLE_NAME'],
              state: {clicked: false, open: false},
            });
            break;
          case 'Function':
            addTable(item.children[2], {
              id: '', type: setting.dist.table.type.views.val, title: res[i]['TABLE_NAME'],
              state: {clicked: false, open: false},
            });
            break;
          case 'EVENT':
            addTable(item.children[3], {
              id: '', type: setting.dist.table.type.views.val, title: res[i]['TABLE_NAME'],
              state: {clicked: false, open: false},
            });
            break;
          case 'QUERY':
            addTable(item.children[4], {
              id: '', type: setting.dist.table.type.views.val, title: res[i]['TABLE_NAME'],
              state: {clicked: false, open: false},
            });
            break;
          case 'BACKUP':
            addTable(item.children[5], {
              id: '', type: setting.dist.table.type.views.val, title: res[i]['TABLE_NAME'],
              state: {clicked: false, open: false},
            });
            break;
          default:
            break;
        }
      }
    },
    /**
       * 打开库
       */
    dbOpen () {
      let _this = this;
      let focusId = _this.focusItem.item.id.split('.')[0];
      mysqlCore.getConnection({id: focusId}).then((connection) => {
        query(connection, SQL_DEF.ALL_TABLE, [_this.focusItem.item['title']]).then((res) => {
          _this.initDBTable(_this.focusItem.item, res);
          mysqlCore.setDbState({id: _this.focusItem.item.id, stateItem: ['linked', 'open'], to: true});
          nextTick(() => {
            _this.updateLinkList();
          });
        });
      });
    },
    /**
       * 关闭库
       */
    dbClose () {
      let _this = this;
      mysqlCore.setDbState({id: _this.focusItem.item.id, stateItem: ['linked', 'open'], to: false});
      _this.updateLinkList();
    },
    /**
       * 打开表
       */
    tableOpen () {
      let _this = this;
      mysqlCore.setDbState({id: _this.focusItem.item.id, stateItem: ['linked', 'open'], to: true});
      _this.updateLinkList();
      let no = new Date().getTime();
      _this.$message.$emit(setting.path.root.creat.path, {params: {name: _this.focusItem.item.title, table: 'query', no: no}});
      _this.$message.on(setting.path.action.update.tableDef.path + '/' + no + 'get', () => {
        let parent = _this.linkArr.find((one) => {
          if (one.id == _this.focusItem.item.id.split('.')[0]) {
            return one;
          }
        }).children.find((one) => {
          if (one.id.split('.')[1] == _this.focusItem.item.id.split('.')[1]) {
            return one;
          }
        });
        _this.$message.$emit(setting.path.action.update.tableDef.path + '/' + no, {
          item: _this.focusItem.item, parent: parent,
        });
      });
    },
    /**
       * 关闭表
       */
    tableClose () {
      let _this = this;
      mysqlCore.setDbState({id: _this.focusItem.item.id, stateItem: ['linked', 'open'], to: false});
      _this.updateLinkList();
    },
    /**
     * 表头 缩放 左键按下
     * @param event
     */
    handleMouseDown (event) {
      const columnRect = this.$refs.asideEl;
      const widthRank = [200, 500];

      this.dragState = {
        startMouseLeft: event.clientX,
        startLeft: columnRect.clientWidth,
      };
      this.dragging = (this.dragState.startMouseLeft >= (this.dragState.startLeft - 15)) &&
          (this.dragState.startMouseLeft <= (this.dragState.startLeft + 6));

      document.onselectstart = () => false;
      document.ondragstart = () => false;

      const mousemove = (event) => {
        const deltaLeft = (event.clientX - this.dragState.startMouseLeft);
        const proxyLeft = this.dragState.startLeft + deltaLeft;

        this.dragState.width = widthRank[0] > proxyLeft ? widthRank[0] : widthRank[1] < proxyLeft ? widthRank[1] : proxyLeft;
      };
      const mouseup = () => {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        document.onselectstart = null;
        document.ondragstart = null;
        this.dragging = false;
      };
      if (this.dragging) {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
      }
    },
  },
};
</script>
<style scoped lang="scss">
  .resize::after {
    content: ' ';
    position: absolute;
    right: -6px;
    cursor: col-resize;
    width: 16px;
    height: 100%;
  }
  ::-webkit-scrollbar-track {
    margin-top: 0;
  }
</style>
