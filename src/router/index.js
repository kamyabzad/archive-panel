import { createRouter, createWebHashHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout'

const routes = [
  {
    path: '/',
    name: 'خانه',
    component: DefaultLayout,
    redirect: '/files',
    children: [
      {
        path: '/files',
        name: 'پرونده‌ها',
        component: () => import('@/views/Files.vue'),
      },
      {
        path: '/orders-away',
        name: 'پرونده های خارج شده',
        component: () => import('@/views/Orders.vue'),
      },
      {
        path: 'orders-all',
        name: 'گزارش های خروج',
        component: () => import('@/views/AllOrders.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

export default router
