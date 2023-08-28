import XImport from './index.vue'
import { useComponent } from 'scm-ui-vue'

export const createXImport = (options, fn) => {
  const produce = useComponent(XImport)
  return produce({ ...options, ...(fn ? { onSuccess: fn } : {}) })
}
