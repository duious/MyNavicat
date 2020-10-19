<template>
  <div style="display: flex;">
    <table class="table-div" ref="tableDiv">
      <thead class="table-head">
      <tr class="table-head-div">
        <th class="table-head-item"><i class="vertical-line"></i></th>
        <Resizer class="table-head-item" :type="'right'" :rank="[60]" v-for="(item,index) in table.thead"
                 :data-index="index" @styleChange="styleChange">
          <div class="table-head-item-title"> {{item.title}}</div>
          <i class="vertical-line"></i>
        </Resizer>
      </tr>
      </thead>
      <tbody class="table-body">
      <tr class="table-body-div" v-for="(item,index) in table.tbody">
        <td class="table-body-item" v-for="(itemItem,itemIndex) in table.thead"
            :style="resizeStyleArr[itemIndex]">
          {{item[itemItem.val]}}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import {reactive, ref} from 'vue';
import Resizer from './Resizer.vue';
import setting from '../../setting.json';

export default {
  components: {'Resizer': Resizer},
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
    let resizeStyleArr = [];
    for (let i = 0; i < table.thead.length; i++) {
      resizeStyleArr.push({width: '60px'});
    }
    resizeStyleArr = reactive(resizeStyleArr);
    /**
       * 表格dom对象
       */
    const tableDiv = ref(null);
    /**
       * 表头dom对象
       */
    const tableItemDiv = ref(null);
    const styleChange = (style, dom) => {
      resizeStyleArr[dom.getAttribute('data-index')] = style;
    };
    return {
      table, tableDiv, tableItemDiv, styleChange, resizeStyleArr,
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
    font-family: 'Meslo LG M for Powerline, Noto Sans Mono CJK SC',monospace !important;

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

          .vertical-line {
            display: inline-block;
            position: absolute;
            right: 0;
            width: 1px;
            margin: 0 2px 0 4px;
            height: 100%;
            background-color: #696969;
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
