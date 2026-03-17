import { createContext, useReducer } from "react";
import { todoReducer } from "./todoReducer";
export const TodoStateContext = createContext();
export const TodoDispatchContext = createContext();
export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] });
  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}