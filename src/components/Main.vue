<template>
  <div>
    <component v-if="'' !== slideTabObj.component"
               :is="slideTabObj.component"
               :slideTabArr="slideTabObj.arr"
               @clickTabItem="clickTab"
               @closeTabItem="closeTab"
               :key="0 + '.' + slideTabObj.component"></component>
    <div class="content">
      <component v-if="'' !== menuBarObj.component"
                 :is="menuBarObj.component"
                 :menuBarObj="menuBarObj.obj"
                 @filterTableData="filterTableName"
                 @menuBarItemClick="menuClick"
                 :key="0 + '.' + menuBarObj.component"></component>
      <div class="content-div">
        <div class="tab-content"
             v-for="(item, index) in tabs"
             v-show="item.active"
             :key="item.target + '.' + index">
          <component v-if="'Table'===item.component"
                     :tableArr="item.tableData"
                     :is="item.component"
                     :key="index + '.' + item.component"></component>
          <component v-if="'Query'===item.component"
                     :is="item.component"
                     :key="index + '.' + item.component"></component>
          <component v-if="'TabEditor'===item.component"
                     :editObj="item.editObj"
                     :is="item.component"
                     @tabsItemClick="tabsItemClick"
                     :key="index + '.' + item.component"></component>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {reactive, watch, nextTick, toRefs} from 'vue';
import setting from '../../setting.json';
import {debounce, throttle} from 'throttle-debounce';
import Table from './Table.vue';
import SlideTab from './SlideTab.vue';
import MenuBar from './MenuBar.vue';
import Query from './Query.vue';
import TabEditor from './TabEditor.vue';
import {mysqlCore} from '../mysql-core';
import {query, SQL_DEF} from '../util-mysql';
const DEFAULT_ACTIVE = 'table';
export default {
  components: {'SlideTab': SlideTab, 'MenuBar': MenuBar, 'Table': Table, 'Query': Query, 'TabEditor': TabEditor},
  props: {
    activeObj: {
      type: String,
      default: JSON.stringify({option: DEFAULT_ACTIVE, tab: DEFAULT_ACTIVE}),
      required: true,
    },
  },
  /**
   * @param {Object} props 组件入参
   * @param {Object} context 当前上下文方法
   * @return {Object} Object
   */
  setup (props, context) {
    /**
     * main数据
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
          name: '对象', // 页签名称
          closable: false, // 可关闭
          icon: '', // 图标
          active: true, // 选中
          target: 'table', // 组件类型&用于反向查找的标识
          tableData: {
            thead: [
              {title: '名称', width: 100, val: 'Name'}, {title: '行', width: 100, val: 'Rows'},
              {title: '数据长度', width: 100, val: 'Data_length'}, {title: '引擎', width: 100, val: 'Engine'},
              {title: '创建日期', width: 100, val: 'Create_time'}, {title: '修改日期', width: 100, val: 'Update_time'},
              {title: '排序规则', width: 100, val: 'Collation'}, {title: '注释', width: 100, val: 'Comment'},
            ],
            tbody: [],
          }, // 组件内引用的组件的数据
          editObj: {},
          component: 'Table', // 引用的组件name值
        },
      ],
      tableName: '',
      menuBarObj: {component: '', obj: ''},
      slideTabObj: {component: '', arr: ''},
    });
    /**
     *
     * @param {Object} item
     * @param {Boolean} reload
     */
    const loadTabItemComponent = (item, reload = false) => {
      if (reload === true && item.component === '') {
        item.component = '';
      }
      switch (item.target) {
        case 'table':
          item.component = 'Table';
          break;
        case 'newQuery':
          item.component = 'Query';
          break;
        case 'tabEditor':
          item.component = 'TabEditor';
          break;
      }
    };
    /**
     * 获取activeObj的被选中的item
     * @return {Object} linkArr item
     */
    const getClickedLinkedItem = () => {
      if (!getActiveObj()?.asideData) {
        return '';
      }
      for (let val of getActiveObj().asideData.children) {
        if (val.state.clicked) {
          return val;
        }
        if (val?.type?.split('.')[1] === getActiveObj().option) {
          for (let valChild of val.children) {
            if (valChild.state.clicked) {
              return valChild;
            }
          }
        }
      }
      return '';
    };
    /**
     * 初始化选中的选项
     * @param {Object} item 标记选中的选项
     * @param {Number} index 当前标签页对象所在数组的下标
     */
    const clickTab = (item, index = -1) => {
      mainData.tabs.map((one) => {
        one.active = false;
      });
      if (index === -1) {
        item.active = true;
      } else {
        mainData.tabs[index].active = true;
      }
      mainData.slideTabObj.arr = JSON.stringify(mainData.tabs);
      // 重新加载 快捷菜单项
      mainData.menuBarObj.obj = JSON.stringify({item: item, linkedItem: getClickedLinkedItem()});
      loadTabItemComponent(item, false);
      updateTableData(item, getActiveObj().asideData || '', index === -1 ? getActiveObj().option : mainData.tabs[index].target);
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
     * @param {String} option 当前需要展示的数据的类型
     */
    const updateTableData = (item, tableItem, option) => {
      if (!item.hasOwnProperty('tableData')) {
        item.tableData = {tbody: [], thead: []};
      }
      item.tableData['tbody'] = [];
      if ('' === tableItem) {
        return;
      }
      mysqlCore.getConnection({id: tableItem.id}).then((connection) => {
        switch (option) {
          case 'table':
            item.tableData.thead = [
              {title: '名称', width: 100, val: 'Name'}, {title: '行', width: 100, val: 'Rows'},
              {title: '数据长度', width: 100, val: 'Data_length'}, {title: '引擎', width: 100, val: 'Engine'},
              {title: '创建日期', width: 100, val: 'Create_time'}, {title: '修改日期', width: 100, val: 'Update_time'},
              {title: '排序规则', width: 100, val: 'Collation'}, {title: '注释', width: 100, val: 'Comment'},
            ];
            query(connection, SQL_DEF.TABLE_STATE).then((res) => {
              res?.length > 0 ? item.tableData.tbody = res : '';
              item.tableData.tbody_old = JSON.parse(JSON.stringify(item.tableData.tbody));
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
              item.tableData.tbody_old = JSON.parse(JSON.stringify(item.tableData.tbody));
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
              item.tableData.tbody_old = JSON.parse(JSON.stringify(item.tableData.tbody));
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
              name: '新查询',
              closable: true, icon: 'query', active: true, target: 'newQuery', component: '',
            });
            return mainData.tabs[mainData.tabs.length - 1];
          case 'query':
            if (DEFAULT_ACTIVE === getActiveObj().tab) {
              mainData.tabs[0].target = getActiveObj().option;
              return mainData.tabs[0];
            } else {
              mainData.tabs.push({
                name: '',
                tableData: {thead: [], tbody: []}, editObj: {},
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
     * 菜单 new操作
     * @param {String} option 当前选择的option
     */
    const menuTypeNew = (option) => {
      console.error('click menu = '+ option);
      mainData.tabs.push({
        name: '新建',
        closable: true, icon: option, active: true, target: 'tabEditor', component: '', editObj: '',
      });
      switch (option) {
        case 'table':
          mainData.tabs[mainData.tabs.length - 1].name += '表';
          break;
        case 'views':
          mainData.tabs[mainData.tabs.length - 1].name += '视图';
          break;
        case 'fn':
          mainData.tabs[mainData.tabs.length - 1].name += '函数';
          break;
        case 'event':
          mainData.tabs[mainData.tabs.length - 1].name += '事件';
          break;
        case 'user':
          mainData.tabs[mainData.tabs.length - 1].name += '用户';
          break;
        case 'query':
          mainData.tabs[mainData.tabs.length - 1].target= 'newQuery';
          mainData.tabs[mainData.tabs.length - 1].name += '查询';
          break;
        case 'backup':
          mainData.tabs[mainData.tabs.length - 1].name += '备份';
          break;
        case 'autoRun':
          mainData.tabs[mainData.tabs.length - 1].name += '批处理';
          break;
        case 'model':
          mainData.tabs[mainData.tabs.length - 1].name += '模型';
          break;
      }
      clickTab(mainData.tabs[mainData.tabs.length - 1], mainData.tabs.length - 1);
    };
    /**
     * @param {Object} item 组件入参
     * @param {Object} type 当前上下文方法
     */
    const menuClick = (item, type) => {
      if (!item.available) {
        return;
      }
      console.error('click menu = '+ type, item);
      if ('new' === type) {
        menuTypeNew(getActiveObj().option);
      }
      switch (getActiveObj().option) {
        case 'table':
          break;
        case 'views':
          break;
        case 'fn':
          break;
        case 'event':
          break;
        case 'user':
          break;
        case 'query':
          break;
        case 'backup':
          break;
        case 'autoRun':
          break;
        case 'model':
          break;
      }
    };

    const tabsItemClick = (type) => {

    };
    /**
     * 过滤表名
     */
    const filterTableName = throttle(1500, async () => {
      mainData.tabs.filter((one) => {
        if (one.active) {
          let tbodyData = one?.tableData?.tbody_old || '';
          if (tbodyData === '') {
            return;
          }
          if (mainData.tableName.length === 0) {
            one.tableData.tbody = one.tableData?.tbody_old || one.tableData.tbody;
          }
          if (mainData.tableName.length > 0) {
            let nameKey = '';
            // todo ???
            // let toLCase = (str) => Function.call.bind(String.prototype.toLowerCase(), str);
            one.tableData.thead.filter((headItem) => {
              if (headItem.val.toLowerCase()?.indexOf('name') !== -1) {
                nameKey = headItem.val;
              }
            });
            if (nameKey === '') {
              return;
            }
            one.tableData.tbody = tbodyData.filter((item) => {
              if (item[nameKey]?.indexOf(mainData.tableName) !== -1) {
                return item;
              }
            });
          }
        }
      });
    });
    /**
     * 获取active对象
     * @return {Object} activeObj active对象
     */
    const getActiveObj = () => JSON.parse(JSON.stringify(JSON.parse(props.activeObj)));
    mainData.menuBarObj.component = 'MenuBar';
    mainData.slideTabObj.component = 'SlideTab';
    clickTab(getTabItemFromActiveTab());
    /**
     * 自响应 选择的tab标签的改变
     */
    watch(() => props.activeObj, () => clickTab(getTabItemFromActiveTab()));
    return {...toRefs(mainData), clickTab, closeTab, menuClick, tabsItemClick, filterTableName};
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

     .content{
      display: flex;
      height: auto;
      flex-direction: column;
      justify-content: flex-start;
      flex: 1 1 auto;
      overflow-x: auto;
      overflow-y: hidden;


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
