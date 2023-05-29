<template>
  <div class="stepper-step animated faster" :class="slideDirection">
       <user-selector
      :user="user"
      :form="form"
      @selectedInput="form.anonymous = $event"
    ></user-selector>
    <div class="header" style="background:#fff">
      <div class="sub-title" style="font-size: 0.625rem; color: #666">
        {{ project.process.title }}
      </div>
      <div class="title">{{ project.name }}</div>
   
    </div>
    <div
      class="content d-flex flex-column"
      style="padding: 0.5rem 1rem"
      @keyup="validate"
    >
      <div class="flex-grow-1">
        <v-textarea
          height="100%"
          color="danger"
          v-validate="'required'"
          class="h-100 textarea"
          name="description"
          ref="description"
          no-resize
          :label="$t('Issue description') + ' (' + $t('Mandatory') + ')'"
          v-model="form.description"
          counter
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
  title: "Describe your issue",
  props: {
    project: {
      required: true,
      type: Object,
    },
    issue: {
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
      this.$refs.description.focus();
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