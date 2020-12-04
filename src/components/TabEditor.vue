<template>
  <div>
    <component v-if="''!==component"
               :is="component"
               :tabsArr="tabs"
               @tabsItemClick="tabsItemClick"
               :key="'0-Tabs'"></component>
    <div v-show="false">
      <component :is="'Table'"
                 :key="'0-Table'"></component>
    </div>
  </div>
</template>

<script>
import {reactive, watch, readonly, toRefs} from 'vue';
import setting from '../../setting.json';
import {debounce, throttle} from 'throttle-debounce';
import Table from './Table.vue';
import Tabs from './Tabs.vue';
import {mysqlCore} from '../mysql-core';
import {query, SQL_DEF} from '../util-mysql';
const DEFAULT_ACTIVE = 'table';
export default {
  components: {'Table': Table, 'Tabs': Tabs},
  props: {
    editObj: {
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
    let tabEditorData = reactive({
      /**
       * 标签页 数组
       * @example
       */
      tabs: [
        {
          tabHead: {title: '字段', clicked: true, type: 'result'},
          tabBody: {
            slot: {component: 'Table', tableData: {}},
          },
        },
        {
          tabHead: {title: '索引', clicked: false, type: 'result'},
          tabBody: {
            slot: {component: 'Table', tableData: {}},
          },
        },
        {
          tabHead: {title: '外键', clicked: false, type: 'result'},
          tabBody: {
            slot: {component: 'Table', tableData: {}},
          },
        },
        {
          tabHead: {title: '触发器', clicked: false, type: 'result'},
          tabBody: {
            slot: {component: 'Table', tableData: {}},
          },
        },
        {
          tabHead: {title: '选项', clicked: false, type: 'result'},
          tabBody: {
            slot: {component: '', tableData: {}},
          },
        },
        {
          tabHead: {title: '注释', clicked: false, type: 'result'},
          tabBody: {
            slot: {component: '', tableData: {}},
          },
        },
        {
          tabHead: {title: 'SQL预览', clicked: false, type: 'result'},
          tabBody: {
            slot: {component: '', tableData: {}},
          },
        },
      ],
      menus: [],
      component: '',
    });
    /**
     * 获取图标dom字符串
     * @param {String} icon 图标名称
     * @param {Number} size 图标大小
     * @param {Boolean} active 激活状态的图标
     * @return {Document} icon dom节点
     */
    const getIconDom = (icon, size, active = false) => {
      if (tabEditorData.icon.hasOwnProperty(icon)) {
        return tabEditorData.icon[icon].hasOwnProperty(size) ? (active ? tabEditorData.icon[icon]['active'][size] : tabEditorData.icon[icon][size]) : tabEditorData.icon[icon];
      }
      return '';
    };
    const menuClick = (item, type) => {
      if (!item.available) {
        return;
      }
      console.error('click menu = '+ type);
      if ('new' === type) {
        menuTypeNew(getEditObj().option);
      }
      switch (getEditObj().option) {
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

    const tabsItemClick = (item, event) => {
      console.error(item);
      context.emit('tabsItemClick', item.type);
    };

    /**
     * 获取active对象
     * @return {Object} activeObj active对象
     */
    const getEditObj = () => JSON.parse(JSON.stringify(JSON.parse(props.editObj)));
    tabEditorData.component = 'Tabs';
    return {...toRefs(tabEditorData), getIconDom, menuClick, tabsItemClick};
  },
};
</script>

<style scoped lang="scss">
</style>
