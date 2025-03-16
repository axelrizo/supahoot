<script setup lang="ts">
import type { Player } from '@/lib/supahoot/quizzes/player'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import QrcodeVue from 'qrcode.vue'
import { inject, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { NotificationProvider } from '../App.vue'

const container = inject<ServicesContainer>('container')!
const notificationProvider = inject<NotificationProvider>('notificationProvider')!

const route = useRoute()
const router = useRouter()

const lobbyId = parseInt(route.params.lobbyId as string)

const lobbyNamedRoute = { name: 'user-lobby', params: { lobbyId: lobbyId } }
const link = router.resolve(lobbyNamedRoute).fullPath

const players = ref<Player[]>([])

onMounted(async () => {
  players.value = await container.quizService.getPlayersByLobby(lobbyId)
  container.quizService.startListeningForNewPlayers(lobbyId, (value) => {
    players.value.push(value)
  })
})

onUnmounted(async () => {
  try {
    await container.quizService.stopListeningForNewPlayers(lobbyId)
  } catch (error) {
    if (error instanceof Error) {
      notificationProvider.showNotification(error.message)
    }
  }
})
</script>

<template>
  <div data-testid="lobby-id">Lobby ID: {{ lobbyId }}</div>
  <QrcodeVue :value="link" data-testid="qr-code" />
  <div>
    <div data-testid="player" v-for="player in players" :key="player.id">
      <p data-testid="player-username">{{ player.username }}</p>
      <img data-testid="player-image" :src="player.image" />
    </div>
  </div>
</template>
