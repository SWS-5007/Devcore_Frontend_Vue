<template>
  <div
    style="margin-bottom: 60px; overflow-y: scroll; height: 100%"
    infinite-wrapper
  >
    <!-- CAROUSEL -->
    <v-col cols="12" style="margin-bottom: 20px; padding: 10px">
      <div class="score-carousel-tab">
        <!-- TAB INDICATOR -->
        <div class="score-carousel-tab-items">
          <div
            v-for="(item, index) in getSlides"
            :key="index"
            @click="activeTab = index"
          >
            <div
              class="score-carousel-tab-item-dot"
              :style="{
                background: index == activeTab ? 'black' : 'lightgrey',
              }"
            ></div>
          </div>
        </div>
      </div>
      <div class="score-carousel-items">
        <score-carousel
          v-if="getSlides.length > 0"
          @tabChange="setActiveTab"
          :slides="getSlides"
          :activeTab="activeTab"
        >
          <div class="score-carousel-text">
            <div class="score-carousel-text-title" v-if="getSlides[activeTab]">
              {{ getSlides[activeTab].title }}
            </div>
            <div
              class="score-carousel-text-description"
              v-if="getSlides[activeTab]"
            >
              {{ getSlides[activeTab].description }}
            </div>
          </div>
        </score-carousel>
      </div>
    </v-col>
    <v-col cols="12">
      <!-- PROGRESSBAR -->
      <user-progress
        :currentMilestoneIndex="getCurrentMilestoneIndex"
        :nextMilestoneIndex="getNextMilestoneIndex"
        :progress="getUserProgress"
        :showIcons="true"
        :showMilestone="true"
      />
    </v-col>

    <div style="padding-top: 20px; border-top: 1px solid lightgray">
      <!-- ICONS -->

      <div class="score-icons">
        <div
          class="score-icons-item score-icons-issue"
          :class="
            isActiveType('ISSUE')
              ? 'score-icons-item-active'
              : 'score-icons-item-not-active'
          "
        >
          <div
            class="ico-feedback-issue-wrapper"
            @click="setSelectedType('ISSUE')"
          >
            <icoFeedbackIssue
              width="40px"
              height="40px"
              style="fill: #d04258; border-radius: 50%"
            ></icoFeedbackIssue>
          </div>
          <div class="score-icons-item-text">{{ $t("Issue") }}</div>
        </div>
        <div
          class="score-icons-item score-icons-item-idea"
          :class="
            isActiveType('IDEA')
              ? 'score-icons-item-active'
              : 'score-icons-item-not-active'
          "
        >
          <div
            class="ico-feedback-idea-wrapper"
            @click="setSelectedType('IDEA')"
          >
            <icoFeedbackIdea
              width="40px"
              height="40px"
              style="
                stroke: white;
                fill: white;
                background: #4294d0;
                border: 1px solid #4294d0;
                border-radius: 50%;
              "
            ></icoFeedbackIdea>
          </div>
          <div class="score-icons-item-text">{{ $t("Idea") }}</div>
        </div>
        <div
          class="score-icons-item score-icons-item-ideaissue"
          :class="
            isActiveType('IDEAISSUE')
              ? 'score-icons-item-active'
              : 'score-icons-item-not-active'
          "
        >
          <div
            class="ico-feedback-improvement-wrapper"
            @click="setSelectedType('IDEAISSUE')"
          >
            <icoFeedbackImprovement
              width="40px"
              height="40px"
              style="
                stroke: #f8f8f8;
                fill: #f8f8f8;
                background: #f59453;
                border-radius: 50%;
                stroke-width: 0.5px;
              "
            ></icoFeedbackImprovement>
          </div>
          <div class="score-icons-item-text">{{ $t("Improvement") }}</div>
        </div>
      </div>
    </div>

    <!-- FEEDBACK -->
    <v-col cols="12" style="margin-bottom: 40px; overflow-y: auto">
      <user-feedback :items="getItems" :selectedType="selectedType">
      </user-feedback>
      <InfiniteLoading
        :identifier="intent"
        force-use-infinite-wrapper="true"
        @infinite="refreshActiveReplies"
        :distance="500"
        :direction="'bottom'"
        spinner="spiral"
      >
        <span
          slot="no-more"
          style="
            font-size: 14px;
            height: 50px;
            font-weight: 600;
            display: flex;
            justify-content: center;
          "
        >
          <span v-if="!busy" style="background: #f8f8f8">
            {{ $tc("All replies visible", getItems.length) }}</span
          >
          <v-progress-circular
            v-else
            indeterminate
            color="lightgray"
          ></v-progress-circular>
        </span>
      </InfiniteLoading>

      <!-- </pull-to-refresh> -->
    </v-col>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
import InfiniteLoading from "vue-infinite-loading";
import ScoreCarousel from "@/components/global/ScoreCarousel.vue";
import UserProgress from "./global/UserProgress.vue";
import UserFeedback from "./global/UserFeedback.vue";
import EventBus from '@/lib/eventbus';
import icoFeedbackIdea from "../assets/img/feedback/user-feedback-idea.svg?inline";
import icoFeedbackIssue from "../assets/img/feedback/user-feedback-issue.svg?inline";
import icoFeedbackImprovement from "../assets/img/feedback/user-feedback-improvement.svg?inline";
import GQLForm from "@/lib/gqlform";

const filterItemFieldMap = {
  ISSUE: "issue_id",
  IDEA: "idea_id",
  IDEAISSUE: "idea_issue_id",
};
const filterItemVisibleMap = {
  true: "notnull",
  false: "isnull",
};

const createBlock = (_field, _operator) => {
  return {
    field: _field,
    op: _operator,
  };
};
const createFilter = (filterItems) => {
  const hideItemsFromQuery = (item) => {
    const { key } = item;
    const { visible } = item;
    return {
      field: filterItemFieldMap[key],
      op: filterItemVisibleMap[visible],
    };
  };

  //creates the filter string
  const createFilterQuery = (blocks) => {
    if (blocks.length === 0) return [];
    if (blocks.length === 1) {
      const firstBlock = createBlock(blocks[0].field, blocks[0].op);
      return [firstBlock];
    } else if (blocks.length === 2) {
      const firstBlock = createBlock(blocks[0].field, blocks[0].op);
      const secondBlock = createBlock(blocks[1].field, blocks[1].op);
      return [
        {
          ...firstBlock,
          and: [secondBlock],
        },
      ];
    } else if (blocks.length === 3) {
      const firstBlock = createBlock(blocks[0].field, blocks[0].op);
      const secondBlock = createBlock(blocks[1].field, blocks[1].op);
      const thirdBlock = createBlock(blocks[2].field, blocks[2].op);
      return [
        {
          ...firstBlock,
          and: [
            {
              ...secondBlock,
              and: [thirdBlock],
            },
          ],
        },
      ];
    } else {
      //displays all
      return [];
    }
  };

  //append query to hide elements
  const blocks = filterItems
    .filter((x) => !x.visible)
    .map((item) => hideItemsFromQuery(item));
  return createFilterQuery(blocks);
};

export default {
  async mounted() {
    this.activeTab = this.user.profileScoreDisplay
      ? this.user.profileScoreDisplay
      : 0;

    await this.initData();
    await this.enableSlides();
    this.createSlides();
    this.carouselTabs = this.getSlides.length;

    const that = this;

    EventBus.$on("auth/USERUPDATE", function (data) {
      that.initData();
    });
  },

  async beforeDestroy() {
    await this.$store.dispatch(
      "auth/changeScoreDisplay",
      new GQLForm({
        profileScoreDisplay: this.activeTab,
      })
    );
  },
  components: {
    InfiniteLoading,
    icoFeedbackIdea,
    icoFeedbackIssue,
    icoFeedbackImprovement,
    "score-carousel": ScoreCarousel,
    "user-progress": UserProgress,
    "user-feedback": UserFeedback,
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      milestones: "milestone/all",
      replies: "reply/all",
      repliesByPaginate: "reply/paginated",
      pageInfo: "reply/pageInfo",
      companyRoles: "companyRole/all",
    }),
    getSortedMilestones() {
      return [...this.milestones].sort(
        (a, b) => a.requiredScore - b.requiredScore
      );
    },

    getUserRolesSorted() {
      const allRoles = [...this.user.userRoleScores].sort(
        (a, b) => a.roleValue - b.roleValue
      );
      return allRoles;
    },

    getItems() {
      const visible = this.filterItems
        .filter((x) => x.visible)
        .map((y) => y.key);

      if (visible.length > 0) {
        //parse non visible
        const visibleItems = this.items.filter(
          (item) => visible.indexOf(item.type) > -1
        );
        //parse duplicates by ID of given type
        const issues = visibleItems.filter((x) => x.type === "ISSUE");
        const ideas = visibleItems.filter((x) => x.type === "IDEA");
        const ideaissues = visibleItems.filter((x) => x.type === "IDEAISSUE");

        const uniqueIssues = [
          ...new Map(issues.map((item) => [item["id"], item])).values(),
        ];
        const uniqueIdeas = [
          ...new Map(ideas.map((item) => [item["id"], item])).values(),
        ];
        const uniqueIdeaIssues = [
          ...new Map(ideaissues.map((item) => [item["id"], item])).values(),
        ];

        return [...uniqueIssues, ...uniqueIdeas, ...uniqueIdeaIssues].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }

      return [...this.items].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    getSlides() {
      return this.slides.filter((x) => x.show);
    },
    hasNextPage() {
      if (this.pageInfo) {
        return this.pageInfo.hasNextPage;
      }
      return false;
    },
    /*    getUserRewards() {
      const users = [];

      const getUsers = (_users) =>
        _users.filter((_user) => {
          return _user.userId === this.user.id;
        });

      this.getMilestonesSorted.forEach((x) => {
        users.push(...getUsers(x.users));
      });

      return users;
    }, */
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
      const progress = this.userProgress;

      const sorted = this.getMilestonesSorted;
      const currentMilestoneIndex = this.getCurrentMilestoneIndex;
      const nextMilestoneIndex = this.getNextMilestoneIndex;
      if (currentMilestoneIndex === null) {
        return this.userProgress;
      }

      if (nextMilestoneIndex === null) {
        progress.map((x) => (x.achieved = true));
        return progress;
      }

      const currentMilestone = sorted[currentMilestoneIndex];
      const nextMilestone = sorted[nextMilestoneIndex];

      const diffBetweenMilestones =
        nextMilestone.requiredScore - currentMilestone.requiredScore;

      const usersScoreOverCurrentMilestone =
        engageScore - currentMilestone.requiredScore;
      const userProgressed =
        (usersScoreOverCurrentMilestone / diffBetweenMilestones).toFixed(2) * 5;

      for (let i = 1; i <= userProgressed; i++) {
        progress[i - 1].achieved = true;
      }
      return progress;
    },
  },
  methods: {
    isActiveType(type) {
      return this.filterItems.find((x) => x.key == type).visible;
    },
    getCompetitiveData() {
      return `${this.user.userScoreRank}#`;
    },
    getAchieverData() {
      let nextRequired = 0;

      const activeMilestoneIndex = this.getSortedMilestones.findIndex(
        (x) => x.id == this.user.activeMilestone.id
      );

      if (this.getSortedMilestones[activeMilestoneIndex + 2]) {
        const next =
          this.getSortedMilestones[activeMilestoneIndex + 2].requiredScore;
        nextRequired = next - this.user.engageScore;
      }
      const total = this.user.engageScore + nextRequired;
      const division = (nextRequired / total) * 100;
      if (this.user.engageScore > nextRequired) return "100%";
      if (division < 30) return "30%";
      if (division > 100) return "100%";

      return Math.floor(division) + "%";
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
    createSlides() {
      //set slides content

      for (let i = 0; this.slides.length > i; i++) {
        if (this.slides[i].number == 1 && this.slides[i].show) {
          this.slides[i].description = this.$t("Your rank in company!", {
            company: this.user.company.name,
          });
          this.slides[i].title = `${this.user.userScoreRank}#`;
        } else if (this.slides[i].number == 2 && this.slides[i].show) {
          const curRoleIndex = this.getUserRolesSorted.findIndex(
            (x) => x.roleId == this.user.companyRole.id
          );
          const allRoles = this.getUserRolesSorted.sort(
            (a, b) => a.roleValue - b.roleValue
          );
          let contenderRole;
          if (allRoles[curRoleIndex + 1]) {
            contenderRole = allRoles[curRoleIndex + 1].role;
          } else {
            contenderRole = allRoles[curRoleIndex - 1].role;
          }

          this.slides[i].description = this.$t("Don't let competitor win!", {
            role: contenderRole,
          });
        } else if (this.slides[i].number == 3 && this.slides[i].show) {
          this.slides[i].description = this.$t(
            "Keep going, soon reaching next milestone!"
          );
        } else if (this.slides[i].number == 4 && this.slides[i].show) {
          this.slides[i].description = this.$t(
            "Are using your idea that you helped to create!"
          );
        } else {
          this.slides[i].description = this.$t(
            `Value shared to your co-workers! Good job!`
          );
        }
      }
    },
    async setSelectedType(type) {
      const item = this.filterItems.find((x) => x.key == type);
      item.visible = !item.visible;
      this.changeType();
    },
    changeType() {
      this.filterStatic.page = 1;
      this.items = [];
      this.intent = Math.random();
    },
    setActiveTab(value) {
      this.activeTab = value;
    },

    async initData() {
      await this.$store.dispatch("milestone/findAll", {
        force: true,
      });
      //await this.$store.dispatch("reply/init");
      await this.$store.dispatch("companyRole/findAll", { force: true });
    },
    async getActiveReplies() {
      this.busy = true;
      const filterQuery = createFilter(this.filterItems);
      this.filter = {
        data: {
          ...this.filterStatic,
          where: {
            and: filterQuery,
          },
        },
      };
      const response = await this.$store.dispatch("reply/findByPaginate", {
        filter: this.filter,
        force: true,
      });
      this.busy = false;
      return response;
    },

    async refreshActiveReplies($state) {
      try {
        const resp = await this.getActiveReplies();
        this.items = [...this.items, ...resp];
        if (!this.pageInfo.hasNextPage) {
          //last page reached... no more items to show.
          $state.loaded();
          $state.complete();
        } else {
          this.filterStatic.page += 1;
          $state.loaded();
        }
        this.busy = false;
      } catch (e) {
        console.error(e);
        $state.complete();
      }
    },
  },

  data: () => ({
    intent: Math.random(),
    filterItems: [
      {
        key: "ISSUE",
        visible: true,
      },
      {
        key: "IDEA",
        visible: true,
      },
      {
        key: "IDEAISSUE",
        visible: true,
      },
    ],
    items: [],
    activeFilter: [
      {
        field: "issue_id",
        op: "notnull",
        and: [
          {
            field: "idea_id",
            op: "notnull",
            or: [
              {
                field: "idea_issue_id",
                op: "notnull",
              },
            ],
          },
        ],
      },
    ],
    busy: false,
    page: 1,
    filterStatic: {
      perPage: 3,
      page: 1,
      orderBy: ["created_at"],
    },
    filter: {
      data: {
        perPage: null,
        page: 1,
        where: {
          field: "issue_id",
          op: "notnull",
        },
      },
    },
    selectedType: "ISSUE",
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
    activeTab: 0,
    carouselTabs: 5,
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
};
</script>

<style lang="scss">

.v-progress-circular__overlay {
  stroke: lightgray;
  stroke-width: 3px;
}
.ico-feedback-idea-wrapper {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ico-feedback-issue-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ico-feedback-improvement-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid lightgrey;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ico-feedback-issue-wrapper > svg path {
  transform: scale(1.2) translate(-2px, -2px);
}
.ico-feedback-idea-wrapper > svg > path {
  transform: scale(0.7) translate(5px, 5px);
}
.ico-feedback-improvement-wrapper > svg > path {
  transform: scale(0.7) translate(5px, 5px);
}
.score-icons-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
}
.score-icons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 12px;
  height: 80px;
}
.score-carousel-tab-items {
  display: flex;
  align-items: center;
  background: #f8f8f8;
}
.score-carousel-tab-item {
  flex-direction: row;
  display: flex;
  width: 20px;
  justify-content: center;
  align-items: center;
}

.score-carousel-tab {
  display: flex;
  justify-content: center;
  height: 30px;
}
.score-carousel-tab-item-dot {
  margin: 5px;
  height: 10px;
  width: 10px;
  border-radius: 50%;
}

.score-carousel-items {
  margin: 5px 10px;
  justify-content: space-between;
  display: flex;
}

.score-carousel-items > div > .v-window {
  border-radius: 40px;
  max-height: 120px;
  display: flex;
  max-width: 60%;
}

.score-carousel-items > div > .v-window > .v-window__container {
  height: 100%;
  width: 100%;
}

.score-carousel-items
  > div
  > .v-window
  > .v-window__container
  > .v-window-item
  > .v-carousel__item {
  width: 100%;
  height: 100%;
}

.score-carousel-text {
  margin-left: 12px;
  align-self: center;
  display: flex;
  width: 118px;
  flex-direction: column;
  place-content: center;
  z-index: 1;
}

.score-carousel-text-title {
  font-size: 26px;
  letter-spacing: 1px;
  font-weight: 600;
}
.score-carousel-text-title:before {
  font-weight: 800;
}
.score-carousel-text-description {
  font-size: 12px;
  font-weight: 600;
}

.score-icons-item-idea {
  border-left: 1px solid lightgray;
  border-right: 1px solid lightgray;
}

.score-icons-item-text {
  font-weight: 600;
  font-size: 13px;
  padding-top: 5px;
  background: #f8f8f8;
}

.score-icons-item-active {
  filter: grayscale(0);
}
.score-icons-item-not-active {
  filter: grayscale(1);
}
</style>