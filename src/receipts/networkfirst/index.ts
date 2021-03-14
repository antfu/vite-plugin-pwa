/* eslint-disable comma-dangle */
// @ts-ignore
importScripts('__SW_IMPORT_SCRIPTS__')

// @ts-ignore
declare let self: ServiceWorkerGlobalScope
declare let workbox: any

const debug = JSON.parse('__SW_DEBUG__') === true
const modulePathPrefix = '__SW_MODULE_PATH_PREFIX__'
const useModulePathPrefix = modulePathPrefix.startsWith('/') ? modulePathPrefix.substring(1) : modulePathPrefix

// Note: Ignore the error that Glitch raises about workbox being undefined.
workbox.setConfig({ debug, modulePathPrefix })
const modules = [
  'workbox-core',
  'workbox-routing',
  'workbox-cacheable-response',
  'workbox-strategies',
  'workbox-expiration'
].map((module) => {
  workbox.loadModule(module)
  return `${useModulePathPrefix}${module}`
})

// we need to filter modules that we dont need on runtime, we exclude from the cache: comes with version
const suffix = debug ? '.dev.' : '.prod.'
// @ts-ignore
const manifest = (self.__WB_MANIFEST as Array<any>).filter((entry) => {
  return !entry.url || !entry.url.startsWith(useModulePathPrefix)
})

// To avoid async issues, we load strategies before we call it in the event listener
// workbox.loadModule('workbox-core')
// workbox.loadModule('workbox-routing')
// workbox.loadModule('workbox-cacheable-response')
// workbox.loadModule('workbox-strategies')
// workbox.loadModule('workbox-expiration')

const cacheNames = workbox.core.cacheNames

const { registerRoute, setCatchHandler, setDefaultHandler } = workbox.routing
const { CacheableResponsePlugin } = workbox.cacheableResponse
const {
  NetworkFirst,
  NetworkOnly
} = workbox.strategies
const { ExpirationPlugin } = workbox.expiration

const cacheName = cacheNames.runtime

// const manifestURLs = [...manifest, ...otherManifest].map(
const manifestURLs = [...manifest].map(
  (entry) => {
    // @ts-ignore
    const url = new URL(entry.url, self.location)
    return url.href
  }
)
// @ts-ignore
self.addEventListener('install', (event) => {
  // @ts-ignore
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(manifestURLs)
    })
  )
})

// @ts-ignore
self.addEventListener('activate', (event) => {
  // - clean up workbox precached data
  // @ts-ignore
  event.waitUntil(
    caches.delete(cacheNames.precache).then((result) => {
      if (result)
        console.log('Precached data removed')
      else
        console.log('No precache found')
    })
  )
})
// @ts-ignore
self.addEventListener('activate', (event) => {
  // - clean up outdated runtime cache
  // @ts-ignore
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      // clean up those who are not listed in manifestURLs
      cache.keys().then((keys) => {
        keys.forEach((request) => {
          if (!manifestURLs.includes(request.url))
            cache.delete(request)
        })
      })
    })
  )
})

registerRoute(
  // @ts-ignore
  ({ url }) => manifestURLs.includes(url.href),
  new NetworkFirst({ cacheName })
)

setDefaultHandler(new NetworkOnly())

// fallback to app-shell for document request
// @ts-ignore
setCatchHandler(({ event }): Promise<Response> => {
  switch (event.request.destination) {
    case 'document':
      return caches.match('__SW_INDEX_HTML__').then((r) => {
        return Promise.resolve(r || Response.error())
      })
    default:
      return Promise.resolve(Response.error())
  }
})

// @ts-ignore
self.skipWaiting()
workbox.core.clientsClaim()
