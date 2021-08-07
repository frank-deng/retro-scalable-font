import { createRouter,createWebHashHistory} from "vue-router";
import mainPage from '/@/views/mainPage.vue';

const routes=[
    {
        path:"/",
        component:mainPage
    }
];
export default createRouter({
    history:createWebHashHistory(),
    routes
});