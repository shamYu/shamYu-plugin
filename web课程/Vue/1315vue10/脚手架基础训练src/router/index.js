import Vue from 'vue'
import VueRouter from 'vue-router'
import content from '@/components/content'

Vue.use(VueRouter)

export default new VueRouter({
    routes:[
        {
            path:'/:hash',
            component:content
        },
        {
            path:'*',
            redirect:'/home'
        }
    ]
})