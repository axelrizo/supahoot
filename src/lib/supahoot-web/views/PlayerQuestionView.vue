<script setup lang="ts">
import type { Answer } from '@/lib/supahoot/quizzes/answer'
import type { PlayerAnswer } from '@/lib/supahoot/quizzes/player-answer'
import type { Question } from '@/lib/supahoot/quizzes/question'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { computed, inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { PlayerProvider } from '../providers/player-provider'

const COUNT_DUMMY_TIME_IN_S = 10

const route = useRoute()

const lobbyId = parseInt(route.params.lobbyId as string)

const container = inject<ServicesContainer>('container')!
const { player } = inject<PlayerProvider>('playerProvider')!

const countdown = ref(COUNT_DUMMY_TIME_IN_S)
const question = ref<Question | null>(null)
const playerAnswer = ref<Answer | null>(null)
const points = ref(0)

const isCountdown = computed(() => countdown.value > 0)
const isAnswering = computed(() => countdown.value === 0 && !playerAnswer.value)
const showedResultText = computed(() => (playerAnswer.value?.is_correct ? 'Correct' : 'Incorrect'))

const handleAnswerClick = async (answer: Answer) => {
  await container.quizService.sendAnswer(lobbyId, player!.id, answer.id)
  playerAnswer.value = answer
}

const restartState = () => {
  playerAnswer.value = null
  question.value = null
  points.value = 0
}

onMounted(() => {
  container.quizService.listenCountdown(lobbyId, (timeLeft) => {
    restartState()
    countdown.value = timeLeft
  })

  container.quizService.listenQuestion(lobbyId, (currentQuestion) => {
    question.value = currentQuestion
  })

  container.quizService.listenPlayerQuestionPoints(
    lobbyId,
    player!.id,
    (playerAnswer: PlayerAnswer) => {
      points.value = playerAnswer.points
    },
  )
})
</script>

<template>
  <div>
    <div v-if="isCountdown">
      <div data-testid="time-left">{{ countdown }}</div>
    </div>
    <div v-if="isAnswering && question">
      <button
        v-for="answer in question.answers"
        :key="answer.id"
        data-testid="answer-button"
        @click="handleAnswerClick(answer)"
      ></button>
    </div>
    <div v-if="playerAnswer">
      <div data-testid="correct-answer">{{ showedResultText }}</div>
      <div data-testid="points">{{ points }}</div>
    </div>
    <div v-if="player">
      <div data-testid="username">{{ player.username }}</div>
      <img data-testid="image" :src="player.image" />
    </div>
  </div>
</template>
