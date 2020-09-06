import Vue from 'vue';
import Router from 'vue-router';
import Index from '@/components/Index';
import MyDialog from '@/components/MyDialog';

Vue.use(Router);

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
    },
    {
      path: '/myDialog',
      name: 'myDialog',
      component: MyDialog,
    },
  ],
});
