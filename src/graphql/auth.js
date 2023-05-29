import gql from "graphql-tag";
import { MILESTONE_FRAGMENT } from "./milestone";

// eslint-disable-next-line
const COMPANY_FRAGMENT = gql`
  fragment companyFields on Company {
    id
    name
    logo
    logoUrl
    currencyCode
    experienceQuests {
      id
      user_type
      requiredPoints
      title
    }
    currency {
      code
      name
      symbol
    }
  }
`;

// eslint-disable-next-line
const USER_FRAGMENT = gql`
  fragment currentUserFields on User {
    id
    firstName
    lastName
    email
    phone
    createdAt
    updatedAt
    status
    companyId
    lang
    avatar
    avatarUrl
    mustChangePassword
    profileRewardActive
    profileScoreDisplay
    profileIdeaIntro
    experienceUsers {
      id
      experiencePoints
      questId
      level
    }
    userSharedValue
    userProjectIdeaUsage
    userRoleScores {
      isAgainst
      role
      roleValue
      userCount
      roleId
    }
    engageScore
    activeMilestone {
      ...milestoneFields
    }
    userScoreRank
    company {
      ...companyFields
    }
    roles {
      id
      name
    }
    permissions {
      id
      name
      guard
    }
    companyRole {
      id
      name
      avatarUrl
    }
  }
  ${COMPANY_FRAGMENT}
  ${MILESTONE_FRAGMENT}
`;

// eslint-disable-next-line
const SESSION_FRAGMENT = gql`
  fragment sessionFields on Session {
    accessToken
    expiresAt
    user {
      ...currentUserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const AUTH = {
  userUpdated: gql`
    subscription userUpdated {
      userUpdated {
        id
        engageScore
        activeMilestone {
          id
          title
          requiredScore
          userCount
          description
        }
      }
    }
  `,
  login: gql`
    mutation login($input: LoginCredentialsInput!) {
      login(input: $input) {
        ...sessionFields
      }
    }
    ${SESSION_FRAGMENT}
  `,
  sendVerificationEmail: gql`
    mutation sendVerificationEmail($username: String!) {
      sendVerificationEmail(username: $username)
    }
  `,
  verifyAccount: gql`
    mutation verifyAccount($username: String!, $code: String!) {
      verifyAccount(username: $username, code: $code) {
        ...sessionFields
      }
    }
    ${SESSION_FRAGMENT}
  `,
  requestResetPassword: gql`
    mutation requestResetPassword($username: String!) {
      requestResetPassword(username: $username)
    }
  `,
  resetPassword: gql`
    mutation resetPassword($username: String!, $code: String!) {
      resetPassword(username: $username, code: $code) {
        ...sessionFields
      }
    }
    ${SESSION_FRAGMENT}
  `,
  updateProfile: gql`
    mutation updateProfile($input: ProfileUpdateInput!) {
      updateProfile(input: $input) {
        ...currentUserFields
      }
    }
    ${USER_FRAGMENT}
  `,

  upateMyCompany: gql`
    mutation upateMyCompany($input: MyCompanyUpdateInput!) {
      upateMyCompany(input: $input) {
        ...companyFields
      }
    }
    ${COMPANY_FRAGMENT}
  `,

  logout: gql`
    mutation logout {
      logout
    }
  `,
  session: gql`
    query session {
      session {
        ...sessionFields
      }
    }
    ${SESSION_FRAGMENT}
  `,
  setDeviceToken: gql`
    mutation userSetDeviceToken($input: UserDeviceTokenInput!) {
      userSetDeviceToken(input: $input)
    }
  `,
  changeScoreDisplay: gql`
    mutation changeScoreDisplay($input: UserProfileScoreDisplay!) {
      userDisplayScoreUpdate(input: $input) {
        profileScoreDisplay
      }
    }
  `,
  changeUserIdeaIntro: gql`
    mutation changeUserIdeaIntro($input: UserProfileIdeaIntro!) {
      userIdeaIntroUpdate(input: $input) {
        profileIdeaIntro
      }
    }
  `,
  updateRewardActive: gql`
    mutation updateRewardActive($input: UserProfileRewardActive!) {
      userProfileRewardUpdate(input: $input) {
        profileRewardActive
      }
    }
  `
};
