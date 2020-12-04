<template>
  <div class="tab-div">
    <div class="tab-header">
      <div class="tab-btn-group">
        <button class="tab-btn" v-for="({tabHead}, index) in tabData.list" type="button"
                :class="tabHead.clicked ? 'clicked' : ''" :key="index + '.' + tabHead.type"
                @click.stop="tabsItemClick(tabHead, index, $event)">{{tabHead.title}}
        </button>
      </div>
    </div>
    <div class="tab-body">
      <div class="table" v-for="({tabHead,tabBody}, index) in tabData.list" v-show="tabHead.clicked">
        <component v-if="''!==tabBody.slot.component" :tableArr="tabBody.slot.tableData"
                   :is="tabBody.slot.component"></component>
      </div>
    </div>
  </div>
</template>
<script>
import {reactive, ref, onMounted} from 'vue';
import Table from './Table.vue';

export default {
  components: {'Table': Table},
  props: {
    tabsArr: {
      type: Array,
      required: true,
    },
  },
  setup (props, context) {
    const tabData = reactive({
      list: ref(props.tabsArr),
    });
    const resetList = () => {
      tabData.list.filter((one) => {
        one.tabHead.clicked = false;
      });
    };
    const initTableData = (tableData, arr) => {
      tableData = {};
      tableData.thead = [];
      for (let tableKey in arr[0]) {
        tableData.thead.push({title: tableKey, width: 100, val: tableKey});
      }
      tableData.tbody = arr;
      return tableData;
    };

    for (let i = 0; i < tabData.list.length; i++) {
      if (tabData.list[i].tabBody.slot.tableData instanceof Array) {
        let arr = JSON.parse(JSON.stringify(tabData.list[i].tabBody.slot.tableData));
        tabData.list[i].tabBody.slot.tableData = initTableData(tabData.list[i].tabBody.slot.tableData, arr);
        tabData.list[i].tabBody.slot.component = 'Table';
      }
    }

    const tabsItemClick = (item, index, event) => {
      event.preventDefault();
      resetList();
      item.clicked = true;
      context.emit('tabsItemClick', item, event);
      // context.emit('clickTabs', item, (res) => {
      //   console.error(res);
      //   if (res instanceof Array) {
      //     item = tabData.list.find((one) => {
      //       if (one.tabHead.type == item.type) {
      //         return one;
      //       }
      //     });
      //     item.tabBody.slot.component = '';
      //     item.tabBody.slot.tableData = initTableData(item.tabBody.slot.tableData, res);
      //     item.tabBody.slot.component = 'Table';
      //   }
      // });
    };
    return {tabData, tabsItemClick};
  },
};
</script>
<style scoped lang="scss">
  .tab-div, .tab-header, .tab-body, .tab-btn-group {
    display: flex;
  }

  .tab-div {
    width: 100%;
    min-height: 160px;
    height: 100%;
    flex-direction: column;

    .tab-header {
      height: 32px;
      width: 100%;
      border-top: 1px solid #030303;
      border-bottom: 1px solid #4e4e4e;
      flex-direction: row;
      justify-content: center;

      .tab-btn-group {
        flex-direction: row;
        justify-content: space-around;

        .tab-btn {
          height: 20px;
          min-width: 36px;
          align-self: center;
          width: auto;
          background-color: transparent;
          outline: none;
          border: none;
          color: #fefefe;
          border-radius: 4px;
          font-size: 12px;

          &:hover {
            background-color: #94b0f6;
          }

          &:not(:last-child) {
            margin-right: 4px;
          }
        }

        .clicked, .clicked:hover {
          background-color: #4e4fed;
        }
      }
    }

    .tab-body {
      width: 100%;
      height: 100%;
      overflow: auto;

      .table {
        width: 100%;
        height: 100%;
        overflow: scroll;
      }
    }

    .tab-footer {
      width: 100%;
      height: 26px;
      border-top: 1px solid #4e4e4e;
    }
  }
</style>
