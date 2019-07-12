<template>
    <div>
        <ul>
            <li>
                <p>一级属性:<span>颜色</span></p> 
                <p>属性值: <span>蓝色</span> <span>蓝色</span></p>
            </li>
            <li>
                <p>二级属性:<span>颜色</span></p> 
                <p>尺码: <span>X</span> <span>XL</span><span>XLL</span></p>
            </li>
        </ul>
        <button @click="">添加属性</button>

         <pd-table></pd-table>    
    </div>
</template>

<script>
import pdTable from './table.vue'
export default {
    data () {
        return {

        }
    }
}
</script>

<style>

</style>
