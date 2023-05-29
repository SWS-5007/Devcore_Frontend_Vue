<template>
  <default-layout>
    <div class="settings h-100 animated slideInRight faster">
      <current-user></current-user>
    </div>
  </default-layout>
</template>
<script>
import CurrentUser from "@/components/CurrentUser";
export default {
  components: {
    "current-user": CurrentUser,
  },
  mounted() {
    this.$store.dispatch("app/showBack", true);
  },
  beforeDestroy() {
    this.$store.dispatch("app/showBack", false);
  },
};
</script>




<style>
@media only screen and (min-width: 800px) {
  .settings {
    display: flex;
    justify-content: center;
    max-width: 50%;
    margin: auto;
    height: 100vh;
  }
}
</style>