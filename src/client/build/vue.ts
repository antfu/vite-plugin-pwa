import { ref } from 'vue'
import { RegisterSWOptions } from '../type'
import { registerSW } from './register'

export type { RegisterSWOptions }

export function useRegisterSW(options: RegisterSWOptions = {}) {
  const {
    auto = false,
    immediate = true,
    onNeedRefresh,
    onOfflineReady,
  } = options

  const needRefresh = ref(false)
  const offlineReady = ref(false)

  const updateServiceWorker = registerSW({
    auto,
    immediate,
    onNeedRefresh() {
      if (auto) {
        // noinspection JSIgnoredPromiseFromCall
        updateServiceWorker()
      }
      else {
        needRefresh.value = true
        onNeedRefresh?.()
      }
    },
    onOfflineReady() {
      offlineReady.value = true
      onOfflineReady?.()
    },
  })

  return {
    updateServiceWorker,
    offlineReady,
    needRefresh,
  }
}
