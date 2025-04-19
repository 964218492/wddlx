import { createRouter, createWebHashHistory } from 'vue-router';
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home/home.vue')
  }
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: (to, from, savePosition) => {
    if (to.meta.KeepAlive) {
      return { top: savePosition?.top };
    }
    return { top: 0 };
  }
});
router.beforeEach((to, from, next) => {
  next();
});

router.afterEach((to, from, next) => {
  next();
});
export default router;
