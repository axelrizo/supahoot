<script setup lang="ts">
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import type { NotificationProvider } from '@supahoot-web/providers/notification-provider'
import type { PlayerProvider } from '@supahoot-web/providers/player-provider'
import { inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const lobbyId = parseInt(route.params.lobbyId as string)
const quizId = parseInt(route.params.quizId as string)

const container = inject<ServicesContainer>('container')!
const notificationProvider = inject<NotificationProvider>('notificationProvider')!

const { player } = inject<PlayerProvider>('playerProvider')!

if (!player) {
  notificationProvider.showNotification('Error: Player not found')
  router.push({ name: 'home' })
}

onMounted(() => {
  container.quizService.listenQuizStart(lobbyId, () => {
    router.push({
      name: 'player-quiz',
      params: { quizId: quizId, lobbyId: lobbyId },
    })
  })
})
</script>

<template>
  <div v-if="player" class="flex items-center justify-center flex-col h-screen">
    <div class="text-xl pb-20">Waiting more players...</div>
    <img :src="player.image" data-testid="player-avatar" class="aspect-square w-40" />
    <span data-testid="player-username" class="text-2xl">{{ player.username }}</span>
  </div>
</template>
