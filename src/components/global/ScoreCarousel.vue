<template>
  <div style="display: flex; width: 100%; justify-content: center">
    <v-carousel
      v-model="getActiveTab"
      hide-delimiters
      style="
        margin-right: 10px;
        display: flex;
        height: 200px;
        max-width: 180px;
        background: #fff;
      "
      :show-arrows="false"
      height="100%;"
    >
      <v-carousel-item
        style="width: 100%; height: 100%"
        v-for="(item, i) in slides"
        :key="i"
      >
        <component :is="slide" v-if="slide && activeTab == i"></component>
      </v-carousel-item>
    </v-carousel>
    <slot></slot>
  </div>
</template>
<script>
export default {
  data: () => ({
    slide: null,
  }),
  props: {
    slides: {
      required: true,
    },
    activeTab: {
      required: false,
    },
  },
  watch: {
    activeTab: {
      immediate: true,
      handler(newVal) {
        this.goToStep(newVal);
      },
    },
  },
  methods: {
    goToStep(step = 0) {
      const _step = step;
      const slideNumber = this.slides[_step] ? this.slides[_step].number : 1;
      this.slide =
        require(`../../components/global/ScoreCarouselSlides/${slideNumber}.vue`).default;
    },
  },
  computed: {
    getActiveTab: {
      get() {
        return this.activeTab;
      },
      set(value) {
        this.$emit("tabChange", value);
      },
    },
  },
};
</script>
