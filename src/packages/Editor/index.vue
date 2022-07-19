<template>
  <div class="x-editor">
    <QuillEditor
      ref="xEditor"
      v-bind="$attrs"
      :content-type="contentType"
      :theme="theme"
      :toolbar="toolbar"
      :enable="enable"
      :readOnly="readOnly"
      :placeholder="placeholder"></QuillEditor>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

export default defineComponent({
  name: 'XEditor',
  components: {
    QuillEditor
  },
  inheritAttrs: false,
  props: {
    contentType: { type: String, default: 'html' },
    theme: { type: String, default: 'snow' },
    toolbar: {
      type: Array,
      default: () => [
        [{ header: 1 }, { header: 2 }, { size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', { color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        ['clean']
      ]
    },
    enable: { type: Boolean, default: true },
    readOnly: { type: Boolean, default: false },
    placeholder: { type: String, default: '请输入内容' }
  },
  setup: () => {
    const xEditor = ref(null)

    return {
      xEditor
    }
  }
})
</script>
<style lang="scss" scoped>
.x-editor {
  :deep(.ql-container) {
    height: 320px;
  }

  :deep(.ql-snow) {
    .ql-tooltip[data-mode='link']::before {
      content: '链接';
    }

    .ql-tooltip.ql-editing a.ql-action::after {
      content: '保存';
    }
  }
}
</style>
