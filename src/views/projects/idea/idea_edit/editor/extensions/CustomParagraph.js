import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { TextSelection } from "prosemirror-state";

const LONG_PRESS_THRESSHOLD_TO_COMMENT_IN_MS = 300;
const SCROLL_ALLOWANCE_ON_LONG_PRESS = 50;

const isCommentableNode = (view, clickPos) => {
  const { doc } = view.state;
  let isCommentable = false;
  doc.descendants((node, nodePos) => {
    const isCurrent =
      clickPos >= nodePos && clickPos <= nodePos + node.nodeSize - 1;
    if (!isCurrent) return false;
    const isCommentableNode =
      node.type.name === "paragraph" || node.type.name === "comment";
    if (!isCommentableNode || !node.textContent) return false;

    console.log(node);
    isCommentable = true;
  });

  return isCommentable;
};

export const Paragraph = Node.create({
  name: "paragraph",

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },

  group: "block",

  content: "inline*",

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: el => el.getAttribute("id"),
        renderHTML: attrs => ({ id: attrs.id })
      }
    };
  },

  addStorage() {
    return {};
  },

  parseHTML() {
    return [{ tag: "p" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "p",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ];
  },

  addCommands() {
    return {
      setParagraph: id => ({ commands }) => {
        if (id) {
          return commands.setNode(this.name, { id });
        }
        return commands.setNode(this.name);
      }
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-0": () => this.editor.commands.setParagraph()
    };
  },
  addProseMirrorPlugins() {
    const { options, editor } = this;

    console.log(this);

    const plugins = [
      new Plugin({
        key: new PluginKey("paragraph"),
        props: {
          handleDoubleClick(view, clickPos) {
            if (isCommentableNode(view, clickPos)) {
              editor.storage.paragraph.touchstart = {
                event,
                scrollY: view.dom.scrollTop
              };
              editor.commands.setTextSelection({
                from: clickPos,
                to: clickPos + 1
              });
              return true;
            }
            return false;
          },
          handleDOMEvents: {
            touchstart(view, event) {
              const clickPos = view.posAtDOM(event.target);
              if (isCommentableNode(view, clickPos)) {
                editor.storage.paragraph.touchstart = {
                  event,
                  scrollY: view.dom.scrollTop
                };
                return true;
              }
              return false;
            },
            touchend(view, event) {
              const clickPos = view.posAtDOM(event.target);
              if (isCommentableNode(view, clickPos)) {
                const isLongPress =
                  event.timeStamp -
                    editor.storage.paragraph.touchstart.event.timeStamp >
                  LONG_PRESS_THRESSHOLD_TO_COMMENT_IN_MS;
                if (isLongPress) {
                  const isPressingSingleSpot =
                    view.dom.scrollTop -
                      editor.storage.paragraph.touchstart.scrollY <
                    SCROLL_ALLOWANCE_ON_LONG_PRESS;
                  if (isPressingSingleSpot) {
                    event.preventDefault();
                    editor.commands.setTextSelection({
                      from: clickPos,
                      to: clickPos + 1
                    });
                    return true;
                  }
                  return false;
                }
              }
            }
          }
        }
      })
    ];

    return plugins;
  }
});
