import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router';
import Index from './components/Index.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {path: '/index', name: 'index', component: Index},
    {
      path: '/myDialog/:id/:v', name: 'myDialog', component: () => import('./components/MyDialog.vue'),
      props: (router) => ({id: router.params.id}),
    },
  ],
});

export default router;
