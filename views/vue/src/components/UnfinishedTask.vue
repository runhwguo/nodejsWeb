<template>
<div>
    <back></back>
    <div v-for="item in 4">
    <mt-cell title="三江楼马克思"></mt-cell>
    </div>
</div>
</template>

<script>
    import Vue from 'vue'    
    import { Cell } from 'mint-ui'
    import Back from './Back'

    Vue.component("back", Back)

    export default {
        name: "unfinishedTask",
        data() {
            return {

            }
        }
    }
</script>