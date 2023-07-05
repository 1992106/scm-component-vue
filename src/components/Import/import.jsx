import { Modal } from 'ant-design-vue'
import { download, execRequest } from '@src/utils'

/**
 * 导入文件
 * @param fn
 * @param option
 * @param ok
 * @returns {Promise<void>}
 */
export const importFile = async (fn, option = {}, ok) => {
  const formData = new FormData()
  Object.keys(option).forEach(key => {
    formData.append(key, option[key])
  })
  await execRequest(fn(formData, { $msg: 'none', $errorMsg: 'none' }), {
    success: ({ data, msg } = {}) => {
      Modal.success({
        title: '导入成功',
        content: data === 0 ? '未导入任何数据' : data > 0 ? `成功导入${data}条数据` : msg,
        onOk: () => ok(data)
      })
    },
    fail: ({ data, msg } = {}) => {
      Modal.error({
        title: '导入失败',
        content: (
          <div>
            <p>{msg || '请删除文件，再重新上传'}</p>
            {data && <a onClick={() => download(data || data?.url)}>下载失败文件</a>}
          </div>
        )
      })
    }
  })
}
