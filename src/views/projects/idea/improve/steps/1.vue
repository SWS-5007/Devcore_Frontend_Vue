<template>
  <div class="stepper-step">
    <user-selector
      :user="user"
      :form="form"
      @selectedInput="form.anonymous = $event"
    ></user-selector>

    <div class="header">
      <div class="sub-title" style="font-size: 0.625rem">
        {{ project.process.title }}
      </div>
      <div class="title">{{ project.name }}</div>
    </div>
    <file-field
      v-model="form.file"
      :placeholder="$t('Upload guide')"
      :title="currentFile ? currentFile.title : $t('Upload guide')"
      :current-file="currentFile"
      @input="fileChanged"
    />
    <div
      class="content d-flex flex-column"
      style="padding: 0.5rem 1rem"
      @keyup="validate"
    >
      <div class="flex-grow-1">
        <v-textarea
          height="100%"
          v-validate="'required'"
          class="h-100 textarea"
          name="description"
          no-resize
          :color="this.item.type === 'PROBLEM' ? 'danger' : 'primary'"
          :label="$t('Description') + ' (' + $t('Mandatory') + ')'"
          v-model="form.description"
          counter
          autofocus
        />
      </div>
    </div>
  </div>
</template>
<script>
import UserSelector from "@/views/projects/UserSelector.vue";
import { mapGetters } from "vuex";

export default {
  components: { UserSelector },
  title: "Description",
  props: {
    project: {
      required: true,
      type: Object,
    },
    item: {
      required: true,
      type: Object,
    },
    form: {
      required: true,
      type: Object,
    },
  },
  mounted() {
    this.validate();
    setTimeout(() => {
      this.validate();
    });
  },
  data: () => ({
    currentFile: null,
  }),
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
  methods: {
    setForm(selected) {
      this.form.anonymous = selected;
    },
    validate() {
      setTimeout(() => {
        this.$validator.validateAll();
        this.$emit("validate", !this.vErrors.any());
      }, 100);
    },
    fileChanged() {
      if (!this.form.file) {
        this.form.removeFile = true;
        this.currentFile = null;
      } else {
        this.form.removeFile = false;
      }
    },
    onError(err) {
      alert(error);
    },
  },
};
</script>