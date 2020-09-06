<template>
  <el-header class="container-header option-group active" height="85px">
    <div class="menu-bar">
      <div class="menu-bar-content">
        <div class="menus active">
          <i class="close fa fa-close"></i>
          <i class="min fa fa-minus"></i>
          <i class="max fa fa-unsorted"></i></div>
        <div class="menu-title active">{{title}}</div>
        <div class="menu-title">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      </div>
    </div>
    <div class="option-items">
      <el-button v-for="item in options" :key="item.name" v-if="item.type==='core'" type="text"
                 :slot="item.slot" class="option" @click="item.click">
        <div class="option-div">
          <i :class="item.icon"></i>
          <div class="option-title">{{ item.name }}</div>
        </div>
      </el-button>
    </div>
    <div class="option-items">
      <el-button v-for="item in options" :key="item.name" v-if="item.type==='base'" type="text"
                 class="option">
        <div class="option-div">
          <i :class="item.icon"></i>
          <div class="option-title">{{ item.name }}</div>
        </div>
      </el-button>
    </div>
    <div class="option-items">
      <el-button v-for="item in options" :key="item.name" v-if="item.type==='views'" type="text"
                 class="option">
        <div class="option-div">
          <i :class="item.icon"></i>
          <div class="option-title">{{ item.name }}</div>
        </div>
      </el-button>
    </div>
    <div class="option-items">
      <el-button v-for="item in options" :key="item.name" v-if="item.type==='account'" type="text"
                 class="option">
        <div class="option-div">
          <i :class="item.icon"></i>
          <div class="option-title">{{ item.name }}</div>
        </div>
      </el-button>
    </div>
  </el-header>
  <!--  <el-popover-->
  <!--      placement="right"-->
  <!--      width="400"-->
  <!--      trigger="click">-->
  <!--    <el-table :data="gridData">-->
  <!--      <el-table-column width="150" property="date" label="日期"></el-table-column>-->
  <!--      <el-table-column width="100" property="name" label="姓名"></el-table-column>-->
  <!--      <el-table-column width="300" property="address" label="地址"></el-table-column>-->
  <!--    </el-table>-->
  <!--    <el-button slot="reference">click 激活</el-button>-->
  <!--  </el-popover>-->
</template>
<script type="text/javascript">
  export default {
    data() {
      return {
        title: 'MyNavicat',
        options: [
          {
            type: 'core', icon: 'fa fa-user-circle fa-3x', name: '链接', path: '', slot: 'reference',
            click: this.postmsg,
          },
          {
            type: 'core', icon: 'fa fa-user-circle fa-3x', name: '新建查询', path: '',
            click: this.goDialog,
          },
          {type: 'base', icon: 'fa fa-user-circle fa-3x', name: '表', path: '',},
          {type: 'base', icon: 'fa fa-user-circle fa-3x', name: '视图', path: '',},
          {type: 'base', icon: 'fa fa-user-circle fa-3x', name: '函数', path: '',},
          {type: 'base', icon: 'fa fa-user-circle fa-3x', name: '事件', path: '',},
          {type: 'base', icon: 'fa fa-user-circle fa-3x', name: '用户', path: '',},
          {type: 'base', icon: 'fa fa-user-circle fa-3x', name: '查询', path: '',},
          {type: 'base', icon: 'fa fa-user-circle fa-3x', name: '备份', path: '',},
          {type: 'base', icon: 'fa fa-user-circle fa-3x', name: '自动运行', path: '',},
          {type: 'base', icon: 'fa fa-user-circle fa-3x', name: '模型', path: '',},
          {type: 'views', icon: 'fa fa-user-circle fa-3x', name: '视窗', path: '',},
          {type: 'account', icon: 'fa fa-user-circle fa-3x', name: '账户', path: '',},
        ],
      };
    },
    methods: {
      postmsg() {
        let _this = this;
        this.$messages.send({
          channel: _this.$channel.MENU,
          messages: _this.$messages.MENU.FILE,
          name: 'newLink'
        });
      },
      goDialog() {
        console.log(this);
        this.$router.push({
          path: '/myDialog',
        });
      }
    },
    mounted() {
    },
  };
</script>
<style scoped>
  .menu-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 22px;
    width: 100%;
    display: block;
    overflow: hidden;
  }

  .menu-bar-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .menus {
    display: flex;
    align-self: flex-start;
    flex-direction: row;
    padding: 4px 0 0 7px;
    color: transparent;
  }

  .menus:hover {
    color: #363636;
  }

  .menus .fa {
    border-radius: 7px 7px 7px 7px;
    content: ' ';
    padding: 6.3px 3px;
    margin-right: 7px;
    font-size: 9px;
    line-height: 0px;
  }

  .menus .fa:nth-child(2) {
    padding-top: 7px;
  }

  .menus .fa:last-child {
    transform: rotate(45deg);
    padding: 6px 4px;
  }

  .menu-title {
    display: flex;
    align-self: center;
    font-size: 14px;
  }

  .menus.active .fa {
    background-color: red;
  }

  .menus.active .fa:nth-child(2) {
    background-color: yellow;
  }

  .menus.active .fa:last-child {
    background-color: green;
  }

  .menus.inactive .fa {
    background-color: #6c6c6c;
  }

  .menu-title.active {
    color: #f3f3f3;
  }

  .menu-title.inactive {
    color: #6c6c6c;
  }
</style>
<style scoped>
  .option-group {
    min-width: 880px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    -webkit-app-region: drag;
    -webkit-user-select: none;
    box-shadow: 0 1px 0px 0px #222;
    padding: 22px 0 0 0;
  }

  .option-items:first-child {
    margin-left: 20px;
  }

  .option-items:last-child {
    margin-right: 10px;
  }

  .option {
    border: none;
    margin: 0 0 0 0;
    background-color: transparent;
    outline: none;
    padding: 0 6px;
  }

  .option-div {
    width: 45px;
    height: 50px;
    font-size: 10px;
    padding: 5px 0 0 0;
    color: green;
  }

  .fa:active, .fa:focus {
    opacity: 0.7;
  }

  .option-title {
    color: #f3f3f3;
    line-height: 20px;
  }

  .option-group.active {
    background-image: linear-gradient(#535251, #434241);
  }

  .option-group.inactive {
    background-color: #3b3a39;
  }
</style>