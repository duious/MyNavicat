<template>
  <div class="index">
    <component class="header" v-once v-if="''!==component.header" :is="component.header"></component>
    <div class="container" ref="containerEl">
      <component class="aside" v-once v-if="''!==component.aside" :is="component.aside"></component>
      <component class="main" v-once v-if="''!==component.main" :is="component.main"></component>
    </div>
    <div class="footer"></div>
  </div>
</template>
<script>
import Header from './Header.vue';
import Aside from './Aside.vue';
import Main from './Main.vue';
import setting from '../../setting.json';

export default {
  name: 'index',
  components: {'Header': Header, 'Aside': Aside, 'Main': Main},
  data () {
    return {
      component: {header: '', aside: '', main: ''},
    };
  },
  created () {
    let _this = this;
    _this.$message.send(setting.path.disk.get.path, {key: setting.disk.key.setting}).then((res) => {
    });
    _this.component.header = 'Header';
    _this.component.aside = 'Aside';
    _this.component.main = 'Main';
  },
  methods: {},
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
