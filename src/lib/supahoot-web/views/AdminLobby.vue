<script setup lang="ts">
import type { Player } from '@/lib/supahoot/quizzes/player'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import type { NotificationProvider } from '@supahoot-web/providers/notification-provider'
import QrcodeVue from 'qrcode.vue'
import { inject, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const container = inject<ServicesContainer>('container')!
const notificationProvider = inject<NotificationProvider>('notificationProvider')!

const route = useRoute()
const router = useRouter()

const lobbyId = parseInt(route.params.lobbyId as string)
const quizId = parseInt(route.params.quizId as string)

const lobbyNamedRoute = { name: 'player-lobby', params: { lobbyId: lobbyId } }
const lobbyHref = router.resolve(lobbyNamedRoute).href
const lobbyLink = new URL(location.origin + lobbyHref).toString()

const players = ref<Player[]>([])

const handleClickLink = () => {
  container.quizService.startQuiz(lobbyId)
}

onMounted(async () => {
  players.value = await container.quizService.getPlayersByLobby(lobbyId)
  container.quizService.startListeningForNewPlayers(lobbyId, (player) => {
    players.value.push(player)
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
  <div>
    <div data-testid="lobby-id">Lobby ID: {{ lobbyId }}</div>
    <QrcodeVue :value="lobbyLink" data-testid="qr-code" />
    <div>
      <div data-testid="player" v-for="player in players" :key="player.id">
        <p data-testid="player-username">{{ player.username }}</p>
        <img data-testid="player-image" :src="player.image" />
      </div>
    </div>
    <RouterLink
      data-testid="initialize-quiz-button"
      @click="handleClickLink"
      :to="{ name: 'admin-quiz', params: { quizId: quizId, lobbyId: lobbyId, questionOrder: 1 } }"
    ></RouterLink>
  </div>
</template>
