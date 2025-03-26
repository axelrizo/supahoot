<script setup lang="ts">
import type { Player } from '@/lib/supahoot/quizzes/player'
import type { QuizWithQuestionsWithAnswers } from '@/lib/supahoot/quizzes/quiz'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import type { NotificationProvider } from '@supahoot-web/providers/notification-provider'
import QrcodeVue from 'qrcode.vue'
import { computed, inject, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const UPDATE_COUNTER_INTERVAL_MS = 1000
const DEFAULT_TIMER_BEFORE_ANSWERING_IN_S = 10
const DEFAULT_ANSWER_TIMER_IN_S = 20

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
const answersPlayerCount = ref<{ answerId: number; playerCount: number }[] | null>(null)
const activeQuestion = ref(0)

const timeLeftToStartAnswering = ref(timeToStartAnswering || DEFAULT_TIMER_BEFORE_ANSWERING_IN_S)
const timeLeftToAnswer = ref(timeToAnswer || DEFAULT_ANSWER_TIMER_IN_S)

const answerWithPlayerCount = computed(() => {
  if (!quiz.value || stage.value !== 'statistics') return []

  return quiz.value.questions[activeQuestion.value].answers.map((answer) => {
    return {
      ...answer,
      playerCount: answersPlayerCount.value?.find(
        (currentAnswer) => currentAnswer.answerId === answer.id,
      )?.playerCount,
    }
  })
})

const showNextQuestionButton = computed(
  () => activeQuestion.value < quiz.value!.questions.length - 1,
)

const startAnsweringCountdown = () => {
  const interval = setInterval(() => {
    if (timeLeftToAnswer.value === 0) {
      clearInterval(interval)
      stage.value = 'statistics'

      container.quizService
        .getPlayerCountPerAnswerInQuestionByLobbyIdAndQuestionId(
          lobbyId,
          quiz.value!.questions[activeQuestion.value].id,
        )
        .then((currentAnswersPlayerCount) => {
          answersPlayerCount.value = currentAnswersPlayerCount
        })
      return
    }

    container.quizService.updateAnsweringCountdown(lobbyId, timeLeftToAnswer.value--)
  }, UPDATE_COUNTER_INTERVAL_MS)
}

const startBeforeAnsweringCountdown = () => {
  const interval = setInterval(() => {
    if (timeLeftToStartAnswering.value === 0) {
      startAnsweringCountdown()
      clearInterval(interval)
      stage.value = 'answering'
      return
    }

    container.quizService.updateCountdownBeforeAnswer(lobbyId, timeLeftToStartAnswering.value--)
  }, UPDATE_COUNTER_INTERVAL_MS)
}

const handleInitializeQuizButtonClick = async () => {
  try {
    await container.quizService.startQuiz(lobbyId)
    await container.quizService.stopListeningForNewPlayers(lobbyId)
    stage.value = 'before-answer'
    container.quizService.sendQuestion(lobbyId, quiz.value!.questions[activeQuestion.value])
    startBeforeAnsweringCountdown()
  } catch (error) {
    if (error instanceof Error) {
      notificationProvider.showNotification('Error: ' + error.message)
    }
  }
}

const handleNextQuestionClick = async () => {
  activeQuestion.value++
  container.quizService.sendQuestion(lobbyId, quiz.value!.questions[activeQuestion.value])
  stage.value = 'before-answer'
  timeLeftToStartAnswering.value = timeToStartAnswering || DEFAULT_TIMER_BEFORE_ANSWERING_IN_S
  timeLeftToAnswer.value = timeToAnswer || DEFAULT_ANSWER_TIMER_IN_S
  startBeforeAnsweringCountdown()
}

onMounted(async () => {
  container.quizService.startListeningForNewPlayers(lobbyId, (player) => {
    players.value.push(player)
  })
  players.value = await container.quizService.getPlayersByLobby(lobbyId)
  quiz.value = await container.quizService.getQuizWithQuestionsAndAnswersByQuizId(quizId)
})
</script>

<template>
  <div>
    <div v-if="stage === 'lobby'" data-testid="lobby-stage">
      <div data-testid="lobby-id">Lobby ID: {{ lobbyId }}</div>
      <QrcodeVue :value="lobbyLink" data-testid="qr-code" />
      <p>{{ lobbyLink }}</p>
      <button data-testid="initialize-quiz" @click="handleInitializeQuizButtonClick">
        initialize quiz
      </button>
      <div data-testid="player" v-for="player in players" :key="player.id">
        <p data-testid="username">{{ player.username }}</p>
        <img data-testid="avatar" :src="player.image" />
      </div>
    </div>
    <div v-else-if="stage === 'before-answer'" data-testid="before-answer-stage">
      <div data-testid="question-title">{{ quiz?.questions[activeQuestion].title }}</div>
      <div data-testid="time-left">{{ timeLeftToStartAnswering }}</div>
    </div>
    <div v-else-if="stage === 'answering'" data-testid="answering-stage">
      <div data-testid="time-left">{{ timeLeftToAnswer }}</div>
      <div data-testid="question-title">{{ quiz?.questions[activeQuestion].title }}</div>
      <img :src="quiz?.questions[activeQuestion].image" data-testid="question-image" />
      <div
        v-for="answer in quiz?.questions[activeQuestion].answers"
        :key="answer.id"
        data-testid="answer"
      >
        <div data-testid="answer-title">{{ answer.title }}</div>
      </div>
    </div>
    <div v-else-if="stage === 'statistics'" data-testid="statistics-stage">
      <div data-testid="question-title">{{ quiz?.questions[activeQuestion].title }}</div>
      <div
        v-for="answer in answerWithPlayerCount"
        :key="answer.id"
        data-testid="answer"
        :data-is-correct="answer.isCorrect"
      >
        <div data-testid="title">{{ answer.title }}</div>
        <div data-testid="player-count">{{ answer.playerCount || 0 }}</div>
      </div>
      <button
        v-if="showNextQuestionButton"
        data-testid="next-question"
        @click="handleNextQuestionClick"
      >
        next question
      </button>
      <RouterLink
        v-else
        data-testid="awards-button"
        @click="handleNextQuestionClick"
        :to="{ name: 'admin-awards', params: { quizId, lobbyId } }"
      >
        awards
      </RouterLink>
    </div>
  </div>
</template>
