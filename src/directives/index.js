import setupDebounceDirective from './debounce'
import setupThrottleDirective from './throttle'
import setupClickOutsideDirective from './clickOutside'

export function setupDirectives(app) {
  setupDebounceDirective(app)
  setupThrottleDirective(app)
  setupClickOutsideDirective(app)
  return app
}
