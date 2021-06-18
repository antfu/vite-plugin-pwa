<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import { useRouter } from 'vue-router'
// replaced dyanmicaly
const date = '__DATE__'
const timeAgo = useTimeAgo(date)
const router = useRouter()
</script>
<template>
  <div>About route, built at: {{ date }} ({{ timeAgo }})</div>
  <br>
  <button @click="router.push('/')">
    Home
  </button>
</template>
