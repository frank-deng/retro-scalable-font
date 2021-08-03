<template>
  <mainPage></mainPage>
</template>
<script setup>
import axios from 'axios';
import {provide,reactive} from 'vue';
import fontInfoData from '/@/fontinfo.json';

import mainPage from '/@/mainPage.vue';
const fontInfo=reactive(fontInfoData);
provide('fontInfo',fontInfo);
axios.get('./fonts/HZKPSSTJ',{
  responseType: 'blob'
}).then((resp)=>{
  console.log(resp);
  fontInfo.loaded=true;
});
</script>
