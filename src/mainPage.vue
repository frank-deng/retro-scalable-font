<template>
    <div class='mainPage'>
        <input v-model='state.inputText' @input='updateFont'/>
        <p>
            <svg class='charDisp' xmlns="http://www.w3.org/2000/svg" version="1.1" width='175' height='175'>
                <path fill-rule="evenodd" v-for='item of state.svgPath' :key='item' :d='item'/>
            </svg>
        </p>
    </div>
</template>
<script setup>
import {inject, reactive} from 'vue';
import {pathToSVG} from '/@/font/pathElements.js';
const store=inject('store');
const state=reactive({
    inputText:'',
    svgPath:[]
});
function updateFont(){
    if(!state.inputText){
        return;
    }
    state.svgPath=[];
    let pathGroups=store.fontManager.getGlyph(state.inputText[0]);
    for(let path of pathGroups.path){
        state.svgPath.push(pathToSVG(path));
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