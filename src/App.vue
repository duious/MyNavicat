<template>
  <router-view></router-view>
</template>
<script>
import setting from '../setting.json';

export default {
  name: 'App',
  created () {
    let _this = this;
    /**
       * 应用激活状态
       */
    _this.$message.$on(setting.path.action.update.active.path, (res) => {
        res.res.active === true ? console.debug('选中啦！') : console.debug('失焦啦！');
    });
    _this.$message.send(setting.path.disk.get.path, {key: setting.disk.key.setting}).then((res) => {
    });
  },
};
</script>
<style lang="scss">
  body {
    width: 100%;
    height: 100%;
    margin: 0 0 0 0;
    padding: 0 0 0 0;
    position: fixed;

    #app {
      display: flex;
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
    }

    /* 滚动条整体部分，可以设置宽度啥的 */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    /* 滚动条两端的按钮 */
    ::-webkit-scrollbar-button {
      display: none;
    }

    /* 外层轨道 */
    ::-webkit-scrollbar-track {
      margin-top: 24px;
      padding: 10px 0;
      /*-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);*/
      border-radius: 8px;
      background-color: transparent;
    }

    /* 内层滚动槽 */
    ::-webkit-scrollbar-track-piece {
      background-color: transparent;
    }

    /* 滚动的滑块 */
    ::-webkit-scrollbar-thumb {
      padding: 4px 0;
      border-radius: 6px;
      background: #696969;
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);

      &:hover, &:active {
        background: #696969;
      }

      /* 浏览器失焦的样式*/
      &:window-inactive {
        /*background: rgba(255, 0, 0, 0.4);*/
      }
    }

    /* 边角 */
    ::-webkit-scrollbar-corner {
      background-color: transparent;
    }

    /* 定义右下角拖动块的样式 */
    ::-webkit-resizer {
      background-color: transparent;
    }
  }
</style>
