<template>
  <router-view v-if='!store.fontLoading'></router-view>
</template>
<script setup>
import {ElLoading,ElMessageBox} from 'element-plus';
import {provide,reactive} from 'vue';
import axios from 'axios';

import fontInfo from '@/font/fontInfo.json';
import {FontManager} from '@/font';

async function initFontManager(){
    let fontInfoNew=await Promise.all(fontInfo.map(async(font)=>{
        try{
            let resp=await axios.get(`./fonts/${font.id}`,{
                responseType: 'arraybuffer'
            });
            return{
                ...font,
                data:resp.data
            };
        }catch(e){
            if(font.required){
                throw new Error(`Failed to load required font ${font.name||font.id}`,e);
            }
            console.warn(`Failed to load font ${font.name||font.id}`,e);
        }
        return null;
    }));
    return new FontManager(fontInfoNew.filter(font=>font));
}

const store=reactive({
  fontLoading:true
});
provide('store',store);
const loading = ElLoading.service({
  lock: true,
  text: '字体加载中，请稍候……'
});
initFontManager().then((fontManager)=>{
  store.fontLoading=false;
  store.fontManager=fontManager;
  loading.close();
}).catch(e=>{
  console.error(e);
  loading.close();
  ElMessageBox.alert(e.message,'字体加载失败',{
    type:'error',
    center:true
  });
});
</script>
