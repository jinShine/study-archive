import { useContext } from "react"; import { AuthContext } from "../contexts/AuthContext";
export default function LoginButton() {
  const { isLoading, dispatch, user } = useContext(AuthContext);
  const handleLogin = async () => {
    dispatch({ type: "LOGIN_START" });
    await new Promise(res => setTimeout(res, 1500));
    dispatch({ type: "LOGIN_SUCCESS", payload: { name: "정용수" } });
  };
  if (user) return <button onClick={() => dispatch({ type: "LOGOUT" })}>로그아웃 ({user.name})</button>;
  return <button onClick={handleLogin} disabled={isLoading}>{isLoading ? "인증 중..." : "로그인"}</button>;
}