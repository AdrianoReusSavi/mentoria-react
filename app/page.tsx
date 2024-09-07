import React from 'react';
import Home from './home';
import { QueryProvider } from './queryProvider';

const App = () => {
  return (
    <QueryProvider>
      <Home />
    </QueryProvider>
  );
};

export default App;