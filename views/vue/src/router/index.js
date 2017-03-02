import Vue from 'vue'
import Router from 'vue-router'
import Tab from '@/components/Tab'
import Test from '@/components/Test'
import CreateTask from '@/components/CreateTask'
import Home from '@/components/Home'
import Me from '@/components/Me'
import SelectTask from '@/components/SelectTask'
import UnfinishedTask from '@/components/UnfinishedTask'
import FinishedTask from '@/components/FinishedTask'

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
    },
    {
      path: '/unfinishedTask',
      name: 'unfinishedTask',
      component: UnfinishedTask
    },
    {
      path: '/FinishedTask',
      name: 'FinishedTask',
      component: FinishedTask
    }
  ]
})
