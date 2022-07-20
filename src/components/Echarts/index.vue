<template>
  <div ref="elEcharts" class="x-echarts"></div>
</template>
<script>
import { defineComponent, markRaw, onActivated, onMounted, onUnmounted, ref, watch } from 'vue'
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import { getInstanceByDom, init, use } from 'echarts/core'
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent
} from 'echarts/components'
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features'
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers'
// 引入图表组件
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'

export default defineComponent({
  name: 'XEcharts',
  inheritAttrs: false,
  props: {
    options: { type: Object, default: () => ({}) },
    components: { type: Array, default: () => [BarChart, LineChart, PieChart, ScatterChart] },
    width: { type: Number },
    height: { type: Number },
    theme: { type: String }
  },
  setup(props) {
    const elEcharts = ref(null)
    // 图表实例
    const xEcharts = ref(null)

    // 注册必须的组件
    use([
      TitleComponent,
      TooltipComponent,
      GridComponent,
      DatasetComponent,
      TransformComponent,
      LegendComponent,
      LabelLayout,
      UniversalTransition,
      CanvasRenderer,
      // 图表组件
      ...markRaw(props.components)
    ])

    const initEcharts = () => {
      const instance = getInstanceByDom(elEcharts.value)
      if (instance) {
        xEcharts.value = instance
      } else {
        const opts = {
          width: props.width,
          height: props.height
        }
        xEcharts.value = markRaw(init(elEcharts.value, props.theme || null, opts))
        xEcharts.value?.setOption(props.options)
      }
    }

    watch(
      () => props.options,
      () => {
        initEcharts()
      },
      { deep: true }
    )

    const handleResize = () => {
      xEcharts.value?.resize()
    }

    onActivated(() => {
      handleResize()
    })

    onMounted(() => {
      initEcharts()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      xEcharts.value?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return {
      elEcharts,
      xEcharts
    }
  }
})
</script>
