import { useAuthState, useAuthDispatch } from "../contexts/AuthContext";
export default function UserProfile() {
  const { user } = useAuthState();
  const dispatch = useAuthDispatch();
  return (
    <div>
      {user ? (
        <><h3>안녕하세요, {user.name}님!</h3><button onClick={() => dispatch({ type: "LOGOUT" })}>로그아웃</button></>
      ) : (
        <button onClick={() => dispatch({ type: "LOGIN" })}>로그인</button>
      )}
    </div>
  );
}