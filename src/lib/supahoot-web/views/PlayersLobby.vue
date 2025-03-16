<script setup lang="ts">
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { FileUtils } from '@/lib/supahoot/utils/file.utils'
import { inject, ref } from 'vue'
import { useRoute } from 'vue-router'

const container = inject<ServicesContainer>('container')!

const route = useRoute()

const lobbyId = parseInt(route.params.lobbyId as string)

const playerUsername = ref('')
const playerAvatar = ref('')

const submitPlayer = () => {
  container.quizService.createPlayerByLobbyId(lobbyId, playerUsername.value)
}

const handleInput = async (_event: Event) => {
  const avatar = await container.quizService.generatePlayerAvatar(playerUsername.value)

  playerAvatar.value = await FileUtils.fileToDataURL(avatar)
}
</script>

<template>
  <div>
    <form v-on:submit.prevent="submitPlayer" data-testid="player-form">
      <img data-testid="player-avatar" :src="playerAvatar" />
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
