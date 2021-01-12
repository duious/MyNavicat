<template>
  <div style="overflow-x: hidden;">
    <div class="link-item-div" v-for="(item, index) in links" :key="item.id">
      <TreeNode :item="item" :index="index" @linkClick="linkClick" @dblclick="dblclick"
                @linkContextMenu="linkContextMenu"></TreeNode>
      <div class="link-item-child" :style="{'height': getHeight(item)}">
        <div class="link-item-div" v-for="(childItem, childIndex) in item.children" :key="childItem.id">
          <TreeNode :item="childItem" :index="childIndex" @dblclick="dblclick"
                    @linkClick="linkClick" @linkContextMenu="linkContextMenu"></TreeNode>
          <div class="link-item-child" :style="{'height': getHeight(childItem)}">
            <div class="link-item-div" v-if="childItem && childItem.children"
                 v-for="(grandChildItem, grandChildIndex)  in childItem.children" :key="grandChildItem.id">
              <TreeNode :item="grandChildItem" :index="grandChildIndex" @dblclick="dblclick"
                        @linkClick="linkClick" @linkContextMenu="linkContextMenu"></TreeNode>
              <div class="link-item-child" :style="{'height': getHeight(grandChildItem)}">
                <div class="link-item-div" v-if="grandChildItem && grandChildItem.children"
                     v-for="(grandGrandChildItem, grandGrandChildIndex)  in grandChildItem.children"
                     :key="grandGrandChildItem.id">
                  <TreeNode :item="grandGrandChildItem" :index="grandGrandChildIndex" @dblclick="dblclick"
                            @linkClick="linkClick" @linkContextMenu="linkContextMenu"></TreeNode>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {reactive, nextTick, watch, toRefs} from 'vue';
import TreeNode from './TreeNode.vue';
const LINK_CLICK = 'linkClick';
const DB_CLICK = 'dblclick';
const LINK_CONTEXT_MENU = 'linkContextMenu';
/**
 * tree
 * @description @Components {@link tree} 组件
 * @description @:activeObj {@link treeArr} props:treeArr=[] 树结构数组
 * @description @@optionClick {@link linkClick} linkClick(item, index, event) 左键点击菜单元素事件
 * @description @@optionClick {@link dblclick} dblclick(item, index, event) 左键双击菜单元素事件
 * @description @@optionClick {@link linkContextMenu} linkContextMenu(item, index, event) 右键点击菜单元素事件
 */
export default {
  props: {
    treeArr: {
      type: Array,
      default: Object.assign([], []),
      required: true,
    },
  },
  components: {TreeNode},
  /**
   * @param {Object} props 组件入参
   * @param {Object} context 当前上下文方法
   * @return {Object} Object
   */
  setup (props, context) {
    const treeData = reactive({
      links: props.treeArr,
    });
    /**
     * 左键单击链接元素
     * @param {Object} item 选中的元素
     * @param {Number} index 所在数组对应的下标
     * @param {Event} event 点击事件
     */
    const linkClick = (item, index, event) => {
      context.emit(LINK_CLICK, item, index, event);
    };
    /**
     * 左键双击链接元素
     * @param {Object} item 选中的元素
     * @param {Number} index 所在数组对应的下标
     * @param {Event} event 点击事件
     */
    const dblclick = (item, index, event) => {
      context.emit(DB_CLICK, item, index, event);
    };
    /**
     * 右键单击链接元素
     * @param {Object} item 选中的元素
     * @param {Number} index 所在数组对应的下标
     * @param {Event} event 点击事件
     */
    const linkContextMenu = (item, index, event) => {
      context.emit(LINK_CONTEXT_MENU, item, index, event);
    };
    /**
     * 左键单击链接元素开合指示箭头
     * @param {Object} item 选中的元素
     */
    const openArrowClick = (item) => {
        item.state.open ? item.state.linked = 'down-arrow' : item.state.linked = 'right-arrow';
        nextTick(() => {
        item.state.open === false ? item.state.open = true : item.state.open = false;
        });
    };
    /**
     * 获取当前元素组的高度
     * @param {Object} item 当前元素对象
     * @return {String} 当前元素高度样式值
     */
    const getHeight = (item) => {
      let height = item.children?.length * 24;
      /**
       * 拼接当前元素高度
       * @param {Object} item 当前元素对象
       */
      let concatHeight = (item) => {
        if (item.children?.length > 0) {
          item.children.filter((one) => one.state.open === true ? item : '')?.map((one) => {
            height += one.children?.length * 24;
            concatHeight(one);
          });
        }
      };
      concatHeight(item);
      return item.state.open === false ? 0 : (height + 'px');
    };
    /**
     * 自响应 数据更新
     */
    watch(() => props.treeArr, () => {
      treeData.links = props.treeArr;
    });
    return {...toRefs(treeData), linkClick, dblclick, linkContextMenu, openArrowClick, getHeight};
  },
};
</script>
<style scoped lang="scss">
  .link-item-div {
    flex-direction: column;

    &, .link-item, .link-item-arrow, .link-item-icon, .link-item-name, .link-item-child {
      display: flex;
    }

    .link-item-child {
      flex-direction: column;
      overflow: hidden;
      transition: height .2s;
    }
  }
</style>
