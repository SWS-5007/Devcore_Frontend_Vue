import gql from "graphql-tag";
import { META_FRAGMENT } from "./meta";
import { RESOURCE_FRAGMENT } from "./resource";
// eslint-disable-next-line
export const IDEA_ISSUE_FRAGMENT = gql`
  fragment ideaIssueFields on IdeaIssue {
    id
    title
    description
    status
    parentId
    projectId
    parentType
    createdAt
    updatedAt
    anonymous
    replied
    type
    uuid
    files {
      ...resourceFields
    }
    author {
      id
      firstName
      lastName
      avatarUrl
    }

    _metadata {
      ...metaFields
    }
  }
  ${META_FRAGMENT}
  ${RESOURCE_FRAGMENT}
`;

export const IDEA_ISSUE_FULL_FRAGMENT = gql`
  fragment ideaIssueFullFields on IdeaIssue {
    ...ideaIssueFields
  }
  ${IDEA_ISSUE_FRAGMENT}
`;

export const IDEA_ISSUE = {
  findAll: gql`
    query ideaIssueFindAll($filter: Filter) {
      ideaIssueFindAll(filter: $filter) {
        ...ideaIssueFields
      }
    }
    ${IDEA_ISSUE_FRAGMENT}
  `,
  findById: gql`
    query ideaIssueFindById($id: ID!) {
      ideaIssueFindById(id: $id) {
        ...ideaIssueFullFields
      }
    }
    ${IDEA_ISSUE_FULL_FRAGMENT}
  `,
  create: gql`
    mutation ideaIssueCreate($input: IdeaIssueCreateInput!) {
      ideaIssueCreate(input: $input) {
        ...ideaIssueFullFields
      }
    }
    ${IDEA_ISSUE_FULL_FRAGMENT}
  `,
  update: gql`
    mutation ideaIssueUpdate($id: ID!, $input: IdeaIssueUpdateInput!) {
      ideaIssueUpdate(id: $id, input: $input) {
        ...ideaIssueFullFields
      }
    }
    ${IDEA_ISSUE_FULL_FRAGMENT}
  `,
  changeStatus: gql`
    mutation ideaIssueChangeStatus($input: IdeaIssueChangeStatusInput!) {
      ideaIssueChangeStatus(input: $input) {
        ...ideaIssueFullFields
      }
    }
    ${IDEA_ISSUE_FULL_FRAGMENT}
  `,
  delete: gql`
    mutation ideaIssueDelete($id: ID!) {
      ideaIssueDelete(id: $id)
    }
  `
};
