<template>
  <div id="app">
    <router-view></router-view>
    <tab></tab>
  </div>
</template>

<script>
import Vue from 'vue'
import Tab from '@/components/Tab'

Vue.component("tab", Tab)

export default {
  name: 'app'
}
</script>

<style>

html, body {
  background-color: #fafafa;
  -webkit-overflow-scrolling: touch;
  user-select: none;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
