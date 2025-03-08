<script setup lang="ts">
import { container } from '@supahoot/services/container'
import { provide } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

export type notificationProvider = {
  showNotification: (message: string) => void
}

const notificationProvider: notificationProvider = {
  showNotification: (message: string) => alert(message),
}

provide('container', container)
provide('notificationProvider', notificationProvider)
</script>

<template>
  <RouterLink to="/">Home</RouterLink>
  <RouterView />
</template>
