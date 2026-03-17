import { useState } from "react";

export default function CartPage() {
  const [items, setItems] = useState([
    { id: 1, name: "고성능 키보드", price: 150000 },
  ]);
  const [totalPrice, setTotalPrice] = useState(150000);
  const handleAddToCart = () => {
    const newItem = { id: Date.now(), name: "추가 상품", price: 50000 };
    setItems((p) => [...p, newItem]);
    setTotalPrice((p) => p + 50000);
  };
  const handleRemoveItem = (id, price) => {
    setItems((p) => p.filter((i) => i.id !== id));
    setTotalPrice((p) => p - price);
  };
  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 장바구니 (useState)</h1>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            {i.name} ({i.price}원){" "}
            <button onClick={() => handleRemoveItem(i.id, i.price)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
      <h2>총합: {totalPrice.toLocaleString()}원</h2>
      <button onClick={handleAddToCart}>추가</button>
    </div>
  );
}
