export const FILE_MANIFEST = 'manifest.webmanifest'
export const FILE_SW_REGISTER = 'registerSW.js'

export const VIRTUAL_MODULES_MAP: Record<string, string> = {
  'virtual:pwa-register': 'register',
  'virtual:pwa-register/vue': 'vue',
}
export const VIRTUAL_MODULES = Object.keys(VIRTUAL_MODULES_MAP)
