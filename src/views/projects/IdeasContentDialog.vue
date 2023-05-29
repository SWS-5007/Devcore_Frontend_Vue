<template>
  <v-dialog
    v-model="showDialog"
    fullscreen
    hide-overlay
    transition="none"
    class="ideas-content-dialog"
  >
    <div class="d-overlay" style="z-index: 1">
      <div class="dialog-container idea-dialog-container" v-if="currentIdea">
        <v-card class="d-flex flex-column">
          <v-toolbar
            color="white"
            elevation="0"
            height="85"
            class="border border-0 border-bottom-1"
          >
            <v-toolbar-title class="card-header">
              <div class="left-tools">
                <v-btn icon @click="closeIdea">
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
              </div>
              <h4 class="title">
                {{ currentIdea.title ? currentIdea.title : "" }}
              </h4>
            </v-toolbar-title>
          </v-toolbar>
          <div class="ideaContent-content-plus-sidebars">
            <sweepable
              @sweep="handleSweep"
              @disableSwipe="setSwipeDisable"
              :disabled="true"
              style="
                height: 100%;
                display: flex;
                justify-content: space-between;
              "
            >
              <pull-to-refresh
                :refresh-fn="() => fetchIdeaContents()"
                class="pulltorefresh-idea-edit"
                :disabled="true"
              >
                <idea-edit
                  :user="user"
                  :key="intent"
                  :ideaContents="ideaContents"
                  :currentContent="currentContent"
                  :isLoading="isLoading"
                  :project="getCurrentProject"
                  :currentIdea="currentIdea"
                  @closeSidebar="closeSidebar"
                  @manualSweep="handleSweep"
                  v-model="sidebarOpenstate"
                ></idea-edit>
              </pull-to-refresh>
            </sweepable>
          </div>
        </v-card>
      </div>
    </div>
  </v-dialog>
</template>
<script>
import { mapGetters } from "vuex";
import IdeaEdit from "./idea/idea_edit/IdeaEdit.vue";

export default {
  components: {
    "idea-edit": IdeaEdit,
  },
  data: () => ({
    showDialog: false,
    isLoading: true,
    idea: null,
    sweepDisable: false,
    intent: Math.random(),
    currentProject: null,
    contentFilter: null,
    currentIdea: null,
    sidebarOpenstate: [
      { side: "left", open: false },
      { side: "right", open: false },
    ],
  }),

  async mounted() {
    const params = this.$route.params;
    //TODO: currentProject doesnt update currentIdea => ideaContentId is wrong
    if (params.id) {
      this.currentProject = this.$store.getters["project/byId"](params.id);
      this.showDialog = true;
    }
    if (params.ideaId) {
      if (this.currentProject.userIdeas) {
        this.currentIdea = this.currentProject.userIdeas.find(
          (project) => project.idea.id == params.ideaId
        );
      }
    }
  },
  async created() {
    this.isLoading = true;

    this.contentFilter = {
      data: {
        where: {
          field: "idea_id",
          op: "eq",
          value: this.$router.currentRoute.params.ideaId,
        },
      },
    };
    this.projectFilter = {
      data: {
        where: {
          field: "id",
          op: "eq",
          value: this.$router.currentRoute.params.id,
        },
      },
    };

    await this.fetchIdeaContents();
  },

  computed: {
    ...mapGetters({
      showBack: "app/show_back",
      user: "auth/user",
      ideaContents: "ideaContent/all",
      currentContent: "ideaContent/current",
      projects: "project/all",
    }),
    getDefaultContentId: {
      get() {
        return this.currentIdea.idea.ideaContentId;
      },
    },
    getCurrentProject: {
      get() {
        return this.projects.find(
          (x) => x.id === this.$router.currentRoute.params.id
        );
      },
    },
  },
  methods: {
    closeSidebar() {
      this.sidebarOpenstate = [
        { side: "left", open: false },
        { side: "right", open: false },
      ];
    },
    setSwipeDisable(value) {
      this.sweepDisable = value;
    },
    async fetchIdeaContents() {
      this.isLoading = true;
      this.currentProject = await this.$store.dispatch("project/findById", {
        id: this.$router.currentRoute.params.id,
        force: true,
      });
      await this.$store.dispatch("ideaContent/findAll", {
        filter: this.contentFilter,
        force: true,
      });

      this.$store.dispatch("ideaContent/current", this.getDefaultContentId);

      this.$nextTick(() => {
        this.intent = Math.random();
        this.isLoading = false;
      });
    },
    handleSweep({ bar, direction }) {
      const curSidebar = this.sidebarOpenstate.find((x) => x.side === bar);

      if (bar === direction) {
        curSidebar.open = false;
      } else {
        curSidebar.open = true;
      }
    },

    closeIdea() {
      this.showDialog = false;
      const query = this.$route.query;
      this.$router.replace({
        name: "project-ideas",
        query,
      });
    },
  },
};
</script>

<style lang="scss">

@media screen and (min-width: 650px) {
  .idea-dialog-container {
    max-width: 50%;
    margin: 0 auto;
    min-width: 650px;
  }
}
.pulltorefresh-idea-edit {
  height: 100%;
  overflow: auto;
  width: 100%;
  display: flex;
  flex-direction: row;
}
.ideaContent-content-plus-sidebars {
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: space-evenly;
}
</style>

