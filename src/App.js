import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { StatsProvider } from './contexts/StatsContext';
import AppNavigator from './components/AppNavigator';
import IOSOAuthHandler from './components/IOSOAuthHandler';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <StatsProvider>
        <GameProvider>
          <IOSOAuthHandler />
          <div className="App h-screen overflow-hidden">
            <AppNavigator />
          </div>
        </GameProvider>
      </StatsProvider>
    </AuthProvider>
  );
}

export default App;