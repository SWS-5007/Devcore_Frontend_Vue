<template>
  <div
    class="text-center idea-intro-circular-button"
    id="idea-intro-circular-button"
    style="position: absolute; user-select: none"
    click.stop
    :style="{ top: targetPos + '%' }"
  >
    <v-progress-circular
      v-if="!isDesktop"
      :rotate="270"
      :size="75"
      :width="10"
      :value="counter"
      color="fff"
      style="cursor: pointer"
      v-on:mousedown="$emit('start', 'comment')"
      v-on:mouseup="$emit('stop')"
      v-on:touchstart="$emit('start', 'comment')"
      v-on:touchend="$emit('stop')"
    />
    <v-progress-circular
      v-else
      :rotate="270"
      :size="75"
      :width="10"
      :value="counter"
      color="fff"
      style="cursor: pointer"
      v-on:dblclick="$emit('start')"
    />
  </div>
</template>

<script>
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css"; // optional for styling
export default {
  methods: {
    closeTooltip() {
      let instance = document.querySelector("#preview-images-wrapper-button");
      if (instance && instance._tippy) {
        instance._tippy.destroy();
      }
    },
    setTooltip(text) {
      let element = document.querySelector("#idea-intro-circular-button");
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
          let instance = document.querySelector("#idea-intro-circular-button");
          if (instance._tippy) {
            instance._tippy.destroy();
          }
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
      default: () => null,
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
      default: () => 0,
    },
    isDesktop: {
      type: Boolean,
      default: () => false,
    },
  },
};
</script>

<style scoped lang="scss">
.idea-intro-circular-button {
  position: absolute;
  user-select: none;
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