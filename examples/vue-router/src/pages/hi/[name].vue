<script setup lang="ts">
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'
import { useTimeAgo } from '@vueuse/core'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})

// replaced dyanmicaly
const date = '__DATE__'
const timeAgo = useTimeAgo(date)

const router = useRouter()
</script>

<template>
  <div>Demo of dynamic route, built at: {{ date }} ({{ timeAgo }})</div>
  <p>
    {{ `Hi: ${props.name}` }}
  </p>
  <br>
  <div>
    <button @click="router.back()">
      BACK
    </button>
  </div>
</template>
