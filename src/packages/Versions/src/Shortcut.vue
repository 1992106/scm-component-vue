<template>
  <div class="shortcut-bar">
    <div class="title">更多搜索条件</div>
    <x-form ref="xForm" layout="vertical" v-bind="$attrs" :columns="getColumns">
      <template #formItemRender="scope">
        <slot name="formItemRender" v-bind="scope"></slot>
      </template>
    </x-form>
  </div>
</template>
<script>
import { computed, defineComponent, ref, unref } from 'vue'
import XForm from '@packages/components/Form/index.vue'
import { cleanDisabled } from '@packages/components/Search/utils'

export default defineComponent({
  name: 'Shortcut',
  components: {
    'x-form': XForm
  },
  inheritAttrs: false,
  setup(props, { attrs }) {
    const xForm = ref(null)

    // 搜索columns
    const getColumns = computed(() => {
      const columns = attrs?.columns || []
      return columns.map(column => cleanDisabled(column)) // disabled: true => false
    })

    const onGetFormValues = () => {
      return unref(xForm)?.onGetFormValues?.()
    }

    const onResetFields = () => {
      return unref(xForm)?.onReset?.()
    }

    return {
      xForm,
      getColumns,
      onGetFormValues,
      onResetFields
    }
  }
})
</script>
<style lang="scss" scoped>
.x-versions {
  .shortcut-bar {
    width: 320px;
    padding: 0 10px;
    border: 1px solid #c8c7cc;
    overflow-y: auto;

    .title {
      text-indent: 2px;
      line-height: 32px;
      border-bottom: 1px solid #c8c7cc;
      margin-bottom: 10px;
    }

    .x-form.ant-form-vertical {
      padding: 0 6px;

      :deep(.ant-form-item) {
        flex-wrap: nowrap;
        margin-bottom: 10px;

        .ant-form-item-label {
          padding-bottom: 0;
        }

        .ant-checkbox-group {
          width: 100%;

          .ant-checkbox-group-item {
            width: 33%;
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>
