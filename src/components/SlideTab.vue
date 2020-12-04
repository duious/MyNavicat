<template>
  <div class="tab">
    <div class="tab-item"
         :class="item.active === true ? 'clicked' : ''"
         v-for="(item, index) in tabs"
         @click.stop="clickTabItem(item, index)">
      <i class="tab-item-close"
         @click.stop="item.closable === true ? closeTabItem(item, index) : ''"
         v-html="item.closable === true ? getIconDom('close', 16) : ''"></i>
      <div class="tab-item-icon"
           v-show="item.icon"
           v-html="getIconDom(item.icon, 25)"></div>
      <div class="tab-item-title">{{ item.name }}</div>
    </div>
  </div>
</template>
<script>
import {reactive, watch, toRefs} from 'vue';
import setting from '../../setting.json';
/**
 * 点击tab标签
 * @description 注册的事件名称
 */
const CLICK_TAB_ITEM = 'clickTabItem';
/**
 * 关闭tab标签
 * @description 注册的事件名称
 */
const CLOSE_TAB_ITEM = 'closeTabItem';
/**
 * slideTab
 * @description @Components {@link slideTab} 组件，用于main组件头部选项卡展示功能
 * @description @:slideTabArr {@link slideTabArr} props:slideTabArr=[] 便签页数组
 * @description @@clickTabItem {@link clickTabItem} clickTabItem(item, index, event) 标签页选中事件
 * @description @@closeTabItem {@link closeTabItem} closeTabItem(item, index, event) 标签页关闭事件
 */
export default {
  props: {
    slideTabArr: {
      type: String,
      default: '',
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
    let slideTabData = reactive({
      tabs: [],
      icon: '',
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
      if (slideTabData.icon.hasOwnProperty(icon)) {
        return slideTabData.icon[icon].hasOwnProperty(size) ? (active ? slideTabData.icon[icon]['active'][size] : slideTabData.icon[icon][size]) : slideTabData.icon[icon];
      }
      return '';
    };
    /**
     * 初始化选中的选项
     * @param {Object} item 标记选中的选项
     * @param {Number} index 当前标签页对象所在数组的下标
     */
    const clickTabItem = (item, index) => {
      slideTabData.tabs.map((one) => {
        one.active = false;
      });
      item.active = true;
      context.emit(CLICK_TAB_ITEM, item, index);
    };
    /**
     * 关闭tab标签页
     * @param {Object} item 当前标签页的数组内的对象
     * @param {Number} index 当前标签页对象所在数组的下标
     */
    const closeTabItem = (item, index) => {
      context.emit(CLOSE_TAB_ITEM, item, index);
    };
    /**
     * 获取active对象
     * @return {Object} activeObj active对象
     */
    const getSlideTabArrObj = () => JSON.parse(JSON.stringify(JSON.parse(props.slideTabArr)));
    slideTabData.icon = initIcon();
    slideTabData.tabs = getSlideTabArrObj();
    watch(() => props.slideTabArr, () => {
      slideTabData.tabs = getSlideTabArrObj();
    });
    return {...toRefs(slideTabData), getIconDom, clickTabItem, closeTabItem};
  },
};
</script>
<style scoped lang="scss">
  .tab, .tab-item, .tab-item-icon, .tab-item-title {
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
</style>
