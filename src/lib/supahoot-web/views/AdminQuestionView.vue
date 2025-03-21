<script setup lang="ts">
import type { Question } from '@/lib/supahoot/quizzes/question'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { timeUntilStartQuestion } = defineProps<{ timeUntilStartQuestion: number }>()

const quizId = parseInt(route.params.quizId as string)
const questionOrder = parseInt(route.params.questionOrder as string)
// const lobbyId = parseInt(route.params.lobbyId as string)

const container = inject<ServicesContainer>('container')!

const question = ref<Question | null>(null)
const hasRemainingWarmUpTime = ref(false)

onMounted(async () => {
  question.value = await container.quizService.getQuestionByQuizIdAndQuestionOrder(
    quizId,
    questionOrder,
  )

  hasRemainingWarmUpTime.value = await new Promise((resolve) => {
    setTimeout(() => resolve(true), timeUntilStartQuestion)
  })
})
</script>

<template>
  <div>
    <div v-if="question">
      <div data-testid="question-title">Question 1</div>
      <img data-testid="question-image" :src="question.image" />
    </div>
    <div v-if="!hasRemainingWarmUpTime">
      <div data-testid="time-left">1</div>
    </div>
    <div v-if="hasRemainingWarmUpTime">
      <div data-testid="question-options"></div>
    </div>
  </div>
</template>
