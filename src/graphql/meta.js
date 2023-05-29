import gql from 'graphql-tag';

// eslint-disable-next-line
export const META_FRAGMENT = gql `
    fragment metaFields on ObjectMetadata{
      permissions,
    }
`;