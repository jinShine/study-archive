import { useAuthState } from "../contexts/AuthContext";
import { useTodoState, useTodoDispatch } from "../contexts/TodoContext";
export default function TodoDashboard() {
  const { user } = useAuthState();
  const { todos } = useTodoState();
  const dispatch = useTodoDispatch();
  if (!user) return <div style={{padding: '20px'}}>로그인 후 이용 가능합니다.</div>;
  return (
    <div style={{padding: '20px', background: 'white'}}>
      <h3>{user.name}의 업무</h3>
      {todos.map(t => (
        <div key={t.id}>{t.text} <button onClick={() => dispatch({ type: "TOGGLE_TODO", payload: t.id })}>토글</button></div>
      ))}
      <button onClick={() => dispatch({ type: "ADD_TODO", payload: "신규 할 일" })}>추가</button>
    </div>
  );
}