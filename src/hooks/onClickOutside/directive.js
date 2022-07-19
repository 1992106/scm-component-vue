import { onClickOutside } from '.'

const handler = () => {
  let stop = null
  return (el, binding) => {
    if (stop) {
      stop()
      stop = onClickOutside(el, binding.value)
      return
    }
    stop = onClickOutside(el, binding.value)
  }
}

export const vOnClickOutside = handler()
