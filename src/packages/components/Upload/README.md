# XUpload 上传

## API

> [Upload](https://www.antdv.com/components/upload-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:fileList | 已经上传的文件列表 | Array | `[]` |
| customRequest | 自定义上传 | Function | `-` |
| listType | 上传列表的内建样式，支持三种基本样式 `("text"、"picture"、"picture-card")` | String | `picture-card` |
| showUploadList | 自定义上传 | [Boolean, Object] | `-` |
| beforeUpload | 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传 | Function | `-` |
| mode | 上传/预览模式`("upload"、"preview")` | String | `upload` |
| accept | 上传文件格式`("image/*"、"application/*"、"audio/*"、"video/*")` | String | `-` |
| size | 上传文件大小，单位`M` | Number | `-` |
| maxCount | 上传文件数量 | Number | `-` |

### Emits

```vue
emits: ['update:file-list', 'change', 'preview', 'download']
```

### Slots

```vue
<slot name="itemRender"></slot>
```

### Example

```vue
<x-upload v-model:fileList="fileList"></x-upload>
```
