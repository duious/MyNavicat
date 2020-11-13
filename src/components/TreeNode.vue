<template>
  <div>
    <div class="link-item" :class="item.state.clicked ? 'clicked' : ''"
         :style="{'margin-left': (item?.id?.split('.').length - 1) * 14 + 'px'}"
         @dblclick.left.stop="dblclick(item, index, $event)"
         @click.left.stop="linkClick(item, index, $event)"
         @contextmenu.stop="linkContextMenu(item, index, $event)">
      <i class="link-item-arrow" v-if="item.children && item.children !== ''"
         :class="item.state.linked ? item.state.open ? 'down-arrow' : 'right-arrow' : ''"
         @click.stop="openArrowClick(item)"></i>
      <div v-show="item.type" class="link-item-icon" :class="item.state.linked ? 'linked' : ''"
           v-html="getIcon(item)"></div>
      <span class="link-item-name">{{item.title}}</span>
    </div>
  </div>
</template>
<script>
import {reactive, nextTick} from 'vue';
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
    const linkClick = (item, index, event) => {
      context.emit('linkClick', item, index, event);
    };
    /**
     * 左键单击链接元素
     */
    const dblclick = (item, index, event) => {
      nextTick(() => {
        context.emit('dblclick', item, index, event);
      });
    };
    /**
     * 右键单击链接元素
     */
    const linkContextMenu = (item, index, event) => {
      context.emit('linkContextMenu', item, index, event);
    };
    /**
     * 左键单击链接元素开合指示箭头
     */
    const openArrowClick = (item) => {
      item.state.open ? item.state.linked = 'down-arrow' : item.state.linked = 'right-arrow';
      item.state.open === false ? item.state.open = true : item.state.open = false;
    };
    const getIcon = (item) => {
      let src = '';
      if (item.type.indexOf('.') !== -1) {
        src = nodeData.icon[item.type.split('.')[0]][item.type.split('.')[1]];
      } else {
        if (JSON.stringify(nodeData.icon[item.type] || '').indexOf('active') === -1) {
          src = nodeData.icon[item.type];
        } else {
          if (item.state.linked) {
            src = nodeData.icon[item.type]['active'];
          } else {
            src = nodeData.icon[item.type]['def'];
          }
        }
      }
      if (typeof src !== 'string') {
        src = nodeData.icon.table[item.type];
      }
      return src;
    };
    return {...nodeData, linkClick, dblclick, linkContextMenu, openArrowClick, getIcon};
  },
};
</script>
<style scoped lang="scss">
  .link-item-div {
    flex-direction: column;
    transition: .4s;

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
        left: 4px !important;
        border-width: 5px 0 5px 8px;
        border-style: solid;
        border-color: #0000 #0000 #0000 #a6a6a6;
        border-image: initial;
        width: 4px !important;
        height: 0;
        margin: 7px 5px 0 0;
        transform: rotate(90deg);
      }

      .link-item-arrow {
        position: absolute;
        left: 8px;
        width: 10px;
        transition: .3s;
      }

      .link-item-name {
        flex: 1 0 auto;
      }
    }

    .link-item-child {
      flex-direction: column;
      margin-left: 18px;
      transition: .5s;

      .link-item-div .link-item .link-item-icon {
        background-color: transparent;
        margin: 0 2px 0 0;
        height: 22px;
      }
    }

    .clicked {

      &:before {
        content: ' ';
        background-image: linear-gradient(#0259d0, #0259d0);
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
