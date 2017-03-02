import Vue from 'vue'
import Router from 'vue-router'
import Tab from '@/components/Tab'
import Test from '@/components/Test'
import CreateTask from '@/components/CreateTask'
import Home from '@/components/Home'
import Me from '@/components/Me'
import SelectTask from '@/components/SelectTask'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/createTask',
      name: 'createTask',
      component: CreateTask
    },
    {
      path: '/me',
      name: 'me',
      component: Me
    },
    {
      path: '/selectTask',
      name: 'selectTask',
      component: SelectTask
    }
  ]
})
