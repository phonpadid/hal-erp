import { createApp } from "vue";
import { createPinia } from "pinia";
import "@/common/presentation/styles/style.css";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "@/common/presentation/assets/layout/index.scss";
import App from "./App.vue";
import router from "@/common/presentation/router/index";
import i18nConfig from "./common/config/i18n/i18n.config";

const app = createApp(App);

app.use(createPinia());
app.use(i18nConfig)
app.use(router);
app.use(Antd);

app.mount("#app");
