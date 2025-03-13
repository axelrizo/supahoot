<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const lobbyId = route.params.lobbyId

const lobbyNamedRoute = { name: 'user-lobby', params: { lobbyId: lobbyId } };
const link = router.resolve(lobbyNamedRoute).fullPath
</script>

<template>
  <div data-testid="lobby-id">
    Lobby ID: {{ lobbyId }}
  </div>
  <QrcodeVue :value="link" data-testid="qr-code" />
</template>
