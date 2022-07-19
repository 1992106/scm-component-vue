import { createVNode, render } from 'vue'

export const produce = (component, defaultProps, options) => {
  const props = {}
  Object.assign(props, defaultProps, options)
  const instance = createVNode(component, props)

  const container = document.createDocumentFragment()
  render(instance, container)
  document.body.appendChild(container)

  return instance
}
