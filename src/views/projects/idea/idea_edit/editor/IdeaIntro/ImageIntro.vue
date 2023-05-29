<template>
  <div
    class="text-center idea-intro-circular-button-image"
    id="preview-images-wrapper-button"
    :style="{ top: targetPos + '%' }"
  >
    <v-progress-circular
      v-if="!isDesktop && !preview"
      :rotate="270"
      :size="75"
      :width="10"
      :value="counter"
      color="fff"
      style="cursor: pointer"
      v-on:mousedown="$emit('start')"
      v-on:mouseup="$emit('stop')"
      v-on:touchstart="$emit('start')"
      v-on:touchend="$emit('stop')"
    />
    <v-progress-circular
      v-else-if="!preview"
      :rotate="270"
      :size="75"
      :width="10"
      :value="counter"
      color="fff"
      style="cursor: pointer"
      v-on:click="$emit('start')"
    />

    <image-preview
      v-if="preview"
      @close="closeImagePreview"
      :imageSrc="previewExampleImg"
    />
  </div>
</template>

<script>
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css"; // optional for styling
import ImagePreview from "../parts/ImagePreview.vue";
export default {
  components: {
    "image-preview": ImagePreview,
  },
  data() {
    return {
      preview: false,
      previewExampleImg: require("@/assets/img/preview-example-image-sunset.png"),
      index: null,
      zoomedIn: false,
    };
  },
  methods: {
    closeImagePreview() {
      this.preview = false;
      this.$emit("completed");
    },
    closePreview() {
      this.preview = false;
    },
    previewImage() {
      this.closeTooltip();
      this.preview = true;
    },
    closeTooltip() {
      let instance = document.querySelector("#preview-images-wrapper-button");
      if (instance && instance._tippy) {
        instance._tippy.destroy();
      }
    },
    setTooltip(text) {
      let element = document.querySelector("#preview-images-wrapper-button");
      if (!element) return;
      element.classList.add("idea-intro-tooltip");
      if (element) {
        tippy(element, {
          content: text,
          placement: "top",
          hideOnClick: false,
          interactive: true,
          popperOptions: {
            modifiers: {
              preventOverflow: {
                enabled: false,
              },
            },
          },
        });
        setTimeout(() => {
          element._tippy.show();
        });
      }
    },
  },
  beforeDestroy() {
    this.closeTooltip();
  },

  watch: {
    counter: {
      handler(newVal) {
        if (newVal === this.counterMax) {
          this.closeTooltip();
          let instance = document.querySelector(
            "#preview-images-wrapper-button"
          );
          if (instance._tippy) {
            instance._tippy.destroy();
          }
          this.previewImage();
        }
      },
    },
  },
  mounted() {
    this.setTooltip(this.tooltipText);
  },
  props: {
    tooltipText: {
      type: String,
      default: () => "",
    },
    counter: {
      type: Number,
      default: () => 0,
    },
    counterMax: {
      type: Number,
      default: () => 0,
    },
    targetPos: {
      type: Number,
      default: () => 527,
    },
    isDesktop: {
      type: Boolean,
      default: () => false,
    },
  },
};
</script>

<style lang="scss" scoped>
.idea-intro-circular-button-image {
  display: flex;
  place-content: center;
  position: absolute;
  user-select: none;
}

.preview-images-wrapper-button {
  height: 75px;
  width: 75px;
  top: 38px;
  position: absolute;
  left: -42.5px;
}
.v-progress-circular {
  margin: 1rem;
}
.idea-intro-circular-button > .v-progress-circular__underlay {
  stroke: grey;
  opacity: 0.5;
  z-index: 1;
}
.idea-intro-tooltip {
  font-family: "FuturaMedium";
}
.close-idea-intro-button {
  font-family: "FuturaMedium";
}
</style>

