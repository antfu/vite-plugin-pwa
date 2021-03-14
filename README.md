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
- **WIP**: Network first strategy
- **WIP**: Icons generation for different dimensions

## Usage

> ℹ️ **Vite 2 is supported from `v0.3.x`, Vite 1's support is discontinued.**

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

![](https://user-images.githubusercontent.com/11247099/110332062-d726fa80-805a-11eb-92f4-771499241350.png)

```ts
// main.ts
import { registerSW } from '@virtual/pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // show a prompt to user
  },
  onOfflineReady() {
    // ...
  },
})
```

```ts
// when user clicked the "refresh" button
updateSW()
// the page will reload and the up-to-date content will be served.
```

You can find an example written in Vue 3: [ReloadPrompt.vue](./example/src/ReloadPrompt.vue).

You can run the example using `pnpm run example:router:start`.

### Automatic reload when new content available

With this option, once the service worker detects new content available, then it will update caches and 
will reload all browser windows/tabs with the application opened automatically to take the control.

The downside using this option is that the user can lost data on other browser windows/tabs opened if filling a form.

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
import { registerSW } from '@virtual/pwa-register'

registerSW()
```

You can run the example using `pnpm run example:router:start:claims`.

### **WIP**: Network first strategy

### **WIP**: Advanced (injectManifest)

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
  },
  injectManifest: {
    // workbox options for injectManifest
  }
})
```

### Full config

Check out the type declaration [src/types.ts](./src/types.ts) and the following links for more details.

- [Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox)

## Sponsors

This project is part of my <a href='https://github.com/antfu-sponsors'>Sponsor Program</a>

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

MIT License © 2020 [Anthony Fu](https://github.com/antfu)
