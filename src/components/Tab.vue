<template>
  <el-main class="aside-main-main">
    <!-- top setting header -->
    <el-header class="options-group" height="34px">
      <div class="options-item-left">
        <el-button v-for="(item,index) in options" :key="index" type="text" :disabled="item.active"
                   :title="item.title" class="options-item" :icon="item.icon" v-if="index<7">
        </el-button>
      </div>
      <div class="options-item-right">
        <el-button v-for="(item,index)  in options" :key="index" type="text" :disabled="item.active"
                   :title="item.title" class="options-item" :icon="item.icon" v-if="index>=7">
        </el-button>
        <el-input class="search" size="mini"
                  placeholder="搜索"
                  prefix-icon="el-icon-search">
        </el-input>
      </div>
    </el-header>
    <!-- tab container -->
    <el-main class="view-div">
      <el-table :data="data.table" class="table-div" size="mini" stripe empty-text=" " >
        <el-table-column v-for="(item,index) in data.column" :row-class-name="tableRowClassName"
                         :prop="item.prop"
                         :label="item.label" height="30px" sortable :key="index"
                         min-width="180">
        </el-table-column>
      </el-table>
    </el-main>
  </el-main>
</template>
<script>
  export default {
    data() {
      return {
        selectedTabName: '',
        options: [
          {title: '打开表', name: '', icon: 'fa fa-table', active: false,},
          {title: '新建表', name: '', icon: 'fa fa-table', active: false,},
          {title: '设计表', name: '', icon: 'fa fa-table', active: false,},
          {title: '删除表', name: '', icon: 'fa fa-table', active: false,},
          {title: '导入向导', name: '', icon: 'fa fa-table', active: false,},
          {title: '导出向导', name: '', icon: 'fa fa-table', active: false,},
          {title: '刷新', name: '', icon: 'fa fa-repeat', active: false,},
          {title: '列表', name: '', icon: 'fa fa-th', active: false,},
          {title: '详情', name: '', icon: 'fa fa-list', active: false,},
          {title: 'ER图', name: '', icon: 'fa fa-table', active: false,},
          {title: '搜索', name: '', icon: 'fa fa-table', active: false,},
        ],
        data: {
          column: [
            {label: '名', prop: 'name'},
            {label: '', prop: ''},
          ],
          table: []
        },
      };
    },
    components: {},
    created() {
      let _this = this;
      _this.$messages.$on(_this.$channel.ACTION + '/' + 'reload', (res) => {
        _this.reloadTable(res);
      });
    },
    methods: {
      tableRowClassName({row, rowIndex}) {
        if (rowIndex === 1) {
          return 'warning-row';
        } else if (rowIndex === 3) {
          return 'success-row';
        }
        return '';
      },
      reloadTable(res) {
        let _this = this;
        _this.data.column = [];
        for (let key in res[1][0]) {
          _this.data.column.push({label: key, prop: key});
        }
        _this.data.table=[];
        _this.data.table.push(res[1][0]);
      }
    },
  };
</script>
<style scoped>
  .aside-main-main {
    flex-direction: column;
    border: none;
  }

  .options-group {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: #000;
    border: none;
    padding: 0 12px;
  }

  .options-item {
    display: flex;
    font-size: 18px;
    line-height: 18px;
    padding: 8px 6px 0 0;
    align-self: flex-start;
    color: #707070;
  }

  .options-item-left, .options-item-right {
    display: flex;
  }

  .options-item-left .options-item:nth-child(4)::after,
  .options-item-left .options-item:nth-child(6)::after,
  .options-item-right .options-item:nth-child(3)::after {
    content: '|';
    padding: 0 0 0 18px;
  }

  .search {
    height: 20px;
    margin: 6px 0;
    overflow: hidden;
    background-color: #000;
  }

  .search .el-input__inner, .el-input--mini .el-input__inner {
    height: 18px;
  }

  .el-input--mini .el-input__icon {
    line-height: 18px;
  }

  .view-div {
    padding: 0 0 0 0;
    border: none;
    position: relative;
    overflow: auto;
  }

  .table-div {
    background-color: #24262a;
    height: 100%;
    border: none;
    min-width: 100%;
    min-height: 300px;
  }
</style>