<template>
    <el-form size='mini' label-position='right' label-width="80px" inline
        class='mainPage'>
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
        <el-form-item label='容器宽度'>
            <el-input-number v-model="state.maxWidth" :min="160"></el-input-number>
        </el-form-item>
        <el-form-item label='颜色'>
            <el-color-picker v-model="state.color"></el-color-picker>
        </el-form-item>
        <el-form-item label='字符间距'>
            <el-input-number v-model="state.charSpacing" :min="-50" :max="50"></el-input-number>
        </el-form-item>
        <el-form-item label='行间距'>
            <el-input-number v-model="state.lineSpacing" :min="-50" :max="50"></el-input-number>
        </el-form-item>
        <el-form-item label='对齐方式'>
            <el-radio-group v-model="state.align">
                <el-radio-button label='left'>左对齐</el-radio-button>
                <el-radio-button label='center'>居中</el-radio-button>
                <el-radio-button label='right'>右对齐</el-radio-button>
            </el-radio-group>
        </el-form-item>
        <el-form-item label-width="">
            <el-button @click='resetParam'>复位</el-button>
            <el-button type='primary' @click='saveSVG'
                :disabled='!state.inputText'>保存SVG</el-button>
        </el-form-item>
        <div class='displayTextContainer'>
            <displayText
                class='displayText'
                ref='container'
                v-if='state.inputText'
                :text='state.inputText'
                :maxWidth='state.maxWidth'
                :fontSize='state.fontSize'
                :ascFont='state.ascFont'
                :hzkFont='state.hzkFont'
                :charSpacing='state.charSpacing'
                :lineSpacing='state.lineSpacing'
                :align='state.align'
                :color='state.color'></displayText>
        </div>
    </el-form>
</template>
<script setup>
const LOCAL_STORAGE_KEY='UCDOS_OUTLINE_FONT_SVG_PARAMS';
import {inject, ref, reactive, watch} from 'vue';
import displayText from '@/font/display.vue';
import {saveAs} from 'file-saver';
const store=inject('store');

const defaultValue={
    inputText:'',
    fontSize:24,
    ascFont:0,
    hzkFont:store.fontManager.getHzkFontList()[0].value,
    charSpacing:0,
    lineSpacing:0,
    maxWidth:640,
    align:'left',
    color:'#303133'
};
let storedValue={};
try{
    let dataRaw=localStorage.getItem(LOCAL_STORAGE_KEY);
    if(dataRaw){
        storedValue=JSON.parse(dataRaw);
    }
}catch(e){
    console.error(e);
}
const state=reactive({
    ...defaultValue,
    ...storedValue,
    ascFontList:store.fontManager.getAscFontList(),
    hzkFontList:store.fontManager.getHzkFontList()
});
watch(state,()=>{
    let saveData={
        ...state
    };
    delete saveData.ascFontList;
    delete saveData.hzkFontList;
    localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(saveData));
});

const container=ref(null);
const resetParam=()=>{
    Object.assign(state,defaultValue);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}
const saveSVG=()=>{
    let el=container.value.$el;
    let svgText=`<?xml version="1.0" encoding="utf-8"?>\n${container.value.$el.outerHTML}`;
    saveAs(new Blob([svgText]),'export.svg');
}
</script>
<style lang="less">
.mainPage{
    .el-form-item{
        .el-color-picker{
            vertical-align: top;
        }
    }
}
</style>
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
    .el-color-picker{
        vertical-align: top;
    }
    .el-select{
        width:130px;
    }
    .el-input-number{
        width:110px;
    }
}
.displayTextContainer{
    overflow:auto;
    margin:10px;
    .displayText{
        display:inline-block;
        vertical-align: top;
        border:1px solid #DCDFE6;
    }
}
</style>
