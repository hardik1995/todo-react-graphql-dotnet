import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, defaultTheme } from '@adobe/react-spectrum';
import { ApolloProvider } from '@apollo/client';
import App from './App';
import { client } from './graphql';
import './styles.css';

// Enhanced theme with custom colors
const customTheme = {
  ...defaultTheme,
  global: {
    ...defaultTheme.global,
    colors: {
      ...defaultTheme.global.colors,
      'accent-600': '#6366f1', // Beautiful indigo
      'accent-700': '#4f46e5',
      'positive-600': '#059669', // Emerald green
      'informative-600': '#0284c7', // Sky blue
      'negative-600': '#dc2626', // Red
      'gray-50': '#f9fafb',
      'gray-600': '#6b7280',
    }
  }
};

// Render the root of the React application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Provider theme={customTheme} colorScheme="light">
        <App />
      </Provider>
    </ApolloProvider>
  </React.StrictMode>
);