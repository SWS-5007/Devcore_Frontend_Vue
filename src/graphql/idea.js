import gql from "graphql-tag";
import { RESOURCE_FRAGMENT } from "./resource";
import { META_FRAGMENT } from "./meta";
// eslint-disable-next-line
export const IDEA_FRAGMENT = gql`
  fragment ideaFields on Idea {
    id
    title
    description
    status
    processId
    parentId
    parentType
    anonymous
    createdAt
    updatedAt
    ideaContentId
    companyRoleIds
    companyToolId
    tool {
      id
      name
    }
    author {
      id
      firstName
      lastName
      avatarUrl
    }
    parent {
      __typename
      ... on ProcessStage {
        id
        title
        dOrder
        description
        processId
      }
      ... on ProcessOperation {
        id
        title
        dOrder
        description
        processId
        stageId
        stage {
          id
          title
        }
      }
      ... on ProcessPhase {
        id
        title
        dOrder
        description
        processId
        operationId
        operation {
          id
          title
          stageId
          stage {
            id
            title
          }
        }
      }
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

export const IDEA_FULL_FRAGMENT = gql`
  fragment ideaFullFields on Idea {
    ...ideaFields
  }
  ${IDEA_FRAGMENT}
`;

export const IDEA = {
  findAll: gql`
    query ideaFindAll($filter: Filter) {
      ideaFindAll(filter: $filter) {
        ...ideaFields
      }
    }
    ${IDEA_FRAGMENT}
  `,
  findById: gql`
    query ideaFindById($id: ID!) {
      ideaFindById(id: $id) {
        ...ideaFullFields
      }
    }
    ${IDEA_FULL_FRAGMENT}
  `,
  create: gql`
    mutation ideaCreate($input: IdeaCreateInput!) {
      ideaCreate(input: $input) {
        ...ideaFullFields
      }
    }
    ${IDEA_FULL_FRAGMENT}
  `,
  update: gql`
    mutation ideaUpdate($id: ID!, $input: IdeaUpdateInput!) {
      ideaUpdate(id: $id, input: $input) {
        ...ideaFullFields
      }
    }
    ${IDEA_FULL_FRAGMENT}
  `,
  changeStatus: gql`
    mutation ideaChangeStatus($input: IdeaChangeStatusInput!) {
      ideaChangeStatus(input: $input) {
        ...ideaFullFields
      }
    }
    ${IDEA_FULL_FRAGMENT}
  `,
  delete: gql`
    mutation ideaDelete($id: ID!) {
      ideaDelete(id: $id)
    }
  `,
  ideaViewed: gql`
    mutation ideaViewed($input: IdeaViewedByUser!) {
      ideaViewed(input: $input)
    }
  `
};
