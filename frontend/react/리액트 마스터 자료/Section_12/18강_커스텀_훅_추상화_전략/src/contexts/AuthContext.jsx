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
  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>{children}</AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}
export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (context === undefined) throw new Error("AuthProvider 내에서 사용하세요");
  return context;
}
export function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);
  if (context === undefined) throw new Error("AuthProvider 내에서 사용하세요");
  return context;
}