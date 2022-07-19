import setting from '@src/config'

const { token_name } = setting

const getAccessStorage = () => {
  return localStorage.getItem(token_name) || ''
}

const setAccessStorage = token => {
  return localStorage.setItem(token_name, token)
}

const removeAccessStorage = () => {
  return localStorage.removeItem(token_name)
}

export { getAccessStorage, setAccessStorage, removeAccessStorage }
