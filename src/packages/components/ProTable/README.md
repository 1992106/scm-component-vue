# XProTable 表格

## API

> [Form](https://www.antdv.com/components/form-cn) + [Table](https://www.antdv.com/components/table-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:value | 搜索参数，包含分页、排序和筛选参数 | Object | `-` |
| searchProps | `XSearch props` | Object | `{}` |
| tableProps | `XTable props` | Object | `{}` |

#### searchProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 搜索栏配置 | Array | `[]` |
| layout | 表单布局 | String | `inline` |
| labelCol | 标签布局 | Object | `{ span: 9 }` |
| wrapperCol | 控件布局 | Object | `{ span: 15 }` |
| rowProps | `ARow props` | Object | `{ gutter: 24 }` |
| colProps | `ACol props` | Object | `{ span: 6 }` |
| resetSearch | 重置时是否触发搜索 | Boolean | `true` |
| clearSearch | 清空时是否触发搜索 | Boolean | `false` |
| showSearch | 是否显示搜索按钮 | Boolean | `true` |
| searchText | 搜索按钮文字 | Boolean | `搜索` |
| showReset | 是否显示重置按钮 | Boolean | `true` |
| resetText | 重置按钮文字 | Boolean | `重置` |
| showExpand | 是否显示【展开/收起】按钮 | Boolean | `true` |
| defaultExpand | 默认收起 | Boolean | `false` |

#### tableProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| rowKey | 表格行 `key` 的取值，可以是字符串或一个函数 | [String, Function] | `key` |
| columns | 表格列配置 | Array | `[]` |
| dataSource | 表格数据 | Array | `[]` |
| loading | 表格 `loading` | Boolean | `false` |
| total | 数据总数 | Number | `0` |
| transformCellText | 单元格自定义显示，一般用于空数据默认显示 | Function | `--` |
| showPagination | 是否显示分页 | Boolean | `true` |
| v-model:pagination | 当前页数和每页条数 | Object | `{ page: 1, pageSize: 20 }` |
| paginationConfig | 分页配置项 | Object | `{ size: 'default', defaultPageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `共 ${total} 条`, pageSizeOptions: ['20', '40', '60', '80', '100'] }` |
| extraHeight | 额外高度 | Number | `12` |
| autoResize | 自动计算高度 | Boolean | `true` |
| tableLayout | 格元素的 `table-layout` 属性，设为 `fixed` 表示内容不会影响列的布局 | String | `fixed` |
| scroll | 表格是否可滚动，也可以指定滚动区域的宽、高 | Object | `{ x: 100%, scrollToFirstRowOnChange: true }` |
| rowSelection | 列表项是否可选择 | Object | `{ type: 'checkbox', fixed: true, columnWidth: 50 }` |
| v-model:selectedValue | 勾选的行数据 | Array | `[]` |
| locale | 默认文案设置，目前包括排序、过滤、空数据文案 | Object | `{ filterConfirm: '筛选', filterReset: '重置', emptyText: '暂无数据' }` |

### Emits

```vue
emits: ['update:value', 'search', 'reset', 'clear']
```

### Slots

```vue
<slot name="top"></slot>
<slot name="bottom"></slot>
<slot name="toolBar"></slot>

// XTable插槽
<slot name="headerCell"></slot>
<slot name="bodyCell"></slot>
<slot name="customFilterDropdown"></slot>
<slot name="customFilterIcon"></slot>
<slot name="expandedRowRender"></slot>
<slot name="expandIcon"></slot>
<slot name="summary"></slot>
<slot name="title"></slot>
<slot name="footer"></slot>
<slot name="emptyText"></slot>
```
