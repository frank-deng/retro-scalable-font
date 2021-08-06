<template>
    <svg :height='state.svgHeight' :width='Math.min(state.svgWidth,props.maxWidth)'>
        <path
            v-for='char of state.charList'
            :key='char.id'
            :fill-rule='char.fillRule'
            :d='char.path'
            :transform='char.transform'/>
    </svg>
</template>
<script setup>
import { inject, computed, defineProps, reactive, watch, onMounted, nextTick } from 'vue';
import linefold from 'linefold';
import {Glyph} from './font';
const store=inject('store');
const props=defineProps({
  maxWidth:Number,
  text:String,
  fontSize:Number,
  ascFont:Number,
  hzkFont:String,
  charSpacing:{
      type:Number,
      default:0
  },
  lineSpacing:Number,
  align:String
});
const state=reactive({
    svgWidth:0,
    svgHeight:0,
    charList:[]
});
const updateSignal=computed(()=>{
    return [
        props.maxWidth,
        props.text,
        props.fontSize,
        props.ascFont,
        props.hzkFont,
        props.charSpacing,
        props.lineSpacing,
        props.align
    ];
});
let glyphCache={};
const getGlyph=(char,ascFont,hzkFont)=>{
    glyphCache={};
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
        if(!glyph){
            continue;
        }
        x+=glyph.getWidth()*scale+charSpacing;
    }
    return x;
}
const renderText=(text,x,y)=>{
    let xPos=x, result=[];
    let scale=props.fontSize/Glyph.BASE_HEIGHT;
    for(let char of text){
        let glyph=getGlyph(char,props.ascFont,props.hzkFont);
        if(!glyph){
            continue;
        }
        if(!glyph.isEmpty()){
            let charScale=scale,
                translateY=y,
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
    return result;
}
const updateText=async()=>{
    glyphCache={};
    state.charList=[];
    await nextTick();
    let textFolded=linefold(props.text,props.maxWidth+props.charSpacing,(text)=>{
        return measureText(
            text,
            props.fontSize,
            props.ascFont,
            props.hzkFont,
            props.charSpacing
        );
    });
    let yPos=0,width=0;
    for(let line of textFolded){
        let lineWidth=measureText(
            line,
            props.fontSize,
            props.ascFont,
            props.hzkFont,
            props.charSpacing
        )-props.charSpacing;
        width=Math.max(width,lineWidth);
        state.charList=state.charList.concat(renderText(line,0,yPos));
        yPos+=props.lineSpacing+props.fontSize;
    }
    state.svgWidth=width;
    state.svgHeight=yPos-props.lineSpacing;
}
watch(updateSignal,updateText);
updateText();
onMounted(()=>{
});
</script>
