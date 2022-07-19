# XSearch 搜索栏

## API

> [Form](https://www.antdv.com/components/form-cn)

### Props

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
emits: ['search', 'reset', 'clear']
```

### Slots

```vue
<slot name="top"></slot>
<slot name="bottom"></slot>
<slot name="formItemRender"></slot>
```

### Methods

```vue
// 搜索
onSearch()

// 重置
onReset()

// 获取搜索参数
onGetFormValues()

// 设置搜索字段和值
onSetFieldValue({ field: value })
```
