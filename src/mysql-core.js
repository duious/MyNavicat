import {reactive, readonly} from 'vue';
import setting from '../setting.json';
const mysql = require('mysql');

const _store = reactive({
  /**
   *  运行时，所有链接集合
   *  @example: [
   *             {
   *                 "id": 1,                  自增，取自数组长度
   *                 "type": "mysql",          链接类型
   *                 "title": "mylink",        备注名称
   *                 "linkData": {             链接信息
   *                     "database": "demo",   默认库
   *                     "host": "127.0.0.1",  主机地址
   *                     "password": "123",    登陆密码
   *                     "port": 3306,         主机端口
   *                     "user": "root"        登陆用户
   *                 },
   *                 "state": {                当前链接状态
   *                     "clicked": false,     是否选中
   *                     "linked": false,      是否已链接
   *                     "open": false,        是否展开
   *                     "remember": false     是否记住密码
   *                 },
   *                 "children": "",           展开子集合
   *                 "pool": ""                链接池
   *             }
   *  ],
   *  */
  linkArr: [],
  /**
   * 运行时，链接建立后所有可操作库集合
   * @example :[
   *            {
   *              "id": "1.1",                split('.')[1]:自增，取自当前数组长度split('.')[0]:linkArr元素id
   *              "type": "db",               当前库类型
   *              "title":"mysql",            名称，取自库信息-名称
   *              "dbData": {                 当前库信息
   *                  "name":"mysql",         名称
   *                  "character":"utf8mb4",  编码格式
   *                  collation:"utf8mb4_ci",
   *              },
   *              "state": {                  当前库状态
   *                  "clicked": false,       是否选中
   *                  "linked": false,        是否已链接
   *                  "open": false,          是否展开
   *              },
   *              "connection": "",           库链接，使用时从链接池获取更新后使用
   *              "children": ""                 展开的子集合
   *            }
   * ]
   */
  dbArr: [],
  /**
   * 运行时，所有可操作表集合
   * @example :[
   *            {
   *               "id": "1.4.1",       split('.')[2]:自增，取自当前数组长度split('.')[0]:linkArr元素id，split('.')[1]:deArr元素id
   *               "type": "table",     当前表类型：table
   *               "title": "app_grade",当前表名称
   *               "state": {           当前表状态
   *                 "clicked": "",     是否选中
   *                 "linked": "",      是否已链接
   *               },
   *            }
   * ]
   */
  tableArr: [],
});
const myStore = {
  debug: false,

  store: {
    /**
     * 可操作元素的状态
     */
    stateObj: readonly({clicked: false, linked: false, open: false, remember: false}),
    dbChildrenObj: (one) => readonly([
      {
        id: one.id + '.' + 1, type: '', title: setting.dist.table.type.table.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      }, {
        id: one.id + '.' + 2, type: '', title: setting.dist.table.type.views.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      }, {
        id: one.id + '.' + 3, type: '', title: setting.dist.table.type.fn.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      }, {
        id: one.id + '.' + 4, type: '', title: setting.dist.table.type.event.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      }, {
        id: one.id + '.' + 5, type: '', title: setting.dist.table.type.query.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      }, {
        id: one.id + '.' + 6, type: '', title: setting.dist.table.type.backup.title,
        state: {linked: true, clicked: false, open: false}, children: [],
      },
    ]),
    /**
     * 获取链接
     * @param {String} id [选]链接id
     * @param {Number} index [选]链接数组的下标
     * @return {Readonly<ref<item>>|Readonly<ref<[linkArr]>>} item/Array 单个链接对象/链接对象数组
     */
    getLink: ({id = '', index = -1}={}) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>'+ 'getLink:params(id:'+id +',index:'+index +')');
      }
      if ('' !== id && !(id instanceof Number)) {
        throw new Error('Type Error');
      }
      if ('' !== id) {
        return _store.linkArr.filter((one) => {
          if (one.id === id) {
            return prepareLink({obj: one});
          }
        });
      }
      if (-1 !== index && _store.linkArr - 1 >= index) {
        return prepareLink({obj: _store.linkArr[index]});
      }
      return prepareLink({obj: _store.linkArr});
    },
    /**
     * 更改链接元素
     * @param {String} id [选]链接id
     * @param {Number} index [选]链接数组的下标
     * @param {Object} item [必]链接对象
     * @return {void} void
     */
    setLink: ({id = '', index = -1, item = Object}) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>'+ 'setLink:params(id:'+id +',index:'+index+',item:'+ item.toString() +')');
      }
      if (!item.hasOwnProperty('state')) {
        item['state'] = deepCopy(myStore.store.stateObj);
      } else {
        item['state'] = Object.assign(deepCopy(myStore.store.stateObj), item['state']);
      }
      if (!item.hasOwnProperty('connection')) {
        item['connection'] = {state: ''};
      } else {
        if (!item.connection.hasOwnProperty('state')) {
          item['connection']['state'] = '';
        }
      }
      if ('' !== id) {
        for (let i = 0; i < _store.linkArr.length; i++) {
          if (_store.linkArr[i].id === splitIndexStr(id, 0, '.')) {
            _store.linkArr[i] = item;
            return;
          }
        }
        _store.linkArr.push(item);
      }
      if (index >= 0 && (index - 1) <= _store.linkArr.length) {
        _store.linkArr[index] = item;
      }
    },
    setLinkState: ({id = '', stateItem = [''] || '', to = [false] || false}) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>'+ 'setLinkState:params(id:'+id +',stateItem:'+ stateItem +',to:'+ to +')');
      }
      if (stateItem instanceof Array ) {
        stateItem.filter((one) => {
          if (!myStore.store.stateObj.hasOwnProperty(one)) {
            throw new Error('Type Error');
          }
        });
      }
      if (stateItem instanceof String && !myStore.store.stateObj.hasOwnProperty(stateItem)) {
        throw new Error('Type Error');
      }
      _store.linkArr.filter((one) => {
        if (one.id === id) {
          if (stateItem instanceof Array) {
            for (let i = 0; i < stateItem.length; i++) {
              if (to instanceof Array) {
                one.state[stateItem[i]] = to[i];
              } else {
                one.state[stateItem[i]] = to;
              }
            }
          } else {
            one.state[stateItem] = to;
          }
        }
      });
    },
    /**
     * 重置当前会话链接列表
     * @return {void} void
     */
    resetLink: () => {
      _store.linkArr = [];
    },
    getConnection: ({id = '', pool = true}) => new Promise( (resolve, reject) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>' + 'getConnection:params(id:' + id + ',pool:' + pool + ')');
      }
      if (!(id instanceof String || Number)) {
        throw new Error('Type Error');
      }
      let linkItem = '';
      _store.linkArr.filter((one) => {
        if (one.id == (id + '.').split('.')[0]) {
          linkItem = one;
        }
      });
      if ('' === linkItem) {
        throw new Error('Type Error');
      }
      let linkData = deepCopy(linkItem.linkData);
      if (typeof id === 'string' && id.indexOf('.') !== -1) {
        let dbItem = _store.dbArr.filter((one) => {
          if (one.id === id) {
            return one;
          }
        });
        linkData.database = dbItem[0]?.dbData.name;
      }
      if (pool) {
        linkItem.pool = mysql.createPool(linkData);
        linkItem.pool.getConnection((err, connection) => {
          if (err) {
            reject(err);
          }
          // myStore.store.setLinkState({id: id, stateItem: 'linked', to: true});
          resolve(connection);
        });
      } else {
        resolve(mysql.createConnection(linkData));
      }
    }),
    closeLink: ({id=''}) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>' + 'closeLink:params(id:' + id + ')');
      }
      let linkItem = '';
      _store.linkArr.filter((one) => {
        if (one.id == (id + '.').split('.')[0]) {
          linkItem = one;
        }
      });
      if ('' === linkItem) {
        throw new Error('Type Error');
      }
      if (linkItem.pool) {
        linkItem.pool.end();
        linkItem.pool = '';
      }
      _store.dbArr = _store.dbArr.filter((one) => {
        if (id !== one.id.split('.')[0]) {
          return one;
        }
      });
    },
    getDb: ({id = ''}={}) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>' + 'getDb:params(id:' + id + ')');
      }
      if ('' !== id) {
        if ((id + '').indexOf('.')!==-1) {
          return _store.dbArr.filter((one) => {
            if (one.id === id) {
              return one;
            }
          }) || [];
        } else {
          return _store.dbArr.filter((one) => {
            if (id === splitIndexStr(one.id, 0, '.')) {
              return one;
            }
          }) || [];
        }
      }
      return _store.dbArr || [];
    },
    setDb: ({id = '', index = -1, item = Object}) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>'+ 'setDb:params(id:'+id +',index:'+index+',item:'+ item.toString() +')');
      }
      if (!item.hasOwnProperty('state')) {
        item['state'] = myStore.store.stateObj;
      } else {
        item['state'] = Object.assign(deepCopy(myStore.store.stateObj), item['state']);
      }
      if (!item.hasOwnProperty('children')) {
        item['children'] = myStore.store.dbChildrenObj(item);
      } else {
        item['children'] = Object.assign(deepCopy(myStore.store.dbChildrenObj(item)), item['children']);
      }
      if ('' !== id) {
        let deItem = '';
        for (let i = 0; i < _store.dbArr.length; i++) {
          if (_store.dbArr[i].id === splitIndexStr(id, 1, '.')) {
            _store.dbArr[i] = deItem;
            return;
          }
        }
        _store.dbArr.push(item);
      }
      if (index >= 0 && (index - 1) <= _store.dbArr.length) {
        _store.dbArr[index] = item;
      }
    },
    setDbState: ({id = '', stateItem = [''] || '', to = [false] || false}) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>'+ 'setDbState:params(id:'+id +',stateItem:'+ stateItem +',to:'+ to +')');
      }
      if (stateItem instanceof Array ) {
        stateItem.filter((one) => {
          if (!myStore.store.stateObj.hasOwnProperty(one)) {
            throw new Error('Type Error');
          }
        });
      }
      if (stateItem instanceof String && !myStore.store.stateObj.hasOwnProperty(stateItem)) {
        throw new Error('Type Error');
      }
      _store.dbArr.filter((one) => {
        if (one.id === id) {
          if (stateItem instanceof Array) {
            for (let i = 0; i < stateItem.length; i++) {
              if (to instanceof Array) {
                one.state[stateItem[i]] = to[i];
              } else {
                one.state[stateItem[i]] = to;
              }
            }
          } else {
            one.state[stateItem] = to;
          }
        }
      });
    },
    getTable: ({id = ''}) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>' + 'getDb:params(id:' + id + ')');
      }
      if ('' !== id) {
        if ((id + '').indexOf('.')!==-1) {
          return _store.tableArr.filter((one) => {
            if (one.id.substring(0, id.length) === id) {
              return one;
            }
          }) || [];
        } else {
          return _store.tableArr.filter((one) => {
            if (one.id.split('.')[0] == id) {
              return one;
            }
          }) || [];
        }
      }
      return _store.tableArr || [];
    },
    setTable: ({id = '', index = -1, item = Object}) => {
      if (myStore.debug) {
        console.log('debug', 'mysqlCore=>'+ 'setDb:setTable(id:'+id +',index:'+index+',item:'+ item.toString() +')');
      }
      if (!item.hasOwnProperty('state')) {
        item['state'] = myStore.store.stateObj;
      } else {
        item['state'] = Object.assign(deepCopy(myStore.store.stateObj), item['state']);
      }
      if ('' !== id) {
        for (let i = 0; i < _store.tableArr.length; i++) {
          if (_store.tableArr[i].id === splitIndexStr(id, 2, '.')) {
            _store.tableArr[i] = item;
            return;
          }
        }
        _store.tableArr.push(item);
      }
      if (index >= 0 && (index - 1) <= _store.tableArr.length) {
        _store.tableArr[index] = item;
      }
    },
  },
};
const deepCopy= (obj) => JSON.parse(JSON.stringify(obj));
const prepareLink = ({obj}) => {
  let child;
  if (obj instanceof Array) {
    return obj.map((one) => {
      child = myStore.store.getDb({id: one.id});
      if (child && child.length > 0) {
        one.children = prepareDb({obj: child});
      }
      return one;
    });
  } else {
    child = myStore.store.getDb({id: obj.id});
    if (child && child.length > 0) {
      obj.children = prepareDb({obj: child});
    }
    return obj;
  }
};
const prepareDb = ({obj}) => {
  let child;
  if (obj instanceof Array) {
    return obj.map((one) => {
      child = myStore.store.getTable({id: one.id});
      if (child && child.length > 0) {
        one.children[0].children = child;
      }
      return one;
    });
  } else {
    child = myStore.store.getTable({id: obj.id});
    if (child && child.length > 0) {
      obj.children = child;
    }
    return obj;
  }
};
const cleanUpData = (obj) => {
  let cleanUp = (d) => {
    let resD = {};
    for (let dKey in d) {
      if ('id,type,title,state,'.indexOf(dKey)!==-1) {
        resD[dKey] = d[dKey];
      }
    }
    return deepCopy(resD);
  };
  if (obj instanceof Array) {
    return obj.map((one) => cleanUp(one));
  } else {
    return cleanUp(obj);
  }
};

const splitIndexStr = (val, index, str) => {
  let arr = val?.split(str) || '';
  let strIndex = '';
  for (let i = 0; i < arr.length; i++) {
    if (i <= index) {
      strIndex += arr[i] + str;
    }
  }
  return strIndex.substring(0, strIndex.length - 1);
};

export let mysqlCore = myStore.store;

export default {
  install: (app) => {
    app.config.globalProperties.$store = myStore.store;
  },
};
