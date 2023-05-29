import Link from "@tiptap/extension-link";
import { mergeAttributes } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { v4 as uuidv4 } from "uuid";

export const CustomLink = Link.extend({
  addOptions() {
    return {
      HTMLAttributes: {
        target: "_blank",
        href: null
      },
      linkOnPaste: true,
      openOnClick: true
    };
  },
  addAttributes() {
    return {
      href: {
        default: this.options.HTMLAttributes.href
      },
      uuid: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("uuid");
        },
        renderHTML: attrs => ({ uuid: attrs.uuid })
      },
      target: {
        default: this.options.HTMLAttributes.target
      },
      class: {
        default: this.options.HTMLAttributes.class
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'a[href]:not([href *= "javascript:" i])',
        getAttrs: dom => {
          return {
            uuid: dom.getAttribute("uuid")
          };
        }
      }
    ];
  },
  renderHTML({ mark, HTMLAttributes }) {
    const { uuid, href, target } = HTMLAttributes;
    const validate = /^https?:\/\//.test(href);

    if (!href) return true;

    if (!uuid) {
      return [
        "a",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        0
      ];
    }
    return [
      "span",
      { class: "is-link" },
      [
        "a",
        mergeAttributes(this.options.HTMLAttributes, {
          "data-uuid": uuidv4(),
          href,
          target
        }),
        0
      ]
    ];
  },
  addProseMirrorPlugins() {
    const { options } = this;

    const plugins = [
      new Plugin({
        props: {
          handleDOMEvents: {
            touchend(view, event) {
              if (
                event.target.localName === "a" ||
                event.target.parentElement.localName === "a"
              ) {
                if (!event.target.href && !event.target.parentElement.href)
                  return;
                window.open(
                  event.target.href || event.target.parentElement.href,
                  "__blank"
                );
              }
            },
            mouseover(view, event) {
              if (
                event.target.localName === "a" ||
                event.target.getAttribute("uuid")
              ) {
                const uuid = event.target.getAttribute("data-uuid");

                const href = event.target.getAttribute("href");
                let links = [...document.querySelectorAll(".is-link")];

                const [thisLink] = links.filter(
                  link =>
                    !!link.children[0] && link.children[0].dataset.uuid === uuid
                );

                if (!thisLink) return false;
                thisLink.firstChild.setAttribute("data-tooltip", href);
              }

              if (
                event.target.localName === "button" ||
                event.target.getAttribute("uuid")
              ) {
                let links = [...document.querySelectorAll(".is-link")];
                const uuid = event.target.previousSibling.getAttribute(
                  "data-uuid"
                );
                const [thisLink] = links.filter(
                  link =>
                    !!link.children[0] && link.children[0].dataset.uuid === uuid
                );
                if (!thisLink) return false;
                thisLink.lastChild.setAttribute(
                  "data-tooltip",
                  "Remove Hyperlink"
                );
              }

              return false;
            }
          },
          handleClick(view, pos, event) {
            if (!event.type === "mouseup") return;
            if (event.button === 2) return;

            const href = event.target.getAttribute("href");

            if (href) {
              window.open(href, "__blank");
            }

            return false;
          }
        }
      })
    ];

    return plugins;
  }
});
