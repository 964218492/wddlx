import { createApp } from 'vue'
import Router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import App from './App.vue';
import '@/assets/css/index.scss';

const app = createApp(App)
app.use(Router);
const store = createPinia();
store.use(piniaPluginPersistedstate);
app.use(store);
app.mount('#app')
