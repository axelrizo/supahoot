<script setup lang="ts">
import { container } from '@supahoot/services/container'
import { provide } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

provide('container', container)
</script>

<template>
  <RouterLink to="/">Home</RouterLink>
  <RouterView />
</template>
