import Table from "@tiptap/extension-table";
import { mergeAttributes, getExtensionField, callOrReturn } from "@tiptap/core";
import { tableEditing, columnResizing } from "prosemirror-tables";
import { Plugin } from "prosemirror-state";

const getElementWithAttributes = (name, attrs) => {
  const el = document.createElement(name);

  if (!el) throw new Error(`Element with name ${name} can't be created.`);

  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }

  return el;
};


export function updateColumns(
  node,
  colgroup,
  table,
  cellMinWidth,
  overrideCol,
  overrideValue
) {
  let totalWidth = 0;
  let fixedWidth = false;
  let nextDOM = colgroup.firstChild;
  const row = node.firstChild;

  for (let i = 0, col = 0; i < row.childCount; i += 1) {
    const { colspan, colwidth } = row.child(i).attrs;

    for (let j = 0; j < colspan; j += 1, col += 1) {
      const hasWidth =
        overrideCol === col ? overrideValue : colwidth && colwidth[j];

      const cssWidth = hasWidth ? `${hasWidth}px` : "";

      totalWidth += hasWidth || cellMinWidth;

      if (!hasWidth) {
        fixedWidth = false;
      }

      if (!nextDOM) {
        colgroup.appendChild(
          document.createElement("col")
        ).style.width = cssWidth;
      } else {
        if (nextDOM.style.width !== cssWidth) {
          nextDOM.style.width = cssWidth;
        }

        nextDOM = nextDOM.nextSibling;
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling;
    nextDOM.parentNode.removeChild(nextDOM);
    nextDOM = after;
  }

  if (fixedWidth) {
    table.style.width = `${totalWidth}px`;
    table.style.minWidth = "";
  } else {
    const tableWidth = node.attrs["data-table-width"]
      ? node.attrs["data-table-width"] * 0.9
      : totalWidth;

    table.style.width = `${tableWidth}px`;
  }
}

export const CustomTable = Table.extend({
  name: "table",
  // @ts-ignore
  addOptions() {
    return {
      HTMLAttributes: {},
      resizable: true,
      handleWidth: 5,
      cellMinWidth: 25,
      lastColumnResizable: false,
      allowTableNodeSelection: false
    };
  },

  content: "tableRow+",

  tableRole: "table",

  isolating: true,

  group: "block",

  selectable: true,

  resizable: true,

  parseHTML() {
    return [
      {
        tag: "table",
        getAttrs: dom => {
          return {
            "data-table-width": dom.getAttribute("data-table-width"),
            "data-table-cols": dom.getAttribute("data-table-cols")
          };
        }
      }
    ];
  },

  addAttributes() {
    return {
      "data-table-width": {
        parseHTML: element => element.getAttribute("data-table-width"),
        renderHTML: attrs => ({ "data-table-width": attrs["data-table-width"] })
      },
      "data-table-cols": {
        parseHTML: element => element.getAttribute("data-table-cols"),
        renderHTML: attrs => ({ "data-table-cols": attrs["data-table-cols"] })
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "table",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ["tbody", 0]
    ];
  },

  addNodeView() {
    return ({ editor, node: nodeViewNode }) => {
      let tempNoders = nodeViewNode;

      const cellMinWidth = 40;

      const dom = getElementWithAttributes("div", { class: "tableWrapper" });

      const table = document.createElement("table");

      if (editor.isEditable) {
        const tableFirstRow = getElementWithAttributes("div", {
          class: "table-first-row"
        });

        const tableSecondRow = getElementWithAttributes("div", {
          class: "table-second-row"
        });

        const tableLeftContainer = getElementWithAttributes("section", {
          class: "tableLeftSection"
        });

        const tableRightContainer = getElementWithAttributes("section", {
          class: "tableRightSection"
        });

        tableFirstRow.appendChild(tableLeftContainer);
        tableFirstRow.appendChild(tableRightContainer);

        dom.appendChild(tableFirstRow);
        dom.appendChild(tableSecondRow);

        tableLeftContainer.appendChild(table);
      } else {
        dom.appendChild(table);
      }

      const colgroup = table.appendChild(document.createElement("colgroup"));

      updateColumns(nodeViewNode, colgroup, table, cellMinWidth);

      const contentDOM = table.appendChild(document.createElement("tbody"));

      return {
        dom,
        contentDOM,
        ignoreMutation: mutation =>
          mutation.type === "attributes" &&
          (mutation.target === table || colgroup.contains(mutation.target)),
        update: node => {
          if (node.type !== nodeViewNode.type) {
            return false;
          }

          tempNoders = node;
          updateColumns(tempNoders, colgroup, table, cellMinWidth);

          return true;
        }
      };
    };
  },

  addProseMirrorPlugins() {
    const isResizable = this.options.resizable && this.editor.isEditable;

    const plugins = [
      new Plugin({
        props: {
          handleDOMEvents: {
            touchend(view, event) {
              if (event.cancelable) event.preventDefault();
            }
          }
        }
      }),
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection
      })
    ];

    if (isResizable) {
      plugins.push(
        columnResizing({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          lastColumnResizable: this.options.lastColumnResizable
        })
      );
    }

    return plugins;
  },

  extendNodeSchema(extension) {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage
    };

    return {
      tableRole: callOrReturn(
        getExtensionField(extension, "tableRole", context)
      )
    };
  }
});

export default CustomTable;
