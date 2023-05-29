import { IDEA } from "../graphql";
import { Idea } from "../models";
import { queryToPromise } from "../lib/utils";
import { apolloClient } from "../plugins/apollo/client";

const initialState = () => {
  return {
    ideaInEdit: null,
    loading: false,
    all: [],
    filter: null,
    loadedProcess: []
  };
};

const state = initialState();

const getters = {
  ideaInEdit: state => state.ideaInEdit,
  loading: state => state.loading,
  all: state => state.all,
  filter: state => state.filter,
  byProcess: state => processId =>
    state.all.filter(o => o.processId === processId),
  byStage: state => stageId =>
    state.all.filter(o => o.parentStructure.stageId === stageId),
  byOperation: state => operationId =>
    state.all.filter(o => o.parentStructure.operationId === operationId),
  byPhase: state => phaseId =>
    state.all.filter(o => o.parentStructure.phaseId === phaseId),
  filteredItems: state =>
    state.filter && state.filter.length > 3
      ? state.all.filter(i =>
          i.name.toLowerCase().includes(state.filter.toLowerCase())
        )
      : state.all
};

const actions = {
  async setIdeaInEdit(context, form) {
    context.commit("SET_EDITING_IDEA", form);
  },

  async create(context, form) {
    form.type = "PROCESS";
    const result = await form.mutate({
      mutation: IDEA.create
    });
    const idea = new Idea().deserialize(result.data.ideaCreate);
    return idea;
  },

  async update(context, form) {
    form.type = "PROCESS";
    const result = await form.mutate({
      mutation: IDEA.update,
      variables: {
        id: form.id
      }
    });
    const role = new Idea().deserialize(result.data.ideaUpdate);
    //await context.dispatch('findAll', { force: true });
    return role;
  },

  async changeStatus(context, form) {
    const result = await form.mutate({
      mutation: IDEA.changeStatus,
      variables: {
        id: form.id,
        status: form.status
      }
    });
    const idea = new Idea().deserialize(result.data.ideaChangeStatus);
    //context.dispatch('findAll', { force: true });
    return idea;
  },
  async setIdeaViewed(context, form) {
    const result = await form.mutate({
      mutation: IDEA.ideaViewed,
      variables: {
        id: form.id
      }
    });
    const idea = new Idea().deserialize(result.data.ideaViewed);
    //context.dispatch('findAll', { force: true });
    return idea;
  },

  async delete(context, form) {
    const result = await form.mutate({
      mutation: IDEA.delete,
      variables: {
        id: form.id
      }
    });
    context.commit("REMOVE_ITEM", form);
    //await context.dispatch('findAll', { force: true });
    return result.data.ideaDelete;
  },

  async findByProcess(context, filter) {
    if (!context.state.loadedProcess.includes(filter.id) || filter.force) {
      const query = apolloClient.watchQuery({
        query: IDEA.findAll,
        variables: {
          filter: {
            where: {
              and: [
                {
                  field: "process_id",
                  value: filter.id
                },
                {
                  field: "type",
                  value: "PROCESS"
                }
              ]
            }
          }
        }
      });
      const { result } = await queryToPromise(query);
      context.commit("REMOVE_BY_PROCESS", {
        id: filter.id
      });
      result.data.ideaFindAll.map(o => {
        context.commit("SET_ITEM", new Idea().deserialize(o));
      });
    }
  },

  async findAll(context, { filter = null, force = false } = {}) {
    if (context.getters["all"].length === 0 || force) {
      filter = filter || {
        data: {
          orderBy: ["title"],
          where: {
            and: [
              {
                field: "type",
                value: "PROCESS"
              }
            ]
          }
        }
      };
      filter.busy = context.getters["all"].length < 1;
      try {
        const query = apolloClient.watchQuery({
          query: IDEA.findAll,
          variables: {
            filter: filter.data
          }
        });
        const { result } = await queryToPromise(query);
        const results = result.data.ideaFindAll.map(cr => {
          return new Idea().deserialize(cr);
        });
        context.commit("SET_ALL", results);
        return results;
      } finally {
        filter.busy = false;
      }
    }
    return context.getters["all"];
  },
  async findById(context, filter) {
    const currentItem = context.state.all.find(o => o.id === filter.id);
    const force = filter.force || false;

    if (!currentItem || force || !currentItem.loaded) {
      try {
        const query = apolloClient.watchQuery({
          query: IDEA.findById,
          variables: filter
        });
        const { result } = await queryToPromise(query);
        const idea = new Idea().deserialize(result.data.ideaFindById);
        idea.loaded = true;
        context.commit("SET_ITEM", idea);
        return idea;
      } finally {
        filter.busy = false;
      }
    }
    return currentItem;
  },

  async filter(context, filter) {
    context.commit("SET_FILTER", filter);
  }
};

const mutations = {
  SET_EDITING_IDEA(state, value) {
    state.ideaInEdit = value;
  },
  RESET_STATE(state) {
    Object.assign(state, initialState());
    return state;
  },
  SET_ALL(state, value) {
    state.all = value;
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
  REMOVE_BY_PROCESS(state, value) {
    state.all = state.all.filter(o => o.processId != value.id);
  },
  REMOVE_ITEM(state, value) {
    state.all = state.all.filter(o => o.id != value.id);
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
