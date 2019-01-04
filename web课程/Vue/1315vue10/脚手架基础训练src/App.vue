<template>
    <div id="app">
        <input type="button" value='登录' @click='flag=!flag'>
        <div is='login' v-show='flag'></div>
        <div is='vheader'></div>
        <router-view></router-view>
    </div>
</template>

<script>

import vheader from '@/components/vheader'
import vmain from '@/components/vmain'
import vfooter from '@/components/vfooter'
import login from '@/components/login'
import axios from 'axios'

export default {
  components:{vheader,vmain,vfooter,login},
  data(){
      return {flag:false}
  },
  created(){
      axios.get('../static/data.json')
      .then(res=>{
          this.$store.commit('setData',res.data)
      })
  }
}
</script>

<style>
    #login{
        display:block;
        position: absolute;
        background: #fff;
        border:3px solid #000;
        box-shadow: 0 0 10px #000;
        left:100px;
        top:100px;
        width: 200px;
        height: 200px;
    }
    *{
        padding: 0;
        margin: 0;
    }
    ul{
        display: flex;
        list-style: none
    }
    a{
        color:#fff;
        text-decoration: none
    }
    li{
        padding: 20px 50px;
        background: #999;
        margin:1px 0 0 1px
    }
    #app{
        width: 1200px;
        position: relative;
    }
    #main{
        height:300px;
        display: flex
    }
    #main>div{
        height:300px;
        flex-grow: 1;
        margin-left: 1px;
        background: #f5f5f5;
    }
    body{
        display: flex;
        justify-content: center
    }
</style>


