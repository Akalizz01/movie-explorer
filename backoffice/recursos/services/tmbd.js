const axios = require('axios');

const TMDB_API_KEY = "784042639a06c6a718c60922ab2a4a63";
const BASE_URL = 'https://api.themoviedb.org/3';

async function searchMovies(query) {
  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: 'pt-PT'
      }
    });
    return response.data.results;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function searchSeries(query) {
  try {
    const response = await axios.get(`${BASE_URL}/search/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: 'pt-PT'
      }
    });
    return response.data.results;
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { searchMovies, searchSeries };
