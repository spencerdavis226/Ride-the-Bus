import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { GameProvider } from './app/GameProvider';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);
