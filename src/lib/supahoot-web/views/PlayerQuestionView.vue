<script setup lang="ts">
import type { Answer } from '@/lib/supahoot/quizzes/answer'
import type { Question } from '@/lib/supahoot/quizzes/question'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { computed, inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const lobbyId = parseInt(route.params.lobbyId as string)

const container = inject<ServicesContainer>('container')!

const countdown = ref(10)
const question = ref<Question | null>(null)
const playerAnswer = ref<Answer | null>(null)
const points = ref(0)

const isCountdown = computed(() => countdown.value > 0)
const isAnswering = computed(() => countdown.value === 0 && !playerAnswer.value)
const showedResultText = computed(() => (playerAnswer.value?.is_correct ? 'Correct' : 'Incorrect'))

const handleAnswerClick = async (answer: Answer) => {
  const { points: currentPoints } = await container.quizService.sendAnswer(lobbyId, answer.id)
  playerAnswer.value = answer
  points.value = currentPoints
}

onMounted(() => {
  container.quizService.listenCountdown(lobbyId, (timeLeft) => {
    playerAnswer.value = null
    countdown.value = timeLeft
  })

  container.quizService.listenQuestion(lobbyId, (currentQuestion) => {
    question.value = currentQuestion
  })
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
  </div>
</template>
