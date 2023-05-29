<template>
  <v-card class="d-flex flex-column share-issue-form">
    <v-toolbar
      color="white"
      height="85"
      elevation="0"
      class="flex-grow-0 border border-0 border-bottom-1"
    >
      <v-toolbar-title class="card-header">
        <div class="left-tools">
          <v-btn icon @click="close">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </div>
        <h4 class="title">{{ $t("Report issue") }}</h4>
        <small class="subtitle text-danger"
          >{{ getCurrentStep }}/{{ getTotalSteps }} {{ $t(stepTitle) }}</small
        >
        <div class="right-tools" v-if="currentStep > 1">
          <v-btn icon @click="close">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </div>
      </v-toolbar-title>
    </v-toolbar>
    <v-form
      class="d-flex flex-column flex-grow-1"
      style="color: #666; border-radius: 0 0 5px 5px; overflow: hidden"
    >
      <v-card-text class="flex-grow-1 stepper d-flex">
        <!-- <sweepable
          v-if="!form.busy && dataIssue"
          class="flex-grow-1 d-flex"
          style="background: #f6f8f9"
          @sweep="handleSweep"
        > -->
          <component
            :is="component"
            :slideDirection="this.slideDirection"
            v-if="component"
            :project="project"
            :effectTemplates="getEffectTemplates"
            :issue="dataIssue"
            @validate="stepValidationResult"
            :form="form"
            class="flex-grow-1"
          />
        <!-- </sweepable> -->
        <page-loader v-if="form.busy">{{ $t("Saving changes") }}</page-loader>
      </v-card-text>
      <v-card-actions class="px-0 py-0 overflow-hidden">
        <v-btn
          elevation="0"
          tile
          block
          class="text-uppercase"
          color="danger"
          :loading="form.busy"
          :disabled="form.busy || vErrors.any() || !canGoNext"
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
import { Issue } from "@/models";
import { mapGetters } from "vuex";

export default {
  props: {
    project: {
      required: true,
      type: Object,
    },
    issue: {
      required: false,
      type: Object,
    },
    mode: {
      type: String,
      default: () => "issue",
    },
  },
  provide() {
    return { parentValidator: this.$validator };
  },
  data: () => ({
    currentStep: 1,
    totalSteps: 4,
    prevStep: 0,
    currentPageNumber: null,
    disablableSteps: [
      {
        pageNumber: 2,
        projectProp: "issueEvaluationRoles",
      },
      {
        pageNumber: 4,
        projectProp: "issueTemplateRoles",
      },
    ],
    disabledSteps: [],
    component: null,
    slideDirection: "slideInRight",
    stepTitle: null,
    canGoNext: false,
    form: {},

    dataIssue: null,
  }),
  computed: {
    ...mapGetters({
      user: "auth/user",
      effectTemplates: "issueEffect/all",
    }),
    getEffectTemplates() {
      return this.effectTemplates.filter((x) => x.status === "CREATED");
    },
    getTotalSteps() {
      return this.totalSteps - this.disabledSteps.length;
    },
    getCurrentStep() {
      if (this.disabledSteps.length > 0) {
        if (this.currentStep - this.prevStep > 1) {
          return this.currentStep - 1;
        }
        if (this.disabledSteps.indexOf(this.currentStep) >= 0) {
          return this.currentStep - 1;
        }

        if (this.currentStep > this.getTotalSteps) {
          return this.getTotalSteps;
        }
      }

      return this.currentStep;
    },
    nextBtnText: {
      get: function () {
        if (this.currentStep < this.getTotalSteps) {
          return "Next";
        } else {
          return "Confirm";
        }
      },
    },
  },
  async mounted() {
    await this.$store.dispatch("issueEffect/findAll");
    this.initIssue();
    this.initForm();
    this.goToStep(1);
    this.disableSteps();
  },
  methods: {
    initIssue() {
      if (!this.issue) {
        this.dataIssue = new Issue();
        this.dataIssue.processId = this.project.processId;
      }
      this.initForm();
    },
    disableSteps() {
      //Dont show effect page if no effects created
      if (this.getEffectTemplates.length == 0) {
        this.disabledSteps.push(4);
      }

      //No role disablation if advancedForm is unset for project
      if (!this.project.useAdvanced) return;

      this.disablableSteps.forEach((step) => {
        if (step.projectProp) {
          const advancedFormField = this.project[step.projectProp];
          const companyRoleId = this.user.companyRole.id;

          if (
            advancedFormField &&
            advancedFormField.length > 0 &&
            advancedFormField.indexOf(companyRoleId) > -1
          ) {
            this.disabledSteps.push(step.pageNumber);
          }
        }
      });
    },
    initForm() {
      this.form = new GQLForm({
        id: this.dataIssue.id,
        type: "ISSUE",
        projectId: this.dataIssue.projectId || this.project.id,
        //sourceId: this.dataIssue.sourceId || null,
        // title: this.dataIssue.title || null,
        processId: this.dataIssue.processId || null,
        stageId: this.dataIssue.stageId || null,
        operationId: this.dataIssue.operationId || null,
        phaseId: this.dataIssue.phaseId || null,
        moneyUnit: this.dataIssue.moneyUnit || "TOTAL",
        moneyValue: this.dataIssue.moneyValue || 0,
        timeUnit: this.dataIssue.moneyUnit || "TOTAL",
        timeValue: this.dataIssue.moneyValue || 0,
        anonymous: this.dataIssue.anonymous || null,
        //file: this.dataIssue.file || null,
        description: this.dataIssue.description || null,
        effectTemplateId: this.dataIssue.effectTemplateId || null,
      });
    },
    goToStep(step) {
      this.canGoNext = false;
      this.currentStep = step;

      if (this.disabledSteps.indexOf(this.currentStep) >= 0) {
        this.currentStep += 1;
      }
      if (this.totalSteps < this.currentStep) return;

      this.component = require("./steps/" + this.currentStep + ".vue").default;
      this.stepTitle = this.component.title;
    },
    async nextStep() {
      this.slideDirection = "slideInRight";
      if (this.getCurrentStep < this.getTotalSteps) {
        this.prevStep = this.currentStep;
        this.goToStep(this.currentStep + 1);
      } else {
        try {
          await this.$store.dispatch("issue/create", this.form);
          this.close();
        } catch (e) {
          console.error(e);
        } finally {
          const quest = this.user.company.experienceQuests.find(
            (x) => x.title == "Report Problem"
          );
          const expForm = new GQLForm({
            userId: this.user.id,
            questId: quest.id,
          });
          await this.$store.dispatch("experience/update", expForm);
        }
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.slideDirection = "slideInLeft";
        this.goToStep(this.currentStep - 1);
      }
    },
    stepValidationResult(result) {
      this.canGoNext = result;
    },
    close() {
      this.$emit("close");
    },
    handleSweep(direction) {
      if (direction === "right") {
        this.previousStep();
      } else if (direction == "left" && this.canGoNext) {
        if (this.currentStep < this.totalSteps) {
          this.nextStep();
        }
      }
    },
  },
};
</script>

<style lang="scss">
@media screen and (min-width: 650px) {
  .share-issue-form {
    max-width: 50%;
    margin: 0 auto;
    min-width: 650px;
  }
}
</style>