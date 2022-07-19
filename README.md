# scm-component-vue

[vue3](https://v3.cn.vuejs.org/) + [antd-design-vue](https://www.antdv.com/docs/vue/introduce-cn) + [vxe-table](https://vxetable.cn/v4/#/table/start/install)

## install and use

- yarn

```yarn
yarn add scm-component-vue
```

- use

```yarn
import ScmComponent form 'scm-component-vue'

app.use(ScmComponent)
```

### Components

#### 基础组件

| 名称 | 描述 |
| --- | --- |
| XImage | 图片，默认支持单图&相册模式，XPreview预览功能 |
| XPreview | 预览，默认支持多图片预览功能 |
| XUpload | 上传，默认支持自定义请求、XPreview预览功能 |
| XModal | 对话框，默认支持loading、确定loading、拖拽、全屏功能 |
| XDrawer | 抽屉，默认支持loading、确定loading功能，拓展XModal默认功能 |
| XLayout | 布局，默认支持loading，统一布局风格 |
| XTabs | 标签页，默认支持loading，统一标签页风格 |
| XForm | 表单，默认支持可配置展示 |
| XSearch | 搜索栏，默认支撑配置页展示，搜索、重置、清空功能， |
| XPagination | 页码，默认支持默认分页、简单分页功能 |
| XPage | 页面，默认支持XSearch搜索、XPagination分页、自定义插槽功能 |
| XTable | 表格，默认支持可配置项展示，字段显示&隐藏、拖拽列宽、全屏功能 |
| XProTable | Pro表格，默认支持XSearch搜索、XPagination分页、XTable表格功能 |
| XGrid | 网格，默认支持可配置项展示，字段显示&隐藏、拖拽列宽、全屏功能 |
| XProGrid | Pro网格，默认支持XSearch搜索、XPagination分页、XGrid表格功能 |

#### 业务组件

| 名称 | 描述 |
| --- | --- |
| XBarcode | 条形码 |
| XQrcode | 二维码 |
| XPrint | 打印 |
| XImport | 导入 |
| XExport | 导出 |
| XLog | 日志 |
| XRemark | 备注 |
| XEcharts | 图表 |
| XEditor | 富文本 |
| XMaterials | 物料档案 |
| XVersions | 版型库 |
