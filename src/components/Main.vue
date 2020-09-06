<template>
  <el-container class="aside-main">
    <!-- top setting header -->
    <el-header class="aside-main-header tab" height="30px">
      <div>
        <el-tabs v-model="tabsActive" type="card">
          <el-tab-pane v-for="item in tabs" :label="item.title" :name="item.name" :key="item.name"
                       class="tab-item"></el-tab-pane>
        </el-tabs>
      </div>
      <!--      <el-tag v-for="item in tabs" class="tab-item"-->

      <!--              type="info" :closable="item.closable"-->
      <!--              effect="dark">-->
      <!--        {{ item.name }}-->
      <!--      </el-tag>-->
    </el-header>
    <!-- tab container -->
    <Tab class="aside-main-main"></Tab>
  </el-container>
</template>
<script>
  import Tab from '@/components/Tab';

  export default {
    data() {
      return {
        tabsActive: '',
        tabs: [
          {title: '对象1', name: 'name1', path: '', closable: true,},
          {title: '对象2', name: 'name2', path: '', closable: true,},
          {title: '对象3', name: 'name3', path: '', closable: true,},
          {title: '对象4', name: 'name4', path: '', closable: true,},
          {title: '对象5', name: 'name5', path: '', closable: true,},
          {title: '对象6', name: 'name6', path: '', closable: true,},
          {title: '对象7', name: 'name7', path: '', closable: true,},
        ],

      };
    },
    components: {Tab},
    created() {
      let _this = this;
      this.tabsActive = this.tabs[0].name;
    }
  }
</script>
<style scoped>
  .aside-main {
    border: none;
  }

  .tab {
    display: block;
    height: 30px;
    overflow-y: hidden;
    padding: 0 0 0 0;
    background-color: #323232;
  }

  .tab-item {
    display: flex;
    width: 600px;
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    line-height: 30px;
    text-align: center;
    border-right: 1px solid #6b6b6c;
  }
  .aside-main-main{
    overflow: hidden;
  }
</style>