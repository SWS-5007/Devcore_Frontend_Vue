import { PROJECT } from "@/graphql";
import { Project } from "@/models";
import { queryToPromise } from "../lib/utils";
import { apolloClient } from "../plugins/apollo/client";

const initialState = () => {
  return {
    loading: false,
    all: [],
    filter: null,
    loadedProcess: [],
    subscribed: false
  };
};

const state = initialState();

const getters = {
  subscribed: state => state.subscribed,
  loading: state => state.loading,
  all: state =>
    state.all.sort((a, b) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    ),
  filter: state => state.filter,
  byId: state => id => state.all.find(o => o.id === id),
  byProcess: state => processId =>
    state.all.filter(o => o.processId === processId),
  byStage: state => stageId => state.all.filter(o => o.stageId === stageId),
  byOperation: state => operationId =>
    state.all.filter(o => o.operationId === operationId),
  byPhase: state => phaseId => state.all.filter(o => o.phaseId === phaseId),
  filteredItems: state => {
    if (state.filter && state.filter.length > 3) {
      return state.all.filter(i =>
        i.name.toLowerCase().includes(state.filter.toLowerCase())
      );
    }
    return state.all;
  },
  filteredByprocess: state => {
    return processId => {
      return state.filter && state.filter.length > 3
        ? state.all.filter(
            i =>
              i.processId === processId &&
              i.name.toLowerCase().includes(state.filter.toLowerCase())
          )
        : state.all.filter(o => o.processId === processId);
    };
  }
};

const actions = {

  async init(context) {
    console.log("Init project sub state: " + context.getters["subscribed"]);
    if (context.rootGetters["auth/session"]) {
      try {
        apolloClient
          .subscribe({
            query: PROJECT.projectUpdated
          })
          .subscribe(response => {
            if (response.data.projectUpdated) {
              try {
                const { id } = response.data.projectUpdated;
                context.dispatch("findById", {
                  id,
                  force: true
                });
              } catch (e) {
                console.log(e);
              }
            }
          });
      } catch (ex) {
        console.log(ex);
      } finally {
        context.commit("SET_SUBSCRIBED", true);
      }
    }
  },
  async getProject(context) {
    try {
      apolloClient
        .subscribe({
          query: PROJECT.projectUpdated
        })
        .subscribe(response => {
          if (response.data.projectUpdated) {
            const project = new Project().deserialize(
              response.data.projectUpdated
            );
            project.loaded = true;
            context.commit("SET_ITEM", project);
          }
        });
    } catch (ex) {
      console.log(ex);
    }
  },

  async findByProcess(context, filter) {
    try {
      if (!context.state.loadedProcess.includes(filter.id) || filter.force) {
        context.commit("SET_LOADING", true);
        const query = apolloClient.watchQuery({
          query: PROJECT.projectFindMyAll,
          variables: {
            filter: {
              where: {
                field: "process_id",
                value: filter.id
              },
              orderBy: ["name"]
            }
          }
        });
        const { result } = await queryToPromise(query);
        context.commit("UNLOAD_PROCESS", filter.id);
        result.data.projectFindMyAll.map(o => {
          context.commit("SET_ITEM", new Project().deserialize(o));
        });
        context.commit("LOAD_PROCESS", filter.id);
      }
      return context.getters.byProcess(filter.id);
    } finally {
      context.commit("SET_LOADING", false);
    }
  },

  async findAll(context, { filter = null, force = false } = {}) {
    if (context.getters["all"].length === 0 || force) {
      filter = filter || {
        data: {
          orderBy: ["name"]
        }
      };

      filter.busy = context.getters["all"].length < 1;
      try {
        const query = apolloClient.watchQuery({
          query: PROJECT.projectFindMyAll,
          variables: {
            filter: filter.data
          }
        });

        const { result } = await queryToPromise(query);
        const results = result.data.projectFindMyAll.map(cr => {
          return new Project().deserialize(cr);
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
          query: PROJECT.findById,
          variables: filter
        });
        const { result } = await queryToPromise(query);
        const project = new Project().deserialize(result.data.projectFindById);
        project.loaded = true;
        context.commit("SET_ITEM", project);
        return project;
      } finally {
        filter.busy = false;
      }
    }
    return currentItem;
  },

  async evaluateIdea(context, { form, record }) {
    form.showMessage = false;
    const result = await form.mutate({
      mutation: PROJECT.projectEvaluateIdea
    });
    const resultRecord = result.data.projectEvaluateIdea;
    Object.assign(record, resultRecord);
    // const instanceInex = project.pendingEvaluations.findIndex(o => o.id === record.evaluationInstanceId);
    // const allRecords = project.pendingEvaluations[instanceInex].records;
    // const index = allRecords.findIndex(o => o.id === record.id);
    // if (index > -1) {
    //     allRecords.splice(index, 1, record);
    // }
    // project.pendingEvaluations[instanceInex].records = [...allRecords];
    // const newProject = new Project().deserialize(project);
    // newProject.loaded = true;
    // context.commit('SET_ITEM', newProject);
    return resultRecord;
  },

  async filter(context, filter) {
    context.commit("SET_FILTER", filter);
  }
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
  UNLOAD_PROCESS(state, value) {
    state.loadedProcess = state.loadedProcess.filter(o => o != value);
    state.all = state.all.filter(o => o.processId != value);
  },
  LOAD_PROCESS(state, value) {
    state.loadedProcess.push(value);
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
  REMOVE_ITEM(state, id) {
    state.all = state.all.filter(o => o.id != id);
  },
  SET_FILTER(state, value) {
    state.filter = value;
  },
  SET_SUBSCRIBED(state, value) {
    state.subscribed = value;
  }
};

export default {
  namespaced: true,
  state: state,
  getters: getters,
  actions: actions,
  mutations: mutations
};
