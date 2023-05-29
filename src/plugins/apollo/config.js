export default {
  graphqlEndpoint: process.env.VUE_APP_GRAPHQL_ENDPOINT,
  apiEndpoint: process.env.VUE_APP_API_ENDPOINT,
  wsEndpoint: process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_ENDPOINT,
  wsPort: process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PORT,
  allowSubscriptions:process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_ENABLED,
  clientVersion: process.env.VUE_APP_CLIENT_VERSION || "1.0.0",
  client: process.env.VUE_APP_CLIENT || "mobile",
  wsAuthEndpoint:`${process.env.VUE_APP_GRAPHQL_ENDPOINT}/subscriptions/auth`
};
