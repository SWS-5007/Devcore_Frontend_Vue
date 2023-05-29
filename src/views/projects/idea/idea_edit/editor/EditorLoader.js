import { Editor } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import History from "@tiptap/extension-history";
import FontFamily from "@tiptap/extension-font-family";
import Italic from "@tiptap/extension-italic";
import Bold from "@tiptap/extension-bold";
import { Color } from "@tiptap/extension-color";
import {
  Indent,
  EventHandler,
  CustomStyle,
  File,
  Heading,
  Comment,
  CustomTable,
  ExternalVideo,
  CustomLink,
  FocusNode,
  Paragraph,
  CommentTooltip,
  SelectionDecorator
} from "./extensions";

export default class ContentEditor {
  constructor(editable, value, options) {
    this.editable = false;
    this.content = value;
    this.options = options;
    this.extensions = [
      StarterKit.configure({
        history: false,
        italic: false,
        bold: false,
        strike: false
      }),
      History.configure({ depth: 10 }),
      FontFamily.configure({
        types: ["textStyle"]
      }),
      Italic.extend({
        addInputRules() {
          return [];
        },
        addPasteRules() {
          return [];
        }
      }),
      Bold.extend({

        addInputRules() {
          return [];
        },
        addPasteRules() {
          return [];
        }
      }),
      Text,
      // SelectionDecorator,
      File(null),
      TextStyle,
      Color,
      // Image(),
      CustomLink,
      Indent,
      Highlight,
      Underline,
      TableRow,
      TableHeader,
      TableCell,
      Paragraph,
      ExternalVideo,
      CustomStyle,
      Comment,
      Heading,
      CustomTable,
      EventHandler,
      FocusNode
    ];
    this.editor = this.getEditorInstance();
  }

  getEditorInstance() {
    return new Editor({
      editable: this.editable,
      content: this.content,
      extensions: this.extensions,
      editorProps: {
        attributes: {
          id: "idea-edit-editor-container"
        }
      },
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        this.options.onUpdate(json);

      },

      onSelectionUpdate: ({ editor }) => {
        this.options.onSelectionUpdate(editor);
        if (editor.storage.paragraph && editor.storage.paragraph.touchstart) {
          let el = document.getElementById("idea-edit-editor-container");
          if (el) {
            console.log(editor.view.state.selection)
            if (!editor.view.state.selection) return
            const selectionRefreshedToStart = editor.view.state.selection.from === 1 && editor.view.state.selection.to === 1
            if (selectionRefreshedToStart) {
              el.scrollTop = editor.storage.paragraph.touchstart.scrollY;
              editor.storage.paragraph = {}
            }

          }
        }
      }
    });
  }

  *getExtensions() {
    for (const extension of this.extensions) {
      yield extension;
    }
  }

  get EditorInstance() {
    return this.editor;
  }
}
