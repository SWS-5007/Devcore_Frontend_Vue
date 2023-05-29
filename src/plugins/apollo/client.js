import VueApollo from "vue-apollo";
import ApolloClient from "apollo-client";
//import { BatchHttpLink } from 'apollo-link-batch-http';
//import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";
import { onError } from "apollo-link-error";
import config from "./config";
import EchoLink from "./echolink";
import store from "@/store";
import EventBus from "@/lib/eventbus";
import { createUploadLink } from "apollo-upload-client";
import { showGraphqlErrorFromResponse } from "../../lib/utils";

import { IntrospectionFragmentMatcher } from "apollo-cache-inmemory";
import introspectionQueryResultData from "../../fragmentTypes.json";

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
});

const cache = new InMemoryCache({ fragmentMatcher });

// eslint-disable-next-line
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (networkError) {
    showGraphqlErrorFromResponse(networkError);
  }

  //refresh window when unauthenticated and has user
  if (graphQLErrors) {
    const session = store.getters["auth/session"];
    if (session) {
      graphQLErrors.map(error => {
        if (error.extensions && error.extensions.status === 401) {
          store.dispatch("auth/logout");
        }
      });
    }
  }
});

//allow file uploads (it's a terminating link, so it cannot be mixed)
// eslint-disable-next-line
const fileUploadLink = new createUploadLink({
  uri: config.graphqlEndpoint,
  //credentials: 'include',
  fetch: async (uri, options) => {
    try {
      //add the auth token to the headers
      const token = store.getters["auth/access_token"];
      if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
      }
      options.headers["X-Client"] = config.client;
      options.headers["X-Client-Version"] = config.clientVersion;
      const response = await fetch(uri, options);
      if (response && response.headers && response.status != 500) {
        const userId = response.headers.get("X-User-Id");
        await store.dispatch("auth/checkSameUser", userId);
      }
      //}
      return response;
      //eslint-disable-next-line
    } catch (ex) {
      console.log(ex)
    }
  },
  includeExtensions: true
});

//apollo links config
const apolloLinks = [];
config.allowSubscriptions = (config.allowSubscriptions && store) || true;
if (process.env.NODE_ENV != "production") {
  console.log(config);
}

let echoLink = null;

apolloLinks.push(errorLink);
// //allow graphql subscriptions
// if (config.allowSubscriptions) {
//   echoLink = new EchoLink();
//   echoLink.init();
//   apolloLinks.push(echoLink);
// }

EventBus.$on("auth/LOGIN", () => {
  if (config.allowSubscriptions) {
    //allow graphql subscriptions
    echoLink.closeEcho();
    echoLink.initEcho();
  }
});

EventBus.$on("auth/LOGOUT", () => {
  if (config.allowSubscriptions) {
    //allow graphql subscriptions
    echoLink.closeEcho();
  }
});



if (config.allowSubscriptions) {
  echoLink = new EchoLink();
  apolloLinks.push(echoLink);
}
apolloLinks.push(fileUploadLink);

const links = ApolloLink.from(apolloLinks);

export const apolloClient = new ApolloClient({
  link: links,
  cache,
  credentials: "include",
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network"
    },
    query: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all"
    }
  }
});

export const apolloProvider = new VueApollo({
  defaultClient: apolloClient
});
