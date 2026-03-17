/* [Copyright]: © nhcodingstudio 소유 */
import React from 'react';
import { useUserStore } from './store/useUserStore';

export default function App() {
  const { username, points, increasePoints, resetUser } = useUserStore();

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>17강: create, set, get 실습</h1>
      <p>사용자: {username} | 포인트: {points}</p>
      <button onClick={() => increasePoints(10)}>포인트 +10 (set)</button>
      <button onClick={resetUser}>초기화 및 로그 출력 (get & set)</button>
    </div>
  );
}
