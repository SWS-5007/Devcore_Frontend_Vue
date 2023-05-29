import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.use(Vuetify);

export default new Vuetify({
    defaultAssets: {
        font: true,
        icons: 'mdi'
    },
    icons: {
        iconfont: 'mdi',
    },
    theme: {
        
        themes: {
            light: {
                primary: "#4294d0",
            },
        }
    }
});
