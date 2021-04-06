import { join, resolve/*, relative */ } from 'path'
import { promises as fs } from 'fs'
// import { execSync } from 'child_process'
import { injectManifest } from 'workbox-build'
// import { runEsbuild } from 'tsup'
import { ResolvedConfig } from 'vite'
import Rollup from 'rollup'
import type { ResolvedVitePWAOptions } from './types'
import { slash } from './utils'

export async function generateRegisterSW(options: ResolvedVitePWAOptions, mode: 'build' | 'dev', source = 'register') {
  const sw = slash(join(options.base, options.filename))
  const scope = options.scope

  const content = await fs.readFile(resolve(__dirname, `client/${mode}/${source}.mjs`), 'utf-8')

  return content
    .replace('__SW__', sw)
    .replace('__SCOPE__', scope)
    .replace('__SW_AUTO_UPDATE__', `${options.registerType === 'autoUpdate'}`)
}

export async function generateInjectManifest(options: ResolvedVitePWAOptions, viteOptions: ResolvedConfig) {
  // we have something like this from swSrc:
  /*
  // sw.js
  import { precacheAndRoute } from 'workbox-precaching'
  // self.__WB_MANIFEST is default injection point
  precacheAndRoute(self.__WB_MANIFEST)
  */
  // we need to load and build with --no-splitting via tsup: but we need to change injection point before build it
  console.log(options)
  const im = options.injectManifest
  if (!im.injectionPoint)
    im.injectionPoint = 'self.__WB_MANIFEST'
  if (!im.swSrc)
    im.swSrc = options.filename || 'sw.js'
  if (!im.swDest)
    im.swDest = options.filename || 'sw.js'
  // lookup for sw.js on target project: relative to vite.config.js
  // todo@userquin: document this
  // todo@antfu: remove .cmd extension if you are not on windows to test it
  // sw.ts file must be relative, cannot be absolute...
  // todo@for-tsup
  // const sw = relative(resolve(join(options.srcDir, im.swSrc)), viteOptions.root)
  // const build = `${resolve('node_modules/.bin/tsup.cmd')} ${sw} --no-splitting --format cjs -d ${resolve(options.outDir)}`
  // execSync(build, { stdio: 'inherit' })
  // todo@for-rollup
  const sw = resolve(join(options.srcDir, im.swSrc))
  const rollup = (await import('rollup')) as typeof Rollup
  // remove this plugin from the compilation: avoid infinite recursion
  const plugins = (viteOptions.plugins as Plugin[]).filter((p) => {
    console.log(p.name)
    return p.name !== 'vite-plugin-pwa' && p.name !== 'vite:build-html' && p.name !== 'vite:html'
  })
  const bundle = await rollup.rollup({
    input: sw,
    plugins,
  })
  try {
    await bundle.write({
      format: 'cjs',
      exports: 'none',
      inlineDynamicImports: true,
      dir: resolve(options.outDir),
      sourcemap: viteOptions.build.sourcemap,
    })
  }
  finally {
    await bundle.close()
  }
  // todo@for-runEsbuild
  // await runEsbuild({
  //   target: 'es5',
  //   minify: options.mode === 'production',
  //   keepNames: true,
  //   outDir: options.outDir,
  //   splitting: false,
  //   entryPoints: [sw],
  //   format: ['cjs'],
  // }, { format: 'cjs' })
  // this will not fail since there is an injectionPoint
  options.injectManifest.swSrc = options.injectManifest.swDest
  // options.injectManifest.mode won't work!!!
  // error during build: ValidationError: "mode" is not allowed
  if (options.injectManifest.mode)
    delete options.injectManifest.mode

  // inject the manifest
  await injectManifest(options.injectManifest)
  // const output = resolve(options.outDir, im.swDest)
  // after build the sw, we need to add process.env.
  // injectManifest will include process.env.NODE_ENV checks,
  // just write it at the begining of the file
  const output = resolve(options.outDir, im.swDest)
  const content = await fs.readFile(output, 'utf-8')
  await fs.writeFile(output, `var process = { env: { NODE_ENV: '${options.mode}' }};  
${content}
`)

  // await injectManifest({
  //   swSrc,
  //   swDest: swSrc,  // this will not fail since there is an injectionPoint
  //   injectionPoint,
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
}
