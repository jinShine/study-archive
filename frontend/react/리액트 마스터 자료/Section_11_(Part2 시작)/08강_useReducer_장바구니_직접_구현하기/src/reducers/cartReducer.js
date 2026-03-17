export function cartReducer(state, action) {
  if (action.type === "add") return [...state, action.item];
  if (action.type === "remove") return state.filter((p) => p.id !== action.id);
  if (action.type === "increment") return state.map((p) => p.id === action.id ? { ...p, quantity: p.quantity + 1 } : p);
  if (action.type === "decrement") return state.map((p) => p.id === action.id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p);
  return state;
}