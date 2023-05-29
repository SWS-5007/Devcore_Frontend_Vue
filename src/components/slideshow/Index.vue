<template>
  <div class="slideshow">
    <v-carousel
      v-model="current"
      :show-arrows="false"
      height="100%"
      hide-delimiters
      :continuous="false"
    >
      <v-carousel-item v-for="(item, i) in items" :key="i" :value="i">
        <div class="slider-content">
          <div
            class="image"
            :style="{ 'background-image': 'url(' + item.image + ')' }"
          >
            <div
              class="overlay"
              :style="{ 'background-image': 'url(' + item.overlay + ')' }"
            ></div>
          </div>

          <div class="content">
            <h2 class="title">
              {{ $t("introScreens." + item.key + ".title") }}
            </h2>
            <p class="description">
              {{ $t("introScreens." + item.key + ".description") }}
            </p>
          </div>
          <div class="footer">
            <v-btn
              x-large
              block
              color="primary"
              class="rounded-0 text-uppercase font-500"
              @click="next"
            >
              {{ $t(nextBtnTxt) }}&nbsp;&nbsp;
              <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>
<script>
export default {
  props: {
    query: null,
  },
  data() {
    return {
      current: 3,
      items: [
        {
          key: "1",
          image: require("@/assets/img/slideshow/1.png"),
          overlay: require("@/assets/img/slideshow/overlay1.png"),
        },
        {
          key: "2",
          image: require("@/assets/img/slideshow/2.png"),
          overlay: require("@/assets/img/slideshow/overlay2.png"),
        },
        {
          key: "3",
          image: require("@/assets/img/slideshow/3.png"),
          overlay: require("@/assets/img/slideshow/overlay3.png"),
        },
      ],
    };
  },
  computed: {
    nextBtnTxt: {
      get: function () {
        return this.current < this.items.length - 1 ? "Continue" : "Start";
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      document.addEventListener("keypress", this.nextOnEnter);
    });
  },
  beforeDestroy() {
    document.removeEventListener("keypress", this.nextOnEnter);
  },
  methods: {
    nextOnEnter(event) {
      if (event.keyCode === 13) {
        this.next();
      }
    },
    next() {
      if (this.current < this.items.length - 1) {
        this.current++;
      } else {
        this.$router.replace({
          name: "login",
          query: this.query,
        });
      }
    },
  },
};
</script>