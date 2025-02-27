import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './styles/app.css';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import router from './ts/Router';
import App from './ts/Layouts/AppLayout.vue';

// Create pinia
const pinia = createPinia();

// Setup toast options
const options = {
	transition: 'Vue-Toastification__fade',
	maxToasts: 5,
	position: 'bottom-right',
	timeout: 5000,
	container: document.querySelector('#app'),
	pauseOnFocusLoss: true,
	pauseOnHover: true,
	closeOnClick: true,
	closeButton: 'button',
	icon: false,
	newestOnTop: true,
	draggable: true,
	draggablePercent: 0.6,
	showCloseButtonOnHover: false,
	rtl: false
};

// Create vue app
const app = createApp(App);

// Use plugins and mount to container
app.use(router).use(pinia).use(Toast, options).mount('#app');
