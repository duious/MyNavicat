<template>
  <div class="newQuery">
    <div class="head-div">
      <component class="menu-item link-div" :list="linkArr.linkArr" @clickLinkItem="clickLinkItem"
                 v-if="''!==linkArr.component" :is="linkArr.component"></component>
      <component class="menu-item link-div" :list="dbArr.dbArr" @clickLinkItem="clickLinkItem"
                 v-if="''!==dbArr.component" :is="dbArr.component"></component>
      <div class="menu-item" @click="clickRun" :class="dbArr.id !== '' ? !sqlData.running ? 'clickable' : '' : ''">
        <i v-show="dbArr.id !== '' ? !sqlData.running : false" v-html="queryData.icon.run['18']"></i>
        <i v-show="dbArr.id !== '' ? sqlData.running : true" v-html="queryData.icon.running['18']"></i>
      </div>
      <div class="menu-item" @click="stopRunSql" :class="sqlData.running?'clickable':''">
        <i v-show="sqlData.running" v-html="queryData.icon.stop['18']"></i>
        <i v-show="!sqlData.running" v-html="queryData.icon.stopped['18']"></i>
      </div>
      <div class="menu-item clickable" @click="stopRunSql"><i v-html="queryData.icon.explain['14']"></i></div>
      <div class="menu-item sql-run-time" v-show="sqlData.sumTime"
           :style="{'color': (500<sqlData.sumTime)?'#f00':'#8f0'}">{{sqlData.sumTime}}毫秒
      </div>
    </div>
    <div class="body-div">
      <div class="edit-div" ref="editTextarea"></div>
    </div>
    <div class="foot-div" v-if="''!==tab.component">
      <Resizer v-if="''!==tab.component" :type="'top'" :rank="[180]" style="width: 100%;">
        <component :tab="tab.tabData" v-if="''!==tab.component" :is="tab.component" @clickTabs="clickTabs"></component>
      </Resizer>
    </div>
  </div>
</template>
<script>
import * as monacoEditor from 'monaco-editor';
import {reactive, ref, onMounted} from 'vue';
import Selector from './Selector.vue';
import Tabs from './Tabs.vue';
import Resizer from './Resizer.vue';
import {mysqlCore} from '../mysql-core';
import {SQL_DEF, query} from '../util-mysql';
import setting from '../../setting.json';

export default {
  components: {'Selector': Selector, 'Tabs': Tabs, 'Resizer': Resizer},
  props: {},
  setup (props, context) {
    /**
     * 编辑器dom
     */
    const editTextarea = ref(null);
    /**
     * 编辑器实例
     */
    let monacoEditorInstance = ref(null);
    /**
     * 当前存储的链接集合
     */
    const linkArr = reactive({
      linkArr: [], id: '',
      component: '', // 组件Selector
    });
    /**
     * 活动链接的数据库集合
     */
    const dbArr = reactive({
      dbArr: [], id: '',
      component: '', // 组件Selector
    });
    /**
     * 当前组件 数据、图标
     */
    const queryData = reactive({
      icon: setting.icon.action,
    });
    /**
     * sql相关数据
     */
    const sqlData = reactive({
      // 查询执行中
      running: false,
      // 执行的目标文本
      val: '',
      // 编辑框 选中的文本
      selectVal: '',
      // 编辑框全部 文本
      allVal: '',
      connection: '',
    });
    /**
     * tabs组件数据
     */
    const tab = reactive({
      tabData: [
        {
          tabHead: {title: '结果', clicked: true, type: 'result'},
          tabBody: {
            slot: {component: '', tableData: {}},
          },
        },
        {
          tabHead: {title: '解释', clicked: false, type: 'explain'},
          tabBody: {
            slot: {component: '', tableData: {}},
          },
        },
      ],
      component: '',
    });
    /**
     * 初始化，获取原始数据
     */
    const initLinkArr = () => {
      linkArr.linkArr = JSON.parse(JSON.stringify(mysqlCore.getLink().map((one) => {
        // 过滤掉不需要的
        let {id, state, title, type} = one;
        return JSON.parse(JSON.stringify({id, state, title, type}));
      })));// 去反应
      linkArr.linkArr.filter((one) => {
        one.state.clicked = one.state.linked = false;
      });
      linkArr.component = 'Selector';
    };

    /**
     * 链接更改
     * @param {Object} item 选中的链接对象
     * @param {String} type selector可选列表类型
     */
    const clickLinkItem = (item, type) => {
      if (linkArr.id !== '') {
        (type === 'link' && linkArr.id !== item.id) ? linkArr.id = '' : '';
        type === 'db' ? dbArr.id = '' : '';
      } else {
        dbArr.id = '';
      }
      if (type === 'link' && linkArr.id !== item.id && item?.id?.indexOf('.') === -1) {
        mysqlCore.getConnection({id: item.id}).then((connection) => {
          query(connection, SQL_DEF.SCHEMA_NAME).then((res) => {
            let resItem = '';
            dbArr.dbArr = [];
            for (let i = 0; i < res.length; i++) {
              resItem = {
                'id': item.id + '.' + (i + 1),
                'type': 'db',
                'title': res[i]['SCHEMA_NAME'],
                'dbData': {
                  'name': res[i]['SCHEMA_NAME'],
                  'character': res[i]['DEFAULT_CHARACTER_SET_NAME'],
                  'collation': res[i]['DEFAULT_COLLATION_NAME'],
                },
                'state': {
                  'clicked': false,
                  'linked': false,
                  'open': false,
                },
              };
              dbArr.dbArr.push(resItem);
            }
            dbArr.dbArr = JSON.parse(JSON.stringify(dbArr.dbArr.map((one) => {
              // 过滤不需要的
              let {id, state, title, type} = one;
              return {id, state, title, type};
            })));// 去反应
            dbArr.component = 'Selector';
          });
        });
      }
      if (type === 'link') {
        linkArr.linkArr.find((one) => {
          // 标记选中的
          if (item?.id == one?.id) {
            one.state.clicked = true;
            linkArr.id = one.id;
          }
        });
      }
      if (type === 'link' && linkArr.id == undefined) {
        dbArr.component = '';
        dbArr.dbArr = [];
      }
      dbArr.dbArr.find((one) => {
        // 标记选中的
        if (item?.id == one?.id) {
          one.state.clicked = true;
          dbArr.id = one.id;
        }
      });
      linkArr.id ? '' : linkArr.id = dbArr.id = '';
      dbArr.id ? '' : dbArr.id = '';
    };
    onMounted(() => {
      // 初始化编辑器实例
      monacoEditorInstance = monacoEditor.editor.create(editTextarea.value, {
        value: 'select * from app_customerno_grade limit 0,100',
        language: 'sql',
        theme: 'vs-dark',
        autoIndex: true,
        tabSize: 2,
        // parameterHints: true,
        // acceptSuggestionOnCommitCharacter: false,
        // acceptSuggestionOnEnter: false,
        // accessibilityHelpUrl: false,
        // accessibilityPageSize: 0,
        // accessibilitySupport: false,
        // ariaLabel: false,
        // autoClosingBrackets: false,
        // autoClosingOvertype: false,
        // autoClosingQuotes: false,
        // autoIndent: false,
        // autoSurround: false,
        // automaticLayout: false,
        // codeActionsOnSaveTimeout: false,
        codeLens: false,
        // colorDecorators: false,
        // columnSelection: false,
        // comments: false,
        // contextmenu: false,
        // copyWithSyntaxHighlighting: false,
        // cursorBlinking: false,
        // cursorSmoothCaretAnimation: false,
        // cursorStyle: false,
        // cursorSurroundingLines: false,
        // cursorSurroundingLinesStyle: false,
        // cursorWidth: false,
        // definitionLinkOpensInPeek: false,
        // detectIndentation: false,
        // dimension: {width: editTextarea.value.width, height: editTextarea.value.height},
        // disableLayerHinting: true,
        // disableMonospaceOptimizations: false,
        // dragAndDrop: false,
        emptySelectionClipboard: false,
        // extraEditorClassName: false,
        // fastScrollSensitivity: false,
        // find: false,
        // fixedOverflowWidgets: false,
        // folding: false,
        // foldingHighlight: false,
        // foldingStrategy: false,
        // fontFamily: false,
        // fontLigatures: false,
        // fontSize: false,
        // fontWeight: false,
        // formatOnPaste: false,
        // formatOnType: false,
        // glyphMargin: false,
        // gotoLocation: false,
        // hideCursorInOverviewRuler: true,
        // highlightActiveIndentGuide: false,
        // hover: false,
        // inDiffEditor: false,
        // insertSpaces: false,
        // largeFileOptimizations: false,
        // letterSpacing: false,
        // lightbulb: false,
        // lineDecorationsWidth: false,
        // lineHeight: false,
        // lineNumbers: true,
        lineNumbersMinChars: 4,
        // links: false,
        // matchBrackets: false,
        // maxTokenizationLineLength: false,
        minimap: {
          enabled: false,
        },
        // model: false,
        // mouseStyle: false,
        // mouseWheelScrollSensitivity: false,
        // mouseWheelZoom: false,
        // multiCursorMergeOverlapping: false,
        // multiCursorModifier: false,
        // multiCursorPaste: false,
        // occurrencesHighlight: false,
        // overflowWidgetsDomNode: false,
        // overviewRulerBorder: false,
        // overviewRulerLanes: false,
        padding: {bottom: 0},
        // peekWidgetDefaultFocus: false,
        // quickSuggestions: false,
        // quickSuggestionsDelay: false,
        // readOnly: false,
        // renameOnType: false,
        // renderControlCharacters: false,
        // renderFinalNewline: false,
        // renderIndentGuides: false,
        // renderLineHighlight: false,
        // renderLineHighlightOnlyWhenFocus: false,
        // renderValidationDecorations: false,
        // renderWhitespace: false,
        // revealHorizontalRightPadding: false,
        // roundedSelection: false,
        rulers: ['#fff', 97],
        scrollBeyondLastColumn: 0,
        scrollBeyondLastLine: false,
        // scrollPredominantAxis: false,
        // scrollbar: false,
        selectOnLineNumbers: false,
        // selectionClipboard: false,
        // selectionHighlight: false,
        // // semanticHighlighting.enabled: false,
        showDeprecated: false,
        // showFoldingControls: false,
        // showUnused: false,
        smoothScrolling: true,
        // snippetSuggestions: false,
        // stablePeek: false,
        // stopRenderingLineAfter: false,
        // suggest: false,
        // suggestFontSize: false,
        // suggestLineHeight: false,
        // suggestOnTriggerCharacters: false,
        // suggestSelection: false,
        // tabCompletion: false,
        // tabIndex: false,
        // trimAutoWhitespace: false,
        // unfoldOnClickAfterEndOfLine: false,
        // unusualLineTerminators: false,
        // useTabStops: false,
        // wordBasedSuggestions: false,
        // wordSeparators: false,
        // wordWrap: false,
        // wordWrapBreakAfterCharacters: false,
        // wordWrapBreakBeforeCharacters: false,
        // wordWrapColumn: false,
        // wordWrapMinified: false,
        // wrappingIndent: false,
        // wrappingStrategy: false,
      });
      monacoEditorInstance.onKeyUp(getSelectVal);
      monacoEditorInstance.onMouseUp(getSelectVal);
    });
    /**
     * 获取编辑框 当前选择的 语句
     */
    const getSelectVal = () => {
      sqlData.allVal = monacoEditorInstance.getValue().replace(/\n/g, ' '); // 处理为一行
      sqlData.selectVal = '';
      let selectionObj = monacoEditorInstance.getSelection();
      // 截取选中区域sql语句
      if ((selectionObj.startLineNumber === selectionObj.endLineNumber &&
          selectionObj.startColumn !== selectionObj.endColumn) ||
          (selectionObj.startLineNumber !== selectionObj.endLineNumber)) {
        let selectValArr = monacoEditorInstance.getValue().split('\n');
        let beginLine = selectionObj.startLineNumber;
        let endLine = selectionObj.endLineNumber;
        let beginColumn = selectionObj.startColumn;
        let endColumn = selectionObj.endColumn;
        // 转换起始方向
        if (selectionObj.startLineNumber > selectionObj.endLineNumber) {
          beginLine = selectionObj.endLineNumber;
          endLine = selectionObj.startLineNumber;
          beginColumn = selectionObj.endColumn;
          endColumn = selectionObj.startColumn;
        }
        if (beginLine === endLine) {
          sqlData.selectVal = selectValArr[beginLine - 1].substring(beginColumn - 1, endColumn - 1);
        } else {
          // 多行截取
          while (beginLine < endLine) {
            sqlData.selectVal += ' ' + selectValArr[beginLine - 1].substring(beginColumn - 1);
            beginLine++;
          }
          sqlData.selectVal += ' ' + selectValArr[beginLine - 1].substring(0, endColumn - 1);
        }
      }
    };
    /**
     * 展示获取到的结果
     * @param {Array/String} res 结果
     */
    const showRes = (index, res) => {
      tab.component = '';
      tab.tabData[index].tabBody.slot.tableData = res;
      (index +1) === tab.tabData.length ? tab.component = 'Tabs' : tab.component = '';
    };
    /**
     * 本次sql执行均在此方法内
     */
    const getConnection = (linkId) => new Promise((resolve, reject) => {
      mysqlCore.getConnection({id: linkId}).then((connection) => {
        sqlData.running = true;
        sqlData.connection =connection;
        resolve(connection);
      });
    });
    /**
     * 初始化要执行的sql语句
     */
    const initSql = () => {
      getSelectVal();
      sqlData.val = sqlData.selectVal === '' ? sqlData.allVal : sqlData.selectVal;
      // 防止执行空sql语句
      if ('' === sqlData.val) {
        return;
      }
      // 清除多余空格
      sqlData.val = sqlData.val.replace(/\s+/ig, ' ');
      sqlData.val.substring(sqlData.val.length -1) === ';' ? '' : sqlData.val += ';';
    };

    let change =[[0, 0, 0], [0, 0, 0]];
    const setSqlSessionState = (index, res) => {
      change[index][0] = res.find((one) => {
        if (one['Variable_name'] == 'Com_set_option') {
          return one;
        }
      })['Value'];
      change[index][1] = res.find((one) => {
        if (one['Variable_name'] == 'Com_show_status') {
          return one;
        }
      })['Value'];
      change[index][2] = res.find((one) => {
        if (one['Variable_name'] == 'Com_select') {
          return one;
        }
      })['Value'];
    };

    const clickRun = () => {
      // 防止重复执行sql语句
      if (dbArr.id === '' || sqlData.running) {
        return;
      }
      sqlData.running = true;
      initSql();
      getConnection(dbArr.id).then((connection) => {
        query(connection, SQL_DEF.SET_PROFILING, [1]).then((res) => {
          query(connection, 'SHOW STATUS;', []).then((res) => {
            setSqlSessionState(0, res);
            query(connection, sqlData.val, []).then((res) => {
              showRes(0, res);
              query(connection, 'SHOW STATUS;', []).then((res) => {
                setSqlSessionState(1, res);
                query(connection, SQL_DEF.SQL_SUM_TIME, []).then((res) => {
                  sqlData.sumTime = (res[0]['SUM_DURATION'] * 1000 + '').replace(/([0-9]+.[0-9]{3})[0-9]*/, '$1');
                  query(connection, SQL_DEF.SQL_PERFORMANCE, [1]).then((res) => {
                    showRes(1, res);
                    sqlData.running = false;
                  });
                });
              });
            });
          });
        });
      });
    };
    /**
     * 点击停止执行sql语句
     */
    const stopRunSql = () => {
      if (sqlData.running) {
        sqlData.running = false;
      }
    };

    /**
     * 点击tab header按钮
     * @param {Object} item 点击的按钮
     * @param {Function} cb 回掉函数
     */
    const clickTabs = (item, cb) => {

    };

    initLinkArr();
    return {linkArr, dbArr, clickLinkItem, tab, editTextarea, queryData, sqlData, clickRun, stopRunSql, clickTabs,
    };
  },
};
</script>
<style scoped lang="scss">
  .newQuery {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #1d1d1d;
    overflow: hidden;

    .head-div, .body-div, .foot-div, .edit-div {
      display: flex;
    }

    .head-div {
      height: 16px;
      border-top: 1px solid #323232;
      border-bottom: 1px solid #4e4e4e;
      padding: 8px 14px;

      .menu-item {
        margin-right: 14px;
      }

      .sql-run-time{
        color: #fefefe;
        flex-grow: 1;
        text-align: end;
        font-size: 14px;
      }
      .clickable {
        &:active {
          opacity: .6;
        }
      }
    }

    .body-div {
      height: 100%;
      width: 100%;
      overflow-y: hidden;

      .edit-div {
        min-width: 100%;
        width: auto;
        min-height: 100%;
        height: auto;
        flex-direction: row;
        justify-content: space-between;
        flex: 1 1 auto;
        transition: .1s;
      }
    }

    .foot-div {
      position: relative;
      transition: .2s;
    }
  }
</style>
