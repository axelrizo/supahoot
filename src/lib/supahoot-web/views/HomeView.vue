<script setup lang="ts">
import type { LobbyService } from '@supahoot/services/lobby-service'
import { inject, ref } from 'vue'

const { lobbyService } = inject('container') as { lobbyService: LobbyService }

const lobbyName = ref('')

const createLobby = () => {
  lobbyService.create()
}
</script>

<template>
  <button data-testid="create-lobby-button"></button>
  <form data-testid="lobby-form" v-on:submit="createLobby">
    <input type="text" data-testid="lobby-name-input" v-model="lobbyName" />
    <input type="submit" />
  </form>
  <div data-testid="lobby-name">My Lobby</div>
</template>
