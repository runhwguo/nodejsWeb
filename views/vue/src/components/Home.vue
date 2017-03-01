<template>
   <div class="page-swipe">
    <mt-swipe :auto="4000" v-for="item in items">
      <mt-swipe-item class="slide1">{{ item.value }}</mt-swipe-item>
    </mt-swipe>
   </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      items: [{slide1: 1}, {slide2: 2}, {slide3: 3}]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mint-swipe {
  height: 200px;
  color: #fff;
  font-size: 30px;
  text-align: center;
  margin-bottom: 20px;
}
.mt-swipe-item{
  height: 200px;
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
