<template>
  <div class="stepper-step animated faster" :class="slideDirection">
    <user-selector
      :user="user"
      :form="form"
      @selectedInput="form.anonymous = $event"
    ></user-selector>
    <div class="header" style="background: #fff">
      <div class="flex">
        <div class="sub-title" style="font-size: 0.625rem; color: #666">
          {{ project.process.title }}
        </div>
        <div class="title">{{ project.name }}</div>
      </div>
    </div>
    <div class="content">
      <div class="flex-grow-1 d-flex flex-column">
        <custom-select
          name="stage"
          :options="stages"
          v-validate="'required'"
          @input="
            () => {
              this.validate();
            }
          "
          @change="changeStage"
          v-if="stages.length > 0"
          id="stageId"
          v-model="form.stageId"
          class="flex-grow-1"
          ref="cboStage"
        >
          <template slot="label"
            >{{ $t("Stage") }} ({{ $t("Mandatory") }})</template
          >
        </custom-select>
      </div>
      <div class="flex-grow-1 d-flex flex-column">
        <custom-select
          name="operation"
          id="operationId"
          :options="operations"
          v-if="operations.length > 0"
          @input="
            () => {
              this.validate();
            }
          "
          @change="changeOperation"
          v-model="form.operationId"
          :allow-null="true"
          class="flex-grow-1"
          ref="cboOperation"
        >
          <template slot="label"
            >{{ $t("Operation") }} ({{ $t("Optional") }})</template
          >
        </custom-select>
      </div>
      <div class="flex-grow-1 d-flex flex-column">
        <custom-select
          name="phase"
          id="phaseId"
          :allow-null="true"
          @input="
            () => {
              this.validate();
            }
          "
          @change="changePhase"
          v-if="phases.length > 0"
          :options="phases"
          v-model="form.phaseId"
          class="flex-grow-1"
          ref="cboPhase"
        >
          <template slot="label"
            >{{ $t("Phase") }} ({{ $t("Optional") }})</template
          >
        </custom-select>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import UserSelector from "@/views/projects/UserSelector.vue";

export default {
  components: { UserSelector },
  title: "Select area",
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
  mounted() {
    this.validate();
    setTimeout(() => {
      this.validate();
    });
    this.openSelector("cboStage");
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
    stage: {
      get: function () {
        return this.form.stageId
          ? this.project.process.stages.find((o) => o.id === this.form.stageId)
          : null;
      },
    },
    operation: {
      get: function () {
        return this.stage && this.form.operationId
          ? this.stage.operations.find((o) => o.id === this.form.operationId)
          : null;
      },
    },
    phase: {
      get: function () {
        return this.operation && this.form.phaseId
          ? this.operation.phases.find((o) => o.id === this.form.phaseId)
          : null;
      },
    },
    stages: {
      get: function () {
        return this.project.process.stages.map((i) => {
          return {
            value: i.id,
            label: i.title,
          };
        });
      },
    },
    operations: {
      get: function () {
        if (!this.stage) {
          return [];
        }
        return this.stage.operations.map((i) => {
          return {
            value: i.id,
            label: i.title,
          };
        });
      },
    },
    phases: {
      get: function () {
        if (!this.operation) {
          return [];
        }
        return this.operation.phases.map((i) => {
          return {
            value: i.id,
            label: i.title,
          };
        });
      },
    },
  },
  methods: {
    validate() {
      setTimeout(() => {
        this.$validator.validateAll();
        this.$emit("validate", !this.vErrors.any());
      }, 100);
    },
    openSelector(name) {
      this.$refs[name].open();
    },
    changeStage() {
      this.form.operationId = null;
      this.form.phaseId = null;
      this.$nextTick(() => {
        if (this.operations.length > 0) {
          this.openSelector("cboOperation");
        }
      });
    },
    changeOperation() {
      this.form.phaseId = null;
      this.$nextTick(() => {
        if (this.phases.length > 0) {
          this.openSelector("cboPhase");
        }
      });
    },
    changePhase() {},
  },
};
</script>