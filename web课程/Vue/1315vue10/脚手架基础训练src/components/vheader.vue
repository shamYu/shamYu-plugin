<template>
    <div id='div1'>
        <ul>
            <li v-for="(d,prop,i) in arr" :key='i'>
                <router-link :to='"/"+prop'>{{d.title}}</router-link>
            </li>
            <!-- <li><router-link to='/about'>关于我们</router-link></li>
            <li><router-link to='/helper'>帮助</router-link></li>
            <li><router-link to='/guides'>攻略</router-link></li>
            <li><router-link to='/contact'>联系我们</router-link></li> -->
            <input type="text" :value='msg'>
        </ul>
    </div>
</template>

<script>
export default {
    computed:{
        msg(){
            return this.$store.state.msg
        },
        arr(){
            return this.$store.state.data
        }
    }
}
</script>

<style>

</style>
