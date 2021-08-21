import { createApp } from 'vue'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import './index.css'
import router from './router';
import App from './App.vue'

createApp(App)
    .use(router)
    .use(ElementPlus)
    .mount('#app');
/*
import testFunc from '/@/font/test.js';
testFunc();
*/
