<script setup lang="ts">
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { type NotificationProvider } from '../providers/notification-provider'

const router = useRouter()

const container = inject<ServicesContainer>('container')!
const notificationProvider = inject<NotificationProvider>('notificationProvider')!

const lobbyId = ref('')

const handleSubmitForm = async () => {
  if (isNaN(parseInt(lobbyId.value))) {
    notificationProvider.showNotification('Error: Invalid lobby id')
    return
  }

  try {
    const quiz = await container.quizService.getQuizByLobbyId(parseInt(lobbyId.value))

    await router.push({ name: 'player-lobby', params: { lobbyId: lobbyId.value, quizId: quiz.id } })
  } catch (error) {
    if (error instanceof Error) {
      notificationProvider.showNotification(`Error: ${error.message}`)
    }
  }
}
</script>

<template>
  <div class="flex items-center justify-center flex-col gap-10 h-screen">
    <p class="text-6xl">SupaHoot!</p>
    <form class="flex flex-col gap-2" data-testid="join-lobby-form" @submit="handleSubmitForm">
      <input type="text" class="input" data-testid="join-lobby-input" v-model="lobbyId" />
      <input type="submit" value="Join Lobby" class="btn btn-lg" />
    </form>
  </div>
</template>
