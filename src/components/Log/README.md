# XLog 日志

## Components

> XDrawer

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `操作日志` |
| width | 宽度 | [String, Number] | `360` |
| customRequest | 自定义请求 | Function | `-` |
| showPagination | 是否显示分页 | Boolean | `true` |
| pageSize | 页码 | Number | `10` |
| emptyText | 空数据显示的内容 | String | `暂无数据` |

### Emits

```vue
emits: ['update:visible', 'update:pagination', 'done']
```

### Example

```vue
<x-log v-model:visible="visible" :customRequest="customRequest" @done="handleDone"></x-log>

// 使用函数方法
createXLog({ customRequest: customRequest }, () => {
  // 执行done事件
})
```
