import { Extension } from "@tiptap/core";

/**
 * FontSize - Custom Extension
 * editor.commands.setFontSize(e.target.value) :set the font-size.
 */

/*
CHAPTER =>
16PX
FUTURA
BOLD
#242526
*/

//futurabold
const chapterText = {
  dataAttr: "chapterText",
  color: "#242526",
  fontSize: 18,
  content: "test",
  type: "chapter"
};

const titleText = {
  dataAttr: "titleText",
  color: "#242526",
  fontSize: 14,
  content: "test",
  type: "title"
};

//futuramedium
const subTitleText = {
  dataAttr: "subTitleText",
  color: "#4294d0",
  fontSize: 14,
  content: "test",
  type: "subtitle"
};

//futuralight / narrow
const paragraphText = {
  dataAttr: "paragraphText",
  color: "#707070",
  fontSize: 14,
  content: "test",
  type: "paragraph"
};

const getUuid = () => {
  let s = [];
  let hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = ""; // -

  return s.join("").substr(0, 6);
};

export const CustomStyle = Extension.create({
  addOptions() {
    return {
      types: ["textStyle"]
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          id: {
            default: null,
            renderHTML: attributes => {
              return { id: attributes.id };
            }
          },
          color: {
            default: null,
            renderHTML: attributes => {
              if (!attributes.color) {
                return {};
              }
              return {
                style: `color:${attributes.color}`
              };
            }
          },
          fontSize: {
            default: null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {
                  style: `font-size:${paragraphText.fontSize}px`
                };
              }
              return {
                style: `font-size: ${attributes.fontSize}px`
              };
            }
          },
          // href: {
          //   default: null,
          //   renderHTML: attributes => {
          //     if (!attributes.href) {
          //       return {};
          //     }
          //     return {
          //       href: dataText
          //     };
          //   }
          // },

          type: {
            default: null,
            renderHTML: attributes => {
              let prefix = "p";

              if (attributes.type === "chapter") {
                prefix = "c";
              } else if (attributes.type === "title") {
                prefix = "t";
              } else {
                prefix = "s";
              }
              if (!attributes.id) {
                const dataText = `${prefix}-${getUuid()}`;
                return {
                  type: dataText
                };
              }
              return {
                type: attributes.dataAttr
              };
            }
          }
  
        }
      }
    ];
  },
  addCommands() {
    return {
      setChapterText: styles => ({ chain, view }) => {
        return chain()
          .setMark("textStyle", chapterText)
          .run();
      },
      setTitleText: styles => ({ chain }) => {
        return chain()
          .setMark("textStyle", titleText)
          .run();
      },
      setSubTitleText: styles => ({ chain }) => {
        return chain()
          .setMark("textStyle", subTitleText)
          .run();
      },
      setParagraphText: () => ({ chain }) => {
        return chain()
          .setMark("textStyle", paragraphText)
          .removeEmptyTextStyle()
          .run();
      }
    };
  }
});
