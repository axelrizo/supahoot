<script setup lang="ts">
import { ref, inject } from 'vue'
import type { notificationProvider } from '@supahoot-web/App.vue'
import type { ServicesContainer } from '@supahoot/services/container'
import { useRouter } from 'vue-router'

const { authService } = inject('container') as ServicesContainer
const { showNotification } = inject('notificationProvider') as notificationProvider
const router = useRouter()

const secretWord = ref('')
const verifyWord = () => {
  const isValidSecretWord = authService.verifyAdminSecretWord(secretWord.value)
  if (!isValidSecretWord) return showNotification('Error: Incorrect secret word')
  router.push("/admin/init-quiz")
}
</script>

<template>
  <input v-model="secretWord" type="text" data-testid="secret-word-input" />
  <button v-on:click="verifyWord()" data-testid="verify-secret-word-button">Submit</button>
  <button data-testid="create-quiz-button">Create Quiz</button>
</template>
