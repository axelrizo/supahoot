<script setup lang="ts">
import type { NotificationProvider } from '@supahoot-web/App.vue'
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

const submitPlayer = () => {
  if (playerUsername.value.length <= 3) {
    notificationProvider.showNotification('Error: Username should be at least 4 characters long')
    return
  }

  container.quizService.createPlayerByLobbyId(lobbyId, playerUsername.value, playerAvatar.value!)
}

const handleInput = async (_event: Event) => {
  const avatar = await container.quizService.generatePlayerAvatar(playerUsername.value)

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
