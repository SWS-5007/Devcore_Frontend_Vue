<template>
 <v-card class="score-card">
      <v-card-text ripple class="mb-0 pb-0 score-card-upper" @click="openScore">
        <p class="score-card-subtitle">{{ $t("Your Score") }} {{ user.engageScore > 0 ? user.engageScore : 0 }}</p>
        <p class="score-card-subtitle1">You are rank {{ scoreData.title }} in Devcore Oy</p>
        <!-- <div class="actions">
          <span class="score-card-action-details">{{ $t("Details") }}</span>
          <v-btn
            icon
            text
            color="primary"
            style="height: 22px; width: 22px"
            class="score-card-action-button"
          >
            <v-icon style="color: #fff" small>mdi-chevron-right</v-icon>
          </v-btn>
        </div> -->
      </v-card-text>
      <v-card-actions class="score-card-lower">
        <v-btn >{{$t("Unlock Reward")}}</v-btn>
        <!-- <div class="score-card-lower-score">
          <div class="score-card-lower-score-icon-outline">
            <i class="mdi mdi-star lower-score-icon"></i>
          </div>
          {{ user.engageScore > 0 ? user.engageScore : 0 }}
        </div>

        <div class="score-card-lower-badge">
          <div
            :class="scoreData.milestoneIcon"
            style="
              transform: scale(0.6) translate(0px, -5px);
              justify-content: flex-end;
              min-width: 50px;
            "
          ></div>
          <div
            class="score-card-lower-rank"
            style="justify-content: flex-end; align-self: center"
          >
            <div class="score-card-lower-rank-number">
              {{ scoreData.title }}
            </div>

            <div class="score-card-lower-description">
              {{ scoreData.description }}
            </div>
          </div>
        </div> -->
      </v-card-actions>
    </v-card>
</template>

<script>

export default {
  props:{
    user:{
      required:true
    },
    scoreData: {
      required:true
    }
  },
  methods:{
       openScore() {
      this.$router.push({
        name: "score",
        params: {
          id: this.user.id,
          tab: "stage",
        },
      });
    },
  }
}

</script>
<style>

.score-card {
  min-height: 100px;
  background: #eb7f34 !important;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.score-card-upper {
  font-weight: 500;
  color: #fff;
  letter-spacing: 1px;
  padding: 8px;
}
.score-card-lower {
  display: flex;
  flex-grow: 10;
  justify-content: right;
}
.score-card-lower .v-btn{
  padding: 8px 16px !important;
  color: #F87513;
}

.score-card-lower-rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 50px;
}

.score-card-subtitle1,
.score-card-subtitle {
  font-weight: 500;
  color: #fff;
  letter-spacing: 1px;
}

.score-card-subtitle1{
  font-size: 14px;
}

.score-card-subtitle {
  font-size: 18px;
}

.score-card-action-details {
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
  margin-right: 10px;
}

.score-card-action-button {
  background: #f59453;
  border-radius: 50%;
}

.score-card-lower-score {
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  max-width: 140px;
  background: #fff;
  border-radius: 15px;
  font-weight: 800;
  letter-spacing: 1px;
  font-size: 1.2rem;
  max-width: 140px;
}

.score-card-lower-badge {
  display: flex;
  place-content: center;
  height: 45px;
  max-width: 60%;
  margin-left: 5px;
}

.score-card-lower-description {
  font-size:8px;
  display: flex;
  flex-direction: column;
   max-width: 100px;
  font-weight: 400;
  max-width: 200px;
  justify-content: center;
  letter-spacing: 1px;
  color: #fff;
  margin-left: 10px;
}

.score-card-lower-rank {
  display: flex;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
}
.score-card-lower-score,
.score-card-lower-description {
  flex-grow: 2;
}

.score-card-lower-badge {
  display: flex;
  place-content: flex-end;
}

.lower-score-icon::before {
  line-height: 24px;
  width: 100%;
  height: 100%;
  content: "\F04CE";
  margin-left: 1px;
}

.lower-score-icon {
  display: flex;
  text-align: center;
  border-radius: 50%;
  border: 3px solid #fabc52;
  color: #fff;
  background: #f59453;
  height: 30px;
  width: 30px;
  margin-right: 10px;
}
</style>