<template>
    <div id="main">
        
        <mt-field label="姓名" placeholder="Input username"></mt-field>
        <mt-field label="手机号" placeholder="Input tel"></mt-field>
        <mt-field label="截止时间" @click.native="open('picker')" placeholder="截止时间" :value="pickerValue | formatDate"></mt-field>
        <mt-datetime-picker
            ref="picker"
            type="datetime"
            v-model="pickerValue">
        </mt-datetime-picker>
        <mt-field label="详请" placeholder="Input detail" type="textarea"></mt-field>
        <mt-field label="报酬" placeholder="Input reward"></mt-field>
        <mt-button @click.native="openToast" type="primary" style="margin-top:20px">发布</mt-button>
    </div>
</template>


<script>

    import Vue from 'vue'
    import { alert, bsInput } from 'vue-strap'
    import { Toast, mtButton, Field, DatetimePicker } from 'mint-ui'
    Vue.component('mt-button', mtButton)
    Vue.component('mt-field', Field)
    Vue.component('mt-datetime-picker', DatetimePicker)

    export default{
        name: "createTask",
        data () {
            return { pickerValue: new Date()}
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
        filters: {
            formatDate: function (date) {
                date = new Date(date)
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
            }
    },
    }
</script>