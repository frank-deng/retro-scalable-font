<template>
    <el-form size='mini' label-position='right' label-width="80px" inline>
        <el-form-item label='内容' class='formItemInputText'>
            <el-input type='textarea' v-model='state.inputText'
                resize='none'
                :autosize='{minRows:3,maxRows:7}'
                placeholder="请输入要显示的内容"/>
        </el-form-item>
        <el-form-item label='中文字体'>
            <el-select v-model='state.hzkFont'>
                <el-option v-for='item of state.hzkFontList' :key='item.value' :value='item.value' :label='item.label'></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label='英文字体'>
            <el-select v-model='state.ascFont'>
                <el-option v-for='item of state.ascFontList' :key='item.value' :value='item.value' :label='item.label'></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label='字体大小'>
            <el-input-number v-model="state.fontSize" :min="8"></el-input-number>
        </el-form-item>
        <el-form-item label='字符间距'>
            <el-input-number v-model="state.charSpacing" :min="-50" :max="50"></el-input-number>
        </el-form-item>
        <el-form-item label='行间距'>
            <el-input-number v-model="state.lineSpacing" :min="-50" :max="50"></el-input-number>
        </el-form-item>
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
    </el-form>
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
    state.screenWidth=document.body.offsetWidth;
}
window.addEventListener('resize',resizeHandler);
onUnmounted(()=>{
    window.removeEventListener('resize',resizeHandler);
});
</script>
<style lang="less" scoped>
.el-form-item{
    &.el-form-item--mini {
        margin-bottom: 8px;
    }
    margin-bottom:4px;
    &.formItemInputText{
        width:100%;
        margin-right:0;
    }
    .el-select{
        width:130px;
    }
    .el-input-number{
        width:110px;
    }
}
.displayText{
    display:block;
    margin:10px auto;
}
</style>