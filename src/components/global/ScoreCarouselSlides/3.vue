<template>
  <div class="score-card-achiever">
    <div
      class="score-card-score-achiever-first"
      :style="{ width: getProgressWidth(getFirstRoleValue) }"
    >
      <div
        class="score-card-score-competitive-icon"
        v-if="parseInt(getVersusWidths(getFirstRoleValue)) > 20"
      >
        <i class="mdi mdi-star score-competitive-icon"></i>
      </div>
      <div
        class="score-card-score-achiever-first-value"
        v-if="parseInt(getVersusWidths(getFirstRoleValue)) > 20"
      >
        {{ getVersusWidths(getFirstRoleValue) }}
      </div>
    </div>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters({
      user: "auth/user",
      milestones: "milestone/all",
    }),
    getFirstRoleValue() {
      return this.user.engageScore;
    },
    getNextMilestoneRequired() {
      const milestonesSorted = [...this.milestones].sort(
        (a, b) => a.requiredScore - b.requiredScore
      );

      if (this.user.activeMilestone && milestonesSorted[0]) {
        const activeMilestoneIndex = milestonesSorted.findIndex(
          (x) => x.id == this.user.activeMilestone.id
        );
        if (milestonesSorted[activeMilestoneIndex + 1]) {
          const next = milestonesSorted[activeMilestoneIndex + 1].requiredScore;
          return next;
        }
      }
      return 0;
    },
  },

  methods: {
    getProgressWidth(getFirstRoleValue) {
      const width = this.getVersusWidths(getFirstRoleValue);
      if (parseInt(width) < 3) {
        return "3%";
      }
      return width;
    },

    getVersusWidths(value) {
      if (!this.user.activeMilestone) {
        return 0;
      }

      const curRequired = this.user.activeMilestone.requiredScore;
      const nextRequird = this.getNextMilestoneRequired;

      if (!nextRequird) return "100%";
      if (!curRequired) return "0%";

      const div =
        this.getNextMilestoneRequired - this.user.activeMilestone.requiredScore;
      const calc =
        ((this.getFirstRoleValue - this.user.activeMilestone.requiredScore) /
          div) *
        100;
      return Math.round(calc) + "%";
    },
  },
};
</script>
<style scoped>
/* ROLE */
.score-card-score-achiever-first {
  background: #4294d0;
  height: 100%;
  flex-direction: row;
  display: flex;
  place-content: center;
  flex-wrap: wrap;
}

.score-card-achiever {
  background: #fff;
  height: 100%;
}
.score-card-score-achiever-first-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 4px solid #fabc52;
  background: #f59453;
  align-self: center;
}

.score-card-score-achiever-first-value {
  font-size: 18px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
  font-weight: 600;
  align-self: center;
  line-height: 1;
  color: #fff;
}

.score-card-score-competitive-icon {
  width: 30px;
  height: 30px;
  align-self: center;
}
.score-competitive-icon:before {
  display: flex;
  align-items: center;
  font-size: 20px;
}
.score-competitive-icon {
  display: flex;
  border-radius: 50%;
  border: 3px solid #fabc52;
  color: #fff;
  background: #f59453;
  height: 30px;
  width: 30px;
  max-width: 100px;
  max-height: 100px;
  align-items: center;
  text-align: center;
  place-content: center;
  justify-content: center;
  align-self: center;
}
</style>