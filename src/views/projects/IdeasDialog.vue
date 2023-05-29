<template>
  <v-dialog
    v-model="showDialog"
    fullscreen
    hide-overlay
    transition="none"
  >
    <div class="d-overlay"></div>
    <div class="dialog-container">
      <project-details
        :project="getCurrentProject"
        @close="closeProject"
      ></project-details>
    </div>
  </v-dialog>
</template>
<script>
import ProjectDetails from "./Details";
import { mapGetters } from "vuex";

export default {
  components: {
    "project-details": ProjectDetails,
  },
  data: () => ({
    currentProject: null,
    showDialog: false,
  }),
  async mounted() {
    await this.loadProject();
    if (this.$route.params && this.$route.params.id) this.showDialog = true;
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      projects: "project/all",
      showBack: "app/show_back",
    }),
    getCurrentProject: {
      get() {
        const { params } = this.$route;

        if (params.id) {
          /* eslint-disable */

          const currentProject = this.projects.find(
            (project) => project.id == params.id
          );

          return currentProject || null;
        } else {
          return null;
        }
      },
      set(value) {
        if (!value) {
          this.closeProject();
        } else {
          this.showDialog = true;
        }
        this.currentProject = value;
      },
    },
  },
  methods: {
    async loadProject() {
      const params = this.$route.params;
      await this.$store.dispatch("project/findById", { id: params.id });

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