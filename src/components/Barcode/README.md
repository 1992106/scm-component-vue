# XBarcode 条形码

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| code | 生成的条形码 | String | `-` |
| format | 条形码类型 | String | `CODE128` |
| width | 条之间的宽度 | Number | `2` |
| height | 高度 | Number | `40` |
| text | 条形码下面的文字，默认显示`code` | String | `-` |
| displayValue | 是否显示条形码下面的文字 | Boolean | `true` |

### Example

```vue
<x-barcode :code="code"></x-barcode>
```
