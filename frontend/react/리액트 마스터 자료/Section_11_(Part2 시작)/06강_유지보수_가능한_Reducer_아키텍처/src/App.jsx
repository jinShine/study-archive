import { useReducer } from "react";
import { rootReducer } from "./reducers/rootReducer";
import { initialRiceState } from "./reducers/rice/riceReducer";
import {
  addRice,
  removeRice,
  setRiceWarning,
} from "./reducers/rice/riceActions";
export default function App() {
  const [state, dispatch] = useReducer(rootReducer, { rice: initialRiceState });
  return (
    <div style={{ padding: "20px" }}>
      <h1>🍱 아키텍처 기반 시스템</h1>
      <p>재고: {state.rice.stock}</p>
      {state.rice.stock < 5 && (
        <p style={{ color: "red" }}>{state.rice.warning}</p>
      )}
      <button onClick={() => dispatch(addRice())}>추가</button>
      <button onClick={() => dispatch(removeRice())}>제거</button>
      <button onClick={() => dispatch(setRiceWarning("재고부족 알림"))}>
        경고 설정
      </button>
    </div>
  );
}
