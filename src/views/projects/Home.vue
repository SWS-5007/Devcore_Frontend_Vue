<template>
  <div style="max-height: 90vh; margin-bottom: 64px;padding: 0 10px;"
    class="home animated h-90 slideInLeft faster d-flex flex-column py-5">
    <pull-to-refresh :refresh-fn="() => loadProjects(true)">
      <div class="project_home_container_items" v-if="!filter.busy">
        <score-card :user="user" :scoreData="getScoreData"></score-card>
        <div v-if="items.length > 0">
          <div v-for="item in items" :key="item.id" class="project-card__container">
            <project-card :project="item"></project-card>
          </div>
        </div>
        <empty-data v-else :text="$t('You don\'t have active projects!')"></empty-data>

        <div class="project_home_stages">
          <div class="project_home_stage_btn_box">
            <div class="project_home_stage_btn stage_btn_clicked">Stage</div>
            <v-icon class="project_home_stage_arrow">mdi-chevron-right</v-icon>
            <div class="project_home_stage_btn">Operation</div>
            <v-icon class="project_home_stage_arrow">mdi-chevron-right</v-icon>
            <div class="project_home_stage_btn">Phase</div>
          </div>

          <div class="project_home_stages_content">
            <div class="phs_element">
              <v-icon class="phs_element_star">mdi-star-outline</v-icon>
              <div class="phs_element_text">Stage Instruction</div>
              <div style="display: flex;">
                <v-divider vertical class="phs_element_divider"></v-divider>
                <v-btn class="phs_element_btn_buger" rounded text color="primary" elevation="0">
                  <v-icon class="phs_element_buger">mdi-menu</v-icon>
                </v-btn>
              </div>
            </div>

            <div class="phs_element">
              <v-icon class="phs_element_star">mdi-star-outline</v-icon>
              <div class="phs_element_text">Getting Started</div>
              <div style="display: flex;">
                <v-divider vertical class="phs_element_divider"></v-divider>
                <v-btn class="phs_element_btn_buger" rounded text color="primary" elevation="0">
                  <v-icon class="phs_element_buger">mdi-menu</v-icon>
                </v-btn>
              </div>
            </div>
          </div>

          <div class="project_home_search">
            <div class="project_home_search_form">
              <input class="phs_serach_form_input" placeholder="Search for documents" />
              <v-btn class="phs_search_btn">
                <v-icon color="white" small>mdi-magnify</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
      <page-loader v-else></page-loader>
    </pull-to-refresh>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Card from "./Card";
import ScoreCard from "../../components/global/ScoreCard.vue";

export default {
  components: {
    "project-card": Card,
    "score-card": ScoreCard,
  },
  data: () => ({
    filter: {
      busy: false,
      force: true,
    },
    slides: [
      {
        title: null,
        show: false,
        description: "",
        number: 1,
        name: "competitive",
        hasCondition: false,
      },
      {
        title: null,
        show: false,
        description: "",
        number: 2,
        name: "versus",
        hasCondition: true,
      },
      {
        title: null,
        show: false,
        description: "",
        number: 3,
        name: "achiever",
        hasCondition: false,
      },
      {
        title: null,
        show: false,
        description: "",
        number: 4,
        name: "philanthropist",
        hasCondition: false,
      },
      {
        title: null,
        show: false,
        description: "",
        number: 5,
        name: "Helper",
        hasCondition: false,
      },
    ],
  }),

  computed: {
    ...mapGetters({
      projectsAll: "project/all",
      projects: "project/filteredItems",
      milestones: "milestone/filteredItems",
      user: "auth/user",
    }),
    getSlides() {
      return this.slides.filter((x) => x.show);
    },
    getUserRolesSorted() {
      const allRoles = [...this.user.userRoleScores].sort(
        (a, b) => a.roleValue - b.roleValue
      );
      return allRoles;
    },
    getScoreData() {
      return {
        title: this.getYourTitleText,
        description: this.getYourDescriptionText,
        milestoneIcon: this.getYourMilestoneIcon,
      };
    },
    getYourMilestoneIcon() {
      return this.getMilestoneIcon(
        this.getSlides[this.user.profileScoreDisplay]
      );
    },
    getYourDescriptionText() {
      return this.getDescriptionText(
        this.getSlides[this.user.profileScoreDisplay]
      );
    },
    getYourTitleText() {
      return this.getTitleText(this.getSlides[this.user.profileScoreDisplay]);
    },
    getSortedMilestones() {
      return [...this.milestones].sort(
        (a, b) => a.requiredScore - b.requiredScore
      );
    },
    getMilestoneIndex: {
      get: function () {
        const index = this.milestones.findIndex(
          (x) => x.id === this.user.activeMilestone.id
        );
        return index + 1;
      },
    },

    items: {
      get: function () {
        const projects = [...this.projects].sort((a, b) => {
          if (a.hasUserPendingEvaluations && !b.hasUserPendingEvaluations) {
            return -1;
          }
          if (b.hasUserPendingEvaluations && !a.hasUserPendingEvaluations) {
            return 1;
          }
          return a.name > b.name ? 1 : -1;
        });

        return projects.filter((project) => project.activeIdeaCount > 0);
      },
    },
  },
  async mounted() {
    //await this.redirectIfFirstLogin();
    await this.$store.dispatch("auth/init");
    await this.loadProjects();
    await this.loadScore();
    await this.enableSlides();
  },
  methods: {
    async redirectIfFirstLogin() {
      const route = this.$route.query;
      if (route) {
        if (route && this.user.mustChangePassword) {
          await this.$router.replace(
            {
              name: "settings",
              query: {
                i: new Date().getTime(),
              },
            },
            () => { },
            () => { }
          );
        }
      }
    },
    getMilestoneIcon(slide) {
      if (!slide) return;
      const sorted = this.getSortedMilestones;
      if (slide.number && this.user.activeMilestone) {
        const userIndex = sorted.findIndex(
          (x) => x.id == this.user.activeMilestone.id
        );

        return `milestone_rank_${userIndex + 1}`;
      }

      return `milestone_rank_0`;
    },
    getDescriptionText(slide) {
      if (!slide) return;
      if (slide.number == 1 && slide.show) {
        return this.$t("Your rank in company!", {
          company: this.user.company.name,
        });
      } else if (slide.number == 2 && slide.show) {
        const contender = this.getUserRolesSorted.find((x) => x.isAgainst);
        return this.$t("Don't let competitor win!", {
          role: contender.role ? contender.role : "",
        });
      } else if (slide.number == 3 && slide.show) {
        return this.$t("Keep going, soon reaching next milestone!");
      } else if (slide.number == 4 && slide.show) {
        return this.$t("Are using your idea that you helped to create!");
      } else if (slide.number == 5 && slide.show) {
        return this.$t("Value shared to your co-workers! Good job!");
      } else {
        return this.$t("Your rank in company!", {
          company: this.user.company.name,
        });
      }
    },
    getCompetitiveData() {
      return `${this.user.userScoreRank}#`;
    },
    getAchieverData() {
      let nextMilestone = null;
      const milestonesSorted = [...this.milestones].sort(
        (a, b) => a.requiredScore - b.requiredScore
      );
      if (this.user.activeMilestone && milestonesSorted[0]) {
        const activeMilestoneIndex = milestonesSorted.findIndex(
          (x) => x.id == this.user.activeMilestone.id
        );
        if (milestonesSorted[activeMilestoneIndex + 1]) {
          const next = milestonesSorted[activeMilestoneIndex + 1].requiredScore;
          nextMilestone = next;
        }
      }
      if (!nextMilestone) {
        return "100%";
      }

      const x = this.user.activeMilestone.requiredScore;
      const y = nextMilestone;

      const division = (this.user.engageScore - x) / (y - x);
      if (division > 0) {
        return Math.round(division * 100) + "%";
      }
      return "0%";
    },
    getVersusData() {
      const versusData = {
        current: null,
        contender: null,
      };
      const curRoleIndex = this.getUserRolesSorted.findIndex(
        (x) => x.roleId == this.user.companyRole.id
      );
      versusData.current = this.getUserRolesSorted[curRoleIndex];
      if (this.getUserRolesSorted[curRoleIndex + 1]) {
        versusData.contender = this.getUserRolesSorted[curRoleIndex + 1];
      } else {
        versusData.contender = this.getUserRolesSorted[curRoleIndex - 1];
      }

      return versusData;
    },
    getPhilantropistData() {
      const getUserIdeaCountFromProject = (project) => {
        let _userIds = [];
        if (
          project.userIdeas &&
          project.userIdeas.length > 0 &&
          project.usersCount > 0
        ) {
          let authoredProjectIdeas = project.userIdeas.filter(
            (x) => x.idea.author.id === this.user.id
          );
          if (authoredProjectIdeas.length > 0) {
            project.users.forEach((user) => _userIds.push(user.id));
          }
        }
        return _userIds;
      };

      let userIds = [];
      this.projectsAll.forEach((project) => {
        userIds.push(getUserIdeaCountFromProject(project));
      });
      return [...new Set(userIds.flat())].length;
    },
    getTitleText(slide) {
      if (!slide) return;
      if (slide.number == 1 && slide.show) {
        return this.getCompetitiveData();
      } else if (slide.number == 2 && slide.show) {
        const versusData = this.getVersusData();
        if (versusData.contender && versusData.current) {
          const total =
            versusData.contender.roleValue + versusData.current.roleValue;
          const currentPercentage = versusData.current.roleValue / total;
          return Math.round(currentPercentage * 100) + "%";
        }
      } else if (slide.number == 3 && slide.show) {
        return this.getAchieverData();
      } else if (slide.number == 4 && slide.show) {
        return this.getPhilantropistData();
      } else {
        return this.user.userSharedValue;
      }
    },
    async loadScore(force = true) {
      await this.$store.dispatch("milestone/findAll", {
        force: true,
      });
    },
    async loadProjects(force = true) {
      await this.$store.dispatch("project/findAll", {
        //  filter: this.filter,
        filter: { where: { field: "userIdeas", op: "ne", value: [] } },
        force: force,
      });
    },
    async enableSlides() {
      //Condition for slide 2. Competitive role.

      this.slides.forEach((slide) => {
        if (!slide.hasCondition) {
          slide.show = true;
        } else if (slide.number == 2) {
          if (this.user.userRoleScores.length < 2) {
            slide.show = false;
          } else if (
            this.user.userRoleScores[0].roleValue &&
            this.user.userRoleScores[1].roleValue
          ) {
            slide.show = true;
          } else {
            slide.show = false;
          }
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
.project_home_search {
  position: absolute;
  height: 96px;
  left: 0px;
  right: 0px;
  bottom: -70px;
  padding: 16px;
  background: #FFFFFF;
  box-shadow: 0px -4px 16px rgba(165, 165, 165, 0.15);
  border-radius: 10px 10px 0px 0px;
}

.project_home_search_form {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  height: 64px;
  padding: 12px 12px 12px 24px;
  background: #F6F6F6;
  border-radius: 8px;
}

.phs_serach_form_input {
  width: 100%;
  height: 100%;
  background-color: transparent !important;
  border: unset !important;
}

.phs_serach_form_input:active {
  border: unset !important;
}

.phs_serach_form_input:focus-visible {
  border: unset !important;
}

.phs_search_btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 40px !important;
  min-width: unset !important;
  height: 40px !important;
  background-color: #4294D0 !important;
  border-radius: 4px;
  padding: 0px !important;
}

.project_home_stages {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  gap: 8px;

  margin-top: 24px;
  background: #FFFFFF;
  box-shadow: 0px 4px 16px rgba(165, 165, 165, 0.15);
  border-radius: 8px;
}

.project_home_stage_btn_box {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
}

.project_home_stage_btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;

  width: 64px;
  height: 24px;

  background: #FFFFFF;
  border: 1px solid #ECF4FA;
  border-radius: 6px;

  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 150%;
}

.stage_btn_clicked {
  background: #4294D0;
  color: #FFFFFF;
}

.project_home_stage_arrow {
  width: 4px;
  height: 8px;
  color: #2E6892;
}

.project_home_stages_content {
  width: 100%;
  margin-top: 8px;
}

.phs_element {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  gap: 10px;
}

.phs_element_star {
  width: 12px;
  height: 11.41px;
  color: #4294D0;
}

.phs_element_text {
  width: 100%;
  padding: 8px 6px;
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 150%;
  color: #222222;
}

.phs_element_divider {
  height: 24px;
  background: #ECF4FA;
  margin: auto;
}

.phs_element_btn_buger {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  width: 24px !important;
  height: 24px !important;
  min-width: 0px !important;
  background: #FFFFFF;

  border: 1px solid #FFFFFF;
  border-radius: 4px;
}

.phs_element_buger {
  width: 10px;
  height: 6.67px;
  color: #4294D0;
}

@media screen and (min-width: 650px) {
  .project_home_container_items {
    display: flex;
    min-width: 650px;
    width: 50%;
    flex-direction: column;
    margin: auto;
  }
}


.project-card__container:last-child {
  margin-bottom: 128px;
}
</style>