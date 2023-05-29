<template>
  <div
    class="idea_editor_content"
    @click.prevent
    id="idea_editor_content"
    oncontextmenu="return false;"
  >
    <v-expand-x-transition>
      <idea-sidebar-drawer
        side="left"
        @navigateToContent="navigate"
        :items="getSortedChapters"
        style="z-index: 2; overflow: initial"
        :value="getSidebarOpenStateLeft"
      >
        <div @click="manualSweep(manualSweepLeft)">
          <div class="ideaContentEditor-navItem-navigation-container">
            <span class="ideaContentEditor-navItem-navigation"
              >{{ $t("NavTableOfContents") }}
            </span>
          </div>
        </div>
      </idea-sidebar-drawer>
    </v-expand-x-transition>
    <div
      class="d-overlay"
      style="z-index: 1"
      @click="closeOverlay"
      v-if="
        shouldShowCommentPrompt ||
        getSidebarOpenStateLeft ||
        getSidebarOpenStateRight
      "
    ></div>

    <new-user-intro @close="closeIntro" v-if="getIntroOverlayOpen" />

    <div class="editor" v-if="editor">
      <editor-content
        class="editor__content"
        id="editor__content"
        style="overflow: hidden; height: 75vh"
        :editor="editor"
        ref="editor_content"
      />

      <bubble-menu
        v-if="!isImprovementFormShowing"
        class="idea__editor__comment__menu"
        :editor="editor"
        :tippy-options="{ placement: 'top' }"
        :shouldShow="shouldShow"
        :key="intent"
      >
        <section
          class="editor__bubble-menu"
          style="min-width: 275px; min-height: 150px"
        >
          <article
            class="improve-idea"
            style="flex-grow: 1; height: 100%; padding-left: calc(50% - 70px)"
            @click="showImprovementForm('IMPROVEMENT')"
          >
            <img :src="CommentIcon" />
            <div>{{ $t("Improve idea") }}</div>
          </article>
          <article
            style="flex-grow: 1; height: 100%; padding-left: calc(50% - 70px)"
            class="problem-with-idea"
            @click="showImprovementForm('PROBLEM')"
          >
            <img :src="ProblemIcon" />
            <div>{{ $t("Report issue") }}</div>
          </article>
        </section>
      </bubble-menu>
    </div>
    <v-expand-x-transition>
      <idea-sidebar-drawer
        side="right"
        @navigateToContent="navigate"
        :items="getSortedIdeaContentTitles"
        style="z-index: 2; overflow: initial"
        :selectedContentType="value.contentType"
        :value="getSidebarOpenStateRight"
      >
        <div>
          <div
            class="ideaContentEditor-navItem-content-container"
            @click="manualSweep(manualSweepRight)"
          >
            <span class="ideaContentEditor-navItem-content">{{
              $t("NavContentTypes")
            }}</span>
          </div>
        </div>
      </idea-sidebar-drawer>
    </v-expand-x-transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { EditorContent, BubbleMenu } from "@tiptap/vue-2";
import { MenuBar } from "./parts";
import IdeaContentSidebar from "../../../IdeasContentSidebar.vue";
import ContentEditor from "./EditorLoader.js";
import NewUserIntro from "./IdeaIntro/NewUserIntro.vue";
import { CommentIcon, ProblemIcon } from "@/assets";
import { v4 as uuidv4 } from "uuid";

const commentDeserializer = (_ideaIssue) => {
  const {
    id,
    author,
    description,
    anonymous,
    files,
    createdAt,
    type,
    replied = false,
  } = _ideaIssue;

  const ideaIssueComment = {
    id,
    user: author.id,
    anonymous: anonymous,
    content: description,
    createdAt: createdAt,
    replied,
    type,
  };

  if (files[0]) {
    ideaIssueComment.file = {
      link: files[0].url,
      name: files[0].title,
    };
  }
  return ideaIssueComment;
};

/* eslint-disable */
export default {
  components: {
    EditorContent,
    MenuBar,
    BubbleMenu,
    "new-user-intro": NewUserIntro,
    "idea-sidebar-drawer": IdeaContentSidebar,
  },
  props: {
    contentType: {
      type: String,
      required: true,
    },
    value: {
      type: Object,
      default: () => {},
    },
    createdComment: {
      type: Object,
      default: () => {},
    },
    projectIdea: {
      type: Object,
      required: true,
    },
    isEditable: {
      type: Boolean,
      default: () => false,
    },
    isImprovementFormShowing: {
      type: Boolean,
      default: () => false,
    },
    ideaContentTitles: {
      type: Array,
      default: () => [],
    },
    sidebarOpenState: {
      type: Array,
      default: () => [
        {
          open: false,
          side: "right",
        },
        {
          open: false,
          side: "left",
        },
      ],
    },
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      ideaContents: "ideaContent/all",
    }),
    getIntroOverlayOpen() {
      return this.introOverlayOpen;
    },
    getSidebarOpenStateLeft() {
      return (
        this.sidebarOpenState.find((bar) => bar.side === "left").open &&
        !this.introOverlayOpen
      );
    },
    getSidebarOpenStateRight() {
      return (
        this.sidebarOpenState.find((bar) => bar.side === "right").open &&
        !this.introOverlayOpen
      );
    },
    contentHasHeadings() {
      const content = this.value.markup ? this.value.markup.content : [];
      return content.filter((x) => x.type === "heading").length > 0;
    },
    getSortedChapters() {
      if (!this.editor) return [];
      const navigateElements = [];
      this.editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          let text = node.textContent;
          const { headings } = this.editor.extensionStorage.heading;
          if (text) {
            const decoration = headings.find((heading) => heading.from === pos);
            const { id } = decoration.type.attrs;
            const heading = {
              id,
              type: "heading",
              level: node.attrs.level,
              text: text,
              position: pos,
            };
            navigateElements.push(heading);
          }
        }
      });

      return navigateElements;
    },
    getSortedIdeaContentTitles() {
      return this.ideaContents.map((content) => {
        return {
          id: content.id,
          type: "content",
          level: 1,
          text: content.contentType,
          position: null,
        };
      });
    },
    getCreatedComment() {
      return this.createdComment;
    },
    getCurrentComments() {
      const { idea } = this.projectIdea;
      return [...idea.improvements, ...idea.problems];
    },
  },
  watch: {
    "value.contentType": {
      handler(newVal) {
        if (newVal) {
          this.editor.commands.setContent(this.value.markup);
        }
      },
    },
    isImprovementFormShowing: {
      handler(newVal) {
        if (!newVal) {
          this.closeOverlay();
        }
      },
    },
    getCreatedComment: {
      handler(newVal) {
        this.$nextTick(() => {
          this.setIdeaIssues(newVal);
        });
      },
    },
    isEditable: {
      handler(newVal) {
        // if (newVal) this.focusEditor();
      },
    },
  },

  data() {
    return {
      introOverlayOpen: false,
      intent: Math.random(),
      provider: null,
      editor: null,
      status: "connecting",
      chapters: [],
      ProblemIcon,
      CommentIcon,
      shouldShowCommentPrompt: false,
      tippyOffset: [0, 50],
      isCommentActive: false,
      activeCommentInstance: null,
      curNodePos: null,
      showUserIntroAfterMS: 30000,
      manualSweepLeft: {
        bar: "left",
        direction: "left",
      },
      manualSweepRight: {
        bar: "right",
        direction: "right",
      },
    };
  },
  methods: {
    checkIfUserIdeaIntroduction() {
      const canShowIntro =
        !this.shouldShowCommentPrompt && !this.isImprovementFormShowing;

      if (canShowIntro) {
        this.introOverlayOpen = true;
      }
    },
    closeIntro() {
      this.introOverlayOpen = false;
      this.closeOverlay();
    },
    manualSweep(value) {
      this.$emit("manualSweep", value);
    },
    closeOverlay() {
      this.$emit("closeSidebar");
      this.isCommentActive = false;
      this.shouldShowCommentPrompt = false;
      this.activeCommentInstance = null;
      this.curNodePos = null;
      setTimeout(() => {
        this.editor.commands.blur();
        this.editor.commands.setTextSelection({});
      });
    },
    getCurrentNodeSelection() {
      const { state } = this.editor;
      const { selection } = state;
      const { from: selectionFrom, to: selectionTo } = selection;
      return { selectionFrom, selectionTo };
    },
    shouldShow(args) {
      const resolvedPos = args.state.doc.resolve(args.from);
      const resolvedPosTo = args.state.doc.resolve(args.to);
      const isText = resolvedPos.nodeAfter && resolvedPos.nodeAfter.text;

      const { selectionFrom, selectionTo } = this.getCurrentNodeSelection();

      if (selectionFrom < selectionTo && !this.curNodePos && isText) {
        console.log(selectionFrom, selectionTo);

        this.shouldShowCommentPrompt = true;
        this.tippyOffset = [100, -args.state.selection.anchor];
        this.curNodePos = resolvedPos.pos;
        return true;
      } else {
        this.curNodePos = null;
        this.shouldShowCommentPrompt = false;
      }
      return false;
    },
    showImprovementForm(type = "IMPROVEMENT") {
      this.shouldShowCommentPrompt = false;
      this.$emit("openIdeaIssueForm", type);
    },
    setIdeaIssues(ideaIssue) {
      if (!this.editor) return;
      const newIdeaIssueComment = commentDeserializer(ideaIssue);

      let dataToInsert;

      if (this.isCommentActive && this.activeCommentInstance) {
        dataToInsert = JSON.parse(JSON.stringify(this.activeCommentInstance));

        dataToInsert.comments.push(newIdeaIssueComment);
      } else {
        dataToInsert = {
          uuid: uuidv4(),
          ideaUuid: this.projectIdea.idea.uuid,
          comments: [newIdeaIssueComment],
        };
      }

      console.log("setting comment", dataToInsert);

      if (!!this.curNodePos) {
        this.editor
          .chain()
          .focus(this.curNodePos)
          .setComment(JSON.stringify(dataToInsert))
          .run();
      }
      this.$nextTick(() => {
        this.$emit("saveContent");
      });

      // this.editor.commands.blur();
      //this.editor.commands.setTextSelection({});

      this.curNodePos = null;
    },

    navigate(item) {
      if (!item) return;

      if (item.type === "heading") {
        setTimeout(() => {
          const el = document.getElementById(item.id);

          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        });
      }

      if (item.type === "content") {
        let el = document.getElementById("idea-edit-editor-container");
        el.scrollTop = 0;
        this.$store.dispatch("ideaContent/current", item.id);
      }
    },
    focusEditor() {
      if (this.editor && !this.getSidebarOpenStateLeft) {
        this.editor.commands.focus();
      }
    },
    initEditor() {
      if (this.editor) this.editor.destroy();
      if (this.provider) this.editor.destroy();

      const onUpdate = (content) => {
        this.$emit("closeImprovementForm");
        this.$emit("input", {
          contentType: this.value.contentType,
          markup: content,
        });
      };
      const onSelectionUpdate = (editor) => {
        this.isCommentActive = editor.isActive("comment");

        if (this.isCommentActive) {
          const commentString = editor.getAttributes("comment").comment;
          this.activeCommentInstance = JSON.parse(commentString);
        } else {
          this.activeCommentInstance = null;
        }
      };

      const editorInstance = new ContentEditor(
        this.isEditable,
        this.value.markup,
        {
          onUpdate: (content) => onUpdate(content),
          onSelectionUpdate: (value) => onSelectionUpdate(value),
        }
      );

      this.editor = editorInstance.editor;

      setTimeout(() => {
        this.$emit("initialized");
      });
    },
  },

  mounted() {
    if (!this.user.profileIdeaIntro) {
      setTimeout(() => {
        this.checkIfUserIdeaIntroduction();
      }, this.showUserIntroAfterMS);
    }

    this.initEditor();
  },
  beforeDestroy() {
    this.editor.destroy();
  },
};
</script>


<style lang="scss">
.ideaContentEditor-navItem-content-container {
  position: absolute;
  right: 100%;
  height: 150px;
  top: calc(35%);
  background: #4294d0;
  width: 20px;
  border-bottom-left-radius: 100px;
  border-top-left-radius: 100px;
  cursor: pointer;
}

.ideaContentEditor-navItem-content {
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
  border-bottom-right-radius: 100px;
  border-top-right-radius: 100px;
}

.ideaContentEditor-navItem-navigation-container {
  position: absolute;
  width: 20px;
  left: 100%;
  height: 150px;
  top: calc(35%);
  cursor: pointer;
  border-bottom-right-radius: 100px;
  border-top-right-radius: 100px;
}

.ideaContentEditor-navItem-navigation {
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
  background: #000;
  place-content: center;
  border-bottom-right-radius: 100px;
  border-top-right-radius: 100px;
}

.idea-content-navigation-drawer-left {
  // top:85px !important;
  border-right: 8px solid #000;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

#editor__content::-webkit-scrollbar {
  width: 0 !important;
  display: none;
  -webkit-appearance: none;
}

#editor__content {
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;
}

.idea-content-navigation-drawer-right {
  border-left: 8px solid #4294d0;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.half-circle-right {
  width: 40px;
  height: 40px;
  border-bottom-right-radius: 100px;
  border-top-right-radius: 100px;
  border-bottom: 0;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

.half-circle-left.isOpen {
  left: -23px !important;
  position: absolute;
  border-top-left-radius: 50%;
  border-bottom-left-radius: 50%;
  background: linear-gradient(to left, transparent 45%, #4294d0 45.5%);
  height: 40px;
  border-top: 0;
  top: calc(44.3%);
  width: 40px;
  display: flex;

  & > .v-icon {
    color: #fff;
    top: 0px !important;
  }
}

.half-circle-right.isOpen {
  right: -23px !important;
  position: absolute;
  border-top-right-radius: 50%;
  border-bottom-right-radius: 50%;
  background: linear-gradient(to right, transparent 45%, #000 45.5%);
  height: 40px;
  border-top: 0;
  top: calc(44.3%);
  width: 40px;
  display: flex;

  & > .v-icon {
    color: #fff;
    right: -15px !important;
    top: 0px !important;
  }
}

.ideaContent-content-sidebar-right-icon .half-circle-left {
  background: #242526;
  border: 10px solid #242526;
}

.half-circle-left {
  width: 10px;
  height: 40px;
  border-bottom-left-radius: 100px;
  border-top-left-radius: 100px;
  // right: -8px;
  border-bottom: 0;
  box-sizing: border-box;
}

.ideaContent-content-sidebar-right-icon {
  width: 22px;
  cursor: pointer;
  top: calc(50%);

  & > .v-icon {
    color: #fff;
    right: 12px;
    bottom: 5px;
  }
}

.ideaContent-content-sidebar-left-icon {
  width: 22px;
  cursor: pointer;
  top: calc(50%);
  right: 0;

  & > .v-icon {
    color: #fff;
    bottom: 5px;
  }
}

.ideaContent-content-sidebar-left {
  width: 8px;
  height: 100%;
}

.ideaContent-content-sidebar-right {
  width: 8px;
  height: 100%;
}

.ideaContent-content-sidebar-left-icon {
  position: absolute;
  border-top-right-radius: 50%;
  border-bottom-right-radius: 50%;
  height: 40px;
  display: flex;
}

.ideaContent-content-sidebar-right-icon {
  position: absolute;
  background: #4294d0;
  border-top-left-radius: 50%;
  border-bottom-left-radius: 50%;
  right: 1px;
  height: 40px;
  display: flex;
}

/* Setup */

.editor_header_border {
  border-bottom: 1px solid lightgray;
}

.editor__content {
  cursor: text;
  margin: 0.5rem;
  padding: 0.5rem;

  & > #idea-edit-editor-container {
    overflow-x: hidden;
    padding: 10px;
    margin-right: 5px;
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Safari and Chrome */
    }
  }
}

.idea_editor_content {
  background: #fff;
  flex-grow: 1;
  border-radius: 3px;
  height: 100%;
}

.editor {
  display: flex;
  flex-direction: column;
  max-height: 26rem;
  color: #0d0d0d;
  background-color: #fff;
  border-radius: 0.75rem;
  min-height: 100%;

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    justify-content: space-between;
    height: 50px;
    padding: 0 20px 5px 20px;
  }

  &__content {
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  &__bubble-menu {
    display: flex;
    flex-direction: column;
    background: white;
    box-shadow: 0 0 5px rgba(gray, 0.5);
    border-radius: 8px;

    article {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      height: 4em;
      text-transform: uppercase;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;

      &:first-of-type {
        border-bottom: 1px solid #c3c3c3;
      }

      &:hover {
        background-color: rgba(gray, 0.1);
      }

      &.improve-idea {
        color: #4294d0;
      }

      &.problem-with-idea {
        color: #dc3646;
      }

      img {
        margin-right: 8px;
      }
    }
  }

  &__footer {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    color: #0d0d0d;
    white-space: nowrap;
    padding: 0.25rem 0.75rem;
  }

  /* Some information about the status */
  &__status {
    display: flex;
    align-items: center;
    border-radius: 5px;

    &::before {
      content: " ";
      flex: 0 0 auto;
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      background: rgba(#0d0d0d, 0.5);
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    &--connecting::before {
      background: #616161;
    }

    &--connected::before {
      background: #b9f18d;
    }
  }

  &__name {
    button {
      background: none;
      border: none;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      color: #0d0d0d;
      border-radius: 0.4rem;
      padding: 0.25rem 0.5rem;

      &:hover {
        color: #fff;
        background-color: #0d0d0d;
      }
    }
  }
}

span[data-comment] {
  background: rgba(skyblue, 0.25);

  &:hover {
    &::after {
      content: attr(data-comment);
      background: black;
      border-radius: 10px;
      border: 1px solid aliceblue;
      color: aliceblue;
      position: absolute;
    }
  }
}

/* Table */
.ProseMirror {
  height: 100%;

  user-select: none;

  // >*::selection {
  //   background-color: #fff
  // }

  // > p::selection {
  //   background-color: #fff
  // }

  .comment-component.node-has-focus {
    background-color: #d0e4f3;
  }

  p.node-has-focus {
    background-color: #d0e4f3 !important;
  }

  .content-dom::selection {
    background: #d0e4f3;
  }

  //   p::selection:not(.node-has-focus) {
  //   background: #fff
  // }

  p::selection > .node-has-focus {
    background: #d0e4f3;
    /* For other Browsers */
  }

  /* For Firefox */
  ::-moz-selection {
    background: #d0e4f3;
  }

  @media screen and (max-width: 650px) {
    p,
    p > span {
      font-size: 14px;
    }

    h1,
    h1 > span {
      font-size: 18px;
    }

    h2,
    h2 > span {
      font-size: 16px;
    }
    h3,
    h3 > span {
      font-size: 16px;
    }
  }

  @media screen and (min-width: 650px) {
    p,
    p > span {
      font-size: 16px;
    }

    h1,
    h1 > span {
      font-size: 20px;
    }

    h2,
    h2 > span {
      font-size: 18px;
    }
    h3,
    h3 > span {
      font-size: 18px;
    }
  }

  p {
    color: #707070;

    font-family: FuturaLight !important;
    font-weight: 400;
    -webkit-tap-highlight-color: transparent;

    // &::selection {
    //   color: #707070;
    // }
  }

  h1 {
    color: #242526 !important;
    font-family: FuturaBold !important;
    font-weight: 400;
  }

  h2 {
    color: #242526 !important;
    font-family: FuturaMedium !important;
    font-weight: 400;
  }

  h3 {
    color: #4294d0 !important;
    font-family: FuturaMedium !important;
    font-weight: 400;
  }

  h1,
  h2,
  h3 {
    margin-top: 21px;
  }

  p > span {
    color: #707070 !important;
    font-family: FuturaLight !important;
    font-weight: 400;
    -webkit-tap-highlight-color: transparent;

    &::selection {
      color: #707070;
    }
  }

  h1 > span {
    color: #242526 !important;
    font-size: 18px;
    font-family: FuturaBold !important;
    font-weight: 400;
  }

  h2 > span {
    color: #242526 !important;
    font-size: 16px;
    font-family: FuturaMedium !important;
    font-weight: 400;
  }

  h3 > span {
    color: #4294d0 !important;
    font-size: 16px !important;
    font-family: FuturaMedium !important;
    font-weight: 400;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;

    margin: 0;
    overflow: hidden;

    tbody > tr:not(:first-child):nth-child(odd) {
      background: #c7dbfc;
    }

    @media screen and (max-width: 650px) {
      tbody > tr:first-child > td {
        font-size: 14px;
      }
    }
    @media screen and (min-width: 650px) {
      tbody > tr:first-child > td {
        font-size: 16px;
      }
    }

    tbody > tr:first-child > td {
      font-weight: bold;
      overflow: hidden;
      text-align: left;
      background-color: #4294d0;
      font-family: FuturaMedium;
      color: #fff;

      & > p {
        color: #fff;
      }
    }

    tbody > tr:nth-child(odd) {
      background: #c7dbfc;
    }

    tbody > tr:not(:first-child):nth-child(odd) > th {
      background: #c7dbfc;

      & > p {
        font-family: FuturaLight;
        color: #707070;
        overflow: hidden;
      }
    }

    tbody > tr:not(:first-child):nth-child(even) > th {
      background: #fff;

      & > p {
        font-family: FuturaLight;
        color: #707070;
        overflow: hidden;
      }
    }

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    td {
      font-family: FuturaLight;
      color: #707070;
    }

    @media screen and (max-width: 650px) {
      th {
        font-size: 14px;
      }
    }
    @media screen and (min-width: 650px) {
      th {
        font-size: 16px;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: #4294d0;
      color: #fff;
      font-family: FuturaMedium;

      & > p {
        color: #fff;
        -webkit-tap-highlight-color: transparent;
      }
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }

    p {
      margin: 0;
    }
  }
}

/* Give a remote user a caret */
.collaboration-cursor__caret {
  position: fixed;
  margin-left: -1px;
  margin-right: -1px;
  word-break: normal;
  pointer-events: none;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  user-select: none;
  color: #0d0d0d;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
}

/* Basic editor styles */
.ProseMirror {
  outline: none;
  font-weight: 400;
  letter-spacing: 1px;
}

.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    user-select: none;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0d0d0d;
    color: #fff;
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  mark {
    background-color: #faf594;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    margin: 1rem 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0d0d0d, 0.1);
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0d0d0d, 0.1);
    margin: 2rem 0;
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }

  span.selection-decoration {
    background: #accef7;
  }

  @media screen and (min-width: 600px) {
    p > span.is-link > a {
      &[data-tooltip] {
        position: relative;

        &:hover {
          background: #4294d0;
          color: #fff;
        }

        &:hover::before {
          padding-right: 5px;
          font-family: "Material Icons";
          font-size: 15px;
          opacity: 0.8;
          display: flex;
          place-items: center;
          content: "link";
          height: 17px;

          &:hover {
            background: #4294d0;
            color: #fff;
          }
        }

        &:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: 70%;
          top: -6px;
          white-space: nowrap;
          transform: translateX(-50%) translateY(-100%);
          background: rgba(0, 0, 0, 0.7);
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          color: #fff;
          padding: 4px 2px;
          font-size: 12px;
          min-width: 80px;
          border-radius: 5px;
          pointer-events: none;
          padding: 10px;
          font-family: "FuturaMedium";
        }
      }
    }
  }

  div > span.is-link,
  p > span.is-link,
  h1 > span.is-link,
  h2 > span.is-link,
  h3 > span.is-link {
    display: inline-flex;
    padding-right: 5px;
    height: 40px;
    white-space: nowrap;

    & > a {
      padding: 0px 10px 3px 10px;
      border: 1px solid lightgray;
      display: inline-flex;
      border-radius: 3px;
      place-items: center;
      color: #4294d0;
      line-height: 5px;
      cursor: pointer;
      margin-right: 10px;
      text-decoration: none;
      user-select: none;

      &::before {
        padding-right: 3px;
        font-family: "Material Icons";
        font-size: 15px;
        opacity: 0.8;
        padding-top: 3px;
        display: flex;
        place-items: center;
        content: "link";
        height: 17px;
      }
    }
  }
}

.idea-editor-custom-table {
  width: 100%;
}

.table-actions-rowButtons {
  width: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
}

.table-container {
  display: flex;
  overflow: hidden;
  flex-wrap: wrap;
}

.table-container > table {
  width: 90%;
  height: 90%;
}

.table-actions-colButtons {
  display: flex;
}

.table-actions-rowButtons > button,
.table-actions-colButtons > button {
  width: 40px;
  height: 40px;
  display: flex;
  place-content: center;
  align-items: center;
}

@media screen and (max-width: 650px) {
  .tableWrapper {
    font-size: 14px;
  }
}
@media screen and (min-width: 650px) {
  .tableWrapper {
    font-size: 16px;
  }
}

.tableWrapper {
  max-width: 100%;
  padding-bottom: 20px !important;
  overflow-x: auto;
  font-family: FuturaBQ, sans-serif;
}

.table-actions-colButtons {
  width: 100px;
  display: flex;
  justify-content: space-between;
}

.table-actions-removeTable {
  width: calc(45% - 50px);
}

.table-actions-removeTable,
.table-actions-rowButtons,
.table-actions-colButtons {
  margin-top: 10px;
}

.table-actions-removeTable > button {
  width: 100px;
  height: 40px;
}

.table-container-table {
  max-height: 100px;
}

.editor_idea_problem_prompt {
  background: #fff;
  height: 120px;
  display: flex;
  flex-direction: column;
  width: 200px;
}

.editor > div[data-tippy-root] {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  margin-left: auto !important;
  margin-right: auto !important;
  width: 275px;
  transform: none !important;
  top: 38.5% !important;
  height: 150px;

  & > .tippy-box {
    background-color: transparent;

    & > .tippy-arrow:before {
      display: none;
    }
  }
}
</style>
