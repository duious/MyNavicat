<template>
  <div>
    <div class="title-bar"><span class="title">{{title}}</span></div>
    <div class="menu-div">
      <div class="menu-group" v-for="optionsItem in options">
        <div class="menu-item" v-for="(item,index) in optionsItem" :class="item.active?'clicked':''"
             @click="menuClick(item,index)">
          <div class="menu-item-icon" v-if="item.table.indexOf(',')===-1" v-html="getIconDom(item.table)"></div>
          <div class="menu-item-icon" v-else v-for="icons in item.table.split(',')" v-html="getIconDom(icons)"></div>
          <span class="menu-item-title">{{item.title}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import setting from '../../setting.json';

export default {
  data () {
    return {
      title: document.title,
      options: [
        [
          {type: 'core', table: 'newLink', title: '链接', action: 'link'},
          {type: 'core', table: 'newQuery', title: '新建查询', action: 'query'},
          {type: 'base', table: 'table', title: '表', path: '', active: true},
          {type: 'base', table: 'view', title: '视图', path: ''},
          {type: 'base', table: 'fn', title: '函数', path: ''},
          {type: 'base', table: 'event', title: '事件', path: ''},
          {type: 'base', table: 'user', title: '用户', path: ''},
          {type: 'base', table: 'query', title: '查询', path: ''},
          {type: 'base', table: 'backup', title: '备份', path: ''},
          {type: 'base', table: 'autoRun', title: '自动运行', path: ''},
          {type: 'base', table: 'model', title: '模型', path: ''},
        ],
        [
          {type: 'views', table: 'leftView,rightView', title: '视窗', path: ''},
          {type: 'account', table: 'loginUser', title: '账户', path: ''},
        ],
      ],
      icon: setting.icon.menu,
    };
  },
  methods: {
    getIconDom (icon) {
      return this.icon[icon]['25'].indexOf('svg') !== -1 ? this.icon[icon]['25'] : this.icon[icon];
    },
    menuClick (item, index) {
      let _this = this;
      switch (item.type) {
        /**
           * 新链接调取原生菜单
           * 新查询调取新地址建立新tab页
           */
        case 'core':
            item.table === 'newLink' ?
              _this.$message.send(setting.path.menu.open.path, {params: setting.path.menu.open.params.newLink}) :
              _this.$message.$emit(setting.path.root.creat.path, {params: {path: item.table, table: item.table}});
          break;
        case 'base':
          _this.activeMenu(item);
          break;
        case 'views':
          break;
        case 'account':
          break;
        default:
          break;
      }
    },
    activeMenu (item) {
      let _this = this;
      for (let i = 0; i < _this.options.length; i++) {
        for (let j = 0; j < _this.options[i].length; j++) {
          _this.options[i][j].active = false;
        }
      }
      item.active = true;
      _this.$message.$emit(setting.path.root.go.path, {params: {path: item.path, table: item.table}});
    },
  },
};
</script>
<style scoped lang="scss">
  .header {
    .title-bar, .menu-div, .title, .menu-group, .menu-item, .menu-item-icon, .menu-item-title {
      display: flex;
    }

    .title-bar {
      height: 22px;
      width: 100%;
      justify-content: center;
      font-size: 12px;
      color: #8f8f8f;

      .title {
      }
    }

    .menu-div {
      min-width: 950px;
      font-size: 11px;
      line-height: 1.8;
      color: #8f8f8f;
      height: 55px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .menu-div .menu-group:first-child {
        margin-left: 100px;
        grid-template-columns: repeat(10, 62px);
        grid-template-rows: 100%;
      }

      .menu-group {
        flex-direction: row;

        .menu-item {
          width: 63px;
          text-align: center;
          border-left-width: 1px;
          flex-direction: column;
          transition: .1s;

          .menu-item-icon {
            width: 33px;
            height: 33px;
            align-self: center;
            justify-content: center;
            align-items: center;
            user-select: auto;
            -webkit-user-select: auto;

            &:focus, &:active {
              opacity: .6;
            }
          }

          .menu-item-title {
            align-self: center;
          }
        }

        .menu-item:nth-child(3) {
          margin-left: 43px;
        }

        .clicked {
          background-color: #696969;
          border-radius: 2px 2px 0 0;
        }
      }

      .menu-group:nth-child(2) {
        .menu-item:first-child {
          margin-right: 46px;
          width: 88px;
          display: grid;
          grid-template-columns: 50% 50%;
          grid-template-rows: 60% 40%;


          .menu-item-icon {
            display: grid;
            width: 44px;
          }

          .menu-item-title {
            display: grid;
            width: 88px;
          }
        }
      }
    }
  }
</style>
