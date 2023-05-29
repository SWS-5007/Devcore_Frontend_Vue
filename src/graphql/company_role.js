import gql from 'graphql-tag';
import {
    META_FRAGMENT
} from './meta';
// eslint-disable-next-line
const COMPANY_ROLE_FRAGMENT = gql `
    fragment companyRoleFields on CompanyRole{
      id,
      name,
      createdAt,
      updatedAt,
      users{
        id
        yearlyCosts
        engageScore
      }
      avatar,
      avatarUrl
      _metadata{
          ...metaFields
      }
    }
    ${META_FRAGMENT}
`;

const COMPANY_ROLE_FULL_FRAGMENT = gql `
    fragment companyRoleFullFields on CompanyRole{
        ...companyRoleFields,
        company{
            id,
            name
        }
    }
    ${COMPANY_ROLE_FRAGMENT}
`;



export const COMPANY_ROLE = {
    findAll: gql `
        query companyRoleFindAll($filter:Filter){
            companyRoleFindAll(filter:$filter){
                ...companyRoleFields
            }
        }
        ${COMPANY_ROLE_FRAGMENT}
    `,
    findById: gql `
      query companyRoleFindById($id:ID!){
        companyRoleFindById(id:$id){
                ...companyRoleFullFields
            }
        }
        ${COMPANY_ROLE_FULL_FRAGMENT}
    `,
    create: gql `
        mutation companyRoleCreate($input:CompanyRoleCreateInput!){
            companyRoleCreate(input:$input){
                ...companyRoleFields
            }
        }
        ${COMPANY_ROLE_FRAGMENT}
    `,
    update: gql `
        mutation companyRoleUpdate($id:ID!, $input:CompanyRoleUpdateInput!){
            companyRoleUpdate(id:$id, input:$input){
                ...companyRoleFields
            }
        }
        ${COMPANY_ROLE_FRAGMENT}
    `,
    delete: gql `
        mutation companyRoleDelete($id:ID!){
            companyRoleDelete(id:$id)
        }
    `,
}

