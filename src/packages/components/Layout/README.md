# XLayout 布局

## API

> [Layout](https://www.antdv.com/components/layout-cn)
> [Menu](https://www.antdv.com/components/menu-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:value | 选中菜单 | [String, Number] | `-` |
| list | 菜单列表 | Array | `[]` |
| menuProps | `AMenu props` | Object | `{}` |
| spinProps | `ASpin` 加载中 `props` | [Boolean, Object] | `false` |

### Emits

```vue
emits: ['update:value', 'click']
```

### Slots

```vue
<slot></slot>
```
