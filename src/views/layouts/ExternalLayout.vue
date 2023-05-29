<template>
  <v-content class="layout w-100">
    <slot />
  </v-content>
</template>
<script>
export default {
  mounted() {
    document.body.classList.add("external-layout");
    document.body.classList.remove("default-layout");
  },
  beforeDestroy() {
    document.body.classList.remove("external-layout");
  }
};
</script>