<template>
    <div>
        <img src="../assets/logo.png" alt="profile">
        <mt-cell title="未完成任务" to="/unfinishedTask" is-link>
            <mt-badge type="error" size="small">10</mt-badge>
        </mt-cell>
        <mt-cell title="已完成任务" to="/finishedTask" is-link>
            <mt-badge type="success" size="small">3</mt-badge>
        </mt-cell>
        <mt-cell title="发布的任务" is-link></mt-cell>
        <mt-cell title="我的信息" is-link></mt-cell>
    </div>
</template>


<script>

import Vue from 'vue'
import { Cell, Badge } from 'mint-ui'

Vue.component(Cell.name, Cell);
Vue.component(Badge.name, Badge);

export default {
    name: "me",
    data() {
        return {
        }
    },
    methods: {
    }
}
</script>