
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './styles/app.css';
import router from './ts/Router';
import App from './ts/Layouts/AppLayout.vue';

// Create pinia
const pinia = createPinia();

// Create vue app
const app = createApp(App);

// Use plugins and mount to container
app
	.use(router)
	.use(pinia)
	.mount('#app');