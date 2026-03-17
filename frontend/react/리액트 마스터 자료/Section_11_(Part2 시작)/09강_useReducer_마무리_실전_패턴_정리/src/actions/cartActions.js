export const ADD = "add"; export const REMOVE = "remove"; export const INCREMENT = "increment"; export const DECREMENT = "decrement";
export const addItem = (item) => ({ type: ADD, item });
export const removeItem = (id) => ({ type: REMOVE, id });
export const increment = (id) => ({ type: INCREMENT, id });
export const decrement = (id) => ({ type: DECREMENT, id });