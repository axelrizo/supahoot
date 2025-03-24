<script setup lang="ts">
import type { Player } from '@/lib/supahoot/quizzes/player'
import type { QuizWithQuestionsWithAnswers } from '@/lib/supahoot/quizzes/quiz'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import type { NotificationProvider } from '@supahoot-web/providers/notification-provider'
import QrcodeVue from 'qrcode.vue'
import { inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const UPDATE_COUNTER_INTERVAL_MS = 1000

const { timeToStartAnswering, timeToAnswer } = defineProps({
  timeToStartAnswering: Number,
  timeToAnswer: Number,
})

const container = inject<ServicesContainer>('container')!
const notificationProvider = inject<NotificationProvider>('notificationProvider')!

const route = useRoute()
const router = useRouter()

const lobbyId = parseInt(route.params.lobbyId as string)
const quizId = parseInt(route.params.quizId as string)

const lobbyHref = router.resolve({ name: 'player-lobby' }).href
const lobbyLink = new URL(location.origin + lobbyHref).toString()

const stage = ref<'lobby' | 'before-answer' | 'answering' | 'statistics'>('lobby')
const players = ref<Player[]>([])
const quiz = ref<QuizWithQuestionsWithAnswers | null>(null)
const timeLeftToStartAnswering = ref(timeToStartAnswering || 10)
const timeLeftToAnswer = ref(timeToAnswer || 20)

const handleInitializeQuizButtonClick = async () => {
  try {
    await container.quizService.startQuiz(lobbyId)
    await container.quizService.stopListeningForNewPlayers(lobbyId)
    stage.value = 'before-answer'
    container.quizService.sendQuestion(lobbyId, quiz.value!.questions[0])
  } catch (error) {
    if (error instanceof Error) {
      notificationProvider.showNotification('Error: ' + error.message)
    }
  }
}

onMounted(async () => {
  players.value = await container.quizService.getPlayersByLobby(lobbyId)
  quiz.value = await container.quizService.getQuizWithQuestionsAndAnswersByQuizId(quizId)

  const answeringCountdownInterval = () => {
    const interval = setInterval(() => {
      if (timeLeftToAnswer.value === 0) {
        clearInterval(interval)
        stage.value = 'statistics'
        return
      }

      container.quizService.updateAnsweringCountdown(lobbyId, timeLeftToAnswer.value--)
    }, UPDATE_COUNTER_INTERVAL_MS)
  }

  const beforeAnsweringCountdownInterval = setInterval(() => {
    if (timeLeftToStartAnswering.value === 0) {
      answeringCountdownInterval()
      clearInterval(beforeAnsweringCountdownInterval)
      stage.value = 'answering'
      return
    }
    container.quizService.updateCountdownBeforeAnswer(lobbyId, timeLeftToStartAnswering.value--)
  }, UPDATE_COUNTER_INTERVAL_MS)

  container.quizService.startListeningForNewPlayers(lobbyId, (player) => {
    players.value.push(player)
  })
})
</script>

<template>
  <div>
    <div v-if="stage === 'lobby'" data-testid="lobby-stage">
      <div data-testid="lobby-id">Lobby ID: {{ lobbyId }}</div>
      <div data-testid="player" v-for="player in players" :key="player.id">
        <p data-testid="username">{{ player.username }}</p>
        <img data-testid="avatar" :src="player.image" />
      </div>
      <QrcodeVue :value="lobbyLink" data-testid="qr-code" />
      <button data-testid="initialize-quiz" @click="handleInitializeQuizButtonClick">
        initialize quiz
      </button>
    </div>
    <div v-else-if="stage === 'before-answer'" data-testid="before-answer-stage">
      <div data-testid="question-title">{{ quiz?.name }}</div>
      <div data-testid="time-left">{{ timeLeftToStartAnswering }}</div>
    </div>
    <div v-else-if="stage === 'answering'" data-testid="answering-stage">
      <div data-testid="time-left">{{ timeLeftToAnswer }}</div>
      <div data-testid="question-title">{{ quiz?.questions[0].title }}</div>
      <img :src="quiz?.questions[0].image" data-testid="question-image" />
      <div v-for="answer in quiz?.questions[0].answers" :key="answer.id" data-testid="answer">
        <div data-testid="answer-title">{{ answer.title }}</div>
      </div>
    </div>
    <div v-else-if="stage === 'statistics'" data-testid="statistics-stage"></div>
  </div>
</template>
