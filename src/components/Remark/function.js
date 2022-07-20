import XRemark from './index.vue'
import { produce } from '@src/plugins/produce'

export const createXRemark = (options, fn) => {
  produce(XRemark, { visible: true, onDone: fn }, options)
}
