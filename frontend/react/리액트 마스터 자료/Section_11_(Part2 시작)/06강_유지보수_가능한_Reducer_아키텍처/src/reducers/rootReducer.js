import { riceReducer } from "./rice/riceReducer";
export function rootReducer(state, action) {
  return { rice: riceReducer(state.rice, action) };
}
