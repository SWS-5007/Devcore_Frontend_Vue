import { Node, nodeInputRule } from "@tiptap/core";
import { Plugin } from "prosemirror-state";

import FileNodeView from "./FileNodeView.vue";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
const IMAGE_INPUT_REGEX = /!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const File = fileHandlers => {
  return Node.create({
    name: "file",

    addOptions() {
      return {
        inline: false,
        HTMLAttributes: {}
      };
    },

    inline() {
      return this.options.inline;
    },

    group() {
      return this.options.inline ? "inline" : "block";
    },

    draggable: true,

    addAttributes() {
      return {
        size: {
          default: null,
          parseHTML: el => {
            return el.getAttribute("title");
          },
          renderHTML: attrs => ({ size: attrs.size })
        },
        href: {
          default: null,
          parseHTML: el => {
            return el.getAttribute("title");
          },
          renderHTML: attrs => ({ href: attrs.href })
        },
        id: {
          default: null,
          parseHTML: el => {
            return el.getAttribute("id");
          },
          renderHTML: attrs => ({ href: attrs.id })
        },
        title: {
          default: null,
          parseHTML: el => {
            return el.getAttribute("title");
          },
          renderHTML: attrs => ({ title: attrs.title })
        },
        style: {
          default: null,
          parseHTML: el => {
            return el.getAttribute("style");
          },
          renderHTML: attrs => ({ style: attrs.style })
        },
        type: {
          default: null,
          parseHTML: el => {
            return el.getAttribute("type");
          },
          renderHTML: attrs => ({ type: attrs.type })
        },
        preview: {
          default: null,
          parseHTML: el => {
            return el.getAttribute("preview");
          },
          renderHTML: attrs => ({ preview: attrs.preview })
        },
        src: {
          default: null,
          parseHTML: el => {
            return el.getAttribute("src");
          },
          renderHTML: attrs => ({ src: attrs.src })
        }
      };
    },
    // parseHTML() {
    //   return [{ tag: "span[file]" }];
    // },
    addNodeView() {
      return VueNodeViewRenderer(FileNodeView);
    },
    parseHTML: () => [
      {
        tag: "img[src]",
        getAttrs: dom => !!dom.src && null
      },
      {
        tag: "file-component",
        getAttrs: dom => {
          return dom && null;
        }
      }
      // {
      //   tag: "img[src]",
      //   getAttrs: dom => {
      //     if (typeof dom === "string") return {};
      //     const obj = {
      //       id: dom.getAttribute("id"),
      //       src: dom.getAttribute("src"),
      //       title: dom.getAttribute("title"),
      //       alt: dom.getAttribute("alt"),
      //       style: dom.getAttribute("style"),
      //       type: dom.getAttribute("type"),
      //       preview: dom.getAttribute("preview")
      //     };
      //     return obj;
      //   }
      // },
      // {
      //   tag: "a",
      //   getAttrs: dom => {
      //     if (typeof dom === "string") return {};

      //     const obj = {
      //       id: dom.getAttribute("id"),
      //       src: dom.getAttribute("src"),
      //       href: dom.getAttribute("href"),
      //       title: dom.getAttribute("title"),
      //       style: dom.getAttribute("style"),
      //       type: dom.getAttribute("type"),
      //       preview: dom.getAttribute("preview")
      //     };
      //     return obj;
      //   }
      // }
    ],
    renderHTML: ({ HTMLAttributes }) => {
      const { href, title, src, preview } = HTMLAttributes;

      return [
        "file-component",
        {
          title,
          src,
          href,
          preview,
        }
      ];

    },

    addProseMirrorPlugins() {
      const { options } = this;
      const { removeLink } = options;

      const plugins = [
        new Plugin({
          props: {
            handleDOMEvents: {
              touchend(view, event) {
                if (event.target.localName === "a") {
                  if (!event.target.dataset.uuid || !event.target.href) return;
                  window.open(event.target.href, "__blank");
                }
              },

              handleClick(view, pos, event) {
                return true;
              }
            }
          }
        })
      ];

      return plugins;
    },

    addInputRules() {
      return [
        nodeInputRule({
          find: IMAGE_INPUT_REGEX,
          type: this.type,
          getAttributes: match => {
            const [, , alt, src, title] = match;

            return { src, alt, title };
          }
        })
      ];
    }
  });
};
