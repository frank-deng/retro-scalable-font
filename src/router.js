import { createRouter,createWebHashHistory} from "vue-router";
import mainPage from '/@/views/mainPage.vue';
import testGBK from '/@/views/testGBK.vue';
import testBGI from '/@/views/testBGI.vue';

const routes=[
    {
        path:"/",
        component:mainPage
    },
    {
        path:"/testGBK",
        component:testGBK
    },
    {
        path:"/testBGI",
        component:testBGI
    }
];
export default createRouter({
    history:createWebHashHistory(),
    routes
});