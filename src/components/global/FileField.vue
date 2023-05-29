<template>
  <div
    class="file-field header file-field-custom"
    :class="{ 'has-file': file || currentFile }"
  >
    <div>
      <i class="mdi mdi-folder-open-outline"></i> &nbsp; &nbsp;
      <label class="custom-file-upload field">
        <input
          type="file"
          @change="fileChanged"
          class="field"
          style="display: none"
        />
        <span class="title text-capitalize" v-if="!this.file && !currentFile">{{
          placeholder || $t("Upload file")
        }}</span>
        <span class="field-wrapper" v-else>
          <span
            class="title text-gray"
            style="max-width: 200px; overflow: hidden"
            v-if="this.file"
            >{{ this.file.name }}</span
          >
          &nbsp;
        </span>
      </label>
    </div>
    <div>
      <span class="remove" v-if="file || currentFile" @click="remove">
        <i class="mdi mdi-delete text-danger"></i>
        {{ $t("Remove") }}
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: "file-field",
  props: {
    value: {
      required: false,
    },
    currentFile: {
      required: false,
    },
    title: {
      required: false,
    },
    placeholder: {
      required: false,
    },
  },
  data: () => ({
    file: null,
  }),
  mounted() {},
  methods: {
    fileChanged(event) {
      if (event.target.files[0]) {
        this.file = event.target.files[0];
      }
      this.$emit("input", this.file);
    },
    remove() {
      this.file = null;
      this.$emit("input", null);
    },
  },
};
</script>
<style scoped>
.custom-file-upload {
  display: inline-block;
  cursor: pointer;
  font: small;
}

.file-field-custom {
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>