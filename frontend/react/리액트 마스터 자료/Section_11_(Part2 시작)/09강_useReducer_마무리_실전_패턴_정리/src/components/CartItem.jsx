import React from "react";
export function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div style={{ marginBottom: "12px", border: "1px solid #ddd", padding: "10px" }}>
      <p>{item.name} ({item.price}원)</p>
      <p>수량: {item.quantity}</p>
      <button onClick={onIncrement}>+</button> <button onClick={onDecrement}>-</button> <button onClick={onRemove}>삭제</button>
    </div>
  );
}