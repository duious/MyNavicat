'use strict';
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path');

module.exports = {
  host: 'localhost',
  port: 9988,
  // 调试支持
  // sourcemap: true,
  // productionSourceMap: true,
  // 压缩
  minify: 'esbuild',
  // 是否自动在浏览器打开
  open: false,
  // 是否开启 https
  https: false,
  // 服务端渲染
  ssr: false,

  // 导入别名
  // 这些条目可以是精确的请求->请求映射*（精确，无通配符语法）
  // 也可以是请求路径-> fs目录映射。 *使用目录映射时
  // 键**必须以斜杠开头和结尾**
  // alias: {
  // ‘react‘: ‘@pika/react‘,
  // ‘react-dom‘: ‘@pika/react-dom‘
  // ‘/@foo/‘: path.resolve(__dirname, ‘some-special-dir‘),
  // },
  // 配置Dep优化行为
  // optimizeDeps: {
  //   exclude: [‘dep-a‘, ‘dep-b‘],
  // },
  // 转换Vue自定义块的功能。
  // vueCustomBlockTransforms: {
  //   i18n: src => `export default Comp => { ... }`,
  // },
  // 为开发服务器配置自定义代理规则。
  proxy: {
    // proxy: {
    //   ‘/foo‘: ‘http://localhost:4567/foo‘,
    //   ‘/api‘: {
    //     target: ‘http://jsonplaceholder.typicode.com‘,
    //     changeOrigin: true,
    //     rewrite: path => path.replace(/^\/api/, ‘‘),
    //   },
    // },
  },
  // ...
};
