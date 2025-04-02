import React, { useState, useEffect } from 'react';
import { Play, Trophy, LogOut, Star, Clock, Heart, Gamepad2, Book, Sparkles, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';
import { authService } from '../../services/api';
import { weatherService } from '../../services/whether';

const GameDashboard = ({ onNavigate }) => {
  const [selectedLevel, setSelectedLevel] = useState(localStorage.getItem('selectedLevel') || null);
  const [showLevelDetails, setShowLevelDetails] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [weatherTheme, setWeatherTheme] = useState({
    background: 'from-gray-900 via-black to-black',
    particles: 'bg-yellow-500/30',
    accent: 'yellow',
    borderColor: 'border-yellow-500/20',
    navIcon: 'text-yellow-400',
    effect: 'normal',
    currentWeather: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAnimateTitle(true);
    const interval = setInterval(() => {
      setAnimateTitle(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather data on component mount
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const weatherData = await weatherService.getCurrentWeather();
        const theme = weatherService.getWeatherTheme(weatherData);
        setWeatherTheme(theme);
        console.log('Applied weather theme:', theme.effect);
      } catch (error) {
        console.error('Error applying weather theme:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    
    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    
    return () => {
      clearInterval(weatherInterval);
    };
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
      // Store current weather theme for gameplay component
      localStorage.setItem('weatherTheme', JSON.stringify(weatherTheme));
      setTimeout(() => {
        onNavigate('gameplay');
      }, 100);
    }
  };

  const handleLogout = () => {
    authService.logout();
    onNavigate('login');
  };

  // Get weather icon based on condition
  const getWeatherIcon = () => {
    if (!weatherTheme.currentWeather) return <Sun className={`h-6 w-6 ${weatherTheme.navIcon}`} />;
    
    const condition = weatherTheme.currentWeather.condition;
    
    switch (condition) {
      case 'Clear':
        return <Sun className={`h-6 w-6 ${weatherTheme.navIcon}`} />;
      case 'Clouds':
        return <Cloud className={`h-6 w-6 ${weatherTheme.navIcon}`} />;
      case 'Rain':
      case 'Drizzle':
        return <CloudRain className={`h-6 w-6 ${weatherTheme.navIcon}`} />;
      case 'Snow':
        return <CloudSnow className={`h-6 w-6 ${weatherTheme.navIcon}`} />;
      case 'Thunderstorm':
        return <CloudLightning className={`h-6 w-6 ${weatherTheme.navIcon}`} />;
      default:
        return <CloudFog className={`h-6 w-6 ${weatherTheme.navIcon}`} />;
    }
  };
  
  // Weather-specific animations
  const getWeatherAnimations = () => {
    switch (weatherTheme.effect) {
      case 'rainy':
        return `
          @keyframes rain {
            0% { transform: translateY(-10px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0.3; }
          }
        `;
      case 'snowy':
        return `
          @keyframes snow {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0.3; }
          }
        `;
      case 'stormy':
        return `
          @keyframes lightning {
            0% { opacity: 0; }
            10% { opacity: 0; }
            11% { opacity: 1; }
            14% { opacity: 0; }
            20% { opacity: 0; }
            21% { opacity: 1; }
            24% { opacity: 0; }
            100% { opacity: 0; }
          }
        `;
      case 'foggy':
        return `
          @keyframes fog {
            0% { opacity: 0.1; transform: translateX(-100px); }
            50% { opacity: 0.3; }
            100% { opacity: 0.1; transform: translateX(100px); }
          }
        `;
      default:
        return `
          @keyframes float {
            0% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-10px) translateX(10px); }
            50% { transform: translateY(0) translateX(20px); }
            75% { transform: translateY(10px) translateX(10px); }
            100% { transform: translateY(0) translateX(0); }
          }
        `;
    }
  };

  // Weather-specific particles
  const renderWeatherEffects = () => {
    switch (weatherTheme.effect) {
      case 'rainy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-0.5 h-3 ${weatherTheme.particles} rounded-full`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `rain ${1 + Math.random() * 2}s linear infinite`,
                  animationDelay: `${-Math.random() * 5}s`
                }}
              ></div>
            ))}
          </div>
        );
      case 'snowy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 ${weatherTheme.particles} rounded-full`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `snow ${3 + Math.random() * 7}s linear infinite`,
                  animationDelay: `${-Math.random() * 10}s`
                }}
              ></div>
            ))}
          </div>
        );
      case 'stormy':
        return (
          <>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-0.5 h-6 ${weatherTheme.particles} rounded-full`}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `rain ${1 + Math.random() * 2}s linear infinite`,
                    animationDelay: `${-Math.random() * 5}s`
                  }}
                ></div>
              ))}
            </div>
            <div 
              className="absolute inset-0 bg-purple-500/5 pointer-events-none"
              style={{
                animation: 'lightning 7s infinite'
              }}
            ></div>
          </>
        );
      case 'foggy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute h-full w-full opacity-30"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  animation: `fog ${15 + Math.random() * 20}s linear infinite`,
                  animationDelay: `${-Math.random() * 15}s`
                }}
              ></div>
            ))}
          </div>
        );
      default:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 ${weatherTheme.particles} rounded-full`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 10}s linear infinite`,
                  animationDelay: `${-Math.random() * 10}s`
                }}
              ></div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated background elements */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${weatherTheme.background}`}>
        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 10px)' }}></div>
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${weatherTheme.accent}-500/50 to-transparent`}></div>
        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${weatherTheme.accent}-500/50 to-transparent`}></div>
      </div>

      {/* Define keyframes in a regular style tag */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        ${getWeatherAnimations()}
      `}} />

      {/* Weather-specific effects */}
      {renderWeatherEffects()}

      {/* Navigation Bar */}
      <nav className={`relative bg-black/50 backdrop-blur-xl ${weatherTheme.borderColor} p-4`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Gamepad2 className={`h-8 w-8 ${weatherTheme.navIcon} animate-pulse`} />
              <div className={`absolute inset-0 bg-${weatherTheme.accent}-400/20 rounded-full blur-xl animate-pulse`}></div>
            </div>
            <h1 className={`text-3xl font-bold text-${weatherTheme.accent}-400 cursor-pointer transition-all duration-700`}>
              Golden Digits 🍌✨
            </h1>
          </div>
          
          {/* Weather info display */}
          {weatherTheme.currentWeather && (
            <div className={`flex items-center space-x-2 text-${weatherTheme.accent}-400 border border-${weatherTheme.accent}-500/30 rounded-xl px-3 py-1`}>
              {getWeatherIcon()}
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {weatherTheme.currentWeather.temperature}°C
                </span>
                <span className="text-xs opacity-70">
                  {weatherTheme.currentWeather.city}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('scoreboard')}
              className="group relative px-6 py-2 overflow-hidden rounded-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 w-0 bg-gradient-to-r from-${weatherTheme.accent}-400 to-${weatherTheme.accent}-600 transition-all duration-300 ease-out group-hover:w-full`}></div>
              <div className="relative flex items-center space-x-2 text-gray-400 group-hover:text-black">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">RANKINGS</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('GameTutorial')}
              className="group relative px-6 py-2 overflow-hidden rounded-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 w-0 bg-gradient-to-r from-${weatherTheme.accent}-400 to-${weatherTheme.accent}-600 transition-all duration-300 ease-out group-hover:w-full`}></div>
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
          {/* Weather-based game tip */}
          {weatherTheme.currentWeather && (
            <div className={`mb-6 text-center text-${weatherTheme.accent}-400 text-sm animate-pulse`}>
              {weatherTheme.effect === 'sunny' && "It's a beautiful day! Your focus is enhanced in sunny weather. +5% scoring bonus!"}
              {weatherTheme.effect === 'cloudy' && "Cloudy skies help concentration. Time limits extended by 5 seconds!"}
              {weatherTheme.effect === 'rainy' && "Rain helps soothe the mind. Bonus life in rainy weather!"}
              {weatherTheme.effect === 'stormy' && "Thunderstorms create excitement! Occasional lightning bonus points!"}
              {weatherTheme.effect === 'snowy' && "Snow creates a peaceful atmosphere. More consistent scoring in snowy weather!"}
              {weatherTheme.effect === 'foggy' && "Foggy conditions test your focus. Extra points for consecutive correct answers!"}
            </div>
          )}

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