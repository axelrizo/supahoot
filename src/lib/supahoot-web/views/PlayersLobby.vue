<script setup lang="ts">
import type { NotificationProvider } from '@supahoot-web/providers/notification-provider'
import type { ServicesContainer } from '@supahoot/services/container'
import { FileUtils } from '@supahoot/utils/file.utils'
import { inject, ref } from 'vue'
import { useRoute } from 'vue-router'

const container = inject<ServicesContainer>('container')!
const notificationProvider = inject<NotificationProvider>('notificationProvider')!

const route = useRoute()

const lobbyId = parseInt(route.params.lobbyId as string)

const playerUsername = ref('')
const playerAvatar = ref<File | null>(null)

const playerAvatarSource = ref('')

const submitPlayer = async () => {
  if (playerUsername.value.length < 4) {
    notificationProvider.showNotification('Error: Username should be at least 4 characters long')
    return
  }

  try {
    await container.quizService.createPlayerByLobbyId(
      lobbyId,
      playerUsername.value,
      playerAvatar.value!,
    )
  } catch (_error) {
    notificationProvider.showNotification('Error: Failed to create player')
  }
}

const handleInput = async (_event: Event) => {
  const avatar = await container.avatarService.generateAvatarByString(playerUsername.value)

  playerAvatar.value = avatar
  playerAvatarSource.value = await FileUtils.fileToDataURL(avatar)
}
</script>

<template>
  <div>
    <form v-on:submit.prevent="submitPlayer" data-testid="player-form">
      <img data-testid="player-avatar" :src="playerAvatarSource" />
      <input
        type="text"
        v-on:input="handleInput"
        v-model="playerUsername"
        data-testid="player-username-input"
      />
      <input type="submit" data-testid="player-submit" />
    </form>
  </div>
</template>
