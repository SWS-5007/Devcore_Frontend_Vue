<template>
  <div
    style="margin-top: 20px"
    :class="[
      expanded ? 'expanded_idea__container' : '',
      'ideaCard__' + ideaIndex,
    ]"
    :ref="'ideaCard__' + ideaIndex"
  >
    <v-card
      class="idea-card"
      style="
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: none;
        box-sizing: border-box;
        border-radius: 5px;
      "
      :class="
        expanded
          ? 'expanded-idea__card-container'
          : 'not-expanded-idea__card-container'
      "
    >
      <v-card-title
        class="header"
        @click="toggle"
        style="
          border: 1px solid rgba(0, 0, 0, 0.1);
          max-height: 25vh;
          overflow: hidden;
          font-family: Product Sans;
          font-style: normal;
          font-weight: bold;
          font-size: 18px;
          line-height: 18px;
          letter-spacing: -0.165px;
        "
      >
        <div>
          <div v-if="expanded" style="max-width: 90%; overflow: hidden">
            <div
              v-for="(item, index) in mapPathToType"
              :key="index"
              :class="`path_title hideOverFlow idea_container_title-index-${index}`"
            >
              <svg
                v-if="index > 0"
                width="5"
                height="9"
                viewBox="0 0 5 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.218528 8.22119C-0.0471641 7.95435 -0.0704718 7.53763 0.148015 7.24449L0.220815 7.16053L3.1723 4.222L0.220815 1.28147C-0.0460254 1.01578 -0.0711298 0.599172 0.146091 0.305091L0.218528 0.220816C0.48422 -0.0460243 0.90083 -0.0711288 1.19491 0.146092L1.27919 0.218529L4.76519 3.68953C5.03284 3.95603 5.05717 4.37418 4.83818 4.66825L4.76519 4.75247L1.27919 8.22347C0.985661 8.51573 0.510789 8.51471 0.218528 8.22119Z"
                  fill="#5A5A5A"
                />
              </svg>
              {{ item.name }}
            </div>
          </div>

          <div class="actions">
            <div v-if="projectIdea.idea.files.length > 0">
              <div
                :style="`background-image: url(${folderIcon})`"
                class="folderIcon"
                style="
                  margin-top: 10px;
                  width: 24px;
                  height: 24px;
                  background-position-x: center;
                "
              ></div>
            </div>

            <v-icon
              v-if="expanded"
              style="
                top: 2px;
                bottom: 3px;
                color: #4294D020px;
                padding: 0;
                max-width: 20px;
              "
              >mdi-chevron-down</v-icon
            >
            <v-icon
              v-else
              style="
                top: 2px;
                bottom: 3px;
                color: #4294d0;
                padding: 0;
                max-width: 20px;
              "
              :style="expanded ? 'top:10px' : 'top:3px'"
              >mdi-chevron-up</v-icon
            >
          </div>
        </div>
        <div
          class="idea__title"
          style="
            display: flex;
            margin-right: 0px;
            flex-direction: column;
            margin-top: 10px;
          "
          :style="!expanded ? 'margin-right:50px' : 'margin-right:0'"
        >
          <small class="supertitle" style="color: grey">
            <span v-if="projectIdea.idea.companyToolId">
              <i class="mdi mdi-tools"></i
              >{{ companyToolName(projectIdea.idea.companyToolId) }}</span
            >
          </small>
          <span class="project__idea__title">{{ projectIdea.title }} </span>
        </div>
      </v-card-title>
      <v-card-text
        v-if="expanded"
        class="detail"
        style="
          flex-direction: column;
          max-height: 62vh;
          border-left: 1px solid rgba(0, 0, 0, 0.1);
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          justify-content: space-between;
        "
      >
        <!-- <span class="date">{{ idea.idea.createdAt }}</span> -->
        <p
          class="description"
          style="overflow-y: scroll; margin: 0 10px 10px 10px; padding: 10px"
          :style="
            projectIdea.idea.hasFile ? 'max-height: 35vh;' : 'max-height: 45vh;'
          "
        >
          {{ projectIdea.idea.description }}
        </p>
        <div
          class="actions"
          style="
            padding: 10px 10px 0 10px;
            display: flex;
            width: 100%;
            justify-content: center;
            display: flex;
            padding: 12px 10px;
            width: 100%;
            height: 68px;
          "
        >
          <div
            v-if="projectIdea.idea.files[0]"
            style="width: 100%; margin: 0 10px"
          >
            <!--      :href="projectIdea.idea.file.url"   -->
            <v-btn
              v-if="isMobileView"
              color="secondary"
              block
              @click="downloadFile(projectIdea.idea.file)"
              rounded
              outlined
              class="no-text-transform"
              style="height: 100%"
              large
            >
              <v-icon
                class="file"
                style="color: #4294d0; font-size: 1.2rem; margin-right: 5px"
                >mdi-folder-open-outline</v-icon
              >
              &nbsp;{{ $t("Download guide") }}
            </v-btn>
            <v-btn
              v-else
              :href="projectIdea.idea.files[0].url"
              download
              style="height: 100%"
              color="secondary"
              block
              rounded
              outlined
              class="no-text-transform"
            >
              <v-icon class="file" style="font-size: 1.2rem; margin-right: 5px"
                >mdi-folder-open-outline</v-icon
              >
              &nbsp;{{ $t("Download guide") }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
      <div v-if="expanded" style="margin: 0 20px 20px 20px">
        <v-btn
          color="primary"
          class="no-text-transform mb-3"
          block
          outlined
          large
          @click="showImprovementForm('IMPROVEMENT')"
        >
          <v-icon>mdi-lightbulb-outline</v-icon>
          &nbsp;{{ $t("Improve idea") }}
        </v-btn>
        <v-btn
          color="danger"
          class="no-text-transform"
          block
          outlined
          large
          @click="showImprovementForm('PROBLEM')"
        >
          <v-icon>mdi-chat-outline</v-icon>
          &nbsp;{{ $t("Report problem") }}
        </v-btn>
      </div>
    </v-card>
    <v-dialog
      v-model="isImprovementFormShowing"
      fullscreen
      hide-overlay
      transition="fade-transition"
    >
      <div class="d-overlay"></div>
      <div class="dialog-container">
        <improve-form
          @close="closeImprovementForm"
          :item="newImprovement"
          :mode="newImprovement ? newImprovement.type : 'IMPROVEMENT'"
          :project="project"
          :key="intent"
        />
      </div>
    </v-dialog>
    <div ref="bottom"></div>
  </div>
</template>
<script>
import ImproveForm from "./improve/Form";
import { IdeaIssue } from "@/models";
import { downloadFile, openByFileEntry } from "@/lib/file-utility";

export default {
  props: {
    companyTools: {
      type: Array,
      required: false,
    },
    projectIdea: {
      type: Object,
      required: true,
    },
    expanded: {
      type: Boolean,
      required: false,
    },
    project: {
      type: Object,
      required: true,
    },
    ideaIndex: {
      type: Number,
      required: true,
    },
    pathTitles: {
      type: Object,
      required: true,
    },
  },
  components: {
    "improve-form": ImproveForm,
  },
  data: () => ({
    dataExpanded: false,
    improveForm: null,
    intent: null,
    isImprovementFormShowing: false,
    newImprovement: null,
    folderIcon: require("@/assets/img/ico-folder-close.png"),
  }),
  computed: {
    mapPathToType() {
      const titles = this.pathTitles;
      if (titles.stage && titles.operation && titles.phase) {
        return [
          { name: titles.phase, type: "phase" },
          { name: titles.operation, type: "operation" },
          { name: titles.stage, type: "stage" },
        ];
      } else if ((titles.stage, titles.operation)) {
        return [
          { name: titles.operation, type: "operation" },
          { name: titles.stage, type: "operation" },
        ];
      } else {
        return [{ name: titles.stage, type: "stage" }];
      }
    },
    isMobileView() {
      if (window && window.cordova) {
        return true;
      }
      return false;
    },
  },
  watch: {
    expanded: {
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.$nextTick(() => {
            if (this.$el.getBoundingClientRect().top > 0) {
              setTimeout(() => {
                this.$el.scrollIntoView({
                  behavior: "smooth",
                });
              }, 100);
            }
          });
        }
      },
    },
  },

  methods: {
    async downloadFile(file) {
      const fileEntry = await downloadFile(file);
      const opened = await openByFileEntry(file, fileEntry);
    },
    companyToolName(ideaToolId) {
      if (this.companyTools && ideaToolId) {
        const tool = this.companyTools.find((x) => x.id === ideaToolId);
        return tool.name;
      }
    },
    toggle() {
      //this.expanded = !this.expanded;
      this.$emit("toggle", this.projectIdea);
    },
    showImprovementForm(type = "IMPROVEMENT") {
      this.newImprovement = new IdeaIssue().deserialize(this.projectIdea);
      this.newImprovement.type = type;
      this.newImprovement.parentId = this.projectIdea.id;
      this.newImprovement.parentType = "idea";
      this.newImprovement.projectId = this.projectIdea.projectId;
      this.newImprovement.processId = this.projectIdea.idea.processId;
      this.newImprovement.stageId = this.projectIdea.stageId;
      this.newImprovement.description = null;
      this.newImprovement.anonymous = false;
      this.newImprovement.id = undefined;
      this.intent = new Date().getUTCMilliseconds();
      this.isImprovementFormShowing = true;
    },
    closeImprovementForm() {
      this.isImprovementFormShowing = false;
    },
  },
};
</script>
<style scoped>
.path_title {
  color: #000;
  font-weight: 600;
  text-align: left;
  font-size: 0.9rem !important;
  line-height: 1em !important;
  margin-bottom: 0.3rem;
  text-overflow: ellipsis;
  font-family: ProductSans, sans-serif !important;
}
.idea__title {
  font-family: ProductSans, sans-serif !important;
  color: #000;
  font-weight: 600;
  text-align: left;
  font-size: 0.9rem !important;
  line-height: 1em !important;
  margin-top: 0.3rem;
  text-overflow: ellipsis;
}
.expanded_idea__container {
  min-height: 80vh;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
.project__idea__title {
  font-family: ProductSans, sans-serif !important;
  color: #5a5a5a;
}

.idea__container-content {
  color: grey;
  font: normal normal normal 24px/1 "Material Design Icons";
  justify-content: space-between;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 60px;
  justify-content: center;
}

.expanded-idea__card-container {
  min-height: 83vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 20px;
}

.not-expanded-idea__card-container {
  top: 0;
  margin: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  box-shadow: none;
}

.idea_container_title-index-0 {
  max-width: 90%;
  font-size: 0.9rem !important;
  text-align: left;
  color: #000;
  font-weight: 600;
  line-height: 1rem;
}
.idea_container_title-index-1 {
  margin-top: 3px;
  text-align: left;
  color: #000;
  font-weight: 500;
  line-height: 1rem;
  font-size: 0.7rem;
  font-family: ProductSans, sans-serif !important;
}
.idea_container_title-index-2 {
  margin-top: 3px;
  text-align: left;
  color: #000;
  font-weight: 500;
  line-height: 1rem;
  font-size: 0.7rem;
  font-family: ProductSans, sans-serif !important;
}

.hideOverFlow {
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 95%;
  overflow: hidden;
}
</style>