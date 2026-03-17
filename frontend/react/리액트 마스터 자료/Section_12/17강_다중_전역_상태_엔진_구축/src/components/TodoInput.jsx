import { useContext, useState } from "react";
import { AuthStateContext } from "../contexts/AuthContext";
import { TodoDispatchContext, TodoStateContext } from "../contexts/TodoProvider";
export default function TodoInput() {
  const [text, setText] = useState("");
  const { user } = useContext(AuthStateContext);
  const { todos } = useContext(TodoStateContext);
  const dispatch = useContext(TodoDispatchContext);
  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => {
        if(!user) return alert("로그인 필요");
        dispatch({ type: "ADD_TODO", payload: text });
        setText("");
      }}>추가</button>
      <ul>{todos.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}