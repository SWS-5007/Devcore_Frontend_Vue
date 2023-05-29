<template>
  <div class="header-card pt-5 user_profile_page" id="user_profile_page">
    <div class="header center" style="text-align: center">
      <!-- <v-avatar color="white" class="border mb-4" size="90">
        <span class="primary--text headline">{{ user.initials }}</span>
      </v-avatar>-->
      <div style="display: flex; flex-direction: column">
        <span
          class="text-uppercase"
          style="font-size: 1.4em; font-weight: 600; background: #f8f8f8"
          >{{ user.fullName }}</span
        >
        <span
          class="primary--text text-uppercase"
          style="font-size: 1em; font-weight: 600; background: #f8f8f8"
          >{{ user.companyRole.name }}</span
        >
      </div>
    </div>
    <div class="content px-0" style="overflow-y: scroll; height: 80vh">
      <v-form @submit.prevent="save" @keyup="$validator.validateAll()">
        <v-container class fluid>
          <v-row>
            <v-col cols="12" class="px-0 py-0">
              <v-text-field
                v-model="user.company.name"
                class="inline inner"
                style="background: #f8f8f8"
                :label="$t('Company')"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="px-0 py-0">
              <v-text-field
                id="firstName"
                :disabled="form.busy"
                v-model="form.firstName"
                :label="$t('First name')"
                type="text"
                style="background: #f8f8f8"
                class="inline inner"
                name="firstName"
                :error="$validateState('firstName', form)"
                :error-messages="$displayError('firstName', form)"
                v-validate="'required|min:2'"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="px-0 py-0">
              <v-text-field
                id="lastName"
                :disabled="form.busy"
                v-model="form.lastName"
                :label="$t('Last name')"
                class="inline inner"
                style="background: #f8f8f8"
                type="text"
                name="lastName"
                :error="$validateState('lastName', form)"
                :error-messages="$displayError('lastName', form)"
                v-validate="'required|min:2'"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="px-0 py-0">
              <v-text-field
                id="email"
                :disabled="form.busy"
                v-model="form.email"
                :label="$t('Email')"
                style="background: #f8f8f8"
                class="inline inner"
                type="email"
                name="email"
                :error="$validateState('email', form)"
                :error-messages="$displayError('email', form)"
                v-validate="'required|email'"
              ></v-text-field>
            </v-col>
            <v-col cols="12 px-0 py-0">
              <v-expansion-panels
                class="no-borders"
                v-model="passwordPromptOpen"
              >
                <v-expansion-panel expand style="background: #f8f8f8">
                  <v-expansion-panel-header class="text-uppercase">{{
                    $t("Password")
                  }}</v-expansion-panel-header>
                  <v-expansion-panel-content
                    class="px-0"
                    style="background: #f8f8f8"
                    :key="intent"
                    :class="user.mustChangePassword ? 'shake-password' : ''"
                  >
                    <v-checkbox
                      class="inner"
                      v-model="form.changePassword"
                      :label="$t('Change password')"
                    ></v-checkbox>
                    <v-text-field
                      id="password"
                      :disabled="form.busy || !form.changePassword"
                      v-model="form.password"
                      :label="$t('Password')"
                      class="inline inner"
                      style="background: #f8f8f8"
                      type="password"
                      name="password"
                      ref="password"
                      :error="$validateState('password', form)"
                      :error-messages="$displayError('password', form)"
                      v-validate="{
                        required: this.form.changePassword,
                        min: 6,
                      }"
                    ></v-text-field>
                    <v-text-field
                      id="passwordConfirmation"
                      :disabled="form.busy || !form.changePassword"
                      v-model="form.passwordConfirmation"
                      :label="$t('Password confirmation')"
                      class="inline inner"
                      type="password"
                      style="background: #f8f8f8"
                      name="passwordConfirmation"
                      ref="passwordConfirmation"
                      :error="$validateState('passwordConfirmation', form)"
                      :error-messages="
                        $displayError('passwordConfirmation', form)
                      "
                      v-validate="{
                        required: this.form.changePassword,
                        min: 6,
                        confirmed: 'password',
                      }"
                    ></v-text-field>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
            <!-- User progress -->
            <v-col cols="12">
              <user-progress
                :currentMilestoneIndex="getCurrentMilestoneIndex"
                :nextMilestoneIndex="getNextMilestoneIndex"
                :progress="getUserProgress"
                :showIcons="false"
                :showMilestone="false"
                v-if="milestones.length > 0 && getCurrentMilestone"
            /></v-col>

            <v-col cols="12">
              <div class="user_profile_reward_badge-text">
                {{ $t("Rewards") }}
              </div>
              <div class="user_profile_reward_badge-container">
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    max-width: calc(100vw-40px);
                  "
                >
                  <div v-for="(item, index) in 6" :key="index">
                    <div
                      v-if="isRewardAchieved(index)"
                      @click="setRewardActive(index)"
                    >
                      <div
                        v-if="index < 2"
                        :style="{
                          background:
                            user.profileRewardActive === index
                              ? 'lightgray'
                              : '#4294d0',
                        }"
                        class="
                          user_profile_reward_badge-container-item-achieved
                        "
                      >
                        {{ index + 1 }}
                      </div>
                      <div
                        v-else
                        style="background: lightgray; border: 1px solid #4294d0"
                        class="
                          user_profile_reward_badge-container-item-not-achieved
                        "
                      >
                        <v-icon>mdi-tools</v-icon>
                      </div>
                    </div>

                    <div
                      v-else
                      class="
                        user_profile_reward_badge-container-item-not-achieved
                      "
                    >
                      <v-icon>lock</v-icon>
                    </div>
                  </div>
                </div>
              </div></v-col
            >

            <v-col cols="12" class="pt-6">
              <div class="user_profile_experience_container">
                <div
                  class="user_profile_experience_container-items"
                  v-for="(item, index) in getQuestData"
                  :key="index"
                  :class="[getExperienceItemClass(index)]"
                >
                  <div class="user_profile_experience-title">
                    <span style="background: #f8f8f8">{{ item.title }}</span>
                  </div>
                  <div class="user_profile_experience-bar">
                    <div
                      class="user_profile_experience-bar-progress"
                      v-if="getExperienceWidth(item) >= 5"
                      :style="{
                        width: `${getExperienceWidth(item)}%`,
                      }"
                    >
                      <span
                        style="padding: 7px; color: #f8f8f8; font-weight: 600"
                        v-if="item.user && getExperienceWidth(item) > 10"
                      >
                        {{ item.user ? item.user.experiencePoints : 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" class="pt-6">
              <v-btn
                color="primary"
                block
                rounded
                :loading="form.busy"
                :disabled="vErrors.any() || form.busy"
                class="text-uppercase"
                type="submit"
                >{{ $t("Save changes") }}</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-divider />
      <div class="my-4 px-8 text-center" fluid>
        <v-btn
          @click.stop="logout"
          color="danger"
          class="mx-3"
          rounded
          outlined
          >{{ $t("Sign out") }}</v-btn
        >

        <v-menu top offset-y>
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              class="mx-3 text-uppercase"
              rounded
              v-on="on"
              outlined
              >{{ form.lang }}</v-btn
            >
          </template>

          <v-list>
            <v-list-item
              hover
              v-for="(item, index) in serverConfig.langs"
              :key="index"
            >
              <v-list-item-title
                style="font-size: 12px; font-weight: 600; background: #f8f8f8"
                class="text-uppercase"
                @click="() => changeLang(item.code)"
                >{{ item.code }}: {{ item.nativeName }}</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
import UserProgress from "./global/UserProgress.vue";
import { blockUi } from "@/lib/utils";
export default {
  components: {
    "user-progress": UserProgress,
  },
  data: () => ({
    userProgress: [
      {
        level: 1,
        achieved: false,
      },
      {
        level: 2,
        achieved: false,
      },
      {
        level: 3,
        achieved: false,
      },
      {
        level: 4,
        achieved: false,
      },
      {
        level: 5,
        achieved: false,
      },
    ],
    intent: Math.random(),
    passwordPromptOpen: null,
    form: new GQLForm({
      file: null,
      firstName: null,
      lastName: null,
      email: null,
      changePassword: false,
      password: null,
      passwordConfirmation: null,
      deleteAvatar: null,
      lang: null,
    }),
  }),
  computed: {
    ...mapGetters({
      user: "auth/user",
      serverConfig: "app/serverConfig",
      milestones: "milestone/all",
    }),
    getUser() {
      return this.user;
    },
    getQuestData() {
      const quests = this.getUser.company.experienceQuests;
      quests.map(
        (q) =>
          (q["user"] = this.getUser.experienceUsers.find(
            (u) => u.questId == q.id
          ))
      );
      return quests;
    },
    getUserRewards() {
      const users = [];

      const getUsers = (_users) =>
        _users.filter((_user) => {
          return _user.userId === this.user.id;
        });

      this.getMilestonesSorted.forEach((x) => {
        users.push(...getUsers(x.users));
      });

      return users;
    },
    getMilestonesSorted() {
      return [...this.milestones].sort((a, b) =>
        a.requiredScore > b.requiredScore ? 1 : -1
      );
    },
    getCurrentMilestone() {
      return this.getMilestonesSorted[this.getCurrentMilestoneIndex];
    },
    getNextMilestoneIndex() {
      const next = this.getMilestonesSorted[this.getCurrentMilestoneIndex + 1]
        ? this.getCurrentMilestoneIndex + 1
        : null;
      return next;
    },
    getCurrentMilestoneIndex() {
      const { engageScore } = this.user;
      const hasAchieved = this.getMilestonesSorted.filter(
        (x) => x.requiredScore <= engageScore
      );
      const isAt = hasAchieved[hasAchieved.length - 1];
      if (isAt) {
        return this.getMilestonesSorted.findIndex((x) => x.id === isAt.id);
      } else {
        return null;
      }
    },
    getUserProgress() {
      const { engageScore } = this.user;
      const sorted = this.getMilestonesSorted;
      const sortedIndex = this.getCurrentMilestoneIndex;

      if (!sorted[sortedIndex + 1]) {
        const allTrue = [...this.userProgress].map((x, i) => {
          return {
            level: i,
            achieved: true,
          };
        });
        return allTrue;
      }
      const levels = [];

      const reduction =
        sorted[sortedIndex + 1].requiredScore -
        sorted[sortedIndex].requiredScore;

      const usersCurrentLevelPoints =
        engageScore - sorted[sortedIndex].requiredScore;
      const userLevelsAtCurrent = Math.floor(
        usersCurrentLevelPoints / (reduction / 5)
      );

      for (let i = 0; i < 5; i++) {
        const obj = {
          level: i,
          achieved: i < userLevelsAtCurrent + 1,
        };
        levels.push(obj);
      }

      return levels;
    },
  },
  async mounted() {
    this.initForm();
    await this.$store.dispatch("project/getProject");
    await this.$store.dispatch("milestone/findAll", { force: true });
  },
  watch: {
    $route: {
      immediate: true,
      handler(route) {
        if (route.query.i) {
          this.intent = Math.random();
          this.passwordPromptOpen = 0;
          this.form.changePassword = true;
          this.$nextTick(() => {
            this.$refs.password.focus();
          });
        }
      },
    },
  },

  methods: {
    async setRewardActive(index) {
      let value = index;
      if (index === this.user.profileRewardActive) {
        value = null;
      }
      await this.$store.dispatch(
        "auth/updateRewardActive",
        new GQLForm({
          profileRewardActive: value,
        })
      );
    },
    isRewardAchieved(index) {
      const questData = this.getQuestData;
      let totalExperience = 0;
      for (let i = 0; questData.length > i; i++) {
        if (questData[i].user) {
          totalExperience += questData[i].user.level;
        }
      }
      return Math.floor(totalExperience / 5) >= index + 1;
    },
    getExperienceWidth(item) {
      let minWidth = 0;
      if (item.user && item.user.experiencePoints > 0) {
        const required = item.requiredPoints * item.user.level;
        const userExp = item.user.experiencePoints;
        minWidth = Math.round((userExp / required) * 100);
      }

      return minWidth;
    },
    getExperienceItemClass(index) {
      let className = "experience-center";
      if (index === 0) className = "experience-first";
      if (index === this.user.company.experienceQuests.length - 1)
        className = "experience-last";
      return className;
    },
    async initForm() {
      Object.keys(this.user)
        .filter((key) => key in this.form)
        .forEach((key) => (this.form[key] = this.user[key]));
    },
    async logout() {
      blockUi();

      setTimeout(async () => {
        await this.$store.dispatch("auth/logout");
        await this.$router.replace({
          name: "login",
        });
      });
    },
    async changeLang(lang) {
      this.form.lang = lang;
      await this.save();
    },
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        await this.$store.dispatch("auth/updateProfile", this.form);
        this.initForm();
      }
    },
  },
};
</script>

<style scoped lang="scss">
@media screen and (min-width: 650px) {
  .user_profile_page {
    display: flex;
    min-width: 650px;
    width: 50%;
    flex-direction: column;
    margin: auto;
  }
}
.shake-password {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
}
@keyframes shake {
  10%,
  90% {
    opacity: 0.5;
    background: #4494d1;
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    opacity: 0.4;
    background: #4494d1;
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    opacity: 0.3;
    background: #4494d1;
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    opacity: 0.2;
    background: #4494d1;
    transform: translate3d(4px, 0, 0);
  }
}
.user_profile_page {
  overflow-y: scroll;
  max-height: 100vh;
  height: 100%;
  padding: 8px;
}
.user_profile_page::-webkit-scrollbar,
.content::-webkit-scrollbar {
  display: none;
}

.content,
.user_profile_page {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.user_profile_reward_badge-container-item-achieved,
.user_profile_reward_badge-container-item-not-achieved {
  font-weight: 400;
  font-size: 12px;
  color: #fff;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 5px;
}
.user_profile_reward_badge-container-item-achieved {
  background: #4294d0;
  border: 1px solid #4294d0;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: pointer;
}
.user_profile_reward_badge-container-item-not-achieved {
  background: #f8f8f8;
  border: 1px solid lightgray;
}

.user_profile_reward_badge-container {
  display: flex;
}
.user_profile_reward_badge-text {
  font-weight: 600;
  font-size: 12px;
  margin: 5px;
}

.user_profile_experience_container {
  border-radius: 20px;
  border: 2px solid lightgray;
}
.user_profile_experience_container-items {
  display: flex;
  padding: 10px;
  height: 60px;
  align-items: center;
}
.user_profile_experience-title {
  flex-grow: 1;
  max-width: 30%;
  font-weight: 600;
  font-size: 12px;
  padding: 10px;
}
.user_profile_experience-bar {
  flex-grow: 2;
  margin: 0 20px;
  height: 25px;
  background: lightgray;
  border-radius: 5px;
}

.experience-first,
.experience-center {
  border-bottom: 0.5px solid lightgray;
}

.user_profile_experience-bar-progress {
  background: #4294d0;
  height: 100%;
  border-radius: 5px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  display: flex;
  font-size: 12px;
}
</style>