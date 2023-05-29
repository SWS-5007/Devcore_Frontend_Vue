<template>
  <node-view-wrapper as="div" class="video-component">
    <node-view-content class="content-dom" />

    <section class="content-dom-video">
      <div style="display: flex" v-if="videoEntity">
        <iframe
          :src="`${this.node.attrs.src}?rel=0&controls=0&modestbranding=0`"
          :title="this.node.attrs.title"
          :frameborder="this.node.attrs.frameborder"
          :allow="this.node.attrs.allow"
          :allowfullscreen="this.node.attrs.allowfullscreen"
          :height="getHeight"
          :width="getWidth"
        ></iframe>
      </div>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  props: nodeViewProps,

  content: "inline*",

  computed: {
    getWidth() {
      const minWidth = 300;
      const width =
        this.node.attrs.width <= minWidth ? minWidth : this.node.attrs.width;

      return width;
    },

    getHeight() {
      const minHeight = 200;
      const height =
        this.node.attrs.height <= minHeight
          ? minHeight
          : this.node.attrs.height;
      return height;
    },

    videoEntity() {
      if (this.node) {
        const stringFileEntity = this.node.attrs;
        return stringFileEntity;
      } else {
        return null;
      }
    },
    getAttrs() {
      return this.videoEntity;
    },
  },
  methods: {
    remove() {
      const { editor, getPos, node } = this;

      const from = getPos();
      const to = from + node.nodeSize;

      editor.commands.deleteRange({ from, to });
    },
  },
};
</script>

<style lang="scss">
.video-component {
  .content-dom-video {
    max-width: 300px;
  }
  .video-remove-button {
    font-family: "FuturaMedium";
    color: #d0424d;
    border: 1px solid lightgray;
    width: 60px;
    height: 20px;
    right: -15px;
    position: relative;
    border-radius: 3px;
    background: #fff;
    transform: translate(-2px, -10px);
  }
  .video-remove-icon {
    cursor: pointer;
    width: 20px;
    height: 20px;
    position: absolute;
    transform: translate(-8px, -8px);
  }
}
</style>
