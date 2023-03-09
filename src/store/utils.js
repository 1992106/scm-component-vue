// 登陆
export const getLogin = async ({ account, password }) => {
  if (account === 'admin' && password === 'admin') {
    return {
      data: { token: `token-${Date.now()}`, user: { name: 'SCM COMPONENT', account, password, now: Date.now() } },
      status: 200
    }
  } else {
    throw new Error('账号密码')
  }
}
