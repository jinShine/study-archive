import { useContext } from "react";
import { CounterContext } from "../contexts/CounterContext";
export default function CounterScreen() {
  const { state, dispatch } = useContext(CounterContext);
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>전역 카운트: {state}</h1>
      <button onClick={() => dispatch({ type: "increment" })}>증가 (+)</button>
      <button onClick={() => dispatch({ type: "decrement" })}>감소 (-)</button>
    </div>
  );
}