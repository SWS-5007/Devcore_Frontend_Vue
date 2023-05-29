import gql from "graphql-tag";
import { META_FRAGMENT } from "./meta";
// eslint-disable-next-line
export const EXPERIENCE_FRAGMENT = gql`
  fragment experienceFields on ExperienceUser {
    id
    companyId
    questId
    experiencePoints
    userId
    user {
      id
      firstName
      lastName
      experienceUsers {
      id,
      experiencePoints,
      questId
      level
      }
    }
    _metadata {
      ...metaFields
    }
  }
  ${META_FRAGMENT}
`;

export const EXPERIENCE = {

  increaseUserExperience: gql`
    mutation increaseUserExperience($input: ExperienceUpdateInput!) {
      increaseUserExperience(input: $input) {
        ...experienceFields
      }
    }
    ${EXPERIENCE_FRAGMENT}
  `,
};
