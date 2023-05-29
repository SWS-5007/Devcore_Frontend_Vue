<template>
  <v-dialog
    v-model="showDialog"
    fullscreen
    hide-overlay
    no-click-animation
    transition="fade-transition"
  >
    <div class="d-overlay"></div>
    <div class="dialog-container">
      <idea-form
        @close="closeProject"
        :idea="idea"
        :project="currentProject"
        mode="idea"
      />
    </div>
  </v-dialog>
</template>
<script>
import IdeaForm from "./idea/Form";
import { Idea } from "@/models";
export default {
  components: {
    "idea-form": IdeaForm,
  },
  data: () => ({
    currentProject: null,
    showDialog: false,
    idea: null,
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
          if (params.ideaId) {
            this.idea = this.currentProject.userIdeas.find(
              (i) => i.id === params.ideaId
            );
            if (!this.idea) {
              this.idea = new Idea();
              this.idea.processId = this.currentProject.id;
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

// <style lang="scss">
// @media screen and (min-width: 650px) {
//   .dialog-container {
//     max-width: 50%;
//     margin: 0 auto;
//   }
// }
// </style>