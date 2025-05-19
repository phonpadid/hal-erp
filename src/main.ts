import { createApp } from "vue";
import { createPinia } from "pinia";
import "@/common/shared/styles/style.css";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "@/common/shared/assets/layout/index.scss";
import App from "./App.vue";
import router from "@/common/shared/router/index";
import i18nConfig from "./common/config/i18n/i18n.config";

const app = createApp(App);

app.use(createPinia());
app.use(i18nConfig);
app.use(router);
app.use(Antd);

app.mount("#app");
