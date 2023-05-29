<template>
  <div
    :class="'imageFileField' + cssClass + ' ' + (disabled?'disabled':'') +' ' + (uploading?'uploading':'')"
  >
    <div class="display" ref="display">
      <div class="uploadIcon">
        <i class="mdi mdi-cancel disabled" v-if="disabled" />
        <i class="mdi-upload mdi uploading animated fadeInUp infinite" v-else-if="uploading" />
        <i class="mdi mdi-cloud-upload" v-else />
      </div>
      <div class="deleteIcon" @click.prevent="remove" v-if="canDelete && !uploading">
        <i class="mdi mdi-trash-can" />
      </div>
      <img ref="currentImageElement" :id="id + '-img'" class="showFile" :src="currentSrc" />
    </div>
    <input
      :disabled="disabled || uploading"
      type="file"
      ref="input"
      @change="fileChanged($event)"
      :id="id + '-field'"
      class="file-field"
    />
  </div>
</template>
<script>
import ImageResizer from "@/lib/image-resizer";
export default {
  name: "image-upload",
  props: {
    id: {
      type: String,
      default: ""
    },
    cssClass: {
      type: String,
      default: ""
    },
    currentImage: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    uploading: {
      type: Boolean,
      default: false
    },
    canDelete: {
      type: Boolean,
      default: true
    },
    onRemove: {
      type: Function,
      required: false
    }
  },
  data: function() {
    return {
      resizer: new ImageResizer(),
      currentSrc: this.currentImage
    };
  },
  computed: {
    image: {
      get: function() {
        return this.currentSrc;
      },
      set: function(value) {
        this.currentSrc = value;
      }
    }
  },
  mounted() {},
  methods: {
    remove(ev) {
      ev.stopPropagation();
      this.$emit("input", null);
      this.$emit("remove", null);
      this.image = null;
      if (this.onRemove) {
        this.onRemove(this, ev);
      }
    },
    fileChanged() {
      const dimensions = {
        h: this.$refs.display.clientHeight,
        w: this.$refs.display.clientWidth
      };

      this.resizer.resize(
        this.$refs.input.files[0],
        {
          width: dimensions.w, // maximum width
          height: dimensions.h // maximum height
        },
        blob => {
          const src = URL.createObjectURL(blob);
          this.currentSrc = src;
          setTimeout(() => {
            URL.revokeObjectURL(src);
          }, 0);
          this.$emit("input", this.$refs.input.files[0]);
        }
      );
    }
  }
};
</script>