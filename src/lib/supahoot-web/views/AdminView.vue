<script setup lang="ts">
import type { Quiz } from '@supahoot/quizzes/quiz'
import type { ServicesContainer } from '@supahoot/services/container'
import { inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { NotificationProvider } from '../App.vue'

const { quizService } = inject('container') as ServicesContainer
const { showNotification } = inject('notificationProvider') as NotificationProvider

const router = useRouter()

const quizzes = ref<Quiz[]>([])

onMounted(async () => {
  quizzes.value = await quizService.getQuizzes()
})

const createLobby = async (quizId: number) => {
  try {
    const lobby = await quizService.createLobby(quizId)
    router.push(`admin/lobby/${lobby.id}`)
  } catch (_error) {
    showNotification("Error: Failed to create lobby")
  }
}
</script>

<template>
  <div>hola</div>
  <div v-for="quiz in quizzes" :key="quiz.id">
    <h1 data-testid="quiz-title">{{ quiz.name }}</h1>
    <button data-testid="initialize-quiz-button" v-on:click="createLobby(quiz.id)">
      Initialize
    </button>
  </div>
</template>
