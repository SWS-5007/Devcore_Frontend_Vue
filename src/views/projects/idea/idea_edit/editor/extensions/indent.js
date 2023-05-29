import {
  CommandProps,
  Extension,
  Extensions,
  isList,
  KeyboardShortcutCommand
} from "@tiptap/core";
import { TextSelection, Transaction } from "prosemirror-state";

// declare module '@tiptap/core' {
//   interface Commands<ReturnType> {
//     indent: {
//       indent: () => ReturnType
//       outdent: () => ReturnType
//     }
//   }
// }

export const Indent = Extension.create({
  name: "indent",

  addOptions() {
    return {
      names: ["heading", "paragraph"],
      indentRange: 24,
      minIndentLevel: 0,
      maxIndentLevel: 24 * 10,
      defaultIndentLevel: 0,
      HTMLAttributes: {}
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.names,
        attributes: {
          indent: {
            default: this.options.defaultIndentLevel,
            renderHTML: attributes => ({
              style: `margin-left: ${attributes.indent}px !important;`
            }),
            parseHTML: element =>
              parseInt(element.style.marginLeft, 10) ||
              this.options.defaultIndentLevel
          }
        }
      }
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch, editor }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);

        if (this.editor.isActive("comment") || selection.node) {
          return this.editor
            .chain()
            .focus()
            .run();
        }

        tr = updateIndentLevel(
          tr,
          this.options,
          editor.extensionManager.extensions,
          "indent"
        );
        if (tr.docChanged && dispatch) {
          dispatch(tr);
          return true;
        }
        editor
          .chain()
          .focus()
          .run();
        return false;
      },
      outdent: () => ({ tr, state, dispatch, editor }) => {
        const { selection } = state;
        if (this.editor.isActive("comment") || selection.node) {
          return this.editor
            .chain()
            .focus()
            .run();
        }
        tr = tr.setSelection(selection);
        tr = updateIndentLevel(
          tr,
          this.options,
          editor.extensionManager.extensions,
          "outdent"
        );
        if (tr.docChanged && dispatch) {
          dispatch(tr);
          return true;
        }
        editor
          .chain()
          .focus()
          .run();
        return false;
      }
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: indent(),
      "Shift-Tab": outdent(false),
      Backspace: outdent(true),
      "Mod-]": indent(),
      "Mod-[": outdent(false)
    };
  }
});

export const clamp = (val, min, max) => {
  if (val < min) {
    return min;
  }
  if (val > max) {
    return max;
  }
  return val;
};

function setNodeIndentMarkup(tr, pos, delta, min, max) {
  if (!tr.doc) return tr;
  const node = tr.doc.nodeAt(pos);
  if (!node) return tr;
  const indent = clamp((node.attrs.indent || 0) + delta, min, max);
  if (indent === node.attrs.indent) return tr;
  const nodeAttrs = {
    ...node.attrs,
    indent
  };
  return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
}

const updateIndentLevel = (tr, options, extensions, type) => {
  const { doc, selection } = tr;
  if (!doc || !selection) return tr;
  if (!(selection instanceof TextSelection)) {
    return tr;
  }
  const { from, to } = selection;
  doc.nodesBetween(from, to, (node, pos) => {
    if (options.names.includes(node.type.name)) {
      tr = setNodeIndentMarkup(
        tr,
        pos,
        options.indentRange * (type === "indent" ? 1 : -1),
        options.minIndentLevel,
        options.maxIndentLevel
      );
      return false;
    }
    return !isList(node.type.name, extensions);
  });
  return tr;
};

const indent = () => ({ editor }) => {
  if (!isList(editor.state.doc.type.name, editor.extensionManager.extensions)) {
    return editor.commands.indent();
  }
  return false;
};
const outdent = outdentOnlyAtHead => ({ editor }) => {
  if (
    !(
      isList(editor.state.doc.type.name, editor.extensionManager.extensions) ||
      (outdentOnlyAtHead && editor.state.selection.$head.parentOffset !== 0)
    )
  ) {
    return editor.commands.outdent();
  }
  return false;
};
