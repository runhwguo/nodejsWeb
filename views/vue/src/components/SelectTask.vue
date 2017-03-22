<template>
    <div>
        <back></back>
        <mt-radio title="选择任务" v-model="value" :options="options">
        </mt-radio>
    </div>
</template>


<script>

import Vue from 'vue'
import { Raido } from 'mint-ui'
import bus from './bus'
import router from '../router/index'
import back from './Back'

Vue.component("mt-radio", Raido)

export default {
    name: "selectTask",
    data() {
        return {
            value: "",
            options: ['代活动', '代取', '顺风车','物品共享']
        }
    },
    watch: {
        value(val){
            bus.$emit('emitTask', val)
            router.push('createTask')
        }
    }
}
</script>
