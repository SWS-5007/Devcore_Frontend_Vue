import Vue from 'vue'
import Vuex from 'vuex'
// import { apolloProvider } from '../plugins/apollo/client';
// import { TEST_QUERY } from '../graphql';
import auth from './auth';
import app from './app';
import project from './project';
import idea from './idea';
import ideaissue from './ideaissue';
import issue from './issue';
import milestone from './milestone';
import issueEffect from './issue_effect';
import companyRole from './company_role';
import reply from './reply';
import experience from './experience';
import user from "./user";
import ideaContent from "./idea_content";
import EventBus from '@/lib/eventbus';
import shareLink from "./sharelink";


Vue.use(Vuex)

const store = new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    modules: {
        app,
        auth,
        project,
        idea,
        ideaissue,
        user,
        issue,
        milestone,
        issueEffect,
        companyRole,
        reply,
        experience,
        ideaContent,
        shareLink
    }
})


function resetStates() {
    // store.commit('companyRole/RESET_STATE');
    // store.commit('user/RESET_STATE');
    // store.commit('role/RESET_STATE');
    // store.commit('toolArea/RESET_STATE');
    // store.commit('toolCategory/RESET_STATE');
    // store.commit('companyTool/RESET_STATE');
    // store.commit('companyToolModule/RESET_STATE');
    // store.commit('priceModel/RESET_STATE');
    // store.commit('productCategory/RESET_STATE');
    // store.commit('product/RESET_STATE');
    // store.commit('process/RESET_STATE');
    // store.commit('processStage/RESET_STATE');
    // store.commit('processOperation/RESET_STATE');
    // store.commit('processPhase/RESET_STATE');
    // store.commit('idea/RESET_STATE');
    // store.commit('issue/RESET_STATE');
    // store.commit('toolIdea/RESET_STATE');
    // store.commit('project/RESET_STATE');
    // store.commit('people/RESET_STATE');


}

EventBus.$on('auth/LOGIN', resetStates);
EventBus.$on('auth/LOGOUT', resetStates);

export default store;