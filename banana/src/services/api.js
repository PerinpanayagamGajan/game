import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
      return Promise.reject({ success: false, error: 'Session expired. Please login again.' });
    }

    // Handle other errors
    const errorMessage = error.response?.data?.error || error.message;
    console.error('API Error:', errorMessage);
    return Promise.reject({ 
      success: false, 
      error: errorMessage 
    });
  }
);

export const authService = {
  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password 
      });
      
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          id: response.data.id
        }));
      }
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          id: response.data.id
        }));
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  getUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};

export const gameService = {
  startGame: async (level) => {
    try {
      const response = await api.post('/game/start', { level });
      return response;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },

  submitAnswer: async (gameId, answer) => {
    try {
      const response = await api.post('/game/submit', { 
        gameId, 
        answer: parseInt(answer)
      });
      return response;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }
};

export const scoreService = {
  getScores: async () => {
    try {
      const response = await api.get('/scores');
      return response;
    } catch (error) {
      console.error('Error fetching scores:', error);
      throw error;
    }
  },

  getUserScores: async () => {
    try {
      const response = await api.get('/scores/user');
      return response;
    } catch (error) {
      console.error('Error fetching user scores:', error);
      throw error;
    }
  },

  submitScore: async (scoreData) => {
    try {
      const response = await api.post('/scores', {
        userId: scoreData.userId,
        gameId: scoreData.gameId,
        score: scoreData.score
      });
      return response;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }
};

export const statsService = {
  getPlayerStats: async () => {
    try {
      const response = await api.get('/stats/player');
      return response;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  },

  getAchievements: async () => {
    try {
      const response = await api.get('/stats/achievements');
      return response;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },

  updateAchievement: async (achievementId) => {
    try {
      const response = await api.post('/stats/achievements/update', {
        achievementId
      });
      return response;
    } catch (error) {
      console.error('Error updating achievement:', error);
      throw error;
    }
  },

  getDailyStats: async () => {
    try {
      const response = await api.get('/stats/daily');
      return response;
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      throw error;
    }
  },

  getGameHistory: async (limit = 10) => {
    try {
      const response = await api.get('/stats/history', {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Error fetching game history:', error);
      throw error;
    }
  },

  getLevelProgress: async () => {
    try {
      const response = await api.get('/stats/progress');
      return response;
    } catch (error) {
      console.error('Error fetching level progress:', error);
      throw error;
    }
  }
};