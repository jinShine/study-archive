import React, { useReducer } from "react";
import { initialCart } from "./data/initialCart";
import { cartReducer } from "./reducers/cartReducer";
import { CartItem } from "./components/CartItem";
import { increment, decrement, removeItem } from "./actions/cartActions";
export function CartApp() {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);
  return (
    <div>
      <h2>실전 패턴 장바구니</h2>
      {cart.map((p) => (
        <CartItem key={p.id} item={p} onIncrement={() => dispatch(increment(p.id))} onDecrement={() => dispatch(decrement(p.id))} onRemove={() => dispatch(removeItem(p.id))} />
      ))}
    </div>
  );
}