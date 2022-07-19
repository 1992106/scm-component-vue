# XPagination 页码

## API

> [Pagination](https://www.antdv.com/components/pagination-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| showPagination | 是否显示分页 | Boolean | `true` |
| v-model:pagination | 当前页数和每页条数 | Object | `{ page: 1, pageSize: 20 }` |
| paginationConfig | 分页配置项 | Object | `{ size: 'default', defaultPageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `共 ${total} 条`, pageSizeOptions: ['20', '40', '60', '80', '100'] }` |
| total | 数据总数 | Number | `0` |

### Emits

```vue
emits: ['update:pagination', 'change', 'showSizeChange']
```

### Slots

```vue
<slot name="itemRender"></slot>
```
