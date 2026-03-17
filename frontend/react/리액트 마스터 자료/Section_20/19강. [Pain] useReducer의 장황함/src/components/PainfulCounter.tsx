/* [Copyright]: © nhcodingstudio 소유 */
import React, { useReducer } from 'react';

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'UPDATE_MESSAGE'; payload: string };

interface State { count: number; message: string; }
const initialState: State = { count: 0, message: '안녕!' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT': return { ...state, count: state.count + 1 };
    case 'DECREMENT': return { ...state, count: state.count - 1 };
    case 'UPDATE_MESSAGE': return { ...state, message: action.payload };
    default: return state;
  }
}

export function PainfulCounter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <div style={{ padding: '30px', border: '2px solid gray' }}>
      <h3>useReducer: 장황한 서류 작업의 현장</h3>
      <p>Count: {state.count} | Msg: {state.message}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>증가</button>
      <button onClick={() => dispatch({ type: 'UPDATE_MESSAGE', payload: 'Zustand로 가고 싶어요' })}>메시지 변경</button>
    </div>
  );
}