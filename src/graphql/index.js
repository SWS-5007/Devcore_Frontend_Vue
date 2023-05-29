import gql from 'graphql-tag'



export const TEST_QUERY = gql `
    query serverTime{
        serverTime
    }
`;

export const APP_CONFIG = gql `
    query appConfig{
        appConfig
    }
`;

export * from './auth';
export * from './project';
export * from './idea';
export * from './ideaissue';
export * from './issue';
export * from './milestone';
export * from './resource';
export * from './issue';
export * from './effect';
export * from './company_role';
export * from './reply';
export * from './experience';
export * from './user';
export * from './ideaContent';
export * from './project_sharelink';
