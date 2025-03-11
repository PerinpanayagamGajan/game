import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, Gamepad2, Loader } from 'lucide-react';
import { authService } from '../../services/api';

const SignUp = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await authService.register(
        formData.name,
        formData.email,
        formData.password
      );
      onNavigate('dashboard');
    } catch (error) {
      setApiError(
        error.response?.data?.error || 
        'Failed to register. Please try again.'
      );
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
          <h1 className="text-3xl font-bold text-yellow-400 mb-2 text-center"> Golden Digits 🍌✨</h1>
          <p className="text-yellow-500/60 text-sm uppercase tracking-wider">Create New Player Account</p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div className="space-y-2">
            <div className={`relative transition-all duration-300 ${
              focusedField === 'name' ? 'transform scale-102' : ''
            }`}>
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === 'name' ? 'text-yellow-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={`w-full bg-gray-800/50 border ${errors.name ? 'border-red-500' : 'border-gray-700'} 
                  rounded-xl px-12 py-4 text-gray-100 placeholder-gray-500 
                  focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800/80 transition-all duration-300`}
                placeholder="Enter your player name"
              />
            </div>
            {errors.name && (
              <p className="text-red-400 text-sm pl-4">{errors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-2">
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
                className={`w-full bg-gray-800/50 border ${errors.email ? 'border-red-500' : 'border-gray-700'} 
                  rounded-xl px-12 py-4 text-gray-100 placeholder-gray-500 
                  focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800/80 transition-all duration-300`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm pl-4">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
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
                className={`w-full bg-gray-800/50 border ${errors.password ? 'border-red-500' : 'border-gray-700'} 
                  rounded-xl px-12 py-4 text-gray-100 placeholder-gray-500 
                  focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800/80 transition-all duration-300`}
                placeholder="Create your password"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm pl-4">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <div className={`relative transition-all duration-300 ${
              focusedField === 'confirmPassword' ? 'transform scale-102' : ''
            }`}>
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === 'confirmPassword' ? 'text-yellow-400' : 'text-gray-500'
              }`} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className={`w-full bg-gray-800/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} 
                  rounded-xl px-12 py-4 text-gray-100 placeholder-gray-500 
                  focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800/80 transition-all duration-300`}
                placeholder="Confirm your password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm pl-4">{errors.confirmPassword}</p>
            )}
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
                CREATING ACCOUNT...
              </span>
            ) : (
              'JOIN THE GAME'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already a Player?{' '}
            <button
              onClick={() => onNavigate('login')}
              disabled={loading}
              className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors duration-300"
            >
              LOGIN NOW
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

export default SignUp;