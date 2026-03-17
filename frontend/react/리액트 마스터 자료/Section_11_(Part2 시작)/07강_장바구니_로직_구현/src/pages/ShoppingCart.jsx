import { useReducer } from "react";
import { cartReducer, initialCartState } from "../store/cartReducer";
import * as types from "../store/cartTypes";
export default function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const addItem = () =>
    dispatch({
      type: types.ADD_ITEM,
      payload: { id: Date.now(), name: "사과", price: 3000, quantity: 1 },
    });
  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 장바구니</h1>
      <button onClick={addItem}>추가</button>
      {state.items.map((item) => (
        <div
          key={item.id}
          style={{ display: "flex", gap: "10px", marginTop: "10px" }}
        >
          <span>
            {item.name} ({item.quantity})
          </span>
          <button
            onClick={() =>
              dispatch({ type: types.INCREMENT, payload: item.id })
            }
          >
            +
          </button>
          <button
            onClick={() =>
              dispatch({ type: types.DECREMENT, payload: item.id })
            }
          >
            -
          </button>
          <button
            onClick={() =>
              dispatch({ type: types.REMOVE_ITEM, payload: item.id })
            }
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}
