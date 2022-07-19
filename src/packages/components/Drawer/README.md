# XDrawer 抽屉

## API

> [Drawer](https://www.antdv.com/components/drawer-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| manual | 手动隐藏 | Boolean | `false` |
| spinProps | `ASpin` 加载中 `props` | [Boolean, Object] | `false` |
| confirmLoading | 确定按钮 `loading` | Boolean | `false` |
| okType | `ok` 按钮类型 | String | `primary` |
| okText | `ok` 按钮文字 | String | `确定` |
| okButtonProps | `ok` 按钮 props | Object | `-` |
| cancelText | `cancel` 按钮文字 | String | `取消` |
| cancelButtonProps | `cancel` 按钮 props | Object | `-` |

### Emits

```vue
emits: ['update:visible', 'cancel', 'ok']
```

### Slots

```vue
<slot name="title"></slot>
<slot name="footer"></slot>
<slot></slot>
```
