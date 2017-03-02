<template>
    <div>
        <mt-radio title="选择任务" v-model="task" :options="['代课','代取', '顺风车', '借东西']">
        </mt-radio>
        <mt-button @click.native="confirmTask" type="primary"
                    style="margin-top:20px">确认</mt-button>
    </div>
</template>


<script>

import Vue from 'vue'
import { Raido } from 'mint-ui'

Vue.component("mt-radio", Raido)

export default {
    name: "selectTask",
    data () {
        return { 
            task: "" 
        }
    
    },
    methods: {
        confirmTask: function(){

        }
    }
} 
</script>
