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
    <div
      data-testid="player-section"
      class="flex items-center justify-between px-4 fixed w-screen bottom-0 text-black bg-white h-12"
    >
      <div class="flex items-center gap-4">
        <img data-testid="image" :src="playerProvider.player?.image" class="aspect-square w-10" />
        <div data-testid="username" class="text-2xl truncate w-48">
          {{ playerProvider.player?.username }}
        </div>
      </div>
      <div data-testid="points" class="bg-gray-800 text-white px-4 rounded-field">
        {{ playerPoints }}
      </div>
    </div>
    <div
      data-testid="before-answer-stage"
      v-if="stage === 'before-answer'"
      class="h-screen flex flex-col items-center justify-center gap-4"
    >
      <div data-testid="question-title" class="text-3xl font-black">{{ question?.title }}</div>
      <div data-testid="time-left" class="text-xl">{{ timeLeftBeforeAnswer }}</div>
    </div>
    <div
      data-testid="answering-stage"
      v-else-if="stage === 'answering'"
      class="h-screen flex flex-col items-center justify-center gap-4"
    >
      <div data-testid="question-title" class="text-3xl font-black">{{ question?.title }}</div>
      <div data-testid="time-left" class="text-xl">{{ timeLeftAnswering }}</div>
      <div
        class="flex flex-col gap-2 w-full px-2"
        data-testid="answer"
        v-for="(answer, index) in question?.answers"
        :key="answer.id"
      >
        <button
          data-testid="answer-button"
          @click="handleAnswerButton(answer.id)"
          class="p-3 rounded-lg text-lg"
          :class="
            ['bg-primary', 'bg-secondary text-black', 'bg-accent text-black', 'bg-info text-black'][
              index % 4
            ]
          "
        >
          {{ answer.title }}
        </button>
      </div>
    </div>
    <div
      data-testid="player-points-stage"
      v-else-if="stage === 'player-points'"
      class="flex flex-col h-screen items-center justify-center gap-4"
    >
      <div class="text-2xl font-black">You've obtained</div>
      <div data-testid="points" class="text-5xl">{{ currentAnswerPoints }}</div>
      <div class="text-2xl font-black">points!</div>
    </div>
  </div>
</template>
