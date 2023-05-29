<template>
  <div class="feedbackcontainer" style="background:#f8f8f8">
    <div
      v-for="(reply, index) in items"
      :key="index"
      class="feedbackcontainer-item"
    >
      <div
        class="feedbackcontainer-item-type"
        :class="`feedbackcontainer-item-type-${reply.type}`"
      >
        <div class="feedbackcontainer-item-header">
          <div class="feedbackcontainer-item-type-text-and-value">
        
            <icoFeedbackIdea
              v-if="reply.type === 'IDEA'"
              class="ico-feedback-idea"
              width="30px"
              height="30px"
              style="
                stroke: white;
                fill: white;
                background: #4294d0;
                border: 1px solid #4294d0;
                border-radius: 50%;
              "
            ></icoFeedbackIdea>
            <icoFeedbackIssue
              v-else-if="reply.type === 'ISSUE'"
              class="ico-feedback-issue"
              width="30px"
              height="30px"
              style="fill: #d04258; border-radius: 50%"
            ></icoFeedbackIssue>
            <!--   <icoFeedbackIssue
              v-else-if="reply.type === 'ISSUE'"
              width="35px"
              height="35px"
              style="fill: #d04258"
            /> -->
            <icoFeedbackImprovement
              v-else
              width="30px"
              height="30px"
              class="ico-feedback-improvement"
              style="
                stroke: #f8f8f8;
                fill: #f8f8f8;
                background: #f59453;
                border-radius: 50%;
                stroke-width: 0.5px;
              "
            ></icoFeedbackImprovement>
            <!-- <icoFeedbackImprovement
              v-else
              width="35px"
              height="35px"
              style="stroke: black; fill: #f8f8f8; background: #f8f8f8;"
            /> -->
            <div class="feedbackcontainer-item-type-text">
              {{ getReplyType(reply) | camelCasify }}
            </div>
          </div>

          <div class="feedbackcontainer-item-type-score">
            <div class="score-card-score-competitive-icon">
              <i class="mdi mdi-star score-competitive-icon"></i>
            </div>
            <div
              class="feedbackcontainer-item-type-score-number"
              v-if="reply.scoreInstance"
            >
              {{ reply.scoreInstance.score }}
            </div>
          </div>
        </div>
        <div class="feedbackcontainer-item-body">
          <div class="feedbackcontainer-item-body-description">
            <div class="feedbackcontainer-item-body-description-text">
              {{ getRepliedToDescription(reply) }}
            </div>
            <div class="feedbackcontainer-item-body-reply">
              <div class="feedbackcontainer-item-body-description-reply">
                <div
                  class="
                    feedbackcontainer-item-body-description-reply-description
                  "
                >
                  {{ reply.description }}
                </div>

                <div
                  class="feedbackcontainer-item-body-description-reply-author"
                >
                  <img
                    :src="reply.author.avatarUrl"
                    class="
                      feedbackcontainer-item-body-description-reply-author-image
                    "
                  />
                  <div
                    class="
                      feedbackcontainer-item-body-description-reply-author-text
                    "
                  >
                    <div
                      class="
                        feedbackcontainer-item-body-description-reply-author-name
                      "
                    >
                      {{ reply.author.firstName }} {{ reply.author.lastName }}
                    </div>

                    <div
                      class="
                        feedbackcontainer-item-body-description-reply-author-createdAt
                      "
                    >
                      {{ reply.createdAt | formatTime }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import icoFeedbackIdea from "../../assets/img/feedback/user-feedback-idea.svg?inline";
import icoFeedbackIssue from "../../assets/img/feedback/user-feedback-issue.svg?inline";
import icoFeedbackImprovement from "../../assets/img/feedback/user-feedback-improvement.svg?inline";
export default {
  components: {
    icoFeedbackIdea,
    icoFeedbackIssue,
    icoFeedbackImprovement,
  },
  filters: {
    camelCasify(text) {
      if (!text) return "";
      const str = text.toLowerCase();
      return str.substring(0, 1).toUpperCase() + str.substring(1);
    },
    formatTime(created) {
      const time = new Date(created);
      //add leading zero
      const hours =
        time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
      const minutes =
        time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
      const datestring =
        time.getDate() +
        "/" +
        (time.getMonth() + 1) +
        "/" +
        time.getFullYear() +
        " " +
        hours +
        ":" +
        minutes;

      return datestring;
    },
  },
  methods: {
    getReplyType(reply) {
      if (reply.type === "IDEAISSUE") {
        if (reply.ideaIssue.type === "IMPROVEMENT") {
          return this.$t("Idea Improvement");
        } else {
          return this.$t("Idea Problem");
        }
      }
      return reply.type;
    },
    getRepliedToDescription(reply) {
      let prop = null;
      if (!reply.type) return;

      if (reply.type === "ISSUE") {
        prop = reply["issue"];
      } else if (reply.type === "IDEA") {
        prop = reply["idea"];
      } else if (reply.type === "IDEAISSUE") {
        prop = reply["ideaIssue"];
      } else {
        return "";
      }
      if (!prop) return "";

      return prop.description ? prop.description : this.$t("No description");
    },
  },
  props: {
    items: {
      type: Array,
      default: () => [],
      required: false,
    },
    selectedType: {
      type: String,
      default: () => "ISSUE",
      required: true,
    },
  },
};
</script>
<style scoped>
.score-competitive-icon {
  display: flex;
  border-radius: 50%;
  border: 2px solid #fabc52;
  color: #fff;
  background: #f59453;
  height: 30px;
  width: 30px;
  max-width: 100px;
  max-height: 100px;
  align-items: center;
  text-align: center;
  place-content: center;
  justify-content: center;
  align-self: center;
}

.feedbackcontainer-item-type {
  margin: 20px 0px;
  border-radius: 20px;
}
.score-competitive-icon:before {
  display: flex;
  align-items: center;
  font-size: 20px;
}
.feedbackcontainer-item-type-text-and-value {
  display: flex;
  justify-content: center;
  align-items: center;
}
.feedbackcontainer-item-type-text {
  margin-left: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #000000;
  text-transform: uppercase;
}

.feedbackcontainer-item-type-score {
  display: flex;
  align-items: center;
}
.score-card-score-competitive-icon {
  padding-right: 5px;
}
.feedbackcontainer-item-type-score-number {
  min-width: 30px;
  font-size: 13px;
  font-weight: 500;
}

.feedbackcontainer-item-body-description-text {
  padding: 20px;
  color: #bdbdbd;
  font-size: 13px;
  font-weight: 600;
}

.feedbackcontainer-item-body-description-reply-description {
  color: #bdbdbd;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 13px;
  padding: 5px 10px;
}
.feedbackcontainer-item-body-description-reply-author {
  letter-spacing: 1px;
  font-size: 10px;
  padding: 10px;
}

.feedbackcontainer-item-body-description-reply {
  border: 1px solid #4294d0;
  padding: 10px;
  border-radius: 10px;
  margin: 20px;
}
.feedbackcontainer-item-body-description {
  padding: 10px 5px;
  font-size: 10px;
  font-weight: 400;
  min-height: 40px;
  border-bottom: none;
}

.feedbackcontainer-item-header {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.feedbackcontainer-item-type-ISSUE > .feedbackcontainer-item-header {
  border-bottom: 1px solid lightcoral;
}

.feedbackcontainer-item-type-IDEAISSUE > .feedbackcontainer-item-header {
  border-bottom: 1px solid lightgray;
}

.feedbackcontainer-item-type-IDEA > .feedbackcontainer-item-header {
  border-bottom: 1px solid lightskyblue;
}

.feedbackcontainer-item-type {
  font-size: 12px;
  font-weight: 600;
  min-height: 40px;
  border-bottom: none;
  background: #fff;
}
.feedbackcontainer-item-type-ISSUE {
  border: 1px solid #d04258;
}
.feedbackcontainer-item-type-IDEA {
  border: 1px solid #4294d0;
}
.feedbackcontainer-item-type-IDEAISSUE {
  border: 1px solid grey;
}

.feedbackcontainer-item-description {
  min-height: 40px;
  border-radius: 0;
  padding-bottom: 5px;
}
.feedbackcontainer-item-description-ISSUE {
  border-top: 1px solid lightpink;
  border-left: 1px solid #d04258;
  border-right: 1px solid #d04258;
}
.feedbackcontainer-item-description-IDEA {
  border-top: 1px solid lightblue;
  border-left: 1px solid #4294d0;
  border-right: 1px solid #4294d0;
}
.feedbackcontainer-item-description-IDEAISSUE {
  border-top: 1px solid lightgray;
  border-left: 1px solid gray;
  border-right: 1px solid gray;
}

.feedbackcontainer-item-feedback {
  padding: 20px;
  border-radius: 10px;
}
.feedbackcontainer-item-feedback-ISSUE {
  border: 1px solid #d04258;
}

.feedbackcontainer-item-feedback-IDEA {
  border: 1px solid #4294d0;
}

.feedbackcontainer-item-feedback-IDEAISSUE {
  border: 1px solid gray;
}
/* 
.feedbackcontainer-item-type,
.feedbackcontainer-item-description,
.feedbackcontainer-item-feedback {
  padding: 10px 20px;
  letter-spacing: 1px;
  min-height: 45px;
} */

.feedbackcontainer-item-body-description-reply-author-image {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
.feedbackcontainer-item-body-description-reply-author {
  display: flex;
}
.feedbackcontainer-item-body-description-reply-author-name {
  color: #000000;
  font-weight: 600;
  font-size: 13px;
}
.feedbackcontainer-item-body-description-reply-author-text {
  padding-left: 10px;
}
.feedbackcontainer-item-body-description-reply-author-createdAt {
  font-size: 11px;
  font-weight: 400;
  color: #000000;
}

.ico-feedback-issue > path {
  transform: scale(1.2) translate(-2px, -2px);
}
.ico-feedback-idea > path,
.ico-feedback-improvement > path {
  transform: scale(0.7) translate(5px, 5px);
}
</style>