import { useReducer } from "react";

function cafeteriaReducer(state, action) {
  switch (action.type) {
    case "INCREASE":
      return state + 1;
    case "DECREASE":
      return state > 0 ? state - 1 : 0;
    default:
      return state;
  }
}

export default function CafeteriaPage() {
  const [count, dispatch] = useReducer(cafeteriaReducer, 0);
  return (
    <div
      style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <h1>🍱 급식실 재고 관리 시스템</h1>
      <div
        style={{
          fontSize: "3rem",
          margin: "20px",
          padding: "20px",
          background: "#f8fafc",
          borderRadius: "15px",
          border: "2px solid #e2e8f0",
        }}
      >
        {count}
      </div>
      <button
        onClick={() => dispatch({ type: "INCREASE" })}
        style={{
          fontSize: "1.2rem",
          padding: "10px 20px",
          marginRight: "10px",
          cursor: "pointer",
        }}
      >
        밥 추가
      </button>
      <button
        onClick={() => dispatch({ type: "DECREASE" })}
        style={{ fontSize: "1.2rem", padding: "10px 20px", cursor: "pointer" }}
      >
        배식 완료
      </button>
    </div>
  );
}
