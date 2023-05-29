import gql from "graphql-tag";
import { IDEA_FRAGMENT } from "./idea";
import { ISSUE_FRAGMENT } from "./issue";
import { IDEA_ISSUE_FRAGMENT } from "./ideaissue";

// eslint-disable-next-line

const REPLY_PAGINATE_FRAGMENT = gql`
  fragment ideaIssuePaginatedReply on PaginatedResponse {
    edges {
      node {
        id
        description
        status

        type
        issueId
        ideaId
        ideaIssueId
        idea {
          id
          description
        }
        issue {
          id
          description
        }
        ideaIssue {
          id
          description
        }
      }
    }
    pageInfo {
      totalCount
      hasNextPage
      hasPrevPage
    }
  }
`;

export const REPLY_FRAGMENT = gql`
  fragment replyFields on IdeaIssueReply {
    id
    description
    status
    type
    idea {
      ...ideaFields
    }
    issue {
      ...issueFields
    }
    ideaIssue {
      ...ideaIssueFields
    }
    authorId
    createdAt
    updatedAt
  }
  ${IDEA_FRAGMENT}
  ${ISSUE_FRAGMENT}
  ${IDEA_ISSUE_FRAGMENT}
`;

export const REPLY_FULL_FRAGMENT = gql`
  fragment replyFullFields on IdeaIssueReply {
    ...replyFields
  }
  ${REPLY_FRAGMENT}
`;

export const REPLY = {
  // userReplied: gql`
  //   subscription userReplied {
  //     userReplied {
  //       ...replyFullFields
  //     }
  //   }
  //   ${REPLY_FULL_FRAGMENT}
  // `,
  findAll: gql`
    query ideaIssueReplyFindAll($filter: Filter) {
      ideaIssueReplyFindAll(filter: $filter) {
        ...replyFields
      }
    }
    ${REPLY_FRAGMENT}
  `,
  findAllPaginated: gql`
    query ideaIssueReplyFind($filter: PaginatedFilter!) {
      ideaIssueReplyFind(filter: $filter) {
        edges {
          node {
            id
            description
            status
            createdAt
            author {
              firstName
              lastName
              createdAt
              avatarUrl
            }
            type
            issueId
            ideaId
            ideaIssueId
            scoreInstance
            idea {
              id
              description
            }
            issue {
              id
              description
            }
            ideaIssue {
              id
              description
              type
            }
          }
        }
        pageInfo {
          totalCount
          hasNextPage
          hasPrevPage
        }
      }
    }
  `
};
