<template>
  <el-container class="container">
    <!-- header container -->
    <Header class="container-header"></Header>
    <el-main class="container-main">
      <el-container class="aside">
        <!-- left container -->
        <Aside class="aside-left"></Aside>
        <!-- right main container -->
        <Main class="aside-main"></Main>
        <!-- left container -->
        <!-- <Aside class="aside-left"></Aside>-->
      </el-container>
    </el-main>
    <!-- footer container -->
    <el-footer height="20px" class="container-footer active">
      <p></p>
    </el-footer>
  </el-container>
</template>
<script>
  import Header from '@/components/Header';
  import Aside from '@/components/Aside';
  import Main from '@/components/Main';

  export default {
    name: 'index',
    data() {
      return {
        sideWidth: 250,
        setting: {fontFamily: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif', 'Microsoft YaHei', 'Apple Color Emoji', 'Segoe UI Emoji'],},
      };
    },
    created() {
      // restore side bar width
      this.restoreSideBarWidth();
      this.init();
    },
    components: {Header, Aside, Main},
    methods: {
      init() {
        let _this = this;
        _this.$messages.send({
          channel: _this.$channel.SETTING, messages: _this.$messages.SETTING.GET,
          key: 'setting'
        }).then(
          res => {
            _this.$set(_this, 'setting', res.res);
            _this.reloadSettings();
          },
          err => {
            console.error(err);
          }
        );
      },
      bindSideBarDrag() {
        const that = this;
        // const dragPointer = document.getElementById('drag-resize-pointer');
        //
        // function mousemove(e) {
        //   const mouseX = e.x;
        //   const dragSideWidth = mouseX - 19;
        //
        //   if ((dragSideWidth > 200) && (dragSideWidth < 500)) {
        //     that.sideWidth = dragSideWidth;
        //   }
        // }
        //
        // function mouseup(e) {
        //   document.documentElement.removeEventListener('mousemove', mousemove);
        //   document.documentElement.removeEventListener('mouseup', mouseup);
        //
        //   // store side bar with
        //   localStorage.sideWidth = that.sideWidth;
        // }
        //
        // dragPointer.addEventListener('mousedown', (e) => {
        //   e.preventDefault();
        //
        //   document.documentElement.addEventListener('mousemove', mousemove);
        //   document.documentElement.addEventListener('mouseup', mouseup);
        // });
      },
      restoreSideBarWidth() {
        let sideWidth = localStorage.sideWidth;
        sideWidth && (this.sideWidth = sideWidth);
      },
      openHrefInBrowser() {
        const shell = require('electron').shell;

        document.addEventListener('click', function (event) {
          const ele = event.target;

          if (ele && (ele.nodeName.toLowerCase() === 'a') && ele.href.startsWith('http')) {
            event.preventDefault();
            shell.openExternal(ele.href);
          }
        });
      },
      reloadSettings() {
        this.initFont();
        this.initZoom();
      },
      initFont() {
        document.body.style.fontFamily = this.setting.theme.fontFamily.map((line) => {
          return `"${line}"`
        }).join(',');
      },
      initZoom() {
        let zoomFactor = this.setting.theme.zoomFactor;
        zoomFactor = zoomFactor ? zoomFactor : 1.0;

        const {webFrame} = require('electron');
        webFrame.setZoomFactor(zoomFactor);
      },
    },
    mounted() {
      let _this = this;
      _this.$messages.$on(_this.$channel.SETTING + '/' + 'active', (res) => {
        if (!!res.active) {
          document.querySelector('.option-group').classList.replace('inactive', 'active');
          document.querySelector('.menus').classList.replace('inactive', 'active');
          document.querySelector('.menu-title').classList.replace('inactive', 'active');
          document.querySelector('.container-footer').classList.replace('inactive', 'active');

        } else {
          document.querySelector('.option-group').classList.replace('active', 'inactive');
          document.querySelector('.menus').classList.replace('active', 'inactive');
          document.querySelector('.menu-title').classList.replace('active', 'inactive');
          document.querySelector('.container-footer').classList.replace('active', 'inactive');

        }
      });
      this.bindSideBarDrag();
      this.openHrefInBrowser();
    },
  };
</script>
<style>
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-shrink: 0;
    background-color: transparent;
  }

  .container-header {
    display: flex;
    flex-shrink: 0;
    border-top: 1px solid #6b6b6c;
    border-left: 1px solid #6b6b6c;
    border-right: 1px solid #6b6b6c;
    border-radius: 5px 5px 0 0;
  }

  .container-main {
    padding: 0 0 0 0;
    overflow: hidden;
    display: flex;
    flex-basis: 100%;
    min-height: 400px;
    background-color: transparent;
    border-left: 1px solid #6b6b6c;
    border-right: 1px solid #6b6b6c;
    user-select: none;
  }

  .container-footer {
    margin-bottom: 1px;
    display: flex;
    align-items: flex-end;
    flex-shrink: 0;
    border-top: 2px solid #222;
    border-bottom: 1px solid #6b6b6c;
    border-left: 1px solid #6b6b6c;
    border-right: 1px solid #6b6b6c;
    border-radius: 0 0 5px 5px;
    text-align: center;
  }

  .container-footer.active {
    background-image: linear-gradient(#323232, #2b2b2b);
  }

  .container-footer.inactive {
    background-color: #2d2d2d;
  }

</style>
<style>
  .aside {
    display: flex;
    width: 100%;
    background-color: transparent;
  }

  .aside-left {
    display: flex;
    width: 10px;
    flex: 0 0 200px;
    border-right: 1px solid #000;
    filter: blur(0);
    overflow-x: hidden;
    overflow-y: auto;
    background: rgba(50, 50, 50, 0.98);
  }

  .aside-left::before {
    position: absolute;
    z-index: -1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    content: '';
    filter: blur(30px);
    margin: -50px;
  }

  .aside-main {
    display: flex;
    width: 100%;
    flex-direction: column;
    flex-grow: 1;
  }

  .aside-main-header {
    display: flex;
    width: 100%;
    height: 30px;
  }

  .aside-main-main {
    display: flex;
    width: 100%;
    padding: 0 0 0 0;
  }
</style>
<style scoped>

</style>