import fs from 'fs'
import { resolve, extname } from 'path'
import { ResolvedConfig } from 'vite'
import { GenerateSWConfig, InjectManifestConfig } from 'workbox-build'
import { ManifestOptions, VitePWAOptions, ResolvedVitePWAOptions } from './types'
import { configureStaticAssets } from './assets'
import { resolveBathPath } from './utils'

function resolveSwPaths(injectManifest: boolean, root: string, srcDir: string, outDir: string, filename: string): {
  swSrc: string
  swDest: string
  useFilename?: string
} {
  const swSrc = resolve(root, srcDir, filename)
  // check typescript service worker: swDest must have js extension
  if (injectManifest && extname(filename) === '.ts' && fs.existsSync(swSrc)) {
    const useFilename = `${filename.substring(0, filename.lastIndexOf('.'))}.js`
    // we need to change filename on resolved options, it will be used to register the service worker:
    // generateSimpleSWRegister on html.ts
    // generateRegisterSW on modules.ts
    return {
      swSrc,
      swDest: resolve(root, outDir, useFilename),
      useFilename,
    }
  }
  return {
    swSrc,
    swDest: resolve(root, outDir, filename),
  }
}

export async function resolveOptions(options: Partial<VitePWAOptions>, viteConfig: ResolvedConfig): Promise<ResolvedVitePWAOptions> {
  const root = viteConfig.root
  const pkg = fs.existsSync('package.json')
    ? JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    : {}

  // prevent tsup replacing `process.env`
  // eslint-disable-next-line dot-notation
  const processMode = (process['env']['NODE_ENV'] || 'production') as ('production' | 'development')

  const {
    mode = processMode,
    srcDir = 'public',
    outDir = viteConfig.build.outDir || 'dist',
    injectRegister = 'auto',
    registerType = 'prompt',
    filename = 'sw.js',
    strategies = 'generateSW',
    minify = true,
    base = viteConfig.base,
    includeAssets = undefined,
    includeManifestIcons = true,
    networkFirst = {
      raceStrategy: true,
      debug: processMode !== 'production',
      credentials: 'same-origin',
    },
  } = options

  const basePath = resolveBathPath(base)
  // check typescript service worker for injectManifest strategy
  const { swSrc, swDest, useFilename } = resolveSwPaths(
    strategies === 'injectManifest',
    root,
    srcDir,
    outDir,
    filename,
  )
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
  const manifest = typeof options.manifest === 'boolean' && !options.manifest
    ? false
    : Object.assign({}, defaultManifest, options.manifest || {})
  const injectManifest = Object.assign({}, defaultInjectManifest, options.injectManifest || {})

  if ((injectRegister === 'auto' || registerType == null) && registerType === 'autoUpdate') {
    workbox.skipWaiting = true
    workbox.clientsClaim = true
  }

  const resolvedVitePWAOptions: ResolvedVitePWAOptions = {
    base: basePath,
    mode,
    swSrc,
    swDest,
    srcDir,
    outDir,
    injectRegister,
    registerType,
    filename: useFilename || filename,
    strategies,
    workbox,
    manifest,
    injectManifest,
    scope,
    minify,
    includeAssets,
    includeManifestIcons,
    networkFirst,
  }

  await configureStaticAssets(resolvedVitePWAOptions, viteConfig)

  return resolvedVitePWAOptions
}
