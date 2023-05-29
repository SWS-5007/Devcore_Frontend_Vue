import { ISSUE } from "@/graphql";
import { Issue } from "@/models";
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
      ? state.all.filter(i =>
          i.name.toLowerCase().includes(state.filter.toLowerCase())
        )
      : state.all
};

const actions = {
  async create(context, form) {
    const result = await form.mutate({
      mutation: ISSUE.create
      /*update(cache, result) {
                const { ideaFindAll } = cache.readQuery({ query: IDEA.findAll });
                cache.writeQuery({
                    query: IDEA.findAll,
                    data: { ideaFindAll: ideaFindAll.concat([result.data.ideaCreate]) },
                });
            }*/
    });
    const item = new Issue().deserialize(result.data.issueCreate);
    //await context.dispatch('findAll', { force: true });
    return item;
  },
  async findAll(context, { filter = null, force = false } = {}) {
    if (context.getters["all"].length === 0 || force) {
      filter = filter || {
        data: {
          orderBy: ["createdAt"],
          where: {
            and: []
          }
        }
      };
      filter.busy = context.getters["all"].length < 1;
      try {
        const query = apolloClient.watchQuery({
          query: ISSUE.findAll,
          variables: {
            filter: filter.data
          }
        });
        const { result } = await queryToPromise(query);
        const results = result.data.issueFindAll.map(cr => {
          return new Issue().deserialize(cr);
        });
        context.commit("SET_ALL", results);
        return results;
      } finally {
        filter.busy = false;
      }
    }
    return context.getters["all"];
  }
};
const mutations = {
  RESET_STATE(state) {
    Object.assign(state, initialState());
    return state;
  },
  SET_ALL(state, value) {
    state.all = value;
  },
  REMOVE_ITEM(state, value) {
    const index = state.all.findIndex(el => el.id === value.id);
    if (index > -1) {
      state.all.splice(index, 1);
      state.all = [...state.all];
    }
  },
  SET_ITEM(state, value) {
    const index = state.all.findIndex(el => el.id === value.id);
    if (index > -1) {
      state.all[index] = value;
      state.all = [...state.all];
    } else {
      state.all.push(value);
    }
  },
  SET_FILTER(state, value) {
    state.filter = value;
  }
};

export default {
  namespaced: true,
  state: state,
  getters: getters,
  actions: actions,
  mutations: mutations
};
