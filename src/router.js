import { createRouter,createWebHashHistory} from "vue-router";
import mainPage from '/@/views/mainPage.vue';
import testGBK from '/@/views/testGBK.vue';

const routes=[
    {
        path:"/",
        component:mainPage
    },
    {
        path:"/testGBK",
        component:testGBK
    }
];
export default createRouter({
    history:createWebHashHistory(),
    routes
});