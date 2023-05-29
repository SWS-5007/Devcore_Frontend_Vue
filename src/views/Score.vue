<template>
  <default-layout>
    <div
      class="settings h-100 animated slideInRight faster"
      style="height: 100vh; background: transparent"
    >
      <current-score class="settings-current_score"></current-score>
    </div>
  </default-layout>
</template>
<script>
import CurrentScore from "@/components/CurrentScore";
export default {
  components: {
    "current-score": CurrentScore,
  },
  mounted() {
    this.$store.dispatch("app/showBack", true);
  },
  beforeDestroy() {
    this.$store.dispatch("app/showBack", false);
  },
};
</script>

<style scoped lang="scss">
::-webkit-scrollbar {
  width: 0px;
  display: none;
}
.settings-current_score {
  margin: auto;
  width: 100%;
}

@media screen and (min-width: 650px) {
  .settings {
    display: flex;
    min-width: 650px;
    width: 50%;
    flex-direction: column;
    margin: auto !important;
  }
}
</style>