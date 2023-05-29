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
        <user-form 
			:project="currentProject" class=""
			@close="closeProject">
        </user-form>
        <div class="text-center mt-3" v-if="!enableInviteUser">
          {{ $t("You don't have the permission") }}
        </div>
    </div>
  </v-dialog>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
import UserForm from "@/components/UserForm";
export default {
  components: {
    "user-form": UserForm,
  },
  data: () => ({
    currentProject: null,
    enableInviteUser: false,
    showDialog: true,
    title: ''
  }),
  computed: {
    ...mapGetters({
      user: "auth/user"
    })
  },
  methods: {
    async loadProject() {
      const params = this.$route.params;
      await this.$store.dispatch("project/findById", { id: params.id, force: true });

      if (params.id) {
        this.currentProject = this.$store.getters["project/byId"](params.id);

        if (!this.currentProject) {
          this.closeProject();
        } else {
          this.title = this.currentProject.name
          if (params.issueId) {
            this.issue = this.currentProject.userissues.find(
              (i) => i.id === params.issueId
              );
            if (!this.issue) {
              this.issue = new Issue();
              this.issue.processId = this.currentProject.id;
            }
          }
          this.checkInviteAvailable();
        }
      }
    },
    checkInviteAvailable() {
      if (this.currentProject.useAdvanced === false)
        return;

      if (this.currentProject.shareAccessRoles === null)
        return;

      let userCompanyRole = this.user.companyRole.id
      this.currentProject.shareAccessRoles.forEach((role) => {
        if (userCompanyRole == role) {
          this.enableInviteUser = true;
        } 
      });
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
  async mounted() {
    await this.loadProject();
  },
};
</script>

<style>
  @media only screen and (min-width: 800px) {
    .settings {
      display: flex;
      justify-content: center;
      max-width: 50%;
      margin: auto;
      height: 100vh;
    }
  }
  @media screen and (min-width: 650px) {
    .project-detail  {
      max-width: 50%;
      margin: 0 auto;
      min-width: 650px;
    }
  }
</style>