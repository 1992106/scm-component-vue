import XRemark from './index.vue'
import { useComponent } from 'scm-ui-vue'

export const createXRemark = (options, fn) => {
  const produce = useComponent(XRemark)
  return produce({ ...options, ...(fn ? { onDone: fn } : {}) })
}
