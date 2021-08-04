<template>
  <div v-if='store.fontLoading'>加载中</div>
  <mainPage v-else></mainPage>
</template>
<script setup>
import {provide,reactive} from 'vue';
import {initFontManager} from '/@/font';
import mainPage from '/@/mainPage.vue';

const store=reactive({
  fontLoading:true
});
provide('store',store);
initFontManager().then((fontManager)=>{
  store.fontLoading=false;
  store.fontManager=fontManager;
});
</script>
