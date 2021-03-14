import { join as _join, resolve } from 'path'
import { promises as fs } from 'fs'
import { copyWorkboxLibraries, injectManifest } from 'workbox-build'
import { FILE_MANIFEST, FILE_SW_REGISTER } from './constants'
import { ResolvedVitePWAOptions } from './types'
import { slash } from './utils'

function join(...args: string[]) {
  return _join(...args).replace(/\\/g, '/')
}

export function generateSimpleSWRegister(options: ResolvedVitePWAOptions) {
  return `
if('serviceWorker' in navigator) {
window.addEventListener('load', () => {
navigator.serviceWorker.register('${join(options.base, options.filename)}', { scope: '${options.scope}' })
})
}`.replace(/\n/g, '')
}

export function injectServiceWorker(html: string, options: ResolvedVitePWAOptions) {
  const manifest = `<link rel="manifest" href="${join(options.base, FILE_MANIFEST)}">`

  if (options.injectRegister === 'inline' || options.injectRegister === 'networkfirst') {
    return html.replace(
      '</head>',
      `${manifest}<script>${generateSimpleSWRegister(options)}</script></head>`,
    )
  }

  if (options.injectRegister === 'import') {
    return html.replace(
      '</head>',
      `${manifest}<script src="${join(options.base, FILE_SW_REGISTER)}"></script></head>`,
    )
  }

  return html.replace(
    '</head>',
    `${manifest}</head>`,
  )
}
export async function generateNetworkFirstWS(options: ResolvedVitePWAOptions) {
  // TODO: check if we need the slash
  const index = slash(join(options.base, options.workbox.navigateFallback || 'index.html'))

  console.log(index)
  console.log(options)

  const {
    globDirectory,
    additionalManifestEntries,
    dontCacheBustURLsMatching,
    globFollow,
    globIgnores,
    globPatterns,
    globStrict,
    manifestTransforms,
    maximumFileSizeToCacheInBytes,
    modifyURLPrefix,
    templatedURLs,
  } = options.workbox

  // const manifest = await getManifest({
  //   globDirectory,
  //   additionalManifestEntries,
  //   dontCacheBustURLsMatching,
  //   globFollow,
  //   globIgnores,
  //   globPatterns,
  //   globStrict,
  //   manifestTransforms,
  //   maximumFileSizeToCacheInBytes,
  //   modifyURLPrefix,
  //   templatedURLs,
  // })
  // console.log((manifest as any).manifestEntries)
  //
  // console.log(__dirname)
  //
  // const content = await fs.readFile(resolve('.', '../src/client/build/networkfirst.js'), 'utf-8')
  const content = await fs.readFile(resolve(__dirname, 'receipts/networkfirst/index.mjs'), 'utf-8')

  console.log(`Options: ${JSON.stringify(options)}`)
  console.log(resolve(options.outDir, 'workbox'))
  const workboxDirectoryName = await copyWorkboxLibraries(resolve(options.outDir))
  // see https://developers.google.com/web/tools/workbox/modules/workbox-sw
  const result = content
    .replace('__SW_WS__', `${options.base}workbox-sw/index.mjs`)
    .replace('__SW_IMPORT_SCRIPTS__', `${slash(join(options.base, workboxDirectoryName, '/workbox-sw.js'))}`)
    .replace('__SW_MODULE_PATH_PREFIX__', `${slash(join(options.base, workboxDirectoryName, '/'))}`)
    .replace('__SW_DEBUG__', options.mode === 'production' ? 'false' : 'true')
  // .replace('__SW_MANIFEST__', JSON.stringify((manifest as any).manifestEntries as []).replaceAll('"', '\''))
  // .replace('__SW_OTHER_MANIFEST__', JSON.stringify(options.workbox.additionalManifestEntries || []).replaceAll('"', '\''))
    .replace('__SW_INDEX_HTML__', index)

  const swSrc = resolve(__dirname, options.swDest)
  console.log(swSrc)
  await fs.writeFile(swSrc, result, {
    encoding: 'utf-8',
  })
  await injectManifest({
    swSrc,
    swDest: swSrc,
    injectionPoint: 'self.__WB_MANIFEST',
    globDirectory,
    additionalManifestEntries,
    dontCacheBustURLsMatching,
    globFollow,
    globIgnores,
    globPatterns,
    globStrict,
    manifestTransforms,
    maximumFileSizeToCacheInBytes,
    modifyURLPrefix,
    templatedURLs,
  })
}
