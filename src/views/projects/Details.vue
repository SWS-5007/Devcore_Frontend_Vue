<template>
  <v-card
    class="d-flex flex-column project-detail"
    :class="{ 'has-expanded-content': this.currentIdeaId }"
  >
    <v-toolbar color="primary" elevation="1" height="56">
      <v-toolbar-title class="card-header">
        <h4 class="title white--text">
          {{ $t("Ideas") }}
        </h4>
        <div class="right-tools">
          <v-btn class="white--text" icon @click="close">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </div>
      </v-toolbar-title>
    </v-toolbar>
    <div style class="bg-light flex-grow-1">
      <v-card-text
        v-if="currentProject"
        style="max-height: 90vh"
        class="project-detail-project-listing"
      >
        <v-expansion-panels
          v-if="getStartedStageIdeas.length > 0"
          v-model="openedPanel"
          style="padding: 0 10px"
          active-class="project_details_idea_path_items"
        >
          <v-expansion-panel
            v-for="(paths, i) in getIdeaPaths"
            :key="i"
            class="project_details_idea_path_item"
          >
            <v-expansion-panel-header>
              <div class="project_details_idea_path_item-titles">
                <div v-if="paths.pathTitles.phase">
                  {{ paths.pathTitles.phase }}
                </div>
                <div v-if="paths.pathTitles.operation">
                  {{ paths.pathTitles.operation }}
                </div>
                <div v-if="paths.pathTitles.stage">
                  {{ paths.pathTitles.stage }}
                </div>
              </div>
              <div class="project_idea_ideaCountAndIcon">
                <span>{{ paths.projectIdeas.length }}</span>
                <v-icon>mdi-lightbulb-outline</v-icon>
              </div>
            </v-expansion-panel-header>
            <div
              class="project_details_idea_path_item-ideas"
              :style="{
                background: '#FFF',
                'overflow-y': 'scroll',
                'margin-bottom': '10px',
              }"
            >
              <v-expansion-panel-content>
                <v-card
                  v-for="(idea, index) in paths.projectIdeas"
                  :key="index"
                  @click="showIdea(idea)"
                >
                  <v-card-title class="project_idea_listItem-title">
                    {{ idea.title }}
                  </v-card-title>
                </v-card>
              </v-expansion-panel-content>
            </div>
          </v-expansion-panel>
        </v-expansion-panels>
        <div v-else>
          <empty-data
            class="empty-data-appear-slow"
            :text="$t('Looks empty! Ideas?')"
          ></empty-data>
        </div>
      </v-card-text>
      <v-card-text v-else style="height: 100%">
        <page-loader></page-loader>
      </v-card-text>
    </div>
  </v-card>
</template>
<script>
import GQLForm from "@/lib/gqlform";
//import IdeaCard from "./idea/Card";
import { mapGetters } from "vuex";
import IdeaEdit from "./idea/idea_edit/IdeaEdit.vue";

/*eslint-disable*/

export default {
  props: {
    project: {
      type: Object,
    },
  },
  components: {
    // "idea-card": IdeaCard,
    "idea-edit": IdeaEdit,
  },
  data: () => ({
    populatedProjectPaths: null,
    mappedProcessPaths: null,
    currentProject: null,
    selectedPath: null,
    uniquePathIdeas: null,
    currentIdeaId: null,
    expandedIdeaIndex: null,
  }),
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),

    getIdeaPaths: {
      get() {
        const stageIdeas = this.getStartedStageIdeas;
        // const pathMap = stageIdeas.map((paths, i) => {
        //   const pathObj = {};
        //   if (paths.pathTitles.stage) {
        //     pathObj.stage = paths.pathTitles.stage;
        //   }
        //   if (paths.pathTitles.operation) {
        //     pathObj.operation = paths.pathTitles.operation;
        //   }
        //   if (paths.pathTitles.phase) {
        //     pathObj.phase = paths.pathTitles.phase;
        //   }
        //   return pathObj;
        // });
        return stageIdeas;
      },
    },

    getStartedIdeas: {
      get() {
        const startedStageIds = this.project.stages
          .filter(
            (x) => x.status === "STARTED" || x.status === "EVALUATIONS PENDING"
          )
          .map((x) => x.id);

        const startedIdeas = this.project.userIdeas.filter(
          (x) => startedStageIds.indexOf(x.stageId) >= 0
        );
        return startedIdeas;
      },
    },
    getStartedStageIdeas: {
      get() {
        const startedProjectIdeas = [];
        //Transform paths
        this.getStartedIdeas.map((started) => {
          const pathIds = this.ideaPathDeducer(started.idea);
          const projectIdeas = this.getIdeasForKnownPath(pathIds);
          let obj = {
            ...pathIds,
            projectIdeas,
            pathTitles: {
              ...this.getPathTitles(pathIds),
            },
          };
          startedProjectIdeas.push(obj);
        });

        if (startedProjectIdeas.length > 0) {
          //Filters Unique objects
          return Array.from(
            new Set(startedProjectIdeas.map((obj) => JSON.stringify(obj)))
          ).map((str) => JSON.parse(str));
        } else {
          return [];
        }
      },
    },
    getUniquePathIdeas: {
      get: function () {
        return this.uniquePathIdeas;
      },
    },
    startedIdeas: {
      get: function () {
        if (!this.project) return [];
        const startedStages = this.project.stages
          .filter((x) => x.status === "STARTED")
          .map((i) => i.id);
        const startedIdeas = this.project.userIdeas.filter(
          (i) => startedStages.indexOf(i.stageId) >= 0
        );

        const uniqueIdeas = [];
        const uniqueIds = [
          ...new Set(
            startedIdeas
              .map((userIdea) => userIdea.idea)
              .map((_idea) => _idea.id)
          ),
        ];

        for (let i = 0; i < uniqueIds.length; i++) {
          const uniqueIdea = startedIdeas.find(
            (ideaModel) => ideaModel.idea.id == uniqueIds[i]
          );
          uniqueIdeas.push(uniqueIdea);
        }

        return uniqueIdeas;
      },
    },
    openedPanel: {
      get: function () {
        return this.expandedIdeaIndex;
      },
      set: function (value) {
        this.expandedIdeaIndex = value;
      },
    },
  },

  async mounted() {
    this.currentProject = this.project;
    if (this.$route.query) {
      const { query } = this.$route;
      if (query.expanded !== undefined) {
        this.expandedIdeaIndex = query.expanded;
      }
    }
  },
  methods: {
    getScrollContainersHeight(ideas) {
      const amount = ideas.length + 1;
      return amount * 60 + "px";
    },
    getCompanyTools(projectIdea) {
      let tools = [];

      if (projectIdea && projectIdea.companyTools) {
        projectIdea.companyTools.forEach((companyTool) => {
          if (companyTool.tool.name) {
            tools.push({
              id: companyTool.tool.id,
              name: companyTool.tool.name,
            });
          }
        });
      }
      return tools;
    },
    async showIdea(projectIdea) {
      await this.$store.dispatch("idea/setIdeaInEdit", {
        editIdeaMeta: {
          editStartedAt: new Date().getTime(),
        },
        ideaId: projectIdea.idea.id,
      });

      this.$router.push({
        name: "project-ideas-idea",
        params: {
          ideaId: projectIdea.idea.id,
        },
        query: {
          expanded: this.expandedIdeaIndex,
        },
      });
    },
    setExpandedIdeaIndex(index) {
      if (this.expandedIdeaIndex === index) {
        this.expandedIdeaIndex = null;
      } else {
        this.expandedIdeaIndex = index;
      }
    },

    getIdeasForKnownPath(path) {
      let selectedIdeas = [];
      if (path) {
        const { stageId } = path;
        const { operationId } = path;
        const { phaseId } = path;

        if (phaseId) {
          selectedIdeas = this.getStartedIdeas.filter(
            (i) =>
              i.idea.parent.id == phaseId &&
              i.idea.parent.__typename == "ProcessPhase"
          );
        }

        if (operationId && !phaseId) {
          selectedIdeas = this.getStartedIdeas.filter(
            (i) =>
              i.idea.parent.id == operationId &&
              i.idea.parent.__typename == "ProcessOperation"
          );
        }
        if (!operationId && !phaseId) {
          selectedIdeas = this.getStartedIdeas.filter(
            (i) =>
              i.idea.parent.id == stageId &&
              i.idea.parent.__typename == "ProcessStage"
          );
        }
      }
      return selectedIdeas;
    },
    getPathTitles(path) {
      const projectProcess = this.project.process;
      const getTitle = (path) => {
        this.mappedProcessPaths = {
          stage: null,
          operation: null,
          phase: null,
        };

        const { stageId } = path;
        const { operationId } = path;
        const { phaseId } = path;

        let mappedStage = null;
        let mappedOperation = null;
        let mappedPhase = null;

        if (stageId) {
          mappedStage = projectProcess.stages.find(
            (stage) => stage.id == stageId
          );
          this.mappedProcessPaths.stage = mappedStage.title;
        }

        if (operationId) {
          mappedOperation = mappedStage.operations.find(
            (operation) => operation.id == operationId
          );
          this.mappedProcessPaths.operation = mappedOperation.title;
        }

        if (phaseId) {
          mappedPhase = mappedOperation.phases.find(
            (phase) => phase.id == phaseId
          );
          this.mappedProcessPaths.phase = mappedPhase.title;
        }

        return this.mappedProcessPaths;
      };

      return getTitle(path);
    },
    close() {
      this.$emit("close");
    },
    ideaPathDeducer(_obj) {
      if (_obj.parent.__typename === "ProcessPhase") {
        const phaseId = _obj.parent.id;
        const operationId = _obj.parent.operation.id;
        const stageId = _obj.parent.operation.stageId;
        return {
          phaseId: phaseId,
          operationId: operationId,
          stageId: stageId,
        };
      }
      if (_obj.parent.__typename === "ProcessOperation") {
        const operationId = _obj.parent.id;
        const stageId = _obj.parent.stageId;
        return {
          operationId: operationId,
          stageId: stageId,
        };
      }
      if (_obj.parent.__typename === "ProcessStage") {
        const stageId = _obj.parent.id;
        return {
          stageId: stageId,
        };
      }
    },
  },
};
</script>

<style scoped lang="scss">
@media screen and (min-width: 650px) {
  .project-detail-project-listing {
    display: flex;
    min-width: 650px;
    width: 50%;
    flex-direction: column;
    margin: auto !important;
  }
}

@media screen and (min-width: 650px) {
  .project-detail  {
    max-width: 50%;
    margin: 0 auto;
    min-width: 650px;
  }
}

.project_details_idea_path_item-ideas {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
}
.project_details_idea_path_items {
  max-height: 90vh;
  //overflow-y:scroll
}
.v-card__text {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}
.v-card__text::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
.v-expansion-panel:not(:first-child)::after {
  border: none;
}
.project_details_idea_path_item-titles {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  text-align: left;
  justify-content: center;
  margin: 0 20px;
  cursor: pointer;
  > div:first-child {
    font-size: 0.9rem !important;
    text-align: left;
    color: #000;
    font-weight: 600;
    line-height: 1rem;
    display: flex;
    align-items: center;
    width: 100%;
  }
  > div:nth-of-type(2) {
    line-height: 1rem;
    margin-top: 3px;
    text-align: left;
    color: #000;
    font-weight: 500;
    line-height: 1rem;
    font-size: 0.7rem;
    font-family: ProductSans, sans-serif !important;
    display: flex;
    align-items: center;
    width: 100%;
    &:before {
      margin: 0 5px;
      content: ">";
    }
  }
  > div:nth-of-type(3) {
    line-height: 1rem;
    margin-top: 3px;
    text-align: left;
    color: #000;
    font-weight: 500;
    line-height: 1rem;
    font-size: 0.7rem;
    font-family: ProductSans, sans-serif !important;
    display: flex;
    align-items: center;
    width: 100%;
    &:before {
      margin: 0 5px;
      content: ">";
    }
  }
}

.project_idea_ideaCountAndIcon {
  align-items: center;
  display: flex;
  margin: 0 10px;
  color: #4294d0 !important;
  caret-color: #4294d0 !important;
  & > i {
    color: #4294d0 !important;
    caret-color: #4294d0 !important;
  }
}

.project_details_idea_path_item {
  border-radius: 4px !important;
  margin: 20px 20px 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.project_idea_listItem-title {
  height: 100%;
  min-height: 40px;
  margin: 10px 0;
  font-size: 12px;
}
</style>
