<template>
  <div class="resize" :class="resizeClass" :style="resizeStyle" ref="resizeEl" @mousedown.stop="handleMouseDown($event)">
    <slot></slot>
  </div>
</template>
<script>
import {reactive, ref, onMounted} from 'vue';
const typeObj = {'left': 'width', 'right': 'width', 'top': 'height', 'bottom': 'height'};
export default {
  props: {
    resizeData: Object,
    slotDivName: Object,
    type: {
      type: String,
      required: true,
      default: 'right',
      validator: (value) => typeObj.hasOwnProperty(value) === true,
    },
    rank: {
      type: Array,
      required: true,
      default: [0],
      validator: (value) => (value.length >= 0 || value.length <= 2),
    },
    slotDiv: String,
  },
  setup (props, context) {
    const debug = true;
    if (debug) {
      console.log('debug resizer=>props:', JSON.stringify(props));
    }
    const resizeEl = ref(null);
    const dragState = reactive({
      dragging: false,
      startMouseX: '', startMouseY: '', startWidth: '', startHeight: '',
    });
    /**
     * 目标样式对象
     */
    let resizeStyle = reactive({[typeObj[props.type]]: (props.rank[0] || 0) + 'px'});
    let resizeClass = ref('resize-' + props.type);
    /**
     * 设置调整的目标样式
     * @param {Number} value 目标样式对应的值
     */
    const updateResizeStyle = (value) => {
      if (props.rank[0] > 0) {
        value = (props.rank[0] > value) ? props.rank[0] : value;
      }
      if (props.rank[1] > 0) {
        value = (props.rank[1] < value) ? props.rank[1] : value;
      }
      resizeStyle[typeObj[props.type]] = value + 'px';
      if (debug) {
        console.log('debug resizer=>updateResizeStyle:', JSON.stringify(resizeStyle));
      }
    };

    let offsetData = {top: 0, left: 0};
    let columnRect;
    // 上右下左
    let mouseRank;
    const slotDiv = props.slotDiv || '';
    const initMouseRank = () => {
      columnRect = resizeEl.value;
      offsetData.top = columnRect.offsetTop;
      offsetData.left = columnRect.offsetLeft;
      initOffset(columnRect.offsetParent);
      dragState.startWidth = columnRect.clientWidth;
      dragState.startHeight = columnRect.clientHeight;
      mouseRank = [];
      mouseRank[0] = [
        offsetData.top === 0 ? 0 : (offsetData.top - 6),
        (offsetData.left + columnRect.clientWidth + 6),
        (offsetData.top + columnRect.clientHeight + 6),
        offsetData.left === 0 ? 0 : (offsetData.left - 6),
      ];
      mouseRank[1] = [
        offsetData.top + 10,
        (offsetData.left + columnRect.clientWidth - 10),
        (offsetData.top + columnRect.clientHeight - 10),
        offsetData.left + 10,
      ];
      if (debug) {
        console.log('debug resizer=>initMouseRank:', JSON.stringify(mouseRank));
      }
    };

    const initOffset = (dom) => {
      if (dom?.nodeName !== 'BODY') {
        offsetData.top += dom.offsetTop;
        offsetData.left += dom.offsetLeft;
        return initOffset( dom.offsetParent);
      }
    };

    onMounted(() => {
      initMouseRank();
    });

    /**
     * 判断是否在可操作区域内
     * @return {boolean}
     */
    const canResize = () => {
      switch (props.type) {
        case 'top':
          return dragState.startMouseY >= mouseRank[0][0] && dragState.startMouseY <= mouseRank[1][0];
        case 'right':
          return dragState.startMouseX <= mouseRank[0][1] && dragState.startMouseX >= mouseRank[1][1];
        case 'bottom':
          return dragState.startMouseY <= mouseRank[0][2] && dragState.startMouseY >= mouseRank[1][2];
        case 'left':
          return dragState.startMouseX >= mouseRank[0][3] && dragState.startMouseX <= mouseRank[1][3];
      }
    };

    /**
     * 左键按下
     * @param {event} event
     */
    const handleMouseDown = (event) => {
      dragState.startMouseX = event.clientX;
      dragState.startMouseY = event.clientY;
      dragState.startWidth = columnRect.clientWidth;
      dragState.startHeight = columnRect.clientHeight;
      initMouseRank();
      dragState.dragging = canResize();
      if (debug) {
        console.log('debug resizer=>dragState:', JSON.stringify(dragState));
      }
      document.onselectstart = () => false;
      document.ondragstart = () => false;

      let mousemove = (event) => {
        let delta;
        let proxy;
        if (props.type === 'left' || props.type === 'right') {
          delta = event.clientX - dragState.startMouseX;
          proxy = dragState.startWidth + delta;
        }
        if (props.type === 'top' || props.type === 'bottom') {
          delta = dragState.startMouseY - event.clientY;
          proxy = dragState.startHeight + delta;
        }
        if (debug) {
          console.log('debug resizer=>delta:', delta);
          console.log('debug resizer=>proxy:', proxy);
        }
        updateResizeStyle(proxy);
        context.emit('styleChange', resizeStyle, resizeEl.value);
      };
      let mouseup = () => {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        document.onselectstart = null;
        document.ondragstart = null;
        dragState.dragging = false;
        if (debug) {
          console.log('debug resizer=>removeEventListener:', 'mousemove、mouseup');
        }
      };
      if (dragState.dragging) {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        if (debug) {
          console.log('debug resizer=>addEventListener:', 'mousemove、mouseup');
        }
      }
    };

    return {dragState, resizeClass, resizeStyle, handleMouseDown, resizeEl, slotDiv};
  },
};
</script>
<style scoped lang="scss">
  .resize::after {
    content: ' ';
    position: absolute;
  }

  .resize-right::after {
    height: 100%;
    width: 16px;
    right: -6px;
    cursor: col-resize;
  }

  .resize-left::after {
    height: 100%;
    width: 16px;
    left: -6px;
    cursor: col-resize;
  }

  .resize-top::after {
    width: 100%;
    height: 16px;
    top: -6px;
    cursor: row-resize;
  }

  .resize-bottom::after {
    width: 100%;
    height: 16px;
    bottom: -6px;
    cursor: row-resize;
  }
</style>
