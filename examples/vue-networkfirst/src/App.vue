<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import MyWorker from './my-worker?worker'

import ReloadPrompt from './ReloadPrompt.vue'

const pong = ref(null)
const mode = ref(null)
const worker = new MyWorker()

// replaced dyanmicaly
const date = '__DATE__'
const timeAgo = useTimeAgo(date)

const runWorker = async() => {
  worker.postMessage('ping')
}
const resetMessage = async() => {
  worker.postMessage('clear')
}
const messageFromWorker = async({ data: { msg, mode: useMode } }) => {
  pong.value = msg
  mode.value = useMode
}

onBeforeMount(() => {
  worker.addEventListener('message', messageFromWorker)
})
</script>

<template>
  <img src="/favicon.svg" width="60" height="60">
  <br>
  <div>Built at: {{ date }} ({{ timeAgo }})</div>
  <br>
  <router-view />
  <br />
  <br />
  <button @click="runWorker">
    Ping web worker
  </button>
  &#160;&#160;
  <button @click="resetMessage">
    Reset message
  </button>
  <br />
  <br />
  <template v-if="pong">
    Response from web worker: <span> Message: {{ pong }} </span>&#160;&#160;<span> Using ENV mode: {{ mode }}</span>
  </template>
  <ReloadPrompt />
</template>
