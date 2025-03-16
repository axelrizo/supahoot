<script setup lang="ts">
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { inject, ref } from 'vue'
import { useRoute } from 'vue-router'

const container = inject<ServicesContainer>('container')!

const playerUsername = ref('')

const route = useRoute()

const lobbyId = parseInt(route.params.lobbyId as string)

const submitPlayer = () => {
  container.quizService.createPlayerByLobbyId(lobbyId, playerUsername.value)
}
</script>

<template>
  <div>
    <form v-on:submit.prevent="submitPlayer" data-testid="player-form">
      <input type="text" v-model="playerUsername" data-testid="player-username-input" />
      <input type="submit" data-testid="player-submit" />
    </form>
  </div>
</template>
