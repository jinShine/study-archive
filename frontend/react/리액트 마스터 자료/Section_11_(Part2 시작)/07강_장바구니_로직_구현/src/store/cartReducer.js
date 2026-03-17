import * as types from "./cartTypes";
export const initialCartState = { items: [] };
export function cartReducer(state, action) {
  switch (action.type) {
    case types.ADD_ITEM:
      return { ...state, items: [...state.items, action.payload] };
    case types.INCREMENT:
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    case types.DECREMENT:
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload
            ? { ...i, quantity: Math.max(1, i.quantity - 1) }
            : i
        ),
      };
    case types.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };
    default:
      return state;
  }
}
