<template>
  <div class="idea_edit_container">
    <div
      class="idea_edit_container-sidebar-left-closed"
      :class="`idea_edit_container-sidebar-left-open-${getSidebarOpenStateLeft}`"
      @click="
        manualSweep({
          bar: 'left',
          direction: 'right',
        })
      "
    >
      <div class="ideaEdit-navItems-navigation-container">
        <span class="ideaEdit-navItems-navigation">{{
          $t("NavTableOfContents")
        }}</span>
      </div>
    </div>
    <div
      v-if="!isLoading"
      style="
        width: calc(100% - 16px);
        justify-content: center;
        flex-direction: column;
        display: flex;
      "
    >
      <idea-edit-content
        v-model="getIdeaContent"
        :user="user"
        :project="project"
        :projectIdea="currentIdea"
        :sidebarOpenState="value"
        @closeSidebar="closeSidebar"
        @saveIdeaContent="saveIdeaContent"
        @manualSweep="manualSweep"
        @isImprovementFormShowing="setIsImprovementFormShowing"
        class="ideaEdit-content"
        id="idea-edit-content-container"
      ></idea-edit-content>
    </div>

    <div v-else class="ideaContent-empty-spinner">
      <page-loader style="top: 100px; margin-bottom: 135px" />
    </div>

    <div style="width: 8px">
      <div
        v-if="getIdeaContentTypes.length > 1"
        class="idea_edit_container-sidebar-right-closed"
        :class="`idea_edit_container-sidebar-right-open-${getSidebarOpenStateRight}`"
        @click="
          manualSweep({
            bar: 'right',
            direction: 'left',
          })
        "
      >
        <div class="ideaEdit-navItems-content-container">
          <span class="ideaEdit-navItems-content">{{
            $t("NavContentTypes")
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

	<script>
import GQLForm from "@/lib/gqlform";
import IdeaEditContent from "./layout/IdeaEditContent.vue";
import PageLoader from "@/components/global/PageLoader.vue";

export default {
  components: {
    "idea-edit-content": IdeaEditContent,
    "page-loader": PageLoader,
    // "idea-sidebar-drawer": IdeaContentSidebar,
  },
  props: {
    value: {
      type: Array,
      required: true,
    },
    project: {
      type: Object,
      required: true,
    },
    currentIdea: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    currentContent: {
      type: String,
      required: false,
    },
    ideaContents: {
      type: Array,
      required: false,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
  },
  created() {
    this.ideaContentCategories = this.ideaContents.map((content) => {
      const roles = content.companyRoles.map((role) =>
        role.id ? role.id : role
      );

      return {
        name: content.contentType,
        id: content.id,
        contentForm: new GQLForm({
          id: undefined,
          markup: null,
          ideaId: null,
          version: 1,
          contentType: null,
          companyRoles: roles,
        }),
      };
    });
  },

  async mounted() {
    await this.initializeForms();
  },

  data: () => ({
    contentNavIcon: require("@/assets/img/ico-ideaedit-contenttype-nav.svg"),
    filter: null,
    ideaContentCategories: [],
    isImprovementFormShowing: false,
  }),
  computed: {
    getEditorWidth() {
      let width = 100;

      return width;
    },
    getIdeaContentTypes: {
      get() {
        return this.ideaContents.map((content) => {
          return {
            heading: content.contentType,
            id: content.id,
          };
        });
      },
    },
    contentHasTypes: {
      get() {
        return this.ideaContents.length > 1;
      },
    },
    getSidebarOpenStateRight: {
      get() {
        const right = this.value.find((x) => x.side === "right");
        return right.open;
      },
    },
    getSidebarOpenStateLeft: {
      get() {
        const left = this.value.find((x) => x.side === "left");
        return left ? left.open : false;
      },
    },
    getSelectedCategoryIndex: {
      get() {
        const categories = this.ideaContentCategories;
        if (this.currentContent) {
          return categories.findIndex(
            (category) => category.id == this.currentContent
          );
        }
        return categories.findIndex(
          (category) => category.id == this.getIdea.ideaContentId
        );
      },
    },
    getIdea: {
      get() {
        return this.currentIdea.idea;
      },
    },
    getIdeaContent: {
      get() {
        const contentForm =
          this.ideaContentCategories[this.getSelectedCategoryIndex].contentForm;

        return {
          contentType: contentForm.contentType,
          markup: JSON.parse(contentForm.markup),
        };
      },
      set(value) {
        const contentForm =
          this.ideaContentCategories[this.getSelectedCategoryIndex].contentForm;
        contentForm.markup = JSON.stringify(value.markup);
        contentForm.contentType = value.contentType;
      },
    },
  },
  methods: {
    setIsImprovementFormShowing(val) {
      this.isImprovementFormShowing = val;
    },
    closeSidebar() {
      this.$emit("closeSidebar");
    },

    manualSweep(value) {
      this.$emit("manualSweep", value);
    },
    async saveIdeaContent() {
      const contentForm =
        this.ideaContentCategories[this.getSelectedCategoryIndex].contentForm;

      contentForm.companyRoles = contentForm.companyRoles.map((role) =>
        role.id ? role.id : role
      );

      await this.$store.dispatch(`ideaContent/update`, contentForm);
      await this.$store.dispatch("project/findById", {
        id: this.project.id,
        force: true,
      });
    },
    async initializeForms() {
      this.ideaContentFormFieldMapper();
    },
    ideaContentFormFieldMapper() {
      if (!this.isLoading && this.getIdea && this.getIdea.ideaContentId) {
        this.ideaContents.map((content) => {
          const mapToCategory = this.ideaContentCategories.find(
            (category) => category.name === content.contentType
          );
          const mapFromIdeaContent = Object.assign(content, {});
          this.formFieldMapper(mapToCategory.contentForm, mapFromIdeaContent);
        });
      }
    },
    formFieldMapper(mapTo, mapFrom) {
      Object.keys(mapTo.fields || {})
        .filter((key) => key in mapFrom)
        .forEach((key) => {
          mapTo[key] = mapFrom[key];
        });
    },
  },
};
</script>


<style lang="scss">
.ideaEdit-navItems-content-container {
  position: absolute;
  height: 150px;
  right: 0;
  top: calc(42%);
  background: #4294d0;
  border-bottom-left-radius: 100px;
  border-top-left-radius: 100px;
  cursor: pointer;
  width: 20px;
}
.ideaEdit-navItems-content {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-orientation: mixed;
  color: rgb(255, 255, 255);
  font-size: 14px;
  letter-spacing: 1px;
  font-family: FuturaLight;
  height: 100%;
  white-space: nowrap;
  padding-bottom: 10px;
  padding-top: 10px;
  display: flex;
  place-content: center;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.ideaEdit-navItems-navigation-container {
  position: absolute;
  height: 150px;
  top: calc(42%);
  background: #000;
  border-bottom-right-radius: 100px;
  border-top-right-radius: 100px;
  cursor: pointer;
  width: 20px;
  background: #000;
}
.ideaEdit-navItems-navigation {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: rgb(255, 255, 255);
  font-size: 14px;
  letter-spacing: 1px;
  font-family: FuturaLight;
  height: 100%;
  white-space: nowrap;
  padding-bottom: 10px;
  padding-top: 10px;
  display: flex;
  place-content: center;
  user-select: "none";
}
.idea_edit_container-sidebar-left-open-true {
  background: #fff;
}
.idea_edit_container-sidebar-left-open-false {
  background: #000;
}

.idea_edit_container-sidebar-right-open-true {
  background: #4294d0;
}

.idea_edit_container-sidebar-right-open-false {
  background: #4294d0;
  right: 0;
}
</style>
<style scoped>
.ideaEdit-content {
  /* width: calc(100% - 8px);
  max-width: 100%; */
  height: calc(100% - 10px);
  display: flex;
  justify-content: center;
}
.idea_edit_container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background: #efefef;
  /* max-width: 40%; */
}

.ideaContent-content-sidebar-right-icon.half-circle-right.drawer-left-closed {
  left: 0;
}
.ideaContent-content-sidebar-right-chevron-right {
  margin: 10px 0 0 10px;
}

/* .ideaContent-content-sidebar-left-icon.half-circle-left.drawer-right-closed {
  right: 8px;
} */
.ideaContent-content-sidebar-left-chevron-left {
  margin: 10px 0 0 10px;
}
</style>

<style lang="scss" scoped>
// .ideaContent-content-sidebar-left-icon {
//   top: calc(50%);
//   z-index: 1;
//   & > div > .v-icon {
//     color: #fff;
//     right: 12px;
//     bottom: 5px;
//   }
// }

// .idea_edit_container-sidebar-right-open-true
//   > .ideaContent-content-sidebar-left-icon {
//   top: calc(50%);
//   z-index: 1;
//   right: 250px;
//   & > div > .v-icon {
//     color: red;
//     bottom: 5px;
//   }
// }
// .idea_edit_container-sidebar-right-open-false
//   > .ideaContent-content-sidebar-left-icon {
//   top: calc(50%);
//   z-index: 1;
//   right: 0px;
//   & > div > .v-icon {
//     color: #fff;
//     bottom: 5px;
//   }
// }

.idea_edit_container-sidebar-left-closed {
  display: flex;
  flex-direction: row;
  height: calc(100% - 50px);
  margin-top: 25px;
  max-width: 8px;
  width: 100%;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  z-index: 1;
}

.idea_edit_container-sidebar-right-closed {
  display: flex;
  flex-direction: row;
  height: calc(100% - 50px);
  margin-top: 25px;
  max-width: 8px;
  width: 100%;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.idea_edit_container-sidebar-left-closed-empty-content {
  width: 8px;
}
</style>