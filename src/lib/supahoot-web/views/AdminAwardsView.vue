<script setup lang="ts">
import type { PlayerWithPoints } from '@/lib/supahoot/quizzes/player'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { computed, inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const lobbyId = parseInt(route.params.lobbyId as string)

const container = <ServicesContainer>inject('container')

const dashboard = ref<null | PlayerWithPoints[]>(null)

const sortedDashboard = computed(() => {
  if (!dashboard.value) return []

  const awardsCopy = JSON.parse(JSON.stringify(dashboard.value)) as PlayerWithPoints[]

  return awardsCopy.sort?.((a, b) => b.points - a.points)
})

onMounted(async () => {
  dashboard.value = await container.quizService.getAwardsDashboard(lobbyId)
})
</script>

<template>
  <div class="text-3xl font-bold text-center p-4">Awards</div>
  <div class="flex flex-col items-center gap-3 pb-8">
    <div
      data-testid="place"
      v-for="player in sortedDashboard"
      :key="player.id"
      class="flex border border-accent items-center p-4 rounded-2xl w-xl"
    >
      <img :src="player.image" data-testid="avatar" class="w-8" />
      <div class="text-lg font-bold px-4">{{ player.points }}</div>
      <div class="w-full"></div>
      <div>{{ player.username }}</div>
    </div>
  </div>
</template>
