
import { createApp } from 'vue';
import './styles/app.css';
import router from './ts/Router';
import App from './ts/Layouts/AppLayout.vue';

const app = createApp(App);
app.use(router).mount('#app');