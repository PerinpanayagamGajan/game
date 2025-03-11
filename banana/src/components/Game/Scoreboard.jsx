import React, { useState, useEffect } from 'react';
import { Play, LogOut, Trophy, Medal, Star, Gamepad2, Loader } from 'lucide-react';
import { scoreService, authService } from '../../services/api';

const AggregatedScoreboard = ({ onNavigate }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUserData();
    loadScores();
  }, [filter]);

  const loadUserData = () => {
    try {
      const userData = authService.getUser();
      if (userData) {
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      authService.logout();
    }
  };

  const loadScores = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      
      if (filter === 'all') {
        response = await scoreService.getScores();
      } else {
        if (!currentUser) {
          setError('Please log in to view your scores');
          setLoading(false);
          return;
        }
        response = await scoreService.getUserScores();
      }
      
      if (response?.success) {
        const aggregatedScores = aggregateScores(response.data || []);
        setScores(aggregatedScores);
      } else {
        throw new Error(response?.error || 'Failed to load scores');
      }
    } catch (error) {
      const errorMessage = error?.error || error?.message || 'Failed to load scores';
      setError(errorMessage);
      console.error('Score loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const aggregateScores = (scores = []) => {
    const groupedScores = scores.reduce((acc, score) => {
      const key = `${score.name}-${score.level}`;
      if (!acc[key]) {
        acc[key] = {
          name: score.name || 'Anonymous',
          level: score.level,
          totalScore: 0,
          totalAttempts: 0,
          lastPlayed: new Date(0)
        };
      }
      acc[key].totalScore += score.score;
      acc[key].totalAttempts += score.attempts;
      const scoreDate = new Date(score.date);
      if (scoreDate > acc[key].lastPlayed) {
        acc[key].lastPlayed = scoreDate;
      }
      return acc;
    }, {});

    return Object.values(groupedScores)
      .map(score => ({
        ...score,
        date: formatDate(score.lastPlayed)
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((score, index) => ({
        ...score,
        rank: index + 1
      }));
  };

  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    authService.logout();
    onNavigate('login');
  };

  if (filter === 'my-scores' && !currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-yellow-500/20 relative z-10">
          <p className="text-red-400 mb-4">Please log in to view your scores</p>
          <button 
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl
              hover:from-yellow-400 hover:to-yellow-500 transform hover:scale-105 transition-all duration-300"
          >
            RETURN TO LOGIN
          </button>
        </div>
      </div>
    );
  }

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
            {currentUser && (
              <button
                onClick={() => setFilter(filter === 'all' ? 'my-scores' : 'all')}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 
                  text-black font-bold hover:from-yellow-400 hover:to-yellow-500 
                  transform hover:scale-105 transition-all duration-300"
              >
                {filter === 'all' ? 'MY SCORES' : 'ALL SCORES'}
              </button>
            )}
            <button 
              onClick={() => onNavigate('gameplay')}
              className="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-all duration-300"
            >
              <Play className="h-5 w-5" />
              <span className="font-bold">PLAY NOW</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-all duration-300"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-bold">EXIT GAME</span>
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

          <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
            {filter === 'all' ? 'GLOBAL LEADERBOARD' : 'PERSONAL SCORES'}
          </h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader className="w-12 h-12 animate-spin text-yellow-400" />
              <div className="text-yellow-400 font-bold">LOADING SCORES...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No scores found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="px-6 py-3 text-center text-gray-400">RANK</th>
                    <th className="px-6 py-3 text-left text-gray-400">PLAYER</th>
                    <th className="px-6 py-3 text-center text-gray-400">LEVEL</th>
                    <th className="px-6 py-3 text-center text-gray-400">TOTAL SCORE</th>
                    <th className="px-6 py-3 text-center text-gray-400">ATTEMPTS</th>
                    <th className="px-6 py-3 text-center text-gray-400">LAST PLAYED</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <tr 
                      key={index}
                      className={`border-b border-gray-800 transition-all duration-300
                        ${currentUser?.name === score.name ? 'bg-yellow-500/5' : 'hover:bg-gray-800/50'}`}
                    >
                      <td className="px-6 py-4 text-center">
                        {score.rank <= 3 ? (
                          <div className="flex justify-center">
                            {score.rank === 1 && <Trophy className="h-6 w-6 text-yellow-400 animate-pulse" />}
                            {score.rank === 2 && <Medal className="h-6 w-6 text-gray-400" />}
                            {score.rank === 3 && <Medal className="h-6 w-6 text-yellow-700" />}
                          </div>
                        ) : (
                          <span className="text-gray-500">{`#${score.rank}`}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            currentUser?.name === score.name ? 'text-yellow-400' : 'text-gray-300'
                          }`}>
                            {score.name}
                          </span>
                          {currentUser?.name === score.name && (
                            <Star className="h-4 w-4 text-yellow-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                          score.level === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          score.level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {score.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-300">{score.totalScore}</td>
                      <td className="px-6 py-4 text-center text-gray-400">{score.totalAttempts}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{score.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AggregatedScoreboard;