import gql from "graphql-tag";
import { META_FRAGMENT } from "./meta";
// eslint-disable-next-line
export const ISSUE_EFFECT_FRAGMENT = gql`
  fragment issueEffectFields on IssueEffect {
    id
    title
    effectTime
    effectValue
    createdAt
    updatedAt
    issueActiveId
    processId
    effectId
    status
    author {
      id
      firstName
      lastName
      companyRoleId
      avatarUrl
      yearlyCosts
    }
    _metadata {
      ...metaFields
    }
  }
  ${META_FRAGMENT}
`;

export const ISSUE_EFFECT_FULL_FRAGMENT = gql`
  fragment issueEffectFullFields on IssueEffect {
    ...issueEffectFields
    templates {
      id
    }
  }
  ${ISSUE_EFFECT_FRAGMENT}
`;

export const ISSUE_EFFECT = {
  findAll: gql`
    query issueEffectFindAll($filter: Filter) {
      issueEffectFindAll(filter: $filter) {
        ...issueEffectFields
      }
    }
    ${ISSUE_EFFECT_FRAGMENT}
  `,
};
