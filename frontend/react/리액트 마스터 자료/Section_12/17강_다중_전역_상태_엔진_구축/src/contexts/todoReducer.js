export function todoReducer(state, action) {
  if (action.type === "ADD_TODO") return { ...state, todos: [...state.todos, action.payload] };
  return state;
}