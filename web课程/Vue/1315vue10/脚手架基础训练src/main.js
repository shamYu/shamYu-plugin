import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'


new Vue({
  el:'#app',
  components:{App},
  store,
  router,
  template:'<App></App>'
})