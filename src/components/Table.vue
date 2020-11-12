<template>
  <div  ref="tableParentEl">
    <table class="table-div" ref="tableEl" :style="tableParentStyle"
           @keydown.down.stop="keyDownFn($event)" @keydown.up.stop="keyDownFn($event)"
           @keydown.ctrl.67="copyVal($event)" @keydown.tab.stop="keyDownFn($event)">
      <thead class="table-head" ref="tableHeadEl" :style="tableStyle">
      <tr class="table-head-div">
        <th class="table-head-item"><i class="vertical-line"></i></th>
        <Resizer class="table-head-item" :type="'right'" :rank="[15]" v-for="(item,index) in thead"
                 :style="resizeStyleArr[index]" :data-index="index" @styleChange="styleChange"
                 @click.stop="checkTd(item, index, $event)">
          <div class="table-head-item-title"> {{item.title}}</div>
          <i class="vertical-line"></i>
        </Resizer>
      </tr>
      </thead>
      <tbody class="table-body" ref="tableBodyEl" :style="tableStyle">
      <tr class="table-body-div" v-for="(item,index) in page.data"
          :class="(item[TABLE_TR_CHECKED_STATE] && item[TABLE_TR_CHECKED_STATE].length > 0) ? 'checked' : ''">
        <i class="checked-icon" v-show="(item[TABLE_TR_CHECKED_STATE] && item[TABLE_TR_CHECKED_STATE].length > 0)" v-html="page.icon.next['14']" ></i>
        <td class="table-body-item" v-for="(itemItem,itemIndex) in thead"
            :style="resizeStyleArr[itemIndex]"
            :class="(item[TABLE_TD_CHECKED_STATE] && item[TABLE_TD_CHECKED_STATE].indexOf(itemItem.val) > -1) ? 'checked' : ''">
          <!-- todo 封装 -->
          <input type="text"
                 :readonly="(item[TABLE_CELL_EDIT_STATE] && item[TABLE_CELL_EDIT_STATE] == itemItem.val) ? false : 'readonly'"
                 :tabindex="(index * 10 + itemIndex)"
                 :autofocus="(item[TABLE_CELL_EDIT_STATE] && item[TABLE_CELL_EDIT_STATE] == itemItem.val)"
                 :style="{width: parseInt(resizeStyleArr[itemIndex].width) - 14 + 'px',
                 textAlign: typeof item[itemItem.val] === 'number' ? 'right' : 'left'}"
                 :class="getClassName(item, index, itemIndex, itemItem.val)"
                 :value="item[itemItem.val]" @click.stop="checkTr(item, index, itemIndex, itemItem.val, $event)"
                 @keyup="tableCellChange($event.target.value)" @blur="tableCellBlur(this.value)"/>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div class="pages-div" >
    <div class="pages-item">
      <i class="pages-icon clickable" v-html="action.icon.add['14']"
         title="添加记录" @mousedown="pageChange('start')"></i>
      <i class="pages-icon clickable" v-html="action.icon.sub['14']"
         title="删除记录" @mousedown="pageChange('start')"></i>
      <i class="pages-icon clickable" :class="isValueChanged ? '' : 'clicked'" v-html="action.icon.right['14']"
         title="应用更改" @mousedown="commitChange"></i>
      <i class="pages-icon clickable" :class="isValueChanged ? '' : 'clicked'" v-html="action.icon.wrong['14']"
         title="放弃更改" @mousedown="cancelChange"></i>
      <i class="pages-icon clickable" v-html="action.icon.reload['14']"
         title="刷新" @mousedown="reloadData"></i>
    </div>
    <div class="pages-item">当前共计：{{page.total}} 条</div>
    <div class="pages-item">
      <i class="pages-icon clickable" v-show="!page.showPageSizes" v-html="page.icon.start['14']"
         title="首页" @mousedown="pageChange('start')"></i>
      <i class="pages-icon clickable" v-show="!page.showPageSizes" v-html="page.icon.next['14']"
         title="上一页" @mousedown="pageChange('prev')"></i>
      <input v-show="!page.showPageSizes" class="pages-input" type="number" readonly :value="page.currentPage"/>
      <i class="pages-icon clickable" v-show="!page.showPageSizes" v-html="page.icon.next['14']"
         title="下一页" @mousedown="pageChange('next')"></i>
      <i class="pages-icon clickable" v-show="!page.showPageSizes" v-html="page.icon.start['14']"
         title="尾页" @mousedown="pageChange('end')"></i>
      <div class="" v-show="page.showPageSizes">
        <input class="pages-input" type="number" :value="page.pageSize" @keyup="setPageSize"/>
        <span class="pages-title">&nbsp;条每页</span>
      </div>
      <i class="pages-icon clickable" v-html="page.icon.setting['14']"
         title="分页设置" @mousedown="pageChange('setting')"></i>
    </div>
  </div>
</template>
<script>
import {reactive, ref, onMounted, watch, toRefs} from 'vue';
import Resizer from './Resizer.vue';
import setting from '../../setting.json';

/**
 * table
 * @description @Components {@link table} 组件
 * @description @:tableArr {@link tableArr} props:tableArr={thead: [], tbody: []}
 * @description @@addTr {@link addTr} addTr(item, trIndex, tdIndex, key, val, cb()) 新增一行事件
 * @description @@subTr {@link subTr} subTr(item, trIndex, tdIndex, key, val, cb()) 删除一行事件
 * @description @@cellChange {@link cellChange} cellChange(item, trIndex, tdIndex, key, val, cb()) 单元格修改事件
 * @description @@reloadData {@link reloadData} reloadData(cb()) 重新载入数据
 */
export default {
  components: {'Resizer': Resizer},
  props: {
    tableArr: Object,
  },
  setup (props, context) {
    /**
     * @static 标示table选中行
     */
    const TABLE_TR_CHECKED_STATE = 'table_tr_checked';
    /**
     * @static 标示table选中列
     */
    const TABLE_TD_CHECKED_STATE = 'table_td_checked';
    /**
     * @static 标示table选中列
     */
    const TABLE_CELL_EDIT_STATE = 'table_cell_edited';
    /**
     * 表格数据 图标
     * @property {Array} thead 表头数据数组
     * @property {Array} tbody 表格数据数组
     * @property {Object} page 分页数据对象
     * @property {Object} action 分页区域使用的图标
     */
    let table = reactive({
      thead: props.tableArr.thead || [{title: '名称', val: 'Name'}],
      tbody: props.tableArr.tbody || [],
      /**
       * 分页对象
       * @property {Array} data 当前展示的数据数组
       * @property {Number} pageSize 每页展示的条数
       * @property {Number} total 数据总条数
       * @property {Number} pageCount 分页总页数
       * @property {Number} currentPage 当前页码
       * @property {Array} pageSizes 拟每页展示条数数组
       * @property {Boolean} showPageSizes 展示每页条数设置
       * @property {Object} icon 分页使用的图标
       */
      page: {
        data: [],
        pageSize: 100,
        total: 0,
        pageCount: '',
        currentPage: 1,
        pageSizes: [100, 150, 200, 300, 500],
        showPageSizes: false,
        icon: setting.icon.action.pages,
      },
      action: {
        icon: {
          add: setting.icon.action.add, sub: setting.icon.action.sub,
          right: setting.icon.action.right, wrong: setting.icon.action.wrong,
          reload: setting.icon.action.reload,
        },
      },
    });
    /**
     * 表格dom对象
     * @property {Element} tableEl table标签
     * @property {Element} tableHeadEl table>thead标签
     * @property {Element} tableBodyEl table>tbody标签
     * @property {Element} tableParentEl table父元素标签
     */
    const tableElData = {
      tableEl: ref(null), tableHeadEl: ref(null), tableBodyEl: ref(null), tableParentEl: ref(null),
    };
    /**
     * 表格样式响应式对象
     * @property {String} width 可用于展示的宽度px
     */
    let tableStyle = reactive({'width': ''});
    /**
     * 表格所在容器的样式响应式对象
     * @property {String} width 可用于展示的宽度px
     * @property {String} height 可用于展示的高度px
     */
    let tableParentStyle = reactive({'width': '', 'height': '', 'overflow': 'auto', 'display': 'flex'});
    /**
     * 表格内容宽度样式的响应式数组
     * @property {tableStyle} item 初始值为表头的对应元素的宽度
     */
    let resizeStyleArr = [];
    /**
     * 表格分页
     * @description 根据传入的表格数据进行初始化
     */
    const initCurrentPage = () => {
      table.page.total = table.tbody.length;
      table.page.pageCount = Math.ceil(table.page.total / table.page.pageSize);
      table.page.data = table.tbody.filter((one, index) => {
        if (index >= (table.page.currentPage - 1) * table.page.pageSize &&
            index < table.page.currentPage * table.page.pageSize) {
          return one;
        }
      });
    };
    /**
     * 初始化{@link resizeStyleArr}为表头对应元素的宽度数据
     */
    const initTheadResizeArr = () => {
      for (let i = 0; i < table.thead.length; i++) {
        (table.thead[i]?.width > 0) ? resizeStyleArr.push({width: table.thead[i]?.width + 'px'}) : resizeStyleArr.push({width: '60px'});
      }
      resizeStyleArr = reactive(resizeStyleArr);
    };
    /**
     * 表头元素宽度改变时事件
     * @param {String} style 改变后的样式
     * @param {Element} dom 操作的dom对象
     */
    const styleChange = (style, dom) => {
      resizeStyleArr[dom.getAttribute('data-index')] = style;
      tableStyle.width = tableElData.tableHeadEl.value.firstChild.clientWidth + 6 + 'px';
    };
    /**
     * 分页区域点击事件
     * @description 操作后更新分页数据
     * @example type可选start、prev、next、end、setting
     * @param {String} type 动作
     */
    const pageChange = (type) => {
      switch (type) {
        case 'start':
          table.page.currentPage = 1;
          break;
        case 'prev':
          table.page.currentPage > 1 ? table.page.currentPage-- : '';
          break;
        case 'next':
          table.page.currentPage < table.page.pageCount ? table.page.currentPage++ : '';
          break;
        case 'end':
          table.page.currentPage = table.page.pageCount > 0 ? table.page.pageCount : 1;
          break;
        case 'setting':
          // 清除选中
          // table.page.showPageSizes ? edit._clearCheckState() : '';
          if (table.page.showPageSizes) {
            initCurrentPage();
          }
          table.page.showPageSizes = !table.page.showPageSizes;
          break;
      }
    };
    /**
     * 设置每页展示的条数
     * @description 使用keyup事件
     * @param {keyupEvent} e 按键抬起事件
     */
    const setPageSize = (e) => {
      table.page.pageSize = e.target.valueAsNumber;
    };
    /**
     * 表格resize方法
     */
    const resizeTable = () => {
      tableParentDom = tableElData.tableParentEl.value.parentNode;
      tableParentStyle.width = tableParentDom.clientWidth + 'px';
      tableParentStyle.height = tableParentDom.clientHeight - 24 + 'px';
      tableStyle.width = Math.max(tableElData.tableHeadEl.value.firstChild.clientWidth + 6, tableParentDom.clientWidth) + 'px';
      // 视口
      tableViewArea[1] = [parseInt(tableElData.tableBodyEl.value.getBoundingClientRect().y), parseInt(tableElData.tableBodyEl.value.getBoundingClientRect().y + tableParentDom.clientHeight)];
    };
    /**
     * 分页数据自响应监听
     */
    watch(() => table.page.currentPage, () => {
      table.page.data = table.tbody.filter((one, index) => {
        if (index >= (table.page.currentPage - 1) * table.page.pageSize &&
            index <= table.page.currentPage * table.page.pageSize) {
          return one;
        }
      });
    });
    /**
     * 分页变化后清除选中
     */
    watch(() => table.page.data.length, () => {
      _clearCheckState();
    });
    /**
     * table容器视口区间
     * @example [[xStart, xEnd], [yStart, yEnd]]
     */
    let tableParentDom;
    onMounted(() => {
      window.onresize = () => {
        resizeTable();
      };
      resizeTable();
    });
    /**
     * @property 0 tr
     * @property 1 td
     * @private
     */
    const _lastCheckedCell= [0, 0];
    let _lastFocusItem = reactive({item: {}, trIndex: '', tdIndex: '', key: ''});
    /**
     * 清除选择状态
     * @param {String} type 需要清除的行/列 {@link TABLE_TR_CHECKED_STATE} or {@link TABLE_TD_CHECKED_STATE}
     * @param {clickEvent} event 点击事件
     * @private
     */
    const _clearCheckState= (type, event) => {
      table.page.data.filter((one) => {
        // 清理选中状态
        delete one[TABLE_CELL_EDIT_STATE];
        if (type === undefined) {
          delete one[TABLE_TR_CHECKED_STATE];
          delete one[TABLE_TD_CHECKED_STATE];
        } else {
          delete one[type];
        }
        // 键盘mate、shift键不为按下状态
        if (!event?.metaKey && !event?.shiftKey) {
          delete one[TABLE_TR_CHECKED_STATE];
          delete one[TABLE_TD_CHECKED_STATE];
        }
      });
      // 清理获取到光标的元素信息
      _lastFocusItem.item = '';
      _lastFocusItem.trIndex = '';
      _lastFocusItem.tdIndex = '';
      _lastFocusItem.key = '';
    };
    /**
     * 标记单元格为当前选择状态的相反状态
     * @param {String} type 需要标记的行/列 {@link TABLE_TR_CHECKED_STATE} or {@link TABLE_TD_CHECKED_STATE}
     * @param {Object} item 标记的目标数据
     * @param {String} key 标记的键名称
     * @private
     */
    const _checkCell= (type, item, key) => {
      // 标记选中状态
      if (!item.hasOwnProperty(type)) {
        item[type] = [];
      }
      if (item[type].indexOf(key) > -1) {
        item[type] = item[type].filter((one) => {
          if (one != key) {
            return one;
          }
        });
      } else {
        item[type].push(key);
      }
    };
    /**
     * 发送单元格内容修改事件
     * @description @emitFunction cellChange
     * @param {String} val 当前单元格的内容
     */
    const _cellChange = (val = '') => {
      if (val === '') {
        val = document.querySelector('.table-cell-' + _lastFocusItem.trIndex + '-' + _lastFocusItem.tdIndex).value;
      }
      // 值有更改，发送更改事件
      context.emit('cellChange', _lastFocusItem.item, _lastFocusItem.trIndex, _lastFocusItem.tdIndex, _lastFocusItem.key, val, (res) => {
        // 修改成功，更新原始数据
        // 起始下标
        let index = (table.page.currentPage - 1) * table.page.pageSize;
        // 分页数组的下标
        index += _lastFocusItem.trIndex;
        // 页面数据更新
        table.page.data[_lastFocusItem.trIndex][_lastFocusItem.key] = table.tbody[index][_lastFocusItem.key] = val;
        delete table.page.data[_lastFocusItem.trIndex][TABLE_CELL_EDIT_STATE];
        _lastFocusItem = reactive({item: {}, trIndex: '', tdIndex: '', key: ''});
      });
    };
    /**
     * 表格进行编辑操作时使用的对象
     */
    let edit = reactive({
      /**
       * 选择一行
       * @description alt/command 按下时多选
       * @param {Object} item 当前点击所在行的数据
       * @param {Number} trIndex 当前点击所在行的数据所在数组的下标
       * @param {Number} tdIndex 当前点击所在列的数据所在数组的下标
       * @param {String} key 当前点击所在单元格的数据的键名
       * @param {clickEvent} event 当前点击事件
       */
      checkTr: (item, trIndex, tdIndex, key, event) => {
        _clearCheckState(TABLE_TD_CHECKED_STATE, event);
        // 键盘shift键为按下状态
        if (event.shiftKey) {
          if (item.hasOwnProperty(TABLE_TR_CHECKED_STATE)) {
            item[TABLE_TR_CHECKED_STATE] = [];
          }
          table.page.data.filter((one, oneIndex) => {
            if (oneIndex >= Math.min(_lastCheckedCell[0], trIndex) &&
                oneIndex <= Math.max(_lastCheckedCell[0], trIndex)) {
              _checkCell(TABLE_TR_CHECKED_STATE, one, key);
            } else {
              delete one[TABLE_TR_CHECKED_STATE];
            }
          });
        } else {
          // 标记选中的单元格坐标
          _lastCheckedCell[0] = trIndex;
          _lastCheckedCell[1] = tdIndex;
          edit.isValueChanged = false;
          table.thead.filter((headOne, headIndex) => {
            headOne.val == key ? _lastCheckedCell[1] = headIndex : '';
          });
          _checkCell(TABLE_TR_CHECKED_STATE, item, key);
          item[TABLE_CELL_EDIT_STATE] = key;
          // 记录获取到光标的元素信息
          _lastFocusItem.item = JSON.parse(JSON.stringify(item));
          _lastFocusItem.trIndex = trIndex;
          _lastFocusItem.tdIndex = tdIndex;
          _lastFocusItem.key = key;
        }
      },
      /**
       * 选择一列
       * @description alt/command 按下时多选
       * @param {Object} item 当前点击所在列的header数据
       * @param {Number} index 当前点击所在列的header数据所在数组的下标
       * @param {clickEvent} event 当前点击事件
       */
      checkTd: (item, index, event) => {
        _clearCheckState(TABLE_TR_CHECKED_STATE, event);
        // 键盘shift键为按下状态
        if (event.shiftKey) {
          table.page.data.filter((one) => {
            if (one.hasOwnProperty(TABLE_TD_CHECKED_STATE)) {
              one[TABLE_TD_CHECKED_STATE] = [];
            }
          });
          table.thead.filter((headOne, headIndex) => {
            if (headIndex >= Math.min(_lastCheckedCell[1], index) &&
                headIndex <= Math.max(_lastCheckedCell[1], index)) {
              table.page.data.filter((one) => {
                _checkCell(TABLE_TD_CHECKED_STATE, one, headOne.val);
              });
            }
          });
        } else {
          _lastCheckedCell[1] = index;
          // 标记选中列
          table.page.data.filter((one) => {
            _checkCell(TABLE_TD_CHECKED_STATE, one, item.val);
          });
        }
      },
      getClassName: (item, trIndex, tdIndex, key) => {
        let className = '';
        className += 'table-cell-' + trIndex + '-' + tdIndex + ' ';
        className += (item[TABLE_CELL_EDIT_STATE] && item[TABLE_CELL_EDIT_STATE] == key) ? TABLE_CELL_EDIT_STATE : '';
        return className;
      },
      isValueChanged: false,
      tableCellChange: (val) => {
        edit.isValueChanged = val != _lastFocusItem.item[_lastFocusItem.key];
      },
      commitChange: () => {
        _cellChange();
      },
      cancelChange: () => {
        _lastFocusItem = reactive({item: {}, trIndex: '', tdIndex: '', key: ''});
        edit.isValueChanged = false;
        table.page.data.filter((one) => {
          // 清理选中状态
          delete one[TABLE_CELL_EDIT_STATE];
        });
      },
      tableCellBlur: (val) => {
        if (edit.isValueChanged && val != _lastFocusItem.item[_lastFocusItem.key]) {
          _cellChange(val);
        }
      },
      reloadData: () => {
        // 值有更改，发送更改事件
        context.emit('reloadData', (res) => {
          table.thead = res.thead;
          table.tbody = res.tbody;
          initCurrentPage();
        });
      },
      addTr: () => {

      },
      subTr: () => {

      },
    });
    /**
     * 更换获取光标的单元格为table-cell-${newTr}-${td}
     * @param {Number} oldTr 旧单元格trIndex
     * @param {Number} newTr 新单元格trIndex
     * @param {Number} td 新单元格tdIndex
     */
    const _changeCellFocus = (oldTr, newTr, td) => {
      let middle = table.page.data[oldTr][TABLE_TR_CHECKED_STATE];
      delete table.page.data[oldTr][TABLE_TR_CHECKED_STATE];
      table.page.data[newTr][TABLE_TR_CHECKED_STATE] = middle;
      middle = table.page.data[oldTr][TABLE_CELL_EDIT_STATE];
      delete table.page.data[oldTr][TABLE_CELL_EDIT_STATE];
      middle != table.thead[td].val ? middle = table.thead[td].val : '';
      table.page.data[newTr][TABLE_CELL_EDIT_STATE] = middle;
    };
    let tableViewArea = reactive([]);
    /**
     * 保持选中的元素在视口区域
     */
    const _resetFocusCellInViewArea = () => {
      let cellDom = document.getElementsByClassName('table-cell-'+_lastCheckedCell[0]+'-' +_lastCheckedCell[1])[0];
      let cellVIew = [parseInt(cellDom.getBoundingClientRect().x), parseInt(cellDom.getBoundingClientRect().y)];
      // 视口上方
      if (cellVIew[1] - tableViewArea[1][0] < 0) {
        cellDom.scrollIntoViewIfNeeded();
      }
      // 视口下方
      if (cellVIew[1] - tableViewArea[1][1] >= 0) {
        cellDom.scrollIntoViewIfNeeded();
      }
      let xDom = document.getElementsByClassName('table-cell-' + _lastCheckedCell[0] + '-' + 0)[0].parentNode.parentNode.parentNode.parentNode;
      tableViewArea[0] = [xDom.getBoundingClientRect().x, xDom.getBoundingClientRect().x + xDom.clientWidth];
      // 视口左方
      if (cellVIew[0] <= tableViewArea[0][0]) {
        cellDom.scrollIntoViewIfNeeded();
      }
      // 视口右方
      if (cellVIew[0] >= tableViewArea[0][1]) {
        cellDom.scrollIntoViewIfNeeded();
      }
    };
    /**
     * table按键按下事件处理
     * @description 包含：arrowdown、arrowup、tab、shift+tab
     * @param {clickEvent} event 按键按下事件
     */
    const keyDownFn = (event) => {
      event.preventDefault();
      switch (event?.key.toLowerCase()) {
        case 'arrowdown':
          if (table.page.data.length - 2 >= _lastCheckedCell[0]) {
            _changeCellFocus(_lastCheckedCell[0], _lastCheckedCell[0] + 1, _lastCheckedCell[1]);
            _lastCheckedCell[0] = _lastCheckedCell[0] + 1;
          }
          break;
        case 'arrowup':
          if (1 <= _lastCheckedCell[0]) {
            _changeCellFocus(_lastCheckedCell[0], _lastCheckedCell[0] - 1, _lastCheckedCell[1]);
            _lastCheckedCell[0] = _lastCheckedCell[0] - 1;
          }
          break;
        case 'tab':
          _lastCheckedCell[1] = event.shiftKey ? _lastCheckedCell[1] - 1 : _lastCheckedCell[1] + 1;
          _lastCheckedCell[1] > 0 ? '' : _lastCheckedCell[1] = 0;
          _lastCheckedCell[1] >= table.thead.length ? _lastCheckedCell[1] = table.thead.length - 1 : '';
          _changeCellFocus(_lastCheckedCell[0], _lastCheckedCell[0], _lastCheckedCell[1]);
          break;
        default:

          break;
      }
      _resetFocusCellInViewArea();
    };

    const copyVal = (event) => {
      console.error(event);
    };

    initTheadResizeArr();
    initCurrentPage();

    return {
      TABLE_TR_CHECKED_STATE, TABLE_TD_CHECKED_STATE, TABLE_CELL_EDIT_STATE,
      ...table, ...toRefs(edit), keyDownFn, copyVal,
      ...tableElData, tableStyle, styleChange, tableParentStyle, resizeStyleArr,
      pageChange, setPageSize,
    };
  },
};
</script>
<style scoped lang="scss">
  .table-div {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex: 1 0 auto;
    color: #fefefe;
    font-size: 11px;
    line-height: 2;
    font-family: 'Meslo LG M for Powerline, Noto Sans Mono CJK SC', monospace !important;

    .table-head, .table-head-div, .table-head-item, .table-body, .scroll-bar, .table-body-div, .table-body-item {
      display: flex;
    }

    .table-head {
      height: 23px;
      background-color: #323232;
      border-top: 1px solid #696969;
      border-bottom: 1px solid #696969;
      flex-direction: row;
      flex: 0 0 auto;
      width: auto;
      z-index: 1;
      position: sticky;
      top: 0;

      .table-head-div {
        .table-head-item {
          min-width: 2px;
          margin: 4px 0 4px 0;
          line-height: 1.5;
          position: relative;
          justify-content: space-between;

          &:first-child {
            width: 20px;
            min-width: 20px;

            .resize {
              cursor: default;
            }
          }

          .table-head-item-title {
            margin-right: 18px;
            height: 100%;
            line-height: 1.3;
            overflow: hidden;
            text-align: left;
          }

          .vertical-line {
            display: inline-block;
            position: absolute;
            right: 0;
            width: 1px;
            margin: 0 2px 0 4px;
            height: 100%;
            background-color: #696969;
          }
        }
      }
    }

    .table-body {
      flex-direction: column;
      justify-content: flex-start;
      width: auto;
      flex: 1 0 auto;

      .table-body-div {
        position: relative;
        height: 20px;
        padding-left: 20px;
        line-height: 1.8;
        flex-direction: row;
        justify-content: flex-start;
        overflow: hidden;
        background-color: #1e1e1e;

        .checked-icon {
          position: absolute;
          left: 2px;
          top: 3px;
        }

        &:nth-child(3n) {
          background-color: #060606;
          box-shadow: -20px 0px #060606;
        }

        .table-body-item {
          position: relative;
          height: 18px;
          min-width: 2px;
          margin: 0 0 0 0;
          justify-content: flex-start;
          overflow: hidden;

          input {
            background-color: transparent;
            color: #fefefe;
            outline: none;
            border: none;
            cursor: default;
            width: auto;
            transition: .5s;

            &.table_cell_edited{
              background-color: #1e1e1e;
              border: 2px solid #357ed8;
            }

          }

          &::before {
            content: ' ';
            position: absolute;
            right: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background-color: #1e1e1e;
          }

          &.checked {
            background-color: #0840c5;

            .table-body-item::before {
              background-color: #0840c5;
            }
          }
        }

        &:nth-child(3n) .table-body-item::before {
          background-color: #060606;
        }

        &.checked {
          background-color: #0840c5;

          .table-body-item::before {
            background-color: #0840c5;
          }
        }
      }
    }

  }

  .pages-div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-top: 1px solid #5c5c5c;

    .pages-item {
      display: flex;
      width: auto;
      height: 23px;
      padding: 0 8px;
      min-width: 200px;
      justify-content: center;
      color: #eee;
      font-size: 16px;

      .pages-icon {
        margin-top: 2px;
        height: 20px;
        display: inline-block;
        padding-left: 4px;
      }

      &:first-child {
        justify-content: flex-start;

        .pages-icon {
          padding-left: 6px;
        }

        .pages-icon:nth-child(2n) {
          padding-right: 10px;
        }
      }

      &:nth-child(2) {
        font-size: 12px;
        line-height: 1.8;
      }

      &:last-child {
        justify-content: flex-end;

        .pages-input {
          background-color: transparent;
          outline: none;
          color: #eee;
          border: 1px solid #696969;
          height: 12px;
          width: 28px;
          font-size: 12px;
          text-align: center;
          margin-top: 4px;
        }

        .pages-title {
          height: 20px;
          line-height: 24px;
          font-size: 12px;
          color: #eee;
        }

        .pages-icon {
          margin-top: 2px;
          height: 20px;
          display: inline-block;
          padding-left: 4px;

          &:nth-child(2), &:nth-child(5) {
            transform: rotate(180deg);
          }
        }
      }

      .clickable {
        &:active {
          opacity: .6;
        }
      }

      .clicked {
        opacity: .6;
      }
    }
  }
</style>
