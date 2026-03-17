import React, { useReducer } from "react";
import { initialCart } from "./data/initialCart";
import { cartReducer } from "./reducers/cartReducer";
import { CartItem } from "./components/CartItem";
export function CartApp() {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);
  const handleAdd = () => dispatch({ type: "add", item: { id: Date.now(), name: "새 상품", price: 2000, quantity: 1 } });
  const handleRemove = (id) => dispatch({ type: "remove", id });
  const handleIncrement = (id) => dispatch({ type: "increment", id });
  const handleDecrement = (id) => dispatch({ type: "decrement", id });
  return (
    <div style={{ padding: "20px" }}>
      <h2>장바구니</h2>
      <button onClick={handleAdd}>상품 추가</button>
      {cart.map((p) => (
        <CartItem key={p.id} item={p} onIncrement={() => handleIncrement(p.id)} onDecrement={() => handleDecrement(p.id)} onRemove={() => handleRemove(p.id)} />
      ))}
    </div>
  );
}