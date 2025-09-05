import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// Determine backend endpoints; environment variables can override
const httpUri = import.meta.env.VITE_API_HTTP || '/api/graphql';
const wsUri =
  import.meta.env.VITE_API_WS ||
  `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/graphql`;

// HTTP link for queries and mutations
const httpLink = new HttpLink({ uri: httpUri });

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUri,
    retryAttempts: 10,
  }),
);

// Split based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

// Apollo Client instance
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});