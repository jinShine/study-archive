import { ACTIONS } from "./cafeteriaConstants";
export const addRice = (amount) => ({ type: ACTIONS.ADD_RICE, amount });
export const refillSoup = (amount) => ({ type: ACTIONS.REFILL_SOUP, amount });
export const changeSide = (newSide) => ({ type: ACTIONS.CHANGE_SIDE, newSide });
