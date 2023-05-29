<template>
  <v-card
    class="d-flex flex-column share-idea-form"
  >
    <v-toolbar
      color="white"
      elevation="0"
      height="85"
      class="border border-0 border-bottom-1"
    >
      <v-toolbar-title class="card-header">
        <div class="left-tools">
          <v-btn icon @click="close">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </div>
        <h4 class="title">{{ $t("Share idea") }}</h4>
        <small class="subtitle primary--text"
          >{{ currentStep }}/{{ totalSteps }} {{ $t(stepTitle) }}</small
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
        <sweepable
          v-if="!form.busy && dataIdea"
          class="flex-grow-1 d-flex"
          style="background: #f6f8f9"
          @sweep="handleSweep"
        >
          <component
            :is="component"
            v-if="component"
            :project="project"
            :idea="dataIdea"
            @validate="stepValidationResult"
            :form="form"
            :slideDirection="this.slideDirection"
            class="flex-grow-1"
            ref="childReference"
          />
        </sweepable>
        <page-loader v-if="form.busy">{{ $t("Saving changes") }}</page-loader>
      </v-card-text>
      <v-card-actions class="px-0 py-0 overflow-hidden">
        <v-btn
          elevation="0"
          class="text-uppercase"
          tile
          block
          color="primary"
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
import { Idea } from "@/models";
import { mapGetters } from "vuex";

export default {
  props: {
    project: {
      required: true,
      type: Object,
    },
    idea: {
      required: false,
      type: Object,
    },
    mode: {
      type: String,
      default: () => "idea",
    },
  },
  provide() {
    return { parentValidator: this.$validator };
  },
  data: () => ({
    currentStep: 1,
    totalSteps: 2,
    component: null,
    stepTitle: null,
    canGoNext: false,
    dataIdea: null,
    slideDirection: "slideInRight",
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
    stopBubble() {
      console.log("Hello");
    },
    initIdea() {
      if (!this.dataIdea) {
        this.dataIdea = new Idea();
        this.dataIdea.processId = this.project.processId;
      }
      this.initForm();
    },
    initForm() {
      this.form = new GQLForm({
        id: this.dataIdea.id,
        type: "PROCESS",
        //projectId: this.dataIdea.projectId || null,
        sourceId: this.dataIdea.sourceId || null,
        title: this.dataIdea.title || null,
        processId: this.dataIdea.processId || null,
        stageId: this.dataIdea.stageId || null,
        operationId: this.dataIdea.operationId || null,
        phaseId: this.dataIdea.phaseId || null,
        anonymous: this.dataIdea.anonymous || null,
        file: [],
        description: this.dataIdea.description || null,
      });
    },
    goToStep(step) {
      this.canGoNext = false;
      this.currentStep = step;
      this.component = require("./steps/" + this.currentStep + ".vue").default;
      this.stepTitle = this.component.title;
    },
    async nextStep() {
      this.slideDirection = "slideInRight";
      if (this.currentStep < this.totalSteps) {
        this.goToStep(this.currentStep + 1);
      } else {
        try {
          const result = await this.$store.dispatch("idea/create", this.form);
          const quest = this.user.company.experienceQuests.find(
            (x) => x.title == "Share Idea"
          );
          const expForm = new GQLForm({
            userId: this.user.id,
            questId: quest.id,
          });
          await this.$store.dispatch("experience/update", expForm);
          this.close();
        } catch (ex) {
          console.log(ex);
          let validator = this.$refs.childReference.$validator;

          if (ex && ex.message && ex.details.validation) {
            for (var item in ex.details.validation) {
              const key = item;
              const field = validator.fields.find({
                name: key,
                scope: this.$options.scope,
              });

              if (field) {
                validator.errors.add({
                  id: field.id,
                  field: key,
                  msg: ex.details.validation[key][0],
                  scope: this.$options.scope,
                });

                field.setFlags({
                  invalid: true,
                  valid: false,
                  validated: true,
                });
              }
            }
          }
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
  .share-idea-form {
    max-width: 50%;
    margin: 0 auto;
    min-width: 650px;
  }
}
</style>