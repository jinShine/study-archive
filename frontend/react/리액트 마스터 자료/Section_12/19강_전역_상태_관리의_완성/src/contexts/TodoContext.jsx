import { createContext, useReducer, useContext, useMemo } from "react";
const TodoStateContext = createContext();
const TodoDispatchContext = createContext();
const todoReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TODO": return { ...state, todos: [...state.todos, { id: Date.now(), text: action.payload, completed: false }] };
    case "TOGGLE_TODO": return { ...state, todos: state.todos.map(t => t.id === action.payload ? { ...t, completed: !t.completed } : t) };
    default: return state;
  }
};
export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] });
  const memoizedState = useMemo(() => state, [state]);
  return (
    <TodoStateContext.Provider value={memoizedState}>
      <TodoDispatchContext.Provider value={dispatch}>{children}</TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}
export const useTodoState = () => useContext(TodoStateContext);
export const useTodoDispatch = () => useContext(TodoDispatchContext);