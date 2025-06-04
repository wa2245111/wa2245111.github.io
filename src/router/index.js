import {createRouter, createWebHashHistory} from 'vue-router'
import Layout from '../views/Layout.vue'
import Order from '../views/Order.vue'
import History from '../views/History.vue'




const routes = [
    {
        path: '/',
        name: 'layout',
        component: Layout,
        redirect: '/order',
        children: [
            {
                path: 'order',
                name: 'Order',
                component: Order
            },
            {
                path: 'history',
                name: 'History',
                component: History
            }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
