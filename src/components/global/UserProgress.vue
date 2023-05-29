<template>
  <div class="user_profile_progression">
    <div class="user_profile_level" style="max-height: 50px">
      <div class="user_profile_level_badge">
        <div class="user_profile_level_badge-container" v-if="showIcons">
          <div :class="getPreviousRank()" style="transform: scale(0.8)"></div>
        </div>
        <div v-else class="user_profile_reward_badge-container-item-before">
          <div class="user_profile_reward_badge-container-item-before-text">
            {{ $t("Level") }}
          </div>
          <div class="user_profile_reward_badge-container-item-before-value">
            {{ currentMilestoneIndex + 1 }}
          </div>
        </div>
      </div>

      <div class="user_profile_level_progress" style="align-self: center">
        <div class="user_profile_level_progress-container">
          <div class="user_profile_level_progress-container-bar">
            <div
              v-for="(item, index) in progress"
              :key="index"
              class="user_profile_level_progress-container-bar-item"
            >
              <div
                v-if="item.achieved"
                class="progress-bar-active"
                :class="[getSelector(index)]"
              >
                <div class="progress-bar-circle"></div>

                <div
                  style="height: 100%; max-width: 40px"
                  v-if="getSelector(index) == 'progress-bar-last'"
                >
                  <div
                    ref="progress-bar-circle-icon-active"
                    style="transform: scale(0.3) translate(0, -60px)"
                  ></div>
                </div>
              </div>
              <div
                v-else
                class="progress-bar-not-active"
                :class="[getSelector(index)]"
              >
                <div
                  class="progress-bar-circle"
                  v-if="getSelector(index) !== 'progress-bar-last'"
                ></div>
                <div v-else>
                  <div
                    class="score-card-score-competitive-icon-progress-bar"
                    v-if="showIcons"
                  >
                    <i class="mdi mdi-star score-competitive-icon-progress"></i>
                  </div>

                  <div
                    class="user_profile_level_progress-container-bar-item"
                    style="
                      display: flex;
                      width: 10px;
                      background: #4294d0;
                      align-items: center;
                      border-radius: 0px 10px 10px 0px;
                    "
                    v-else
                  >
                    <div
                      style="
                        width: 8px;
                        height: 8px;
                        background: lightgray;
                        border-radius: 50%;
                      "
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="user_profile_level_progress_level" v-if="showIcons">
        <div :class="getNextRank()" style="transform: scale(0.8)"></div>
      </div>
      <div v-else class="user_profile_reward_badge-container-item-after">
        <div class="user_profile_reward_badge-container-item-after-text">
          {{ nextMilestoneIndex ? $t("Level") : "" }}
        </div>
        <div class="user_profile_reward_badge-container-item-after-value">
          {{ nextMilestoneIndex ? nextMilestoneIndex + 1 : "" }}
        </div>
      </div>
    </div>

    <div v-if="showMilestone">
      <div class="user_profile_milestone_reward">
        <span style="background: #f8f8f8">{{ getNextReward }}</span>
      </div>
      <div class="user_profile_milestone_description">
        <span style="background: #f8f8f8"> {{ getNextDescription }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";

const rankMap = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
};

export default {
  props: {
    progress: {
      type: Array,
      default: () => [],
      required: true,
    },
    currentMilestoneIndex: {
      type: Number,
      default: () => 0,
    },
    nextMilestoneIndex: {
      type: Number,
      default: () => 1,
    },
    showIcons: {
      type: Boolean,
      default: () => false,
    },
    showMilestone: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      milestones: "milestone/all",
    }),
    getSortedMilestones() {
      return [...this.milestones].sort(
        (a, b) => a.requiredScore - b.requiredScore
      );
    },
    getNextReward() {
      //milestone created and user has zero points
      if (this.getSortedMilestones[0]) {
        if (
          this.nextMilestoneIndex == null &&
          this.currentMilestoneIndex == null
        ) {
          return this.getSortedMilestones[0].title;
        }

        if (this.nextMilestoneIndex === 1) {
          if (
            this.getSortedMilestones[0].requiredScore > this.user.engageScore
          ) {
            return this.getSortedMilestones[0].title;
          }
        }

        const title = this.getSortedMilestones[this.nextMilestoneIndex]
          ? this.getSortedMilestones[this.nextMilestoneIndex].title
          : "";
        return title;
      } else {
        return "";
      }
    },
    getNextDescription() {
      //milestone created and user has zero points
      if (this.getSortedMilestones[0]) {
        if (
          this.nextMilestoneIndex == null &&
          this.currentMilestoneIndex == null
        ) {
          return this.getSortedMilestones[0].description;
        }
        const title = this.getSortedMilestones[this.nextMilestoneIndex]
          ? this.getSortedMilestones[this.nextMilestoneIndex].description
          : "";
        return title;
      } else {
        return "";
      }
    },

    getMarkerText() {
      if (this.user.userScoreRank < 11) {
        return `${this.$t("Rank")} ${rankMap[this.user.userScoreRank]}`;
      } else {
        return `${this.$t("Rank")} > 10`;
      }
    },
    getCurrentLevel() {
      if (this.progress && this.progress.length > 0) {
        return this.progress.filter((x) => x.achieved).length;
      }
      return "0";
    },
    getNextLevel() {
      if (this.progress && this.progress.length > 0) {
        return this.progress.filter((x) => x.achieved).length + 1;
      }
      return "5";
    },
  },
  methods: {
    getPreviousRank() {
      if (
        this.currentMilestoneIndex !== null &&
        this.currentMilestoneIndex !== undefined
      ) {
        return `milestone_rank_${this.currentMilestoneIndex + 1}`;
      }
      return `milestone_rank_0`;
    },
    getNextRank() {
      if (
        this.currentMilestoneIndex !== null &&
        this.currentMilestoneIndex !== undefined
      ) {
        if (this.getSortedMilestones[this.currentMilestoneIndex + 1]) {
          return `milestone_rank_${this.currentMilestoneIndex + 2}`;
        } else {
          return "";
        }
      }
      return `milestone_rank_1`;
    },
    isLastActive(index) {
      let selector = "";
      if (this.progress.length > 0) {
        const isLast = this.progress.filter((x) => x.achieved).length == index;
        selector = isLast ? "item-last" : "item-not-last";
      }
      return selector;
    },
    getSelector(index) {
      if (index === 0) {
        return "progress-bar-first";
      } else if (index == this.progress.filter((x) => x.achieved).length) {
        return "progress-bar-last";
      } else {
        return "progress-bar-center";
      }
    },
  },
};
</script>
<style scoped>
.user_profile_reward_badge-container-item-before,
.user_profile_reward_badge-container-item-after {
  font-weight: 400;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 5px;
}
.user_profile_reward_badge-container-item-before-value,
.user_profile_reward_badge-container-item-after-value {
  line-height: 10px;
  font-weight: 600;
  /*  font-size: 12px; */
}
.user_profile_reward_badge-container-item-after-text,
.user_profile_reward_badge-container-item-before-text {
  font-size: 8px;
}

.user_profile_milestone_reward {
  font-size: 15px;
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
}

.user_profile_milestone_description {
  color: #bdbdbd;
  font-size: 13px;
  font-weight: 600;
  padding-bottom: 20px;
  text-align: center;
}

.user_profile_progression {
  width: 100%;
}

.user_profile_reward_badge-container-item-before {
  background: #4294d0;
  color: #fff;
}
.user_profile_reward_badge-container-item-after {
  background: transparent;
  color: #000;
  height: 100%;
  place-self: center;
}

.user_profile_level {
  display: flex;
  height: 100px;
  justify-content: space-between;
}
.user_profile_level_reward > .user_profile_level_reward-item {
  margin: 0 3px;
}
.user_profile_level_text {
  font-size: 14px;
  font-weight: 600;
  margin: 5px;
}

.user_profile_level_reward {
  display: flex;
}
.user_profile_level_badge {
  min-width: 50px;
  flex-grow: 1;
}
.user_profile_level_progress {
  flex-grow: 10;
  display: flex;
  align-self: flex-start;
}
.user_profile_level_progress_level {
  flex-grow: 1;
}

.user_profile_level_progress_level {
  display: flex;
  flex-direction: column;
  min-width: 50px;
  align-items: center;
  justify-content: center;
}

.user_profile_level_progress {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
}
.user_profile_level_badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user_profile_level_progress-level {
  width: 100%;
  margin-right: 50px;
  transform: translate(-50px, 0);
}
.user_profile_level_badge-level-level {
  font-size: 10px;
}
.user_profile_level_badge-text-number {
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  line-height: 10px;
}

.user_profile_level_progress-container {
  background: #f8f8f8;
  width: 100%;
  height: 25px;
  border-radius: 20px;
  border: solid 1px lightgray;
  display: flex;
  justify-content: center;
  align-items: center;
}
.user_profile_level_progress-container-bar {
  width: 100%;
  height: 10px;
  margin: 0 5px;
  display: flex;
  justify-content: space-between;
}

.user_profile_level_progress-container-bar-item {
  align-self: center;
  width: 100%;
  height: 15px;
  background: transparent;
}
.container-bar-item-active > .progress-bar-first {
  padding-left: 3px;
  border-radius: 10px 0 0 10px;
}

.user_profile_level_progress-container-bar
  .user_profile_level_progress-container-bar-item:last-of-type
  .progress-bar-active {
  border-radius: 0px 10px 10px 0px;
}

.user_profile_level_progress-container-bar
  > .user_profile_level_progress-container-bar-item
  .container-bar-item-active
  > .progress-bar-first.item-last {
  padding-left: 3px;
  border-radius: 10px;
}

.progress-bar-active {
  background: #4294d0;
}

.container-bar-item-active > .container-bar-item-active:last-of-type {
  border-radius: 0 10px 10px 0;
}
.container-bar-item-active {
  height: 15px;
}
.progress-bar-not-active,
.progress-bar-active {
  height: 15px;
  display: flex;
  align-items: center;
  width: 100%;
}
.user_profile_level_badge-text-level,
.user_profile_level_badge-level-level {
  font-size: 10px;
  letter-spacing: 1px;
}

.user_profile_level_progress-container-bar-item
  > .progress-bar-active
  > .progress-bar-circle {
  width: 8px;
  height: 8px;
  background: #76c5ff;
  border-radius: 50%;
}

.user_profile_level_progress-container-bar-item
  > .progress-bar-not-active
  > .progress-bar-circle {
  width: 8px;
  height: 8px;
  background: lightgray;
  border-radius: 50%;
}

/* Override upper rule because first */
.progress-bar-not-active.progress-bar-first.item-not-last
  > .progress-bar-circle {
}

.progress-bar-circle {
  margin-left: 3px;
}

.progress-bar-first {
  border-radius: 10px 0 0 10px;
}

.user_profile_level_badge-level-level,
.user_profile_level_badge-level-number {
  font-weight: 400;
  font-size: 15px;
}

.score-card-score-competitive-icon {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.score-card-score-competitive-icon-progress-bar {
  background: linear-gradient(to right, #4294d0, #f8f8f8 50%);
}

.score-card-score-competitive-icon-progress-bar
  > .score-competitive-icon-progress {
  border: 1px solid #fff;
}

.score-competitive-icon-progress {
  display: flex;
  border-radius: 50%;
  border: 3px solid #fabc52;
  color: #fff;
  background: #f59453;
  height: 15px;
  width: 15px;
  max-width: 100px;
  max-height: 100px;
  align-items: center;
  text-align: center;
  place-content: center;
  justify-content: center;
}

.score-competitive-icon {
  display: flex;
  border-radius: 50%;
  border: 3px solid #fabc52;
  color: #fff;
  background: #f59453;
  height: 15px;
  width: 15px;
  max-width: 100px;
  max-height: 100px;
  align-items: center;
  text-align: center;
  place-content: center;
  justify-content: center;
}

.score-competitive-icon:before {
  display: flex;
  align-items: center;
  font-size: 10px;
}

.user_profile_level_progress-level-points {
  border: 1px solid lightgray;
  padding-left: 3px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  display: flex;
  width: 110px;
  justify-content: space-between;
  background: #fff;
  padding: 5px;
  border-radius: 10px;
  right: 50px;
}

.arrow {
  height: 13px;
  width: 15px;
  background-color: black;
  clip-path: polygon(0 0, 100% 0, 65% 100%, 60% 140%);
}

.arrow::before {
  content: "";
  display: block;
  position: relative;
  height: 13px;
  width: 15px;
  background-color: #fff;
  clip-path: polygon(0 0, 100% 0, 65% 100%, 60% 140%);
}
</style>