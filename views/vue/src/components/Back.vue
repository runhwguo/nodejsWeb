<template>
    <mt-button type="primary" class="backBtn" v-on:click="backTo">返回</mt-button>
</template>


<script>
    import Vue from 'vue'
    import { Button } from 'mint-ui'
    import router from '../router/index'


    export default {
        name: "back",
        methods: {
            backTo: function(){
                router.go(-1)
            }
        }
    }
</script>


<style lang="css">
    .backBtn{
        position: fixed;
        top: 15px;
        left: 15px;
    }
</style>