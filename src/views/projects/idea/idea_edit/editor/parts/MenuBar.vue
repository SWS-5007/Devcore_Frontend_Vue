<template>
  <div>
    <template v-for="(item, index) in items">
      <div
        class="divider"
        v-if="item.type === 'divider'"
        :key="`divider${index}`"
      />
      <menu-list v-else-if="item.type === 'list'" :key="index" :item="item" />
      <menu-grid v-else-if="item.type === 'grid'" :key="index" :item="item" />
      <menu-item v-else :key="index" v-bind="item" />
    </template>
  </div>
</template>

<script>
import MenuItem from "./MenuItem.vue";
import MenuList from "./MenuList.vue";
import MenuGrid from "./MenuGrid.vue";

export default {
  components: {
    MenuItem,
    MenuList,
    MenuGrid,
  },

  props: {
    editor: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      items: [
        {
          icon: "menu-line",
          title: "Menu",
          type: "list",
          listItems: [
            {
              icon: "h-1",
              title: "Heading 1",
              action: () =>
                this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
              isActive: () => this.editor.isActive("heading", { level: 1 }),
            },
            {
              icon: "h-2",
              title: "Heading 2",
              action: () =>
                this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
              isActive: () => this.editor.isActive("heading", { level: 2 }),
            },
            {
              icon: "h-3",
              title: "Heading 3",
              action: () =>
                this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
              isActive: () => this.editor.isActive("heading", { level: 3 }),
            },
            {
              icon: "h-4",
              title: "Heading 4",
              action: () =>
                this.editor.chain().focus().toggleHeading({ level: 4 }).run(),
              isActive: () => this.editor.isActive("heading", { level: 4 }),
            },
            {
              icon: "h-5",
              title: "Heading 5",
              action: () =>
                this.editor.chain().focus().toggleHeading({ level: 5 }).run(),
              isActive: () => this.editor.isActive("heading", { level: 5 }),
            },
            {
              icon: "h-6",
              title: "Heading 6",
              action: () =>
                this.editor.chain().focus().toggleHeading({ level: 6 }).run(),
              isActive: () => this.editor.isActive("heading", { level: 6 }),
            },
          ],
        },

        {
          icon: "bold",
          title: "Bold",
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive("bold"),
        },
        {
          icon: "italic",
          title: "Italic",
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive("italic"),
        },
        //   {
        //   icon: "underline",
        //   title: "Underline",
        //   action: () => this.editor.chain().focus().toggleUnderline().run(),
        //   isActive: () => this.editor.isActive('underline'),
        // },
        {
          icon: "strikethrough",
          title: "Strike",
          action: () => this.editor.chain().focus().toggleStrike().run(),
          isActive: () => this.editor.isActive("strike"),
        },
        // {
        //   icon: "mark-pen-line",
        //   title: "Highlight",
        //   action: () => this.editor.chain().focus().toggleHighlight().run(),
        //   isActive: () => this.editor.isActive("highlight"),
        // },
        {
          type: "divider",
        },

        // {
        //   icon: "paragraph",
        //   title: "Paragraph",
        //   action: () => this.editor.chain().focus().setParagraph().run(),
        //   isActive: () => this.editor.isActive("paragraph"),
        // },

        {
          icon: "indent-increase",
          title: "Indent",
          action: () => {
            if (
              !(
                this.editor.isActive("bulletList") ||
                this.editor.isActive("orderedList")
              )
            ) {
              this.editor.commands.indent();
              //  this.editor.commands.focus();
            }
          },
          isActive: () => this.editor.isActive("indent"),
        },
        {
          icon: "indent-decrease",
          title: "Outdent",
          action: () => {
            if (
              !(
                this.editor.isActive("bulletList") ||
                this.editor.isActive("orderedList")
              )
            ) {
              this.editor.commands.outdent();
              //  this.editor.commands.focus();
            }
          },
          isActive: () => this.editor.isActive("outdent"),
        },
        {
          icon: "list-unordered",
          title: "Bullet List",
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive("bulletList"),
        },
        {
          icon: "list-ordered",
          title: "Ordered List",
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive("orderedList"),
        },
        {
          type: "divider",
        },
        // {
        //   icon: "double-quotes-l",
        //   title: "Blockquote",
        //   action: () => this.editor.chain().focus().toggleBlockquote().run(),
        //   isActive: () => this.editor.isActive("blockquote"),
        // },
        {
          icon: "separator",
          title: "Horizontal Rule",
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },
        {
          icon: "grid-line",
          title: "table",
          type: "grid",
          listItems: [
            {
              icon: "grid-line",
              title: "table",
              action: () =>
                this.editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 1, cols: 3, withHeaderRow: true })
                  .run(),
              isActive: () => this.editor.isActive("table"),
            },
            {
              icon: "checkbox-blank-line",
              title: "table-clear",
              action: () => this.editor.chain().focus().deleteTable().run(),
              isActive: () => this.editor.isActive("table-clear"),
            },
            {
              icon: "merge-cells-vertical",
              title: "table-merge",
              action: () => this.editor.chain().focus().mergeOrSplit().run(),
              isActive: () => this.editor.isActive("table-merge"),
            },
            {
              icon: "heading",
              title: "table-header-cell",
              action: () =>
                this.editor.chain().focus().toggleHeaderCell().run(),
              isActive: () => this.editor.isActive("table-header-cell"),
            },
            {
              icon: "insert-column-left",
              title: "insert-column-left",
              action: () => this.editor.chain().focus().addColumnBefore().run(),
              isActive: () => this.editor.isActive("insert-column-left"),
            },
            {
              icon: "insert-column-right",
              title: "insert-column-right",
              action: () => this.editor.chain().focus().addColumnAfter().run(),
              isActive: () => this.editor.isActive("insert-column-right"),
            },
            {
              icon: "delete-column",
              title: "delete-column",
              action: () => this.editor.chain().focus().deleteColumn().run(),
              isActive: () => this.editor.isActive("delete-column"),
            },
            {
              icon: "insert-row-top",
              title: "insert-row-top",
              action: () => this.editor.chain().focus().addRowBefore().run(),
              isActive: () => this.editor.isActive("insert-row-top"),
            },
            {
              icon: "insert-row-bottom",
              title: "insert-row-bottom",
              action: () => this.editor.chain().focus().addRowAfter().run(),
              isActive: () => this.editor.isActive("insert-row-bottom"),
            },
            {
              icon: "delete-row",
              title: "delete-row",
              action: () => this.editor.chain().focus().deleteRow().run(),
              isActive: () => this.editor.isActive("delete-row"),
            },
          ],
        },
        {
          type: "divider",
        },
        {
          icon: "text-wrap",
          title: "Hard Break",
          action: () => this.editor.chain().focus().setHardBreak().run(),
        },
        {
          icon: "format-clear",
          title: "Clear Format",
          action: () =>
            this.editor.chain().focus().clearNodes().unsetAllMarks().run(),
        },
        {
          type: "divider",
        },
        {
          icon: "arrow-go-back-line",
          title: "Undo",
          action: () => this.editor.chain().focus().undo().run(),
        },
        {
          icon: "arrow-go-forward-line",
          title: "Redo",
          action: () => this.editor.chain().focus().redo().run(),
        },
      ],
    };
  },
};
</script>

<style lang="scss">
.divider {
  width: 2px;
  height: 1.25rem;
  background-color: rgba(#000, 0.1);
  margin-left: 0.5rem;
  margin-right: 0.75rem;
}
</style>
