import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from './app/router';
import './styles/globals.css';

localStorage.removeItem('devDateOverride');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
