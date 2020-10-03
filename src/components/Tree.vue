<template>
  <div>
    <div class="link-item-div" v-for="(item,index) in treeData.links" :key="item.id">
      <TreeNode :item="item" :index="index" @linkClick="linkClick"
                @linkContextMenu="linkContextMenu"></TreeNode>
      <div class="link-item-child" v-show="item.state.open">
        <div class="link-item-div" v-for="(childItem,childIndex) in item.children" :key="childItem.id">
          <TreeNode :item="childItem" :index="childIndex"
                    @linkClick="linkClick" @linkContextMenu="linkContextMenu"></TreeNode>
          <div class="link-item-child" v-show="childItem && childItem.state.open">
            <div class="link-item-div" v-if="childItem && childItem.children"
                 v-for="(grandChildItem,grandChildIndex)  in childItem.children" :key="grandChildItem.id">
              <TreeNode :item="grandChildItem" :index="grandChildIndex"
                        @linkClick="linkClick" @linkContextMenu="linkContextMenu"></TreeNode>
              <div class="link-item-child" v-show="grandChildItem && grandChildItem.state.open">
                <div class="link-item-div" v-if="grandChildItem && grandChildItem.children"
                     v-for="(grandGrandChildItem,grandGrandChildIndex)  in grandChildItem.children"
                     :key="grandGrandChildItem.id">
                  <TreeNode :item="grandGrandChildItem" :index="grandGrandChildIndex"
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
import {reactive} from 'vue';
import setting from '../../setting.json';
import TreeNode from './TreeNode.vue';

export default {
  props: {
    treeArr: Array,
  },
  components: {TreeNode},
  setup (props, context) {
    const treeData = reactive({
      links: props.treeArr,
      icon: setting.icon.db,
    });
    /**
     * 左键单击链接元素
     * @param {Object} item 选中的元素
     * @param {Number} index 所在数组对应的下标
     */
    const linkClick = (item, index) => {
      context.emit('linkClick', item, index);
    };
    /**
     * 右键单击链接元素
     * @param {Object} item 选中的元素
     * @param {Number} index 所在数组对应的下标
     */
    const linkContextMenu = (item, index) => {
      context.emit('linkContextMenu', item, index);
    };
    /**
     * 左键单击链接元素开合指示箭头
     * @param {Object} item 选中的元素
     */
    const openArrowClick = (item) => {
        item.state.open ? item.state.linked = 'down-arrow' : item.state.linked = 'right-arrow';
        item.state.open === false ? item.state.open = true : item.state.open = false;
    };
    return {treeData, linkClick, linkContextMenu, openArrowClick};
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
      margin-left: 18px;
      transition: .5s;

      .link-item {
      }
    }
  }
</style>
