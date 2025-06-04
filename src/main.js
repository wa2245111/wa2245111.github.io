import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import {Toast} from 'vant'
import 'vant/lib/index.css';

const app = createApp(App)
app.use(router)
app.use(Toast)
app.mount('#app')
