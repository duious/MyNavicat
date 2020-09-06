const setting = {
  theme: {
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif', 'Microsoft YaHei', 'Apple Color Emoji', 'Segoe UI Emoji'],
    zoomFactor: 1.0
  },
  /**
   * 消息总线 信道
   */
  channel: {
    SETTING: 'setting', STORE: 'store', WINDOW: 'window', MENU: 'menu',ACTION:'action',
  },
  /**
   * 消息总线 功能
   */
  messages: {
    SETTING: {
      GET: 'get', SET: 'set',
    },
    STORE: {
      GET: 'get', SET: 'set', DEL: 'del', SIZE: 'size', CLEAR: 'clear',
    },
    WINDOW: {
      OPEN: 'open', CLOSE: 'close',
    },
    MENU: {
      FILE: 'file', LINK: 'link',DB: 'db',
    },
    ACTION:{

    },
  }
}

module.exports = setting;