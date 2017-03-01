<template>
  <div>
    <mt-tabbar v-model="selected">
      <mt-tab-item id="tab1">
        <img slot="icon" src="../assets/100x100.png">
        <router-link to="/">首页</router-link>
      </mt-tab-item>
      <mt-tab-item id="tab2">
        <img slot="icon" src="../assets/100x100.png">
        <router-link to="/createTask">创建任务</router-link>
      </mt-tab-item>
      <mt-tab-item id="tab3">
        <img slot="icon" src="../assets/100x100.png">
        <router-link to="/me">我的</router-link>
      </mt-tab-item>
    </mt-tabbar>
    </div>
</template>

<script>
import Vue from 'vue'
import { Tabbar, TabItem } from 'mint-ui'

Vue.component(Tabbar.name, Tabbar);
Vue.component(TabItem.name, TabItem);

export default {
  name: "home",
  data() {
    return {
      selected: ""
    }
  }
}
</script>