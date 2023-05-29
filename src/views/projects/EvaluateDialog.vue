<template>
  <v-dialog
    v-model="showDialog"
    fullscreen
    hide-overlay
    transition="fade-transition"
  >
    <div class="d-overlay"></div>
    <div class="dialog-container">
      <project-evaluate
        :project="currentProject"
        @close="closeProject"
      ></project-evaluate>
    </div>
  </v-dialog>
</template>
<script>
import ProjectEvaluate from "./evaluate/Index";
export default {
  components: {
    "project-evaluate": ProjectEvaluate,
  },
  data: () => ({
    currentProject: null,
    showDialog: false,
  }),
  async mounted() {
    await this.loadProject();
  },
  methods: {
    async loadProject() {
      await this.$store.dispatch("project/findAll");
      const params = this.$route.params;
      if (params.id) {
        this.currentProject = this.$store.getters["project/byId"](params.id);
        this.showDialog = true;
        if (!this.currentProject) {
          this.closeProject();
        }
      } else {
        this.closeProject();
      }
    },
    closeProject() {
      this.showDialog = false;
      setTimeout(() => {
        this.$router.replace({
          name: "projects",
        });
      }, 500);
    },
  },
};
</script>