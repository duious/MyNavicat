<template>
  <div class="index">
    <component class="header" v-if="''!==component.header" :is="component.header"
               :activeObj="activeObj"
               @optionClick="headerOptionClick"></component>
    <div class="container" ref="containerEl">
      <component class="aside" v-if="''!==component.aside" :is="component.aside"
                 :activeObj="activeObj"
                 @optionClick="asideOptionClick"></component>
      <component class="main" v-if="''!==component.main" :is="component.main"
                 :activeObj="activeObj"></component>
    </div>
    <div class="footer"></div>
  </div>
</template>
<script>
import {msg} from '../message';
import Header from './Header.vue';
import Aside from './Aside.vue';
import Main from './Main.vue';
import setting from '../../setting.json';
const DEFAULT_ACTIVE = 'table';
export default {
  name: 'index',
  components: {'Header': Header, 'Aside': Aside, 'Main': Main},
  data () {
    return {
      activeObj: JSON.stringify({option: DEFAULT_ACTIVE, tab: DEFAULT_ACTIVE}),
      component: {header: '', aside: '', main: ''},
    };
  },
  created () {
    let _this = this;
    msg.send(setting.path.disk.get.path, {key: setting.disk.key.setting}).then((res) => {
    });
    _this.component.header = 'Header';
    _this.component.aside = 'Aside';
    _this.component.main = 'Main';
  },
  methods: {
    headerOptionClick (type, item) {
      let _this = this;
      switch (type) {
        /**
           * 新链接调取原生菜单
           * 新查询调取新地址建立新tab页
           */
        case 'core':
          if (item.option === 'newLink') {
            msg.send(setting.path.menu.open.path, {params: setting.path.menu.open.params.newLink});
          } else {
            _this.activeObj = JSON.stringify(Object.assign(JSON.parse(_this.activeObj), {option: item.option, tab: item.option, v: new Date().getTime()}));
          }
          break;
        case 'base':
          _this.activeObj = JSON.stringify(Object.assign(JSON.parse(_this.activeObj), {option: item.option, tab: DEFAULT_ACTIVE}));
          break;
        default:
          break;
      }
    },
    asideOptionClick (type, item) {
      let _this = this;
      let actObj = JSON.parse(_this.activeObj);
      delete actObj['asideData'];
      _this.setActiveObj(Object.assign(actObj, {option: type, tab: DEFAULT_ACTIVE, asideData: JSON.parse(JSON.stringify(item))}));
    },
    getActiveObj () {
      return JSON.parse(JSON.stringify(JSON.parse(this.activeObj)));
    },
    setActiveObj (obj) {
      this.activeObj = JSON.stringify(JSON.parse(JSON.stringify(obj)));
    },
  },
};
</script>
<style lang="scss">
  .index, .header, .container, .aside, .main, .footer {
    display: flex;
  }

  .index {
    width: 100%;
    height: 100%;
    /*min-height: 510px;*/
    border: none;
    flex-direction: column;
    justify-content: space-between;
    cursor: default;
    user-select: none;
    -webkit-user-select: none;
    flex: 1 1 auto;

    *:focus {
      outline: none;
    }

    .header {
      height: 77px;
      border-bottom: 1px solid #000;
      flex-direction: column;
      /*background-image: linear-gradient(#444448, #36373a);*/
      background-image: linear-gradient(#515151, #424242); /*8am*/
      -webkit-app-region: drag;
      -webkit-user-select: none;
      /*background-color: #2c2c30; night inactive*/
    }

    .container {
      height: auto;
      min-height: 409px;
      flex: 1 1 auto;
      align-items: stretch;
      border-bottom: 1px solid #000;

      .aside {
        position: relative;;
        height: auto;
        min-height: 100%;
        border-right: 1px solid #000;
        overflow-x: hidden;
        overflow-y: auto;
        flex-grow: 1;
        flex-shrink: 0;
        flex-direction: column;
        justify-content: flex-start;
        color: #fefefe;
        font-size: 13px;
        line-height: 1.7;
      }

      .main {
        width: 100%;
        height: auto;
        flex-direction: column;
        flex: 1 1 auto;
      }
    }

    .footer {
      flex: 0 0 22px;
      height: 22px;
      width: 100%;
    }
  }
</style>
