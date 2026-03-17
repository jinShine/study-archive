import { useReducer } from 'react';

function cafeteriaReducer(state, action) {
  switch (action.type) {
    case 'ADD_RICE':
      return { ...state, rice: state.rice + action.payload.amount };
    case 'REFILL_SOUP':
      return { ...state, soup: state.soup + action.payload.amount };
    case 'CHANGE_SIDE':
      return { ...state, side: action.payload.newSide };
    default:
      return state;
  }
}

export default function AdvancedCafeteria() {
  const initialState = { rice: 20, soup: 30, side: "김치" };
  const [state, dispatch] = useReducer(cafeteriaReducer, initialState);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>🏛️ 중앙 관리 급식실 (Advanced)</h1>
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #ddd' }}>
        <p>🍚 밥: {state.rice}인분</p>
        <button onClick={() => dispatch({ type: 'ADD_RICE', payload: { amount: 10 } })}>+ 10인분</button>
        <p>🍲 국: {state.soup}인분</p>
        <button onClick={() => dispatch({ type: 'REFILL_SOUP', payload: { amount: 5 } })}>+ 5인분</button>
        <p>🍱 반찬: {state.side}</p>
        <button onClick={() => dispatch({ type: 'CHANGE_SIDE', payload: { newSide: "장조림" } })}>장조림으로 교체</button>
      </div>
    </div>
  );
}