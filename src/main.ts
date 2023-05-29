require("viewport-units-buggyfill").init();
vhCheck();
import Vue from "vue";
import VueApollo from "vue-apollo";
import i18n from "./i18n";
import vhCheck from "vh-check";
import vuescroll from "vuescroll";
import BootstrapVue from "bootstrap-vue";

import App from "./App.vue";
import DefaultLayout from "./views/layouts/DefaultLayout.vue";
import ExternalLayout from "./views/layouts/ExternalLayout.vue";
import { ScrollPicker, ScrollPickerGroup } from "vue-scroll-picker";

Vue.config.productionTip = false;

import "@mdi/font/css/materialdesignicons.css";

import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "@/plugins/snotify";
import "@/plugins/validator";
import { apolloProvider } from "./plugins/apollo/client";

//set the apollo client
import gqlform from "./lib/gqlform";
gqlform.apolloClients = apolloProvider.clients;

//directives
import "@/directives";

//filters
import "@/filters";

//middlewares
import "@/middlewares";

//Particles
declare module "particles.vue";
import Particles from "particles.vue";
Vue.use(Particles);

Vue.use(VueApollo);
Vue.use(BootstrapVue);

import "@/components/global";
//layout
Vue.component("default-layout", DefaultLayout);
Vue.component("external-layout", ExternalLayout);
Vue.component("scroll-picker", ScrollPicker);
Vue.component("scroll-picker-group", ScrollPickerGroup);
// window.onpopstate = function () {
//   router.go(-1)
// };
//alert(window.location.href)
(<any>window).vm = new Vue({
  router,
  store,
  vuetify,
  i18n,
  apolloProvider,
  render: (h) => h(App),
}).$mount("#app");

// setTimeout(function () {
//   document.body.classList.add("loaded")
// }, 1000);
// router.push({
//   name: "login"
// })

