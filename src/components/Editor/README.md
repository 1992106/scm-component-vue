# XEditor 富文本

## API

> [vue-quill](https://vueup.github.io/vue-quill/)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:content | 内容 | String | `-` |
| contentType | 内容类型，`("delta"、"html"、"text")` | String | `html` |
| theme | 主题色 | String | `snow` |
| toolbar | 工具栏配置项 | Array | `-` |
| enable | 启用 | Boolean | `true` |
| readOnly | 只读 | Boolean | `false` |
| placeholder | 占位符 | String | `请输入内容` |

### Example

```vue
<x-editor v-model:content="content"  ref="myEditor"></x-editor>

// 设置html
myEditor.value?.xEditor?.setHTML()
```
