import XPreview from './index.vue'
import { produce } from '@src/plugins/produce'

export const createXPreview = options => {
  produce(XPreview, { visible: true }, options)
}
