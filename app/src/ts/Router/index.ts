import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../Pages/Home.vue';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'home_page',
		component: Home
	},
	{
		path: '/:catchAll(.*)',
		redirect: '/'
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes
});

export default router;
