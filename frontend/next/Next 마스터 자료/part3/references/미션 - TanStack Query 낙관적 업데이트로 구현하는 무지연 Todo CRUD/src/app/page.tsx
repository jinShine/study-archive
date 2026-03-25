import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
export default function Page() {
  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-4xl font-black mb-10 text-center text-gray-900 tracking-tight">
        Todo Master
      </h1>
      <TodoForm />
      <TodoList />
    </main>
  );
}
