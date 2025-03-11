import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  LogOut, 
  Trophy, 
  Target, 
  Timer, 
  Heart, 
  Brain, 
  Star, 
  Medal,
  Sparkles,
  ChevronRight,
  Book
} from 'lucide-react';
import { authService, statsService } from '../../services/api';

const GameTutorial = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('tutorial');
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerStats();
  }, []);

  const loadPlayerStats = async () => {
    try {
      setLoading(true);
      // Assuming we have a statsService to fetch player statistics
      const response = await statsService.getPlayerStats();
      if (response?.success) {
        setPlayerStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    {
      title: "Quick Thinker",
      description: "Complete a game in under 10 seconds",
      icon: <Timer className="w-6 h-6 text-yellow-400" />,
      progress: 75
    },
    {
      title: "Perfect Score",
      description: "Complete a game without any mistakes",
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      progress: 40
    },
    {
      title: "Math Master",
      description: "Complete 50 games on Hard difficulty",
      icon: <Brain className="w-6 h-6 text-yellow-400" />,
      progress: 60
    }
  ];

  const tutorialSteps = [
    {
      title: "Game Objective",
      content: "Solve mathematical puzzles by identifying the missing number in the sequence. The faster you solve, the higher your score!",
      icon: <Target className="w-8 h-8 text-yellow-400" />
    },
    {
      title: "Difficulty Levels",
      content: "Choose from three difficulty levels: Easy (40s), Medium (30s), and Hard (20s). Each level offers different time limits and scoring multipliers.",
      icon: <Brain className="w-8 h-8 text-yellow-400" />
    },
    {
      title: "Lives System",
      content: "You have limited attempts for each game session. Use them wisely! Wrong answers will decrease your remaining attempts.",
      icon: <Heart className="w-8 h-8 text-red-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-yellow-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative bg-gray-900/80 backdrop-blur-lg border-b border-yellow-500/20 p-4 shadow-lg z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Gamepad2 className="h-8 w-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-yellow-400 cursor-pointer" 
                onClick={() => onNavigate('dashboard')}>
               Golden Digits 🍌✨
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onNavigate('gameplay')}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 
                text-black font-bold hover:from-yellow-400 hover:to-yellow-500 
                transform hover:scale-105 transition-all duration-300"
            >
              PLAY NOW
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8 relative z-10">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-yellow-500/20 relative">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-yellow-500/50"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-yellow-500/50"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-yellow-500/50"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-yellow-500/50"></div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('tutorial')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'tutorial'
                  ? 'bg-yellow-500 text-black'
                  : 'text-yellow-400 hover:bg-yellow-500/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                <span>TUTORIAL</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'achievements'
                  ? 'bg-yellow-500 text-black'
                  : 'text-yellow-400 hover:bg-yellow-500/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5" />
                <span>ACHIEVEMENTS</span>
              </div>
            </button>
          </div>

          {/* Tutorial Content */}
          {activeTab === 'tutorial' && (
            <div className="space-y-8">
              {tutorialSteps.map((step, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-6 transform hover:scale-102 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">{step.title}</h3>
                      <p className="text-gray-300">{step.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Pro Tips</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-gray-300">
                    <ChevronRight className="w-5 h-5 text-yellow-400" />
                    Watch the timer and plan your moves accordingly
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <ChevronRight className="w-5 h-5 text-yellow-400" />
                    Start with Easy mode to learn the patterns
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <ChevronRight className="w-5 h-5 text-yellow-400" />
                    Practice mental math to improve your speed
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Achievements Content */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-yellow-400">{achievement.title}</h3>
                      <p className="text-gray-400 text-sm">{achievement.description}</p>
                    </div>
                    <div className="text-yellow-400 font-bold">
                      {achievement.progress}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {playerStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                    <Timer className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-200">{playerStats.totalGames}</div>
                    <div className="text-sm text-gray-400">Games Played</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                    <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-200">{playerStats.highScore}</div>
                    <div className="text-sm text-gray-400">Highest Score</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-200">{playerStats.perfectGames}</div>
                    <div className="text-sm text-gray-400">Perfect Games</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                    <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-200">{playerStats.totalAchievements}</div>
                    <div className="text-sm text-gray-400">Achievements</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameTutorial;