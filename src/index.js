import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { TaskProvider } from './context/TaskContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
      <TaskProvider><App /></TaskProvider>
    </React.StrictMode>
);

reportWebVitals();
