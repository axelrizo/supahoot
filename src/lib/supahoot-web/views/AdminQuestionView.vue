<script setup lang="ts">
import type { Question } from '@/lib/supahoot/quizzes/question'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const INITIAL_COUNTDOWN_VALUE_IN_S = 10

const route = useRoute()

const quizId = parseInt(route.params.quizId as string)
const questionOrder = parseInt(route.params.questionOrder as string)
const lobbyId = parseInt(route.params.lobbyId as string)

const container = inject<ServicesContainer>('container')!

const question = ref<Question | null>(null)
const countdown = ref(INITIAL_COUNTDOWN_VALUE_IN_S)

onMounted(async () => {
  question.value = await container.quizService.getQuestionByQuizIdAndQuestionOrder(
    quizId,
    questionOrder,
  )

  container.quizService.listenCountdown(lobbyId, (count: number) => {
    countdown.value = count
  })
})
</script>

<template>
  <div>
    <div v-if="question">
      <div data-testid="question-title">Question 1</div>
      <img v-if="countdown === 0" data-testid="question-image" :src="question.image" />
    </div>
    <div v-if="countdown > 0">
      <div data-testid="time-left">{{ countdown }}</div>
    </div>
    <div v-if="countdown === 0 && question">
      <div data-testid="question-options"></div>
    </div>
  </div>
</template>
