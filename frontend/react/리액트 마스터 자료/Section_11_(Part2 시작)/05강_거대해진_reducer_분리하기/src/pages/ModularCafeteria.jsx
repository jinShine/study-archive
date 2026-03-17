import { useReducer } from "react";
import { cafeteriaReducer } from "../store/cafeteriaReducer";
import { addRice, refillSoup, changeSide } from "../store/cafeteriaActions";
export default function ModularCafeteria() {
  const [state, dispatch] = useReducer(cafeteriaReducer, {
    rice: 20,
    soup: 30,
    side: "김치",
  });
  return (
    <div style={{ padding: "20px" }}>
      <h1>🍱 모듈화 급식실</h1>
      <p>
        밥: {state.rice}{" "}
        <button onClick={() => dispatch(addRice(10))}>+10</button>
      </p>
      <p>
        국: {state.soup}{" "}
        <button onClick={() => dispatch(refillSoup(5))}>+5</button>
      </p>
      <p>
        반찬: {state.side}{" "}
        <button onClick={() => dispatch(changeSide("장조림"))}>교체</button>
      </p>
    </div>
  );
}
