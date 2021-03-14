import fs from 'fs'
import { resolve } from 'path'
import { ResolvedConfig } from 'vite'
import { GenerateSWConfig, InjectManifestConfig } from 'workbox-build'
import { ManifestOptions, VitePWAOptions, ResolvedVitePWAOptions } from './types'

export function resolveBathPath(base: string) {
  if (isAbsolute(base))
    return base
  return !base.startsWith('/') && !base.startsWith('./')
    ? `/${base}`
    : base
}

export function isAbsolute(url: string) {
  return url.match(/^(?:[a-z]+:)?\/\//i)
}

export function resolveOptions(options: Partial<VitePWAOptions>, viteConfig: ResolvedConfig): ResolvedVitePWAOptions {
  const root = viteConfig.root
  const pkg = fs.existsSync('package.json')
    ? JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    : {}

  const {
    // prevent tsup replacing `process.env`
    // eslint-disable-next-line dot-notation
    mode = (process['env']['NODE_ENV'] || 'production') as ('production' | 'development'),
    srcDir = 'public',
    outDir = viteConfig.build.outDir || 'dist',
    injectRegister = 'auto',
    registerType = 'prompt',
    filename = 'sw.js',
    strategies = 'generateSW',
    minify = true,
    base = viteConfig.base,
  } = options

  const basePath = resolveBathPath(base)
  const swSrc = resolve(root, srcDir, filename)
  const swDest = resolve(root, outDir, filename)
  const outDirRoot = resolve(root, outDir)
  const scope = options.scope || basePath

  const defaultWorkbox: GenerateSWConfig = {
    swDest,
    globDirectory: outDirRoot,
    offlineGoogleAnalytics: false,
    cleanupOutdatedCaches: true,
    mode,
    navigateFallback: 'index.html',
  }

  const defaultInjectManifest: InjectManifestConfig = {
    swSrc,
    swDest,
    globDirectory: outDirRoot,
    injectionPoint: 'self.__WB_MANIFEST',
  }

  const defaultManifest: Partial<ManifestOptions> = {
    name: pkg.name,
    short_name: pkg.name,
    start_url: basePath,
    display: 'standalone',
    background_color: '#ffffff',
    lang: 'en',
    scope,
  }

  const workbox = Object.assign({}, defaultWorkbox, options.workbox || {})
  const manifest = Object.assign({}, defaultManifest, options.manifest || {})
  const injectManifest = Object.assign({}, defaultInjectManifest, options.injectManifest || {})

  if (injectRegister === 'auto' && registerType === 'autoUpdate') {
    workbox.skipWaiting = true
    workbox.clientsClaim = true
  }

  return {
    base: basePath,
    mode,
    swDest,
    srcDir,
    outDir,
    injectRegister,
    registerType,
    filename,
    strategies,
    workbox,
    manifest,
    injectManifest,
    scope,
    minify,
  }
}
