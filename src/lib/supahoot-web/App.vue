<script setup lang="ts">
import { container } from '@supahoot/services/container'
import { provide } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const notificationProvider = {
  showNotification: (message: string) => alert(message),
}
export type notificationProvider = typeof notificationProvider

provide('container', container)
provide('notificationProvider', notificationProvider)
</script>

<template>
  <RouterLink to="/">Home</RouterLink>
  <RouterView />
</template>
