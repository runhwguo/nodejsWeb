<template>
    <div>
        <back></back>
        <mt-radio title="选择任务" v-model="value1" :options="options"
        @click.native="confirmTask">
        </mt-radio>
    </div>
</template>


<script>

import Vue from 'vue'
import { Raido } from 'mint-ui'
import { bus } from '../share.js'
import router from '../router/index'
import back from './Back'

Vue.component("mt-radio", Raido)

export default {
    name: "selectTask",
    data() {
        return {
            value1: ""
        }
    },
    created() {
        this.options = [
            {label: '代课', value: 'dk'},
            {label: '代取', value: 'dk'},
            {label: '顺风车', value: 'dk'},
            {label: '借东西', value: 'dk'}
        ]
    },
    methods: {
        confirmTask: function(event){
            console.log("send..." + this.value1);
            bus.$emit('hello', this.value1)
            router.push('createTask')
        }
    }
} 
</script>
