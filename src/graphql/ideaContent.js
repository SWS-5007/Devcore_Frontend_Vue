import gql from "graphql-tag";

// eslint-disable-next-line
export const IDEA_CONTENT_FRAGMENT = gql`
  fragment ideaContentFields on IdeaContent {
    id
    markup
    ideaId
    contentType
    version
    createdAt
    updatedAt
    companyRoles {
      id
      name
      avatarUrl
    }
  }
`;

export const IDEA_CONTENT_FULL_FRAGMENT = gql`
  fragment ideaContentFullFields on IdeaContent {
    ...ideaContentFields
  }
  ${IDEA_CONTENT_FRAGMENT}
`;

export const IDEA_CONTENT = {
  findAllPermissioned: gql`
    query ideaContentPermissionedFindAll($filter: Filter) {
      ideaContentPermissionedFindAll(filter: $filter) {
        ...ideaContentFields
      }
    }
    ${IDEA_CONTENT_FRAGMENT}
  `,
  findById: gql`
    query ideaContentFindById($id: ID!) {
      ideaContentFindById(id: $id) {
        ...ideaContentFullFields
      }
    }
    ${IDEA_CONTENT_FULL_FRAGMENT}
  `,
  create: gql`
    mutation ideaContentCreate($input: IdeaContentCreateInput!) {
      ideaContentCreate(input: $input) {
        ...ideaContentFullFields
      }
    }
    ${IDEA_CONTENT_FULL_FRAGMENT}
  `,
  update: gql`
    mutation ideaContentUpdate($id: ID!, $input: IdeaContentUpdateInput!) {
      ideaContentUpdate(id: $id, input: $input) {
        ...ideaContentFullFields
      }
    }
    ${IDEA_CONTENT_FULL_FRAGMENT}
  `
};
