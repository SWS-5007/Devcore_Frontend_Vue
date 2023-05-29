import gql from "graphql-tag";
import { META_FRAGMENT } from "./meta";
import { RESOURCE_FRAGMENT } from "./resource";
export const PROJECT_EVALUATION_RECORD = gql`
  fragment projectEvaluationRecordFields on ProjectEvaluationRecord {
    id
    status
    projectId
    evaluationInstanceId
    ideaId
    moneyUnit
    moneyValue
    timeUnit
    timeValue
    totalValue
    idea {
      id
      title
      process {
        id
        title
      }
    }
  }
`;

export const PROJECT_FRAGMENT = gql`
  fragment projectFields on Project {
    id
    name
    description
    createdAt
    updatedAt
    type
    status
    processId
    issueEvaluationRoles
    issueTemplateRoles
    shareAccessRoles
    useAdvanced
    stages {
      id
      status
      processStageId
    }
    users {
      id
    }
    userIdeas {
      id
      title
      projectId
      stageId
    }
    process {
      id
      title
      stages {
        id
        title
        operations {
          id
          title
          phases {
            id
            title
          }
        }
      }
    }
    userPendingEvaluations {
      id
      status
      userRecords {
        ...projectEvaluationRecordFields
      }
    }

    _metadata {
      ...metaFields
    }
  }
  ${META_FRAGMENT}
  ${PROJECT_EVALUATION_RECORD}
`;

export const PROJECT_FULL_FRAGMENT = gql`
  fragment projectFullFields on Project {
    ...projectFields
    userIdeas {
      id
      title
      projectId
      stageId
   
      idea {
        companyTools {
          id
          tool {
            id
            name
          }
        }
        problems {
          id
          title
          uuid
          description
          createdAt
          updatedAt
          anonymous
          replied
          type
          comments {
            id
            description
            type
            createdAt
          }
          files {
            ...resourceFields
          }
          author {
            id
            firstName
            lastName
            avatarUrl
          }
        }
        improvements {
          id
          title
          uuid
          description
          type
          createdAt
          updatedAt
          anonymous
          replied
          comments {
            id
            description
            type
            createdAt
          }
          files {
            ...resourceFields
          }
          author {
            id
            firstName
            lastName
            avatarUrl
          }
        }
        id
        title
        uuid
        #companyRoleIds
        companyToolIds
        ideaContentId
        ideaContent {
          id
          contentType
        }
        properties
        author {
          id
        }
        files {
          id
          title
          size
          mimeType
          displayType
          uri
          url
        }
        companyToolId
        tool {
          id
          name
        }
        description
        processId
        createdAt
        updatedAt
        phaseId
        operationId
        process {
          id
          title
          id
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
      }
    }
  }
  ${RESOURCE_FRAGMENT}
  ${PROJECT_FRAGMENT}
`;

export const PROJECT = {
  projectUpdated: gql`
    subscription projectUpdated {
      projectUpdated {
        id
      }
    }
  `,

  newNotification: gql`
    subscription newNotification {
      newNotification {
        type
        payload
      }
    }
  `,

  projectFindMyAll: gql`
    query projectFindMyAll($filter: Filter) {
      projectFindMyAll(filter: $filter) {
        ...projectFullFields
      }
    }
    ${PROJECT_FULL_FRAGMENT}
  `,
  findById: gql`
    query projectFindById($id: ID!) {
      projectFindById(id: $id) {
        ...projectFullFields
      }
    }
    ${PROJECT_FULL_FRAGMENT}
  `,
  projectEvaluateIdea: gql`
    mutation projectEvaluateIdea($input: ProjectEvaluationRecordInput!) {
      projectEvaluateIdea(input: $input) {
        ...projectEvaluationRecordFields
      }
    }
    ${PROJECT_EVALUATION_RECORD}
  `
};
