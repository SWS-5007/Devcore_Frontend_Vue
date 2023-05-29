import { apolloClient } from "@/plugins/apollo/client";
import { REPLY } from "@/graphql";
import { ReplyPaginate } from "@/models";
import { Reply } from "@/models";
import { queryToPromise } from "../lib/utils";

const initialState = () => {
  return {
    loading: false,
    all: [],
    filter: null,
    paginated: [],
    pageInfo: {}
  };
};

const state = initialState();

const getters = {
  loading: state => state.loading,
  filter: state => state.filter,
  all: state => state.all,
  paginated: state => state.paginated,
  pageInfo: state => state.pageInfo
};

const actions = {

  async findByPaginate(context, { filter = null, force = false } = {}) {
    if (context.getters["paginated"].length === 0 || force) {
      filter = filter || {
        data: {
          perPage: 3,
          page: 1,
          where: {
            and: [
              {
                field: "issue_id",
                op: "notnull",
                or: [
                  {
                    field: "idea_id",
                    op: "notnull",
                    or: [
                      {
                        field: "idea_issue_id",
                        op: "notnull"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };
      filter.busy = context.getters["paginated"].length < 1;
      try {
        const query = apolloClient.watchQuery({
          query: REPLY.findAllPaginated,
          variables: {
            filter: filter.data
          }
        });

        const { result } = await queryToPromise(query);
        const results = result.data.ideaIssueReplyFind.edges.map(r => {
          return new Reply().deserialize(r.node);
        });
        context.commit(
          "SET_PAGE_INFO",
          result.data.ideaIssueReplyFind.pageInfo
        );
        context.commit("SET_PAGINATED", results);
        return results;
      } finally {
        filter.busy = false;
      }
    }
    return context.getters["paginated"];
  },
  async findAll(context, { filter = null, force = false } = {}) {
    if (context.getters["all"].length === 0 || force) {
      filter = filter || {
        data: {
          orderBy: ["created_at"]
        }
      };
      filter.busy = context.getters["all"].length < 1;
      try {
        const query = apolloClient.watchQuery({
          query: REPLY.findAll,
          variables: {
            filter: filter.data
          }
        });
        const { result } = await queryToPromise(query);
        const results = result.data.ideaIssueReplyFindAll.map(cr => {
          return new Reply().deserialize(cr);
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

  SET_ALL(state, reply) {
    state.all = reply;
  },
  SET_PAGE_INFO(state, info) {
    state.pageInfo = info;
  },
  SET_PAGINATED(state, reply) {
    state.paginated = reply;
  },
  SET_ITEM(state, value) {
    const index = state.all.findIndex(el => el.id === value.id);
    if (index > -1) {
      state.all[index] = value;
      state.all = [...state.all];
    } else {
      state.all.push(value);
    }
  }
};

export default {
  namespaced: true,
  state: state,
  getters: getters,
  actions: actions,
  mutations: mutations
};
