# XPrint 打印

## Components

> XQrcode
> 
> XBarcode

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| showButton | 是否显示按钮 | Boolean | `true` |
| buttonText | 按钮文字 | Boolean | `打印` |
| buttonProps | 按钮 `props` | Object | `-` |
| qrcodeProps | 二维码 `props` | Object | `-` |
| barcodeProps | 条形码 `props` | Object | `-` |
| title | 打印标题 | String | `''` |
| delay | 延迟时间 | Number | `1000` |
| onBefore | 打印前的回调 | Function | `-` |

### Emits

```vue
emits: ['done']
```

### Slots

```vue
<slot name="icon"></slot>
<slot></slot>
```

### Methods

```vue
// 打印
onPrint()
```

### Example

```vue
<x-print
  :onBefore="onBefore"
  buttonText="打印"
  :buttonProps="{ type: 'primary', loading: true }">
</x-print>
```
