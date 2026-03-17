import { useAuthState, useAuthDispatch } from "../contexts/AuthContext";
export default function Header() {
  const { user } = useAuthState();
  const dispatch = useAuthDispatch();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
      <span>{user ? `환영합니다, ${user.name}님!` : '로그인이 필요합니다.'}</span>
      <button onClick={() => dispatch({ type: user ? "LOGOUT" : "LOGIN" })}>
        {user ? "로그아웃" : "로그인"}
      </button>
    </div>
  );
}