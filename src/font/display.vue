<template>
    <svg :height='state.svgHeight' :width='Math.min(state.svgWidth,props.maxWidth)' v-if='props.text'>
        <path
            v-for='char of state.charList'
            :key='char.id'
            :fill-rule='char.fillRule'
            :d='char.path'
            :transform='char.transform'/>
    </svg>
</template>
<script setup>
import { inject, computed, defineProps, reactive, watch, onMounted } from 'vue';
import {Glyph} from './font';
const store=inject('store');
const props=defineProps({
  maxWidth:Number,
  text:String,
  fontSize:Number,
  ascFont:Number,
  hzkFont:String,
  charSpacing:Number,
  lineSpacing:Number
});
const state=reactive({
    svgWidth:0,
    svgHeight:0,
    textList:[]
});
const updateSignal=computed(()=>{
    return [
        props.maxWidth,
        props.text,
        props.fontSize,
        props.ascFont,
        props.hzkFont,
        props.charSpacing,
        props.lineSpacing
    ];
});
let glyphCache={};
const getGlyph=(char,ascFont,hzkFont)=>{
    let glyph=glyphCache[char];
    if(!glyph){
        glyph=glyphCache[char]=store.fontManager.getGlyph(char,ascFont,hzkFont);
    }
    return glyph;
}
const measureText=(text,fontSize,ascFont,hzkFont,charSpacing=0)=>{
    let x=0;
    let scale=fontSize/Glyph.BASE_HEIGHT;
    for(let char of text){
        let glyph=getGlyph(char,ascFont,hzkFont);
        x+=glyph.getWidth()*scale+charSpacing;
    }
    return x;
}
const updateText=()=>{
    let xPos=0,xMax=0,lines=1;
    glyphCache={};
    state.charList=[];
    let scale=props.fontSize/Glyph.BASE_HEIGHT;
    for(let char of props.text){
        if('\n'==char){
            //换行处理
            lines++;
            xMax=Math.max(xMax,xPos);
            xPos=0;
            continue;
        }
        let glyph=getGlyph(char,props.ascFont,props.hzkFont);
        if(!glyph.isEmpty()){
            let charScale=scale,
                translateY=(lines-1)*(props.fontSize+props.lineSpacing),
                fillRule='nonzero';
            if(glyph.isAscii()){
                charScale=scale*1.2;
                fillRule='evenodd';
                translateY+=10*scale;
            };
            state.charList.push({
                id:Math.random(),
                fillRule,
                path:glyph.toSVG(),
                transform:`translate(${xPos},${translateY}) scale(${charScale})`
            });
        }
        xPos+=glyph.getWidth()*scale+(props.charSpacing||0);
    }
    xMax=Math.max(xMax,xPos);
    state.svgWidth=xMax-props.charSpacing;
    state.svgHeight=props.fontSize*lines+props.lineSpacing*(lines-1);
}
watch(updateSignal,updateText);
onMounted(()=>{
    updateText();
});
</script>
