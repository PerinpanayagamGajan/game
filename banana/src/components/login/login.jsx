import React, { useState, useEffect } from 'react';
import { Mail, Lock,Loader,Gamepad2  } from 'lucide-react';
import { authService } from '../../services/api';

const Login = ({ onNavigate }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Check for existing authentication on component mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      onNavigate('dashboard');
    }
  }, [onNavigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-yellow-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl w-full max-w-md p-8 border border-yellow-500/20">
        {/* Header with gaming style */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl rotate-45 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Gamepad2 className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2 text-center">Golden Digits 🍌✨</h1>
          <p className="text-yellow-500/60 text-sm uppercase tracking-wider">Player Login</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-center text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className={`relative transition-all duration-300 ${
              focusedField === 'email' ? 'transform scale-102' : ''
            }`}>
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === 'email' ? 'text-yellow-400' : 'text-gray-500'
              }`} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-12 py-4 text-gray-100 placeholder-gray-500 
                  focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800/80 transition-all duration-300"
                placeholder="Enter your email"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <div className={`relative transition-all duration-300 ${
              focusedField === 'password' ? 'transform scale-102' : ''
            }`}>
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === 'password' ? 'text-yellow-400' : 'text-gray-500'
              }`} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-12 py-4 text-gray-100 placeholder-gray-500 
                  focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800/80 transition-all duration-300"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-4 rounded-xl font-bold 
              hover:from-yellow-400 hover:to-yellow-500 transform hover:scale-105 transition-all duration-300 
              disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
              shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin mr-2" />
                LOGGING IN...
              </span>
            ) : (
              'START GAME'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            New Player?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors duration-300"
            >
              CREATE ACCOUNT
            </button>
          </p>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-yellow-500/50"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-yellow-500/50"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-yellow-500/50"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-yellow-500/50"></div>
      </div>
    </div>
  );
};

export default Login;