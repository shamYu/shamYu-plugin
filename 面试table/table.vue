<template>
    <table class="active-table">
        <thead>
            <tr>
                <td v-for="(item, index) in theader" :key="`table_head_${index}`">{{item}}</td>
            </tr>
        </thead>
        <tbody>
            <template v-for="(item,index) in tbody">
                   <tr>
                       <td :rowspan="item.childer.length + 1">{{item.name}}</td>
                   </tr> 
                    <tr v-for="i in item.childer">
                        <td>{{i.size}}</td>
                         <td>{{i.prices}}</td>
                    </tr>
            </template>    
        </tbody>
    </table>
</template>  

<script>
    export default {
        name: 'activeTable',
        props: {
            theader: {
                type: Array,
                default: () => {
                    return ['颜色','尺码','价格']
                }
            },
            tbody: {
                type: Array,
                default: () => {
                    return [
                            {
                            name:'红色',
                            childer:[
                                {size:'X',prices:12},
                                {size:'XL',prices:12},
                                {size:'XXL',prices:12}
                                ]
                            },
                             {
                            name:'蓝色',
                            childer:[
                                {size:'X',prices:12},
                                {size:'XL',prices:12},
                                {size:'XXL',prices:12}
                                ]
                            },
                             {
                            name:'绿色',
                            childer:[
                                {size:'X',prices:12},
                                {size:'XL',prices:12},
                                {size:'XXL',prices:12}
                                ]
                            }
                        ]
                }
            }
        }
    }
</script>

<style lang="less">
    .active-table{
        width: 50%;
        margin: 0 auto;
        border: 1px solid red;
        text-align: center;
        tr{
            td{
                border: 1px solid red
            }
        }
    }
</style>
