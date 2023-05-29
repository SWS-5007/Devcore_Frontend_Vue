import gql from "graphql-tag";
import { RESOURCE_FRAGMENT } from "./resource";
import { META_FRAGMENT } from "./meta";
// eslint-disable-next-line
export const ISSUE_FRAGMENT = gql`
  fragment issueFields on Issue {
    id
    title
    description
    status
    parentId
    projectId
    parentType
    anonymous

    moneyUnit
    moneyValue
    timeUnit
    timeValue
    totalValue
    createdAt
    updatedAt

    author {
      id
      firstName
      lastName
      avatarUrl
    }

    files {
      ...resourceFields
    }
    _metadata {
      ...metaFields
    }
  }
  ${META_FRAGMENT}
  ${RESOURCE_FRAGMENT}
`;

export const ISSUE_FULL_FRAGMENT = gql`
  fragment issueFullFields on Issue {
    ...issueFields
  }
  ${ISSUE_FRAGMENT}
`;

export const ISSUE = {
  findAll: gql`
    query issueFindAll($filter: Filter) {
      issueFindAll(filter: $filter) {
        ...issueFields
      }
    }
    ${ISSUE_FRAGMENT}
  `,
  findById: gql`
    query issueFindById($id: ID!) {
      issueFindById(id: $id) {
        ...issueFullFields
      }
    }
    ${ISSUE_FULL_FRAGMENT}
  `,
  create: gql`
    mutation issueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        ...issueFullFields
      }
    }
    ${ISSUE_FULL_FRAGMENT}
  `,
  update: gql`
    mutation issueUpdate($id: ID!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        ...issueFullFields
      }
    }
    ${ISSUE_FULL_FRAGMENT}
  `,
  changeStatus: gql`
    mutation issueChangeStatus($input: IssueChangeStatusInput!) {
      issueChangeStatus(input: $input) {
        ...issueFullFields
      }
    }
    ${ISSUE_FULL_FRAGMENT}
  `,
  delete: gql`
    mutation issueDelete($id: ID!) {
      issueDelete(id: $id)
    }
  `
};
