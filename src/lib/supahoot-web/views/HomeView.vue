<script setup lang="ts">
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()
const container = inject<ServicesContainer>('container')

const lobbyId = ref('')

const handleSubmitForm = async () => {
  const quiz = await container.quizService.getQuizByLobbyId(lobbyId.value)
  await router.push({ name: 'player-lobby', params: { lobbyId: lobbyId.value, quizId: quiz.id } })
}
</script>

<template>
  <div>
    <form data-testid="join-lobby-form" @submit="handleSubmitForm">
      <input type="text" data-testid="join-lobby-input" v-model="lobbyId" />
    </form>
  </div>
</template>
