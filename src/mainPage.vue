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
                <svg class='charDisp' xmlns="http://www.w3.org/2000/svg" version="1.1" width='175' height='175'
                    :key='idx' v-if='state.svgPath[char]'>
                    <path fill-rule="evenodd" v-for='item of state.svgPath[char]' :key='item' :d='item'/>
                </svg>
            </template>
        </p>
    </div>
</template>
<script setup>
import {inject, reactive} from 'vue';
import {pathToSVG} from '/@/font/pathElements.js';
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
        let paths=store.fontManager.getGlyph(char,state.ascFont,state.hzkFont).path.map(path=>pathToSVG(path));
        state.svgPath[char]=paths;
    }

    /*
    for(let char of state.inputText){
        console.log(store.fontManager.getGlyph(char));
    }
    */
}
</script>
<style lang="less" scoped>
.charDisp{
    border: 1px solid #000000;
}
</style>