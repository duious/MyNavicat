<template>
  <div class="menu">
    <div class="menu-group" v-for="(menuGroup) in menus">
      <div class="menu-group" v-for="(menuItem) in menuGroup">
        <div class="menu-item clickable"
             v-if="menuItem.length > 0"
             v-for="item in menuItem"
             :class="item.available ? '' : 'clicked'"
             :title="item.title"
             @click="menuClick(item, item.icon, $event)"
             v-html="getIconDom(item.icon, 18, item.active)"></div>
        <div class="menu-item" v-else>
          <label class="menu-item-search">
            <i class="menu-item-search-icon" v-html="getIconDom('query', 14)"></i>
            <input class="menu-item-search-input"
                   placeholder="搜索"
                   type="text"
                   v-model="tableName"/>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {reactive, watch, toRefs} from 'vue';
import setting from '../../setting.json';
import {throttle} from 'throttle-debounce';
const DEFAULT_ACTIVE = 'table';
/**
 * 搜索框输入内容
 * @description 注册的事件名称
 */
const FILTER_TAB_DATA = 'filterTableData';
/**
 * 图标菜单项点击
 * @description 注册的事件名称
 */
const MENU_BAR_ITEM_CLICK = 'menuBarItemClick';
/**
 * menuBar
 * @description @Components {@link menuBar} 组件，用于main组件头部选项卡对应的图标菜单功能
 * @description @:menuBarObj {@link menuBarObj} props:menuBarObj={} 便签页数组
 * @description @@filterTableData {@link filterTableData} filterTableData(val) 搜索框输入事件
 * @description @@menuBarItemClick {@link menuBarItemClick} menuBarItemClick(item, type, event) 图标菜单项点击事件
 */
export default {
  props: {
    menuBarObj: {
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
     * menusBar数据
     * @property {String} menus 展示的图标项目数组
     * @property {Array} tableName 搜索框输入的内容
     * @property {Object} icon 功能项使用的图标
     */
    let menusBarData = reactive({
      menus: '',
      tableName: '',
      icon: '',
    });
    /**
     * menu数据
     * @description 对应不同的header的菜单项
     */
    let menusData = reactive({
      'table': [
        [
          {icon: 'open', title: '打开表', available: false},
          {icon: 'edit', title: '设计表', available: false},
          {icon: 'new', title: '新建表', available: true},
          {icon: 'del', title: '删除表', available: false},
        ],
        [
          {icon: 'import', title: '导入向导', available: true},
          {icon: 'export', title: '导出向导', available: true},
        ],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'views': [
        [
          {icon: 'open', title: '打开视图', available: false},
          {icon: 'edit', title: '设计视图', available: false},
          {icon: 'new', title: '新建视图', available: true},
          {icon: 'del', title: '删除视图', available: false},
        ],
        [{icon: 'export', title: '导出向导', available: true}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'fn': [
        [
          {icon: 'edit', title: '设计函数', available: false},
          {icon: 'new', title: '新建函数', available: true},
          {icon: 'del', title: '删除函数', available: false},
        ],
        [{icon: 'run', title: '运行函数', available: false}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'event': [
        [
          {icon: 'edit', title: '设计事件', available: false},
          {icon: 'new', title: '新建事件', available: true},
          {icon: 'del', title: '删除事件', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'user': [
        [
          {icon: 'edit', title: '编辑用户', available: false},
          {icon: 'new', title: '新建用户', available: true},
          {icon: 'del', title: '删除用户', available: false},
        ],
        [{icon: 'jurisdiction', title: '权限管理员', available: false}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'query': [
        [
          {icon: 'edit', title: '设计查询', available: false},
          {icon: 'new', title: '新建查询', available: true},
          {icon: 'del', title: '删除查询', available: false},
        ],
        [{icon: 'export', title: '导出向导', available: false}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'backup': [
        [
          {icon: 'open', title: '还原备份', available: false},
          {icon: 'new', title: '新建备份', available: true},
          {icon: 'del', title: '删除备份', available: false},
          {icon: 'edit', title: '提取SQL', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'autoRun': [
        [
          {icon: 'edit', title: '设计批处理作业', available: false},
          {icon: 'new', title: '新建批处理作业', available: true},
          {icon: 'del', title: '删除批处理作业', available: false},
        ],
        [
          {icon: 'new', title: '设置计划', available: false},
          {icon: 'del', title: '删除计划', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'model': [
        [
          {icon: 'edit', title: '设计模型', available: false},
          {icon: 'new', title: '新建模型', available: true},
          {icon: 'del', title: '删除模型', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'def': [
        [
          {icon: 'table', title: '视图', available: true, active: false},
          {icon: 'list', title: '视图', available: true, active: true},
          {icon: 'er', title: '视图', available: true, active: false},
        ],
        [],
      ],
      'newQuery': [
        [{icon: 'save', title: '保存', available: false}],
        [
          {icon: 'query_creat', title: '查询创建工具', available: false},
          {icon: 'format', title: '格式化SQL', available: false},
          {icon: 'demo', title: '代码段', available: false},
        ],
      ],
    });
    /**
     * 编辑tab标签页菜单数据
     */
    let tabEditorMenuData = reactive({
      'table': [
        [{icon: 'save', title: '保存', available: true}],
        [
          {icon: 'add', title: '添加字段', available: true},
          {icon: 'insert', title: '插入字段', available: true},
          {icon: 'del', title: '删除字段', available: true},
        ],
      ],
      'views': [
        [{icon: 'save', title: '保存', available: false}],
        [{icon: 'export', title: '导出向导', available: true}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'fn': [
        [{icon: 'save', title: '保存', available: false}],
        [{icon: 'run', title: '运行函数', available: false}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'event': [
        [{icon: 'save', title: '保存', available: false}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'user': [
        [{icon: 'save', title: '保存', available: false}],
        [{icon: 'jurisdiction', title: '权限管理员', available: false}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'query': [
        [{icon: 'save', title: '保存', available: false}],
        [{icon: 'export', title: '导出向导', available: false}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'backup': [
        [{icon: 'save', title: '保存', available: false}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'autoRun': [
        [{icon: 'save', title: '保存', available: false}],
        [
          {icon: 'new', title: '设置计划', available: false},
          {icon: 'del', title: '删除计划', available: false},
        ],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'model': [
        [{icon: 'save', title: '保存', available: false}],
        [{icon: 'reload', title: '刷新', available: true}],
      ],
      'def': [
        [
          {icon: 'table', title: '视图', available: true, active: false},
          {icon: 'list', title: '视图', available: true, active: true},
          {icon: 'er', title: '视图', available: true, active: false},
        ],
        [],
      ],
      'newQuery': [
        [{icon: 'save', title: '保存', available: false}],
        [
          {icon: 'query_creat', title: '查询创建工具', available: false},
          {icon: 'format', title: '格式化SQL', available: false},
          {icon: 'demo', title: '代码段', available: false},
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
     * @param {Number} size 图标大小
     * @param {Boolean} active 激活状态的图标
     * @return {Document} icon dom节点
     */
    const getIconDom = (icon, size, active = false) => {
      if (menusBarData.icon.hasOwnProperty(icon)) {
        return menusBarData.icon[icon].hasOwnProperty(size) ? (active ? menusBarData.icon[icon]['active'][size] : menusBarData.icon[icon][size]) : menusBarData.icon[icon];
      }
      return '';
    };
    /**
     * 搜诉框输入内容监听
     * @description 节流 1500ms
     */
    const filterTableName = throttle(1500, async () => {
      context.emit(FILTER_TAB_DATA, menusBarData.tableName);
    });
    /**
     * 图标菜单项点击
     * @param {Object} item 点击的项目对象
     * @param {String} type 点击的项目的类型
     * @param {ClickEvent} event 点击事件
     */
    const menuClick = (item, type, event) => {
      if (!item.available) {
        return;
      }
      context.emit(MENU_BAR_ITEM_CLICK, item, type, event);
    };
    /**
     * 重新加载 快捷菜单项
     * @param {String} item 功能项类型
     * @param {Object} clickedLinkedItem 当前{@link aside}组件选择的项目对象
     */
    const reloadMenusData = (item, clickedLinkedItem) => {
      let menuData = [];
      let defMenuData = JSON.parse(JSON.stringify(menusData.def));
      defMenuData[0].splice(2, 1);
      if (menusData.hasOwnProperty(item.target)) {
        menuData = JSON.parse(JSON.stringify(menusData[item.target]));
        menuData[0].map((one) => {
          if ('open,edit,del'.indexOf(one.icon) !== -1) {
            one.available = clickedLinkedItem?.type?.indexOf('.') === -1;
          }
        });
      }
      switch (item.target) {
        case 'table':
          defMenuData[0].push(menusData.def[0][2]);
          break;
        case 'views':
          break;
        case 'fn':
          break;
        case 'event':
          break;
        case 'query':
          break;
        case 'backup':
          break;
        case 'newQuery':
          menuData = JSON.parse(JSON.stringify(menusData['newQuery']));
          break;
        case 'tabEditor':
          menuData = JSON.parse(JSON.stringify(tabEditorMenuData[item.icon]));
          break;
        default:
          menuData = JSON.parse(JSON.stringify(menusData['table']));
          defMenuData[0].push(menusData.def[0][2]);
          break;
      }
      if (clickedLinkedItem === '') {
        menuData[0].map((one) => {
          one.available = false;
        });
        menuData[1].map((one) => {
          one.available = false;
        });
      }
      switch (item.target) {
        case 'newQuery':
          menusBarData.menus = [menuData];
          break;
        case 'tabEditor':
          menuData.splice(2, 1);
          menusBarData.menus = [menuData];
          break;
        default:
          menusBarData.menus = [menuData, defMenuData];
          break;
      }
    };
    /**
     * 获取active对象
     * @return {Object} activeObj active对象
     */
    const getMenuBarObj = () => JSON.parse(JSON.stringify(JSON.parse(props.menuBarObj)));
    menusBarData.icon = initIcon();
    reloadMenusData(getMenuBarObj().item, getMenuBarObj().linkedItem);
    watch(() => menusBarData.tableName, () => filterTableName());
    watch(() => props.menuBarObj, () => {
      reloadMenusData(getMenuBarObj().item, getMenuBarObj().linkedItem);
    });
    return {...toRefs(menusBarData), getIconDom, menuClick};
  },
};
</script>
<style scoped lang="scss">
.menu, .menu-group, .menu-item {
  display: flex;
}
.menu {
  display: flex;
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

      .clickable {
        &:active {
          opacity: .6;
        }
      }

      .clicked {
        opacity: .6;
      }
    }
  }
}
</style>
