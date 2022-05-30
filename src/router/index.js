import { createRouter, createWebHashHistory } from 'vue-router'
// import Home from '../page/About'
// import About from '../page/Home'

// 路由懒加载
const Home = () => import(/* webpackChunkName: 'home' */'../page/Home')
const About = () => import(/* webpackChunkName: 'about' */'../page/About')

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: Home
  },
  {
    path: '/about',
    component: About
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})
export default router