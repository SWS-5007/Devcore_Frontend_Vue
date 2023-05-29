import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

export const EventHandler = Extension.create({
  name: "eventHandler",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("eventHandler"),
        // props: {
        //   handleClick(view, pos, event) {
        //   //  console.log("Clicked Editor");
        //   },
          // handleDoubleClick(view, pos, event) {
          //   console.log("Double Clicked!");
          //   console.log(event)
          //   event.target.classList.add("commentable")
          // },
        //   handleClickOn(view, pos, event) {
        //   },
        //   handlePaste(view, event, slice) {
        //     console.log("Pasted Content!");
        //   },

        //   // … and many, many more.
        //   // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
        // }
      })
    ];
  }
});
