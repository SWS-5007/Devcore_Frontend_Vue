<template>
  <div>
    <v-card class="project-card" :class="{
      'pending-evaluations': project.userPendingEvaluationsCount > 0,
    }">
      <v-card-text ripple class="mb-0 pb-0" @click="openProject(project)">
        <small class="subtitle">{{ project.process.title }}</small>
        <h2 class="title" style="max-width: 65%">{{ project.name }}</h2>
        <div class="actions">
          <v-btn rounded text color="primary" elevation="0" small v-if="enableInviteUser" @click.stop="inviteUser">
            <v-icon>mdi-account-plus-outline</v-icon>
          </v-btn>
          <v-btn rounded text color="primary" elevation="0" small v-if="!project.userPendingEvaluationsCount > 0">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn rounded elevation="0" color="white" class="primary--text text-sm px-8 mt-1" small v-else
            @click.stop="evaluateProject">
            <!-- <v-icon>mdi-check</v-icon> -->
            {{ $t("Evaluate") }}
          </v-btn>
        </div>
      </v-card-text>
      <v-divider class="mt-3" />
      <v-card-actions v-if="!project.userPendingEvaluationsCount > 0">
        <v-row>
          <v-col cols="6" class="pr-0 py-0">
            <v-btn block text color="primary" @click="showIdeaForm">
              <v-icon>mdi-lightbulb-outline</v-icon>
              <span class="text"> {{ $t("Share idea") }}</span>
            </v-btn>
          </v-col>
          <v-col cols="6" class="pl-0 py-0">
            <v-btn block text color="danger" @click="showIssueForm">
              <v-icon>mdi-chat-outline</v-icon>
              <span class="text">{{ $t("Report issue") }}</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
      <v-card-actions v-else class="center">
        <v-row>
          <v-col cols="12" class="pl-0 py-0">
            <v-btn block text color="danger" @click="evaluateProject(project)">
              <span class="text">{{
                $tc(
                  "pendingEvaluation.count",
                  project.userPendingEvaluationsCount
                )
              }}</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="isIdeaFormShowing" fullscreen transition="none">
      <div class="d-overlay"></div>
      <idea-form @close="closeIdeaForm" :idea="currentIdea" :project="project" mode="idea" :key="intent" />
    </v-dialog>

    <v-dialog v-model="isIssueFormShowing" fullscreen hide-overlay transition="fade-transition">
      <div class="d-overlay"></div>
      <issue-form @close="closeIssueForm" :issue="currentIssue" :project="project" :key="intent" />
    </v-dialog>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";

import IdeaForm from "./idea/Form";
import IssueForm from "./issue/Form";

import EventBus from "@/lib/eventbus";

export default {
  props: {
    project: {
      required: true,
      type: Object,
    },
  },
  components: {
    "idea-form": IdeaForm,
    "issue-form": IssueForm,
  },
  data: () => ({
    filter: {},
    isIssueFormShowing: false,
    isIdeaFormShowing: false,
    isShowingProjectDetails: false,
    isShowingProjectEvaluation: false,
    currentEvaluatingProject: null,
    currentIdea: null,
    currentIssue: null,
    currentProject: null,
    intent: new Date().getUTCMilliseconds(),
    enableInviteUser: false,
  }),
  methods: {
    showIssueForm() {
      this.$router.push({
        name: "project-report-issue",
        params: {
          id: this.project.id,
        },
      });
    },
    closeIssueForm() {
      this.isIssueFormShowing = false;
    },
    openProject() {
      this.$router.push({
        name: "project-ideas",
        params: {
          id: this.project.id,
          tab: "stage",
        },
      });
    },
    evaluateProject() {
      this.$router.push({
        name: "project-evaluate",
        params: {
          id: this.project.id,
        },
      });
    },
    closeProject() {
      this.isShowingProjectDetails = false;
      this.isShowingProjectEvaluation = false;
    },
    showIdeaForm() {
      this.$router.push({
        name: "project-share-idea",
        params: {
          id: this.project.id,
        },
      });
    },
    closeIdeaForm() {
      this.isIdeaFormShowing = false;
    },
    inviteUser() {
      this.$router.push({
        name: "invite-user",
        params: {
          id: this.project.id
        },
      });
    },
    checkInviteAvailable() {
      if (this.project.useAdvanced === false)
        return;

      if (this.project.shareAccessRoles === null)
        return;

      let userCompanyRole = this.user.companyRole.id
      this.project.shareAccessRoles.forEach((role) => {
        if (userCompanyRole == role) {
          this.enableInviteUser = true;
        }
      });
    }
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      serverConfig: "app/serverConfig",
      companyRoles: "companyRole/all",
    })
  },
  async mounted() {
    if (
      this.$route.params.id == this.project.id &&
      this.$route.params.type == "push"
    ) {
      this.openProject();
    }
    this.checkInviteAvailable();
    var that = this;

    EventBus.$on("notify/Projects", function (data) {
      if (that.project.id == data.pid) {
        that.openProject();
      } else {
        that.closeProject();
      }
    });
  },
};
</script>