<template>
  <div>
    <div class="tab">
      <div class="tab-item" v-for="(item,index) in tabs" :class="item.active?'clicked':''"
           @click="clickTab(item,index)">
        <i class="tab-item-close" @click.stop="item.closable?closeTab(item,index):''"
           v-html="item.closable?icon.close['16']:''"></i>
        <div class="tab-item-icon" v-show="item.icon" v-html="getIconDom(item.icon)"></div>
        <div class="tab-item-title">{{item.name}}</div>
      </div>
    </div>
    <div class="content">
      <div class="menu">
        <div class="menu-group" v-for="(menuGroup) in menus">
          <div class="menu-group" v-for="(menuItem) in menuGroup">
            <div class="menu-item" v-if="menuItem.length>0" v-for="item in menuItem"
                 :title="item.title" v-html="icon[item.icon]['18']"></div>
            <div class="menu-item" v-else>
              <label class="menu-item-search">
                <i class="menu-item-search-icon" v-html="icon.query['14']"></i>
                <input class="menu-item-search-input" type="text"/>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="table">
        <div class="table-scroll" v-for="item in tabs" v-show="item.active" :key="item.type + item.no">
          <component v-if="''!==item.component" :tableArr="item.tableData" :is="item.component"></component>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import setting from '../../setting.json';
import Table from './Table.vue';
import Query from './Query.vue';
import {mysqlCore} from '../mysql-core';
import {query, SQL_DEF} from '../util-mysql';

export default {
  components: {'Table': Table, 'Query': Query},
  data () {
    return {
      /**
       * 标签页 数组
       * @example
       */
      tabs: [
        {
          type: 'table', name: '对象', no: '', closable: false, icon: '', active: true, table: 'table',
          tableData: {
            thead: [
              {title: '名称', width: 100, val: 'Name'}, {title: '行', width: 100, val: 'Rows'},
              {title: '数据长度', width: 100, val: 'Data_length'}, {title: '引擎', width: 100, val: 'Engine'},
              {title: '创建日期', width: 100, val: 'Create_time'}, {title: '修改日期', width: 100, val: 'Update_time'},
              {title: '排序规则', width: 100, val: 'Collation'}, {title: '注释', width: 100, val: 'Comment'},
            ],
            tbody: [],
          },
          component: 'Table',
        },
      ],
      menus: [],
      menusData: {
        table: [
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
        view: [
          [
            {icon: 'open', title: '打开视图', available: false},
            {icon: 'edit', title: '设计视图', available: false},
            {icon: 'new', title: '新建视图', available: false},
            {icon: 'del', title: '删除视图', available: false},
          ],
          [{icon: 'export', title: '导出向导', available: false}],
          [{icon: 'view', title: '视图', available: false}],
        ],
        fn: [
          [
            {icon: 'edit', title: '设计函数', available: false},
            {icon: 'new', title: '新建函数', available: false},
            {icon: 'del', title: '删除函数', available: false},
          ],
          [{icon: 'view', title: '运行函数', available: false}],
          [{icon: 'reload', title: '刷新', available: false}],
        ],
        event: [
          [
            {icon: 'edit', title: '设计事件', available: false},
            {icon: 'new', title: '新建事件', available: false},
            {icon: 'del', title: '删除事件', available: false},
          ],
          [{icon: 'reload', title: '刷新', available: false}],
        ],
        user: [
          [
            {icon: 'edit', title: '编辑用户', available: false},
            {icon: 'new', title: '新建用户', available: false},
            {icon: 'del', title: '删除用户', available: false},
          ],
          [{icon: 'view', title: '权限管理员', available: false}],
          [{icon: 'reload', title: '刷新', available: false}],
        ],
        query: [
          [
            {icon: 'edit', title: '设计查询', available: false},
            {icon: 'new', title: '新建查询', available: false},
            {icon: 'del', title: '删除查询', available: false},
          ],
          [{icon: 'export', title: '导出向导', available: false}],
          [{icon: 'reload', title: '刷新', available: false}],
        ],
        backup: [
          [
            {icon: 'open', title: '还原备份', available: false},
            {icon: 'new', title: '新建备份', available: false},
            {icon: 'del', title: '删除备份', available: false},
            {icon: 'edit', title: '提取SQL', available: false},
          ],
          [{icon: 'reload', title: '刷新', available: false}],
        ],
        autoRun: [
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
        model: [
          [
            {icon: 'edit', title: '设计模型', available: false},
            {icon: 'new', title: '新建模型', available: false},
            {icon: 'del', title: '删除模型', available: false},
          ],
          [{icon: 'reload', title: '刷新', available: false}],
        ],
        def: [
          [
            {icon: 'table', title: '视图', available: false}, {icon: 'list', title: '视图', available: false},
            {icon: 'er', title: '视图', available: false},
          ],
          [],
        ],
        newQuery: [
          [{icon: 'export', title: '保存', available: false}],
          [
            {icon: 'edit', title: '查询创建工具', available: false},
            {icon: 'new', title: '格式化SQL', available: false},
            {icon: 'del', title: '代码段', available: false},
          ],
        ],
      },
      icon: Object.assign({}, setting.icon.action, setting.icon.menu, setting.icon.action),
      item: '',
    };
  },
  created () {
    let _this = this;
    _this.menus = [_this.menusData.table, _this.menusData.def];
    /**
     * 前往指定tab页
     */
    _this.$message.$on(setting.path.root.go.path, (res) => {
      _this.clickTab(_this.tabs.find((item) => {
        if (res.params.path == item.no) {
          item.table = res.params.table;
          return item;
        }
      }));
    });
    /**
     * 新建tab页
     */
    _this.$message.on(setting.path.root.creat.path, (res) => {
      if ('newQuery' === res.params.table) {
        _this.tabs.push({
          type: 'query', name: '新查询', no: new Date().getTime(),
          closable: true, icon: 'query', active: true, table: 'newQuery', component: '',
        });
        _this.clickTab(_this.tabs[_this.tabs.length - 1], _this.tabs.length - 1);
      }
      if ('query' === res.params.table) {
        _this.tabs.push({
          type: 'table', name: res.params.name, no: res.params.no, tableData: {thead: [], tbody: []},
          closable: true, icon: 'query', active: true, table: 'query', component: '',
        });
        _this.clickTab(_this.tabs[_this.tabs.length - 1], _this.tabs.length - 1);
      }
    });
  },
  methods: {
    getIconDom (icon) {
      return this.icon[icon] && this.icon[icon]['16'].indexOf('svg') !== -1 ? this.icon[icon]['16'] : this.icon[icon];
    },
    clickTab (item) {
      let _this = this;
      _this.tabs.find((tar) => {
        _this.$nextTick( () => {
          tar.active = false;
        });
      });
      _this.$nextTick(() => {
        item.active = true;
      });
      _this.$nextTick(() => {
        _this.menus = [_this.menusData[item.table], _this.menusData.def];
        item.table === 'newQuery' ? _this.menus.splice(1, 1) : '';
        (item.table === 'newQuery' && item.component === '') ? item.component = 'Query' : '';
      });
      _this.item = item || '';
      if (_this.item?.tableData?.tbody?.length === 0) {
        _this.$nextTick(() => {
          _this.$message.on(setting.path.action.update.tableDef.path + '/' + item.no || '', (res) => {
            res.item.parent = res.parent;
            _this.updateTableData(_this.item, res.item);
          });
          _this.$message.$emit(setting.path.action.update.tableDef.path + '/' + item.no + 'get', {});
        });
      }
    },
    closeTab (item, index) {
      let _this = this;
      _this.tabs.splice(index, 1);
      _this.clickTab(_this.tabs[_this.tabs.length-1], _this.tabs.length-1);
    },
    updateTableData (item, tableItem) {
      console.error(item);
      mysqlCore.getConnection({id: tableItem.id.split('.')[0]}).then((connection) => {
        query(connection, SQL_DEF.SHOW_COLUMNS, [tableItem.parent['title'], tableItem['title']]).then((res) => {
          item.tableData.thead = [];
          if (res && res.length > 0) {
            // Default: null
            // Extra: ""
            // Field: "uuid_no"
            // Key: "PRI"
            // Null: "NO"
            // Type: "varchar(36)"
            for (let i = 0; i < res.length; i++) {
              item.tableData.thead.push({title: res[i]['Field'], width: 100, val: res[i]['Field']});
            }
          }
        });
        query(connection, SQL_DEF.SELECT_ALL_FROM_TABLE, [tableItem.parent['title'], tableItem['title']]).then((res) => {
          item.tableData.tbody = res || [];
          item.component = 'Table';
        });
      });
    },
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

    .tab, .content, .menu, .menu-group, .menu-item, .table, .tab-item, .tab-item-icon, .tab-item-title {
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

      .table {
        width: 100%;
        height: auto;
        min-height: 343px;
        flex: 1 1 auto;
        background-color: #202125;

        .table-scroll {
          width: 100%;
          height: 100%;
          overflow: auto;
        }
      }
    }
  }
</style>
