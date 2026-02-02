import { createApp } from "vue";
import { createPinia } from "pinia";
import { Quasar, Notify, Dialog } from "quasar";
import router from "./router";
import i18n from "./i18n";
import App from "./App.vue";

// Import Quasar css
import "quasar/dist/quasar.css";
import "@quasar/extras/material-icons/material-icons.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
  },
});

app.mount("#app");
