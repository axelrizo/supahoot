<script setup lang="ts">
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import type { PlayerProvider } from '@supahoot-web/providers/player-provider'
import type { Question } from '@supahoot/quizzes/question'
import { inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const UPDATE_COUNTER_INTERVAL_MS = 1000

const { initialTimeLeftToStart, initialTimeLeftToAnswer } = defineProps({
  initialTimeLeftToStart: {
    type: Number,
    required: false,
    default: () => {
      const COUNTDOWN_IN_S = 10
      return COUNTDOWN_IN_S
    },
  },
  initialTimeLeftToAnswer: {
    type: Number,
    required: false,
    default: () => {
      const COUNTDOWN_IN_S = 10
      return COUNTDOWN_IN_S
    },
  },
})

const route = useRoute()

const quizId = parseInt(route.params.quizId as string)
const questionOrder = parseInt(route.params.questionOrder as string)
const lobbyId = parseInt(route.params.lobbyId as string)

const container = inject<ServicesContainer>('container')!
const { player } = inject<PlayerProvider>('playerProvider')!

const question = ref<Question | null>(null)
const timeLeftToStart = ref(initialTimeLeftToStart)
const timeLeftToAnswer = ref(initialTimeLeftToAnswer)
const playerScore = ref(0)

onMounted(async () => {
  container.quizService.listenPlayerQuestionPoints(lobbyId, player!.id, ({ points }) => {
    playerScore.value = points + playerScore.value
  })

  question.value = await container.quizService.getQuestionByQuizIdAndQuestionOrder(
    quizId,
    questionOrder,
  )

  const beforeQuestionCountdownInterval = setInterval(() => {
    if (timeLeftToStart.value === 0) {
      startAnswerQuestionsInterval()
      clearInterval(beforeQuestionCountdownInterval)
      container.quizService.sendQuestion(lobbyId, question.value!)
      return
    }

    container.quizService.updateCountdownBeforeQuestionStart(lobbyId, timeLeftToStart.value--)
  }, UPDATE_COUNTER_INTERVAL_MS)

  const startAnswerQuestionsInterval = () => {
    const timeLeftToAnswerCountdownInterval = setInterval(() => {
      if (timeLeftToAnswer.value === 0) {
        clearInterval(timeLeftToAnswerCountdownInterval)
        return
      }

      container.quizService.updateStartAnswerQuestionCountdown(lobbyId, timeLeftToAnswer.value--)
    }, UPDATE_COUNTER_INTERVAL_MS)
  }
})
</script>

<template>
  <div>
    <div v-if="!question" data-testid="loading"></div>
    <div v-else-if="timeLeftToStart > 0" data-testid="before-question">
      <div data-testid="time-left">{{ timeLeftToStart }}</div>
      <div data-testid="question-title">{{ question.title }}</div>
    </div>
    <div v-else-if="timeLeftToAnswer === 0" data-testid="statistics"></div>
    <div v-else data-testid="started-question">
      <div data-testid="time-to-answer">{{ timeLeftToAnswer }}</div>
      <div data-testid="question-title">{{ question.title }}</div>
      <img data-testid="question-image" :src="question.image" />
      <div v-for="answer in question.answers" :key="answer.id" data-testid="answer">
        <div data-testid="answer-title">{{ answer.title }}</div>
      </div>
    </div>
    <div v-if="player">
      <div data-testid="player-username">{{ player.username }}</div>
      <img data-testid="player-image" :src="player.image" />
      <div data-testid="player-score">{{ playerScore }}</div>
    </div>
  </div>
</template>
