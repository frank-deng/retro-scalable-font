<template>
    <div class='mainPage'>
        <el-input type='textarea' v-model='state.inputText'
            resize='none'
            :autosize='{minRows:3,maxRows:20}'/>
        <el-input-number v-model="state.fontSize" :min="8"></el-input-number>
        <el-select v-model='state.ascFont'>
            <el-option v-for='item of state.ascFontList' :key='item.value' :value='item.value' :label='item.label'></el-option>
        </el-select>
        <el-select v-model='state.hzkFont'>
            <el-option v-for='item of state.hzkFontList' :key='item.value' :value='item.value' :label='item.label'></el-option>
        </el-select>
        <el-input-number v-model="state.charSpacing" :min="-50" :max="50"></el-input-number>
        <el-input-number v-model="state.lineSpacing" :min="-50" :max="50"></el-input-number>
        <displayText
            class='displayText'
            v-if='state.inputText'
            :text='state.inputText'
            :maxWidth='state.screenWidth'
            :fontSize='state.fontSize'
            :ascFont='state.ascFont'
            :hzkFont='state.hzkFont'
            :charSpacing='state.charSpacing'
            :lineSpacing='state.lineSpacing'
            :align='state.align'></displayText>
    </div>
</template>
<script setup>
import {inject, onUnmounted, reactive} from 'vue';
import displayText from '/@/font/display.vue';
const store=inject('store');
const state=reactive({
    inputText:'',
    fontSize:24,
    ascFontList:store.fontManager.getAscFontList(),
    hzkFontList:store.fontManager.getHzkFontList(),
    ascFont:0,
    hzkFont:'HZKPSSTJ',
    charSpacing:0,
    lineSpacing:0,
    screenWidth:document.body.offsetWidth,
    align:'center'
});
const resizeHandler=()=>{
    console.log('screenwidth',document.body.offsetWidth);
    state.screenWidth=document.body.offsetWidth;
}
window.addEventListener('resize',resizeHandler);
onUnmounted(()=>{
    window.removeEventListener('resize',resizeHandler);
});
</script>
<style lang="less" scoped>
.displayText{
    display:block;
    margin:10px auto;
}
</style>