<template>
  <div>
    <div class="d-overlay" style="z-index: 1">
      <div class="idea-intro-container">
        <img
          class="newuser-bg"
          :src="getIntroCover"
          alt="new-user"
          style="padding: 20px; background: #fff; border-radius: 10px"
        />

        <comment-intro
          v-if="
            steps &&
            !steps.comment.done &&
            steps.comment.text &&
            commentButtonPos
          "
          @stop="stop"
          :tooltipText="steps.comment.text"
          @start="start('comment')"
          :counter="counter"
          :counterMax="counterMax"
          :targetPos="commentButtonPos"
          :isDesktop="isDesktop"
        />

        <image-intro
          v-if="
            steps &&
            !steps.image.done &&
            steps.comment.done &&
            steps.image.text &&
            imageButtonPos
          "
          @stop="stop"
          :tooltipText="steps.image.text"
          @start="start('image')"
          :counter="counter"
          :counterMax="counterMax"
          :targetPos="imageButtonPos"
          :isDesktop="isDesktop"
          @completed="completeIntro"
        />
        <v-btn
          color="primary"
          class="mx-3 text-uppercase close-idea-intro-button"
          @click.stop="completeIntro"
          >{{ $t("Close") }}</v-btn
        >
      </div>
    </div>
  </div>
</template>

<script>
import CommentIntro from "./CommentIntro.vue";
import ImageIntro from "./ImageIntro.vue";
import GQLForm from "@/lib/gqlform";

export default {
  components: {
    "comment-intro": CommentIntro,
    "image-intro": ImageIntro,
  },
  data() {
    return {
      activeStep: 0,
      interval: {},
      counter: 0,
      commentButtonPos: null,
      imageButtonPos: null,
      counterMax: 600,
      isDesktop: false,
      lastStep: 'image',
      steps: {
        comment: {
          done: false,
          text: "",
        },
        image: {
          done: false,
          text: "",
        },
      },
    };
  },
  computed: {
    getIntroCover() {
      const width = window.screen.availWidth;
      return width > 500
        ? require("@/assets/img/idea-intro-cover-desktop.png")
        : require("@/assets/img/idea-intro-cover-mobile.png");
    },
  },
  methods: {
    async completeIntro() {
      try {
        await this.$store.dispatch(
          "auth/changeUserIdeaIntro",
          new GQLForm({
            profileIdeaIntro: true,
          })
        );
      } catch (e) {
        console.log(e);
      } finally {
        this.$emit("close");
      }
    },
    success(step) {
      this.$nextTick(() => {
        if (step !== this.lastStep) {
          this.steps[step].done = true;
          this.stop();
        }
      });
    },
    stop() {
      clearInterval(this.interval);
      this.counter = 0;
    },
    start(step) {
      this.interval = setInterval(() => {
        if (this.counter === this.counterMax) {
          this.success(step);
          clearInterval(this.interval);
        }
        this.counter += 100;
      }, 100);
    },
  },

  mounted() {
    this.isDesktop = window.screen.availWidth > 500;
    const commentText = this.isDesktop
      ? this.$t("New user idea introduction - comment - desktop")
      : this.$t("New user idea introduction - comment - mobile");

    const imageText = this.$t("New user idea introduction - image");

    this.steps.comment.text = commentText;
    this.steps.image.text = imageText;

    this.commentButtonPos = this.isDesktop ? 26 : 37;
    this.imageButtonPos = this.isDesktop ? 60 : 65;
    //  :targetPos="37"
  },
  beforeDestroy() {
    clearInterval(this.interval);
    this.$emit("close");
  },
};
</script>



<style lang="scss">
.idea-intro-container {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  padding-top: 10px;
  padding-bottom: 10px;
  place-content: center;
}
</style>