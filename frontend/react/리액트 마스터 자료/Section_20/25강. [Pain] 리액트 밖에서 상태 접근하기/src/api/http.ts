/* [ERROR CASE]: 훅 규칙 위반 재현 */
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const http = axios.create({ baseURL: '<https://jsonplaceholder.typicode.com>' });

http.interceptors.request.use((config) => {
  // 🚨 여기서 에러 발생: 컴포넌트 밖에서 훅을 호출할 수 없습니다.
  try {
    const token = useAuthStore((state) => state.token);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.error("🚨 아키텍처 단절 발생:", e.message);
  }
  return config;
});
export default http;