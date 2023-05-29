<template>
  <node-view-wrapper as="div" class="file-component">
    <node-view-content class="content-dom" />

    <section class="content-dom-file" style="display: flex" v-if="getAttrs">
      <div style="display: flex; flex-direction: column; width: 100%">
        <div v-if="getAttrs.href" class="file">
          <div style="display: flex; place-items: center">
            <div class="attachment-file-non-preview-container">
              <a
                @click.prevent.stop="openUrl(getAttrs)"
                @touchend.prevent.stop="openUrl(getAttrs)"
                :href="getAttrs.href"
                target="__blank"
                style="
                  display: flex;
                  align-items: center;
                  text-decoration: none;
                  height: 40px;
                "
              >
                <svg
                  width="17"
                  height="12"
                  viewBox="0 0 17 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.8436 4.27826C15.7045 4.10435 15.5132 4 15.3045 4H14.4349V2.10435C14.4349 1.77391 14.1914 1.56522 13.861 1.56522H7.77405L6.99144 0.278261C6.88709 0.104348 6.6784 0 6.4697 0H1.98274C1.65231 0 1.39144 0.191304 1.39144 0.521739V4H0.695787C0.487092 4 0.278396 4.10435 0.156657 4.26087C0.0349179 4.41739 -0.0346474 4.64348 0.0175266 4.85217L1.30448 10.7478C1.37405 11.0609 1.65231 11.3043 1.98274 11.3043H13.861C14.174 11.3043 14.4523 11.0783 14.5393 10.7826L15.9827 4.86957C16.0349 4.66087 15.9827 4.45217 15.8436 4.27826ZM2.60883 1.21739H6.12188L6.90448 2.50435C7.00883 2.67826 7.21753 2.78261 7.42622 2.78261H13.2175V4H2.60883V1.21739ZM13.3045 9.91304H2.53927L1.56535 5.3913H14.4175L13.3045 9.91304Z"
                    fill="#4294D0"
                  />
                </svg>

                <span
                  style="
                    margin-left: 10px;
                    font-size: 12px;
                    text-decoration: none;
                  "
                  >{{ parseUuid(getAttrs.title) }}</span
                >
              </a>
            </div>
          </div>
        </div>
        <!-- <span
          v-else
          class="file-toggle-lightbox"
          @click.stop="togglePreviewImage(getAttrs)"
          @touchend.stop="togglePreviewImage(getAttrs)"
        > -->
        <div v-else class="file-toggle-lightbox">
          <div v-lazyload>
            <!-- <img
            :src="getAttrs.src"
            :alt="getAttrs.title"
            @click="openDesktopPreview"
            :id="`file-image-container-${getPosition}`"
            :style="{ width: imgWidth, height: imgHeight }"
            @load="setDimensions"
          /> -->
            <div
              class="fileNodeView-lazy-load-image-spinner"
              id="fileNodeView-lazy-load-image-spinner"
            >
              <page-loader style="position: relative" />
            </div>
            <img
              :data-url="getAttrs.src"
              @click="openDesktopPreview"
              style="margin-bottom: 20px"
              id="fileNodeView-lazy-load-preview-image"
              :ref="`file-image-container-${getPosition}`"
            />
            <image-preview
              v-if="getIsPreview"
              :imageSrc="getAttrs.src"
              @click.stop.prevent
              @touchstart.stop.prevent
              @close="closePreviewImage"
            />
          </div>
        </div>
      </div>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";
import FolderIcon from "@/assets/img/folderIcon.svg";
import ImagePreview from "../parts/ImagePreview";
import debounce from "lodash/debounce";
import LazyLoadDirective from "./helpers/file/editorimage.directive";

export default {
  directives: {
    lazyload: LazyLoadDirective,
  },
  components: {
    NodeViewWrapper,
    NodeViewContent,
    "image-preview": ImagePreview,
  },

  data() {
    return {
      FolderIcon,
      imgWidth: "100%",
      imgHeight: "auto",
      isPreviewId: false,
      isDesktop: false,
      refSelector: null,
      interval: {},
      counter: 0,
      counterMax: 600,
      scrollStart: 0,
      allowedScrollPosChangeToPreview: 10,
      touchStartFn: null,
      touchEndFn: null,
      scrollStartFn: null,
    };
  },

  props: nodeViewProps,

  content: "inline*",

  mounted() {
    this.isDesktop = window.screen.availWidth > 500;
    this.refSelector = `file-image-container-${this.getPosition}`;
    this.$nextTick(() => {
      if (!this.isDesktop) {
        this.setMobileListeners(this.refSelector);
      }
    });
  },
  beforeDestroy() {
    const selector = this.$refs[this.refSelector];

    if (selector) {
      selector.removeEventListener("touchstart", this.touchStartFn);
      selector.removeEventListener("touchend", this.touchEndFn);
      selector.removeEventListener("scroll", this.scrollEndFn);

      this.interval = null
    }
  },

  computed: {
    getIsIntro() {
      return this.getAttrs.src;
    },
    getPosition() {
      return this.getPos();
    },
    getIsPreview() {
      if (this.getAttrs && this.getAttrs.id) {
        return this.isPreviewId === this.getAttrs.id;
      }
      return false;
    },
    fileEntity() {
      const stringFileEntity = this.node.attrs;
      return stringFileEntity ? stringFileEntity : null;
    },
    getAttrs() {
      return this.fileEntity;
    },
  },
  methods: {
    parseUuid(name) {
      const extension = this.getAttrs.title.split(".").pop();
      const fileName = this.getAttrs.title.replace(`.${extension}`, "");
      if (name && name.length > 40) {
        return `${fileName.substring(0, fileName.length - 37)}.${extension}`;
      }
      return name;
    },
    setDimensions(e) {
      // if (!this.editor || !this.editor.view.dom.parentElement) return;
      // const { clientWidth: domWidth, clientHeight: domHeight } =
      //   this.editor.view.dom.parentElement;
      // const { clientHeight } = e.path[0];
      // const allowedMaxHeight = domHeight * 0.9;
      // if (domWidth > 500) {
      //   if (clientHeight > allowedMaxHeight) {
      //     this.imgWidth = "auto";
      //     this.imgHeight = "80vh";
      //   }
      // }
    },
    setMobileListeners(selectorId) {
      const selector = this.$refs[selectorId];
      if (selector) {
        this.touchStartFn = debounce(this.touchStartListener, 100);
        this.touchEndFn = debounce(this.touchEndListener, 100);
        this.scrollEndFn = debounce(this.touchEndListener, 100);
        selector.addEventListener("touchstart", this.touchStartFn);
        selector.addEventListener("touchend", this.touchEndFn);
        selector.addEventListener("scroll", this.scrollEndFn);
      }
    },
    openDesktopPreview() {
      this.$nextTick(() => this.togglePreviewImage(this.getAttrs));
    },
    stop() {
      clearInterval(this.interval);
      this.interval = null;

      this.counter = 0;
    },
    touchStartListener() {
      const el = this.$refs[`file-image-container-${this.getPosition}`];

      this.scrollStart = el ? el.getBoundingClientRect().top : 0;

      if (!this.isPreviewId && this.counter === 0) {
        this.interval = setInterval(() => {
          if (this.counter === this.counterMax) {
            this.success();
            clearInterval(this.interval);
          }
          this.counter += 100;
        }, 100);
      }
    },
    success() {
      const element = this.$refs[`file-image-container-${this.getPosition}`];
      const scrollFinish = element ? element.getBoundingClientRect().top : 0;
      const startScrollPos = this.scrollStart;

      const scrollDifference = Math.abs(startScrollPos - scrollFinish);

      this.$nextTick(() => {
        if (scrollDifference < this.allowedScrollPosChangeToPreview) {
          this.togglePreviewImage(this.getAttrs);
        }

        this.stop();
      });
    },
    touchEndListener(e) {
      clearInterval(this.interval);
      this.counter = 0;
    },
    closePreviewImage() {
      this.isPreviewId = null;
    },
    openUrl(attrs) {
      window.open(attrs.href, "__blank");
    },
    togglePreviewImage(attrs) {
      if (!this.isPreviewId) this.isPreviewId = attrs.id;
    },
  },
};
</script>

<style lang="scss">
.fileNodeView-lazy-load-image-spinner {
  display: flex;
  width: 100%;
  justify-content: center;
  height: 200px;
  align-items: center;
}

@media screen and (max-width: 500px) {
  .file-component {
    .file-toggle-lightbox > div > img {
      width: 100%;
      // max-height: 100%;
      -webkit-user-select: none !important;
      -webkit-touch-callout: none !important;

      //  max-width: 80vw;
    }
  }

  .attachment-file-non-preview-container:hover {
    background: #fff !important;
  }
}

@media screen and (min-width: 500px) {
  .file-component {
    .file-toggle-lightbox > div > img {
      //width: 100%;
      // max-height: 100%;

      //width: auto;
      // height: auto;
      // max-height: 80vh;
      //max-width: 47.5vw;
    }
  }
}

.file-component {
  padding-top: 3px;
  padding-bottom: 3px;
  .file-toggle-lightbox > div {
    cursor: zoom-in;
    width: 100%;
  }

  .file-remove-button {
    font-family: "FuturaMedium";
    color: #d0424d;
    border: 1px solid lightgray;
    width: 60px;
    height: 40px;
    position: relative;
    border-radius: 3px;
    background: #fff;
    bottom: 2px;
  }
  .file-remove-icon {
    cursor: pointer;
    width: 20px;
    height: 20px;
    position: absolute;
  }
}

.attachment-file-non-preview-container {
  color: #fff;
  border: 1px solid lightgray;
  font-family: "FuturaMedium";
  border-radius: 3px;
  padding: 0 10px;
  cursor: pointer;
  > a:hover {
    color: #fff;
    & > svg > path {
      fill: #fff;
    }
  }
  div {
    color: #4294d0;
  }
  div > svg > path {
    fill: #4294d0;
  }
}

.attachment-file-non-preview-container:hover {
  background: #4294d0;
  color: #fff;
  div {
    color: #fff;
  }
  div > svg > path {
    fill: #fff;
  }
}
</style>
