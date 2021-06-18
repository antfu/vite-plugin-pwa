/* eslint-disable no-use-before-define */
import { GenerateSWConfig, InjectManifestConfig } from 'workbox-build'

/**
 * Plugin options.
 */
export interface VitePWAOptions {
  /**
   * Build mode
   *
   * @default process.env.NODE_ENV or "production"
   */
  mode?: 'development' | 'production'
  /**
   * @default 'public'
   */
  srcDir?: string
  /**
   * @default 'dist'
   */
  outDir?: string
  /**
   * @default 'sw.js'
   */
  filename?: string
  /**
   * @default 'generateSW'
   */
  strategies?: 'generateSW' | 'injectManifest' | 'networkFirst'
  /**
   * The scope to register the Service Worker
   *
   * @default same as `base` of Vite's config
   */
  scope?: string
  /**
   * Inject the service worker register inlined in the index.html
   *
   * With `auto` set, depends on whether you used the `import { registerSW } from 'virtual:pwa-register'`
   * it will do nothing or use the `script` mode
   *
   * `inline` - inject a simple register, inlined with the generated html
   *
   * `script` - inject <script/> in <head>, with the `sr` to a generated simple register
   *
   * `null` - do nothing, you will need to register the sw you self, or imports from `virtual:pwa-register`
   *
   * @default 'auto'
   */
  injectRegister: 'inline' | 'script' | 'auto' | null | false
  /**
   * Mode for the virtual register.
   * Does NOT available for `injectRegister` set to `inline` or `script`
   *
   * `prompt` - you will need to show a popup/dialog to the user to confirm the reload.
   *
   * `autoUpdate` - when new content is available, the new service worker will update caches and reload all browser
   * windows/tabs with the application open automatically, it must take the control for the application to work
   * properly.
   *
   * @default 'prompt'
   */
  registerType?: 'prompt' | 'autoUpdate'
  /**
   * Minify the generated manifest
   *
   * @default true
   */
  minify: boolean
  /**
   * The manifest object
   */
  manifest: Partial<ManifestOptions> | false
  /**
   * The workbox object for `generateSW`
   */
  workbox: Partial<GenerateSWConfig>
  /**
   * The workbox object for `injectManifest`
   */
  injectManifest: Partial<InjectManifestConfig>
  /**
   * Override Vite's base options only for PWA
   *
   * @default "base" options from Vite
   */
  base?: string
  /**
   * `public` resources to be added to the PWA manifest.
   *
   * You don't need to add `manifest` icons here, it will be auto included.
   *
   * The `public` directory will be resolved from Vite's `publicDir` option directory.
   */
  includeAssets: string | string[] | undefined
  /**
   * By default the icons listed on `manifest` option will be included
   * on the service worker *precache* if present under Vite's `publicDir`
   * option directory.
   */
  includeManifestIcons: true
  /**
   * Configuration for `Network First` strategy.
   */
  networkFirst?: {
    /**
     * Should we use `Custom Cache Network Race Strategy` or `Network First Cache Strategy`?
     *
     * By default using `Network First Cache Strategy`.
     *
     * @default false
     */
    raceStrategy?: boolean
    /**
     * Enable this option to see `cache` cleanup and `network/cache` errors on console.
     *
     * @default false
     */
    debug?: boolean
    /**
     * @default 'same-origin'
     */
    credentials?: RequestCredentials
    /**
     * Only for `Network First Cache Strategy`.
     */
    networkTimeoutSeconds?: number
  }
}

export interface ResolvedVitePWAOptions extends Required<VitePWAOptions> {
  swSrc: string
  swDest: string
  workbox: GenerateSWConfig
  injectManifest: InjectManifestConfig
}

export interface ManifestOptions {
  /**
   * @default _npm_package_name_
   */
  name: string
  /**
   * @default _npm_package_name_
   */
  short_name: string
  /**
   * @default _npm_package_description_
   */
  description: string
  /**
   *
   */
  icons: Record<string, any>[]
  /**
   * @default `routerBase + '?standalone=true'`
   */
  start_url: string
  /**
   * Restricts what web pages can be viewed while the manifest is applied
   */
  scope: string
  /**
   * Defines the default orientation for all the website's top-level
   */
  orientation: 'any' | 'natural' | 'landscape' | 'landscape-primary' | 'landscape-secondary' | 'portrait' | 'portrait-primary' | 'portrait-secondary'
  /**
   * @default `standalone`
   */
  display: string
  /**
   * @default `#ffffff`
   */
  background_color: string
  /**
   * @default '#42b883
   */
  theme_color: string
  /**
   * @default `ltr`
   */
  dir: 'ltr' | 'rtl'
  /**
   * @default `en`
   */
  lang: string
  /**
   * @default A combination of `routerBase` and `options.build.publicPath`
   */
  publicPath: string
  /**
   * @default []
   */
  related_applications: {
    platform: string
    url: string
    id?: string
  }[]
  /**
   * @default false
   */
  prefer_related_applications: boolean
  /**
   * @default []
   */
  protocol_handlers: {
    protocol: string
    url: string
  }[]
  /**
   * @default []
   */
  shortcuts: {
    name: string
    short_name?: string
    url: string
    description?: string
    icons: string[]
  }[]
  /**
   * @default []
   */
  screenshots: {
    src: string
    sizes: string
    label?: string
    platform?: 'narrow' | 'wide' | 'android' | 'ios' | 'kaios' | 'macos' | 'windows' | 'windows10x' | 'chrome_web_store' | 'play' | 'itunes' | 'microsoft-inbox' | 'microsoft-store' | string
    type?: string
  }[]
  /**
   * @default []
   */
  categories: string[]
  /**
   * @default ''
   */
  iarc_rating_id: string
}
