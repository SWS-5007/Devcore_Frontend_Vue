<template>
  <div class="score-card-score-competitive">
    <div class="score-card-score-competitive-icon">
      <i class="mdi mdi-star score-competitive-icon"></i>
    </div>
    <div class="score-card-score-competitive-value">
      <span> {{ user.engageScore }}</span>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
};
</script>
<style scoped>
.score-card-score-competitive {
  height: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  width: 200px;
  justify-content: space-evenly;
}

.score-card-score-competitive-value {
  font-weight: 600;
  color: #000;
  letter-spacing: 1px;
  line-height: 1;
  font-size: 40px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  margin-right: 20px;
}
.score-card-score-competitive-icon {
  width: 75%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 10px;
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
}

.score-competitive-icon:before {
  display: flex;
  align-items: center;
  font-size: 20px;
}
</style>