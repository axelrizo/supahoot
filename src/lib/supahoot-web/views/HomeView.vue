<script setup lang="ts">
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { inject, ref } from 'vue'
import type { notificationProvider } from '@supahoot-web/App.vue'

const { lobbyService } = inject('container') as ServicesContainer
const { showNotification } = inject('notificationProvider') as notificationProvider

const lobbyName = ref('')
const isFormVisible = ref(false)
const lobbies = ref<string[]>([])

const createLobby = async () => {
  try {
    await lobbyService.create({ name: lobbyName.value })
    lobbies.value.push(lobbyName.value)
    isFormVisible.value = false
  } catch (_error) {
    showNotification('Error: Lobby creation failed')
  }
}
const openCreateLobbyModal = () => {
  isFormVisible.value = true
}
</script>

<template>
  <button data-testid="create-lobby-button" v-on:click="openCreateLobbyModal">Create Lobby</button>

  <div data-testid="lobby-create-modal" :class="{ hidden: !isFormVisible }">
    <form data-testid="lobby-form" v-on:submit.prevent="createLobby">
      <input type="text" data-testid="lobby-name-input" v-model="lobbyName" />
      <input type="submit" value="Submit" />
    </form>
  </div>

  <div>
    <div v-for="(lobby, index) in lobbies" :key="index" data-testid="lobby-card">{{ lobby }}</div>
  </div>
</template>
