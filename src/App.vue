<template>
  <mainPage></mainPage>
</template>
<script setup>
import axios from 'axios';
import {provide,reactive} from 'vue';
import {initFontManager} from '/@/font';

import mainPage from '/@/mainPage.vue';
const fontInfo=reactive({});
provide('fontInfo',fontInfo);
initFontManager().then((fontManager)=>{
  console.log(fontManager);
});
</script>
