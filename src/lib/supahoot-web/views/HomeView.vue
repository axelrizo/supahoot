<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const lobbyId = ref('')

const handleSubmitForm = async () => {
  await router.push({ name: 'player-lobby', params: { lobbyId: lobbyId.value } })
}
</script>

<template>
  <div>
    <form data-testid="join-lobby-form" @submit="handleSubmitForm">
      <input type="text" data-testid="join-lobby-input" v-model="lobbyId" />
    </form>
  </div>
</template>
