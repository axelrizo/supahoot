<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import type { ServicesContainer } from '@supahoot/services/container'
import type { Quiz } from '@supahoot/quizzes/quiz'

const { quizService } = inject('container') as ServicesContainer

const quizzes = ref<Quiz[]>([])

onMounted(async () => {
  console.log(await quizService.getQuizzes());
  quizzes.value = await quizService.getQuizzes()

})
</script>

<template>
  <div v-for="quiz in quizzes" :key="quiz.id" data-testid="quiz-title">
    {{ quiz.name }}
  </div>
</template>
