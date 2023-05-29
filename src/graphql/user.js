import gql from "graphql-tag";

// eslint-disable-next-line
const USER_FRAGMENT = gql`
  fragment userFields on User {
    id
    firstName
    lastName
    email
    phone
    lang
    yearlyCosts
    avatarUrl
    status
    notifications
    avatar
    companyId
    createdAt
    updatedAt
    _metadata {
      permissions
    }
  }
`;

const USER_FULL_FRAGMENT = gql`
  fragment userFullFields on User {
    ...userFields
    company {
      id
      name,
    }
    roles {
      id
      name
    }
    companyRole {
      id
      name
    }
  }
  ${USER_FRAGMENT}
`;

export const USER = {
  findAll: gql`
    query userFindAll($filter: Filter) {
      userFindAll(filter: $filter) {
        ...userFullFields
      }
    }
    ${USER_FULL_FRAGMENT}
  `,
  findById: gql`
    query userFindById($id: ID!) {
      userFindById(id: $id) {
        ...userFullFields
      }
    }
    ${USER_FULL_FRAGMENT}
  `,
  create: gql`
    mutation userCreate($input: UserCreateInput!) {
      userCreate(input: $input) {
        ...userFullFields
      }
    }
    ${USER_FULL_FRAGMENT}
  `,
  update: gql`
    mutation userUpdate($id: ID!, $input: UserUpdateInput!) {
      userUpdate(id: $id, input: $input) {
        ...userFullFields
      }
    }
    ${USER_FULL_FRAGMENT}
  `,
  delete: gql`
    mutation userUpdate($id: ID!) {
      userDelete(id: $id)
    }
  `,
  resetPassword: gql`
    mutation userResetPassword($id: ID!) {
      userResetPassword(id: $id)
    }
  `,
  invite: gql`
    mutation userInvite($input: UserInviteInput!) {
      userInvite(input: $input){
        ...userFullFields
      }
    }
    ${USER_FULL_FRAGMENT}
  `,
  register: gql`
    mutation userRegister($input: UserRegisterInput!) {
      userRegister(input: $input) {
        ...userFullFields
      }
    }
    ${USER_FULL_FRAGMENT}
  `,

};
