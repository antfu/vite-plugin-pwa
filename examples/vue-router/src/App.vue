<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import { useRouter } from 'vue-router'
import NProgress from 'nprogress'
// import ReloadPrompt from './ReloadPrompt.vue'

// replaced dyanmicaly
const date = '__DATE__'
const timeAgo = useTimeAgo(date)

const router = useRouter()
const loading = ref(false)

router.beforeEach(() => { NProgress.start() })
router.afterEach(() => { !loading.value && NProgress.done() })

watch(loading, (v) => {
  !v && NProgress.done()
}, { immediate: true })
</script>

<template>
  <div>Built at: {{ date }} ({{ timeAgo }})</div>
  <br>
  <!--  <router-view />-->
  <div :class="{ loading }">
    <router-view v-slot="{ Component, route }">
      <template v-if="Component">
        <transition mode="out-in">
          <keep-alive>
            <suspense
              @pending="loading = true"
              @resolve="loading = false"
            >
              <!-- this will not work: our components has more than one root -->
              <!--              <component :is="Component" :key="route.fullPath" />-->
              <template #default>
                <div>
                  <component :is="Component" :key="route.fullPath" />
                </div>
              </template>
              <template #fallback>
                <div>Loading...</div>
              </template>
            </suspense>
          </keep-alive>
        </transition>
      </template>
    </router-view>
  </div>
<!--  <ReloadPrompt />-->
</template>
