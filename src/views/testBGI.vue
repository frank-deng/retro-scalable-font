<template>
    <el-input-number v-model="state.offset" :min='0'/>
    <svg v-if='state.glyph' :width='state.width' :height='state.height'>
        <path :d='state.path'/>
    </svg>
</template>
<script setup>
import { computed, reactive } from "vue";
import axios from 'axios';
import {FontBGI} from '/@/font/fontbgi.js';

const state=reactive({
    offset:33,
    testFont:null,
    glyph:computed(()=>{
        if(!state.testFont){
            return null;
        }
        try{
            return state.testFont.getGlyph(state.offset,255,2);
        }catch(e){
            console.error(e);
        }
        return null;
    }),
    path:computed(()=>{
        if(!state.glyph){
            return null;
        }
        return state.glyph.toSVG();
    }),
    width:computed(()=>{
        if(!state.glyph){
            return 0;
        }
        return state.glyph.getWidth();
    }),
    height:computed(()=>{
        if(!state.glyph){
            return 0;
        }
        return state.glyph.getHeight();
    })
});

axios.get(`./public/fonts/BOLD.CHR`,{
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
    path{
        fill:none;
        stroke:#000;
        stroke-width:1px;
        stroke-linecap:round;
        stroke-linejoin:round;
    }
}
</style>
