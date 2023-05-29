<template>
  <div>
    <div class="idea_edit_content_container">
      <idea-content-editor
        v-if="getIdeaContent.contentType && getIdeaContent.markup"
        :isEditable="isEditable"
        v-model="getIdeaContent"
        :projectIdea="projectIdea"
        :contentType="contentType"
        :sidebarOpenState="sidebarOpenState"
        :isImprovementFormShowing="isImprovementFormShowing"
        :createdComment="createdComment"
        @closeSidebar="$emit('closeSidebar')"
        @closeImprovementForm="closeImprovementForm"
        @openIdeaIssueForm="openIdeaIssueForm"
        @saveContent="saveContent"
        @initialized="editorInitialized"
        @manualSweep="manualSweep"
      />
    </div>
    <div
      class="dialog-container"
      style="z-index: 1"
      v-if="isImprovementFormShowing"
    >
      <improve-form
        @close="closeImprovementForm"
        @ideaIssueId="ideaIssueCreated"
        :item="newImprovement"
        :mode="newImprovement ? newImprovement.type : 'IMPROVEMENT'"
        :project="project"
        :key="intent"
      />
    </div>
  </div>
</template>

	<script>
import ideaContentEditor from "../editor/IdeaContentEditor.vue";
import ImproveForm from "../../improve/Form.vue";
import { IdeaIssue } from "@/models";

export default {
  components: {
    "idea-content-editor": ideaContentEditor,
    ImproveForm,
  },
  props: {
    user: {
      type: Object,
      required: false,
    },
    project: {
      type: Object,
      required: false,
    },
    projectIdea: {
      type: Object,
      required: true,
    },
    value: {
      type: Object,
      required: false,
    },
    sidebarOpenState: {
      type: Array,
    },
  },
  computed: {
    getIdeaContent: {
      get() {
        return {
          contentType: this.value.contentType,
          markup: this.value.markup,
        };
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  watch: {
    isImprovementFormShowing: {
      handler(newVal) {
        this.$emit("isImprovementFormShowing", newVal);
      },
    },
  },
  data: () => ({
    contentType: "Custom",
    selectingType: false,
    isEditable: false,
    newType: "",
    isImprovementFormShowing: false,
    newImprovement: null,
    intent: null,
    createdComment: null,
  }),
  methods: {
    manualSweep(value) {
      this.$emit("manualSweep", value);
    },
    saveContent() {
      this.$emit("saveIdeaContent");
    },
    ideaIssueCreated(ideaIssue) {
      this.createdComment = ideaIssue;
    },
    closeImprovementForm() {
      this.isImprovementFormShowing = false;
    },
    openIdeaIssueForm(type) {
      this.newImprovement = new IdeaIssue().deserialize(this.projectIdea.idea);
      this.newImprovement.type = type;
      this.newImprovement.parentId = this.projectIdea.id;
      this.newImprovement.parentType = "idea";
      this.newImprovement.projectId = this.projectIdea.projectId;
      this.newImprovement.stageId = this.projectIdea.stageId;
      this.newImprovement.co = this.projectIdea.stageId;
      this.newImprovement.description = null;
      this.newImprovement.anonymous = false;
      this.newImprovement.id = undefined;
      this.intent = new Date().getUTCMilliseconds();
      this.isImprovementFormShowing = true;
    },
    editorInitialized() {
      this.isEditable = true;
    },
  },
};
</script>


<style lang="scss">
.idea-template-select-item.is-active {
  background: #f8f8f8;
  color: #fff;
}

.idea-template-select-item:hover {
  background: lightgray;
  color: #fff;
}

.ideaContent-empty-spinner {
  text-align: center;
  & > span {
    width: 40px;
    height: 40px;
    background: "#fff";
  }
}
.idea-template-create-item {
  display: flex;
  justify-content: space-between;
}
.idea-template-create-item > input {
  height: 30px;
  max-width: 60%;
  border: none;
  border-bottom: 1px solid lightgray;
}
.selectedIdeaContentType {
  min-width: 100px;
}

.idea-template-select-item-action {
  width: 30px;
  height: 30px;
  display: flex;
  place-content: center;
  border-radius: 50%;
}

.idea-template-select-item {
  height: 30px;
  align-items: center;
  justify-content: space-between;
  display: flex;
  font-size: 16px;
  width: 100%;
  padding-left: 10px;
  cursor: pointer;
}

.selectedIdeaContentType button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.idea_edit_content_container_content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.idea_edit_content_container_content-header-title {
  height: 60px;
  padding: 20px;
  font-size: 20px;
}

.idea_edit_content_container_content-header-button {
  margin: 20px 20px 10px 20px;
}

// @media screen and (max-width: 650px) {
//   .idea_edit_content_container {
//     width: 100%
//   }
// }
// @media screen and (min-width: 650px) {
//   .idea_edit_content_container {
//     max-width: 50%;
//     margin: auto
//   }
// }

.idea_edit_content_container {
  background: #fff;
  border-radius: 3px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
    0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
}
</style>
