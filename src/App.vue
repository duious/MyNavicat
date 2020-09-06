<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script>
  import Vue from "vue";

  export default {
    name: 'app',
    data() {
      return {};
    },
    created() {

    },
    methods: {

    },
    mounted() {

    },
  };
</script>
<style>
  .el-tabs--card > .el-tabs__header {
    border-bottom: none;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__nav, .el-tabs--card > .el-tabs__header .el-tabs__item {
    border: none;
  }

  .el-tabs__item, .el-tabs__item.is-active, .el-tabs__item:hover {
    color: #fefefe;
  }

  .el-tabs__item {
    background-color: transparent;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
  }

  .el-tabs__item.is-active, .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    background-color: #000;
    border-bottom: none;
  }

  .el-table::before {
    height: 0;
  }

  .el-table td, .el-table th.is-leaf {
    border: none;
    padding: 0 0 0 0;
    overflow-y: hidden;
  }

  .el-table td, .el-table th {
    padding: 0 0 0 0;
    background-color: #32353a;
  }

  .el-table__header {
    border-top: 1px solid #6b6b6c;
    border-bottom: 1px solid #6b6b6c;
  }

  .el-table th.is-leaf:not(:last-child) {
    border-right: 1px solid #6b6b6c;
  }

  .el-table .caret-wrapper {
    height: 20px;
    float: right;
    width: 12px;
  }

  .el-table .sort-caret.ascending, .el-table .sort-caret.descending {
    border-color: transparent;
  }

  .el-table .sort-caret.ascending {
    top: 4px;
  }

  .el-table .sort-caret.descending {
    bottom: 0;
  }

  .el-table .descending .sort-caret.descending {
    border-top-color: #6b6b6c;
  }

  .el-table .ascending .sort-caret.ascending {
    border-bottom-color: #6b6b6c;
  }

  .el-collapse-item__header {
    background-color: transparent;
    border: none;
    color: #fefefe;
    height: 24px;
    padding-left: 22px;
    cursor: default;
  }

  .el-collapse-item__arrow {
    left: 5px;
    position: absolute;
  }

  .el-dialog.is-fullscreen {
    background-color: #1e1e1e;
  }

  .el-dialog__body, .el-dialog__header {
    padding: 0 0 0 0;
  }

  .el-tabs__nav-scroll {
    display: flex;
    justify-content: center;
    border-bottom: 1px solid #3f3f3d;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__nav {
    display: flex;
  }

  .el-tabs__item {
    padding: 0 8px;
  }

  .dialog-footer {
    position: absolute;
    width: 100%;
    bottom: 0;
    background-color: #363739;
    padding-top: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .el-form-item--mini.el-form-item {
    margin-bottom: 0;
  }

  .el-form-item--mini .el-form-item__label {
    color: #fff;
    font-size: 12px;
    padding-right: 6px;
  }

  .el-input--mini {
    width: 300px;
  }

  .el-input--mini .el-input__inner {
    height: 22px;
    line-height: 100%;
    color: #fff;
    background-color: #292929;
    border-color: #383838;
    border-radius: 4px;
    padding: 0 0 0 6px;
  }

  .el-table{
  position: absolute; width: auto; max-width: none;
  }


  .el-input--mini .el-input__icon {
    line-height: 18px;
  }
</style>
<style>

  ::-webkit-scrollbar {
    width: 2px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #666;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-track:hover {
    background: #666;
  }

  ::-webkit-scrollbar-thumb {
    width: 100px;
    border-radius: 4px;
    background: #c1c1c1;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #c1c1c1;
  }
</style>
<style type="text/css">
  html {
    height: 100%;
    background-color: transparent;
  }

  body {
    height: 100%;
    padding: 0 0 0 0;
    margin: 0 0 0 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;

    /*fix body scroll-y caused by tooltip in table*/
    overflow: hidden;
  }

  button, input, textarea, .vjs__tree {
    font-family: inherit !important;
  }





  .aside-drag-container {
    position: relative;
    user-select: none;
    max-width: 50%;
  }

  .aside-connection {
    height: 100%;
    width: 100% !important;
    border-right: 1px solid #e4e0e0;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .el-message-box .el-message-box__message {
    word-break: break-all;
  }

  #drag-resize-container {
    position: absolute;
    /*height: 100%;*/
    width: 10px;
    right: -5px;
    top: 0px;
  }

  #drag-resize-pointer {
    position: fixed;
    height: 100%;
    width: 18px;
    cursor: col-resize;
  }

  #drag-resize-pointer::after {
    content: "";
    display: inline-block;
    width: 2px;
    height: 20px;
    border-left: 1px solid #adabab;
    border-right: 1px solid #adabab;

    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }

  .dark-mode #drag-resize-pointer::after {
    border-left: 1px solid #b9b8b8;
    border-right: 1px solid #b9b8b8;
  }
</style>