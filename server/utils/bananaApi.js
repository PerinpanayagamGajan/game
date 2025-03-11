const axios = require('axios');
const { BANANA_API_URL } = require('../config/config');

const getBananaQuestion = async () => {
  try {
    const response = await axios.get(BANANA_API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch banana question');
  }
};

module.exports = { getBananaQuestion };
