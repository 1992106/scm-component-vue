import { isRef, unref, ref } from 'vue'

export function useToggle(initialValue = false, options = {}) {
  const { truthyValue = true, falsyValue = false } = options

  const valueIsRef = isRef(initialValue)
  const innerValue = ref(initialValue)

  function toggle(value) {
    // has arguments
    if (arguments.length) {
      innerValue.value = value
      return innerValue.value
    } else {
      innerValue.value = innerValue.value === unref(truthyValue) ? unref(falsyValue) : unref(truthyValue)
      return innerValue.value
    }
  }

  if (valueIsRef) {
    return toggle
  } else {
    return [innerValue, toggle]
  }
}
