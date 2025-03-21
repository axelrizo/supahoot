<script setup lang="ts">
import { inject } from 'vue'
import type { PlayerProvider } from '@supahoot-web/providers/player-provider'
import type { NotificationProvider } from '@supahoot-web/providers/notification-provider'
import { useRouter } from 'vue-router'

const router = useRouter()

const notificationProvider = inject<NotificationProvider>('notificationProvider')!
const { player } = inject<PlayerProvider>('playerProvider')!

if (!player) {
  notificationProvider.showNotification('Error: Player not found')
  router.push({ name: 'home' })
}
</script>

<template>
  <div v-if="player">
    <img :src="player.image" data-testid="player-avatar" />
    <span data-testid="player-username">{{ player.username }}</span>
  </div>
</template>
