<template>
  <div style="display: flex;">
    <table class="table-div" ref="tableDiv" @mouseleave="resizeUp" @mouseout="resizeUp" @mouseup="resizeUp"
           @mouseover="resizeUp">
      <thead class="table-head">
      <tr class="table-head-div">
        <th class="table-head-item"><i class="resize"></i></th>
        <th class="table-head-item" v-for="(item,index) in table.thead"
            :style="{'width':resize.width[index] + 'px'}">
          <div class="table-head-item-title"> {{item.title}}</div>
          <i class="resize" @mousedown="resizeDown($event,index,item)" @mousemove="resizeMove"></i>
        </th>
      </tr>
      </thead>
      <tbody class="table-body">
      <tr class="table-body-div" v-for="(item,index) in table.tbody">
        <td class="table-body-item" v-for="(itemItem,itemIndex) in table.thead"
            :style="{'width':resize.width[itemIndex] + 'px'}">
          {{item[itemItem.val]}}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import {reactive, ref} from 'vue';
import setting from '../../setting.json';

export default {
  props: {
    tableArr: Object,
  },
  setup (props, context) {
    /**
       * 表格数据 图标
       */
    const table = reactive({
      thead: props.tableArr.thead || [{title: '名称', width: 100, val: 'Name'}],
      tbody: props.tableArr.tbody || [],
      icon: setting.icon.db,
    });
      /**
       * 表头缩放操作数据
       */
    const resize = reactive({
      begin: {}, end: {}, width: [],
    });
    for (let i = 0; i < table.thead.length; i++) {
      resize.width.push(60);
    }
    /**
       * 表格dom对象
       */
    const tableDiv = ref(null);
    /**
       * 表头dom对象
       */
    const tableItemDiv = ref(null);
    /**
       * 表头 缩放 左键按下
       * @param $event
       * @param index
       * @param item
       */
    const resizeDown = ($event, index, item) => {
      resize.item = item;
      resize.index = Number(index);
      resize.begin = Number($event.clientX) - Number(resize.width[resize.index]);
    };
      /**
       * 表头 缩放 鼠标移除操作区域
       * 移动时动态处理缩放的宽度
       * @param $event
       */
    const resizeMove = ($event) => {
      if (resize.index + 1) {
        resize.end = Number($event.clientX);
        resize.width[resize.index] = resize.end - resize.begin;
      }
    };
      /**
       * 表头 缩放 鼠标抬起
       * @param $event
       */
    const resizeUp = ($event) => {
      if (resize.index + 1) {
        resize.end = $event.clientX;
        delete resize.index;
      }
    };
    return {
      table, resize, tableDiv, tableItemDiv, resizeDown, resizeMove, resizeUp,
    };
  },
};
</script>
<style scoped lang="scss">
  .table-div {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex: 1 0 auto;
    color: #fefefe;
    font-size: 11px;
    line-height: 2;

    .table-head, .table-head-div, .table-head-item, .table-body, .scroll-bar, .table-body-div, .table-body-item {
      display: flex;
    }

    .table-head {
      height: 23px;
      background-color: #323232;
      border-top: 1px solid #696969;
      border-bottom: 1px solid #696969;
      flex-direction: row;
      flex: 1 0 auto;
      width: auto;
      z-index: 1;
      position: sticky;
      top: 0;

      .table-head-div {
        .table-head-item {
          min-width: 2px;
          margin: 4px 0 4px 0;
          line-height: 1.5;
          position: relative;
          justify-content: space-between;

          &:first-child {
            width: 20px;
            min-width: 20px;

            .resize {
              cursor: default;
            }
          }

          .table-head-item-title {
            margin-right: 18px;
            height: 100%;
            line-height: 1.3;
            overflow: hidden;
            text-align: left;
          }

          .resize {
            display: inline-block;
            position: absolute;
            right: 0;
            width: 1px;
            margin: 0 2px 0 4px;
            cursor: col-resize;
            height: 100%;
            background-color: #696969;

            &:before {
              content: ' ';
              position: absolute;
              left: 0;
              width: 10px;
              height: 100%;
            }

            &:after {
              content: ' ';
              position: absolute;
              right: 0;
              width: 10px;
              height: 100%;
            }
          }
        }
      }
    }

    .table-body {
      flex-direction: column;
      justify-content: flex-start;
      width: auto;
      flex: 1 0 auto;

      .table-body-div {
        height: 20px;
        margin-left: 20px;
        line-height: 1.8;
        flex-direction: row;
        justify-content: flex-start;
        overflow: hidden;
        background-color: #1e1e1e;

        &:nth-child(3n) {
          background-color: #060606;
          box-shadow: -20px 0px #060606;
        }

        .table-body-item {
          position: relative;
          height: 18px;
          min-width: 2px;
          margin: 0 0 0 0;
          justify-content: flex-start;
          overflow: hidden;

          &::before {
            content: ' ';
            position: absolute;
            right: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background-color: #1e1e1e;
          }
        }

        &:nth-child(3n) .table-body-item::before {
          background-color: #060606;
        }
      }
    }
  }
</style>
