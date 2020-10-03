<template>
  <div>
    <div class="link-item" :class="nodeData.item.state.clicked?'clicked':''"
         @click="linkClick(nodeData.item,nodeData.index)" @contextmenu="linkContextMenu(nodeData.item,nodeData.index)">
      <i class="link-item-arrow" v-if="nodeData.item.children && nodeData.item.children !== ''"
         :class="nodeData.item.state.linked?nodeData.item.state.open?'down-arrow':'right-arrow':''"
         @click.stop="openArrowClick(nodeData.item)"></i>
      <div v-show="item.type" class="link-item-icon" :class="nodeData.item.state.linked?'linked':''"
           v-html="nodeData.icon[item.type]"></div>
      <span class="link-item-name">{{nodeData.item.title}}</span>
    </div>
  </div>
</template>
<script>
import {reactive} from 'vue';
import setting from '../../setting.json';

export default {
  props: {
    item: Object,
    index: Number,
  },
  setup (props, context) {
    const nodeData = reactive({
      item: props.item,
      index: props.index,
      icon: setting.icon.db,
    });
    /**
     * 左键单击链接元素
     */
    const linkClick = (item, index) => {
      context.emit('linkClick', item, index);
    };
    /**
     * 右键单击链接元素
     */
    const linkContextMenu = (item, index) => {
      context.emit('linkContextMenu', item, index);
    };
    /**
     * 左键单击链接元素开合指示箭头
     */
    const openArrowClick = (item) => {
      item.state.open ? item.state.linked = 'down-arrow' : item.state.linked = 'right-arrow';
      item.state.open === false ? item.state.open = true : item.state.open = false;
    };
    return {nodeData, linkClick, linkContextMenu, openArrowClick};
  },
};
</script>
<style scoped lang="scss">
  .link-item-div {
    flex-direction: column;

    &, .link-item, .link-item-arrow, .link-item-icon, .link-item-name, .link-item-child {
      display: flex;
    }

    .link-item {
      position: relative;
      flex-direction: row;
      flex-wrap: nowrap;
      padding: 1px 0 1px 20px;
      transition: .1s;

      .link-item-icon {
        width: 16px;
        height: 16px;
        margin: 2px;
        overflow: hidden;
        background-color: #6f6f6f;
        border-radius: 4px;
        flex: 0 0 16px;

        &.linked {
          background-color: #00ee46;
        }
      }

      .right-arrow {
        border-width: 5px 0 5px 8px;
        border-style: solid;
        border-color: #0000 #0000 #0000 #a6a6a6;
        border-image: initial;
        width: 4px;
        height: 0;
        margin-top: 4px;
      }

      .down-arrow {
        left: 5px !important;
        border-width: 5px 0 5px 8px;
        border-style: solid;
        border-color: #0000 #0000 #0000 #a6a6a6;
        border-image: initial;
        width: 4px !important;
        height: 0;
        margin: 8px 4px 0 0;
        transform: rotate(90deg);
      }

      .link-item-arrow {
        position: absolute;
        left: 8px;
        width: 10px;
        transition: .1s;
      }

      .link-item-name {
        flex: 1 0 auto;
      }
    }

    .link-item-child {
      flex-direction: column;
      margin-left: 18px;
      transition: .5s;

      .link-item {
      }
    }

    .clicked {

      &:before {
        content: ' ';
        background-image: linear-gradient(#3e00d3, #3e00d3);
        position: absolute;
        left: -54px;
        top: 0;
        width: 200%;
        height: 24px;
        z-index: -1;
        transition: .5s;
      }
    }
  }
</style>
