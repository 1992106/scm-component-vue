# XForm 表单

## API

> [Form](https://www.antdv.com/components/form-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 表单配置 | Array | `[]` |
| layout | 表单布局 | String | `inline` |
| labelCol | 标签布局 | Object | `{}` |
| wrapperCol | 控件布局 | Object | `{}` |
| gird | 是否栅格化布局 | Boolean | `false` |
| rowProps | `ARow props` | Object | `{}` |
| colProps | `ACol props` | Object | `{}` |

### Emits

```vue
emits: ['submit', 'reset']
```

### Slots

```vue
<slot name="formItemRender"></slot>
<slot name="actionRender"></slot>
```

### Methods

```vue
// 提交表单
onSubmit()

// 重置表单
onReset()

// 获取表单值
onGetFormValues()

// 设置表单字段和值
onSetFieldValue({ field: value })
```
