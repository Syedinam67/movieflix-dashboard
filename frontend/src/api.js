import axios from 'axios';

// In Vercel, everything is served from the same domain
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const movieApi = {
  getTrending: () => api.get('/trending'),
  getPopular: () => api.get('/popular'),
  searchMovies: (query) => api.get(`/search?q=${query}`),
  getMovieDetails: (id) => api.get(`/movie/${id}`),
  getMoviesByGenre: (genreId) => api.get(`/movies/genre/${genreId}`),
  getTvShows: () => api.get('/tv-shows'),
  getMovies: () => api.get('/movies'),
};

export const authApi = {
  signup: (userData) => api.post('/signup', userData),
  login: (credentials) => api.post('/login', credentials),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (data) => api.post('/reset-password', data),
  googleLogin: (credential) => api.post('/google-login', { credential }),
};

export default api;
