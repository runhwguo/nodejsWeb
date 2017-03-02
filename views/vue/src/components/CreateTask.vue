<template>
    <div id="main">
        <router-link to="selectTask"><mt-cell :title="task"></mt-cell></router-link>
        <mt-field label="姓名" placeholder="Input username" 
                :state="nameState" v-model="name"></mt-field>
        <mt-field label="手机号" placeholder="Input tel" 
                :state="phoneState" v-model="phone"></mt-field>
        <mt-field label="截止时间" @click.native="open('picker')" 
                    placeholder="截止时间" :value="pickerValue | formatDate"></mt-field>
        <mt-datetime-picker
            ref="picker" type="datetime"
            v-model="pickerValue"></mt-datetime-picker>
        <mt-field label="详请" placeholder="Input detail" type="textarea" 
                    :state="detailState" v-model="detail"></mt-field>
        <mt-field label="报酬" placeholder="Input reward" 
                    :state="rewardState" v-model="reward"></mt-field>
        <mt-button @click.native="openToast" type="primary"
                    style="margin-top:20px">发布</mt-button>
    </div>
</template>


<script>
import Vue from 'vue'
import { alert, bsInput } from 'vue-strap'
import { Toast, mtButton, Field, DatetimePicker } from 'mint-ui'
import { bus } from '../share.js'

Vue.component('mt-button', mtButton)
Vue.component('mt-field', Field)
Vue.component('mt-datetime-picker', DatetimePicker)

var task = "选择任务"

bus.$on("hello", function(id){
    task = id
})

export default{
    name: "createTask",
    data () {
        return {
            task: task,
            name: "",
            phone: "",
            detail: "",
            reward: "",
            pickerValue: new Date(),
            nameState: "",
            phoneState: "",
            detailState: "",
            textarea: "",
            rewardState: ""
        }
    },
    created: function() {
    },
    methods: {
        open(picker) {
            this.$refs[picker].open();
        },
        handleChange(value) {
            this.now = value
            console.log(value)
        },
        openToast() {
            Toast("正在发布..")
        }
    },
    watch: {
        name: function(val) {
            Boolean(val)?this.nameState="success":this.nameState="warning"
        },
        phone: function(val) {
            Boolean(val)?this.phoneState="success":this.phoneState="warning"
        },
        detail: function(val) {
            Boolean(val)?this.detailState="success":this.detailState="warning"
        },
        reward: function(val) {
            Boolean(val)?this.rewardState="success":this.rewardState="warning"
        }
    },
    filters: {
        formatDate: function (date) {
            date = new Date(date)
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
        }
},
}
</script>