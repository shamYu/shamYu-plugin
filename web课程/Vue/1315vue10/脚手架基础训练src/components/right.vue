<template>
    <div id='article'>
        <input type='text' :value='msg' />
        <p>{{content}}</p>
    </div>
</template>

<script>
export default {
    // data(){
    //     return {str:'右边的内容'}
    // },
    computed:{
        msg(){
            return this.$store.state.msg
        },
        content(){
            for(var prop in this.$store.state.data){
                if(prop==this.$route.params.hash){
                    return this.$store.state.data[prop].article
                }
            }
        }
    }
}
</script>

<style>

</style>
