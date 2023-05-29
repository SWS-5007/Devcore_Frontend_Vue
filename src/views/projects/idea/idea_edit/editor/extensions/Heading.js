import { Node, mergeAttributes, textblockTypeInputRule } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view";

export const Heading = Node.create({
  name: "heading",

  addOptions() {
    return {
      id: null,
      levels: [1, 2, 3, 4],
      HTMLAttributes: {}
    };
  },

  content: "inline*",

  group: "block",

  defining: true,

  addAttributes() {
    return {
      id: null,
      level: {
        default: 1,
        rendered: false
      }
    };
  },

  parseHTML() {
    return this.options.levels.map(level => ({
      tag: `h${level}`,
      attrs: { level }
    }));
  },

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];
    HTMLAttributes.id = `heading-item__${this.storage.headings.length + 1}`;

    if (!level || level > 3) {
      return [
        `p`,
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        0
      ];
    }
    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ];
  },

  // addNodeView() {
  //   return ({ editor, node }) => {
  //     const heading = document.createElement("h1");
  //     const headings = [];

  //     editor.state.doc.descendants((node, pos) => {
  //       if (node.type.name === "heading") {
  //         headings.push({
  //           level: node.attrs.level,
  //           text: node.textContent,
  //           id: heading.id
  //         });
  //       }
  //     });

  //     heading.innerHTML = node.textContent;

  //     if (headings.length > this.storage.counter) {
  //       this.storage.counter += 1;
  //     } else {
  //       this.storage.counter = 1;
  //     }

  //     return {
  //       heading
  //     };
  //   };
  // },

  addStorage() {
    return {
      headings: []
    };
  },

  addCommands() {
    return {
      setHeading: attributes => ({ commands }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false;
        }

        return commands.setNode(this.name, attributes);
      },
      toggleHeading: attributes => ({ commands }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false;
        }

        return commands.toggleNode(this.name, "paragraph", attributes);
      }
    };
  },

  addKeyboardShortcuts() {
    return this.options.levels.reduce(
      (items, level) => ({
        ...items,
        ...{
          [`Mod-Alt-${level}`]: () =>
            this.editor.commands.toggleHeading({ level })
        }
      }),
      {}
    );
  },

  addInputRules() {
    return this.options.levels.map(level => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{1,${level}})\\s$`),
        type: this.type,
        getAttributes: {
          level
        }
      });
    });
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("headingNode"),
        props: {
          decorations: ({ doc }) => {
            const decorations = [];
            doc.descendants((node, pos) => {
              const from = pos;
              const to = from + node.nodeSize;
              if (node.type.name !== "heading") return false;
              decorations.push(
                Decoration.node(from, to, {
                  'id': `heading-item__${decorations.length + 1}`
                })
              );
            });

            this.storage.headings = decorations;
            return DecorationSet.create(doc, decorations);
          }
        }
      })
    ];
  }
});
