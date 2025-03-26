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
  <div class="p-4">
    <div v-if="stage === 'lobby'" data-testid="lobby-stage">
      <div class="flex items-center justify-between">
        <div data-testid="lobby-id" class="text-4xl p-2 font-bold">Lobby ID: {{ lobbyId }}</div>
        <button
          class="btn btn-primary btn-xl"
          data-testid="initialize-quiz"
          @click="handleInitializeQuizButtonClick"
        >
          Initialize quiz
        </button>
      </div>
      <div class="grid grid-cols-2 gap-4 p-4 items-center justify-items-center">
        <QrcodeVue :value="lobbyLink" :size="500" data-testid="qr-code" />
        <div class="container">
          <div
            data-testid="player"
            v-for="player in players"
            :key="player.id"
            class="flex items-center flex-col"
          >
            <img data-testid="avatar" class="w-15" :src="player.image" />
            <p data-testid="username">{{ player.username }}</p>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else-if="stage === 'before-answer'"
      data-testid="before-answer-stage"
      class="flex justify-center items-center flex-col h-screen gap-4"
    >
      <div data-testid="question-title" class="text-6xl p-2">
        {{ quiz?.questions[activeQuestion].title }}
      </div>
      <div data-testid="time-left" class="text-4xl p-2">
        Time left: {{ timeLeftToStartAnswering }}
      </div>
    </div>
    <div
      v-else-if="stage === 'answering'"
      data-testid="answering-stage"
      class="flex justify-center items-center flex-col h-screen gap-4"
    >
      <div data-testid="question-title" class="text-6xl p-2">
        {{ quiz?.questions[activeQuestion].title }}
      </div>
      <div data-testid="time-left" class="text-4xl p-2">Time left: {{ timeLeftToAnswer }}</div>
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="(answer, index) in quiz?.questions[activeQuestion].answers"
          :key="answer.id"
          data-testid="answer"
        >
          <div
            data-testid="answer-title"
            :class="[
              'w-full',
              'text-3xl',
              'h-full',
              'p-4',
              'rounded-lg',
              ['bg-primary', 'bg-secondary text-black', 'bg-accent', 'bg-info text-black'][
                index % 4
              ],
            ]"
          >
            {{ answer.title }}
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="stage === 'statistics'" data-testid="statistics-stage">
      <div data-testid="question-title" class="flex gap-8 justify-between items-center pb-16">
        <div class="text-3xl">{{ quiz?.questions[activeQuestion].title }}</div>
        <button
          v-if="showNextQuestionButton"
          data-testid="next-question"
          @click="handleNextQuestionClick"
          class="btn btn-primary btn-xl"
        >
          Next question
        </button>
        <RouterLink
          v-else
          data-testid="awards-button"
          @click="handleNextQuestionClick"
          class="btn btn-primary btn-xl"
          :to="{ name: 'admin-awards', params: { quizId, lobbyId } }"
        >
          Awards
        </RouterLink>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="(answer, index) in answerWithPlayerCount"
          :key="answer.id"
          data-testid="answer"
          :data-is-correct="answer.isCorrect"
        >
          <div
            data-testid="answer-title"
            class="w-full text-3xl h-full p-4 rounded-lg flex items-center"
            :class="[
              ['bg-primary', 'bg-secondary text-black', 'bg-accent', 'bg-info text-black'][
                index % 4
              ],
            ]"
          >
            <div data-testid="player-count" class="text-4xl font-bold pr-8 pl-2">
              {{ answer.playerCount || 0 }}
            </div>
            {{ answer.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.container {
  display: grid;
  grid-gap: 35;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}
</style>
