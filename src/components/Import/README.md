# XImport 导入

## Components

> XModal

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `导入数据` |
| width | 宽度 | [String, Number] | `520` |
| customImport | 自定义导入 | Function | `-` |
| customDownload | 自定义下载 | Function | `-` |
| limit | 限制导入数量 | Number | `500` |
| extra | 提示文案 | String | `-` |

### Emits

```vue
emits: ['update:visible', 'done']
```

### Example

```vue
<x-import v-model:visible="visible" :customImport="customImport" :customDownload="customDownload" @done="handleDone"></x-import>

<x-import v-model:visible="visible" :customImport="customImport" @done="handleDone">
  <a-button @click="handleDownload"></a-button>
</x-import>

// 使用函数方法
createXImport({ customImport: customImport, customDownload: customDownload }, () => {
  // 执行done事件
})
```
