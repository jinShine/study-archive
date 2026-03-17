import { ADD, REMOVE, INCREMENT, DECREMENT } from "../actions/cartActions";
export function cartReducer(state, action) {
  switch (action.type) {
    case ADD: return [...state, action.item];
    case REMOVE: return state.filter((p) => p.id !== action.id);
    case INCREMENT: return state.map((p) => p.id === action.id ? { ...p, quantity: p.quantity + 1 } : p);
    case DECREMENT: return state.map((p) => p.id === action.id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p);
    default: return state;
  }
}