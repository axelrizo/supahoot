<script setup lang="ts">
import type { Question } from '@/lib/supahoot/quizzes/question'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const UPDATE_COUNTER_INTERVAL_MS = 1000

const { countdownTimeInS } = defineProps({
  countdownTimeInS: {
    type: Number,
    required: false,
    default: () => {
      const INITIAL_COUNTDOWN_VALUE_IN_S = 10
      return INITIAL_COUNTDOWN_VALUE_IN_S
    },
  },
})

const route = useRoute()

const quizId = parseInt(route.params.quizId as string)
const questionOrder = parseInt(route.params.questionOrder as string)
const lobbyId = parseInt(route.params.lobbyId as string)

const container = inject<ServicesContainer>('container')!

const question = ref<Question | null>(null)
const countdown = ref(countdownTimeInS)

onMounted(async () => {
  question.value = await container.quizService.getQuestionByQuizIdAndQuestionOrder(
    quizId,
    questionOrder,
  )

  const countdownInterval = setInterval(updateCountdown, UPDATE_COUNTER_INTERVAL_MS)

  function updateCountdown() {
    if (countdown.value === 0) {
      clearInterval(countdownInterval)
      return
    }

    container.quizService.updateCountdown(lobbyId, countdown.value--)
  }
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
      <div data-testid="question-answers">
        <div v-for="answer in question.answers" :key="answer.id">
          <div data-testid="answer-title">{{ answer.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
