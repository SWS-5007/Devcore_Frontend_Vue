import { IDEA_ISSUE } from "../graphql";
import { IdeaIssue } from "../models";
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
      mutation: IDEA_ISSUE.create
    });
    const item = new IdeaIssue().deserialize(result.data.ideaIssueCreate);
    // await context.dispatch('findAll', { force: true });
    return item;
  },
  async findAll(context, { filter = null, force = false } = {}) {
    if (context.getters["all"].length === 0 || force) {
      filter = filter || {
        data: {
          orderBy: ["created_at"],
          where: {
            and: []
          }
        }
      };
      filter.busy = context.getters["all"].length < 1;
      try {
        const query = apolloClient.watchQuery({
          query: IDEA_ISSUE.findAll,
          variables: {
            filter: filter.data
          }
        });
        const { result } = await queryToPromise(query);
        const results = result.data.ideaIssueFindAll.map(cr => {
          return new IdeaIssue().deserialize(cr);
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
