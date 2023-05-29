import gql from "graphql-tag";

// eslint-disable-next-line
const LINK_FRAGMENT = gql`
  fragment linkField on ShareLink {
    id
    projectId
    companyId
    companyRoleId
    urlName
    urlHash
    createdAt
    updatedAt
  }
`;

export const SHARELINK = {
  findAll: gql`
    query linkFindAll($filter: Filter) {
      linkFindAll(filter: $filter) {
        ...linkField
      }
    }
    ${LINK_FRAGMENT}
  `,
  shareProjectByLinkId: gql`
    mutation shareProjectByLinkId($id: ID!) {
      shareProjectByLinkId(id: $id)
    }
  `,
  getShareLinkByHash: gql `
    mutation getShareLinkByHash($urlHash:String!){
      getShareLinkByHash(urlHash:$urlHash){
        ...linkField
      }
    }
    ${LINK_FRAGMENT}
  `,  
};
