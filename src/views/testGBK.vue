<template>
    <el-input-number v-model="state.offset" :min='0'/>
    <el-input v-model='state.offsetHex'>
        <template #prefix>0x</template>
    </el-input>
    <svg width='170' height='170' v-if='state.path'>
        <path :d='state.path'/>
    </svg>
</template>
<script setup>
import { computed, reactive } from "vue";
import axios from 'axios';
import {Font} from '/@/font/font.js';

const state=reactive({
    offset:0,
    offsetHex:computed({
        get(){
            return state.offset.toString(16);
        },
        set(value){
            state.offset=parseInt(value,16);
        }
    }),
    testFont:null,
    path:computed(()=>{
        if(!state.testFont){
            return null;
        }
        try{
            let glyph=state.testFont.getGlyph(state.offset);
            if(glyph){
                return glyph.toSVG();
            }
        }catch(e){
            console.error(e);
        }
        return null;
    })
});

class TestFont extends Font{
    constructor(fontData){
        super(fontData);
    }
}

axios.get(`./public/fonts/HZKPSST.GBK`,{
    responseType: 'arraybuffer'
}).then((resp)=>{
    state.testFont=new TestFont(resp.data);
});
</script>
<style lang="less" scoped>
.el-input-number{
    margin-right:10px;
}
.el-input{
    width:120px;
}
svg{
    display:block;
    margin-top:10px;
    border:1px solid #666666;
}
</style>
