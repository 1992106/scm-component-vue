<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-versions__dialog"
    :title="title"
    :width="width"
    :height="height"
    :spinProps="spinning"
    destroyOnClose
    @ok="handleOk"
    @cancel="handleCancel">
    <div class="x-versions">
      <x-search ref="xSearch" v-bind="searchProps" @search="handleSearch" @reset="handleReset">
        <template #formItemRender="scope">
          <slot name="searchRender" v-bind="scope"></slot>
        </template>
      </x-search>
      <div class="content">
        <Shortcut ref="xShortcut" v-bind="shortcutProps">
          <template #formItemRender="scope">
            <slot name="shortcutRender" v-bind="scope"></slot>
          </template>
        </Shortcut>
        <VersionList
          v-model:pagination="pages"
          :rowKey="rowKey"
          :versionList="versionList"
          :rowProps="rowProps"
          :colProps="colProps"
          :total="total"
          :emptyText="emptyText"
          @search="handleSearch"
          @add="handleAdd"
          @del="handleDel">
          <template #itemRender="scope">
            <slot name="itemRender" v-bind="scope"></slot>
          </template>
        </VersionList>
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
<script lang="ts">
import { computed, defineComponent, nextTick, reactive, ref, toRefs, watch } from 'vue'
import XModal from '@packages/components/Modal'
import XSearch from '@packages/components/Search/index.vue'
import Shortcut from './Shortcut.vue'
import VersionList from './VersionList.vue'
import SelectedList from './SelectedList.vue'
import { isFunction, cloneDeep } from 'lodash-es'
import { getValueByRowKey } from '@packages/components/Table/utils'
import { execRequest, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XVersions',
  components: {
    'x-modal': XModal,
    'x-search': XSearch,
    Shortcut,
    VersionList,
    SelectedList
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '版型库' },
    width: { type: [String, Number], default: '80%' },
    height: { type: [String, Number] },
    rowKey: { type: [String, Function], default: 'id' },
    manual: { type: Boolean, default: false },
    searchProps: { type: Object, default: () => ({}) },
    shortcutProps: { type: Object, default: () => ({}) },
    selectedColumns: { type: Array },
    customRequest: { type: Function, require: true },
    rowProps: { type: Object, default: () => ({ gutter: 24, wrap: true }) },
    colProps: { type: Object, default: () => ({ span: 6 }) },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'done', 'search', 'reset'],
  setup(props, { emit }) {
    const xSearch = ref(null)
    const xShortcut = ref(null)
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
      cloneList: [],
      versionList: [],
      selectedList: []
    })

    const handleSearch = async params => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      // 分页时参数为空
      if (params) {
        state.searchParams = params
      }
      state.spinning = true
      const shortcutParams = xShortcut.value?.onGetFormValues?.()
      await execRequest(
        customRequest({
          ...(isEmpty(state.searchParams) ? {} : state.searchParams),
          ...(isEmpty(shortcutParams) ? {} : shortcutParams),
          ...state.pages
        }),
        {
          success: ({ data }) => {
            const list = data?.data ?? data?.list ?? []
            state.cloneList = cloneDeep(list) // 备份数据
            if (state.selectedList.length) {
              state.versionList = (list || []).map(item => {
                const newItem = state.selectedList.find(val => {
                  return getValueByRowKey(props.rowKey, item) === getValueByRowKey(props.rowKey, val)
                })
                return {
                  ...item,
                  ...(!isEmpty(newItem) ? newItem : {})
                }
              })
            } else {
              state.versionList = list
            }
            state.total = data?.total || 0
            emit('search', state.versionList)
          },
          fail: () => {
            state.cloneList = []
            state.versionList = []
            state.total = 0
          }
        }
      )
      state.spinning = false
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
      xShortcut.value?.onResetFields?.()
      state.pages = { page: 1, pageSize: 20 }
      emit('reset')
    }

    const handleAdd = row => {
      state.selectedList = [...state.selectedList, row]
    }

    const handleDel = row => {
      const newItem = state.cloneList.find(val => {
        return getValueByRowKey(props.rowKey, row) === getValueByRowKey(props.rowKey, val)
      })
      state.versionList = state.versionList.map(item => {
        return {
          ...item,
          ...(!isEmpty(newItem) && getValueByRowKey(props.rowKey, newItem) === getValueByRowKey(props.rowKey, item)
            ? newItem
            : {})
        }
      })
      const index = state.selectedList.findIndex(val => {
        return getValueByRowKey(props.rowKey, row) === getValueByRowKey(props.rowKey, val)
      })
      state.selectedList.splice(index, 1)
    }

    const handleOk = () => {
      emit('done', state.selectedList)
      modalVisible.value = false
      handleCancel()
    }

    const handleCancel = () => {
      handleReset()
      state.total = 0
      state.cloneList = []
      state.versionList = []
      state.selectedList = []
    }

    return {
      xSearch,
      xShortcut,
      ...toRefs(state),
      modalVisible,
      handleSearch,
      handleReset,
      handleAdd,
      handleDel,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-versions {
  .x-search {
    padding-top: 0;
  }

  .content {
    display: flex;
    flex: 1;
    padding: 16px 0;
    max-height: 640px;
  }

  .selected-list {
    display: flex;
    flex-direction: column;
    padding: 10px 16px 16px;
    border: 1px solid #c8c7cc;

    .total {
      margin-bottom: 6px;
    }
  }
}
</style>
<style lang="scss">
.x-versions__dialog {
  &.x-modal {
    top: 24px;
  }
}
</style>
