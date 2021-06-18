import { createApp, defineAsyncComponent } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
import App from './App.vue'
import './index.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: defineAsyncComponent(() => import('./pages/home.vue')) },
    { path: '/about', component: defineAsyncComponent(() => import('./pages/about.vue')) },
    { path: '/hi/:name', component: defineAsyncComponent(() => import('./pages/hi/[name].vue')), props: true },
  ],
})

createApp(App).use(router).mount('#app')
