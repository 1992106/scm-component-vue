# XEcharts 图表

## API

> [ECharts](https://echarts.apache.org/handbook/zh/get-started/)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 图表的配置项 | Object | `-` |
| components | 图表的内置组件 | Array | `[BarChart, LineChart, PieChart, ScatterChart]` |
| width | 宽度 | Number | `-` |
| height | 高度 | Number | `-` |
| theme | 主题色 | String | `-` |

### Example

```vue
<x-echarts ref="myChart" :options="options"></x-echarts>

// 监听echarts事件
myChart.value.xEcharts.on('click', function (params) {
  console.log(params)
})
```
