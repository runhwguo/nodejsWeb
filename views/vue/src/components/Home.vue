<template>
  <swipe class="my-swipe">
  <swipe-item class="slide1"><img src="../assets/logo.png" alt=""></swipe-item>
  <swipe-item class="slide2"><img src="../assets/logo.png" alt=""></swipe-item>
  <swipe-item class="slide3"><img src="../assets/logo.png" alt=""></swipe-item>
</swipe>
</template>


<script>

import Vue from 'vue';
import { Swipe, SwipeItem } from 'vue-swipe';
Vue.component('swipe', Swipe);
Vue.component('swipe-item', SwipeItem);

export default {
    name: "home",
    data() {
        return {}
    }
}
</script>
<style>
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