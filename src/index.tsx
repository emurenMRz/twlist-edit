import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './utility';
import './index.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
    <div id="confirm"></div>
  </React.StrictMode>
);
