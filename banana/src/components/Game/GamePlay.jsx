import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Clock, Heart, Trophy, Loader, AlertCircle } from 'lucide-react';
import { gameService, scoreService } from '../../services/api';
import  GameAudio from './GameAudio';

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

  
  const [currentGuess, setCurrentGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(levelConfig[currentLevel].timeLimit);
  const [attempts, setAttempts] = useState(levelConfig[currentLevel].attempts);
  const [gamesCompleted, setGamesCompleted] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  const currentLevelConfig = useMemo(() => levelConfig[gameState.level], [levelConfig, gameState.level]);

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
        score: totalScore
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
  }, [totalScore, gameState.gameId, getUserData]);

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
  }, [gameState.level, gamesCompleted, currentLevelConfig]);

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
          
          const newScore = score || 100;
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
            message: "Correct! Well done!",
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
    currentLevelConfig.required
  ]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  if (gameState.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-yellow-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

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