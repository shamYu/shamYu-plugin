<template>
    <div id='login'>
        <input type="text" v-model="msg">
        <input type="button" value='login' @click='change()'>
    </div>
</template>

<script>
export default {
    data(){
        return {msg:''}
    },
    methods:{
        change(){
            this.$store.commit('setMsg',this.msg);
        }
    }
}
</script>

<style>

</style>
