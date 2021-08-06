<template>
    <svg :height='state.svgHeight' :width='state.svgWidth' :style='{fill:props.color}'>
        <g v-for='(line,idx) of state.renderContent' :key='line.id'
            :transform='lineTransform(idx)'>
            <path
                v-for='char of line.content'
                :key='char.id'
                :fill-rule='char.fillRule'
                :d='char.path'
                :transform='char.transform'/>
        </g>
    </svg>
</template>
<script setup>
import { inject, computed, defineProps, reactive } from 'vue';
import linefold from 'linefold';
import {Glyph} from './font';
const store=inject('store');
const props=defineProps({
    maxWidth:{
        type:Number,
        default:640
    },
    text:String,
    fontSize:{
        type:Number,
        default:24
    },
    ascFont:{
        type:Number,
        default:0
    },
    hzkFont:{
        type:String,
        default:'HZKPSSTJ'
    },
    charSpacing:{
        type:Number,
        default:0
    },
    lineSpacing:{
        type:Number,
        default:0
    },
    align:{
        type:String,
        default:'left'
    },
    color:String
});
const state=reactive({
    textFolded:computed(()=>{
        return linefold(props.text,props.maxWidth+props.charSpacing,(text)=>measureText(
            text,
            props.fontSize,
            props.ascFont,
            props.hzkFont,
            props.charSpacing
        ));
    }),
    lineWidthArr:computed(()=>{
        return state.textFolded.map(line=>{
            return measureText(
                line,
                props.fontSize,
                props.ascFont,
                props.hzkFont,
                props.charSpacing
            )-props.charSpacing;
        });
    }),
    svgWidth:computed(()=>{
        if(!state.lineWidthArr.length){
            return 0;
        }
        return Math.max.apply(null,state.lineWidthArr);
    }),
    svgHeight:computed(()=>{
        let lines=state.textFolded.length;
        return lines*props.fontSize+(lines-1)*props.lineSpacing;
    }),
    renderContent:computed(()=>{
        let result=[];
        for(let line of state.textFolded){
            result.push({
                id:Math.random(),
                content:renderText(line)
            });
        }
        return result;
    })
});
const getGlyph=(char,ascFont,hzkFont)=>{
    return store.fontManager.getGlyph(char,ascFont,hzkFont);
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
const lineTransform=(idx)=>{
    let xPos=0;
    let yPos=idx*(props.fontSize+props.lineSpacing);
    switch(props.align){
        case 'left':
            xPos=0;
        break;
        case 'center':
            xPos=Math.abs(state.svgWidth-state.lineWidthArr[idx])/2;
        break;
        case 'right':
            xPos=Math.abs(state.svgWidth-state.lineWidthArr[idx]);
        break;
    }
    return `translate(${xPos},${yPos})`;
}
const renderText=(text,x=0,y=0)=>{
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
            result.push({
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
</script>
