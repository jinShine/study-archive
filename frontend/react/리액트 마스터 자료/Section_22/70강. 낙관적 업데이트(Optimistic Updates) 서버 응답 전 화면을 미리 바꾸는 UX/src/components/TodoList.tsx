import { useQuery } from '@tanstack/react-query';
import { todoKeys } from '../api/mockApi';
import type { Todo } from '../api/mockApi';

export default function TodoList() {
  const { data: todos } = useQuery<Todo[]>({
    queryKey: todoKeys.all,
    queryFn: () => [],
    initialData: [],
  });

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map((todo) => (
        <li key={todo.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
          ✅ {todo.text}
        </li>
      ))}
      {todos.length === 0 && <p style={{ color: '#999' }}>추가된 할 일이 없습니다.</p>}
    </ul>
  );
}