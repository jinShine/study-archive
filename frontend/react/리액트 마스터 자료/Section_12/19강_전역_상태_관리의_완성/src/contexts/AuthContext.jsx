import { createContext, useReducer, useContext, useMemo } from "react";
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();
const authReducer = (state, action) => {
  if (action.type === "LOGIN") return { user: { name: "정용수" }, isLoading: false };
  if (action.type === "LOGOUT") return { user: null, isLoading: false };
  return state;
};
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, { user: null, isLoading: false });
  const memoizedState = useMemo(() => state, [state]);
  return (
    <AuthStateContext.Provider value={memoizedState}>
      <AuthDispatchContext.Provider value={dispatch}>{children}</AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}
export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);