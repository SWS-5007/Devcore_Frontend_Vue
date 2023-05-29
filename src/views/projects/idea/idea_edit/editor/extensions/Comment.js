import { Node, VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-2';
import { Plugin } from 'prosemirror-state';
import CommentNodeView from './CommentNodeView.vue'

export const Comment = Node.create({
  name: 'comment',

  group: 'block',

  content: 'text*',

  addOptions() {
    return {
      HTMLAttributes: {},
      isCommentModeOn: () => false,
    };
  },

  addAttributes() {
    return {
      comment: {
        default: null,
        parseHTML: (el) => el.getAttribute('comment'),
        renderHTML: (attrs) => ({ comment: attrs.comment }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[comment]' }];
  },

  renderHTML({ HTMLAttributes }) {

    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setComment: comment => ({ commands }) => {
        return commands.setNode(this.name, { comment })
      },
    };
  },



  addNodeView() {
    return VueNodeViewRenderer(CommentNodeView)
  }
});

