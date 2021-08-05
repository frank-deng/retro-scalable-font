<template>
    <div class='mainPage'>
        <el-input v-model='state.inputText' @input='updateFont'/>
        <el-select v-model='state.ascFont' @change='updateFont'>
            <el-option v-for='item of state.ascFontList' :key='item.value' :value='item.value' :label='item.label'></el-option>
        </el-select>
        <el-select v-model='state.hzkFont' @change='updateFont'>
            <el-option v-for='item of state.hzkFontList' :key='item.value' :value='item.value' :label='item.label'></el-option>
        </el-select>
        <p>
            <template v-for='char,idx of state.inputText'>
                <svg class='charDisp' xmlns="http://www.w3.org/2000/svg" version="1.1" width='170' height='170'
                    :key='idx' v-if='state.svgPath[char]'>
                    <path :d='state.svgPath[char].toSVG()' :transform='state.svgPath[char].isAscii() ? "translate(0,22)" : ""'/>
                </svg>
            </template>
        </p>
    </div>
</template>
<script setup>
import {inject, reactive} from 'vue';
const store=inject('store');
const state=reactive({
    inputText:'',
    ascFontList:store.fontManager.getAscFontList(),
    hzkFontList:store.fontManager.getHzkFontList(),
    ascFont:0,
    hzkFont:'HZKPSSTJ',
    svgPath:{}
});
function updateFont(){
    if(!state.inputText){
        return;
    }
    state.svgPath={};
    for(let char of state.inputText){
        if(state.svgPath[char]){
            continue;
        }
        try{
            let glyph=store.fontManager.getGlyph(char,state.ascFont,state.hzkFont);
            state.svgPath[char]=glyph;
        }catch(e){
            console.error(e);
        }
    }
    console.log(state.svgPath);
}
</script>
<style lang="less" scoped>
.charDisp{
    border: 1px solid #000000;
}
</style>