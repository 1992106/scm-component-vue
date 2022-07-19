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
  formData.append('file', option.file)
  await execRequest(fn(formData, { $msg: 'none', $errorMsg: 'none' }), {
    success: ({ data, msg } = {}) => {
      Modal.success({
        title: '导入成功',
        content: data === 0 ? '未导入任何数据' : data > 0 ? `成功导入${data}条数据` : msg,
        onOk: () => ok(data)
      })
    },
    fail: err => {
      Modal.error({
        title: '导入失败',
        content: (
          <div>
            <p>{err?.msg}</p>
            {err?.data && <a onClick={() => download(err?.data || err?.data?.url)}>下载失败文件</a>}
          </div>
        )
      })
    }
  })
}
