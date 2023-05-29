<template>
  <div>
    <div class="d-overlay" style="background: rgba(0, 0, 0, 0.7); z-index: 1" @click="closePreview" @touchend="closePreview">
      <div class="image-preview-container-image">
        <div class="image-preview-container" style="height: 100%">
          <div
            class="close-preview-button-container"
            @click="closePreview"
            @touchend="closePreview"
          >
            <v-icon class="close-preview-button">mdi-close</v-icon>
          </div>
          <v-zoomer
            id="v-zoomer-image-preview"
            class="v-zoomer-image-preview"
            style="height: 100%; cursor: pointer"
            @touchstart.stop.prevent
            :zoomed.sync="zoomedIn"
            :maxScale="2"
            :minScale="1"
          >
            <img
              :src="imageSrc"
              @click.stop.prevent
              @touchend.stop.prevent
              :ref="uuid"
              style="
                max-height: 90%;
                object-fit: contain;
              "
              :style="{ cursor: !zoomedIn ? 'zoom-in' : 'zoom-out' }"
            />
          </v-zoomer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueZoomer from "vue-zoomer";
import { v4 as uuidv4 } from "uuid";
import debounce from "lodash/debounce";
export default {
  props: {
    imageSrc: {
      type: String,
      default: () => require("@/assets/img/preview-example-image-sunset.png"),
    },
  },
  data() {
    return {
      uuid: uuidv4(),
      zoomedIn: false,
      resizeFn: null,
      imgWidth: 0,
      imgHeight: 0
    };
  },
  mounted() {
    const selector = this.$refs[this.uuid];
    if (selector) {
      this.resizeFn = debounce(this.resizeStartListener, 100);
      this.imgWidth = selector.getBoundingClientRect().width
      this.imgHeight= selector.getBoundingClientRect().height
      selector.addEventListener("touchstart", this.resizeFn);
    }
  },
  beforeDestroy() {
    const selector = this.$refs[this.uuid];
    if (selector) {
      selector.removeEventListener("touchstart", this.resizeFn);
    }
  },
  methods: {
    resizeStartListener(e) {
      const el = this.$refs[this.uuid]
      if (!el) return;
      const { width, height } = el.getBoundingClientRect()
      if (width < this.imgWidth || height < this.imgHeight) {
        this.closePreview(e)
      }
        e.preventDefault();
        e.stopPropagation();
    },
    closePreview(e) {
      if (e.cancelable) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.$emit("close");
    },
  },
  components: {
    "v-zoomer": VueZoomer.Zoomer,
  },
};
</script>

<style lang="scss">
.v-zoomer-image-preview > .zoomer {
  background-color: transparent;
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<style lang="scss" scoped>
.image-preview-container,
.image-preview-container-image {
  height: 100%;
  width: 100%;


  touch-action: none;

}
.image-preview-container-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-preview-button-container {
  position: absolute;
  padding: 10px;
  cursor: pointer;
  right: 0;
  z-index: 1;
}
.close-preview-button {
  color: lightgray;
  font-size: 40px;
}
.preview-images-wrapper {
  width: 100%;
  padding: 10px;
}
</style>