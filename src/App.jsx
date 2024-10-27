// App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './layout/Layout';
import './styles/selectionStyles.css';
import './App.css';

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
