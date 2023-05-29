import { USER } from "@/graphql";
import { User } from "@/models";
import { queryToPromise } from "../lib/utils";
import { apolloClient } from "../plugins/apollo/client";

const initialState = () => {
  return {
    loading: false,
    all: [],
    filter: null
  };
};

const state = initialState();

const getters = {
  loading: state => state.loading,
  all: state => state.all,
  filter: state => state.filter,
  filteredItems: state =>
    state.filter && state.filter.length > 3
      ? state.all.filter(
          i =>
            i.firstName.toLowerCase().includes(state.filter.toLowerCase()) ||
            i.lastName.toLowerCase().includes(state.filter.toLowerCase()) ||
            i.email.toLowerCase().includes(state.filter.toLowerCase())
        )
      : state.all
};

const actions = {
  async create(context, form) {
    const result = await form.mutate({
      mutation: USER.create
      /* update(cache, result) {
                const { userFindAll } = cache.readQuery({ query: USER.findAll });
                cache.writeQuery({
                    query: USER.findAll,
                    data: { userFindAll: userFindAll.concat([result.data.userCreate]) },
                });
            } */
    });
    const user = new User().deserialize(result.data.userCreate);
    await context.dispatch("findAll", {
      force: true
    });
    return user;
  },


  async update(context, form) {
    const result = await form.mutate({
      mutation: USER.update,
      variables: {
        id: form.id
      }
    });
    await context.dispatch("findAll", {
      force: true
    });
    const user = new User().deserialize(result.data.userUpdate);
    return user;
  },

  async delete(context, form) {
    const result = await form.mutate({
      mutation: USER.delete
    });
    await context.dispatch("findAll", {
      force: true
    });
    return result.data.userDelete;
  },

  async resetPassword(context, form) {
    const result = await form.mutate({
      mutation: USER.resetPassword
    });
    return result.data.userResetPassword;
  },

  async invite(context, form) {
    const result = await form.mutate({
      mutation: USER.invite
    });
    const user = new User().deserialize(result.data.userInvite);
    return user;
  },

  async findAll(context, { filter = null, force = false } = {}) {
    if (context.getters.all.length === 0 || force) {
      filter = filter || {
        data: {
          orderBy: ["firstName"]
        }
      };
      filter.busy = context.getters.all.length < 1;
      /* const { data } = await apolloClient.watchquery({
                query: USER.findAll,
                variables: { filter: filter }
            }); */
      try {
        const query = apolloClient.watchQuery({
          query: USER.findAll,
          variables: {
            filter: filter.data
          }
        });
        const { result } = await queryToPromise(query);
        const results = result.data.userFindAll.map(cr => {
          return new User().deserialize(cr);
        });
        context.commit("SET_ALL", results);
        return results;
      } finally {
        filter.busy = false;
      }
    }
    return context.getters.all;
  },

  async filter(context, filter) {
    context.commit("SET_FILTER", filter);
  },
  async register(context, form) {
    const result = await form.mutate({
      mutation: USER.register
    });
    // const user = new User().deserialize(result.data.userCreate);

    return result;
  },

};

const mutations = {
  RESET_STATE(state) {
    Object.assign(state, initialState());
    return state;
  },
  SET_ALL(state, value) {
    state.all = value;
  },
  SET_FILTER(state, value) {
    state.filter = value;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
