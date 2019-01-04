<template>
    <div id='footer'>
        <ul v-for='d in 3' :key='d'>
            <li v-for='w in 5' :key='w'>{{content}}</li>
        </ul>
        <input type="text" :value='msg'>
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
                    return this.$store.state.data[prop].friendLink
                }
            }
        }
    }
}
</script>

<style>

</style>
