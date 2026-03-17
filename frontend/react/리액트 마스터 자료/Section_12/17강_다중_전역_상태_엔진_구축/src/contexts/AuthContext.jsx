import { createContext, useReducer, useMemo } from "react";
export const AuthStateContext = createContext();
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN": return { user: { name: "정용수" } };
    case "LOGOUT": return { user: null };
    default: return state;
  }
};
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, { user: null });
  return (
    <AuthStateContext.Provider value={state}>
      <button onClick={() => dispatch({ type: state.user ? "LOGOUT" : "LOGIN" })}>
        {state.user ? "로그아웃" : "로그인"}
      </button>
      {children}
    </AuthStateContext.Provider>
  );
}