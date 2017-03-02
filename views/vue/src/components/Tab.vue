<template>
  <div>
    <mt-tabbar v-model="selected">
      <mt-tab-item id="tab1">
        <img slot="icon" src="../assets/100x100.png">
        首页
      </mt-tab-item>
      <mt-tab-item id="tab2">
        <img slot="icon" src="../assets/100x100.png">
        创建任务
      </mt-tab-item>
      <mt-tab-item id="tab3">
        <img slot="icon" src="../assets/100x100.png">
        我的
      </mt-tab-item>
    </mt-tabbar>
    </div>
</template>

<script>
import Vue from 'vue'
import { Tabbar, TabItem } from 'mint-ui'
import router from '../router/index'

Vue.component(Tabbar.name, Tabbar);
Vue.component(TabItem.name, TabItem);

export default {
  name: "home",
  data() {
    return {
      selected: ""
    }
  },
  watch: {
    selected: function (){
      if(this.selected=="tab1"){
        router.push('/')
      }else if(this.selected=="tab2"){
        router.push('/createTask')
      }else{
        router.push('/me')
      }
    }
  },
  methods: {
  }
}
</script>