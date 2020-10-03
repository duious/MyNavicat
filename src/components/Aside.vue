<template>
  <div class="resize" :style="{'flex-basis': resize.width + 'px'}"
    @mousedown="resizeDown($event)" @mousemove="resizeMove($event)"
       @mouseleave="resizeUp" @mouseout="resizeUp" @mouseup="resizeUp"
       @mouseover="resizeUp">
    <component v-if="''!==component" :treeArr.sync="linkArr" :is="component"
               @linkClick="linkClick" @linkContextMenu="linkContextMenu"></component>
  </div>
</template>
<script>
import {ref} from 'vue';
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
      resize: {
        begin: 0, end: 0, oldWidth: 200, width: 200,
      },
    };
  },
  created () {
    let _this = this;
    // 获取当前存储的所有链接
    _this.$emit('getLinkArr', _this.updateLinkList);
    // _this.getLinkList();
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
     * 更新链接列表
     * @param {Array} linkArr
     */
    updateLinkList (linkArr) {
      let _this = this;
      _this.component = '';
      _this.linkArr = linkArr;
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
      _this.$emit('connectLink', _this.focusItem.item.id.split('.')[0], (res) => {
        _this.focusItem.item.children = [];
        res.find((one) => {
          if (one.id.split('.')[0] == _this.focusItem.item.id) {
            _this.focusItem.item.children.push(one);
          }
        });
      });
    },
    /**
     * 断开链接
     */
    connectionClose () {
      let _this = this;
      let item = _this.linkArr[_this.focusItem.index];
      item.pool.end();
      item.pool = item.children = '';
      item.state.linked = item.state.open = false;
    },
    /**
     * 初始化 数据库 库内表 列表
     * @param {Object} item 选中的库
     * @param {Array} res 返回的结果
     */
    initDBTable (item, res) {
      item.children = [];
      item.children.push({
        id: item.id + '.' + 1, type: '', title: setting.dist.table.type.table.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      });
      item.children.push({
        id: item.id + '.' + 2, type: '', title: setting.dist.table.type.views.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      });
      item.children.push({
        id: item.id + '.' + 3, type: '', title: setting.dist.table.type.fn.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      });
      item.children.push({
        id: item.id + '.' + 4, type: '', title: setting.dist.table.type.event.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      });
      item.children.push({
        id: item.id + '.' + 5, type: '', title: setting.dist.table.type.query.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      });
      item.children.push({
        id: item.id + '.' + 6, type: '', title: setting.dist.table.type.backup.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      });
      for (let i = 0; i < res.length; i++) {
        switch (res[i]['TABLE_TYPE']) {
          case 'BASE TABLE':
            item.children[0].children.push({
              id: item.children[0].id + '.' + (item.children[0].children.length === 0 ? '1' : item.children[0].children.length + 1),
              type: setting.dist.table.type.table.val, title: res[i]['TABLE_NAME'],
              state: {clicked: false, open: false},
            });
            break;
          case 'VIEW':
            item.children[1].children.push({
              id: item.children[1].id + '.' + (item.children[1].children.length === 0 ? '1' : item.children[1].children.length + 1),
              type: setting.dist.table.type.views.val, title: res[i]['TABLE_NAME'],
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
      _this.$emit('getConnection', _this.focusItem.item.id.split('.')[0], (id, connection) => {
        _this.focusItem.item.state.linked = _this.focusItem.item.state.open = true;
        // 当前链接包含的库
        _this.$mysql.$query(connection, _this.$mysql.$SQL_DEF.ALL_TABLE, [_this.focusItem.item['title']]).then((res) => {
          _this.initDBTable(_this.focusItem.item, res);
        });
      });
    },
    /**
     * 关闭库
     */
    dbClose () {
      let _this = this;
      _this.focusItem.item.state.linked = _this.focusItem.item.state.open = false;
    },
    /**
     * 打开表
     */
    tableOpen () {
      let _this = this;
      _this.focusItem.item.state.linked = _this.focusItem.item.state.open = true;
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
      _this.focusItem.item.linked = _this.focusItem.item.state.open = false;
    },
    /**
     * 表头 缩放 左键按下
     * @param $event
     * @param index
     * @param item
     */
    resizeDown ($event) {
      this.resize.begin = Number($event.clientX);
      this.resize.oldWidth = this.resize.width;
    },
    /**
     * 表头 缩放 鼠标移除操作区域
     * 移动时动态处理缩放的宽度
     * @param $event
     */
    resizeMove ($event) {
      if (this.resize.begin !== 0) {
        this.resize.end = Number($event.clientX);
        if (200 > (this.resize.oldWidth + this.resize.end - this.resize.begin) ||
            500 < (this.resize.oldWidth + this.resize.end - this.resize.begin)) {
          return;
        }
        this.resize.width = this.resize.oldWidth + this.resize.end - this.resize.begin;
      }
    },
    /**
     * 表头 缩放 鼠标抬起
     * @param $event
     */
    resizeUp () {
      if (this.resize.begin !== 0) {
        this.resize.begin = 0;
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
</style>
