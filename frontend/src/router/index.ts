// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import ChatPage from '@/views/ChatPage.vue';
import HomePage from '@/views/HomePage.vue';
const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/chat',
    name: 'ChatPage',
    component: ChatPage
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
