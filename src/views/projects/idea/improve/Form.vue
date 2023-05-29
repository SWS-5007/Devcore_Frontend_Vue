<template>
  <v-card class="d-flex flex-column">
    <v-toolbar
      :dark="mode !== 'IMPROVEMENT'"
      :color="mode === 'IMPROVEMENT' ? 'white' : 'danger'"
      elevation="0"
      class="flex-grow-0 border border-bottom-1"
    >
      <v-toolbar-title class="card-header">
        <div class="left-tools">
          <v-btn
            icon
            @click="previousStep"
            :class="{ 'white--text': mode !== 'IMPROVEMENT' }"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </div>
        <h4
          class="title"
          :class="mode === 'IMPROVEMENT' ? 'dark--text' : 'white--text'"
        >
          {{
            mode === "IMPROVEMENT" ? $t("Improve idea") : $t("Report problem")
          }}
        </h4>
      </v-toolbar-title>
    </v-toolbar>
    <v-form class="d-flex flex-column flex-grow-1">
      <v-card-text class="flex-grow-1 stepper d-flex">
        <component
          :is="component"
          v-if="component && !form.busy"
          :project="project"
          :item="item"
          @validate="stepValidationResult"
          :form="form"
          class="flex-grow-1"
        />
        <page-loader v-if="form.busy">{{ $t("Saving changes") }}</page-loader>
      </v-card-text>
      <v-card-actions class="px-0 py-0 overflow-hidden">
        <v-btn
          elevation="0"
          tile
          class="text-uppercase"
          block
          :color="mode === 'IMPROVEMENT' ? 'primary' : 'danger'"
          :loading="form.busy"
          :disabled="form.busy || vErrors.any() || !canGoNext"
          style="color: white"
          x-large
          @click="nextStep"
        >
          {{ $t(nextBtnText) }}
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import { Idea } from "@/models";
import { mapGetters } from "vuex";

export default {
  props: {
    project: {
      required: true,
      type: Object,
    },
    item: {
      required: false,
      type: Object,
    },
    mode: {
      type: String,
      default: () => "IMPROVEMENT",
    },
  },
  provide() {
    return { parentValidator: this.$validator };
  },
  data: () => ({
    currentStep: 1,
    totalSteps: 1,
    component: null,
    stepTitle: null,
    canGoNext: false,
    form: {},
  }),
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
    nextBtnText: {
      get: function () {
        if (this.currentStep < this.totalSteps) {
          return "Next";
        } else {
          return "Confirm";
        }
      },
    },
  },
  async mounted() {
    this.initIdea();
    this.initForm();
    this.goToStep(1);
  },
  methods: {
    initIdea() {
      if (!this.item) {
        this.item = new Idea();
        this.item.processId = this.project.processId;
      }
      this.initForm();
    },
    initForm() {
      this.form = new GQLForm({
        id: this.item.id,
        type: this.mode,
        projectId: this.item.projectId || null,
        parentType: this.item.parentType || null,
        parentId: this.item.parentId || null,
        title: this.item.title || null,
        processId: this.item.processId || null,
        stageId: this.item.stageId || null,
        anonymous: this.item.anonymous || null,
        file: null,
        description: this.item.description || null,
      });
    },
    goToStep(step) {
      this.canGoNext = false;
      this.currentStep = step;
      this.component = require("./steps/" + this.currentStep + ".vue").default;
      this.stepTitle = this.component.title;
    },
    async nextStep() {
      let ideaIssue = null;
      if (this.currentStep < this.totalSteps) {
        this.goToStep(this.currentStep + 1);
      } else {
        try {
          ideaIssue = await this.$store.dispatch("ideaissue/create", this.form);
          if (ideaIssue) {
            this.$emit("ideaIssueId", ideaIssue);
          }
        } catch (e) {
          console.error(e);
        } finally {
          const quest = this.user.company.experienceQuests.find(
            (x) => x.title == "Improve Idea"
          );
          const expForm = new GQLForm({
            userId: this.user.id,
            questId: quest.id,
          });
          await this.$store.dispatch("experience/update", expForm);

          this.close();
        }
      }
    },
    previousStep() {
      if (this.currentStep > 1) {
        this.goToStep(this.currentStep - 1);
      } else {
        this.close();
      }
    },
    stepValidationResult(result) {
      this.canGoNext = result;
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>