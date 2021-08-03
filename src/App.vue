<template>
  <mainPage></mainPage>
</template>
<script setup>
import axios from 'axios';
import {provide,reactive} from 'vue';

import mainPage from '/@/mainPage.vue';
const fontInfo=reactive({});
provide('fontInfo',fontInfo);
axios.get('./fonts/HZKPSSTJ',{
  responseType: 'blob'
}).then((resp)=>{
  console.log(resp);
  fontInfo.loaded=true;
});
</script>
