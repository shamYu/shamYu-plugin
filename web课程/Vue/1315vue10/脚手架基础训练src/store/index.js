import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  strict:true,
  state:{
    msg:'',
    data:{},
  },
  mutations:{
    setData(state,val){
      state.data=val;
    },
    setMsg(state,val){
      state.msg=val;
    }
  }
})

 