import React, { useState, useEffect } from 'react';
import { Play, Trophy, LogOut, Star, Clock, Heart, Gamepad2, Book, Sparkles } from 'lucide-react';
import { authService } from '../../services/api';

const GameDashboard = ({ onNavigate }) => {
  const [selectedLevel, setSelectedLevel] = useState(localStorage.getItem('selectedLevel') || null);
  const [showLevelDetails, setShowLevelDetails] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);

  useEffect(() => {
    setAnimateTitle(true);
    const interval = setInterval(() => {
      setAnimateTitle(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const levelConfig = {
    Easy: {
      color: 'green',
      glowStyle: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
      buttonGlow: 'shadow-[0_0_30px_rgba(34,197,94,0.5)]',
      time: '40',
      attempts: 40,
      required: 5,
      description: 'Perfect for beginners',
      icon: '🌱'
    },
    Medium: {
      color: 'yellow',
      glowStyle: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
      buttonGlow: 'shadow-[0_0_30px_rgba(234,179,8,0.5)]',
      time: '30',
      attempts: 30,
      required: 7,
      description: 'For experienced players',
      icon: '⚡'
    },
    Hard: {
      color: 'red',
      glowStyle: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
      buttonGlow: 'shadow-[0_0_30px_rgba(239,68,68,0.5)]',
      time: '20',
      attempts: 20,
      required: 10,
      description: 'For math experts',
      icon: '🔥'
    }
  };

  const handleLevelSelect = (level) => {
    console.log('Level selected:', level);
    setSelectedLevel(level);
    localStorage.setItem('selectedLevel', level);
    setShowLevelDetails(true);
  };

  const handlePlay = () => {
    if (selectedLevel) {
      console.log('Starting game with level:', selectedLevel);
      localStorage.setItem('selectedLevel', selectedLevel);
      setTimeout(() => {
        onNavigate('gameplay');
      }, 100);
    }
  };

  const handleLogout = () => {
    authService.logout();
    onNavigate('login');
  };

  // CSS animations defined in a separate style element
  const floatingAnimationKeyframes = `
    @keyframes float {
      0% { transform: translateY(0) translateX(0); }
      25% { transform: translateY(-10px) translateX(10px); }
      50% { transform: translateY(0) translateX(20px); }
      75% { transform: translateY(10px) translateX(10px); }
      100% { transform: translateY(0) translateX(0); }
    }
  `;

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 10px)' }}></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
      </div>

      {/* Define keyframes in a regular style tag */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        ${floatingAnimationKeyframes}
      `}} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-500/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${-Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Navigation Bar */}
      <nav className="relative bg-black/50 backdrop-blur-xl border-b border-yellow-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Gamepad2 className="h-8 w-8 text-yellow-400 animate-pulse" />
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold text-yellow-400 cursor-pointer transition-all duration-700">
              Golden Digits 🍌✨
            </h1>
          </div>
          
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('scoreboard')}
              className="group relative px-6 py-2 overflow-hidden rounded-xl transition-all duration-300"
            >
              <div className="absolute inset-0 w-0 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 ease-out group-hover:w-full"></div>
              <div className="relative flex items-center space-x-2 text-gray-400 group-hover:text-black">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">RANKINGS</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('GameTutorial')}
              className="group relative px-6 py-2 overflow-hidden rounded-xl transition-all duration-300"
            >
              <div className="absolute inset-0 w-0 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 ease-out group-hover:w-full"></div>
              <div className="relative flex items-center space-x-2 text-gray-400 group-hover:text-black">
                <Book className="h-5 w-5" />
                <span className="font-bold">GUIDE</span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="group relative px-6 py-2 overflow-hidden rounded-xl transition-all duration-300"
            >
              <div className="absolute inset-0 w-0 bg-gradient-to-r from-red-400 to-red-600 transition-all duration-300 ease-out group-hover:w-full"></div>
              <div className="relative flex items-center space-x-2 text-gray-400 group-hover:text-black">
                <LogOut className="h-5 w-5" />
                <span className="font-bold">EXIT</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {Object.entries(levelConfig).map(([level, config]) => (
              <div key={level} 
                className={`transform transition-all duration-500 ${
                  selectedLevel === level ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <button
                  onClick={() => handleLevelSelect(level)}
                  className={`w-full h-full relative bg-gray-900/80 rounded-2xl p-6 border-2 
                    ${selectedLevel === level ? `border-${config.color}-500` : `border-${config.color}-500/30`}
                    transition-all duration-300 ${config.glowStyle} overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${config.color}-500/10 to-transparent
                    transition-opacity duration-300 ${selectedLevel === level ? 'opacity-100' : 'opacity-0'}`}></div>
                  
                  <div className="relative">
                    <div className="text-4xl mb-4 transform hover:scale-110 transition-transform">
                      {config.icon}
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 text-${config.color}-400`}>{level}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className={`h-5 w-5 text-${config.color}-400`} />
                        <span className="text-gray-300">{config.time}s Time Limit</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Heart className={`h-5 w-5 text-${config.color}-400`} />
                        <span className="text-gray-300">{config.attempts} Lives</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Star className={`h-5 w-5 text-${config.color}-400`} />
                        <span className="text-gray-300">{config.required} Missions</span>
                      </div>
                    </div>
                    
                    <p className={`mt-4 text-${config.color}-400/80 text-sm`}>
                      {config.description}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Play Button */}
          {selectedLevel && (
            <div className="relative mt-8">
              <button
                onClick={handlePlay}
                className={`w-full relative bg-gradient-to-r from-${levelConfig[selectedLevel].color}-500 
                  to-${levelConfig[selectedLevel].color}-600 text-black font-bold py-6 rounded-xl
                  transform hover:scale-105 transition-all duration-300 ${levelConfig[selectedLevel].buttonGlow}
                  overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-xl">START MISSION</span>
                  <Sparkles className="h-6 w-6" />
                </div>
              </button>

              <p className="text-center mt-6 text-gray-400 animate-pulse">
                MISSION BRIEF: Complete {levelConfig[selectedLevel].required} challenges
                in {levelConfig[selectedLevel].time} seconds with {levelConfig[selectedLevel].attempts} lives
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;