<template>
  <div class="alert" style="font-size:.75rem">{{ dataText }}</div>
</template>
<script>
export default {
  name: "empty-data",
  props: {
    text: {
      required: false
    }
  },
  data: () => ({
    dataText: null
  }),
  mounted() {
    this.dataText = this.text || this.$t("No data for the given criteria");
  }
};
</script>