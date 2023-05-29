import { EXPERIENCE } from "@/graphql";
import { Experience } from "@/models";
import { User } from "@/models";

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
  all: state => state.all
};

const actions = {
  async update(context, form) {
    const result = await form.mutate({
      mutation: EXPERIENCE.increaseUserExperience
    });
    const experience = new Experience().deserialize(
      result.data.increaseUserExperience
    );

   context.rootGetters["auth/user"].experienceUsers = experience.user.experienceUsers;

    return experience;
  }
};

const mutations = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
