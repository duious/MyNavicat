<template>
  <div>
    <div class="title-bar"><span class="title">{{ title }}</span></div>
    <div class="menu-div">
      <div class="menu-group" v-for="optionsItem in options">
        <div class="menu-item" :class="item.active ? 'clicked' : ''" v-for="(item, index) in optionsItem">
          <div class="menu-item-icon"
               v-if="item.option.indexOf(',') === -1"
               v-html="getIconDom(item.option)"
               @click="menuClick(item.option, item, index, $event)"></div>
          <div class="menu-item-icon"
               v-else
               v-for="icons in item.option.split(',')"
               v-html="getIconDom(icons)"
               @click="menuClick(icons, item, index, $event)"></div>
          <span class="menu-item-title">{{ item.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {reactive, watch} from 'vue';
import setting from '../../setting.json';
const MENU_ITEM_CLICK = 'menuItemClick';
/**
 * header
 * @description @Components {@link header} 组件
 * @description @:activeObj {@link activeObj} props:activeOption='table'
 * @description @@optionClick {@link menuItemClick} menuItemClick(type, item, event) 点击菜单元素事件
 */
export default {
  props: {
    activeObj: {
      type: String,
      default: JSON.stringify({option: 'table'}),
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
     * header数据
     * @property {String} title header居中展示的名字
     * @property {Array} options 数据库功能项即其它功能数组
     * @property {Object} icon 功能项使用的图标
     */
    const headData = reactive({
      title: document.title,
      options: [
        [
          {type: 'core', option: 'newLink', title: '链接', action: 'link'},
          {type: 'core', option: 'newQuery', title: '新建查询', action: 'query'},
          {type: 'base', option: 'table', title: '表', active: true},
          {type: 'base', option: 'views', title: '视图'},
          {type: 'base', option: 'fn', title: '函数'},
          {type: 'base', option: 'event', title: '事件'},
          {type: 'base', option: 'user', title: '用户'},
          {type: 'base', option: 'query', title: '查询'},
          {type: 'base', option: 'backup', title: '备份'},
          {type: 'base', option: 'autoRun', title: '自动运行'},
          {type: 'base', option: 'model', title: '模型'},
        ],
        [
          {type: 'views', option: 'leftView,rightView', title: '视窗'},
          {type: 'account', option: 'loginUser', title: '账户'},
        ],
      ],
      icon: setting.icon.menu,
    });
    /**
     * 初始化选中的选项
     * @param {String} option 标记选中的选项
     */
    const initCheckOption = (option) => {
      let isNeed = false;
      headData.options[0].filter((one) => {
        if (one.option === option && 'base' === one.type) {
          isNeed = true;
        }
      });
      isNeed ? headData.options[0].map((one) => {
        if ('base' === one.type) {
          one.option === option ? one['active'] = true : delete one['active'];
        }
      }) : '';
    };
    /**
     * 获取图标dom字符串
     * @param {String} icon 图标名称
     * @return {Document} icon dom节点
     */
    const getIconDom = (icon) => headData.icon[icon]['25'].indexOf('svg') !== -1 ? headData.icon[icon]['25'] : headData.icon[icon];
    /**
     * 发送选中事件
     * @param {String} type 点击的元素的功能所属类型
     * @param {Object} item 点击的元素对象
     * @param {Event} event 当前点击事件
     */
    const optionClick = (type, item, event) => {
      context.emit(MENU_ITEM_CLICK, type, item, event);
    };
    /**
     * 菜单点击事件
     * @param {String} option 点击的元素的功能名称
     * @param {Object} item 点击的元素对象
     * @param {Number} index 点击的元素对象所在数组的下标
     * @param {Event} event 当前点击事件
     */
    const menuClick = (option, item, index, event) => {
      optionClick(item.type, item, event);
      item.type === 'base' ? initCheckOption(option) : '';
    };
    /**
     * 获取active对象
     * @return {Object} activeObj active对象
     */
    const getActiveObj = () => JSON.parse(JSON.stringify(JSON.parse(props.activeObj)));
    initCheckOption(getActiveObj().option);
    /**
     * 自响应 选择的功能的改变
     */
    watch(() => props.activeObj, () => initCheckOption(getActiveObj().option));
    return {...headData, getIconDom, menuClick};
  },
};
</script>
<style scoped lang="scss">
  .header {
    .title-bar, .menu-div, .title, .menu-group, .menu-item, .menu-item-icon, .menu-item-title {
      display: flex;
    }

    .title-bar {
      height: 22px;
      width: 100%;
      justify-content: center;
      font-size: 12px;
      color: #8f8f8f;

      .title {
      }
    }

    .menu-div {
      min-width: 950px;
      font-size: 11px;
      line-height: 1.8;
      color: #8f8f8f;
      height: 55px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .menu-div .menu-group:first-child {
        margin-left: 100px;
        grid-template-columns: repeat(10, 62px);
        grid-template-rows: 100%;
      }

      .menu-group {
        flex-direction: row;

        .menu-item {
          width: 63px;
          text-align: center;
          border-left-width: 1px;
          flex-direction: column;
          transition: .3s;

          .menu-item-icon {
            width: 33px;
            height: 33px;
            align-self: center;
            justify-content: center;
            align-items: center;
            user-select: auto;
            -webkit-user-select: auto;

            &:focus, &:active {
              opacity: .6;
            }
          }

          .menu-item-title {
            align-self: center;
          }
        }

        .menu-item:nth-child(3) {
          margin-left: 43px;
        }

        .clicked {
          background-color: #696969;
          border-radius: 2px 2px 0 0;
        }
      }

      .menu-group:nth-child(2) {
        .menu-item:first-child {
          margin-right: 46px;
          width: 88px;
          display: grid;
          grid-template-columns: 50% 50%;
          grid-template-rows: 60% 40%;


          .menu-item-icon {
            display: grid;
            width: 44px;
          }

          .menu-item-title {
            display: grid;
            width: 88px;
          }
        }
      }
    }
  }
</style>
