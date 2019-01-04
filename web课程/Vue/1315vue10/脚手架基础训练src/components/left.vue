<template>
    <div id='aside'>
        <input type='text' :value='msg' />
        <p>{{content}}</p>
    </div>
</template>

<script>

export default {
    computed:{
        msg(){
            return this.$store.state.msg
        },
        content(){
            for(var prop in this.$store.state.data){
                if(prop==this.$route.params.hash){
                    return this.$store.state.data[prop].aside
                }
            }
        }
    }
}
</script>

<style>

</style>
