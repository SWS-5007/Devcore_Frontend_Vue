<template>
  <div class="score-card-score-versus">
    <div
      class="score-card-score-versus-first"
      :style="{ width: getVersusWidths(getFirstRoleValue) + '%' }"
      v-if="getFirstRoleValue > 0"
    >
      <div
        class="score-card-score-competitive-icon"
        v-if="getVersusWidths(getFirstRoleValue) > 25"
      >
        <i class="mdi mdi-star score-competitive-icon"></i>
      </div>
      <div
        class="score-card-score-versus-first-value"
        v-if="getVersusWidths(getFirstRoleValue) > 25"
      >
        {{ getVersusValue(getFirstRoleValue) }}%
      </div>
    </div>
    <div
      class="score-card-score-versus-second"
      :style="{ width: getVersusWidths(getSecondRoleValue) + '%' }"
      v-if="getSecondRoleValue > 0"
    >
      <div
        class="score-card-score-competitive-icon"
        v-if="getVersusWidths(getSecondRoleValue) > 25"
      >
        <i class="mdi mdi-star score-competitive-icon"></i>
      </div>
      <div
        class="score-card-score-versus-second-value"
        v-if="getVersusWidths(getSecondRoleValue) > 25"
      >
        {{ getVersusValue(getSecondRoleValue) }}%
      </div>
    </div>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";

export default {
  props: {
    item: null,
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      serverConfig: "app/serverConfig",
      companyRoles: "companyRole/all",
    }),
    getFirstRoleValue() {
      const firstRole = this.user.userRoleScores.find((x) => !x.isAgainst);
      const score = firstRole.roleValue ? firstRole.roleValue : 0;
      return score;
    },
    getSecondRoleValue() {
      const secondRole = this.user.userRoleScores.find((x) => x.isAgainst);
      const score = secondRole.roleValue ? secondRole.roleValue : 0;
      return score;
    },
  },
  methods: {
    getVersusWidths(value) {
      const total = this.getFirstRoleValue + this.getSecondRoleValue;
      const division = (value / total) * 100;

      return Math.round(division);
    },
    getVersusValue(value) {
      const total = this.getFirstRoleValue + this.getSecondRoleValue;
      const division = (value / total) * 100;
  
      return Math.round(division);
    },
  },
};
</script>
<style scoped>
.score-card-score-versus {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
}

.score-card-score-versus-first {
  background: #4294d0;
  height: 100%;
}

.score-card-score-versus-second {
  background: #d04258;
  height: 100%;
}

.score-card-score-versus-first,
.score-card-score-versus-second {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction:column;
  flex-wrap: wrap;
  align-content: center;
}

.score-card-score-versus-first-value,
.score-card-score-versus-second-value {
  font-size: 30px;
  font-weight: 600;
  align-self: center;
  line-height: 1;
  color: #fff;
  padding-left: 10px;
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