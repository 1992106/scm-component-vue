<template>
  <div class="x-versions__list">
    <template v-if="versionList.length">
      <div class="scroll">
        <a-row v-bind="rowProps">
          <a-col v-for="(item, index) in versionList" :key="getValueByRowKey(rowKey, item, index)" v-bind="colProps">
            <slot name="itemRender" :record="item" :index="index" :onChange="handleChange"></slot>
          </a-col>
        </a-row>
      </div>
      <!--分页-->
      <x-pagination v-model:pagination="pages" :total="total" />
    </template>
    <div v-else class="empty">
      <a-empty :image="simpleImage" :description="emptyText" />
    </div>
  </div>
</template>
<script>
import { defineComponent, computed } from 'vue'
import { Empty } from 'ant-design-vue'
import { XPagination } from 'scm-ui-vue'
import { getValueByRowKey } from '@components/utils'

export default defineComponent({
  name: 'VersionList',
  components: {
    'x-pagination': XPagination
  },
  props: {
    rowKey: [String, Function],
    versionList: { type: Array, default: () => [] },
    rowProps: Object,
    colProps: Object,
    total: Number,
    pagination: Object,
    emptyText: String
  },
  emits: ['update:pagination', 'search', 'add', 'del'],
  setup(props, { emit }) {
    const pages = computed({
      get: () => {
        return props.pagination
      },
      set: val => {
        emit('update:pagination', val)
        emit('search')
      }
    })

    const handleChange = (bool, row) => {
      if (bool) {
        emit('add', row)
      } else {
        emit('del', row)
      }
    }

    return {
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      pages,
      handleChange,
      getValueByRowKey
    }
  }
})
</script>
<style lang="scss" scoped>
.x-versions {
  &__list {
    display: flex;
    flex-direction: column;
    flex: 1;
    border: 1px solid #c8c7cc;
    margin-left: 16px;
    min-height: 360px;

    .scroll {
      flex: 1;
      padding: 20px 20px 0;
      overflow-y: auto;
    }

    .empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ant-pagination {
      padding: 10px 20px;
    }
  }
}
</style>
