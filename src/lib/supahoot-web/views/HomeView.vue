<script setup lang="ts">
import { ref } from 'vue'

const lobbyName = ref('')
</script>

<template>
  <button data-testid="create-lobby-button"></button>
  <input type="text" data-testid="lobby-name-input" v-model="lobbyName" />
  <button data-testid="lobby-submit-button"></button>
  <div data-testid="lobby-name">My Lobby</div>
</template>
