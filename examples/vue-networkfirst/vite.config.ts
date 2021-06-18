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
      strategies: 'networkFirst',
      includeAssets: ['/favicon.svg'], // <== don't remove slash, for testing purposes
      networkFirst: {
        raceStrategy: process.env.NO_RACE !== 'true',
        debug: true,
      },
      manifest: {
        name: 'PWA NetFirst',
        short_name: 'PWA NetworkFirst',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png', // <== don't remove slash, for testing purposes
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png', // <== don't remove slash, for testing purposes
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png', // <== don't remove slash, for testing purposes
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    replace({
      __DATE__: new Date().toISOString(),
    }),
  ],
}

export default config
