<template>
  <div>
    <div class="tab">
      <div class="tab-item" v-for="(item, index) in tabs" :class="item.active ? 'clicked' : ''"
           @click="clickTab(item)">
        <i class="tab-item-close" @click.stop="item.closable ? closeTab(item, index) : ''"
           v-html="item.closable ? getIconDom('close', 16) : ''"></i>
        <div class="tab-item-icon" v-show="item.icon" v-html="getIconDom(item.icon, 25)"></div>
        <div class="tab-item-title">{{item.name}}</div>
      </div>
    </div>
    <div class="content">
      <div class="menu">
        <div class="menu-group" v-for="(menuGroup) in menus">
          <div class="menu-group" v-for="(menuItem) in menuGroup">
            <div class="menu-item" v-if="menuItem.length > 0" v-for="item in menuItem"
                 :title="item.title" v-html="getIconDom(item.icon, 18)"></div>
            <div class="menu-item" v-else>
              <label class="menu-item-search">
                <i class="menu-item-search-icon" v-html="getIconDom('query', 14)"></i>
                <input class="menu-item-search-input" type="text"/>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="content-div">
        <div class="tab-content" v-for="item in tabs" v-show="item.active" :key="item.type + '.' + item.target">
          <component v-if="''!==item.component" :tableArr="item.tableData" :is="item.component"></component>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {reactive, watch, nextTick, readonly, toRefs} from 'vue';
import setting from '../../setting.json';
import Table from './Table.vue';
import Query from './Query.vue';
import {mysqlCore} from '../mysql-core';
import {query, SQL_DEF} from '../util-mysql';
const DEFAULT_ACTIVE = 'table';
export default {
  components: {'Table': Table, 'Query': Query},
  props: {
    activeObj: {
      type: String,
      default: JSON.stringify({option: DEFAULT_ACTIVE, tab: DEFAULT_ACTIVE}),
      required: true,
    },
  },
  setup (props, context) {
    /**
     * header数据
     * @property {String} title header居中展示的名字
     * @property {Array} options 数据库功能项即其它功能数组
     * @property {Object} icon 功能项使用的图标
     */
    let mainData = reactive({
      /**
       * 标签页 数组
       * @example
       */
      tabs: [
        {
          type: 'table', // 组件类型
          name: '对象', // 页签名称
          closable: false, // 可关闭
          icon: '', // 图标
          active: true, // 选中
          target: 'table', // 用于反向查找的标识
          tableData: {
            thead: [
              {title: '名称', width: 100, val: 'Name'}, {title: '行', width: 100, val: 'Rows'},
              {title: '数据长度', width: 100, val: 'Data_length'}, {title: '引擎', width: 100, val: 'Engine'},
              {title: '创建日期', width: 100, val: 'Create_time'}, {title: '修改日期', width: 100, val: 'Update_time'},
              {title: '排序规则', width: 100, val: 'Collation'}, {title: '注释', width: 100, val: 'Comment'},
            ],
            tbody: [],
          }, // 组件内引用的组件的数据
          component: 'Table', // 引用的组件name值
        },
      ],
      menus: [],
      icon: '',
    });

    const menusData = readonly({
      'table': [
        [
          {icon: 'open', title: '打开表', available: false},
          {icon: 'edit', title: '设计表', available: false},
          {icon: 'new', title: '新建表', available: false},
          {icon: 'del', title: '删除表', available: false},
        ],
        [
          {icon: 'import', title: '导入向导', available: false},
          {icon: 'export', title: '导出向导', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: false}],
      ],
      'views': [
        [
          {icon: 'open', title: '打开视图', available: false},
          {icon: 'edit', title: '设计视图', available: false},
          {icon: 'new', title: '新建视图', available: false},
          {icon: 'del', title: '删除视图', available: false},
        ],
        [{icon: 'export', title: '导出向导', available: false}],
        [{icon: 'reload', title: '视图', available: false}],
      ],
      'fn': [
        [
          {icon: 'edit', title: '设计函数', available: false},
          {icon: 'new', title: '新建函数', available: false},
          {icon: 'del', title: '删除函数', available: false},
        ],
        [{icon: 'run', title: '运行函数', available: false}],
        [{icon: 'reload', title: '刷新', available: false}],
      ],
      'event': [
        [
          {icon: 'edit', title: '设计事件', available: false},
          {icon: 'new', title: '新建事件', available: false},
          {icon: 'del', title: '删除事件', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: false}],
      ],
      'user': [
        [
          {icon: 'edit', title: '编辑用户', available: false},
          {icon: 'new', title: '新建用户', available: false},
          {icon: 'del', title: '删除用户', available: false},
        ],
        [{icon: 'jurisdiction', title: '权限管理员', available: false}],
        [{icon: 'reload', title: '刷新', available: false}],
      ],
      'query': [
        [
          {icon: 'edit', title: '设计查询', available: false},
          {icon: 'new', title: '新建查询', available: false},
          {icon: 'del', title: '删除查询', available: false},
        ],
        [{icon: 'export', title: '导出向导', available: false}],
        [{icon: 'reload', title: '刷新', available: false}],
      ],
      'backup': [
        [
          {icon: 'open', title: '还原备份', available: false},
          {icon: 'new', title: '新建备份', available: false},
          {icon: 'del', title: '删除备份', available: false},
          {icon: 'edit', title: '提取SQL', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: false}],
      ],
      'autoRun': [
        [
          {icon: 'edit', title: '设计批处理作业', available: false},
          {icon: 'new', title: '新建批处理作业', available: false},
          {icon: 'del', title: '删除批处理作业', available: false},
        ],
        [
          {icon: 'new', title: '设置计划', available: false},
          {icon: 'del', title: '删除计划', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: false}],
      ],
      'model': [
        [
          {icon: 'edit', title: '设计模型', available: false},
          {icon: 'new', title: '新建模型', available: false},
          {icon: 'del', title: '删除模型', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: false}],
      ],
      'def': [
        [
          {icon: 'table', title: '视图', available: false}, {icon: 'list', title: '视图', available: false},
          {icon: 'er', title: '视图', available: false},
        ],
        [],
      ],
      'newQuery': [
        [{icon: 'export', title: '保存', available: false}],
        [
          {icon: 'edit', title: '查询创建工具', available: false},
          {icon: 'new', title: '格式化SQL', available: false},
          {icon: 'del', title: '代码段', available: false},
        ],
      ],
    });
    /**
     * 初始化图标对象
     * @return {Object} 图标对象
     */
    const initIcon = () => {
      let action = Object.assign({}, setting.icon.action);
      let menu = Object.assign({}, setting.icon.menu);
      for (let menuKey in menu) {
        if (action.hasOwnProperty(menuKey)) {
          action[menuKey] = Object.assign({}, action[menuKey], menu[menuKey]);
        } else {
          action[menuKey] = menu[menuKey];
        }
      }
      return action;
    };
    /**
     * 获取图标dom字符串
     * @param {String} icon 图标名称
     * @param {String} size 图标大小
     * @return {Document} icon dom节点
     */
    const getIconDom = (icon, size) => {
      if (mainData.icon.hasOwnProperty(icon)) {
        return mainData.icon[icon].hasOwnProperty(size) ? mainData.icon[icon][size] : mainData.icon[icon];
      }
      return '';
    };
    /**
     * 初始化选中的选项
     * @param {Object} item 标记选中的选项
     */
    const clickTab = (item) => {
      mainData.tabs.map((one) => {
        one.active = false;
      });
      item.active = true;
      item.target === 'newQuery' ? mainData.menus.splice(1, 1) : '';
      (item.target === 'newQuery' && item.component === '') ? item.component = 'Query' : '';
      // 初始化菜单数组内容
      mainData.menus = [menusData[item.target], menusData.def];
      updateTableData(item, getActiveObj().asideData || '');
    };
    /**
     * 关闭tab标签页
     * @param {Object} item 当前标签页的数组内的对象
     * @param {Number} index 当前标签页对象所在数组的下标
     */
    const closeTab = (item, index) => {
      mainData.tabs.splice(index, 1);
      clickTab(mainData.tabs[mainData.tabs.length-1], mainData.tabs.length-1);
    };
    /**
     * 更新默认表格的数据
     * @param {Object} item 当前标签页的数组内的对象
     * @param {Number} tableItem 当前链接的数据库链接选中的数据库对象
     */
    const updateTableData = (item, tableItem) => {
      if (!item.hasOwnProperty('tableData')) {
        item.tableData = {tbody: [], thead: []};
      }
      item.tableData['tbody'] = [];
      if ('' === tableItem) {
        return;
      }
      mysqlCore.getConnection({id: tableItem.id}).then((connection) => {
        switch (getActiveObj().option) {
          case 'table':
            item.tableData.thead = [
              {title: '名称', width: 100, val: 'Name'}, {title: '行', width: 100, val: 'Rows'},
              {title: '数据长度', width: 100, val: 'Data_length'}, {title: '引擎', width: 100, val: 'Engine'},
              {title: '创建日期', width: 100, val: 'Create_time'}, {title: '修改日期', width: 100, val: 'Update_time'},
              {title: '排序规则', width: 100, val: 'Collation'}, {title: '注释', width: 100, val: 'Comment'},
            ];
            query(connection, SQL_DEF.TABLE_STATE).then((res) => {
              res?.length > 0 ? item.tableData.tbody = res : '';
            });
            break;
          case 'views':
            item.tableData.thead = [
              {title: '名称', width: 100, val: 'TABLE_NAME'},
              {title: 'SQL安全性', width: 100, val: 'CHECK_OPTION'},
              {title: '检查选项', width: 100, val: 'SECURITY_TYPE'},
              {title: '可以更新', width: 100, val: 'IS_UPDATABLE'},
              {title: '定义者', width: 100, val: 'DEFINER'},
            ];
            query(connection, SQL_DEF.ALL_VIEWS, [tableItem.title]).then((res) => {
              res?.length > 0 ? item.tableData.tbody = res : '';
            });
            break;
          case 'fn':
            item.tableData.thead = [
              {title: '名称', width: 100, val: 'Name'},
              {title: 'SQL安全性', width: 100, val: 'Security_type'},
              {title: '类型', width: 100, val: 'Type'},
              {title: '定义者', width: 100, val: 'Definer'},
              {title: '注释', width: 100, val: 'Comment'},
              {title: '创建日期', width: 100, val: 'Created'},
              {title: '修改日期', width: 100, val: 'Modified'},
            ];
            Promise.all([
              query(connection, SQL_DEF.SHOW_PROCEDURE, [tableItem.title]),
              query(connection, SQL_DEF.SHOW_FUNCTION, [tableItem.title]),
            ]).then((res) => {
              res?.length > 0 ? item.tableData.tbody = res.flat(Infinity) : '';
            });
            break;
          case 'event':
            item.tableData.thead = [
              {title: '名称', width: 100, val: 'Name'},
              {title: '定义者', width: 100, val: 'Definer'},
              {title: '类型', width: 100, val: 'Type'},
              {title: '状态', width: 100, val: 'Definer'},
              {title: '上次运行', width: 100, val: 'Created'},
              {title: '注释', width: 100, val: 'Comment'},
              {title: '创建日期', width: 100, val: 'Created'},
              {title: '修改日期', width: 100, val: 'Modified'},
            ];
            break;
          case 'query':
            item.tableData.thead = [
              {title: '名称', width: 100, val: 'Name'},
              {title: '文件大小', width: 100, val: 'Security_type'},
              {title: '创建的用户', width: 100, val: 'Type'},
              {title: '修改的用户', width: 100, val: 'Type'},
              {title: '访问时间', width: 100, val: 'Comment'},
              {title: '创建日期', width: 100, val: 'Created'},
              {title: '修改日期', width: 100, val: 'Modified'},
            ];
            break;
          case 'backup':
            item.tableData.thead = [
              {title: '名称', width: 100, val: 'Name'},
              {title: '文件大小', width: 100, val: 'Security_type'},
              {title: '访问时间', width: 100, val: 'Comment'},
              {title: '创建日期', width: 100, val: 'Created'},
              {title: '修改日期', width: 100, val: 'Modified'},
            ];
            break;
        }
      });
    };
    /**
     * 根据props的activeTab的值获取当前tab数据的元素
     * @return {Object} mainData.tabs[i]
     */
    const getTabItemFromActiveTab = () => {
      let item = mainData.tabs.filter((one) => {
        if (one.target === getActiveObj().tab && one.target === getActiveObj().option) {
          if ('newQuery' === getActiveObj().option) {
            return '';
          } else {
            return one;
          }
        }
      })[0] || '';
      if ('' === item) {
        switch (getActiveObj().option) {
          case 'newQuery':
            mainData.tabs.push({
              type: 'query', name: '新查询',
              closable: true, icon: 'query', active: true, target: 'newQuery', component: '',
            });
            return mainData.tabs[mainData.tabs.length - 1];
          case 'query':
            if (DEFAULT_ACTIVE === getActiveObj().tab) {
              mainData.tabs[0].target = getActiveObj().option;
              return mainData.tabs[0];
            } else {
              mainData.tabs.push({
                type: 'table', name: '',
                tableData: {thead: [], tbody: []},
                closable: true, icon: 'query', active: true, table: 'query', component: '',
              });
              return mainData.tabs[mainData.tabs.length - 1];
            }
          default:
            mainData.tabs[0].target = getActiveObj().option;
            return mainData.tabs[0];
        }
      } else {
        return item;
      }
    };
    /**
     * 获取active对象
     * return {Object} activeObj active对象
     */
    const getActiveObj = () => JSON.parse(JSON.stringify(JSON.parse(props.activeObj)));
    mainData.icon = initIcon();
    clickTab(getTabItemFromActiveTab());
    /**
     * 自响应 选择的tab标签的改变
     */
    watch(() => props.activeObj, () => clickTab(getTabItemFromActiveTab()));
    return {...toRefs(mainData), getIconDom, clickTab, closeTab};
  },
};
</script>
<style scoped lang="scss">
  .main {
    min-height: 409px;
    flex-direction: column;
    justify-content: flex-start;
    flex: 1 1 auto;
    overflow-x: hidden;

    .tab, .content, .menu, .menu-group, .menu-item, .content-div, .tab-item, .tab-item-icon, .tab-item-title {
      display: flex;
    }

    .tab {
      height: 30px;
      flex-direction: row;
      justify-content: flex-start;
      overflow-x: hidden;
      flex: 0 0 auto;
      background-color: #323232;

      .tab-item {
        flex-direction: row;
        justify-content: flex-start;
        max-width: 219px;
        min-width: 103px;
        border-right: 1px solid #898989;
        flex: 1 1 auto;
        transition: .1s;

        .tab-item-close, .tab-item-icon {
          width: 20px;
        }

        .tab-item-icon {
          margin: 0 2px;
        }

        .tab-item-close {
          margin-left: 4px;
          text-align: right;
          line-height: 30px;
          opacity: 0;
        }

        &:hover .tab-item-close {
          opacity: 1;
        }

        .tab-item-title {
          flex: 1 1 auto;
          text-align: center;
          justify-content: center;
          padding-right: 26px;
          font-size: 12px;
          line-height: 30px;
          color: #fff;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
        }
      }

      .clicked {
        background-color: #1e1e1e;
      }
    }

    .content {
      height: auto;
      flex-direction: column;
      justify-content: flex-start;
      flex: 1 1 auto;
      overflow-x: auto;
      overflow-y: hidden;

      .menu {
        height: 36px;
        width: 100%;
        background-color: #1e1e1e;
        flex: 0 0 auto;
        flex-direction: row;
        justify-content: space-between;

        .menu-group {
          flex-direction: row;
          justify-content: flex-start;

          .menu-group {
            margin: 8px 0 8px 7px;
            padding-right: 7px;
            border-right: 1px solid #efefef;

            &:last-child {
              border-right: none;
            }

            .menu-item {
              margin: 0 7px;

              .menu-item-search, .menu-item-search-icon, .menu-item-search-input {
                display: flex;
              }

              .menu-item-search {
                height: 20px;
                position: relative;
                flex-direction: row;
                justify-content: space-between;

                .menu-item-search-icon {
                  position: absolute;
                  padding: 4px 4px 2px 4px;
                }

                .menu-item-search-input {
                  width: 174px;
                  background-color: transparent;
                  padding: 0 0 0 20px;
                  border: 1px solid #5c5c5c;
                  border-radius: 2px;
                  color: #fefefe;
                }
              }
            }
          }
        }
      }

      .content-div {
        width: 100%;
        height: auto;
        min-height: 343px;
        flex: 1 1 auto;
        background-color: #202125;

        .tab-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      }
    }
  }
</style>
