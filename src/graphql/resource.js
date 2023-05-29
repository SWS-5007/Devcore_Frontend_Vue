import gql from 'graphql-tag';
import {
    META_FRAGMENT
} from './meta';
// eslint-disable-next-line
export const RESOURCE_FRAGMENT = gql `
    fragment resourceFields on Resource{
      id,
      title,
      size,
      section,
      mimeType,
      displayType,
      url,
      uri,
      _metadata{
        ...metaFields
      }
    }
    ${META_FRAGMENT}
`;