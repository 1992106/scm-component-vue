import XLog from './index.vue'
import { useComponent } from 'scm-ui-vue'

export const createXLog = (options, fn) => {
  const produce = useComponent(XLog)
  return produce({ ...options, ...(fn ? { onDone: fn } : {}) })
}
