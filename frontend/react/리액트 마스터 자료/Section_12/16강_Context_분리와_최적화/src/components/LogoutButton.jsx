import { useContext } from "react"; import { AuthDispatchContext } from "../contexts/AuthContext";
export default function LogoutButton() {
  const dispatch = useContext(AuthDispatchContext);
  console.log("최적화 확인: LogoutButton 렌더링됨");
  return <button onClick={() => dispatch({ type: "LOGOUT" })}>로그아웃</button>;
}