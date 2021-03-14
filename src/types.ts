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
  strategies?: 'generateSW' | 'injectManifest'
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
   * it will do nothing or use the `import` mode
   *
   * @default 'auto'
   */
  injectRegister: 'inline' | 'import' | 'auto' | 'networkfirst' | null | false
  /**
   * When `injectRegister` is `auto`, how interact with the user on new content found?
   *
   * Only with `prompt` you will need to show a popup/dialog to the user to confirm.
   *
   * With `autoUpdate`, the service worker will update caches and reload all browser windows/tabs with the application
   * opened automatically to take the control when new content is available.
   *
   * @default 'autoUpdate'
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
  manifest: Partial<ManifestOptions>
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
}

export interface ResolvedVitePWAOptions extends Required<VitePWAOptions> {
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
}
