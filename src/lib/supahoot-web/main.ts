import '@/assets/main.css'

import { createApp } from 'vue'
import App from '@supahoot-web/App.vue'
import router from '@supahoot-web/router'

const app = createApp(App)

app.use(router)

app.mount('#app')
