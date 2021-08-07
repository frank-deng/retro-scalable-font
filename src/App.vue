<template>
  <router-view v-if='!store.fontLoading'></router-view>
</template>
<script setup>
import {ElLoading,ElMessageBox} from 'element-plus';
import {provide,reactive} from 'vue';
import {initFontManager} from '/@/font';
import mainPage from '/@/mainPage.vue';

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
