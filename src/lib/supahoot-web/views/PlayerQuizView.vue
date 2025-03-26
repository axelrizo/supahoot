<script setup lang="ts">
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { inject, onMounted, ref } from 'vue'
import type { PlayerProvider } from '../providers/player-provider'
import { useRoute } from 'vue-router'
import type { QuestionWithAnswers } from '@/lib/supahoot/quizzes/question'

const route = useRoute()
const lobbyId = parseInt(route.params.lobbyId as string)

const playerProvider = inject<PlayerProvider>('playerProvider')!
const container = inject<ServicesContainer>('container')!

const question = ref<null | QuestionWithAnswers>(null)
const timeLeftBeforeAnswer = ref(0)
const timeLeftAnswering = ref(0)
const stage = ref<'before-answer' | 'answering' | 'player-points'>('before-answer')
const playerPoints = ref(0)
const currentAnswerPoints = ref(0)

const handleAnswerButton = async (answerId: number) => {
  stage.value = 'player-points'

  if (!question.value) return

  const response = await container.quizService.sendAnswer(
    lobbyId,
    playerProvider.player!.id,
    question.value.id,
    answerId,
  )

  if (!response) return

  currentAnswerPoints.value = response.points
  playerPoints.value = response.points + playerPoints.value
}

onMounted(() => {
  container.quizService.listenQuestion(lobbyId, (currentQuestion) => {
    question.value = currentQuestion
    stage.value = 'before-answer'
    currentAnswerPoints.value = 0
  })
  container.quizService.listenUpdateCountdownBeforeAnswer(lobbyId, (timeLeft) => {
    timeLeftBeforeAnswer.value = timeLeft
    if (timeLeft === 0) stage.value = 'answering'
  })
  container.quizService.listenUpdateAnsweringCountdown(lobbyId, (timeLeft) => {
    timeLeftAnswering.value = timeLeft
    if (timeLeft === 0) stage.value = 'player-points'
  })
})
</script>

<template>
  <div>
    <div data-testid="player-section">
      <div data-testid="username">{{ playerProvider.player?.username }}</div>
      <img data-testid="image" :src="playerProvider.player?.image" width="50" />
      <div data-testid="points">{{ playerPoints }}</div>
    </div>
    <div data-testid="before-answer-stage" v-if="stage === 'before-answer'">
      <div data-testid="question-title">{{ question?.title }}</div>
      <div data-testid="time-left">{{ timeLeftBeforeAnswer }}</div>
    </div>
    <div data-testid="answering-stage" v-else-if="stage === 'answering'">
      <div data-testid="time-left">{{ timeLeftAnswering }}</div>
      <div data-testid="question-title">{{ question?.title }}</div>
      <div data-testid="answer" v-for="answer in question?.answers" :key="answer.id">
        <button data-testid="answer-button" @click="handleAnswerButton(answer.id)">
          {{ answer.title }}
        </button>
      </div>
    </div>
    <div data-testid="player-points-stage" v-else-if="stage === 'player-points'">
      <div data-testid="points">{{ currentAnswerPoints }}</div>
    </div>
  </div>
</template>
