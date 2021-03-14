import { UserConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import replace from '@rollup/plugin-replace'

const config: UserConfig = {
  // base: process.env.BASE_URL || 'https://github.com/',
  build: {
    sourcemap: process.env.SOURCE_MAP === 'true',
  },
  plugins: [
    Vue(),
    VitePWA({
      mode: 'development',
      base: '/',
      injectRegister: 'networkfirst',
      registerType: process.env.CLAIMS === 'true' ? 'autoUpdate' : undefined,
    }),
    replace({
      __DATE__: new Date().toISOString(),
    }),
  ],
}

export default config
