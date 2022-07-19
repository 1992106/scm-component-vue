/**
 * v-click-outside 点击目标元素以外事件绑定指令
 * @param app
 */
const setupClickOutsideDirective = app => {
  app.directive('clickOutside', {
    // 初始化指令
    bind(el, { value: fn, arg, expression }) {
      function clickHandler(e) {
        // 判断点击的元素是否是本身，如果是本身则返回
        if (el.contains(e.target)) {
          return false
        }
        // 判断指令中是否绑定了函数
        if (expression) {
          return arg ? fn(e, arg) : fn(e)
        }
      }
      // 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
      el.__vueClickOutside__ = clickHandler
      document.addEventListener('click', clickHandler)
    },
    unbind(el) {
      // 解除事件监听
      document.removeEventListener('click', el.__vueClickOutside__)
      delete el.__vueClickOutside__
    }
  })
}

export default setupClickOutsideDirective
