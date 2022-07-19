import { getAccessStorage, removeAccessStorage, setAccessStorage, isEmpty } from '@src/utils'
import setting from '@src/config'

// 本地存储用户信息
const localUserInfo = getAccessStorage(setting.user_name)

const user = {
  state: {
    userInfo: localUserInfo ? JSON.parse(localUserInfo) : {},
    visible: false
  },
  getters: {
    userInfo: state => state.userInfo,
    visible: state => state.visible
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    setVisible(state, visible) {
      state.visible = visible
    }
  },
  actions: {
    async login({ commit }, { account, password }) {
      const res = await { account, password }
      const { token = '', user = {} } = res?.data || {}
      if (isEmpty(token) || isEmpty(user)) {
        return {}
      }
      commit('setUserInfo', user)
      setAccessStorage(setting.token_name, token)
      setAccessStorage(setting.user_name, JSON.stringify(user))
      return res?.data
    },
    logout({ commit }) {
      commit('setUserInfo', {})
      commit('router/reset', null, { root: true })
      removeAccessStorage(setting.token_name)
      removeAccessStorage(setting.user_name)
    }
  }
}

export default user
