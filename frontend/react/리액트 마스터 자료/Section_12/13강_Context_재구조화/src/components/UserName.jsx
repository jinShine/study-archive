import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
export function UserName() {
  const userName = useContext(UserContext);
  return <div>Welcome, {userName}!</div>;
}