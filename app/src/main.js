import { createApp } from 'vue';
import './styles/app.css';
import router from '@js/Router';
import App from '@js/Layouts/AppLayout.vue';

const app = createApp(App);
app.use(router).mount('#app');
