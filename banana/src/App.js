import React, { useState } from 'react';
import Login from './components/login/login';
import SignUp from './components/login/signup';
import './index.css'; 
import GameDashboard from './components/Game/GameDashboard';
import GamePlay from './components/Game/GamePlay';
import Scoreboard from './components/Game/Scoreboard'; // Import Scoreboard component
import GameTutorial from './components/Game/GameTutorial'; // Import Scoreboard component

const App = () => {
  const [currentPage, setCurrentPage] = useState('login'); // Set 'login' as default

  const renderPage = () => {
    switch (currentPage) {
      case 'signup':
        return <SignUp onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <GameDashboard onNavigate={setCurrentPage} />;
      case 'gameplay':
        return <GamePlay onNavigate={setCurrentPage} />;
      case 'GameTutorial': // Add case for Scoreboard
      return <GameTutorial onNavigate={setCurrentPage} />;
      case 'scoreboard': // Add case for Scoreboard
        return <Scoreboard onNavigate={setCurrentPage} />;
      default:
        return <Login onNavigate={setCurrentPage} />; // Default to Login
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200">
      {renderPage()}
    </div>
  );
};

export default App;
