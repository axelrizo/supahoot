<script setup lang="ts">
import { RouterView } from 'vue-router'
import { playerProvider } from '@supahoot-web/providers/player-provider'
import { provide } from 'vue'

provide('playerProvider', playerProvider)
</script>

<template>
  <RouterView />
</template>
