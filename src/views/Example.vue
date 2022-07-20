<template>
  <div>
    <a-space>
      <a-button @click="handleVersions">版型库</a-button>
      <a-button @click="handleMaterials">物料档案</a-button>
      <a-button @click="handleBatchTraceability">批量导入溯源包</a-button>
    </a-space>
    <Versions v-bind="versionsState" v-model:visible="versionsState.visible" @done="doneVersions">
      <template #searchItemRender="{ record, column }">
        <template v-if="column.field === 'scope'">
          <a-space>
            <a-input-number v-model:value="record.min"></a-input-number>
            ~
            <a-input-number v-model:value="record.max"></a-input-number>
          </a-space>
        </template>
      </template>
      <template #itemRender="{ record, index, change }">
        <div class="box">
          <a-checkbox v-model:checked="record.checked" @change="change($event.target.checked, record)">
            {{ index }}
          </a-checkbox>
          <x-image width="100%" :urls="record?.urls"></x-image>
          <div class="info">
            <p class="line">
              <span>BX2022001</span>
              <span>类型：版型</span>
            </p>
            <p>分类：亲子装/情侣装/连体衣</p>
            <p class="line">
              <span>角色：妈妈</span>
              <span>面料类型：针织</span>
            </p>
          </div>
        </div>
      </template>
    </Versions>
    <Materials v-bind="materialsState" v-model:visible="materialsState.visible" @done="doneMaterials">
      <template #searchItemRender="{ record, column }">
        <template v-if="column.field === 'scope'">
          <a-space>
            <a-input-number v-model:value="record.min"></a-input-number>
            ~
            <a-input-number v-model:value="record.max"></a-input-number>
          </a-space>
        </template>
      </template>
    </Materials>
    <BatchImportTraceability
      v-model:visible="traceabilityState.batchVisible"
      @done="doneTraceability"></BatchImportTraceability>
    <EditTraceability v-model:visible="traceabilityState.editVisible" @done="doneTraceability"></EditTraceability>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onActivated, onMounted, onUnmounted, reactive } from 'vue'
import Versions from '@components/Versions'
import Materials from '@components/Materials'
import { XBatchImportTraceability, XEditTraceability } from '@components/Traceability'
export default defineComponent({
  name: 'Example',
  components: {
    Versions,
    Materials,
    BatchImportTraceability: XBatchImportTraceability,
    EditTraceability: XEditTraceability
  },
  setup() {
    const state = reactive({
      options: []
    })
    // 版型库
    const versionsState = reactive({
      visible: false,
      searchProps: {
        columns: [
          {
            type: 'AInput',
            title: '版型名称',
            field: 'a',
            props: {
              placeholder: '请输入'
            }
          },
          {
            type: 'AInput',
            title: '版型编号',
            field: 'b',
            props: {
              placeholder: '请输入'
            }
          },
          {
            type: 'ASelect',
            title: '版型分类',
            field: 'c',
            props: {
              placeholder: '请选择',
              defaultValue: 3,
              options: computed(() => state.options)
            }
          },
          {
            type: 'AInput',
            title: '转款式设计款号',
            field: 'd',
            props: {
              placeholder: '请输入'
            }
          },
          {
            type: 'ASelect',
            title: '角色',
            field: 'e',
            props: {
              placeholder: '请选择'
            }
          },
          {
            title: '成本范围',
            field: 'scope',
            children: [{ field: 'min' }, { field: 'max' }]
          }
        ]
      },
      shortcutProps: {
        columns: [
          {
            type: 'ACheckboxGroup',
            title: '收藏',
            field: 'z',
            props: {
              options: [{ label: '我的收藏', value: 'z' }]
            }
          },
          {
            type: 'ACheckboxGroup',
            title: '类型',
            field: 'x',
            props: {
              options: [
                { label: '版型', value: 'x' },
                { label: '款式', value: 'y' }
              ]
            }
          }
        ]
      },
      rowKey: 'id',
      customRequest: async params => {
        console.log(params, '版型参数')
        const list = []
        const total = 30
        for (let i = 0; i < total; i++) {
          list.push({ id: i, checked: false })
        }
        return [null, { list, total }]
      }
    })
    const handleVersions = () => {
      versionsState.visible = !versionsState.visible
    }
    const doneVersions = data => {
      console.log(data, '版型库')
    }
    // 物料档案
    const materialsState = reactive({
      visible: false,
      searchProps: {
        columns: [
          {
            type: 'ASelect',
            title: '物料分类',
            field: 'a',
            props: {
              placeholder: '请选择'
            }
          },
          {
            type: 'AInput',
            title: '物料sku',
            field: 'b',
            props: {
              placeholder: '请输入'
            }
          },
          {
            type: 'AInput',
            title: '物料名称',
            field: 'c',
            props: {
              placeholder: '请输入'
            }
          },
          {
            type: 'AInput',
            title: '供应商',
            field: 'd',
            props: {
              placeholder: '请输入'
            }
          },
          {
            type: 'AInput',
            title: '供应商物料编号',
            field: 'e',
            props: {
              placeholder: '请输入'
            }
          },
          {
            title: '成本范围',
            field: 'scope',
            children: [{ field: 'min' }, { field: 'max' }]
          }
        ]
      },
      rowKey: record => record?.id,
      customRequest: async params => {
        console.log(params, '物料参数')
        const list = []
        const total = 30
        for (let i = 0; i < total; i++) {
          list.push({ id: i })
        }
        return [null, { list, total }]
      }
    })
    const handleMaterials = () => {
      materialsState.visible = !materialsState.visible
    }
    const doneMaterials = data => {
      console.log(data, '物料档案')
    }

    // 溯源包
    const traceabilityState = reactive({
      batchVisible: false,
      editVisible: false
    })
    const handleBatchTraceability = () => {
      traceabilityState.batchVisible = !traceabilityState.batchVisible
    }
    const handleEditTraceability = () => {
      traceabilityState.editVisible = !traceabilityState.editVisible
    }
    const doneTraceability = data => {
      console.log(data, '溯源包')
    }

    onMounted(() => {
      console.log('onMounted', 'Example组件')
      setTimeout(() => {
        state.options = [
          { label: 'a', value: 1 },
          { label: 'b', value: 2 },
          { label: 'c', value: 3 },
          { label: 'd', value: 4 },
          { label: 'e', value: 5 }
        ]
      }, 5000)
    })
    onActivated(() => {
      console.log('onActivated', 'Example组件')
    })
    onUnmounted(() => {
      console.log('onUnmounted', 'Example组件')
    })
    return {
      versionsState,
      handleVersions,
      doneVersions,
      materialsState,
      handleMaterials,
      doneMaterials,
      traceabilityState,
      handleBatchTraceability,
      handleEditTraceability,
      doneTraceability
    }
  }
})
</script>
<style lang="scss" scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .info {
    width: 100%;
    margin-top: 10px;

    .line {
      display: flex;
      justify-content: space-between;
    }
  }

  .ant-checkbox-wrapper {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
  }
}
</style>
