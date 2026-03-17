import axios from 'axios';
import { authStore } from '../store/authStore';

const http = axios.create({ baseURL: '<https://jsonplaceholder.typicode.com>' });

http.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log("✅ 요청 인터셉터: 토큰 주입 성공");
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      authStore.setState({ token: null, isLoggedIn: false });
    }
    return Promise.reject(err);
  }
);
export default http;