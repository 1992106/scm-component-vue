import XLog from './index.vue'
import { produce } from '@src/plugins/produce'

export const createXLog = (options, fn) => {
  produce(XLog, { visible: true, onDone: fn }, options)
}
