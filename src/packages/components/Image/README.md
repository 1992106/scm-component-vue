# XImage 图片

## API

> [Image](https://www.antdv.com/components/image-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| thumbnail | 缩略图`src` | String | `''` |
| urls | 图片`src`集合 | Array | `[]` |
| width | 宽度 | Number | `-` |
| height | 高度 | Number | `-` |
| preview | 是否支持预览 | Boolean | `true` |
| quality | 图片质量 | Number | `1` |

### Emits

```vue
emits: []
```

### Example

```vue
<x-image :thumbnail="thumbnail" :urls="previewUrls"></x-image>
```
