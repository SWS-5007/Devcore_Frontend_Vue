<template>
  <v-card class="d-flex flex-column evaluation-card">
    <v-toolbar color="white" elevation="1" height="84">
      <v-toolbar-title class="card-header">
        <div class="left-tools">
          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <h4 class="title">{{ $t('Evaluate') }}</h4>
        <small
          class="subtitle primary--text"
          v-if="currentProject"
        >{{ $t('Idea') }} {{ currentIndex + 1}}/{{total}}</small>
      </v-toolbar-title>
    </v-toolbar>
    <v-progress-linear
      v-if="currentProject"
      :value="(currentIndex+1) * (100/total)"
      style="border-radius:0"
    />
    <v-card-text>
      <div
        v-if="currentProject && currentRecord && (!refreshingProject)"
        class="h-100 d-flex flex-column"
      >
        <sweepable @sweep="handleSweep">
          <idea-evaluation
            ref="recordForm"
            class="animated faster"
            :class="slideDirection"
            @validate="stepValidationResult"
            :record="currentRecord"
            :idea="currentIdea"
            :evaluationInstance="currentEvaluation"
            :project="project"
            :key="currentRecord.id"
          />
        </sweepable>
      </div>
      <page-loader v-else></page-loader>
    </v-card-text>
    <v-card-actions>
      <v-btn
        elevation="0"
        tile
        block
        class="text-uppercase"
        color="primary"
        :loading="form.busy || refreshingProject"
        :disabled="form.busy || vErrors.any() || (!currentProject) || (refreshingProject) || (!canGoNext)"
        x-large
        @click="nextStep"
      >
        {{ $t(nextBtnText) }}
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import IdeaEvaluation from "./Idea";
export default {
  props: {
    project: {
      required: true,
      type: Object
    }
  },
  components: {
    "idea-evaluation": IdeaEvaluation
  },
  data: () => ({
    currentIndex: 0,
    currentProject: null,
    form: { busy: false },
    canGoNext: false,
    refreshingProject: false,
    slideDirection: "slideInRight"
  }),
  computed: {
    currentEvaluation: {
      get: function() {
        return this.currentProject
          ? {
              records: this.currentProject.userPendingEvaluationRecords
            }
          : { records: [] };
      }
    },
    total: {
      get: function() {
        if (this.currentEvaluation) {
          return this.currentEvaluation.records.length;
        }
        return 0;
      }
    },
    currentRecord: {
      get: function() {
        if (this.currentEvaluation) {
          return this.currentEvaluation.records[this.currentIndex];
        }
        return null;
      }
    },
    currentIdea: {
      get: function() {
        const pIdea = this.currentProject.userIdeas.find(
          o => o.idea.id === this.currentRecord.idea.id
        );
        return pIdea ? pIdea.idea : {};
      }
    },
    nextBtnText: {
      get: function() {
        return this.currentIndex < this.total - 1 ? "Save" : "Complete";
      }
    }
  },
  async mounted() {
    await this.loadProject();
    if (this.currentEvaluation) {
      //go to index
      const index = this.currentEvaluation.records.findIndex(
        o => o.status === "PENDING"
      );
      if (index > -1) {
        this.currentIndex = index;
      } else {
        this.currentIndex = this.total - 1;
      }
    }
  },
  methods: {
    previousStep() {
      this.slideDirection = "slideInLeft";
      if (this.currentIndex > 0) {
        this.canGoNext = false;
        this.currentIndex--;
      } else {
        this.close();
      }
    },
    async skipStep() {
      this.$refs.recordForm.skip();
    },
    async nextStep() {
      this.slideDirection = "slideInRight";
      if (this.currentIndex < this.total - 1) {
        this.$refs.recordForm.save();
        this.canGoNext = false;
        this.currentIndex++;
      } else {
        try {
          this.refreshingProject = true;
          await this.$refs.recordForm.save();
          this.close();
          await this.loadProject(true);
        } finally {
          this.close();
        }
      }
    },
    stepValidationResult(result) {
      this.canGoNext = result;
    },
    close() {
      this.$emit("close");
    },
    async loadProject(force = false) {
      this.currentProject = await this.$store.dispatch("project/findById", {
        id: this.project.id,
        force: force
      });
    },
    handleSweep(direction) {
      if (direction === "right") {
        this.slideDirection = "slideInLeft";
        if (this.currentIndex > 0) {
          this.skipStep();
          this.canGoNext = false;
          this.currentIndex--;
        }
      } else if (direction == "left") {
        this.slideDirection = "slideInRight";
        if (this.currentIndex < this.total - 1) {
          this.skipStep();
          this.canGoNext = false;
          this.currentIndex++;
        } else {
          this.skipStep();
          this.close();
        }
      }
    }
  }
};
</script>