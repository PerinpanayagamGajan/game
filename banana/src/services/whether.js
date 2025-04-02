// src/services/weatherService.js
const WEATHER_API_KEY = 'ee97e106d37648218da55249253003'; // Your WeatherAPI.com API key

export const weatherService = {
  /**
   * Get current weather data based on user's location
   * @returns {Promise} Weather data object
   */
  getCurrentWeather: async () => {
    try {
      // First, get user's coordinates
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Fetch weather data from WeatherAPI.com
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&aqi=no`
      );
      
      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }
      
      const data = await response.json();
      
      // Extract relevant weather info
      const weatherData = {
        condition: data.current.condition.text, // Clear, Cloudy, Rainy, etc.
        icon: data.current.condition.icon, // Icon URL from API
        description: data.current.condition.text,
        temperature: data.current.temp_c,
        city: data.location.name,
        country: data.location.country,
        isDay: data.current.is_day // 1 for day, 0 for night
      };
      
      // Cache the weather data with timestamp
      localStorage.setItem('weatherData', JSON.stringify({
        ...weatherData,
        timestamp: Date.now()
      }));
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Try to get cached weather if available
      const cachedData = localStorage.getItem('weatherData');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      // Return default weather if all else fails
      return {
        condition: 'Sunny',
        icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        description: 'Sunny',
        temperature: 20,
        city: 'Unknown',
        country: 'Unknown',
        isDay: 1
      };
    }
  },
  
  /**
   * Get weather-based theme settings for the game
   * @param {Object} weatherData - Weather data object
   * @returns {Object} Theme configuration based on weather
   */
  getWeatherTheme: (weatherData) => {
    // Map WeatherAPI condition text to our theme categories
    const mapConditionToEffect = (condition, isDay) => {
      // Convert condition to lowercase for easier matching
      const conditionLower = condition.toLowerCase();
      
      // Night-time conditions
      if (!isDay) {
        return 'night';
      }
      
      // Day conditions
      if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
        return 'sunny';
      } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
        return 'cloudy';
      } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
        return 'rainy';
      } else if (conditionLower.includes('snow') || conditionLower.includes('sleet') || conditionLower.includes('ice')) {
        return 'snowy';
      } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
        return 'stormy';
      } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
        return 'foggy';
      }
      
      return 'normal';
    };
    
    // Define theme settings based on weather conditions
    const themes = {
      // Sunny
      sunny: {
        background: 'from-blue-900 via-black to-black',
        particles: 'bg-yellow-500/30',
        accent: 'yellow',
        borderColor: 'border-yellow-500/20',
        navIcon: 'text-yellow-400',
        effect: 'sunny',
        ambientSound: 'ambient-day.mp3'
      },
      // Cloudy
      cloudy: {
        background: 'from-gray-700 via-gray-900 to-black',
        particles: 'bg-gray-400/30',
        accent: 'blue',
        borderColor: 'border-blue-500/20',
        navIcon: 'text-blue-400',
        effect: 'cloudy',
        ambientSound: 'ambient-wind.mp3'
      },
      // Rainy
      rainy: {
        background: 'from-blue-800 via-gray-900 to-black',
        particles: 'bg-blue-400/40',
        accent: 'blue',
        borderColor: 'border-blue-500/20',
        navIcon: 'text-blue-400',
        effect: 'rainy',
        ambientSound: 'ambient-rain.mp3'
      },
      // Thunderstorm
      stormy: {
        background: 'from-purple-900 via-gray-900 to-black',
        particles: 'bg-purple-500/30',
        accent: 'purple',
        borderColor: 'border-purple-500/20',
        navIcon: 'text-purple-400',
        effect: 'stormy',
        ambientSound: 'ambient-thunder.mp3'
      },
      // Snow
      snowy: {
        background: 'from-indigo-900 via-gray-900 to-black',
        particles: 'bg-white/60',
        accent: 'indigo',
        borderColor: 'border-indigo-500/20',
        navIcon: 'text-indigo-400',
        effect: 'snowy',
        ambientSound: 'ambient-snow.mp3'
      },
      // Mist/Fog
      foggy: {
        background: 'from-gray-800 via-gray-900 to-black',
        particles: 'bg-gray-300/20',
        accent: 'gray',
        borderColor: 'border-gray-500/20',
        navIcon: 'text-gray-400',
        effect: 'foggy',
        ambientSound: 'ambient-fog.mp3'
      },
      // Night
      night: {
        background: 'from-indigo-950 via-gray-950 to-black',
        particles: 'bg-blue-300/20',
        accent: 'indigo',
        borderColor: 'border-indigo-500/20',
        navIcon: 'text-indigo-400',
        effect: 'night',
        ambientSound: 'ambient-night.mp3'
      },
      // Default theme (fallback)
      normal: {
        background: 'from-gray-900 via-black to-black',
        particles: 'bg-yellow-500/30',
        accent: 'yellow',
        borderColor: 'border-yellow-500/20',
        navIcon: 'text-yellow-400',
        effect: 'normal',
        ambientSound: 'ambient-default.mp3'
      }
    };
    
    // Determine weather effect
    const effect = mapConditionToEffect(weatherData.condition, weatherData.isDay);
    
    // Return the theme for this condition
    return {
      ...themes[effect] || themes.normal,
      currentWeather: weatherData
    };
  }
};