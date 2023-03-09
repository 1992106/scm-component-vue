const setting = {
  // 标题
  title: 'SCM Component',

  //  请求名称
  api_name: 'scm-api',

  // 请求路径
  api_url: '',

  // 请求超时
  request_timeout: 10000,

  // 请求时headers内存放token的名字
  authorization_name: 'Authorization',

  // 本地储存token的名字
  token_name: 'scm-component',

  // token前缀,设置为null则不启用 { headers: { Authorization: 'Bearer ${token}'}}
  token_prefix: 'Bearer',

  // 本地储存token的地方 localStorage || cookie
  token_storage: 'localStorage',

  // 本地储存user的名称
  user_name: 'scm-user',

  // 是否开启keep-alive
  keep_alive: true,

  // 顶部进度条
  header_progress: true,

  // iconfont字体URL
  iconfont_url: '//at.alicdn.com/t/font_2581533_emz4fahmxs.js'
}

export default setting
