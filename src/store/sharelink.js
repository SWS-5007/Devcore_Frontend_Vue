import { SHARELINK } from "@/graphql";
import { ShareLink } from "@/models";
import { queryToPromise } from "../lib/utils";
import { apolloClient } from "../plugins/apollo/client";

const initialState = () => {
  return {
    loading: false,
    all: []
  };
};

const state = initialState();

const getters = {
  loading: state => state.loading,
  all: state => state.all,
};

const actions = {
  async shareProjectByLinkId(context, form) {
    const result = await form.mutate({
      mutation: SHARELINK.shareProjectByLinkId,
      variables: {
        id: form.id
      }
    })

    return result;
  },
  async getShareLinkByHash(context, form) {
    const result = await form.mutate({
      mutation: SHARELINK.getShareLinkByHash,
      variables: {
        urlHash: form.urlHash
      }
    })

    const sharelink = new ShareLink().deserialize(result.data.getShareLinkByHash);
    return sharelink;
  },
};

const mutations = {
  RESET_STATE(state) {
    Object.assign(state, initialState());
    return state;
  },
  SET_LOADING(state, value) {
    state.loading = value;
  },
  SET_ALL(state, value) {
    state.all = value;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
