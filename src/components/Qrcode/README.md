# XQrcode 二维码

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| code | 生成的二维码 | String | `-` |
| width | 宽度 | Number | `120` |
| height | 高度 | Number | `120` |
| correctLevel | 级别 | String | `L` |
| colorDark | 颜色 | String | `#000` |
| colorLight | 颜色 | String | `#fff` |

### Example

```vue
<x-qrcode :code="code"></x-qrcode>
```
