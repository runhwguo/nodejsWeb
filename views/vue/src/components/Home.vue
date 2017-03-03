<template>
<div>
  <swipe class="my-swipe">
    <swipe-item class="slide1"><img src="../assets/logo.png" alt=""></swipe-item>
    <swipe-item class="slide2"><img src="../assets/logo.png" alt=""></swipe-item>
    <swipe-item class="slide3"><img src="../assets/logo.png" alt=""></swipe-item>
  </swipe>

  <mt-search placeholder="搜索"></mt-search>

  <div class="topDistance" v-for="item in 4">
    <mt-cell title="[代取]第二食堂" label="[悬赏]15元" >
      <mt-button type="primary" size="small">接单</mt-button>
      <mt-button type="default" size="small">置顶</mt-button>
    </mt-cell>
  </div>
</div>
</template>


<script>

import Vue from 'vue';
import { Swipe, SwipeItem } from 'vue-swipe';
import { Button, Search } from 'mint-ui'

Vue.component('swipe', Swipe);
Vue.component('swipe-item', SwipeItem);
Vue.component(Search.name, Search);

export default {
    name: "home",
    data() {
        return {}
    }
}
</script>
<style>

.topDistance{
  margin-top: 20px
}
.mint-search{
  height: 100%
}

.my-swipe {
  height: 200px;
  color: #fff;
  font-size: 30px;
  text-align: center;
}

.slide1 {
  background-color: #0089dc;
  color: #fff;
}

.slide2 {
  background-color: #ffd705;
  color: #000;
}

.slide3 {
  background-color: #ff2d4b;
  color: #fff;
}
</style>