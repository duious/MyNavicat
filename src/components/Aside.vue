<template>
  <Resizer :type="'right'" :rank="[200,500]">
    <component v-if="''!==component" :treeArr="linkArr" :is="component" @dblclick="dblclick"
               @linkClick="linkClick" @linkContextMenu="linkContextMenu"></component>
  </Resizer>
</template>
<script>
import {ref, reactive, computed, nextTick, toRefs, watch} from 'vue';
import {msg} from '../message';
import {mysqlCore} from '../mysql-core';
import {query, SQL_DEF} from '../util-mysql';
import setting from '../../setting.json';
import Tree from './Tree.vue';
import Resizer from './Resizer.vue';

export default {
  components: {'Tree': Tree, 'Resizer': Resizer},
  props: {
    activeObj: {
      type: String,
      default: JSON.stringify({option: 'table'}),
    },
  },
  setup (props, context) {
    /**
     * header数据
     * @property {String} component tree组件名称
     * @property {Array} linkArr 数据库链接列表
     * @property {Object} focusItem 标记选中的数据库链接项目
     */
    let asideData = reactive({
      /**
       * 同 {@link ../ Index组件data.linkArr}
       */
      linkArr: [],
      focusItem: {
        item: {
          'id': '', 'type': 'db', 'title': '',
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
        index: -1,
      },
      component: '',
    });

    // 响应：更新链接列表
    msg.on(setting.path.action.update.link.path, () => {
      emit('getLinkArr', updateLinkList);
    });
    // 响应：打开选中的链接
    msg.on(setting.path.menu.open.link.path, () => {
      connectionOpen();
    });
    // 响应：关闭选中的链接
    msg.on(setting.path.menu.close.link.path, () => {
      connectionClose();
    });
    // 响应：打开选中的库
    msg.on(setting.path.menu.open.db.path, () => {
      dbOpen();
    });
    // 响应：关闭选中的库
    msg.on(setting.path.menu.close.db.path, () => {
      dbClose();
    });
    // 响应：打开选中的表
    msg.on(setting.path.menu.open.table.path, () => {
      tableOpen();
    });
    // 响应：关闭选中的表
    msg.on(setting.path.menu.close.table.path, () => {
      tableClose();
    });


    /**
     * 初始化：获取当前存储的所有链接
     */
    const initLinkList = () => {
      msg.send(setting.path.disk.get.path, {key: setting.disk.key.link}).then((res) => {
        mysqlCore.resetLink();
        for (let i = 0; i < res.res.length; i++) {
          mysqlCore.setLink({index: i, item: res.res[i]});
        }
        updateLinkList();
      });
    };
    /**
     * 更新链接列表
     * @param {Array} linkArr
     */
    const updateLinkList = () => {
      asideData.component = '';
      asideData.linkArr = computed(() => mysqlCore.getLink());
      asideData.component = 'Tree';
    };
    /**
     * 左键单击链接元素
     * @param {Object} item 链接对象
     * @param {number} index 所在数组下标
     */
    const linkClick = (item, index) => {
      resetLinkClicked(asideData.linkArr);
      asideData.focusItem.item = item;
      item.state.clicked = true;
      asideData.focusItem.index = index;
      let asideItem = '';
      if (asideData.focusItem.item.id.split('.').length >= 3) {
        asideData.linkArr.filter((one) => {
          if (one.id == asideData.focusItem.item.id.split('.')[0]) {
            one.children.filter((two) => {
              if (two.id.split('.')[1] == asideData.focusItem.item.id.split('.')[1]) {
                let {id, title, type, state, children} = two;
                asideItem = {id, title, type, state, children};
              }
            });
          }
        });
        // asideItem?.children.filter((one) => {
        //   if (one.type === asideData.focusItem.item.type) {
        //     asideItem.children = one.children;
        //   }
        // });
      }
      asideData.focusItem.item.type.indexOf('.') === -1 ? context.emit('optionClick', asideData.focusItem.item.type, asideItem) : context.emit('optionClick', asideData.focusItem.item.type.split('.')[1], asideItem);
    };
    /**
     * 左键双击链接元素
     * @param {Object} item 链接对象
     * @param {number} index 所在数组下标
     * @param {clickEvent} event 点击事件
     */
    const dblclick = (item, index, event) => {
      resetLinkClicked(asideData.linkArr);
      nextTick(() => {
        linkClick(item, index);
        if (!item.state.open) {
          switch (item.id.split('.').length) {
            case 1:
              connectionOpen();
              break;
            case 2:
              dbOpen();
              break;
            case 3:
              item.state.open = true;
              break;
            case 4:
              tableOpen();
              break;
          }
        }
      });
    };
    /**
     * 右键单击链接元素
     * @param {Object} item 链接对象
     * @param {number} index 所在数组下标
     */
    const linkContextMenu = (item, index) => {
      resetLinkClicked(asideData.linkArr);
      asideData.focusItem.item = item;
      item.state.clicked = true;
      asideData.focusItem.index = index;
      let postItem = {
        id: item.id, title: item.title, state: item.state, type: item.type,
      };
      if (String(asideData.focusItem.item.id).indexOf('.') === -1) {
        msg.send(setting.path.menu.open.path, {
          params: setting.path.menu.open.params.link,
          item: JSON.parse(JSON.stringify(postItem)),
        });
      } else {
        item.type === 'db' ?
            msg.send(setting.path.menu.open.path, {
              params: setting.path.menu.open.params.db,
              item: JSON.parse(JSON.stringify(postItem)),
            }) :
            msg.send(setting.path.menu.open.path, {
              params: setting.path.menu.open.params.table,
              item: JSON.parse(JSON.stringify(postItem)),
            });
      }
      postItem = '';
    };
    /**
     * 重置链接点击状态
     * @param {Array} linkArr
     */
    const resetLinkClicked = (linkArr) => {
      linkArr.filter((one) => {
        one.state.clicked ? one.state.clicked = false : '';
        one.children && 0 < one.children.length ? resetLinkClicked(one.children) : '';
      });
    };
    /**
     * 建立链接
     */
    const connectionOpen = () => {
      let focusId = asideData.focusItem.item.id.split('.')[0];
      mysqlCore.getConnection({id: focusId}).then((connection) => {
        query(connection, SQL_DEF.SCHEMA_NAME).then((res) => {
          let resItem = '';
          asideData.focusItem.item.children = [];
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
            asideData.focusItem.item.children.push(resItem);
            mysqlCore.setDb({id: resItem.id, item: resItem});
          }
          mysqlCore.setLinkState({id: focusId, stateItem: ['open', 'linked'], to: true});
          updateLinkList();
        });
      });
    };
    /**
     * 断开链接
     */
    const connectionClose = () => {
      mysqlCore.closeLink({id: asideData.focusItem.item.id});
      mysqlCore.setLinkState({id: asideData.focusItem.item.id, stateItem: ['linked', 'open'], to: false});
      updateLinkList();
    };
    /**
     * 初始化 数据库 库内表 列表
     * @param {Object} item 选中的库
     * @param {Array} res 返回的结果
     */
    const initDBTable = (item, res) => {
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
    };
    /**
     * 打开库
     */
    const dbOpen = () => {
      let focusId = asideData.focusItem.item.id.split('.')[0];
      mysqlCore.getConnection({id: focusId}).then((connection) => {
        query(connection, SQL_DEF.ALL_TABLE, [asideData.focusItem.item['title']]).then((res) => {
          initDBTable(asideData.focusItem.item, res);
          mysqlCore.setDbState({id: asideData.focusItem.item.id, stateItem: ['linked', 'open'], to: true});
          nextTick(() => {
            updateLinkList();
          });
        });
      });
    };
    /**
     * 关闭库
     */
    const dbClose = () => {
      mysqlCore.setDbState({id: asideData.focusItem.item.id, stateItem: ['linked', 'open'], to: false});
      updateLinkList();
    };
    /**
     * 打开表
     */
    const tableOpen = () => {
      mysqlCore.setDbState({id: asideData.focusItem.item.id, stateItem: ['linked', 'open'], to: true});
      updateLinkList();
      let no = new Date().getTime();
      msg.emit(setting.path.root.creat.path, {params: {name: asideData.focusItem.item.title, table: 'query', no: no}});
      msg.on(setting.path.action.update.tableDef.path + '/' + no + 'get', () => {
        let parent = asideData.linkArr.find((one) => {
          if (one.id == asideData.focusItem.item.id.split('.')[0]) {
            return one;
          }
        }).children.find((one) => {
          if (one.id.split('.')[1] == asideData.focusItem.item.id.split('.')[1]) {
            return one;
          }
        });
        msg.emit(setting.path.action.update.tableDef.path + '/' + no, {
          item: asideData.focusItem.item, parent: parent,
        });
      });
    };
    /**
     * 关闭表
     */
    const tableClose = () => {
      mysqlCore.setDbState({id: asideData.focusItem.item.id, stateItem: ['linked', 'open'], to: false});
      updateLinkList();
    };
    /**
     * 选中数据库链接的元素项
     */
    const focusLinkItem = () => {
      if (asideData.focusItem.index > -1 && asideData.focusItem.item.id.indexOf('.') > -1) {
        let isNeed = false;
        if (asideData.focusItem?.item?.type == getActiveObj().option) {
          return; ;
        }
        mysqlCore.dbChildrenObj({id: '_'}).filter((one) => {
          if (one.type.split('.')[1] == getActiveObj().option) {
            isNeed = true;
          }
        });
        if (!isNeed) {
          return;
        }
        resetLinkClicked(asideData.linkArr);
        asideData.linkArr.filter((one) => {
          if (one.id == asideData.focusItem.item.id.split('.')[0]) {
            one.children.filter((two) => {
              if (two.id.split('.')[1] == asideData.focusItem.item.id.split('.')[1]) {
                two.children.filter((three) => {
                  if (three.type.split('.')[1] == getActiveObj().option) {
                    three.state.clicked = true;
                  }
                });
              }
            });
          }
        });
        // cellDom.scrollIntoViewIfNeeded();
      }
    };
    /**
     * 获取active对象
     * @return {Object} activeObj active对象
     */
    const getActiveObj = () => JSON.parse(JSON.stringify(JSON.parse(props.activeObj)));
    initLinkList();
    /**
     * 自响应 选择的header的option的改变
     */
    watch(() => props.activeObj, () => focusLinkItem());
    return {...toRefs(asideData), linkClick, dblclick, linkContextMenu};
  },
};
</script>
<style scoped lang="scss">
  ::-webkit-scrollbar-track {
    margin-top: 0;
  }
</style>
