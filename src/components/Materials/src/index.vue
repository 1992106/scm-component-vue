<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-materials__dialog"
    :title="title"
    :width="width"
    :height="height"
    :spinProps="spinning"
    destroyOnClose
    @ok="handleOk"
    @cancel="handleCancel">
    <div class="x-materials">
      <x-search ref="xSearch" v-bind="searchProps" @search="handleSearch" @reset="handleReset">
        <template #formItemRender="scope">
          <slot name="searchRender" v-bind="scope"></slot>
        </template>
      </x-search>
      <div class="material-list">
        <div class="title">全部</div>
        <MaterialList
          v-model:pagination="pages"
          v-model:selectedValue="selectedValue"
          :rowKey="rowKey"
          :selectedType="selectedType"
          :materialColumns="materialColumns"
          :materialList="materialList"
          :total="total"
          :emptyText="emptyText"
          @select="handleSelect"
          @select-all="handleSelectAll"
          @search="handleSearch">
          <template #bodyCell="scope">
            <slot name="materialRender" v-bind="scope"></slot>
          </template>
        </MaterialList>
      </div>
      <div class="selected-list">
        <div class="total">已选中{{ selectedList.length }}条</div>
        <SelectedList
          :rowKey="rowKey"
          :selectedColumns="selectedColumns"
          :selectedList="selectedList"
          :emptyText="emptyText"
          @del="handleDel">
          <template #bodyCell="scope">
            <slot name="selectedRender" v-bind="scope"></slot>
          </template>
        </SelectedList>
      </div>
    </div>
  </x-modal>
</template>
<script>
import { computed, defineComponent, nextTick, reactive, ref, toRefs, watch } from 'vue'
import { XModal, XSearch } from 'scm-ui-vue'
import MaterialList from './MaterialList.vue'
import SelectedList from './SelectedList.vue'
import { isFunction } from 'lodash-es'
import { getValueByRowKey } from '@components/utils'
import { execRequest, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XMaterials',
  components: {
    'x-modal': XModal,
    'x-search': XSearch,
    MaterialList,
    SelectedList
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '物料档案' },
    width: { type: [String, Number], default: '80%' },
    height: { type: [String, Number] },
    rowKey: { type: [String, Function], default: 'supplierMaterialId' },
    manual: { type: Boolean, default: false },
    searchProps: { type: Object, default: () => ({}) },
    materialColumns: { type: Array },
    selectedColumns: { type: Array },
    customRequest: { type: Function, require: true },
    selectedType: { type: String, default: 'checkbox' }, // 选择模式：checkbox 多选和 radio 单选
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'done', 'search', 'reset'],
  setup(props, { emit }) {
    const xSearch = ref(null)
    const modalVisible = computed({
      get: () => {
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const state = reactive({
      spinning: false,
      searchParams: {},
      pages: { page: 1, pageSize: 20 },
      total: 0,
      materialList: [],
      selectedValue: [],
      selectedList: []
    })

    const handleSearch = async params => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      // 分页搜索时参数为空
      if (params) {
        state.pages = { page: 1, pageSize: 20 }
        state.searchParams = params
      }
      state.spinning = true
      await execRequest(
        customRequest({
          ...(isEmpty(state.searchParams) ? {} : state.searchParams),
          ...state.pages
        }),
        {
          success: ({ data }) => {
            state.materialList = data?.data ?? data?.list ?? []
            state.total = data?.total || 0
            if (state.selectedList.length) {
              state.selectedValue = state.materialList.filter(item => {
                return state.selectedList.find(val => {
                  return getValueByRowKey(props.rowKey, item) === getValueByRowKey(props.rowKey, val)
                })
              })
            } else {
              state.selectedValue = []
            }
            emit('search', state.materialList)
          },
          fail: () => {
            state.materialList = []
            state.total = 0
          }
        }
      )
      state.spinning = false
    }

    const handleSelect = (record, selected) => {
      if (props.selectedType === 'checkbox') {
        handleCheckbox(record, selected)
      } else {
        handleRadio(record)
      }
    }

    const handleSelectAll = (selected, _, changeRows) => {
      if (props.selectedType === 'checkbox') {
        changeRows.forEach(item => {
          handleCheckbox(item, selected)
        })
      }
    }

    const handleCheckbox = (record, selected) => {
      // 选中
      if (selected) {
        const newItem = state.selectedList.find(val => {
          return getValueByRowKey(props.rowKey, record) === getValueByRowKey(props.rowKey, val)
        })
        if (!newItem) {
          state.selectedList.unshift(record)
        }
      } else {
        // 删除
        const index = state.selectedList.findIndex(val => {
          return getValueByRowKey(props.rowKey, record) === getValueByRowKey(props.rowKey, val)
        })
        if (index !== -1) {
          state.selectedList.splice(index, 1)
        }
      }
    }

    const handleRadio = record => {
      state.selectedList = [record]
    }

    watch(
      () => props.visible,
      visible => {
        if (visible && !props.manual) {
          nextTick(() => {
            xSearch.value?.onSearch()
          })
        }
      },
      { immediate: true }
    )

    const handleReset = () => {
      state.searchParams = {}
      state.pages = { page: 1, pageSize: 20 }
      emit('reset')
    }

    const handleDel = row => {
      const index1 = state.selectedValue.findIndex(val => {
        return getValueByRowKey(props.rowKey, row) === getValueByRowKey(props.rowKey, val)
      })
      if (index1 !== -1) {
        state.selectedValue.splice(index1, 1)
      }
      const index2 = state.selectedList.findIndex(val => {
        return getValueByRowKey(props.rowKey, row) === getValueByRowKey(props.rowKey, val)
      })
      state.selectedList.splice(index2, 1)
    }

    const handleOk = () => {
      emit('done', state.selectedList)
      modalVisible.value = false
      handleCancel()
    }

    const handleCancel = () => {
      handleReset()
      state.total = 0
      state.materialList = []
      state.selectedValue = []
      state.selectedList = []
    }

    return {
      xSearch,
      ...toRefs(state),
      modalVisible,
      handleSelect,
      handleSelectAll,
      handleSearch,
      handleReset,
      handleDel,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-materials {
  .x-search {
    padding-top: 0;
  }

  .material-list,
  .selected-list {
    display: flex;
    flex-direction: column;
    padding: 10px 16px 16px;
    border: 1px solid #c8c7cc;
    margin-top: 16px;

    .title,
    .total {
      margin-bottom: 6px;
    }
  }
}
</style>
<style lang="scss">
.x-materials__dialog {
  &.x-modal {
    top: 24px;
  }
}
</style>
