import Vue from 'vue';

const eventHub = new Vue();

export default {
  /**
   * 接收消息
   * @param event
   */
  $on(...event) {
    eventHub.$on(...event);
  },
  $off(...event) {
    eventHub.$off(...event);
  },
  $once(...event) {
    eventHub.$once(...event);
  },
  /**
   * 发送消息
   * @param event
   */
  $emit(...event) {
    eventHub.$emit(...event);
  },
};
