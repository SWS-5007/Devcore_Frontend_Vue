<template>
  <node-view-wrapper as="div" class="comment-component">
    <node-view-content class="content-dom" />

    <section v-if="comments.length" class="comment-details">
      <template class="comment" v-for="(comment, i) in comments">
        <article v-if="!isCommentReplied(comment)" :key="i" class="comment">
          <p :class="`idea_comment_${comment.type}`">
            {{ comment.content }}
          </p>

          <div class="comment-actions">
            <span v-if="comment.file && comment.file.link" class="file">
              <a
                @click.prevent.stop="openUrl(comment.file.link)"
                :href="comment.file.link"
                target="__blank"
              >
                <img
                  slot="reference"
                  class="folder-icon"
                  :src="FolderIcon"
                  alt=""
                />
              </a>
            </span>
          </div>
        </article>
      </template>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";

import CommentIcon from "@/assets/img/commentIcon.svg";
import FolderIcon from "@/assets/img/folderIcon.svg";

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  props: nodeViewProps,

  data() {
    return {
      CommentIcon,
      FolderIcon,
    };
  },

  methods: {
    openUrl(link) {
      window.open(link, "__blank");
    },
    isCommentReplied(comment) {
      return !!comment.replied;
    },
  },

  computed: {
    commentEntity() {
      let stringCommentEntity = null;
      if (this.node && this.node.attrs) {
        stringCommentEntity = this.node.attrs.comment;
      }
      return stringCommentEntity ? JSON.parse(stringCommentEntity) : {};
    },
    comments() {
      return this.commentEntity ? this.commentEntity.comments : [];
    },
  },
};
</script>

<style lang="scss">
.comment-component {
  .comment-actions {
    margin-left: 10px;
  }
  .content-dom {
    border-radius: 4px;
    color: #707070 !important;
    font-family: FuturaLight !important;
  }

  @media screen and (max-width: 650px) {
    .content-dom {
      font-size: 14px;
    }
  }

  @media screen and (min-width: 650px) {
    .content-dom {
      font-size: 16px;
    }
  }

  .comment-details {
    border-radius: 8px;
    padding: 8px 8px 8px 0;

    .comment {
      color: #fff;
      display: flex;
      padding-top: 2px;

      .idea_comment_IMPROVEMENT {
        background: #d0e4f3;
        color: #707070;
        border-radius: 5px;
        padding: 0px 5px;
        margin: 2px 0;
      }
      .idea_comment_PROBLEM {
        background: #d0424d;
        color: #f8f8f8;
        border-radius: 5px;
        padding: 0px 5px;
        margin: 2px 0;
      }

      .file {
        margin-right: 8px;
        a {
          cursor: pointer;
          pointer-events: all;
          text-decoration: underline;
        }
      }

      .comment-icon {
        transform: translate(0px, 2px);
        cursor: pointer;
        height: 16px;
      }
    }
  }
}
</style>
