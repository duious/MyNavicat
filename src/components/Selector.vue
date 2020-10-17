<template>
  <div class="select-div" ref="selector">
    <div class="select-item" v-show="!selectData.selecting" @click="selectItem">
      <TreeNode class="link-item-div" v-for="(item, index) in selectData.list" :item="item" :index="index"
                v-show="item.state.clicked"></TreeNode>
    </div>
    <div class="select-list" v-show="selectData.selecting">
      <TreeNode class="link-item-div" :class="item.state.checked?'checked':''"
                v-for="(item, index) in selectData.list" :item="item" :index="index"
                @linkClick="itemClick(item, index)" @linkContextMenu="itemClick(item, index)"></TreeNode>
    </div>
    <i class="selector" v-html="selectData.icon['12']"></i>
  </div>
</template>
<script>
import {reactive, ref, onMounted, onUnmounted} from 'vue';
import TreeNode from './TreeNode.vue';
import setting from '../../setting.json';

export default {
  components: {'TreeNode': TreeNode},
  props: {
    list: Array,
  },
  setup (props, context) {
    /**
     * selector dom
     */
    const selector = ref(null);
    const selectData = reactive({
      list: ref(props.list),
      selecting: false,
      icon: setting.icon.action.select,
    });
    selectData.list.unshift({title: '     ', state: {linked: false, clicked: true}});
    selectData.list.filter((one) => {
      one.state.linked = true; one.state.clicked = false;
    });

    const selectItem = () => {
      selectData.list.filter((one) => {
          one.state.clicked ? one.state.checked = true : one.state.checked = false;
          one.state.clicked = false;
      });
      selectData.selecting = true;

      document.addEventListener('click', blurSelector, true);
    };

    const itemClick = (item, index) => {
      selectData.list.filter((one) => {
        one.state.clicked = false;
      });
      item.state.clicked = true;
      selectData.selecting = false;
      context.emit('clickLinkItem', item);
    };

    onUnmounted(() => {
      // 移除监听
      document.removeEventListener('click', blurSelector, true);
    });
    /**
     * 点击非可选区域，自动收起
     * @param {event} e 点击事件
     */
    const blurSelector = (e) => {
      selectData.selecting === true ? (e.target != selector.value ? selectData.selecting = false : '') : e;
    };
    return {selector, selectData, selectItem, itemClick};
  },
};
</script>
<style scoped lang="scss">
  .select-div, .select-list, .select-item, .selector {
    display: flex;
  }

  .select-div {
    width: 150px;
    height: 15px;
    border: 1px solid #626262;
    border-radius: 4px;
    justify-content: space-between;
    position: relative;

    .select-item {
      height: 16px;
      border: none;
      width: 100%;
      background-color: transparent;
      overflow: hidden;
      transition: .1s;

      & ::v-deep(.link-item-div:hover){
        background-image: none;
      }
    }

    .select-list {
      width: 142px;
      flex-direction: column;
      border: 1px solid #4e4e4e;
      background-color: #1d1d1d;
      padding-left: 18px;
      box-shadow: #434343 0 0 2px 1px;
      position: absolute;
      z-index: 1;
      border-radius: 4px;
      left: -12px;
      transition: .8s;

      .checked::before {
        content: " ";
        display: inline-block;
        width: 10px;
        height: 10px;
        background-color: #8f0;
        vertical-align: middle;
        margin: 3px 4px;
        border-radius: 5px;
        position: absolute;
        left: 0;
      }
    }

    & ::v-deep(.link-item) {
      padding-left: 0;
      height: 14px;
      line-height: 14px;
      color: #fefefe;
      font-size: 12px;

      .link-item-icon {
        flex: 0 0 14px;
        margin: 0 2px;
        height: 13px;

        svg {
          height: 14px !important;
          width: 14px !important;
        }
      }
    }

    & ::v-deep(.link-item-div) {
      transition: .1s;
      width: 100%;

      &:hover {
        background-image: linear-gradient(#3e00d3, #3e00d3);
        border-radius: 4px;
      }

      &:before {
        height: 16px;
        width: 100%;
        left: 0;
        border-radius: 2px;
      }
    }

    .selector {
      padding: 2px 1px;
    }
  }
</style>
