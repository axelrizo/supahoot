import '@/assets/main.css'

import App from '@supahoot-web/App.vue'
import { notificationProvider } from '@supahoot-web/providers/notification-provider'
import router from '@supahoot-web/router'
import { container } from '@supahoot/services/container'
import { createApp } from 'vue'

const app = createApp(App)

app
  .use(router)
  .provide('container', container)
  .provide('notificationProvider', notificationProvider)

app.mount('#app')
