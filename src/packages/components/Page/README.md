# XPage 页面

## API

> [Form](https://www.antdv.com/components/form-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:value | 搜索参数，包含分页、排序和筛选参数 | Object | `-` |
| searchProps | `XSearch props` | Object | `{}` |
| rowKey | key 的取值，可以是字符串或一个函数 | [String, Function] | `-` |
| dataSource | 表格数据 | Array | `[]` |
| loading | `ASpin` 加载中 `props` | [Boolean, Object] | `false` |
| emptyText | 空数据显示的内容 | String | `暂无数据` |
| autoResize | 自动计算高度 | Boolean | `true` |
| showPagination | 是否显示分页 | Boolean | `true` |
| total | 数据总数 | Number | `0` |
| v-model:pagination | 当前页数和每页条数 | Object | `{ page: 1, pageSize: 20 }` |
| paginationConfig | 分页配置项 | Object | `-` |

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

### Emits

```vue
emits: ['update:value', 'search', 'reset', 'clear']
```

### Slots

```vue
<slot name="top"></slot>
<slot name="bottom"></slot>
<slot name="formItemRender"></slot>
<slot name="toolBar"></slot>

<slot></slot>
<slot name="itemRender"></slot>
```
