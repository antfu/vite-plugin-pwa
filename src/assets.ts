import { resolve as resolveFs } from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fg from 'fast-glob'
import { GenerateSWConfig, InjectManifestConfig, ManifestEntry } from 'workbox-build'
import { ResolvedConfig } from 'vite'
import { ResolvedVitePWAOptions } from './types'
import { FILE_MANIFEST } from './constants'

function buildManifestEntry(
  publicDir: string,
  url: string,
): Promise<ManifestEntry> {
  return new Promise((resolve, reject) => {
    const cHash = crypto.createHash('MD5')
    const stream = fs.createReadStream(resolveFs(publicDir, url))
    stream.on('error', (err) => {
      reject(err)
    })
    stream.on('data', (chunk) => {
      cHash.update(chunk)
    })
    stream.on('end', () => {
      return resolve({
        url,
        revision: `${cHash.digest('hex')}`,
      })
    })
  })
}

function lookupAdditionalManifestEntries(
  useInjectManifest: boolean,
  injectManifest: Partial<InjectManifestConfig>,
  workbox: Partial<GenerateSWConfig>,
): ManifestEntry[] {
  return useInjectManifest
    ? injectManifest.additionalManifestEntries || []
    : workbox.additionalManifestEntries || []
}

export async function configureStaticAssets(
  resolvedVitePWAOptions: ResolvedVitePWAOptions,
  viteConfig: ResolvedConfig,
) {
  const {
    manifest,
    strategies,
    injectManifest,
    workbox,
    includeAssets,
    includeManifestIcons,
  } = resolvedVitePWAOptions

  const useInjectManifest = strategies === 'injectManifest' || strategies === 'networkFirst'
  const { publicDir } = viteConfig
  const globs: string[] = []
  const manifestEntries: ManifestEntry[] = lookupAdditionalManifestEntries(
    useInjectManifest,
    injectManifest,
    workbox,
  )
  if (includeAssets) {
    if (Array.isArray(includeAssets))
      globs.push(...includeAssets)
    else
      globs.push(includeAssets)
  }
  if (includeManifestIcons && manifest && manifest.icons) {
    const icons = manifest.icons
    Object.keys(icons).forEach((key) => {
      const icon = icons[key as any]
      globs.push(icon.src as string)
    })
  }
  if (globs.length > 0) {
    // we need to make icons relative, we can have for example icon entries with: /pwa.png
    // fast-glob will not resolve absolute paths
    let assets = await fg(
      globs.map((g) => {
        return g.startsWith('/') ? g.substring(1) : g
      }), {
        cwd: publicDir,
        onlyFiles: true,
        unique: true,
      },
    )
    // we also need to remove from the list existing included by the user
    if (manifestEntries.length > 0) {
      const included = manifestEntries.map(me => me.url)
      assets = assets.filter(a => !included.includes(a))
    }
    const assetsEntries = await Promise.all(assets.map((a) => {
      return buildManifestEntry(publicDir, a)
    }))
    manifestEntries.push(...assetsEntries)
  }
  if (manifest) {
    const cHash = crypto.createHash('MD5')
    cHash.update(generateWebManifestFile(resolvedVitePWAOptions))
    manifestEntries.push({
      url: FILE_MANIFEST,
      revision: `${cHash.digest('hex')}`,
    })
  }
  if (manifestEntries.length > 0) {
    if (useInjectManifest)
      injectManifest.additionalManifestEntries = manifestEntries

    else
      workbox.additionalManifestEntries = manifestEntries
  }
}

export function generateWebManifestFile(options: ResolvedVitePWAOptions): string {
  return `${JSON.stringify(options.manifest, null, options.minify ? 0 : 2)}\n`
}
