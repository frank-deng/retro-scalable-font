<template>
    <el-input-number v-model="state.offset" :min='0'/>
    <svg width='249' height='249' v-if='state.path'>
        <path :d='state.path' :style="{fill:'none',stroke:'#000',strokeWidth:'1px'}"/>
    </svg>
    {{state.path}}
</template>
<script setup>
import { computed, reactive } from "vue";
import axios from 'axios';
import {FontBGI} from '/@/font/fontbgi.js';

const state=reactive({
    offset:0,
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

axios.get(`./public/bgifonts/SANS.CHR`,{
    responseType: 'arraybuffer'
}).then((resp)=>{
    state.testFont=new FontBGI(resp.data);
    console.log('Font name:', state.testFont.getFontName());
});
</script>

<style lang="less" scoped>
svg{
    display:block;
    margin-top:10px;
    border:1px solid #666666;
}
</style>
