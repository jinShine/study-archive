'use client';
import { useTodos } from '../hooks/useTodos';
import { useToggleTodo } from '../hooks/useToggleTodo';
import { useDeleteTodo } from '../hooks/useDeleteTodo';
export default function TodoList() {
  const { data: todos, isPending } = useTodos();
  const { mutate: toggle, isError, error } = useToggleTodo();
  const { mutate: del } = useDeleteTodo();
  if (isPending) return <div className="space-y-3">{[1,2,3].map(n => <div key={n} className="h-16 bg-gray-200 animate-pulse rounded-xl"></div>)}</div>;
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {todos?.map(todo => (
          <li key={todo.id} className="p-4 bg-white border rounded-xl flex justify-between items-center group shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={todo.completed} onChange={() => toggle({...todo, completed: !todo.completed})} className="h-5 w-5 cursor-pointer accent-blue-600" />
              <span className={todo.completed ? 'line-through text-gray-400 font-medium' : 'text-gray-800 font-medium'}>{todo.text}</span>
            </div>
            <button onClick={() => del(todo.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold p-2 hover:bg-red-50 rounded-lg">삭제</button>
          </li>
        ))}
      </ul>
      {isError && <p className="text-red-500 text-sm">🚨 {error.message}: 롤백되었습니다.</p>}
    </div>
  );
}
