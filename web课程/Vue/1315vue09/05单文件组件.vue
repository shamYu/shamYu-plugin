<template>
    <div>
        hahaha
        <div is='div2'></div>
        <div is='div3'></div>
    </div>
</template>
<script>

// 子组件导出，父组件导入.

// 从vue2.vue导入div2对象
// import div2 from '06子单文件组件vue2.vue';

// 从vue3.vue导入div3对象
// import div3 from '06子单文件组件vue3.vue';

export default {
    data(){
        return {msg:1000}
    },
    //使用导入的div2和div3作为当前组件的子组件。
    components:{div2,div3},
    methods:{
        change(){}
    }
}

</script>
<style scoped>

</style>

