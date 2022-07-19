import XImport from './index.vue'
import { produce } from '@src/plugins/produce'

export const createXImport = (options, fn) => {
  produce(XImport, { visible: true, onDone: fn }, options)
}
