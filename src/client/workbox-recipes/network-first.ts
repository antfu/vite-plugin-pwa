/* eslint-disable no-console */
import { clientsClaim, cacheNames } from 'workbox-core'
import { registerRoute, setCatchHandler, setDefaultHandler } from 'workbox-routing'
import {
  NetworkFirst,
  NetworkOnly,
  Strategy,
  StrategyHandler,
} from 'workbox-strategies'
import { ManifestEntry } from 'workbox-build'

// Give TypeScript the correct global.
// @ts-ignore
declare let self: ServiceWorkerGlobalScope
declare type ExtendableEvent = any

const data = JSON.parse(`{
  "race": __SW_RACE__,
  "debug": __SW_DEBUG__,
  "credentials": "__SW_CREDENTIALS__",
  "networkTimeoutSeconds": __SW_TIMEOUT__,
  "fallback": "__SW_FALLBACK__"
}`) as any

const {
  race = true,
  debug = false,
  credentials = 'same-origin',
  networkTimeoutSeconds = 0,
  fallback = 'index.html',
} = data

const cacheName = cacheNames.runtime

const buildStrategy = (): Strategy => {
  if (race) {
    class CacheNetworkRace extends Strategy {
      _handle(request: Request, handler: StrategyHandler): Promise<Response | undefined> {
        const fetchAndCachePutDone: Promise<Response> = handler.fetchAndCachePut(request)
        const cacheMatchDone: Promise<Response | undefined> = handler.cacheMatch(request)

        return new Promise((resolve, reject) => {
          fetchAndCachePutDone.then(resolve).catch((e) => {
            if (debug)
              console.log(`Cannot fetch resource: ${request.url}`, e)
          })
          cacheMatchDone.then(response => response && resolve(response))

          // Reject if both network and cache error or find no response.
          Promise.allSettled([fetchAndCachePutDone, cacheMatchDone]).then((results) => {
            const [fetchAndCachePutResult, cacheMatchResult] = results
            // @ts-ignore
            if (fetchAndCachePutResult.status === 'rejected' && !cacheMatchResult.value)
              reject(fetchAndCachePutResult.reason)
          })
        })
      }
    }
    return new CacheNetworkRace()
  }
  else {
    if (networkTimeoutSeconds > 0)
      return new NetworkFirst({ cacheName, networkTimeoutSeconds })
    else
      return new NetworkFirst({ cacheName })
  }
}

const manifest = self.__WB_MANIFEST as Array<ManifestEntry>

const cacheEntries: RequestInfo[] = []

const manifestURLs = manifest.map(
  (entry) => {
    // @ts-ignore
    const url = new URL(entry.url, self.location)
    cacheEntries.push(new Request(url.href, {
      credentials: credentials as any,
    }))
    return url.href
  },
)

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(cacheEntries)
    }),
  )
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  // - clean up outdated runtime cache
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      // clean up those who are not listed in manifestURLs
      cache.keys().then((keys) => {
        keys.forEach((request) => {
          debug && console.log(`Checking cache entry to be removed: ${request.url}`)
          if (!manifestURLs.includes(request.url)) {
            cache.delete(request).then((deleted) => {
              if (debug) {
                if (deleted)
                  console.log(`Precached data removed: ${request.url || request}`)
                else
                  console.log(`No precache found: ${request.url || request}`)
              }
            })
          }
        })
      })
    }),
  )
})

registerRoute(
  ({ url }) => manifestURLs.includes(url.href),
  buildStrategy(),
)

setDefaultHandler(new NetworkOnly())

// fallback to app-shell for document request
setCatchHandler(({ event }): Promise<Response> => {
  // @ts-ignore
  switch (event.request.destination) {
    case 'document':
      return caches.match(fallback).then((r) => {
        return r ? Promise.resolve(r) : Promise.resolve(Response.error())
      })
    default:
      return Promise.resolve(Response.error())
  }
})

// this is necessary, since the new service worker will keep on skipWaiting state
// and then, caches will not be cleared since it is not activated
self.skipWaiting()
clientsClaim()
