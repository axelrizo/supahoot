<script setup lang="ts">
import type { NotificationProvider } from '@supahoot-web/providers/notification-provider'
import type { ServicesContainer } from '@supahoot/services/container'
import { FileUtils } from '@supahoot/utils/file.utils'
import { inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { PlayerProvider } from '../providers/player-provider'

const container = inject<ServicesContainer>('container')!
const notificationProvider = inject<NotificationProvider>('notificationProvider')!
const playerProvider = inject<PlayerProvider>('playerProvider')!

const route = useRoute()
const router = useRouter()

const lobbyId = parseInt(route.params.lobbyId as string)
const quizId = parseInt(route.params.quizId as string)

const playerUsername = ref('')
const playerAvatar = ref<File | null>(null)

const playerAvatarSource = ref('')

const submitPlayer = async () => {
  if (playerUsername.value.length < 4) {
    notificationProvider.showNotification('Error: Username should be at least 4 characters long')
    return
  }

  try {
    playerProvider.player = await container.quizService.createPlayerByLobbyId(
      lobbyId,
      playerUsername.value,
      playerAvatar.value!,
    )
    await router.push({
      name: 'player-lobby-before-quiz-starts',
      params: { lobbyId: lobbyId, quizId: quizId },
    })
  } catch (_error) {
    notificationProvider.showNotification('Error: Failed to create player')
  }
}

const handleInput = async (_event: Event) => {
  const avatar = await container.avatarService.generateAvatarByString(playerUsername.value)

  playerAvatar.value = avatar
  playerAvatarSource.value = await FileUtils.fileToDataURL(avatar)
}

onMounted(async () => {
  const avatar = await container.avatarService.generateAvatarByString(crypto.randomUUID())
  playerAvatarSource.value = await FileUtils.fileToDataURL(avatar)
})
</script>

<template>
  <div class="flex items-center justify-center flex-col gap-10 h-screen">
    <form
      v-on:submit.prevent="submitPlayer"
      data-testid="player-form"
      class="flex flex-col items-center gap-4"
    >
      <img data-testid="player-avatar" class="aspect-square w-32" :src="playerAvatarSource" />
      <input
        type="text"
        v-on:input="handleInput"
        v-model="playerUsername"
        data-testid="player-username-input"
        class="input"
      />
      <input type="submit" data-testid="player-submit" class="btn btn-lg btn-primary w-full" />
    </form>
  </div>
</template>
