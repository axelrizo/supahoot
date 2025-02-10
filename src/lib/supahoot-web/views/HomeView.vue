<script setup lang="ts">
import type { LobbyService } from '@supahoot/services/lobby-service'
import { inject, ref } from 'vue'

const { lobbyService } = inject('container') as { lobbyService: LobbyService }

const lobbyName = ref('')
const isFormVisible = ref(false)
const lobbies = ref<null[]>([])

const createLobby = () => {
  lobbyService.create()
  lobbies.value.push(null)
}
const openCreateLobbyModal = () => {
  isFormVisible.value = true
}
</script>

<template>
  <button data-testid="create-lobby-button" v-on:click="openCreateLobbyModal">a</button>

  <div data-testid="lobby-create-modal" :class="{ hidden: !isFormVisible }">
    <form data-testid="lobby-form" v-on:submit="createLobby">
      <input type="text" data-testid="lobby-name-input" v-model="lobbyName" />
      <input type="submit" />
    </form>
  </div>

  <div>
    <div v-for="(lobby, index) in lobbies" :key="index" data-testid="lobby-card">My Lobby</div>
  </div>
</template>
