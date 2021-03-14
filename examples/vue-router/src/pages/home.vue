<script setup lang="ts">
import { ref } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import { useRouter } from 'vue-router'

// replaced dyanmicaly
const date = '__DATE__'
const timeAgo = useTimeAgo(date)
const router = useRouter()
const name = ref('')

const go = () => {
  if (name.value)
    router.push(`/hi/${encodeURIComponent(name.value)}`)
}
</script>
<template>
  <div>Home route, built at: {{ date }} ({{ timeAgo }})</div>
  <br>
  <form @submit.prevent="go">
    <input v-model="name" type="text" aria-label="What's your name?" placeholder="What's your name?">
    <br>
    <br>
    <button type="submit">
      GO
    </button>
  </form>
  <br>
  <button type="button" @click="router.push('/about')">
    About
  </button>
</template>
