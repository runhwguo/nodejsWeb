import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Test from '@/components/Test'
import CreateTask from '@/components/CreateTask'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'CreateTask',
      component: CreateTask
    }
  ]
})
