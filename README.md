<p align='center'>
<img src='https://repository-images.githubusercontent.com/290129345/d4bfc300-1866-11eb-8602-e672c9dd0e7d' alt="vite-plugin-pwa - Zero-config PWA for Vite">
</p>

<p align='center'>
<a href='https://www.npmjs.com/package/vite-plugin-pwa'>
<img src='https://img.shields.io/npm/v/vite-plugin-pwa?color=33A6B8&label='>
</a>
</p>

<br>

## Features

- Generate Service Worker with Offline support (via [Workbox](https://developers.google.com/web/tools/workbox))
- Auto inject Web App [Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- Prompt for new content refreshing 
- Automatic reload when new content available
- Advanced (injectManifest)  
- Network first strategy
- Static assets handling

## Usage

```bash
npm i vite-plugin-pwa -D # yarn add vite-plugin-pwa -D
```

Add it to `vite.config.js`

```ts
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA()
  ]
}
```

## Configuration

### Simple (generateSW)

```ts
VitePWA({
  manifest: {
    // content of manifest
  },
  workbox: {
    // workbox options for generateSW
  }
})
```

### Prompt for new content 

![](https://user-images.githubusercontent.com/11247099/111190584-330cf880-85f2-11eb-8dad-20ddb84456cf.png)

**Warning**: this is the default option when `strategies` and `registerType` are not configured.
In order for the service worker to be registered, you must invoke the `registerSW` method
from the `virtual:pwa-register` module.

```ts
// main.ts
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // show a prompt to user
  },
  onOfflineReady() {
    // show a ready to work offline to user
  },
})
```

```ts
// when user clicked the "refresh" button
updateSW()
// the page will reload and the up-to-date content will be served.
```

You can find an example written in Vue 3: [ReloadPrompt.vue](./examples/vue-basic/src/ReloadPrompt.vue).

#### SSR/SSG

If you are using `SSR/SSG`, you need to import `virtual:pwa-register` module using dynamic import and checking if
`window` is not `undefined`:

```ts
// pwa.ts
import { registerSW } from 'virtual:pwa-register'
registerSW({ /* options */})

// main.ts
if (typeof window !== 'undefined') {
    import('./pwa')
}
```

### Automatic reload when new content available

**Warning**: in order for the service worker to be registered, you must invoke the` registerSW`
method from the `virtual:pwa-register` module.

With this option, once the service worker detects new content available, then it will update caches and 
will reload all browser windows/tabs with the application opened automatically to take the control.

The disadvantage of using this option is that the user can lose data in other browser windows / tabs in which the 
application is open and is filling in a form.

If your application has forms, it is recommended that you change the behavior to use default `prompt` option to allow
the user decide when to update the content of the application.

#### Configuration

With this option, the plugin will force `workbox.clientsClaim` and `workbox.skipWaiting` to `true`.

```ts
VitePWA({
  registerType: 'autoUpdate',  
  manifest: {
    // content of manifest
  },
  workbox: {
    // workbox options for generateSW
  }
})
```

#### Runtime

```ts
// main.ts
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onOfflineReady() {
    // show a ready to work offline to user
  },
})
```

#### SSR/SSG

If you are using `SSR/SSG`, you need to import `virtual:pwa-register` module using dynamic import and checking if
`window` is not `undefined`:

```ts
// pwa.ts
import { registerSW } from 'virtual:pwa-register'
registerSW({ /* options */})

// main.ts
if (typeof window !== 'undefined') {
    import('./pwa')
}
```

### Advanced (injectManifest)

You will need to include `workbox-*` dependencies as `dev dependencies`.

```js
// sw.js
import { precacheAndRoute } from 'workbox-precaching'
// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)
```

```ts
// vite.config.js
VitePWA({
  strategies: 'injectManifest',
  manifest: {
    // content of manifest
  }
})
```

If you need your custom service worker works with `Prompt for new content` behavior, you need to include on it at least
this code (see also this example: [sw.ts](./examples/vue-basic-inject-manifest/src/sw.ts)):
```ts
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
})
```

You can use Typescript to build your service worker, you can find an example written for a Vue 3 project: 
[sw.ts](./examples/vue-basic-inject-manifest/src/sw.ts).
To resolve service worker types, just add `WebWorker` to lib entry on your `tsconfig.json` file, for example:
```json
"lib": ["ESNext", "DOM", "WebWorker"],
```

### Network first strategy

We have created a service worker to be used with `network first strategy`, and so you don't need to create it using
`injectManifest`. 

There are 2 available cache strategies:
- `Network First Cache Strategy`
- [Custom Cache Network Race Strategy](https://developers.google.com/web/tools/workbox/modules/workbox-strategies#custom_cache_network_race_strategy)

By default, the service worker will use `Network First Cache Strategy`.

You can see an explanation for `Custom Cache Network Race Strategy` [here](https://jakearchibald.com/2014/offline-cookbook/#cache--network-race).

You can find an example written for a Vue 3 [here](./examples/vue-networkfirst).

#### Configuration

```ts
VitePWA({
  strategies: 'networkFirst',
  networkFirst: { /* options */ },  
  manifest: {
    // content of manifest
  }
})
```

To configure `Custom Cache Network Race Strategy` instead `Network First Cache Strategy`:
```ts
VitePWA({
  strategies: 'networkFirst',
  networkFirst: { raceStrategy: true, /* other options */ },
  manifest: {
    // content of manifest
  }
})
```

#### Runtime

This will be only necessary when you need to notify the user that your application is `ready to work offline`.

**Warning**: in order for the service worker to be registered, you must invoke the` registerSW`
method from the `virtual:pwa-register` module if you are using it.

```ts
// main.ts
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onOfflineReady() {
    // show a ready to work offline to user
  },
})
```

#### SSR/SSG

If you are using `SSR/SSG`, you need to import `virtual:pwa-register` module using dynamic import and checking if
`window` is not `undefined`:

```ts
// pwa.ts
import { registerSW } from 'virtual:pwa-register'
registerSW({ /* options */})

// main.ts
if (typeof window !== 'undefined') {
    import('./pwa')
}
```

### Static assets handling

By default, all icons on `PWA Manifest` option found under Vite's `publicDir` option directory, will be included 
in the service worker *precache*. You can disable this option using `includeManifestIcons: false`.

You can also add another static assets such as `favicon`, `svg` and `font` files using `includeAssets` option.
The `includeAssets` option will be resolved using `fast-glob` found under Vite's `publicDir` option directory, and so
you can use regular expressions to include those assets, for example: `includeAssets: ['fonts/*.ttf', 'images/*.png']`.
You don't need to configure `PWA Manifest icons` on `includeAssets` option.

You can find an example written for a Vue 3 [here](./examples/vue-router/vite.config.ts#L16).

If you need to include other assets that are not under Vite's `publicDir` option directory, you can use the 
`globPatterns` parameter of [workbox](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.generateSW) 
or [injectManifest](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.injectManifest)
plugin options:
```typescript
VitePWA({
  workbox: {
    globPatterns: [],
    // ...
  },
  // or for injectManifest/networkFirst strategies
  injectManifest: {
    globPatterns: [],
    // ...
  }  
})
```

### Full config

Check out the type declaration [src/types.ts](./src/types.ts) and the following links for more details.

- [Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox)

### IDE errors 'Cannot find module' (ts2307)

If your TypeScript build step or IDE complain about not being able to find modules or type definitions on imports, add the following to the `compilerOptions.types` array of your `tsconfig.json`:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "types": [
      "vite-plugin-pwa/client"
    ]
  }
}
```

### Testing service worker

Since this plugin will not generate the service worker on `development`, you can test it on local following these steps:

1) add `serve` script to your `package.json` if not before:
```json
"serve": "vite preview"
```
2) build your app and run `serve`: `npm run build && npm run serve`.

## Sponsors

This project is part of my <a href='https://github.com/antfu-sponsors'>Sponsor Program</a>

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

MIT License © 2020 [Anthony Fu](https://github.com/antfu)
