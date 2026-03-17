import { useReducer } from "react";
import { CounterContext } from "./CounterContext";
import { counterReducer } from "./counterReducer";
export function CounterProvider({ children }) {
  const [state, dispatch] = useReducer(counterReducer, 0);
  return <CounterContext.Provider value={{ state, dispatch }}>{children}</CounterContext.Provider>;
}