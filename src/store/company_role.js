import {
  COMPANY_ROLE
} from '@/graphql';
import {
  CompanyRole
} from '@/models';
import {
  queryToPromise
} from '../lib/utils';
import {
  apolloClient
} from '../plugins/apollo/client';
import {
  AppStorage
} from '@/lib/appstorage';
import EventBus from '@/lib/eventbus';


const initialState = () => {
  return {
      loading: false,
      all: [],
      filter: null,
      storage: AppStorage.get('CURRENT_COMPANY_ROLE', {

      }),
  }
};



function loadCurrent(state, section) {
  let current = null;
  if (!section) {
      return current;
  }
  state.storage[section] = state.storage[section] || {};

  if (state.storage[section].roleId) {
      current = state.all.find(p => p.id === state.storage[section].roleId);
  }
  return current;
}



const state = initialState();



const getters = {
  loading: state => state.loading,
  current: (state) => {
      return (section) => {
          return loadCurrent(state, section);
      }
  },
  all: state => state.all,
  filter: state => state.filter,
  filteredItems: state => state.filter && state.filter.length > 3 ? state.all.filter(i => i.name.toLowerCase().includes(state.filter.toLowerCase())) : state.all,
}



const actions = {
  async create(context, form) {
      const result = await form.mutate({
          mutation: COMPANY_ROLE.create,
          /* update(cache, result) {
              const { companyRoleFindAll } = cache.readQuery({ query: COMPANY_ROLE.findAll });
              cache.writeQuery({
                  query: COMPANY_ROLE.findAll,
                  data: { companyRoleFindAll: companyRoleFindAll.concat([result.data.companyRoleCreate]) },
              });
          } */
      });
      const role = new CompanyRole().deserialize(result.data.companyRoleCreate);
      await context.dispatch('findAll', {
          force: true
      });
      return role;
  },

  async update(context, form) {
      const result = await form.mutate({
          mutation: COMPANY_ROLE.update,
          variables: {
              id: form.id
          }
      });
      const role = new CompanyRole().deserialize(result.data.companyRoleUpdate);
      await context.dispatch('findAll', {
          force: true
      });
      return role;
  },

  async delete(context, form) {
      const result = await form.mutate({
          mutation: COMPANY_ROLE.delete
      });
      await context.dispatch('findAll', {
          force: true
      });
      return result.data.companyRoleDelete;
  },

  async findAll(context, {
      filter = null,
      force = false
  } = {}) {
      if (context.getters.all.length === 0 || force) {
          filter = filter || {
              data: {
                  orderBy: ["name"]
              }

          };
          filter.busy = context.getters.all.length < 1;

          try {
              const query = apolloClient.watchQuery({
                  query: COMPANY_ROLE.findAll,
                  // variables: { filter: filter.data }
              })
              const {
                  result
              } = await queryToPromise(query);
              if (!result.data) {
                  return;
              }
              const results = result.data.companyRoleFindAll.map(cr => {
                  return new CompanyRole().deserialize(cr);
              })
              context.commit("SET_ALL", results);
              return results;
          } finally {
              filter.busy = false;
          }
      }
      return context.getters.all;
  },

  async filter(context, filter) {
      context.commit('SET_FILTER', filter);
  },

  async refreshCurrent(context, section) {
      if (context.getters.current(section)) {
          return context.dispatch("findById", {
              id: context.getters.current(section).id,
              force: true
          })
      }

  },

  async setCurrent(context, {
      section,
      role
  }) {
      context.commit('SET_CURRENT_ROLE', {
          section,
          role
      });
      EventBus.$emit('companyRole/changeCurrent', {
          section,
          role
      })
  }

}


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
  },
  SET_CURRENT_ROLE(state, {
      section,
      role
  }) {
      AppStorage.set('CURRENT_COMPANY_ROLE', Object.assign(AppStorage.get('CURRENT_COMPANY_ROLE', {}), {
          [section]: {
              roleId: role ? role.id : null,
          }
      }));
      state.storage = AppStorage.get('CURRENT_COMPANY_ROLE');
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}