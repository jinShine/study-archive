import { createContext, useReducer, useMemo } from "react";
export const AuthStateContext = createContext();
export const AuthDispatchContext = createContext();
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START": return { ...state, isLoading: true };
    case "LOGIN_SUCCESS": return { user: action.payload, isLoading: false, error: null };
    case "LOGOUT": return { user: null, isLoading: false, error: null };
    default: return state;
  }
};
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, { user: null, isLoading: false, error: null });
  const memoizedState = useMemo(() => state, [state]);
  return (
    <AuthStateContext.Provider value={memoizedState}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}