import { useReducer } from 'react';
function cartReducer(state, action) {
  switch (action.type) {
    case 'INCREASE_QTY':
      return {
        ...state,
        items: state.items.map(item => item.id === action.payload.id ? { ...item, qty: item.qty + 1 } : item),
        totalPrice: state.totalPrice + action.payload.price,
        discount: Math.max(0, state.discount - 500)
      };
    default: return state;
  }
}
export default function ReducerCartPage() {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [{ id: 1, name: "고성능 키보드", price: 150000, qty: 1 }, { id: 2, name: "무선 마우스", price: 80000, qty: 1 }],
    totalPrice: 230000,
    discount: 10000
  });
  return (
    <div style={{ padding: '20px' }}>
      <h1>🛒 장바구니 (useReducer)</h1>
      <ul>{state.items.map(item => (
        <li key={item.id}>{item.name} (수량: {item.qty}) 
          <button onClick={() => dispatch({ type: 'INCREASE_QTY', payload: { id: item.id, price: item.price } })}>+ 추가</button>
        </li>
      ))}</ul>
      <div style={{ marginTop: '20px', padding: '10px', background: '#eee' }}>
        <p>총 합계: {state.totalPrice.toLocaleString()}원</p>
        <p>할인: -{state.discount.toLocaleString()}원</p>
        <h3>최종: {(state.totalPrice - state.discount).toLocaleString()}원</h3>
      </div>
    </div>
  );
}