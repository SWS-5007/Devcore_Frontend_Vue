<template>
  <div class="stepper-step animated faster" :class="slideDirection">
    <user-selector
      :user="user"
      :form="form"
      @selectedInput="form.anonymous = $event"
    ></user-selector>
    <div class="header" style="background:#fff">
      <div class="sub-title">{{ project.process.title }}</div>
      <div class="title">{{ project.name }}</div>
    </div>
    <div
      class="content d-flex flex-column"
      style="padding: 0.5rem 1rem"
      @keyup="validate"
    >
      <div class="flex-grow-0">
        <v-text-field
          v-if="!form.sourceId"
          v-validate="'required'"
          v-model="form.title"
          :error-messages="$displayError('title', form)"
          :error="$validateState('title', form)"
          name="title"
          ref="title"
          :label="$t('Title') + ' (' + $t('Mandatory') + ')'"
        />
      </div>
      <div class="flex-grow-1">
        <v-textarea
          height="100%"
          v-validate="'required'"
          class="h-100 textarea"
          name="description"
          no-resize
          :label="$t('Idea description') + ' (' + $t('Mandatory') + ')'"
          v-model="form.description"
          counter
        />
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import UserSelector from "@/views/projects/UserSelector.vue";
export default {
  components: { UserSelector },
  title: "Describe your idea",
  inject: {
    $validator: "$validator",
  },
  props: {
    project: {
      required: true,
      type: Object,
    },
    idea: {
      required: true,
      type: Object,
    },
    form: {
      required: true,
      type: Object,
    },
    slideDirection: {
      required: false,
    },
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
  mounted() {
    this.validate();
    setTimeout(() => {
      this.$refs.title.focus();
    }, 500);
    setTimeout(() => {
      this.validate();
    });
  },
  methods: {
    validate() {
      setTimeout(() => {
        this.$validator.validateAll();
        this.$emit("validate", !this.vErrors.any());
      }, 100);
    },
  },
};
</script>