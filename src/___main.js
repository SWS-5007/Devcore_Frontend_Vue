require("viewport-units-buggyfill").init();
import vhCheck from "vh-check";
vhCheck();
import Vue from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import DefaultLayout from "./views/layouts/DefaultLayout";
import ExternalLayout from "./views/layouts/ExternalLayout";
import VueApollo from "vue-apollo";

import { ScrollPicker, ScrollPickerGroup } from "vue-scroll-picker";

//cordova.getAppVersion;
Vue.config.devtools = true
Vue.config.productionTip = true;

// import './assets/scss/app.scss'
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "@/plugins/snotify";
// import '@/plugins/validator'
import { apolloProvider } from "@/plugins/apollo/client";
import infiniteScroll from "vue-infinite-scroll";

//set the apollo client
import gqlform from "./lib/gqlform";
gqlform.apolloClients = apolloProvider.clients;

//directives
import "./directives";

//filters
import "./filters";

//middlewares
import "./middlewares";

Vue.use(VueApollo);

Vue.use(infiniteScroll);
import "./components/global";
//layout
Vue.component("default-layout", DefaultLayout);
Vue.component("external-layout", ExternalLayout);
Vue.component("scroll-picker", ScrollPicker);
Vue.component("scroll-picker-group", ScrollPickerGroup);

window.vm = new Vue({
  router,
  store,
  vuetify,
  i18n,
  apolloProvider,
  render: h => h(App)
}).$mount("#app");
