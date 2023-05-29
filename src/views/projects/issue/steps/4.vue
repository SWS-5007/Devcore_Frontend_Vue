<template
>
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
      v-for="(item, index) in getEffectTemplates"
      :key="index"
      class="issue_select_effect_card"
      @click="setFormEffectId(item.id)"
    >
      <div class="issue_select_effect_card-item">{{ item.title }}</div>
      <div
        class="anonymous__toggle-selector"
        :class="`form__type--ISSUE--${item.id == form.effectTemplateId}`"
      >
        <div class="sub-title displayHideLabel">
          {{
            form.effectTemplateId == item.id
              ? $t("Selected Template")
              : $t("Select Template")
          }}
        </div>
        <div class="check">
          <i class="mdi mdi-check"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import UserSelector from "@/views/projects/UserSelector.vue";
import { mapGetters } from "vuex";

export default {
  components: { UserSelector },
  title: "Template",
  props: {
    project: {
      required: true,
      type: Object,
    },
    effectTemplates: {
      required: true,
      type: Array,
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
  async mounted() {
    this.validate();
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
    getEffectTemplates() {
      return this.effectTemplates;
    },
  },

  methods: {
    setFormEffectId(id) {
      if (this.form.effectTemplateId && this.form.effectTemplateId == id) {
        this.form.effectTemplateId = null;
      } else {
        this.form.effectTemplateId = id;
      }
    },
    validate() {
      setTimeout(() => {
        this.$validator.validateAll();
        this.$emit("validate", !this.vErrors.any());
      }, 100);
    },
  },
};
</script>
<style scoped>
.header {
  margin-bottom: 5px;
}
.issue_select_effect_card {
  margin: 5px 10px;
  padding: 10px;
  border: 1px solid lightgray;
  border-radius: 10px;
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.issue_select_effect_card-item {
  font-weight: 600;
}

.anonymous__toggle-selector {
  align-self: center;
  display: flex;
  min-width: 100px;
}
.anonymous__toggle-selector .check {
  border-radius: 50%;
  position: absolute;
  right: 20px;
  width: 24px;
  height: 24px;
  text-align: center;
  color: #fff;
  font-size: 14px;
  display: block;
  cursor: pointer;
}

.form__type--ISSUE--false > .check {
  background-color: #fff;
  border: 1px solid #d0424d;
}
.form__type--ISSUE--true > .check {
  background-color: #d0424d;
}
</style>