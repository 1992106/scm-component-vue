# XGrid 网格

## API

> [vxe-grid](https://vxetable.cn/v4/#/grid/api)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 表格列配置 | Array | `[]` |
| data | 表格数据 | Array | `[]` |
| loading | 表格 `loading` | Boolean | `false` |
| emptyText | 空数据显示的内容 | String | `暂无数据` |
| showPagination | 是否显示分页 | Boolean | `true` |
| total | 数据总数 | Number | `0` |
| v-model:pagination | 当前页数和每页条数 | Object | `{ page: 1, pageSize: 20 }` |
| paginationConfig | 分页配置项 | Object | `-` |
| height | 表格高度 | [Number, String] | `-` |
| autoResize | 表格高度 | Boolean | `false` |
| rowConfig | 行配置项 | Object | `{ isHover: true, isCurrent: true }` |
| columnConfig | 列配置项 | Object | `{ resizable: true }` |
| seqConfig | 序号配置项 | Object | `-` |
| radioConfig | 单选框配置项 | Object | `{ highlight: true }` |
| checkboxConfig | 复选框配置项 | Object | `{ highlight: true }` |
| v-model:selectedValue | 勾选的行数据 | Array | `[]` |
| mergeCells | 自定义缩放 | Array | `-` |
| footerMethod | 自定义缩放 | Function | `-` |
| customZoom | 自定义缩放 | Boolean | `false` |
| customSetting | 自定义设置 | Boolean | `false` |
| storageName | 本地`Storage`名称，拖拽列和自定义表头时本地储存 | String | `-` |

### Emits

```vue
emits: [
'search',
'update:pagination',
'update:selected-value',
'radio-change',
'checkbox-change',
'checkbox-all',
'cell-click',
'edit-closed',
'valid-error',
'filter-change',
'filter-visible',
'clear-filter',
'sort-change',
'clear-sort',
'toggle-row-expand',
'toggle-tree-expand'
]
```

### Slots

```vue
<slot name="searchBar"></slot>
<slot name="toolBar"></slot>

// XGrid插槽
<slot name="default"></slot>
<slot name="header"></slot>
<slot name="footer"></slot>
<slot name="edit"></slot>
<slot name="filter"></slot>
<slot name="title"></slot>
<slot name="checkbox"></slot>
<slot name="radio"></slot>
<slot name="content"></slot>
<slot name="emptyText"></slot>
```
