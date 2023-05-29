<template>
  <v-dialog
    v-model="showDialog"
    fullscreen
    hide-overlay
    transition="fade-transition"
  >
    <div class="d-overlay"></div>
    <div class="dialog-container">
      <issue-form
        @close="closeProject"
        :issue="issue"
        :project="currentProject"
        mode="issue"
      />
    </div>
  </v-dialog>
</template>
<script>
import IssueForm from "./issue/Form";
import { Issue } from "@/models";
export default {
  components: {
    "issue-form": IssueForm,
  },
  data: () => ({
    currentProject: null,
    showDialog: false,
    issue: null,
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
        } else {
          if (params.issueId) {
            this.issue = this.currentProject.userissues.find(
              (i) => i.id === params.issueId
            );
            if (!this.issue) {
              this.issue = new Issue();
              this.issue.processId = this.currentProject.id;
            }
          }
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