import { UserContext } from "./UserContext";
export function UserProvider({ children }) {
  const userName = "chulsoo";
  return <UserContext.Provider value={userName}>{children}</UserContext.Provider>;
}