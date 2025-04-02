import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Clock, Heart, Trophy, Loader, AlertCircle, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';
import { gameService, scoreService } from '../../services/api';
import GameAudio from './GameAudio';

const GamePlay = ({ onNavigate }) => {
  const currentLevel = localStorage.getItem('selectedLevel') || 'Easy';

  const levelConfig = useMemo(() => ({
    Easy: { 
      timeLimit: 40, 
      attempts: 40, 
      required: 5,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/30',
      glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
      buttonGradient: 'from-green-500 to-green-600 hover:from-green-400 hover:to-green-500'
    },
    Medium: { 
      timeLimit: 30, 
      attempts: 30, 
      required: 7,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30',
      glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
      buttonGradient: 'from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500'
    },
    Hard: { 
      timeLimit: 20, 
      attempts: 20, 
      required: 10,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/30',
      glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      buttonGradient: 'from-red-500 to-red-600 hover:from-red-400 hover:to-red-500'
    }
  }), []);

  const [gameState, setGameState] = useState({
    gameId: null,
    questionImage: null,
    message: "Loading game...",
    score: 0,
    loading: true,
    error: null,
    level: currentLevel
  });

  // Weather state
  const [weatherTheme, setWeatherTheme] = useState({
    background: 'from-gray-900 via-black to-black',
    particles: 'bg-yellow-500/30',
    accent: 'yellow',
    borderColor: 'border-yellow-500/20',
    navIcon: 'text-yellow-400',
    effect: 'normal',
    currentWeather: null
  });
  
  const [weatherBonus, setWeatherBonus] = useState({
    type: null,
    value: 0,
    description: '',
    isActive: false
  });
  
  const [currentGuess, setCurrentGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(levelConfig[currentLevel].timeLimit);
  const [attempts, setAttempts] = useState(levelConfig[currentLevel].attempts);
  const [gamesCompleted, setGamesCompleted] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [consecutive, setConsecutive] = useState(0);
  const [showLightning, setShowLightning] = useState(false);

  const currentLevelConfig = useMemo(() => levelConfig[gameState.level], [levelConfig, gameState.level]);

  // Load weather theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('weatherTheme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setWeatherTheme(parsedTheme);
        applyWeatherEffects(parsedTheme.effect);
      } catch (error) {
        console.error('Error parsing weather theme:', error);
      }
    }
  }, []);

  // Apply weather-based game modifications
  const applyWeatherEffects = useCallback((weatherEffect) => {
    switch (weatherEffect) {
      case 'sunny':
        // Sunny weather gives scoring bonus
        setWeatherBonus({
          type: 'score',
          value: 1.05, // 5% bonus
          description: 'Sunny Day Bonus: +5% to all scores!',
          isActive: true
        });
        break;
      case 'cloudy':
        // Cloudy weather gives extra time
        setTimeLeft(prev => {
          const extendedTime = prev + 5;
          return extendedTime;
        });
        setWeatherBonus({
          type: 'time',
          value: 5,
          description: 'Cloudy Sky Bonus: +5 seconds to time limit!',
          isActive: true
        });
        break;
      case 'rainy':
        // Rainy weather gives extra life
        setAttempts(prev => prev + 1);
        setWeatherBonus({
          type: 'life',
          value: 1,
          description: 'Rainy Day Bonus: +1 extra life!',
          isActive: true
        });
        break;
      case 'stormy':
        // Thunderstorms create random lightning bonuses
        setWeatherBonus({
          type: 'lightning',
          value: 50,
          description: 'Thunderstorm Bonus: Random lightning bonus points!',
          isActive: true
        });
        break;
      case 'snowy':
        // Snow gives consistent scoring
        setWeatherBonus({
          type: 'consistency',
          value: 10,
          description: 'Snow Day Bonus: More consistent scoring!',
          isActive: true
        });
        break;
      case 'foggy':
        // Fog rewards consecutive correct answers
        setWeatherBonus({
          type: 'consecutive',
          value: 10,
          description: 'Foggy Day Challenge: +10 points per consecutive correct answer!',
          isActive: true
        });
        break;
      default:
        setWeatherBonus({
          type: null,
          value: 0,
          description: '',
          isActive: false
        });
    }
  }, []);

  // Get weather icon based on condition
  const getWeatherIcon = useCallback(() => {
    if (!weatherTheme.currentWeather) return <Sun className="w-5 h-5 text-yellow-400" />;
    
    const condition = weatherTheme.currentWeather.condition;
    
    switch (condition) {
      case 'Clear':
        return <Sun className={`w-5 h-5 ${weatherTheme.navIcon}`} />;
      case 'Clouds':
        return <Cloud className={`w-5 h-5 ${weatherTheme.navIcon}`} />;
      case 'Rain':
      case 'Drizzle':
        return <CloudRain className={`w-5 h-5 ${weatherTheme.navIcon}`} />;
      case 'Snow':
        return <CloudSnow className={`w-5 h-5 ${weatherTheme.navIcon}`} />;
      case 'Thunderstorm':
        return <CloudLightning className={`w-5 h-5 ${weatherTheme.navIcon}`} />;
      default:
        return <CloudFog className={`w-5 h-5 ${weatherTheme.navIcon}`} />;
    }
  }, [weatherTheme]);

  // Weather-specific animations
  const getWeatherAnimations = useCallback(() => {
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
  }, [weatherTheme.effect]);

  // Weather-specific particles
  const renderWeatherEffects = useCallback(() => {
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
            {showLightning && (
              <div 
                className="absolute inset-0 bg-purple-500/20 pointer-events-none"
                style={{
                  animation: 'lightning 1s'
                }}
              ></div>
            )}
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
  }, [weatherTheme.particles, weatherTheme.effect, showLightning]);

  const getUserData = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }, []);

  const saveGameStats = useCallback(async () => {
    try {
      const userData = getUserData();
      
      const scoreData = {
        userId: userData?._id,
        gameId: gameState.gameId,
        score: totalScore,
        weatherCondition: weatherTheme.currentWeather?.condition || 'Unknown'
      };
      
      if (scoreData.userId && scoreData.gameId) {
        await scoreService.submitScore(scoreData);
      }
      
      localStorage.removeItem('finalScore');
      localStorage.removeItem('gamesCompleted');
      localStorage.removeItem('gameLevel');
      
    } catch (error) {
      console.error('Error saving game stats:', error);
      return Promise.resolve();
    }
  }, [totalScore, gameState.gameId, getUserData, weatherTheme.currentWeather]);

  const handleGameEnd = useCallback(async () => {
    try {
      await saveGameStats();
    } finally {
      onNavigate('scoreboard');
    }
  }, [saveGameStats, onNavigate]);

  const startNewGame = useCallback(async () => {
    try {
      const level = gameState.level;
      const response = await gameService.startGame(level);
      
      if (response?.success && response.data) {
        setGameState(prev => ({
          ...prev,
          gameId: response.data.gameId,
          questionImage: response.data.question,
          message: "Enter the missing number (0-9)",
          loading: false,
          error: null
        }));
        
        // Reset timer when starting a new game
        setTimeLeft(currentLevelConfig.timeLimit);
        setTimerActive(true);
        
        if (gamesCompleted === 0) {
          setAttempts(currentLevelConfig.attempts);
        }
        
        // Random lightning effect for stormy weather
        if (weatherTheme.effect === 'stormy' && Math.random() < 0.3) {
          setShowLightning(true);
          setTimeout(() => setShowLightning(false), 1000);
        }
      } else {
        throw new Error('Invalid game response');
      }
    } catch (error) {
      console.error('Game start error:', error);
      setGameState(prev => ({
        ...prev,
        error: 'Failed to start game. Please try again.',
        loading: false
      }));
    }
  }, [gameState.level, gamesCompleted, currentLevelConfig, weatherTheme.effect]);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0 || attempts <= 0) {
      if (timeLeft <= 0 || attempts <= 0) {
        handleGameEnd();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, attempts, handleGameEnd, timerActive]);

  useEffect(() => {
    startNewGame();
    
    return () => {
      setGameState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));
    };
  }, [startNewGame]);

  const handleGuess = useCallback(async () => {
    if (attempts <= 0) {
      await handleGameEnd();
      return;
    }

    const guess = parseInt(currentGuess);
    if (isNaN(guess) || guess < 0 || guess > 9) {
      setGameState(prev => ({
        ...prev,
        message: "Please enter a valid number (0-9)"
      }));
      return;
    }

    try {
      const response = await gameService.submitAnswer(gameState.gameId, guess);
      
      if (response.success) {
        const { correct, score } = response.data;

        if (correct) {
          // Pause timer and prepare for next question
          setTimerActive(false);
          
          // Calculate score with weather bonuses
          let newScore = score || 100;
          let bonusMessage = '';
          
          // Apply weather bonus effects
          if (weatherBonus.isActive) {
            switch (weatherBonus.type) {
              case 'score':
                // Apply percentage bonus (e.g., sunny day)
                newScore = Math.round(newScore * weatherBonus.value);
                bonusMessage = `+${Math.round((weatherBonus.value - 1) * 100)}% Weather Bonus!`;
                break;
                
              case 'lightning':
                // Random lightning bonus (stormy weather)
                if (Math.random() < 0.3) {
                  const lightningBonus = weatherBonus.value;
                  newScore += lightningBonus;
                  bonusMessage = `+${lightningBonus} Lightning Strike Bonus!`;
                  setShowLightning(true);
                  setTimeout(() => setShowLightning(false), 1000);
                }
                break;
                
              case 'consistency':
                // More consistent scoring (snowy weather)
                const minScore = Math.round(newScore * 0.9);
                newScore = Math.max(minScore, newScore);
                bonusMessage = 'Snow Day Consistency Bonus!';
                break;
                
              case 'consecutive':
                // Consecutive answer bonus (foggy weather)
                const consecutiveBonus = consecutive * weatherBonus.value;
                if (consecutive > 0) {
                  newScore += consecutiveBonus;
                  bonusMessage = `+${consecutiveBonus} Consecutive Answer Bonus!`;
                }
                setConsecutive(prev => prev + 1);
                break;
            }
          }
          
          setTotalScore(prev => prev + newScore);
          setGamesCompleted(prev => {
            const newCount = prev + 1;
            if (newCount >= currentLevelConfig.required) {
              handleGameEnd();
            }
            return newCount;
          });
          
          setGameState(prev => ({
            ...prev,
            message: bonusMessage ? `Correct! ${bonusMessage}` : "Correct! Well done!",
          }));
          
          // Start new game after a delay
          setTimeout(() => {
            startNewGame();
          }, 1500);
        } else {
          setAttempts(prev => {
            const newAttempts = prev - 1;
            if (newAttempts <= 0) {
              handleGameEnd();
            }
            return newAttempts;
          });
          
          // Reset consecutive counter for foggy weather bonus
          if (weatherBonus.type === 'consecutive') {
            setConsecutive(0);
          }
          
          setGameState(prev => ({
            ...prev,
            message: "Incorrect, try again!"
          }));
        }
        setCurrentGuess('');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setGameState(prev => ({
        ...prev,
        message: "Error submitting answer. Try again."
      }));
    }
  }, [
    attempts, 
    currentGuess, 
    gameState.gameId, 
    handleGameEnd, 
    startNewGame, 
    currentLevelConfig.required,
    weatherBonus,
    consecutive
  ]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  if (gameState.loading) {
    return (
      <div className={`min-h-screen bg-black flex items-center justify-center`}>
        <div className="flex flex-col items-center space-y-4">
          <Loader className={`w-12 h-12 animate-spin ${currentLevelConfig.color}`} />
          <div className={`text-xl ${currentLevelConfig.color} font-bold`}>
            LOADING MISSION...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <GameAudio isPlaying={true}/>
      
      {/* Animated background elements */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${weatherTheme.background}`}>
        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 10px)' }}></div>
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${weatherTheme.accent}-500/50 to-transparent`}></div>
        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${weatherTheme.accent}-500/50 to-transparent`}></div>
      </div>

      {/* Define keyframes for weather animations */}
      <style dangerouslySetInnerHTML={{ __html: getWeatherAnimations() }} />

      {/* Weather-specific effects */}
      {renderWeatherEffects()}

      <div className="max-w-2xl mx-auto p-4 relative z-10">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-yellow-500/20">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-yellow-500/50"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-yellow-500/50"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-yellow-500/50"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-yellow-500/50"></div>

          {/* Game Stats Bar */}
          <div className={`flex justify-between items-center mb-6 ${currentLevelConfig.bgColor} border backdrop-blur-sm p-4 rounded-xl`}>
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${currentLevelConfig.color}`} />
              <span className={`font-bold ${currentLevelConfig.color}`}>{formatTime(timeLeft)}</span>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-bold ${currentLevelConfig.color}`}>
                LEVEL {gameState.level}
              </div>
              <div className="text-gray-400 text-sm">
                PROGRESS: {gamesCompleted}/{currentLevelConfig.required}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Heart className={`w-5 h-5 ${attempts <= 5 ? 'text-red-500 animate-pulse' : 'text-red-400'}`} />
              <span className={`font-bold ${attempts <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
                {attempts}
              </span>
            </div>
          </div>

          {/* Weather info */}
          {weatherTheme.currentWeather && (
            <div className={`flex items-center justify-center gap-2 mb-4`}>
              <div className={`flex items-center gap-2 px-4 py-1 rounded-full
                bg-${weatherTheme.accent}-500/10 border border-${weatherTheme.accent}-500/30`}>
                {getWeatherIcon()}
                <span className={`text-sm font-medium text-${weatherTheme.accent}-400`}>
                  {weatherTheme.currentWeather.description}
                </span>
              </div>
              
              {weatherBonus.isActive && (
                <div className={`text-xs text-${weatherTheme.accent}-400 animate-pulse`}>
                  {weatherBonus.description}
                </div>
              )}
            </div>
          )}

          {/* Score Display */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full ${currentLevelConfig.bgColor}`}>
              <Trophy className={`w-6 h-6 ${currentLevelConfig.color}`} />
              <span className={`text-xl font-bold ${currentLevelConfig.color}`}>
                {totalScore}
              </span>
            </div>
          </div>

          {/* Game Image */}
          {gameState.questionImage && (
            <div className="text-center mb-8">
              <div className={`p-1 rounded-xl ${currentLevelConfig.glowColor}`}>
                <img 
                  src={gameState.questionImage}
                  alt="Math Puzzle"
                  className="w-full max-w-md mx-auto rounded-lg"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            </div>
          )}

          {/* Game Message */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-gray-300">{gameState.message}</p>
          </div>

          {/* Game Controls */}
          <div className="space-y-4">
            <input
              type="number"
              min="0"
              max="9"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value)}
              className="w-full p-4 text-2xl text-center bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100
                focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800/80 transition-all duration-300"
              placeholder="Enter a digit (0-9)"
            />
            
            <button
              onClick={handleGuess}
              className={`w-full py-4 text-black font-bold rounded-xl transition-all duration-300
                transform hover:scale-105 ${currentLevelConfig.glowColor}
                bg-gradient-to-r ${currentLevelConfig.buttonGradient}`}
            >
              SUBMIT ANSWER
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-yellow-400 
                transition-colors py-2 font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>RETURN TO BASE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;