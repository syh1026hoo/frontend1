import axios from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ETF 관련 API
export const etfApi = {
  // 대시보드 데이터
  getDashboardData: () => api.get('/api/dashboard'),
  
  // 랭킹 데이터
  getRankings: (type: string = 'gainers') => api.get(`/api/rankings?type=${type}`),
  
  // 검색
  searchEtfs: (keyword: string) => api.get(`/api/search?keyword=${encodeURIComponent(keyword)}`),
  
  // 테마
  getThemes: () => api.get('/api/themes'),
  getThemeDetail: (theme: string) => api.get(`/api/themes/${encodeURIComponent(theme)}`),
  
  // ETF 상세
  getEtfDetail: (isinCd: string) => api.get(`/api/etf/${encodeURIComponent(isinCd)}`),
};

// 사용자 관련 API
export const userApi = {
  login: (data: { username: string; password: string }) => 
    api.post('/api/users/login', new URLSearchParams({
      usernameOrEmail: data.username,
      password: data.password
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }),
  
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/api/users', new URLSearchParams({
      username: data.username,
      email: data.email,
      fullName: data.username, // fullName을 username과 동일하게 설정
      password: data.password
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }),
  
  getUserInfo: (userId: string) => api.get(`/api/users/${userId}`),
};

// 관심종목 관련 API
export const watchlistApi = {
  getWatchlist: (userId: number, includeEtfInfo: boolean = true) => 
    api.get(`/api/watchlist?userId=${userId}&includeEtfInfo=${includeEtfInfo}`),
  
  addToWatchlist: (data: { userId: number; isinCd: string; memo?: string }) =>
    api.post('/api/watchlist', new URLSearchParams({
      userId: data.userId.toString(),
      isinCd: data.isinCd,
      memo: data.memo || ''
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }),
  
  removeFromWatchlist: (watchlistId: number) => 
    api.delete(`/api/watchlist/${watchlistId}`),
  
  getPopularEtfs: (limit: number = 5) => 
    api.get(`/api/watchlist/popular?limit=${limit}`),
  
  getStatistics: (userId: number) => 
    api.get(`/api/watchlist/statistics?userId=${userId}`),
};

export default api;
